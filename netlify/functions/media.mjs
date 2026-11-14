import { store } from "../lib/store.mjs";

export default async (req, context) => {
  const id = context.params?.id || new URL(req.url).pathname.split("/").pop();
  if (!/^[\w.-]+$/.test(id)) return new Response("Not found", { status: 404 });
  const r = await store("media").getWithMetadata(id, { type: "arrayBuffer" });
  if (!r) return new Response("Not found", { status: 404 });
  return new Response(r.data, {
    headers: { "content-type": r.metadata?.type || "image/webp", "cache-control": "public, max-age=31536000, immutable" },
  });
};

export const config = { path: "/media/:id" };
