import crypto from "node:crypto";
import { store, env, json, getContent, saveContent, listPages, getPage, siteUrl, priceOf, t, packsOf } from "../lib/store.mjs";
import { DEFAULT_CONTENT } from "../lib/defaults.mjs";
import { isAdmin, makeCookie, clearCookie, bumpVersion, safeEqual, hmac } from "../lib/auth.mjs";
import { tg, sendAll, tgToken, tgSecret, orderText, orderButtons, STATUS } from "../lib/telegram.mjs";
import { listOrders, listAllOrders, getOrder, saveOrder, deleteOrder, setStatus, newId, STATUSES } from "../lib/orders.mjs";
import { paynetReady, refundPayment, getPayment } from "../lib/paynet.mjs";
import { startPayment } from "../lib/checkout.mjs";
import { ask } from "../lib/ai.mjs";
import { purgeCache } from "@netlify/functions";

const purge = async () => { try { await purgeCache({ tags: ["site"] }); } catch (e) { console.error("purge", e.message); } };

const auth = () => store("auth");
const slugOk = (s) => /^[a-z0-9][a-z0-9-]{0,60}$/.test(s || "");

async function login(req) {
  const { password } = await req.json().catch(() => ({}));
  const real = env("ADMIN_PASSWORD");
  if (!real) return json({ error: "ADMIN_PASSWORD is not set in Netlify yet." }, 500);
  // slow down guessing
  await new Promise((r) => setTimeout(r, 400));
  if (!password || !safeEqual(hmac(password), hmac(real))) return json({ error: "Wrong password" }, 401);
  if (!tgToken()) return json({ error: "Telegram bot is not set up (TELEGRAM_BOT_TOKEN)." }, 500);
  const code = String(crypto.randomInt(100000, 1000000));
  const nonce = crypto.randomBytes(16).toString("hex");
  await auth().setJSON("code/" + nonce, { h: hmac(code), exp: Date.now() + 5 * 60e3, tries: 0 });
  const ip = req.headers.get("x-nf-client-connection-ip") || "";
  const r = await sendAll(`🔐 Admin login code: <b>${code}</b>\nValid for 5 minutes.${ip ? "\nIP: " + ip : ""}\nIf this was not you, ignore it and change the password.`);
  if (!r.some((x) => x.ok)) return json({ error: "Could not send the Telegram code. Open @GarnuGataBot and press Start." }, 500);
  return json({ nonce });
}

async function verify(req) {
  const { nonce, code } = await req.json().catch(() => ({}));
  if (!/^[a-f0-9]{32}$/.test(nonce || "")) return json({ error: "Start again" }, 400);
  const rec = await auth().get("code/" + nonce, { type: "json" });
  if (!rec || rec.exp < Date.now() || rec.tries >= 5) { await auth().delete("code/" + nonce); return json({ error: "Code expired. Start again." }, 401); }
  if (!safeEqual(hmac(String(code || "").trim()), rec.h)) {
    rec.tries++; await auth().setJSON("code/" + nonce, rec);
    return json({ error: "Wrong code" }, 401);
  }
  await auth().delete("code/" + nonce);
  return json({ ok: true }, 200, { "set-cookie": await makeCookie() });
}

function csv(orders) {
  const cols = ["id", "createdAt", "status", "date", "fillingName", "choco", "size", "qty", "unit", "total", "box", "delivery", "address", "name", "phone", "notes", "payment", "paid", "source", "lang", "adminNote"];
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = orders.map((o) => [o.id, o.createdAt, o.status, o.date, o.fillingName, o.choco, o.size, o.qty, o.unit, o.total, o.box ? "yes" : "no", o.delivery?.label, o.delivery?.address, o.customer?.name, o.customer?.phone, o.notes, o.payment?.method, o.payment?.status, o.source, o.lang, o.adminNote].map(q).join(","));
  return "﻿" + cols.join(",") + "\n" + rows.join("\n");
}

function stats(orders) {
  const live = orders.filter((o) => o.status !== "cancelled");
  const today = new Date(Date.now() + 4 * 3600e3).toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const byDay = {};
  for (let i = 29; i >= 0; i--) byDay[new Date(Date.now() + 4 * 3600e3 - i * 864e5).toISOString().slice(0, 10)] = { n: 0, sum: 0 };
  const byFilling = {};
  for (const o of live) {
    const d = (o.createdAt ? new Date(new Date(o.createdAt).getTime() + 4 * 3600e3) : new Date()).toISOString().slice(0, 10);
    if (byDay[d]) { byDay[d].n++; byDay[d].sum += o.total; }
    byFilling[o.fillingName] = (byFilling[o.fillingName] || 0) + o.qty;
  }
  return {
    newCount: orders.filter((o) => o.status === "new").length,
    todayDue: live.filter((o) => o.date === today && o.status !== "delivered").length,
    upcoming: live.filter((o) => o.date >= today && o.status !== "delivered").length,
    monthOrders: live.filter((o) => (o.createdAt || "").slice(0, 7) === month).length,
    monthSum: live.filter((o) => (o.createdAt || "").slice(0, 7) === month).reduce((a, o) => a + o.total, 0),
    paidOnline: live.filter((o) => o.payment?.status === "completed").reduce((a, o) => a + (o.payment.paidAmount || o.payment.amount || o.total || 0), 0),
    monthPaid: live.filter((o) => o.payment?.status === "completed" && (o.payment.paidAt || o.createdAt || "").slice(0, 7) === month).reduce((a, o) => a + (o.payment.paidAmount || o.payment.amount || o.total || 0), 0),
    estimates: live.filter((o) => o.estimate && !["delivered"].includes(o.status)).length,
    byDay, byFilling,
  };
}

export default async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/admin\/?/, "");
  const M = req.method;

  if (path === "login" && M === "POST") return login(req);
  if (path === "verify" && M === "POST") return verify(req);
  if (path === "logout") return json({ ok: true }, 200, { "set-cookie": clearCookie() });

  if (!(await isAdmin(req))) return json({ error: "login" }, 401);
  // basic CSRF protection: writes must come from our own pages
  if (M !== "GET") {
    const o = req.headers.get("origin");
    if (o && o !== url.origin) return json({ error: "bad origin" }, 403);
  }

  const seg = path.split("/");
  try {
    // ---- session
    if (path === "me") return json({ ok: true });
    if (path === "logout-all" && M === "POST") { await bumpVersion(); return json({ ok: true }, 200, { "set-cookie": clearCookie() }); }

    // ---- setup status
    if (path === "status") {
      return json({
        password: !!env("ADMIN_PASSWORD"), sessionSecret: !!env("SESSION_SECRET"),
        telegram: !!tgToken(), chats: env("TELEGRAM_CHAT_IDS", "713576021"),
        paynet: paynetReady(), paynetWebhook: !!env("PAYNET_WEBHOOK_SECRET"),
        paynetWebhookUrl: siteUrl(req) + "/api/paynet/webhook",
        site: siteUrl(req),
      });
    }

    // ---- content
    if (path === "content" && M === "GET") return json({ content: await getContent(true), defaults: DEFAULT_CONTENT });
    if (path === "content" && M === "PUT") {
      const { content } = await req.json();
      if (!content || typeof content !== "object") return json({ error: "bad content" }, 400);
      await saveContent(content);
      await purge();
      return json({ ok: true, content: await getContent(true) });
    }
    if (path === "backups" && M === "GET") {
      const { blobs } = await store("content").list({ prefix: "bak/" });
      return json({ backups: blobs.map((b) => b.key).sort().reverse() });
    }
    if (path === "restore" && M === "POST") {
      const { key } = await req.json();
      if (!/^bak\//.test(key || "")) return json({ error: "bad" }, 400);
      const c = await store("content").get(key, { type: "json" });
      if (!c) return json({ error: "not found" }, 404);
      await saveContent(c);
      await purge();
      return json({ ok: true });
    }
    if (path === "reset" && M === "POST") { await store("content").delete("site"); await purge(); return json({ ok: true }); }

    // ---- orders
    if (path === "orders" && M === "GET") {
      const m = url.searchParams.get("all") ? null : +(url.searchParams.get("months") || 3);
      return json({ orders: m ? await listOrders({ months: m }) : await listAllOrders() });
    }
    if (path === "orders.csv") {
      return new Response(csv(await listAllOrders()), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="garnugata-orders.csv"` } });
    }
    if (path === "orders" && M === "POST") {
      // order taken by phone / Instagram, entered by admin
      const b = await req.json();
      const c = await getContent();
      const p = priceOf(c, b.filling, b.size, b.qty, { allowHidden: true });
      if (!p || p.badQty) return json({ error: "Choose filling, size and a whole-number quantity" }, 400);
      const d = c.delivery.options.find((x) => x.id === b.delivery) || c.delivery.options[0];
      const pk = packsOf(c).find((x) => x.id === b.pack) || packsOf(c)[0];
      const total = b.total ? +b.total : p.total;
      const o = {
        id: newId(), createdAt: new Date().toISOString(), source: b.source || "phone", lang: "hy",
        filling: p.filling.id, fillingName: t(p.filling.name, "hy"), choco: b.choco || "", size: p.size.cm, qty: p.qty, unit: p.unit,
        box: pk.id !== "none", pack: pk.id, packLabel: t(pk.label, "hy"), estimate: !b.total && (pk.price < 0 || d.price < 0), total, date: b.date || "", delivery: { id: d.id, label: t(d.label, "hy"), address: b.address || "" },
        customer: { name: b.name || "", phone: b.phone || "" }, notes: b.notes || "", status: "confirmed",
        statusHistory: [{ status: "confirmed", at: new Date().toISOString(), by: "admin" }], payment: { method: "cash", status: "none" }, adminNote: b.adminNote || "",
      };
      await saveOrder(o);
      return json({ ok: true, order: o });
    }
    if (seg[0] === "orders" && seg[1]) {
      const o = await getOrder(seg[1]);
      if (!o) return json({ error: "Order not found" }, 404);
      if (M === "DELETE") { await deleteOrder(o.id); return json({ ok: true }); }
      if (M === "PATCH") {
        const b = await req.json();
        if (b.status) setStatus(o, b.status, "admin");
        if (b.final === true) { o.estimate = false; o.finalAt = new Date().toISOString(); }
        if (b.final === false) o.estimate = true;
        for (const k of ["adminNote", "date", "notes", "total", "qty", "size", "box"]) if (k in b) o[k] = k === "total" || k === "qty" ? +b[k] : b[k];
        if (b.customer) o.customer = { ...o.customer, ...b.customer };
        if (b.address !== undefined) o.delivery = { ...o.delivery, address: b.address };
        if (b.paymentStatus) o.payment = { ...(o.payment || {}), status: b.paymentStatus, method: b.paymentStatus === "completed" && o.payment?.method !== "online" ? "cash" : o.payment?.method, paidAt: b.paymentStatus === "completed" ? new Date().toISOString() : o.payment?.paidAt };
        await saveOrder(o);
        return json({ ok: true, order: o });
      }
      if (seg[2] === "paylink" && M === "POST") {
        if (!paynetReady()) return json({ error: "Paynet is not connected yet (PAYNET_API_KEY)." }, 400);
        if (o.estimate) return json({ error: "Confirm the final amount first (Վերջնական գումար), then create the payment link." }, 400);
        const b = await req.json().catch(() => ({}));
        if (b.amount) o.payment = { ...(o.payment || {}), amount: Math.round(+b.amount) };
        else if (o.payment) o.payment.amount = o.total;
        const link = await startPayment(o, await getContent(), siteUrl(req));
        await saveOrder(o);
        return json({ ok: true, url: link, order: o });
      }
      if (seg[2] === "check" && M === "POST") {
        if (!o.payment?.paynetOrderId) return json({ error: "No online payment for this order" }, 400);
        const p = await getPayment(o.payment.paynetOrderId);
        o.payment.status = p.status || o.payment.status;
        if (o.payment.status === "completed" && !o.payment.paidAt) o.payment.paidAt = new Date().toISOString();
        await saveOrder(o);
        return json({ ok: true, order: o });
      }
      if (seg[2] === "refund" && M === "POST") {
        const b = await req.json().catch(() => ({}));
        if (!o.payment?.uuid) return json({ error: "No online payment" }, 400);
        await refundPayment(o.payment.uuid, Math.round(+b.amount || o.payment.paidAmount || o.payment.amount), b.reason || "Refund");
        o.payment.status = "refunded";
        await saveOrder(o);
        return json({ ok: true, order: o });
      }
      if (seg[2] === "telegram" && M === "POST") {
        const r = await sendAll(orderText(o) + `\n\n<b>Կարգավիճակ՝ ${STATUS[o.status]}</b>`, { reply_markup: orderButtons(o) });
        return json({ ok: r.some((x) => x.ok) });
      }
    }

    if (path === "stats") return json(stats(await listOrders({ months: 3 })));

    // ---- pages
    if (path === "pages" && M === "GET") return json({ pages: await listPages() });
    if (seg[0] === "pages" && seg[1]) {
      if (!slugOk(seg[1])) return json({ error: "Page address can use only a-z, 0-9 and -" }, 400);
      if (M === "GET") return json({ page: await getPage(seg[1]) });
      if (M === "DELETE") { await store("pages").delete("p/" + seg[1]); await purge(); return json({ ok: true }); }
      if (M === "PUT") {
        const p = await req.json();
        p.slug = seg[1];
        p.updatedAt = new Date().toISOString();
        if (p.oldSlug && p.oldSlug !== p.slug) await store("pages").delete("p/" + p.oldSlug);
        delete p.oldSlug;
        await store("pages").setJSON("p/" + p.slug, p);
        await purge();
        return json({ ok: true, page: p });
      }
    }

    // ---- media
    if (path === "media" && M === "GET") {
      const s = store("media");
      const { blobs } = await s.list();
      const items = await Promise.all(blobs.map(async (b) => ({ id: b.key, url: "/media/" + b.key, ...((await s.getMetadata(b.key))?.metadata || {}) })));
      return json({ media: items.sort((a, b) => (b.at || "").localeCompare(a.at || "")) });
    }
    if (path === "media" && M === "POST") {
      const type = req.headers.get("content-type") || "";
      if (!/^image\/(webp|jpeg|png|gif|svg\+xml|avif)$/.test(type)) return json({ error: "Only images" }, 400);
      const buf = await req.arrayBuffer();
      if (buf.byteLength > 5.5e6) return json({ error: "Image too big (max 5 MB)" }, 400);
      const ext = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/svg+xml": "svg", "image/avif": "avif" }[type];
      const id = Date.now().toString(36) + crypto.randomBytes(3).toString("hex") + "." + ext;
      const name = decodeURIComponent(req.headers.get("x-file-name") || "").slice(0, 100);
      await store("media").set(id, buf, { metadata: { type, name, size: buf.byteLength, at: new Date().toISOString() } });
      return json({ ok: true, id, url: "/media/" + id });
    }
    if (seg[0] === "media" && seg[1] && M === "DELETE") { await store("media").delete(seg[1]); return json({ ok: true }); }

    // ---- telegram
    if (path === "telegram/test" && M === "POST") {
      const r = await sendAll("✅ Garnu Gata admin: Telegram works!");
      return json({ ok: r.some((x) => x.ok), results: r });
    }
    if (path === "telegram/connect" && M === "POST") {
      const r = await tg("setWebhook", { url: siteUrl(req) + "/api/telegram", secret_token: tgSecret(), allowed_updates: ["message", "callback_query"] });
      await tg("setMyCommands", { commands: [{ command: "orders", description: "Open orders" }] });
      return json({ ok: r.ok, result: r });
    }

    // ---- AI helper
    if (path === "ai" && M === "POST") {
      const b = await req.json();
      if (b.task === "translate") {
        const out = await ask({
          system: "You translate website text for Garnu Gata, a family bakery of traditional Armenian gata in Garni, Armenia. Keep meaning, tone and any **bold** marks, *gold* marks, {placeholders}, emojis and line breaks. Use natural, warm, simple language. Reply ONLY with JSON.",
          messages: [{ role: "user", content: `Source language: ${b.from || "hy"}. Translate into: ${(b.to || ["ru", "en"]).join(", ")}.\nReturn JSON like {"ru":"...","en":"..."}.\n\nText:\n${b.text}` }],
          max: 2000,
        });
        const m = out.match(/\{[\s\S]*\}/);
        return json({ ok: true, result: m ? JSON.parse(m[0]) : {} });
      }
      const out = await ask({
        system: "You help the owner of Garnu Gata (traditional Armenian gata bakery in Garni, Armenia; wedding and gift gata; delivery to Yerevan and Abovyan) write website texts, Instagram posts, replies to customers and ideas. Answer in the language the owner writes in unless asked otherwise. Be concise and practical.",
        messages: (b.messages || [{ role: "user", content: String(b.text || "") }]).slice(-12),
        max: 1500,
      });
      return json({ ok: true, text: out });
    }

    return json({ error: "Not found" }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: String(e.message || e) }, 500);
  }
};

export const config = { path: ["/api/admin", "/api/admin/*"], rateLimit: { windowLimit: 300, windowSize: 60, aggregateBy: ["ip", "domain"] } };
