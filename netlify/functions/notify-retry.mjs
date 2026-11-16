// Sends Telegram notifications that failed or were interrupted (see lib/notify.mjs).
import { retryDue } from "../lib/notify.mjs";

export default async () => {
  const r = await retryDue();
  const sent = Object.values(r).filter((x) => x === "sent").length;
  if (Object.keys(r).length) console.log("notify-retry", JSON.stringify(r));
  return new Response(JSON.stringify({ ok: true, sent }), { headers: { "content-type": "application/json" } });
};

export const config = { schedule: "*/5 * * * *" };
