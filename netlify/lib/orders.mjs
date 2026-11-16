import crypto from "node:crypto";
import { store, yerevanNow } from "./store.mjs";

export const STATUSES = ["new", "confirmed", "baking", "ready", "delivered", "cancelled"];

export function newId() {
  const d = yerevanNow().toISOString();
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = Array.from(crypto.randomBytes(5), (b) => abc[b % abc.length]).join(""); // 32^5 ≈ 33 million per day
  return `GG-${d.slice(2, 4)}${d.slice(5, 7)}${d.slice(8, 10)}-${r}`;
}
export const keyOf = (id) => {
  const m = /^GG-(\d\d)(\d\d)\d\d-/.exec(id || "");
  return m ? `o/20${m[1]}-${m[2]}/${id}` : null;
};
export async function getOrder(id) {
  const k = keyOf(id);
  return k ? store("orders").get(k, { type: "json" }) : null;
}
export async function saveOrder(o) {
  o.updatedAt = new Date().toISOString();
  await store("orders").setJSON(keyOf(o.id), o);
  return o;
}
// change an order without losing a change someone else saved meanwhile:
// read with its etag, apply fn to the fresh copy, write only if nobody wrote in between, else repeat
export async function updateOrder(id, fn, tries = 8) {
  const k = keyOf(id); if (!k) return null;
  for (let i = 0; i < tries; i++) {
    const cur = await store("orders").getWithMetadata(k, { type: "json" });
    if (!cur) return null;
    const o = cur.data;
    if ((await fn(o)) === false) return o;
    o.updatedAt = new Date().toISOString();
    const w = await store("orders").setJSON(k, o, { onlyIfMatch: cur.etag });
    if (w.modified) return o;
  }
  throw new Error("order changed too often, try again");
}
// a brand-new order (admin "new order"): never overwrites an existing number
export async function insertOrder(o) {
  for (let i = 0; i < 10; i++) {
    const w = await store("orders").setJSON(keyOf(o.id), o, { onlyIfNew: true });
    if (w.modified) return o;
    o.id = newId();
  }
  throw new Error("could not reserve an order number");
}
export async function deleteOrder(id) {
  const k = keyOf(id);
  if (k) await store("orders").delete(k);
}
export async function listOrders({ months = 3 } = {}) {
  const s = store("orders");
  const out = [];
  const now = yerevanNow();
  const prefixes = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    prefixes.push(`o/${d.toISOString().slice(0, 7)}/`);
  }
  for (const prefix of prefixes) {
    const { blobs } = await s.list({ prefix });
    const got = await Promise.all(blobs.map((b) => s.get(b.key, { type: "json" }).catch(() => null)));
    out.push(...got.filter(Boolean));
  }
  return out.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}
export async function listAllOrders() {
  const s = store("orders");
  const { blobs } = await s.list({ prefix: "o/" });
  const got = await Promise.all(blobs.map((b) => s.get(b.key, { type: "json" }).catch(() => null)));
  return got.filter(Boolean).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

// Map Paynet order ids back to our orders
export const linkPayment = (paynetOrderId, id) => store("orders").setJSON("pay/" + paynetOrderId, { id });
export async function orderByPaynetId(pid) {
  const m = await store("orders").get("pay/" + pid, { type: "json" });
  return m ? getOrder(m.id) : null;
}

export function setStatus(o, status, by = "admin") {
  if (!STATUSES.includes(status) || o.status === status) return false;
  o.status = status;
  (o.statusHistory ||= []).push({ status, at: new Date().toISOString(), by });
  return true;
}
