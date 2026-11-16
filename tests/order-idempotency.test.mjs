// Run: node --test tests/order-idempotency.test.mjs
// In-memory Netlify Blobs stand-in with real create-only / etag semantics and fault injection.
import test from "node:test";
import assert from "node:assert/strict";

const DATA = new Map(); // "store/key" -> { body, etag }
let ETAG = 0;
const FAULTS = []; // { match(op, store, key, value) -> action }  action: "throw" | "hang" | async fn
const tick = () => new Promise((r) => setImmediate(r));
async function fault(op, name, key, value) {
  for (const f of FAULTS) {
    if (f.used && f.once !== false) continue;
    if (!f.match(op, name, key, value)) continue;
    f.used = true;
    if (f.action === "throw") throw new Error(`injected ${op} failure on ${key}`);
    if (f.action === "hang") return new Promise(() => {});
    if (typeof f.action === "function") await f.action(op, name, key, value);
  }
}
function fakeStore(name) {
  const k = (key) => name + "/" + key;
  const get = async (key, o = {}) => { await tick(); await fault("get", name, key); const e = DATA.get(k(key)); if (!e) return null; return o.type === "json" ? JSON.parse(e.body) : e.body; };
  const set = async (key, body, o = {}) => {
    await tick(); await fault("set", name, key, body);
    const e = DATA.get(k(key));
    if (o.onlyIfNew && e) return { modified: false };
    if (o.onlyIfMatch && (!e || e.etag !== o.onlyIfMatch)) return { modified: false };
    const etag = "e" + ++ETAG; DATA.set(k(key), { body: String(body), etag }); return { modified: true, etag };
  };
  return {
    get,
    getWithMetadata: async (key, o = {}) => { await tick(); await fault("get", name, key); const e = DATA.get(k(key)); return e ? { data: o.type === "json" ? JSON.parse(e.body) : e.body, etag: e.etag, metadata: {} } : null; },
    set, setJSON: (key, v, o) => set(key, JSON.stringify(v), o),
    delete: async (key) => { DATA.delete(k(key)); },
    list: async (o = {}) => ({ blobs: [...DATA.keys()].filter((x) => x.startsWith(name + "/" + (o.prefix || ""))).map((x) => ({ key: x.slice(name.length + 1) })) }),
  };
}
globalThis.__ggStore = fakeStore;
process.env.TELEGRAM_BOT_TOKEN = "test-token";
process.env.TELEGRAM_CHAT_IDS = "1";
let TG = { calls: 0, sent: 0, mode: "ok", texts: [] };
globalThis.fetch = (url, init = {}) => {
  if (!String(url).includes("api.telegram.org")) throw new Error("unexpected network call " + url);
  TG.calls++;
  if (TG.mode === "hang") return new Promise((_, rej) => init.signal?.addEventListener("abort", () => rej(new Error("aborted"))));
  const okRes = () => { TG.sent++; TG.texts.push(JSON.parse(init.body).text); return new Response(JSON.stringify({ ok: true, result: {} })); };
  if (TG.mode === "delay") return new Promise((r) => setTimeout(() => r(okRes()), 600));
  return Promise.resolve(okRes());
};
const realNow = Date.now;
const travel = (ms) => { Date.now = () => realNow() + ms; };

const { default: handler } = await import("../netlify/functions/order.mjs");
const { insertOrder, keyOf, updateOrder, getOrder } = await import("../netlify/lib/orders.mjs");
const { retryDue, trySend } = await import("../netlify/lib/notify.mjs");
const { default: retryJob } = await import("../netlify/functions/notify-retry.mjs");

const day = (() => { const d = new Date(Date.now() + 4 * 3600e3 + 20 * 864e5); return d.toISOString().slice(0, 10); })();
const BASE = { lang: "hy", source: "form", filling: "walnut", size: 30, qty: 2, pack: "none", date: day, delivery: "pickup", name: "Թեստ", phone: "099000000", notes: "", productSlug: "", pay: "cash" };
const send = async (body) => { const r = await handler(new Request("http://test/api/order", { method: "POST", body: JSON.stringify(body) })); return { status: r.status, j: await r.json() }; };
const orders = () => [...DATA.entries()].filter(([k]) => k.startsWith("orders/o/")).map(([, v]) => JSON.parse(v.body));
const claim = (key) => { const e = DATA.get("orders/idem/" + key); return e && JSON.parse(e.body); };
const note = (id) => { const e = DATA.get("orders/notify/" + id); return e && JSON.parse(e.body); };
const reset = () => { DATA.clear(); FAULTS.length = 0; TG = { calls: 0, sent: 0, mode: "ok", texts: [] }; delete globalThis.__ggStaleMs; delete globalThis.__ggLeaseMs; Date.now = realNow; };
const withTimeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r("TIMEOUT"), ms))]);

test("1. simultaneous submissions with the same key create exactly one order", async () => {
  reset();
  const body = { ...BASE, key: "k-simultaneous-1" };
  const rs = await Promise.all(Array.from({ length: 12 }, () => send(body)));
  const ok = rs.filter((r) => r.status === 200);
  assert.equal(orders().length, 1, "one order");
  assert.equal(ok.length, 12, "all answered with success: " + JSON.stringify(rs.map((r) => r.status)));
  assert.equal(new Set(ok.map((r) => r.j.id)).size, 1, "same order number for everyone");
  assert.equal(ok.filter((r) => !r.j.duplicate).length, 1, "only one request created it");
  assert.equal(TG.calls, 1, "one Telegram message");
  assert.equal(claim(body.key).state, "done");
});

test("2. a retry with the same key but changed details is refused, not answered with the earlier order", async () => {
  reset();
  const a = await send({ ...BASE, key: "k-changed-1" });
  assert.equal(a.status, 200);
  for (const change of [{ name: "Ուրիշ անուն" }, { qty: 3 }, { date: "2027-01-05" }, { phone: "077111111" }]) {
    const b = await send({ ...BASE, key: "k-changed-1", ...change });
    assert.equal(b.status, 409, JSON.stringify(change));
    assert.equal(b.j.conflict, true);
    assert.equal(b.j.ok, undefined, "no success");
    assert.equal(b.j.prevId, a.j.id);
  }
  assert.equal(orders().length, 1);
  assert.equal(orders()[0].customer.name, "Թեստ", "earlier order untouched");
  // the identical retry still gets the same order
  const same = await send({ ...BASE, key: "k-changed-1" });
  assert.equal(same.status, 200); assert.equal(same.j.id, a.j.id); assert.equal(same.j.duplicate, true);
  // a new key (what the browser does after a conflict) is a new, separate order
  const c = await send({ ...BASE, key: "k-changed-2", name: "Ուրիշ անուն" });
  assert.equal(c.status, 200); assert.notEqual(c.j.id, a.j.id);
  assert.equal(orders().length, 2);
});

test("3. the function dies right after saving the order: the retry returns that order, no second one", async () => {
  reset();
  const key = "k-crash-after-save";
  // the first write after the order is created (taking the notification lease) never returns: simulates a timeout/kill
  FAULTS.push({ match: (op, n, k, v) => op === "set" && n === "orders" && k.startsWith("notify/") && String(v).includes('"sending"'), action: "hang" });
  const first = await withTimeout(send({ ...BASE, key }), 1500);
  assert.equal(first, "TIMEOUT", "customer gets no answer");
  assert.equal(orders().length, 1, "order was saved");
  assert.equal(claim(key).state, "done", "the order part finished before the notification started");
  assert.equal(TG.sent, 0, "the dead request never sent the notification");
  const retry = await send({ ...BASE, key });
  assert.equal(retry.status, 200);
  assert.equal(retry.j.id, orders()[0].id);
  assert.equal(retry.j.duplicate, true);
  assert.equal(orders().length, 1, "still one order");
  assert.equal(claim(key).state, "done");
  assert.equal(TG.sent, 1, "the notification the dead request never sent is sent by the retry, once");
  assert.equal(note(retry.j.id).state, "done");
});

test("3b. the function dies after claiming the key but before saving: a later retry takes over, one order", async () => {
  reset();
  const key = "k-crash-before-save";
  FAULTS.push({ match: (op, n, k) => op === "set" && n === "orders" && k.startsWith("o/"), action: "hang" });
  assert.equal(await withTimeout(send({ ...BASE, key }), 800), "TIMEOUT");
  assert.equal(orders().length, 0);
  const reserved = claim(key).id;
  globalThis.__ggStaleMs = 0; // pretend the claim is old
  const retry = await send({ ...BASE, key });
  assert.equal(retry.status, 200);
  assert.equal(orders().length, 1);
  assert.equal(retry.j.id, reserved, "keeps the reserved order number");
});

test("4. Telegram times out: order confirmed once; the failed notification is retried and succeeds", async () => {
  reset();
  TG.mode = "hang";
  const key = "k-telegram-timeout";
  const t0 = Date.now();
  const r = await send({ ...BASE, key });
  const took = Date.now() - t0;
  assert.equal(r.status, 200);
  assert.equal(r.j.telegram, "failed");
  assert.ok(took < 8000, "answered within the time limit: " + took + "ms");
  assert.equal(orders().length, 1);
  assert.equal(claim(key).state, "done", "the order is finished even though Telegram failed");
  assert.equal(note(r.j.id).state, "failed");
  assert.equal(note(r.j.id).lastError, "timeout");
  assert.equal(TG.sent, 0);
  // Telegram recovers; an identical customer retry re-sends the notification (not the order)
  TG.mode = "ok";
  const again = await send({ ...BASE, key });
  assert.equal(again.status, 200); assert.equal(again.j.id, r.j.id); assert.equal(again.j.telegram, "sent");
  assert.equal(TG.sent, 1, "notification delivered exactly once after recovery");
  assert.equal(note(r.j.id).state, "done");
  assert.ok(TG.texts[0].includes(r.j.id));
  assert.equal(orders().length, 1);
  const third = await send({ ...BASE, key });
  assert.equal(third.j.telegram, "done"); assert.equal(TG.sent, 1, "no repeat once delivered");
});

test("5a. the final retry-record write fails: the customer still gets success, and a retry returns the same order", async () => {
  reset();
  const key = "k-record-fails";
  FAULTS.push({ match: (op, n, k, v) => op === "set" && k === "idem/" + key && String(v).includes('"done"'), action: "throw" });
  const a = await send({ ...BASE, key });
  assert.equal(a.status, 200);
  assert.equal(claim(key).state, "pending", "record not finished");
  const b = await send({ ...BASE, key });
  assert.equal(b.status, 200); assert.equal(b.j.id, a.j.id); assert.equal(b.j.duplicate, true);
  assert.equal(orders().length, 1);
  assert.equal(TG.calls, 1, "Telegram not repeated because it already succeeded");
});

test("5b. the first retry-record write (the claim) fails: nothing is saved, the error says so, a retry creates one order", async () => {
  reset();
  const key = "k-claim-fails";
  FAULTS.push({ match: (op, n, k) => op === "set" && k === "idem/" + key, action: "throw" });
  const a = await send({ ...BASE, key });
  assert.equal(a.status, 503); assert.equal(a.j.ok, undefined); assert.equal(a.j.retry, true);
  assert.equal(orders().length, 0);
  const b = await send({ ...BASE, key });
  assert.equal(b.status, 200); assert.equal(orders().length, 1);
});

test("6. order-number collision: an existing order is never overwritten", async () => {
  reset();
  // another order grabs the same number between our free-number check and our write
  let injected = null;
  FAULTS.push({
    match: (op, n, k) => op === "set" && n === "orders" && k.startsWith("o/") && !injected,
    action: async (op, n, k) => { injected = k; DATA.set("orders/" + k, { body: JSON.stringify({ id: k.split("/").pop(), customer: { name: "Ուրիշ հաճախորդ" } }), etag: "x" }); },
  });
  const key = "k-collision";
  const r = await send({ ...BASE, key });
  assert.equal(r.status, 200);
  const other = JSON.parse(DATA.get("orders/" + injected).body);
  assert.equal(other.customer.name, "Ուրիշ հաճախորդ", "the other order is untouched");
  assert.notEqual("o/" + r.j.id, injected.replace(/^o\/\d{4}-\d\d\//, "o/"), "ours got a different number");
  assert.equal(orders().filter((o) => o.idemKey === key).length, 1);
  assert.equal(claim(key).id, r.j.id, "the retry record points at the real number");
  // and the admin "new order" path
  const fixed = { id: r.j.id, customer: { name: "Admin" } };
  const saved = await insertOrder({ ...fixed });
  assert.notEqual(saved.id, r.j.id);
  assert.equal(JSON.parse(DATA.get("orders/" + keyOf(r.j.id)).body).idemKey, key, "existing order kept");
});

test("7. a submission without a key is refused (so it can never be duplicated)", async () => {
  reset();
  const r = await send({ ...BASE });
  assert.equal(r.status, 400); assert.equal(orders().length, 0);
});

test("N1. 12 concurrent same-key requests with a 600 ms Telegram delay: one order, one notification", async () => {
  reset();
  TG.mode = "delay";
  const body = { ...BASE, key: "k-notify-1" };
  const rs = await Promise.all(Array.from({ length: 12 }, () => send(body)));
  assert.deepEqual(rs.map((r) => r.status), Array(12).fill(200), JSON.stringify(rs[0].j));
  assert.equal(new Set(rs.map((r) => r.j.id)).size, 1);
  assert.equal(orders().length, 1);
  assert.equal(TG.calls, 1, "Telegram called once, not " + TG.calls);
  assert.equal(TG.sent, 1);
  assert.equal(note(rs[0].j.id).state, "done");
  assert.equal(rs.filter((r) => r.j.telegram === "sent").length, 1, "one request owned the notification");
});

test("N2. a failed notification is retried by the scheduled job without any customer action", async () => {
  reset();
  TG.mode = "hang";
  const r = await send({ ...BASE, key: "k-notify-2" });
  assert.equal(note(r.j.id).state, "failed");
  TG.mode = "ok";
  let out = await retryDue();
  assert.equal(out[r.j.id], "skip", "not before its retry time");
  assert.equal(TG.sent, 0);
  travel(2 * 3600e3);
  const res = await retryJob(new Request("http://test/.netlify/functions/notify-retry"));
  assert.equal((await res.json()).sent, 1);
  assert.equal(TG.sent, 1); assert.equal(note(r.j.id).state, "done");
  out = await retryDue();
  assert.equal(out[r.j.id], "done"); assert.equal(TG.sent, 1);
});

test("N3. notification retries never create another order", async () => {
  reset();
  TG.mode = "hang";
  const key = "k-notify-3";
  const r = await send({ ...BASE, key });
  travel(2 * 3600e3);
  await retryDue(); // still failing
  TG.mode = "ok";
  travel(6 * 3600e3);
  await Promise.all([retryDue(), retryDue(), send({ ...BASE, key }), send({ ...BASE, key }), retryDue()]);
  assert.equal(orders().length, 1);
  assert.equal(orders()[0].id, r.j.id);
  assert.equal(TG.sent, 1, "one successful notification");
  assert.equal(note(r.j.id).state, "done");
  assert.equal(note(r.j.id).attempts, 3, "first try + one failed retry + one successful retry");
});

test("N4. notification work never overwrites status, payment or admin changes made meanwhile", async () => {
  reset();
  TG.mode = "delay";
  const p = send({ ...BASE, key: "k-notify-4" });
  // while Telegram is slow, the admin confirms the order and a payment arrives
  let id;
  for (let i = 0; i < 100 && !(id = orders()[0]?.id); i++) await new Promise((r) => setTimeout(r, 10));
  await new Promise((r) => setTimeout(r, 100));
  await Promise.all([
    updateOrder(id, (o) => { o.status = "confirmed"; o.adminNote = "admin edit"; }),
    updateOrder(id, (o) => { o.payment = { ...o.payment, status: "completed", paidAt: "2026-11-16T10:00:00Z" }; }),
  ]);
  const r = await p;
  assert.equal(r.j.telegram, "sent");
  const o = await getOrder(id);
  assert.equal(o.status, "confirmed"); assert.equal(o.adminNote, "admin edit"); assert.equal(o.payment.status, "completed");
  // the same with a scheduled retry running while the admin edits
  TG.mode = "hang";
  const r2 = await send({ ...BASE, key: "k-notify-4b" });
  TG.mode = "delay"; travel(2 * 3600e3);
  const job = retryDue();
  await new Promise((r) => setTimeout(r, 200));
  await updateOrder(r2.j.id, (o) => { o.status = "baking"; });
  await job;
  const o2 = await getOrder(r2.j.id);
  assert.equal(o2.status, "baking"); assert.equal(note(r2.j.id).state, "done");
  // and two plain overwrites racing are merged, not lost
  await Promise.all([updateOrder(id, (o) => { o.notes = "a"; }), updateOrder(id, (o) => { o.qty = 9; })]);
  const o3 = await getOrder(id);
  assert.equal(o3.notes, "a"); assert.equal(o3.qty, 9); assert.equal(o3.status, "confirmed");
});

test("N5. documented limit: crash after Telegram accepted but before 'done' was saved → the message is sent again (order still single)", async () => {
  reset();
  // the write that records "done" never returns (process killed right after sending)
  FAULTS.push({ match: (op, n, k, v) => op === "set" && k.startsWith("notify/") && String(v).includes('"done"'), action: "hang" });
  const first = await withTimeout(send({ ...BASE, key: "k-notify-5" }), 1000);
  assert.equal(first, "TIMEOUT");
  assert.equal(TG.sent, 1);
  const id = orders()[0].id;
  assert.equal(note(id).state, "sending", "the record still shows an unfinished send");
  // before the lease runs out nobody sends again
  assert.equal(await trySend(id), "busy");
  // after the lease expires the retry job cannot know the first send worked, so it sends again
  travel(3600e3);
  await retryDue();
  assert.equal(TG.sent, 2, "at-least-once: a second, identical message");
  assert.equal(TG.texts[0], TG.texts[1]);
  assert.equal(orders().length, 1, "never a second order");
  assert.equal(note(id).state, "done");
});

test("N6. two retry jobs at the same time send the notification once", async () => {
  reset();
  TG.mode = "hang";
  const r = await send({ ...BASE, key: "k-notify-6" });
  TG.mode = "delay"; travel(2 * 3600e3);
  await Promise.all([retryDue(), retryDue(), retryDue()]);
  assert.equal(TG.sent, 1); assert.equal(note(r.j.id).state, "done");
});

test("N7. the orphan notification left by an order-number clash never notifies about someone else's order", async () => {
  reset();
  let injected = null;
  FAULTS.push({
    match: (op, n, k) => op === "set" && n === "orders" && k.startsWith("o/") && !injected,
    action: async (op, n, k) => { injected = k; DATA.set("orders/" + k, { body: JSON.stringify({ id: k.split("/").pop(), customer: { name: "Ուրիշ" } }), etag: "x" }); },
  });
  const r = await send({ ...BASE, key: "k-notify-7" });
  travel(2 * 3600e3);
  const out = await retryDue();
  assert.equal(out[injected.split("/").pop()], "skip");
  assert.equal(TG.sent, 1); assert.ok(TG.texts[0].includes(r.j.id));
});
