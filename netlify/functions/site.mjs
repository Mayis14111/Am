import { getContent, listPages, siteUrl, LANGS, t } from "../lib/store.mjs";
import { renderHome, renderPage, render404, PREFIX, pageUrl } from "../lib/render.mjs";

const HTML_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "public, max-age=0, must-revalidate",
  "netlify-cdn-cache-control": "public, durable, s-maxage=600, stale-while-revalidate=86400",
  "netlify-cache-tag": "site",
};

export default async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const base = siteUrl(req);
  const [c, all] = await Promise.all([getContent(true), listPages().catch(() => [])]);
  const pages = all.filter((p) => p.published);

  if (path === "/sitemap.xml") {
    const now = new Date().toISOString().slice(0, 10);
    const alt = (fn) => LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${base}${fn(l)}"/>`).join("");
    const entry = (fn, pr) => LANGS.map((l) => `<url><loc>${base}${fn(l)}</loc><lastmod>${now}</lastmod>${alt(fn)}<priority>${pr}</priority></url>`).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entry((l) => PREFIX[l], "1.0")}
${pages.map((p) => entry((l) => pageUrl(l, p.slug), "0.6")).join("\n")}
</urlset>`;
    return new Response(xml, { headers: { ...HTML_HEADERS, "content-type": "application/xml; charset=utf-8" } });
  }

  let m;
  const lang = (m = /^\/(ru|en)(\/|$)/.exec(path)) ? m[1] : "hy";
  const rest = lang === "hy" ? path : path.slice(3) || "/";

  if (rest === "/") return new Response(renderHome(c, lang, pages, base), { headers: HTML_HEADERS });

  if ((m = /^\/p\/([a-z0-9-]+)$/.exec(rest))) {
    const p = pages.find((x) => x.slug === m[1]);
    if (p) return new Response(renderPage(c, lang, p, pages, base), { headers: HTML_HEADERS });
  }
  return new Response(render404(c, lang, pages, base), { status: 404, headers: { ...HTML_HEADERS, "netlify-cdn-cache-control": "public, s-maxage=60" } });
};

export const config = {
  path: ["/", "/ru", "/ru/", "/en", "/en/", "/p/*", "/ru/p/*", "/en/p/*", "/sitemap.xml"],
};
