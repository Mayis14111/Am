import { getContent, json, t } from "../lib/store.mjs";
import { ask } from "../lib/ai.mjs";

// Answers customer questions the built-in assistant did not understand (only when turned on in admin).
export default async (req) => {
  const c = await getContent();
  if (!c.chat.ai) return json({ error: "off" }, 403);
  const b = await req.json().catch(() => ({}));
  const lang = ["hy", "ru", "en"].includes(b.lang) ? b.lang : "hy";
  const q = String(b.text || "").slice(0, 500);
  if (!q) return json({ error: "empty" }, 400);
  const m = c.menu;
  const menu = m.fillings.filter((f) => f.show !== false).map((f) => `${t(f.name, "en")}: ` + m.sizes.map((s, i) => `${s.cm}cm ${f.prices[i]} AMD`).join(", ")).join("\n");
  const deliv = c.delivery.options.filter((d) => d.show !== false).map((d) => "- " + t(d.label, "en")).join("\n");
  const faq = c.faq.items.map((f) => `Q: ${t(f.q, "en")}\nA: ${t(f.a, "en")}`).join("\n");
  const system = `You are the friendly assistant on the website of Garnu Gata, a family bakery of traditional Armenian gata in Garni, Armenia.
Reply in ${{ hy: "Armenian", ru: "Russian", en: "English" }[lang]} (if the customer writes Armenian in Latin letters, reply in Armenian script). Armenian must sound natural for people in Armenia: simple, polite, not overly formal, lowercase «ձեզ/ձեր». Keep it short (1–4 sentences), warm, human. Never invent prices, dates, ingredients, storage times or promises not listed below. Box, decoration and address-delivery charges are confirmed by phone after ordering. If unsure, suggest calling ${c.contact.phones.join(" or ")}.
To order, tell them to write "order" / "պատվիրել" / "заказать" in this chat or use the order form.
MENU (per gata):\n${menu}\nDELIVERY:\n${deliv}\nOrder ${t(c.order.lead, "en")}\nFAQ:\n${faq}\nInstagram: ${c.contact.instagram}`;
  try {
    const text = await ask({ system, messages: [{ role: "user", content: q }], max: 400, fast: true });
    return json({ text });
  } catch (e) {
    return json({ error: "ai" }, 503);
  }
};

export const config = { path: "/api/chat-ai", method: "POST", rateLimit: { windowLimit: 15, windowSize: 60, aggregateBy: ["ip", "domain"] } };
