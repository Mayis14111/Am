import { json } from "../lib/store.mjs";
import { verifySignature, getPayment } from "../lib/paynet.mjs";
import { orderByPaynetId, updateOrder } from "../lib/orders.mjs";
import { sendAll, money } from "../lib/telegram.mjs";

export default async (req) => {
  const raw = await req.text();
  if (!verifySignature(raw, req)) return json({ error: "bad signature" }, 401);
  let ev;
  try { ev = JSON.parse(raw); } catch { return json({ error: "bad json" }, 400); }
  const pid = ev.transaction?.order_id;
  if (!pid) return json({ ok: true });
  const o = await orderByPaynetId(pid);
  if (!o) return json({ ok: true, note: "unknown order" });

  // Never trust the webhook body alone: read the payment back from Paynet.
  let status = ev.transaction.status, amount = ev.transaction.amount;
  try { const p = await getPayment(pid); status = p.status || status; amount = p.amount ?? amount; } catch {}

  let before;
  // applied to the freshest copy, so a parallel admin edit or status change is kept
  const saved = await updateOrder(o.id, (cur) => {
    before = cur.payment?.status;
    cur.payment = { ...(cur.payment || {}), method: "online", status, uuid: ev.transaction.uuid || cur.payment?.uuid };
    if (status === "completed" && before !== "completed") {
      cur.payment.paidAt = ev.transaction.completed_at || new Date().toISOString();
      cur.payment.paidAmount = amount;
    }
    if (ev.event === "payment.refunded") cur.payment.status = "refunded";
    (cur.paymentLog ||= []).push({ at: new Date().toISOString(), event: ev.event, status: cur.payment.status, delivery: ev.delivery_id });
  });
  if (saved) Object.assign(o, saved);

  if (o.payment.status !== before) {
    const msg = {
      completed: `💳 <b>Վճարված է</b> · ${o.id}\n${money(amount)} · ${o.customer?.name || ""}`,
      failed: `⚠️ Վճարումը չհաջողվեց · ${o.id}`,
      refunded: `↩️ Գումարը վերադարձվեց · ${o.id}`,
    }[o.payment.status];
    if (msg) await sendAll(msg);
  }
  return json({ ok: true });
};

export const config = { path: "/api/paynet/webhook", method: "POST" };
