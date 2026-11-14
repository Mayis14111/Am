import Anthropic from "@anthropic-ai/sdk";
import { env } from "./store.mjs";

const MODELS = () => [env("AI_MODEL"), "claude-sonnet-5-5", "claude-sonnet-4-5", "claude-haiku-4-5-20251001", "claude-haiku-4-5"].filter(Boolean);

export async function ask({ system, messages, max = 1200, fast = false }) {
  const client = new Anthropic();
  let last;
  const list = fast ? [env("AI_MODEL_FAST"), "claude-haiku-4-5-20251001", "claude-haiku-4-5", ...MODELS()].filter(Boolean) : MODELS();
  for (const model of [...new Set(list)]) {
    try {
      const r = await client.messages.create({ model, max_tokens: max, system, messages });
      return r.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    } catch (e) {
      last = e;
      const s = e?.status;
      if (s && s !== 404 && s !== 400) break; // only try other models when the model is not available
    }
  }
  throw last || new Error("AI not available");
}
