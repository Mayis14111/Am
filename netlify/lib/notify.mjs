// New-order Telegram notifications, kept apart from the order itself.
//
// Each order made through the website has a record "notify/<orderId>":
//   { state: "pending" | "sending" | "done" | "failed", key, attempts, leaseUntil, nextAt, lastError, sentAt }
// Only the request that wins the "sending" lease (a conditional write) may call Telegram, so
// parallel requests and parallel retry runs never send the same message twice in normal operation.
// Failures are stored and retried by the scheduled function notify-retry (every 5 minutes) and by
// any identical customer retry. Sending never writes the order, so it can't undo status, payment
// or admin changes.
//
// Unavoidable limit: if the process dies after Telegram accepted the message but before "done" is
// written, the lease runs out and the message is sent again (at-least-once, never zero). The order
// itself is never duplicated.
import { store } from "./store.mjs";
import { getOrder } from "./orders.mjs";
import { sendAll, orderText, orderButtons } from "./telegram.mjs";

const S = () => store("orders");
const NK = (id) => "notify/" + id;
export const LEASE_MS = () => globalThis.__ggLeaseMs ?? 20000; // longer than one Telegram attempt (4 s per chat)
export const MAX_ATTEMPTS = 12;
const backoff = (n) => Math.min(60, 2 ** Math.max(0, n - 1)) * 60000; // 1, 2, 4 … 60 minutes

export async function ensureNotify(id, key) {
  await S().setJSON(NK(id), { state: "pending", key, attempts: 0, createdAt: Date.now() }, { onlyIfNew: true });
}
export async function readNotify(id) {
  const r = await S().getWithMetadata(NK(id), { type: "json" });
  return r ? { value: r.data, etag: r.etag } : null;
}

/**
 * Try to send the notification for order `id`. Returns "sent" | "busy" | "done" | "failed" | "skip".
 * opts.due: only when its retry time has come (scheduled runs); opts.minAgeMs: leave fresh records to their creator.
 */
export async function trySend(id, opts = {}) {
  const cur = await readNotify(id);
  if (!cur) return "skip";
  const v = cur.value || {}, now = Date.now();
  if (v.state === "done") return "done";
  if (v.state === "sending" && (v.leaseUntil || 0) > now) return "busy";
  if (opts.due && v.state === "failed" && (v.nextAt || 0) > now) return "skip";
  if (opts.due && (v.attempts || 0) >= MAX_ATTEMPTS) return "skip";
  if (opts.minAgeMs && v.state === "pending" && now - (v.createdAt || 0) < opts.minAgeMs) return "skip";
  const order = await getOrder(id);
  if (!order || order.idemKey !== v.key) return "skip"; // order not saved (yet) or the number belongs to someone else
  // take the lease: only one sender wins this write
  const lease = { ...v, state: "sending", leaseUntil: now + LEASE_MS(), attempts: (v.attempts || 0) + 1 };
  const w = await S().setJSON(NK(id), lease, { onlyIfMatch: cur.etag });
  if (!w.modified) return "busy";

  const fresh = (await getOrder(id)) || order; // text from the latest saved order
  const res = await sendAll(orderText(fresh), { reply_markup: orderButtons(fresh) });
  const ok = res.some((r) => r.ok);
  const next = ok
    ? { ...lease, state: "done", sentAt: Date.now(), leaseUntil: 0, lastError: undefined }
    : { ...lease, state: "failed", leaseUntil: 0, nextAt: Date.now() + backoff(lease.attempts), lastError: (res[0] && res[0].description) || "failed" };
  // write the result only if we still hold the lease (someone may have taken over an expired one)
  await S().setJSON(NK(id), next, { onlyIfMatch: w.etag });
  return ok ? "sent" : "failed";
}

/** every pending / failed / expired notification whose time has come (used by the scheduled function) */
export async function retryDue({ minAgeMs = 60000 } = {}) {
  const { blobs } = await S().list({ prefix: "notify/" });
  const out = {};
  for (const b of blobs) {
    const id = b.key.slice("notify/".length);
    try { out[id] = await trySend(id, { due: true, minAgeMs }); } catch (e) { out[id] = "error: " + String(e.message || e); }
  }
  return out;
}
