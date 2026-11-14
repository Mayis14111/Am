import { listOrders } from "../lib/orders.mjs";
import { sendAll, STATUS, money } from "../lib/telegram.mjs";
import { yerevanNow, ymd } from "../lib/store.mjs";

// Every morning at 09:00 Yerevan time: today's and tomorrow's orders.
export default async () => {
  const today = ymd(yerevanNow());
  const tomorrow = ymd(new Date(yerevanNow().getTime() + 864e5));
  const open = (await listOrders({ months: 3 })).filter((o) => o.status !== "cancelled" && o.status !== "delivered");
  const fmt = (o) => `${STATUS[o.status]} <b>${o.id}</b> · ${o.fillingName} ${o.size}սմ ×${o.qty} · ${money(o.total)}\n    ${o.customer?.name} ${o.customer?.phone} · ${o.delivery?.label}`;
  const a = open.filter((o) => o.date === today), b = open.filter((o) => o.date === tomorrow);
  if (!a.length && !b.length) return;
  let txt = `☀️ <b>Բարի լույս</b>\n\n<b>Այսօր (${today})՝ ${a.length}</b>\n` + (a.map(fmt).join("\n") || "—");
  txt += `\n\n<b>Վաղը (${tomorrow})՝ ${b.length}</b>\n` + (b.map(fmt).join("\n") || "—");
  await sendAll(txt);
};

export const config = { schedule: "0 5 * * *" };
