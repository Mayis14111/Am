import { env, t } from "./store.mjs";
import { hmac } from "./auth.mjs";

export const tgToken = () => env("TELEGRAM_BOT_TOKEN");
export const tgChats = () => env("TELEGRAM_CHAT_IDS", "713576021").split(/[,\s]+/).filter(Boolean);
export const tgSecret = () => hmac("telegram-webhook").slice(0, 40);

export async function tg(method, body) {
  const token = tgToken();
  if (!token) return { ok: false, description: "TELEGRAM_BOT_TOKEN is not set" };
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
    });
    return await r.json();
  } catch (e) { return { ok: false, description: String(e) }; }
}

export async function sendAll(text, extra = {}) {
  const res = [];
  for (const chat_id of tgChats()) res.push(await tg("sendMessage", { chat_id, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra }));
  return res;
}

const h = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const money = (n) => (+n || 0).toLocaleString("en-US").replace(/,/g, " ") + " ֏";

export const STATUS = {
  new: "🆕 Նոր", confirmed: "✅ Հաստատված", baking: "🔥 Թխվում է", ready: "📦 Պատրաստ է",
  delivered: "🎉 Հանձնված", cancelled: "❌ Չեղարկված",
};
export const PAY = { none: "Վճարել ստանալիս", pending: "⏳ Սպասում է առցանց վճարման", completed: "💳 Վճարված է", failed: "⚠️ Վճարումը չհաջողվեց", expired: "⌛ Վճարման ժամկետն անցավ", refunded: "↩️ Վերադարձված", processing: "⏳ Մշակվում է" };

export function orderText(o) {
  const lines = [
    `🧁 <b>Նոր պատվեր ${h(o.id)}</b>${o.source === "chat" ? " · չատից" : " · ձևից"}`,
    "",
    o.product ? `🎀 ${h(o.product)}` : "",
    `🥐 ${h(o.fillingName)}${o.choco ? " (" + h(o.choco) + ")" : ""}`,
    `📏 ${h(o.size)} սմ × ${h(o.qty)} հատ`,
    o.box ? `🎁 Տուփով` : `🎁 Առանց տուփի`,
    `💰 ${o.estimate ? "Նախնական՝ " : ""}${money(o.total)}${o.qty > 1 ? ` (${money(o.unit)} × ${o.qty})` : ""}${o.estimate ? " + " + [o.box && !o.boxFee ? "տուփ" : "", o.delivery?.feeLater ? "առաքում" : ""].filter(Boolean).join(", ") + " (ճշտել)" : ""}`,
    `📅 ${h(o.date || "—")}`,
    `🚗 ${h(o.delivery?.label || "—")}`,
    o.delivery?.address ? `📍 ${h(o.delivery.address)}` : "",
    "",
    `👤 ${h(o.customer?.name)}`,
    `📞 ${h(o.customer?.phone)}`,
    o.notes ? `📝 ${h(o.notes)}` : "",
    `💳 ${PAY[o.payment?.status || "none"] || h(o.payment?.status)}`,
    `🌐 ${h((o.lang || "hy").toUpperCase())}`,
  ];
  return lines.filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
}

export function orderButtons(o) {
  const b = (s) => ({ text: STATUS[s], callback_data: `st:${o.id}:${s}` });
  return {
    inline_keyboard: [
      [b("confirmed"), b("baking")],
      [b("ready"), b("delivered")],
      [b("cancelled")],
    ],
  };
}
export { money };
