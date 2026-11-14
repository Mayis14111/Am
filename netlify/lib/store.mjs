import { getStore } from "@netlify/blobs";
import { DEFAULT_CONTENT, LANGS } from "./defaults.mjs";

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

let cache = null, cacheAt = 0;
export async function getContent(fresh = false) {
  if (!fresh && cache && Date.now() - cacheAt < 3000) return cache;
  let saved = null;
  try { saved = await store("content").get("site", { type: "json" }); } catch (e) { console.error("content read", e); }
  cache = merge(structuredClone(DEFAULT_CONTENT), saved || {});
  cacheAt = Date.now();
  return cache;
}
export async function saveContent(c) {
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
export function priceOf(content, fillingId, cm, qty) {
  const m = content.menu;
  const f = m.fillings.find((x) => x.id === fillingId);
  const si = m.sizes.findIndex((s) => +s.cm === +cm);
  if (!f || si < 0) return null;
  const unit = +f.prices[si] || 0;
  const q = Math.max(1, Math.min(9999, parseInt(qty) || 1));
  return { unit, qty: q, total: unit * q, filling: f, size: m.sizes[si] };
}
