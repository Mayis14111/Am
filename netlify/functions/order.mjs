import { getContent, json, priceOf, t, siteUrl, yerevanNow, ymd } from "../lib/store.mjs";
import { newId, saveOrder, linkPayment, getOrder } from "../lib/orders.mjs";
import { sendAll, orderText, orderButtons } from "../lib/telegram.mjs";
import { paynetReady, getPayment } from "../lib/paynet.mjs";
import { startPayment } from "../lib/checkout.mjs";
import { orderToken, safeEqual } from "../lib/auth.mjs";

const clean = (s, n = 300) => String(s ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
export default async (req) => {
  if (req.method === "GET") {
    // order status check for the customer after paying
    const u = new URL(req.url);
    const id = u.searchParams.get("id"), tok = u.searchParams.get("t") || "";
    if (!id || !safeEqual(tok, orderToken(id))) return json({ error: "not found" }, 404);
    const o = await getOrder(id);
    if (!o) return json({ error: "not found" }, 404);
    if (o.payment?.paynetOrderId && ["pending", "processing"].includes(o.payment.status) && paynetReady()) {
      try {
        const p = await getPayment(o.payment.paynetOrderId);
        const st = p.status || p.data?.status;
        if (st && st !== o.payment.status) {
          o.payment.status = st;
          if (st === "completed") { o.payment.paidAt = new Date().toISOString(); await sendAll(`💳 <b>Վճարված է</b> ${o.id} · ${o.total} ֏`); }
          await saveOrder(o);
        }
      } catch {}
    }
    return json({ id: o.id, status: o.status, payment: o.payment?.status || "none", total: o.total, checkoutUrl: o.payment?.status === "pending" ? o.payment.checkoutUrl : undefined });
  }
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let b;
  try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  if (b.website) return json({ ok: true, id: "GG-OK" }); // honeypot

  const c = await getContent();
  const lang = ["hy", "ru", "en"].includes(b.lang) ? b.lang : "hy";
  const err = (hy, ru, en) => json({ error: { hy, ru, en }[lang] }, 400);

  if (!c.order.accept) return err(t(c.order.closedText, "hy"), t(c.order.closedText, "ru"), t(c.order.closedText, "en"));

  const p = priceOf(c, b.filling, b.size, b.qty);
  if (!p) return err("Խնդրում ենք ընտրել գաթայի միջուկը և չափսը։", "Пожалуйста, выберите начинку и размер.", "Please choose the filling and size.");
  if (p.badQty) return err("Խնդրում ենք նշել գաթաների քանակը՝ ամբողջ թվով, առնվազն 1 հատ։", "Пожалуйста, укажите количество целым числом, не меньше 1.", "Please enter the quantity as a whole number, at least 1.");
  const name = clean(b.name, 80), phone = clean(b.phone, 30);
  const REQ = ["Խնդրում ենք լրացնել այս դաշտը։", "Пожалуйста, заполните это поле.", "Please fill in this field."];
  if (!name) return err(...REQ);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return err("Խնդրում ենք ստուգել հեռախոսահամարը և գրել այն ամբողջությամբ։", "Пожалуйста, проверьте номер телефона и напишите его полностью.", "Please check the phone number and write it in full.");
  const date = clean(b.date, 10);
  const dt = new Date(date + "T00:00:00Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(dt) || dt.toISOString().slice(0, 10) !== date || date > ymd(new Date(yerevanNow().getTime() + 366 * 864e5)))
    return err("Խնդրում ենք նշել ճիշտ ամսաթիվ։", "Пожалуйста, укажите правильную дату.", "Please enter a valid date.");
  if (date < ymd(yerevanNow())) return err("Նշված օրն արդեն անցել է։ Ընտրեք մեկ այլ օր։", "Эта дата уже прошла. Выберите другой день.", "That date has already passed. Please choose another day.");
  const d = c.delivery.options.find((x) => x.id === b.delivery && x.show !== false);
  if (!d) return err("Խնդրում ենք ընտրել ստանալու եղանակը։", "Пожалуйста, выберите способ получения.", "Please choose how you'll receive the order.");
  const address = clean(b.address, 200);
  if (d.address && address.replace(/\s/g, "").length < 5) return err("Խնդրում ենք գրել առաքման ամբողջական հասցեն։", "Пожалуйста, напишите полный адрес доставки.", "Please write the full delivery address.");
  const product = clean(b.product, 120);

  const deliveryFee = d.price > 0 ? +d.price : 0;
  const boxFee = b.box && c.menu.box.enabled && c.menu.box.price > 0 ? c.menu.box.price * p.qty : 0;
  const o = {
    id: newId(),
    createdAt: new Date().toISOString(),
    source: b.source === "chat" ? "chat" : "form",
    lang,
    filling: p.filling.id,
    fillingName: t(p.filling.name, "hy"),
    choco: p.filling.id === "choco" ? clean(b.choco, 30) : "",
    size: p.size.cm,
    qty: p.qty,
    unit: p.unit,
    box: !!b.box,
    boxFee,
    deliveryFee,
    total: p.total + boxFee + deliveryFee,
    date,
    delivery: { id: d.id, label: t(d.label, "hy"), address, feeLater: d.price < 0 },
    customer: { name, phone },
    notes: clean(b.notes, 600),
    product,
    estimate: !!(b.box && c.menu.box.enabled && !(c.menu.box.price > 0)) || d.price < 0,
    status: "new",
    statusHistory: [{ status: "new", at: new Date().toISOString(), by: "customer" }],
    payment: { method: "cash", status: "none" },
    adminNote: "",
  };

  let checkoutUrl = null, payError = null;
  const wantOnline = b.pay === "online" && c.payments.enabled && paynetReady();
  if (wantOnline) {
    try { checkoutUrl = await startPayment(o, c, siteUrl(req)); }
    catch (e) { payError = String(e.message || e); o.payment = { method: "cash", status: "none", error: payError }; }
  }
  await saveOrder(o);

  const tgr = await sendAll(orderText(o), { reply_markup: orderButtons(o) });
  const telegramOk = tgr.some((r) => r.ok);
  if (!telegramOk) console.error("telegram failed", JSON.stringify(tgr));

  return json({ ok: true, id: o.id, total: o.total, token: orderToken(o.id), checkoutUrl, payError: payError ? true : undefined, telegramOk });
};

export const config = { path: "/api/order", rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ["ip", "domain"] } };
