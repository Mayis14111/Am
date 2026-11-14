import crypto from "node:crypto";
import { store, env } from "./store.mjs";

const COOKIE = "gg_admin";
const DAYS = 30;

const secret = () => env("SESSION_SECRET") || (env("ADMIN_PASSWORD") + "::garnugata-fallback");
export const hmac = (data, key = secret()) => crypto.createHmac("sha256", key).update(data).digest("hex");
const b64 = (s) => Buffer.from(s).toString("base64url");
const unb64 = (s) => Buffer.from(s, "base64url").toString();

export function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

async function sessionVersion() {
  const v = await store("auth").get("ver", { type: "json" });
  return v?.v || 1;
}
export async function bumpVersion() {
  const v = await sessionVersion();
  await store("auth").setJSON("ver", { v: v + 1 });
}

export async function makeCookie() {
  const payload = b64(JSON.stringify({ v: await sessionVersion(), exp: Date.now() + DAYS * 864e5 }));
  const val = payload + "." + hmac(payload);
  return `${COOKIE}=${val}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${DAYS * 86400}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export async function isAdmin(req) {
  const c = req.headers.get("cookie") || "";
  const m = c.match(new RegExp(COOKIE + "=([^;]+)"));
  if (!m) return false;
  const [payload, sig] = m[1].split(".");
  if (!payload || !sig || !safeEqual(hmac(payload), sig)) return false;
  try {
    const d = JSON.parse(unb64(payload));
    if (d.exp < Date.now()) return false;
    return d.v === (await sessionVersion());
  } catch { return false; }
}

// Signed token so a customer can check the status of their own order.
export const orderToken = (id) => hmac("order:" + id).slice(0, 24);
