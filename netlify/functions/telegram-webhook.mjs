import { json } from "../lib/store.mjs";
import { safeEqual } from "../lib/auth.mjs";
import { tg, tgSecret, tgChats, STATUS, orderText, orderButtons } from "../lib/telegram.mjs";
import { getOrder, saveOrder, updateOrder, setStatus, listOrders } from "../lib/orders.mjs";

export default async (req) => {
  if (!safeEqual(req.headers.get("x-telegram-bot-api-secret-token") || "", tgSecret())) return json({ error: "no" }, 401);
  const u = await req.json().catch(() => ({}));

  const cq = u.callback_query;
  if (cq) {
    const chat = String(cq.message?.chat?.id || cq.from?.id);
    if (!tgChats().includes(chat)) { await tg("answerCallbackQuery", { callback_query_id: cq.id, text: "No access" }); return json({ ok: true }); }
    const [, id, st] = String(cq.data || "").split(":");
    const o = await getOrder(id);
    if (!o) { await tg("answerCallbackQuery", { callback_query_id: cq.id, text: "Order not found" }); return json({ ok: true }); }
    Object.assign(o, await updateOrder(o.id, (cur) => { setStatus(cur, st, "telegram"); }));
    await tg("editMessageText", {
      chat_id: cq.message.chat.id, message_id: cq.message.message_id, parse_mode: "HTML",
      text: orderText(o).replace("Նոր պատվեր", "Պատվեր") + `\n\n<b>Կարգավիճակ՝ ${STATUS[o.status]}</b>`,
      reply_markup: orderButtons(o),
    });
    await tg("answerCallbackQuery", { callback_query_id: cq.id, text: STATUS[o.status] });
    return json({ ok: true });
  }

  const m = u.message;
  if (m?.text) {
    const chat = String(m.chat.id);
    if (!tgChats().includes(chat)) {
      await tg("sendMessage", { chat_id: chat, text: `Your chat ID: ${chat}\nGarnu Gata 🧁 https://garnugata.am` });
      return json({ ok: true });
    }
    if (/^\/(today|orders|start)/.test(m.text)) {
      const list = (await listOrders({ months: 2 })).filter((o) => !["delivered", "cancelled"].includes(o.status)).slice(0, 20);
      const txt = list.length
        ? "<b>Բաց պատվերներ</b>\n\n" + list.map((o) => `${STATUS[o.status]} <b>${o.id}</b> · ${o.date} · ${o.fillingName} ${o.size}սմ ×${o.qty} · ${o.customer?.name} ${o.customer?.phone}`).join("\n")
        : "Բաց պատվերներ չկան 🙂";
      await tg("sendMessage", { chat_id: chat, text: txt, parse_mode: "HTML" });
    }
  }
  return json({ ok: true });
};

export const config = { path: "/api/telegram", method: "POST" };
