import { createPayment } from "./paynet.mjs";
import { linkPayment } from "./orders.mjs";
import { orderToken } from "./auth.mjs";

const langPrefix = (l) => (l === "hy" ? "" : "/" + l);

export async function startPayment(o, c, base) {
  const attempt = (o.payment?.attempts || 0) + 1;
  const p = await createPayment({
    amount: o.payment?.amount || o.total,
    orderId: o.id,
    attempt,
    returnUrl: `${base}${langPrefix(o.lang)}/?paid=${o.id}&t=${orderToken(o.id)}`,
    cancelUrl: `${base}${langPrefix(o.lang)}/?paid=${o.id}&t=${orderToken(o.id)}&cancel=1`,
    callbackUrl: `${base}/api/paynet/webhook`,
    domain: c.payments.domain || undefined,
    processor: c.payments.processor || undefined,
    name: o.customer?.name,
    description: `Garnu Gata ${o.id}`,
  });
  const pid = attempt > 1 ? `${o.id}-${attempt}` : o.id;
  await linkPayment(pid, o.id);
  o.payment = { ...(o.payment || {}), method: "online", status: "pending", uuid: p.uuid, paynetOrderId: pid, amount: p.amount ?? o.total, checkoutUrl: p.checkout_url, attempts: attempt, livemode: p.livemode };
  return p.checkout_url;
}

