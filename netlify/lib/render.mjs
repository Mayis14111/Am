import { esc, t, LANGS, packsOf } from "./store.mjs";
import { paynetReady } from "./paynet.mjs";

export const PREFIX = { hy: "/", ru: "/ru/", en: "/en/" };
const HTML_LANG = { hy: "hy", ru: "ru", en: "en" };
const OG_LOCALE = { hy: "hy_AM", ru: "ru_RU", en: "en_US" };
const LANG_NAME = { hy: "ՀԱՅ", ru: "РУ", en: "EN" };

export const UI = {
  hy: { order: "Պատվիրել", menu: "Մենյու", main: "Գլխավոր", address: "Գտնվելու վայրը", orders: "Պատվիրելու համար", delivery: "Առաքում", deliveryTxt: "Գառնիից՝ Երևան և Աբովյան", home: "Գլխավոր էջ", notFound: "Էջը չի գտնվել", notFoundTxt: "Այս էջը գոյություն չունի կամ տեղափոխվել է։", openChat: "Բացել չատը", closeChat: "Փակել չատը", online: "Ավտոմատ օգնական", ask: "Գրեք ձեր հարցը…", send: "Ուղարկել", assistant: "Գառնու Գաթայի օգնական" },
  ru: { order: "Заказать", menu: "Меню", main: "Главная", address: "Где мы", orders: "Для заказа", delivery: "Доставка", deliveryTxt: "Из Гарни — в Ереван и Абовян", home: "На главную", notFound: "Страница не найдена", notFoundTxt: "Такой страницы нет или она перемещена.", openChat: "Открыть чат", closeChat: "Закрыть чат", online: "Автоматический помощник", ask: "Напишите ваш вопрос…", send: "Отправить", assistant: "Помощник Гарну Гата" },
  en: { order: "Order", menu: "Menu", main: "Home", address: "Location", orders: "To order", delivery: "Delivery", deliveryTxt: "From Garni to Yerevan & Abovyan", home: "Back to home", notFound: "Page not found", notFoundTxt: "This page doesn't exist or has moved.", openChat: "Open chat", closeChat: "Close chat", online: "Automated assistant", ask: "Type your question…", send: "Send", assistant: "Garnu Gata assistant" },
};

const CHIPS = {
  hy: ["Տեսնել գները", "Պատվիրել չատով", "Առաքման պայմանները", "Հարսանեկան պատվեր", "Ի՞նչ է խորիզը", "Հեռախոսահամարները"],
  ru: ["Посмотреть цены", "Заказать в чате", "Условия доставки", "Свадебный заказ", "Что такое хориз?", "Телефоны"],
  en: ["See prices", "Order in chat", "Delivery terms", "Wedding order", "What is khoriz?", "Phone numbers"],
};

// **bold** and *gold*, safe
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
const abs = (base, u) => (!u ? "" : /^https?:/.test(u) ? u : base + (u.startsWith("/") ? u : "/" + u));

// Markdown-lite for custom pages
export function md(src = "") {
  const lines = String(src).replace(/\r/g, "").split("\n");
  const out = [];
  let list = null, para = [];
  const flushP = () => { if (para.length) { out.push("<p>" + span(para.join(" ")) + "</p>"); para = []; } };
  const flushL = () => { if (list) { out.push(`<${list.t}>` + list.items.map((i) => "<li>" + span(i) + "</li>").join("") + `</${list.t}>`); list = null; } };
  function span(s) {
    return esc(s)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, a, u) => `<img src="${u.replace(/"/g, "")}" alt="${a}" loading="lazy">`)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)\{btn\}/g, (m, a, u) => `<a class="btn btn-gold" href="${u.replace(/"/g, "")}">${a}</a>`)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, a, u) => `<a href="${/^(https?:|\/|#|mailto:|tel:)/.test(u) ? u.replace(/"/g, "") : "#"}"${/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : ""}>${a}</a>`)
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<i>$2</i>");
  }
  for (const raw of lines) {
    const l = raw.trimEnd();
    let m;
    if (!l.trim()) { flushP(); flushL(); continue; }
    if ((m = /^(#{1,3})\s+(.*)/.exec(l))) { flushP(); flushL(); const n = Math.min(3, m[1].length + 1); out.push(`<h${n}>${span(m[2])}</h${n}>`); continue; }
    if ((m = /^>\s?(.*)/.exec(l))) { flushP(); flushL(); out.push(`<blockquote>${span(m[1])}</blockquote>`); continue; }
    if ((m = /^\s*[-•*]\s+(.*)/.exec(l))) { flushP(); if (!list || list.t !== "ul") { flushL(); list = { t: "ul", items: [] }; } list.items.push(m[1]); continue; }
    if ((m = /^\s*\d+[.)]\s+(.*)/.exec(l))) { flushP(); if (!list || list.t !== "ol") { flushL(); list = { t: "ol", items: [] }; } list.items.push(m[1]); continue; }
    if (/^!\[/.test(l.trim())) { flushP(); flushL(); out.push(span(l.trim())); continue; }
    flushL(); para.push(l.trim());
  }
  flushP(); flushL();
  return out.join("\n");
}

export const pageUrl = (lang, slug) => PREFIX[lang] + "p/" + slug;

function head(c, lang, { title, description, path, base, ogImage, jsonld, noindex, alt }) {
  const url = base + path;
  const og = abs(base, ogImage || c.seo.ogImage);
  return `<!doctype html>
<html lang="${HTML_LANG[lang]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
${alt ? alt.map(([l, p]) => `<link rel="alternate" hreflang="${l}" href="${esc(base + p)}">`).join("\n") + `\n<link rel="alternate" hreflang="x-default" href="${esc(base + alt[0][1])}">` : ""}
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}">
<meta name="theme-color" content="#261b14">
${c.brand.favicon ? `<link rel="icon" href="${esc(c.brand.favicon)}">` : `<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">\n<link rel="icon" href="/img/favicon.png" sizes="48x48">`}
<link rel="apple-touch-icon" href="${esc(c.brand.favicon || "/img/apple-touch-icon.png")}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${OG_LOCALE[lang]}">
<meta property="og:site_name" content="${esc(t(c.brand.name, lang))}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(og)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(og)}">
${c.seo.googleVerification ? `<meta name="google-site-verification" content="${esc(c.seo.googleVerification)}">` : ""}
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Armenian:wght@400;500&family=Noto+Sans+Armenian:wght@300;400;500;600${lang !== "hy" ? "&family=Noto+Serif:wght@400;500&family=Noto+Sans:wght@300;400;500;600" : ""}&display=swap">
<link rel="stylesheet" href="/css/site.css?v=${ASSET_V}">
${/^G-[A-Z0-9]+$/.test(c.seo.googleTag || "") ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${c.seo.googleTag}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${c.seo.googleTag}');</script>` : ""}
</head>
<body>
<div class="root">`;
}
export const ASSET_V = "5";

function logo(c, lang, id, href, light) {
  const src = light ? c.brand.logoLight || c.brand.logo : c.brand.logo;
  return `<a class="logo" href="${href}" id="${id}">${src ? `<img src="${esc(src)}" alt="${esc(t(c.brand.name, lang))}">` : `<b>${esc(t(c.brand.logoText, lang))}</b><small>${esc(t(c.brand.sub, lang))}</small>`}</a>`;
}

function navLinks(c, lang, pages, onHome) {
  const home = PREFIX[lang];
  const links = c.nav.filter((n) => n.show !== false).map((n) => {
    let href = n.href || "#";
    if (href.startsWith("#") && !onHome) href = home + href;
    if (/^\/p\//.test(href)) href = PREFIX[lang] + href.slice(1);
    return { href, label: t(n.label, lang), ext: /^https?:/.test(href) };
  });
  if (c.pagesInNav !== false) for (const p of pages.filter((p) => p.published && p.showInNav)) links.push({ href: pageUrl(lang, p.slug), label: t(p.title, lang) });
  return links;
}

function langSwitch(lang, paths) {
  return `<div class="langs" aria-label="Language">${LANGS.map((l) => `<a href="${paths[l]}" hreflang="${l}" lang="${l}"${l === lang ? ' class="on" aria-current="true"' : ""}>${LANG_NAME[l]}</a>`).join("")}</div>`;
}

function nav(c, lang, pages, onHome, paths) {
  const u = UI[lang];
  const links = navLinks(c, lang, pages, onHome);
  const a = (l) => `<a href="${esc(l.href)}"${l.ext ? ' target="_blank" rel="noopener"' : ""}>${esc(l.label)}</a>`;
  return `<nav class="nav" aria-label="${u.main}">
  <div class="wrap">
    ${logo(c, lang, "logo", onHome ? "#top" : PREFIX[lang])}
    <ul>${links.map((l) => `<li>${a(l)}</li>`).join("")}</ul>
    <div class="nav-r">
      ${langSwitch(lang, paths)}
      <a class="btn btn-gold" href="${onHome ? "" : PREFIX[lang]}#order">${u.order}</a>
      <button class="burger" id="burger" type="button" aria-label="${u.menu}" aria-expanded="false" aria-controls="mmenu"><span></span></button>
    </div>
  </div>
</nav>
<div class="mmenu" id="mmenu" hidden>${langSwitch(lang, paths).replace('class="langs"', 'class="langs mlangs"')}${links.map(a).join("")}<a href="${onHome ? "" : PREFIX[lang]}#order">${u.order} →</a></div>`;
}

function footer(c, lang, pages) {
  const u = UI[lang], ct = c.contact;
  const fl = pages.filter((p) => p.published && p.showInFooter);
  const social = [["Instagram", ct.instagram], ["Facebook", ct.facebook], ["TikTok", ct.tiktok], ["Telegram", ct.telegram]].filter((x) => x[1]);
  return `<footer class="dark">
  ${logo(c, lang, "logo2", PREFIX[lang], true)}
  <div class="rule"></div>
  <div class="fcols">
    <div><div class="fh">${u.address}</div>${inline(t(ct.address, lang))}${ct.mapUrl ? `<br><a href="${esc(ct.mapUrl)}" target="_blank" rel="noopener">Google Maps</a>` : ""}</div>
    <div><div class="fh">${u.orders}</div>${ct.phones.map((p) => `<a href="tel:${esc(p.replace(/[^\d+]/g, "").replace(/^0/, "+374"))}">${esc(p)}</a>`).join("<br>")}${ct.email ? `<br><a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>` : ""}<div class="social">${social.map(([n, h]) => `<a href="${esc(h)}" target="_blank" rel="noopener">${n}</a>`).join(" · ")}</div></div>
    <div><div class="fh">${u.delivery}</div>${esc(u.deliveryTxt)}<br>${esc(ct.domain || "")}</div>
  </div>
  ${fl.length ? `<div class="flinks">${fl.map((p) => `<a href="${pageUrl(lang, p.slug)}">${esc(t(p.title, lang))}</a>`).join("")}</div>` : ""}
  <div class="copy">${esc(t(c.footer.copy, lang))}</div>
</footer>`;
}

function chatHtml(c, lang) {
  if (c.chat.show === false) return "";
  const u = UI[lang];
  return `<button class="chat-btn" id="chatBtn" type="button" aria-label="${u.openChat}" aria-expanded="false" aria-controls="chatPanel">
  <svg class="ic-chat" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z" fill="currentColor"/><circle cx="8.5" cy="9.5" r="1.2" fill="#b9853f"/><circle cx="12" cy="9.5" r="1.2" fill="#b9853f"/><circle cx="15.5" cy="9.5" r="1.2" fill="#b9853f"/></svg>
  <svg class="ic-close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
</button>
<div class="chat-panel" id="chatPanel" role="dialog" aria-label="${u.assistant}" hidden>
  <div class="chat-head">
    <div class="av" aria-hidden="true">${esc(t(c.brand.name, lang).charAt(0))}</div>
    <div><b>${u.assistant}</b><small>${u.online}</small></div>
    <button class="chat-x" id="chatX" type="button" aria-label="${u.closeChat}">×</button>
  </div>
  <div class="chat-body">
    <div class="msgs" id="msgs" aria-live="polite"><div class="m bot">${esc(t(c.chat.welcome, lang))}</div></div>
    <div class="chips">${CHIPS[lang].map((x, i) => `<button class="chip" type="button" data-act="${["price", "order", "delivery", "wedding", "khoriz", "phone"][i]}">${esc(x)}</button>`).join("")}</div>
    <form class="ask" id="cf"><input id="q" placeholder="${u.ask}" aria-label="${u.ask}" autocomplete="off"><button class="btn btn-gold" type="submit">${u.send}</button></form>
  </div>
</div>`;
}

// Data the browser script needs
function clientData(c, lang) {
  return {
    lang,
    phones: c.contact.phones,
    whatsapp: c.contact.whatsapp,
    instagram: c.contact.instagramHandle,
    menu: c.menu,
    delivery: c.delivery.options.filter((d) => d.show !== false),
    answers: c.chat.answers,
    ai: !!c.chat.ai,
    pay: !!c.payments.enabled && paynetReady(),
    accept: c.order.accept !== false,
    closedText: t(c.order.closedText, lang),
    minDays: +c.order.minDays || 0,
    packs: packsOf(c),
    orderNote: t(c.order.note, lang),
  };
}

function tail(c, lang) {
  return `</div>
<script>window.GG=${JSON.stringify(clientData(c, lang)).replace(/</g, "\\u003c")};</script>
<script src="/js/site.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

function jsonLd(c, lang, base) {
  const m = c.menu;
  const offers = [];
  for (const f of m.fillings.filter((f) => f.show !== false))
    m.sizes.forEach((s, i) => offers.push({ "@type": "Offer", itemOffered: { "@type": "Product", name: `${t(f.name, lang)}, ${s.cm} cm` }, price: String(f.prices[i]), priceCurrency: "AMD" }));
  const tel = (p) => "+374" + p.replace(/\D/g, "").replace(/^0/, "");
  return [
    {
      "@context": "https://schema.org", "@type": "Bakery",
      name: t(c.brand.name, lang), alternateName: LANGS.map((l) => t(c.brand.name, l)).filter((n) => n !== t(c.brand.name, lang)),
      url: base + PREFIX[lang], image: abs(base, c.seo.ogImage), description: t(c.seo.description, lang),
      telephone: c.contact.phones.map(tel), priceRange: "֏֏",
      address: { "@type": "PostalAddress", addressLocality: { hy: "Գառնի", ru: "Гарни", en: "Garni" }[lang], addressRegion: { hy: "Կոտայքի մարզ", ru: "Котайк", en: "Kotayk" }[lang], addressCountry: "AM" },
      servesCuisine: "Armenian",
      sameAs: [c.contact.instagram, c.contact.facebook, c.contact.tiktok].filter(Boolean),
      hasOfferCatalog: { "@type": "OfferCatalog", name: "Gata", itemListElement: offers },
    },
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: c.faq.items.map((f) => ({ "@type": "Question", name: t(f.q, lang), acceptedAnswer: { "@type": "Answer", text: t(f.a, lang) } })),
    },
  ];
}

const HL = {
  hy: { sizesPrices: "Չափսեր և գներ", from: (p) => `${p} դրամից`, cur: "դրամ", cm: "սմ", packIncluded: "Տուփը ներառված է գնի մեջ", packSeparateBox: "Տուփի արժեքը հաշվարկվում է առանձին", packSeparate: "Փաթեթավորման արժեքը հաշվարկվում է առանձին", packVariable: "Գինը՝ ըստ ընտրված տարբերակի", fixed: (p) => ` (${p} դրամ՝ մեկ հատի համար)`, sizesFact: (s) => `Չափսեր՝ ${s} սմ`, fromFact: (p) => `Գինը՝ ${p} դրամից`, prev: "Նախորդ լուսանկարը", next: "Հաջորդ լուսանկարը", filling: "Միջուկ", deliveryFree: "Առանց առաքման վճարի", deliveryLater: "Առաքման արժեքը՝ ենթակա է ճշտման", orderNow: "Պատվիրել" },
  ru: { sizesPrices: "Размеры и цены", from: (p) => `от ${p} драм`, cur: "драм", cm: "см", packIncluded: "Коробка входит в цену", packSeparateBox: "Стоимость коробки считается отдельно", packSeparate: "Стоимость упаковки считается отдельно", packVariable: "Цена — в зависимости от выбранного варианта", fixed: (p) => ` (${p} драм за штуку)`, sizesFact: (s) => `Размеры: ${s} см`, fromFact: (p) => `Цена: от ${p} драм`, prev: "Предыдущее фото", next: "Следующее фото", filling: "Начинка", deliveryFree: "Без оплаты доставки", deliveryLater: "Стоимость доставки уточняется", orderNow: "Заказать" },
  en: { sizesPrices: "Sizes and prices", from: (p) => `from ${p} AMD`, cur: "AMD", cm: "cm", packIncluded: "Box included in the price", packSeparateBox: "Box price is charged separately", packSeparate: "Packaging price is charged separately", packVariable: "Price depends on the chosen option", fixed: (p) => ` (${p} AMD each)`, sizesFact: (s) => `Sizes: ${s} cm`, fromFact: (p) => `From ${p} AMD`, prev: "Previous photo", next: "Next photo", filling: "Filling", deliveryFree: "No delivery fee", deliveryLater: "Delivery price to be confirmed", orderNow: "Order" },
};
const num = (n) => (+n || 0).toLocaleString("en-US").replace(/,/g, " ");

export function renderHome(c, lang, pages, base) {
  const u = UI[lang], H = HL[lang];
  const paths = Object.fromEntries(LANGS.map((l) => [l, PREFIX[l]]));
  const m = c.menu, sizes = m.sizes, shown = m.fillings.filter((f) => f.show !== false);
  const minAt = (i) => Math.min(...shown.map((f) => +f.prices[i] || Infinity));
  const minAll = Math.min(...sizes.map((s, i) => minAt(i)));
  const packs = packsOf(c);
  const packNote = (k) => {
    if (k.packNote === "included") return H.packIncluded;
    if (k.packNote === "variable") return H.packVariable;
    const pk = packs.find((p) => p.id === k.packaging);
    const base_ = k.packaging === "box" ? H.packSeparateBox : H.packSeparate;
    return base_ + (pk && pk.price > 0 ? H.fixed(num(pk.price)) : "");
  };
  const gal = c.gallery.images;
  const igLink = c.contact.instagram ? `<a href="${esc(c.contact.instagram)}" target="_blank" rel="noopener">${esc(c.contact.instagramHandle || "Instagram")}</a>` : "";
  const delivery = c.delivery.options.filter((d) => d.show !== false);

  const body = `
${nav(c, lang, pages, true, paths)}

<header class="hero" id="top">
  <div class="wrap hero-grid">
    <div class="hero-text">
      <span class="kicker">${esc(t(c.hero.title, lang))} · ${esc(t(c.brand.sub, lang).split("·")[0].trim())}</span>
      <h1>${esc(t(c.hero.kicker, lang))}</h1>
      <p class="lead">${inline(t(c.hero.lead, lang))}</p>
      <div class="btns hero-btns" data-avoid>
        <a class="btn btn-gold" href="#order">${esc(t(c.hero.btnOrder, lang))}</a>
        <a class="btn btn-line" href="#products">${esc(t(c.hero.btnMenu, lang))}</a>
      </div>
      <p class="facts"><b>${esc(H.sizesFact(sizes.map((s) => s.cm).join(", ")))}</b>${isFinite(minAll) ? `<span aria-hidden="true">·</span><b>${esc(H.fromFact(num(minAll)))}</b>` : ""}</p>
      ${t(c.hero.advice, lang) ? `<p class="advice"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>${inline(t(c.hero.advice, lang))}</span></p>` : ""}
    </div>
    <div class="hero-stage" aria-hidden="true">
      <div class="hero-glow"></div>
      <div class="hero-gata"><img src="${esc(c.hero.image)}" alt="" width="600" height="600" fetchpriority="high"></div>
      <span class="pearl" style="--x:4%;--y:16%;--s:26px"></span>
      <span class="pearl" style="--x:88%;--y:10%;--s:18px"></span>
      <span class="pearl" style="--x:90%;--y:70%;--s:30px"></span>
      <span class="pearl" style="--x:8%;--y:84%;--s:18px"></span>
    </div>
  </div>
</header>

<section class="section" id="products">
  <div class="wrap">
    <div class="sec-head">
      <span class="kicker">${esc(t(c.products.kicker, lang))}</span>
      <h2 class="h2">${esc(t(c.products.title, lang))}</h2>
      <p class="lead">${inline(t(c.products.lead, lang))}</p>
    </div>
    <div class="products">
      ${c.products.cards.filter((k) => k.show !== false).map((k) => `<article class="card" data-avoid>
        <div class="pic"><img src="${esc(k.image)}" alt="${esc(t(k.title, lang))}" loading="lazy" width="400" height="400"></div>
        <div class="body">
          <span class="tag">${esc(t(k.tag, lang))}</span>
          <h3>${esc(t(k.title, lang))}</h3>
          <p>${inline(t(k.text, lang))}</p>
          <div class="sp"><b>${H.sizesPrices}</b><ul>${sizes.map((s, i) => isFinite(minAt(i)) ? `<li><span>${s.cm} ${H.cm}</span><span>${esc(H.from(num(minAt(i))))}</span></li>` : "").join("")}</ul></div>
          <p class="packnote">${esc(packNote(k))}</p>
        </div>
        <div class="act"><a class="btn btn-gold" data-avoid href="#order" data-pick="${esc(t(k.title, lang))}" data-pack="${esc(k.packaging || "")}" data-img="${esc(k.image)}">${esc(t(c.products.btn, lang))}</a></div>
      </article>`).join("\n      ")}
    </div>
    <div class="price-table">
      <h3>${esc(t(c.products.pricesTitle, lang))}</h3>
      <div class="pt-scroll"><table>
        <caption>${H.cur}</caption>
        <thead><tr><th scope="col">${H.filling}</th>${sizes.map((s) => `<th scope="col">${s.cm} ${H.cm}</th>`).join("")}</tr></thead>
        <tbody>${shown.map((f) => `<tr><th scope="row">${esc(t(f.short, lang))}</th>${sizes.map((s, i) => `<td>${num(f.prices[i])}</td>`).join("")}</tr>`).join("")}</tbody>
      </table></div>
      <p class="note">${esc(t(c.products.pricesNote, lang))}</p>
    </div>
  </div>
</section>

<section class="section alt" id="delivery">
  <div class="wrap">
    <div class="sec-head">
      <span class="kicker">${esc(t(c.deliveryInfo.kicker, lang))}</span>
      <h2 class="h2">${esc(t(c.deliveryInfo.title, lang))}</h2>
      <p class="lead">${esc(t(c.deliveryInfo.lead, lang))}</p>
    </div>
    <div class="deliv">
      ${delivery.map((d) => `<div class="dcard"><h3>${esc(t(d.label, lang))}</h3><p class="fee">${d.price > 0 ? num(d.price) + " " + H.cur : d.price < 0 ? H.deliveryLater : H.deliveryFree}</p>${t(d.note, lang) ? `<p>${esc(t(d.note, lang))}</p>` : ""}</div>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="section order" id="order">
  <div class="wrap">
    <div class="sec-head">
      <span class="kicker">${esc(t(c.order.kicker, lang))}</span>
      <h2 class="h2">${esc(t(c.order.title, lang))}</h2>
      <p class="lead">${inline(t(c.order.lead, lang))}</p>
    </div>
    <form class="box" id="f" novalidate></form>
  </div>
</section>

<section class="section dark" id="story">
  <div class="wrap story">
    <div class="photo"><img src="${esc(c.story.image)}" alt="${esc(t(c.story.title, lang))}" loading="lazy" width="600" height="750"></div>
    <div>
      <span class="kicker">${esc(t(c.story.kicker, lang))}</span>
      <h2>${esc(t(c.story.title, lang))}</h2>
      <p>${inline(t(c.story.p1, lang))}</p>
      ${t(c.story.p2, lang) ? `<p>${inline(t(c.story.p2, lang))}</p>` : ""}
      <div class="btns on-dark" data-avoid><a class="btn btn-gold" href="#order">${H.orderNow}</a>${c.contact.instagram ? `<a class="btn btn-line" href="${esc(c.contact.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ""}</div>
    </div>
  </div>
  <div class="wrap" id="gallery">
    <div class="gal-head"><h3>${esc(t(c.gallery.title, lang))}</h3><p>${esc(t(c.gallery.lead, lang))} ${igLink}</p>
      <div class="gal-nav" data-avoid><button type="button" class="gbtn" data-dir="-1" aria-label="${H.prev}">‹</button><button type="button" class="gbtn" data-dir="1" aria-label="${H.next}">›</button></div></div>
    <div class="gal" id="gal" tabindex="0" aria-label="${esc(t(c.gallery.title, lang))}">
      ${gal.map((i) => `<img src="${esc(i.src)}" alt="${esc(t(i.alt, lang))}" loading="lazy" width="400" height="400">`).join("")}
    </div>
  </div>
</section>

<section class="section" id="faq">
  <div class="wrap">
    <div class="sec-head">
      <span class="kicker">${esc(t(c.faq.kicker, lang))}</span>
      <h2 class="h2">${esc(t(c.faq.title, lang))}</h2>
    </div>
    <div class="faq">
      ${c.faq.items.map((f) => `<details class="qa" data-avoid><summary>${esc(t(f.q, lang))}</summary><p>${inline(t(f.a, lang))}</p></details>`).join("\n      ")}
    </div>
  </div>
</section>

${chatHtml(c, lang)}
${footer(c, lang, pages)}`;

  return head(c, lang, {
    title: t(c.seo.title, lang), description: t(c.seo.description, lang), path: PREFIX[lang], base,
    jsonld: jsonLd(c, lang, base), alt: LANGS.map((l) => [l, PREFIX[l]]),
  }) + body + tail(c, lang);
}

export function renderPage(c, lang, p, pages, base) {
  const paths = Object.fromEntries(LANGS.map((l) => [l, pageUrl(l, p.slug)]));
  const title = t(p.title, lang);
  const body = `
${nav(c, lang, pages, false, paths)}
<header class="page-hero"><div class="wrap">${p.kicker ? `<span class="kicker">${esc(t(p.kicker, lang))}</span>` : ""}<h1>${esc(title)}</h1></div></header>
${p.image ? `<div class="wrap" style="max-width:960px"><img src="${esc(p.image)}" alt="${esc(title)}" style="border-radius:var(--r);box-shadow:var(--shadow);width:100%;max-height:520px;object-fit:cover"></div>` : ""}
<article class="prose">${md(t(p.body, lang))}</article>
${chatHtml(c, lang)}
${footer(c, lang, pages)}`;
  return head(c, lang, {
    title: `${title} | ${t(c.brand.name, lang)}`, description: t(p.seoDescription, lang) || t(c.seo.description, lang),
    path: pageUrl(lang, p.slug), base, ogImage: p.image || null, alt: LANGS.map((l) => [l, pageUrl(l, p.slug)]),
  }) + body + tail(c, lang);
}

export function render404(c, lang, pages, base) {
  const u = UI[lang];
  const paths = Object.fromEntries(LANGS.map((l) => [l, PREFIX[l]]));
  return head(c, lang, { title: `${u.notFound} | ${t(c.brand.name, lang)}`, description: u.notFoundTxt, path: PREFIX[lang], base, noindex: true }) +
    `${nav(c, lang, pages, false, paths)}<header class="page-hero" style="min-height:50vh"><div class="wrap"><span class="kicker">404</span><h1>${u.notFound}</h1><p class="lead">${u.notFoundTxt}</p><div class="btns"><a class="btn btn-gold" href="${PREFIX[lang]}">${u.home}</a></div></div></header>${chatHtml(c, lang)}${footer(c, lang, pages)}` +
    tail(c, lang);
}
