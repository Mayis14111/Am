import { getStore } from "@netlify/blobs";
import { DEFAULT_CONTENT, LANGS, CONTENT_VERSION } from "./defaults.mjs";
import { V1_CONTENT } from "./defaults_v1.mjs";
import { V2_CONTENT } from "./defaults_v2.mjs";

export const store = (name) => getStore({ name, consistency: "strong" });

export const env = (k, d = "") => {
  try { return (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? d) || d; } catch { return process.env[k] || d; }
};

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

// Deep merge saved content over defaults (arrays from saved content win as a whole).
export function merge(base, over) {
  if (over === undefined || over === null) return base;
  if (!isObj(base) || !isObj(over)) return over;
  const out = { ...base };
  for (const k of Object.keys(over)) out[k] = merge(base[k], over[k]);
  return out;
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// Content saved before an update keeps every value the owner edited, but values that
// are still the OLD default are dropped, so the NEW default text shows instead.
function dropOldDefaults(saved, old) {
  if (!isObj(saved) || !isObj(old)) return saved;
  const out = {};
  for (const k of Object.keys(saved)) {
    if (k in old && same(saved[k], old[k])) continue;
    out[k] = isObj(saved[k]) && isObj(old[k]) && !LANG_KEYS(saved[k]) ? dropOldDefaults(saved[k], old[k]) : saved[k];
  }
  return out;
}
const LANG_KEYS = (o) => Object.keys(o).every((k) => LANGS.includes(k));
export function migrate(saved) {
  if (!saved || (saved.version || 1) >= CONTENT_VERSION) return saved;
  let m = saved;
  if ((saved.version || 1) < 2) m = dropOldDefaults(m, V1_CONTENT);
  m = dropOldDefaults(m, V2_CONTENT);
  m.version = CONTENT_VERSION;
  return m;
}

let cache = null, cacheAt = 0;
export async function getContent(fresh = false) {
  if (!fresh && cache && Date.now() - cacheAt < 3000) return cache;
  let saved = null;
  try { saved = await store("content").get("site", { type: "json" }); } catch (e) { console.error("content read", e); }
  cache = merge(structuredClone(DEFAULT_CONTENT), migrate(saved) || {});
  cacheAt = Date.now();
  return cache;
}
export async function saveContent(c) {
  c.version = CONTENT_VERSION;
  c.updatedAt = new Date().toISOString();
  await store("content").setJSON("site", c);
  cache = null;
  // keep a few backups so mistakes can be undone
  try {
    const key = "bak/" + c.updatedAt;
    await store("content").setJSON(key, c);
    const { blobs } = await store("content").list({ prefix: "bak/" });
    const old = blobs.map((b) => b.key).sort().slice(0, -15);
    for (const k of old) await store("content").delete(k);
  } catch {}
}

export async function listPages() {
  const s = store("pages");
  const { blobs } = await s.list({ prefix: "p/" });
  const out = [];
  for (const b of blobs) { const p = await s.get(b.key, { type: "json" }); if (p) out.push(p); }
  return out.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.slug.localeCompare(b.slug));
}
export const getPage = (slug) => store("pages").get("p/" + slug, { type: "json" });

// Text helper: pick language with fallback.
export const t = (v, lang) => {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  return v[lang] || v.hy || v.en || v.ru || "";
};

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const siteUrl = (req) => {
  const u = env("SITE_URL") || env("URL");
  if (u) return u.replace(/\/$/, "");
  try { return new URL(req.url).origin; } catch { return "https://garnugata.am"; }
};

export { LANGS };

// Yerevan time helpers (UTC+4, no DST)
export const yerevanNow = () => new Date(Date.now() + 4 * 3600e3);
export const ymd = (d) => d.toISOString().slice(0, 10);

// Price for an order line, computed on the server from the live menu.
export function priceOf(content, fillingId, cm, qty, opts = {}) {
  const m = content.menu;
  const f = m.fillings.find((x) => x.id === fillingId && (opts.allowHidden || x.show !== false));
  const si = m.sizes.findIndex((s) => +s.cm === +cm);
  if (!f || si < 0) return null;
  const unit = +f.prices[si] || 0;
  const q = Number(qty);
  if (!Number.isInteger(q) || q < 1 || q > 9999) return { badQty: true };
  return { unit, qty: q, total: unit * q, filling: f, size: m.sizes[si] };
}

// Packaging options. Old content had only "box: { enabled, price }".
export function packsOf(c) {
  const m = c.menu || {};
  let packs = Array.isArray(m.packs) && m.packs.length ? m.packs : [
    { id: "none", label: { hy: "Առանց տուփի", ru: "Без коробки", en: "No box" }, price: 0, show: true },
    { id: "box", label: { hy: "Տուփով", ru: "В коробке", en: "In a box" }, price: m.box && m.box.price > 0 ? m.box.price : -1, show: true },
  ];
  if (m.box && m.box.enabled === false) packs = packs.filter((p) => p.id === "none");
  return packs.filter((p) => p.show !== false);
}
