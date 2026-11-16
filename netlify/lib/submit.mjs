// Exactly-once order creation.
//
// Every submission carries a key made in the browser. The key is "claimed" with a
// create-only write before anything else happens, and the claim stores a fingerprint of
// the order details and the order number reserved for it. So:
//  - two requests with the same key at the same moment: only one can claim it; the other
//    waits for the first one's result (or is told to retry) — one order;
//  - the same key with different details: refused (409), never answered with the earlier order;
//  - a crash or error after the order was saved (Telegram, the final write, a timeout): a retry
//    finds the reserved number, sees the order exists and answers with it — no second order;
//  - order numbers are written create-only, so a number that already exists is never overwritten;
//  - the Telegram notification is separate work (lib/notify.mjs): created before the order is written,
//    sent by whoever holds its lease, retried later if it fails — finishing the order never waits on it.
import crypto from "node:crypto";
import { store } from "./store.mjs";
import { newId, keyOf, getOrder } from "./orders.mjs";
import { ensureNotify, trySend } from "./notify.mjs";

export const STALE_MS = () => globalThis.__ggStaleMs ?? 30000; // a claim older than this with no order behind it may be taken over
const WAIT_MS = 5000; // how long a parallel request waits for the first one to finish

const idem = () => store("orders");
const IK = (key) => "idem/" + key;

// fingerprint of everything that defines the order (not the language or the key)
export function fingerprint(o) {
  const pick = {
    filling: o.filling, choco: o.choco || "", size: o.size, qty: o.qty, pack: o.pack, date: o.date,
    delivery: o.delivery && o.delivery.id, address: (o.delivery && o.delivery.address) || "",
    name: o.customer && o.customer.name, phone: o.customer && o.customer.phone, notes: o.notes || "",
    productSlug: o.productSlug || "", personalization: o.personalization || null, payWanted: o.payWanted || "cash",
  };
  return crypto.createHash("sha256").update(JSON.stringify(pick)).digest("hex").slice(0, 32);
}

async function readClaim(key) {
  const r = await idem().getWithMetadata(IK(key), { type: "json" });
  return r ? { value: r.data, etag: r.etag } : null;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ours = (order, key) => !!order && order.idemKey === key;

/**
 * create(o, key, hooks) → { kind: "created" | "existing" | "conflict" | "pending", order?, claimId? }
 * hooks.afterCreate(order) runs once for a newly created order (e.g. payment link).
 * The notification is attempted at the end of every path; result.telegram tells what happened.
 */
export async function createOnce(o, key, hooks = {}) {
  const fp = fingerprint(o);
  o.fingerprint = fp;
  o.idemKey = key;
  const deadline = Date.now() + WAIT_MS;
  let claim = null; // { value, etag } that we own

  for (let round = 0; round < 50 && !claim; round++) {
    const cur = await readClaim(key);
    if (!cur) {
      const value = { state: "pending", id: await freeId(), fp, at: Date.now() };
      const w = await idem().setJSON(IK(key), value, { onlyIfNew: true });
      if (w.modified) claim = { value, etag: w.etag };
      continue; // someone else claimed it first: read their claim
    }
    const v = cur.value || {};
    if (v.fp !== fp) return { kind: "conflict", claimId: v.id };
    if (v.state === "done") {
      const order = await getOrder(v.id);
      // the order is finished; a notification that failed earlier gets another go (never a new order)
      const telegram = ours(order, key) ? await trySend(order.id).catch(() => "error") : "skip";
      return { kind: "existing", order: ours(order, key) ? order : null, result: v.result, telegram };
    }
    // pending: has the other request already saved the order?
    const order = await getOrder(v.id);
    if (ours(order, key)) {
      await ensureNotify(order.id, key).catch(() => {});
      await finish(key, cur, order, hooks).catch(() => {});
      // normally the first request holds the lease and this returns "busy": no second message
      const telegram = await trySend(order.id).catch(() => "error");
      return { kind: "existing", order, telegram };
    }
    if (Date.now() - (v.at || 0) > STALE_MS()) {
      // the first attempt died before saving the order: take the claim over, keep the reserved number
      const value = { ...v, at: Date.now(), takeover: (v.takeover || 0) + 1 };
      const w = await idem().setJSON(IK(key), value, { onlyIfMatch: cur.etag });
      if (w.modified) claim = { value, etag: w.etag };
      continue;
    }
    if (Date.now() > deadline) return { kind: "pending" };
    await sleep(250);
  }
  if (!claim) return { kind: "pending" };

  // write the order create-only under the reserved number; on a number clash, reserve another first
  for (let i = 0; i < 8; i++) {
    o.id = claim.value.id;
    await ensureNotify(o.id, key); // the notification work exists before the order does, so it can't be lost
    const w = await store("orders").setJSON(keyOf(o.id), o, { onlyIfNew: true });
    if (w.modified) break;
    const existing = await getOrder(o.id);
    if (ours(existing, key)) { Object.assign(o, existing); break; }
    const value = { ...claim.value, id: await freeId(), at: Date.now() };
    const u = await idem().setJSON(IK(key), value, { onlyIfMatch: claim.etag });
    if (!u.modified) return { kind: "pending" }; // claim changed under us; the retry will sort it out
    claim = { value, etag: u.etag };
    if (i === 7) throw new Error("could not reserve an order number");
  }

  if (hooks.afterCreate) await hooks.afterCreate(o);
  await finish(key, claim, o, hooks).catch((e) => console.error("idem finish failed", String(e)));
  const telegram = await trySend(o.id).catch((e) => (console.error("notify failed", String(e)), "error"));
  return { kind: "created", order: o, telegram };
}

async function freeId() {
  for (let i = 0; i < 10; i++) {
    const id = newId();
    if (!(await getOrder(id))) return id;
  }
  return newId();
}

async function finish(key, cur, order, hooks) {
  const result = hooks.result ? hooks.result(order) : { id: order.id };
  await idem().setJSON(IK(key), { ...cur.value, state: "done", id: order.id, result, doneAt: Date.now() });
}
