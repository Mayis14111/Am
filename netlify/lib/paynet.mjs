import crypto from "node:crypto";
import { env } from "./store.mjs";

const BASE = "https://paynet.am/api/v1";
export const paynetKey = () => env("PAYNET_API_KEY");
export const paynetReady = () => !!paynetKey();

async function call(method, path, body, idem) {
  const headers = { "X-Paynet-Key": paynetKey(), accept: "application/json" };
  if (body) headers["content-type"] = "application/json";
  if (idem) headers["Idempotency-Key"] = idem;
  const r = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let data = null;
  try { data = await r.json(); } catch {}
  if (!r.ok) throw new Error((data && (data.message || data.error)) || `Paynet error ${r.status}`);
  return data;
}

// Creates a payment and returns { uuid, checkout_url, status, ... }
export function createPayment({ amount, orderId, returnUrl, cancelUrl, callbackUrl, domain, processor, name, email, description, attempt = 1 }) {
  const body = {
    amount: Math.round(amount),
    order_id: attempt > 1 ? `${orderId}-${attempt}` : orderId,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    callback_url: callbackUrl,
    currency: "AMD",
    description,
  };
  if (domain) body.domain = domain;
  if (processor) body.processor = processor;
  if (name) body.customer_name = name;
  if (email) body.customer_email = email;
  return call("POST", "/payments", body, `${body.order_id}-${body.amount}`);
}

export const getPayment = (paynetOrderId) => call("GET", `/orders/${encodeURIComponent(paynetOrderId)}/payment`);
export const refundPayment = (uuid, amount, reason) => call("POST", `/payments/${uuid}/refund`, { amount, reason }, `refund-${uuid}-${amount}`);

export function verifySignature(raw, req) {
  const s = env("PAYNET_WEBHOOK_SECRET");
  if (!s) return false;
  const want = crypto.createHmac("sha256", s).update(raw).digest("hex");
  for (const hName of ["x-paynet-signature", "x-paynet-signature-next"]) {
    const got = (req.headers.get(hName) || "").toLowerCase();
    if (got.length === want.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want))) return true;
  }
  return false;
}
