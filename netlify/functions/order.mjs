import { getContent, json, priceOf, t, siteUrl, yerevanNow, ymd, store, packsOf } from "../lib/store.mjs";
import { cardSlug } from "../lib/render.mjs";
import { saveOrder, updateOrder, linkPayment, getOrder } from "../lib/orders.mjs";
import { createOnce } from "../lib/submit.mjs";
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
          const before = o.payment.status;
          const u = await updateOrder(o.id, (cur) => {
            if (!cur.payment || cur.payment.status === st) return false;
            cur.payment.status = st;
            if (st === "completed" && !cur.payment.paidAt) cur.payment.paidAt = new Date().toISOString();
          });
          if (u) Object.assign(o, u);
          if (st === "completed" && before !== "completed") await sendAll(`💳 <b>Վճարված է</b> ${o.id} · ${o.total} ֏`);
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

  // every submission must carry its own key (made in the browser) so a retry can never become a second order
  const key = /^[\w-]{8,64}$/.test(b.key || "") ? b.key : null;
  if (!key) return err("Խնդրում ենք թարմացնել էջը և նորից փորձել։", "Пожалуйста, обновите страницу и попробуйте снова.", "Please reload the page and try again.");

  if (!c.order.accept) return err(t(c.order.closedText, "hy"), t(c.order.closedText, "ru"), t(c.order.closedText, "en"));

  // quantity must be a real whole number: no "", null, true, 1.5 or "2abc" turning into a valid amount
  const qtyIn = typeof b.qty === "number" || (typeof b.qty === "string" && /^\d+$/.test(b.qty.trim())) ? Number(b.qty) : NaN;
  const p = priceOf(c, b.filling, b.size, qtyIn);
  if (!p) return err("Խնդրում ենք ընտրել գաթայի միջուկը և չափսը։", "Пожалуйста, выберите начинку и размер.", "Please choose the filling and size.");
  if (p.badQty) return err("Խնդրում ենք նշել ամբողջ թիվ՝ առնվազն 1 հատ։", "Пожалуйста, укажите целое число — не меньше 1 шт.", "Please enter a whole number, at least 1.");
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

  const packs = packsOf(c);
  const pk = packs.find((x) => x.id === (b.pack || (b.box ? "box" : "none")));
  if (!pk) return err("Խնդրում ենք ընտրել փաթեթավորումը։", "Пожалуйста, выберите упаковку.", "Please choose the packaging.");
  // product: looked up by its stable slug; the name is kept only while the packaging matches the product
  const cards = (c.products && c.products.cards) || [];
  const ci = cards.findIndex((k, i) => cardSlug(k, i) === String(b.productSlug || ""));
  const card = ci >= 0 ? cards[ci] : null;
  const custom = !!card && !!card.packaging && card.packaging !== pk.id;
  const productBase = card ? t(card.title, "hy") : "";
  const product = !card ? "" : custom ? "Ձեր ընտրած տարբերակը" : productBase;
  const persoNeeded = !!card && !custom && (!!card.personalize || cardSlug(card, ci) === "initials-boxes");
  let personalization = null;
  if (persoNeeded) {
    const pz = b.perso || {};
    personalization = { initials: clean(pz.initials, 30), color: clean(pz.color, 40), wishes: clean(pz.wishes, 300), deferred: !!pz.deferred };
    if (!personalization.initials && !personalization.deferred)
      return err("Գրեք սկզբնատառերը կամ նշեք, որ մանրամասները կհամաձայնեցնեք մեզ հետ։", "Напишите инициалы или отметьте, что согласуете детали с нами.", "Write the initials or tick that you'll agree the details with us.");
  }
  const deliveryFee = d.price > 0 ? +d.price : 0;
  const boxFee = pk.price > 0 ? pk.price * p.qty : 0;
  const packLater = pk.price < 0, deliveryLater = d.price < 0;
  const o = {
    id: "",
    createdAt: new Date().toISOString(),
    source: b.source === "chat" ? "chat" : "form",
    lang,
    filling: p.filling.id,
    fillingName: t(p.filling.name, "hy"),
    choco: p.filling.id === "choco" ? clean(b.choco, 30) : "",
    size: p.size.cm,
    qty: p.qty,
    unit: p.unit,
    box: pk.id !== "none",
    pack: pk.id,
    packLabel: t(pk.label, "hy"),
    packLater,
    boxFee,
    deliveryFee,
    total: p.total + boxFee + deliveryFee,
    date,
    delivery: { id: d.id, label: t(d.label, "hy"), address, feeLater: d.price < 0 },
    customer: { name, phone },
    notes: clean(b.notes, 600),
    product,
    productSlug: card ? cardSlug(card, ci) : "",
    productBase: custom ? productBase : "",
    personalization,
    estimate: packLater || deliveryLater,
    status: "new",
    statusHistory: [{ status: "new", at: new Date().toISOString(), by: "customer" }],
    payment: { method: "cash", status: "none" },
    adminNote: "",
  };

  o.payWanted = b.pay === "online" ? "online" : "cash";
  // never charge an estimate as if it were final: online payment only when every charge is known
  const wantOnline = o.payWanted === "online" && c.payments.enabled && paynetReady() && !o.estimate;
  const result = (x) => ({ ok: true, id: x.id, total: x.total, estimate: x.estimate, token: orderToken(x.id), checkoutUrl: x.payment?.status === "pending" ? x.payment.checkoutUrl : undefined, payError: x.payment?.error ? true : undefined });
  let r;
  try {
    r = await createOnce(o, key, {
      result,
      afterCreate: async (x) => {
        if (!wantOnline) return;
        let pay;
        try { await startPayment(x, c, siteUrl(req)); pay = x.payment; }
        catch (e) { pay = { method: "cash", status: "none", error: String(e.message || e) }; }
        // only the payment part is written, on top of whatever is saved now
        const saved = await updateOrder(x.id, (cur) => { cur.payment = pay; });
        if (saved) Object.assign(x, saved);
      },
    });
  } catch (e) {
    console.error("order store failed", String(e));
    // nothing is confirmed to the customer; the browser keeps the same key, so a retry can't double the order
    return json({ error: { hy: "Չհաջողվեց պահպանել պատվերը։ Խնդրում ենք մի փոքր հետո նորից փորձել։", ru: "Не удалось сохранить заказ. Пожалуйста, попробуйте ещё раз чуть позже.", en: "We couldn't save the order. Please try again in a moment." }[lang], retry: true }, 503);
  }
  if (r.kind === "conflict")
    return json({ conflict: true, prevId: r.claimId, error: {
      hy: `Այս փորձով արդեն ստացել ենք պատվեր այլ տվյալներով (համար՝ ${r.claimId})։ Եթե ցանկանում եք փոխել այդ պատվերը, զանգահարեք մեզ։ Եթե սա նոր, առանձին պատվեր է, սեղմեք «Ուղարկել պատվերը» ևս մեկ անգամ։`,
      ru: `С этой попытки мы уже получили заказ с другими данными (номер: ${r.claimId}). Чтобы изменить тот заказ, позвоните нам. Если это новый, отдельный заказ, нажмите «Отправить заказ» ещё раз.`,
      en: `We already received an order from this attempt with different details (number ${r.claimId}). To change that order, please call us. If this is a new, separate order, tap “Send order” again.`,
    }[lang] }, 409);
  if (r.kind === "pending")
    return json({ pending: true, retry: true, error: {
      hy: "Պատվերը դեռ մշակվում է։ Մի քանի վայրկյանից սեղմեք «Ուղարկել պատվերը» կրկին․ նույն պատվերը կրկնակի չի ստեղծվի։",
      ru: "Заказ ещё обрабатывается. Через несколько секунд нажмите «Отправить заказ» ещё раз — повторный заказ не создастся.",
      en: "Your order is still being processed. Tap “Send order” again in a few seconds — it won't be duplicated.",
    }[lang] }, 409);
  const x = r.order;
  const res = x ? result(x) : r.result;
  return json({ ...res, duplicate: r.kind !== "created" || undefined, telegram: r.telegram });
};

export const config = { path: "/api/order", rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ["ip", "domain"] } };
