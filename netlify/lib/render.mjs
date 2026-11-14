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
export const ASSET_V = "11";

function logo(c, lang, id, href, light) {
  const src = light ? c.brand.logoLight || c.brand.logo : c.brand.logo;
  return `<a class="logo" href="${href}" id="${id}">${src ? `<img src="${esc(src)}" alt="${esc(t(c.brand.name, lang))}">` : `<b>${esc(t(c.brand.logoText, lang))}</b><small>${esc(t(c.brand.sub, lang))}</small>`}</a>`;
}

/* ---------- site pages (each has its own link, like SellTo.us) ---------- */
export const SITE_PAGES = ["menu", "delivery", "order", "about", "faq", "contact"];
export const siteUrl_ = (lang, key) => PREFIX[lang] + key;
const CARD_SLUGS = ["wedding-box", "gift-bag", "bride-suitcase", "initials-boxes"];
export const cardSlug = (k, i) => (k.slug && /^[a-z0-9-]+$/.test(k.slug) ? k.slug : CARD_SLUGS[i] || "product-" + (i + 1));
export const productUrl = (lang, slug) => PREFIX[lang] + "product/" + slug;
const visibleCards = (c) => c.products.cards.map((k, i) => ({ ...k, _slug: cardSlug(k, i) })).filter((k) => k.show !== false);
const FT = {
  hy: { pages: "Էջեր", products: "Տեսականի", contact: "Կապ", lang: "Լեզու", home: "Գլխավոր", all: "Տեսնել բոլորը", more: "Մանրամասն", crumbs: "Դուք այստեղ եք" },
  ru: { pages: "Страницы", products: "Ассортимент", contact: "Контакты", lang: "Язык", home: "Главная", all: "Смотреть все", more: "Подробнее", crumbs: "Вы здесь" },
  en: { pages: "Pages", products: "Our gata", contact: "Contact", lang: "Language", home: "Home", all: "See all", more: "Learn more", crumbs: "You are here" },
};

function navLinks(c, lang, pages) {
  const home = PREFIX[lang];
  const links = c.nav.filter((n) => n.show !== false).map((n) => {
    let href = n.href || "#";
    if (href.startsWith("#")) href = home + href;
    else if (href.startsWith("/")) href = PREFIX[lang] + href.slice(1);
    return { href, label: t(n.label, lang), ext: /^https?:/.test(href) };
  });
  if (c.pagesInNav !== false) for (const p of pages.filter((p) => p.published && p.showInNav)) links.push({ href: pageUrl(lang, p.slug), label: t(p.title, lang) });
  return links;
}

function langSwitch(lang, paths) {
  return `<div class="langs" aria-label="Language">${LANGS.map((l) => `<a href="${paths[l]}" hreflang="${l}" lang="${l}"${l === lang ? ' class="on" aria-current="true"' : ""}>${LANG_NAME[l]}</a>`).join("")}</div>`;
}

function nav(c, lang, pages, current, paths) {
  const u = UI[lang];
  const links = navLinks(c, lang, pages);
  const a = (l) => `<a href="${esc(l.href)}"${l.ext ? ' target="_blank" rel="noopener"' : ""}${current && l.href === current ? ' aria-current="page"' : ""}>${esc(l.label)}</a>`;
  return `<nav class="nav" aria-label="${u.main}">
  <div class="wrap">
    ${logo(c, lang, "logo", PREFIX[lang])}
    <ul>${links.map((l) => `<li>${a(l)}</li>`).join("")}</ul>
    <div class="nav-r">
      ${langSwitch(lang, paths)}
      <a class="btn btn-gold" href="${siteUrl_(lang, "order")}">${u.order}</a>
      <button class="burger" id="burger" type="button" aria-label="${u.menu}" aria-expanded="false" aria-controls="mmenu"><span></span></button>
    </div>
  </div>
</nav>
<div class="mmenu" id="mmenu" hidden>${langSwitch(lang, paths).replace('class="langs"', 'class="langs mlangs"')}${links.map(a).join("")}<a href="${siteUrl_(lang, "order")}">${u.order} →</a></div>`;
}

function footer(c, lang, pages, paths) {
  const u = UI[lang], ct = c.contact, F_ = FT[lang], SP = c.sitePages || {};
  const fl = pages.filter((p) => p.published && p.showInFooter);
  const social = [["Instagram", ct.instagram], ["Facebook", ct.facebook], ["TikTok", ct.tiktok], ["Telegram", ct.telegram]].filter((x) => x[1]);
  const tel = (p) => p.replace(/[^\d+]/g, "").replace(/^0/, "+374");
  const li = (href, label) => `<li><a href="${esc(href)}">${esc(label)}</a></li>`;
  return `<footer class="dark">
  <div class="wrap fgrid">
    <div class="fbrand">
      ${logo(c, lang, "logo2", PREFIX[lang], true)}
      <p>${inline(t(ct.address, lang))}${ct.mapUrl ? ` · <a href="${esc(ct.mapUrl)}" target="_blank" rel="noopener">Google Maps</a>` : ""}</p>
    </div>
    <div><div class="fh">${F_.pages}</div><ul class="fl">
      ${li(PREFIX[lang], F_.home)}${SITE_PAGES.map((k) => li(siteUrl_(lang, k), t((SP[k] || {}).nav || (SP[k] || {}).title, lang))).join("")}
      ${fl.map((p) => li(pageUrl(lang, p.slug), t(p.title, lang))).join("")}
    </ul></div>
    <div><div class="fh">${F_.products}</div><ul class="fl">
      ${visibleCards(c).map((k) => li(productUrl(lang, k._slug), t(k.title, lang))).join("")}
    </ul></div>
    <div><div class="fh">${F_.contact}</div><ul class="fl">
      ${ct.phones.map((p) => `<li><a href="tel:${esc(tel(p))}">${esc(p)}</a></li>`).join("")}
      ${ct.whatsapp ? `<li><a href="https://wa.me/${esc(ct.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a></li>` : ""}
      ${social.map(([n, h]) => `<li><a href="${esc(h)}" target="_blank" rel="noopener">${n}</a></li>`).join("")}
      ${ct.email ? `<li><a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a></li>` : ""}
    </ul>
    <div class="fh" style="margin-top:16px">${F_.lang}</div>${langSwitch(lang, paths).replace('class="langs"', 'class="langs flangs"')}</div>
  </div>
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
    menuUrl: PREFIX[lang] + "menu",
    products: c.products.cards.map((k, i) => ({ slug: cardSlug(k, i), title: t(k.title, lang), pack: k.packaging || "", img: k.image })),
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
  hy: { decor: (p) => `Գաթայի ձևավորում՝ ${p} դրամ։ Ձևավորման արժեքը հաշվարկվում է առանձին։`, sizesPrices: "Չափսեր և գներ", from: (p) => `${p} դրամից`, cur: "դրամ", cm: "սմ", packIncluded: "Տուփը ներառված է գնի մեջ", packSeparateBox: "Տուփի արժեքը հաշվարկվում է առանձին", packSeparate: "Փաթեթավորման արժեքը հաշվարկվում է առանձին", packVariable: "Գինը՝ ըստ ընտրված տարբերակի", fixed: (p) => ` (${p} դրամ՝ մեկ հատի համար)`, sizesFact: (s) => `Չափսեր՝ ${s} սմ`, fromFact: (p) => `Գինը՝ ${p} դրամից`, prev: "Նախորդ լուսանկարը", next: "Հաջորդ լուսանկարը", filling: "Միջուկ", deliveryFree: "Առանց առաքման վճարի", deliveryLater: "Առաքման արժեքը՝ ենթակա է ճշտման", orderNow: "Պատվիրել", orderThis: "Պատվիրել այս տարբերակը", allPrices: "Բոլոր գները", deliveryMore: "Առաքման մանրամասներ", aboutMore: "Ավելին մեր մասին", faqMore: "Բոլոր հարցերը", otherProducts: "Այլ տարբերակներ", ctaTitle: "Պատրա՞ստ եք պատվիրելու", ctaText: "Լրացրեք պատվերի ձևը կամ գրեք մեր չատում։", call: "Զանգահարել", write: "Գրել WhatsApp-ով", hoursUnknown: "Աշխատանքային ժամերը և վերցնելու հասցեն ճշտեք զանգահարելով։" },
  ru: { decor: (p) => `Оформление гаты — ${p} драм. Стоимость оформления считается отдельно.`, sizesPrices: "Размеры и цены", from: (p) => `от ${p} драм`, cur: "драм", cm: "см", packIncluded: "Коробка входит в цену", packSeparateBox: "Стоимость коробки считается отдельно", packSeparate: "Стоимость упаковки считается отдельно", packVariable: "Цена — в зависимости от выбранного варианта", fixed: (p) => ` (${p} драм за штуку)`, sizesFact: (s) => `Размеры: ${s} см`, fromFact: (p) => `Цена: от ${p} драм`, prev: "Предыдущее фото", next: "Следующее фото", filling: "Начинка", deliveryFree: "Без оплаты доставки", deliveryLater: "Стоимость доставки уточняется", orderNow: "Заказать", orderThis: "Заказать этот вариант", allPrices: "Все цены", deliveryMore: "Подробнее о доставке", aboutMore: "Подробнее о нас", faqMore: "Все вопросы", otherProducts: "Другие варианты", ctaTitle: "Готовы заказать?", ctaText: "Заполните форму заказа или напишите в чат.", call: "Позвонить", write: "Написать в WhatsApp", hoursUnknown: "Часы работы и адрес самовывоза уточните по телефону." },
  en: { decor: (p) => `Gata decoration — ${p} AMD. The decoration is charged separately.`, sizesPrices: "Sizes and prices", from: (p) => `from ${p} AMD`, cur: "AMD", cm: "cm", packIncluded: "Box included in the price", packSeparateBox: "Box price is charged separately", packSeparate: "Packaging price is charged separately", packVariable: "Price depends on the chosen option", fixed: (p) => ` (${p} AMD each)`, sizesFact: (s) => `Sizes: ${s} cm`, fromFact: (p) => `From ${p} AMD`, prev: "Previous photo", next: "Next photo", filling: "Filling", deliveryFree: "No delivery fee", deliveryLater: "Delivery price to be confirmed", orderNow: "Order", orderThis: "Order this option", allPrices: "All prices", deliveryMore: "Delivery details", aboutMore: "More about us", faqMore: "All questions", otherProducts: "Other options", ctaTitle: "Ready to order?", ctaText: "Fill in the order form or message us in the chat.", call: "Call", write: "Message on WhatsApp", hoursUnknown: "Please call to check opening hours and the pickup address." },
};
const num = (n) => (+n || 0).toLocaleString("en-US").replace(/,/g, " ");
const allPaths = (fn) => Object.fromEntries(LANGS.map((l) => [l, fn(l)]));
const more = (href, label) => `<p class="more"><a class="btn btn-line" href="${esc(href)}">${esc(label)} →</a></p>`;
function priceData(c) {
  const m = c.menu, sizes = m.sizes, shown = m.fillings.filter((f) => f.show !== false);
  const minAt = (i) => Math.min(...shown.map((f) => +f.prices[i] || Infinity));
  return { sizes, shown, minAt, minAll: Math.min(...sizes.map((s, i) => minAt(i))) };
}
function packNoteOf(c, lang, k) {
  const H = HL[lang], packs = packsOf(c);
  if (k.packNote === "included") return H.packIncluded;
  if (k.packNote === "variable") return H.packVariable;
  const pk = packs.find((p) => p.id === k.packaging);
  if (k.packaging === "wrap" && pk && pk.price > 0) return H.decor(num(pk.price));
  return (k.packaging === "box" ? H.packSeparateBox : H.packSeparate) + (pk && pk.price > 0 ? H.fixed(num(pk.price)) : "");
}
const secHead = (kicker, title, lead, tag = "h2") => `<div class="sec-head">${kicker ? `<span class="kicker">${esc(kicker)}</span>` : ""}<${tag} class="h2">${esc(title)}</${tag}>${lead ? `<p class="lead">${inline(lead)}</p>` : ""}</div>`;

function heroHtml(c, lang) {
  const pearl = (x, y, sz, d) => `<span class="pearl" style="--x:${x}%;--y:${y}%;--s:${sz}px;--d:${d}"></span>`;
  const ringTxt = `${t(c.brand.logoText, lang)} · ${t(c.brand.sub, lang).toUpperCase().replace(/\s*·\s*/g, " · ")} · `;
  const hint = { hy: "Պտտեք գաթան", ru: "Покрутите гату", en: "Spin the gata" }[lang];
  return `<header class="hero" id="top">
  <div class="wrap hero-grid">
    <div class="hero-text">
      <span class="kicker load">${esc(t(c.hero.title, lang))} · ${esc(t(c.brand.sub, lang).split("·")[0].trim())}</span>
      <h1 class="load d1">${esc(t(c.hero.kicker, lang))}</h1>
      <p class="lead load d2">${inline(t(c.hero.lead, lang))}</p>
      <div class="btns hero-btns load d3" data-avoid>
        <a class="btn btn-gold" href="${siteUrl_(lang, "order")}">${esc(t(c.hero.btnOrder, lang))}</a>
        <a class="btn btn-line" href="${siteUrl_(lang, "menu")}">${esc(t(c.hero.btnMenu, lang))}</a>
      </div>
    </div>
    <div class="hero-stage load" id="heroStage">
      <div class="hero-glow" aria-hidden="true"></div>
      <svg class="hero-ring" id="heroRing" viewBox="0 0 400 400" aria-hidden="true"><defs><path id="ringPath" d="M200,200 m-176,0 a176,176 0 1,1 352,0 a176,176 0 1,1 -352,0"/></defs>
        <circle cx="200" cy="200" r="194" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="2 7"/>
        <text><textPath href="#ringPath" textLength="1100" lengthAdjust="spacing">${esc(ringTxt + ringTxt)}</textPath></text></svg>
      <div class="hero-tilt" id="heroTilt"><div class="hero-gata" id="heroGata" role="img" aria-label="${esc(t(c.hero.alt, lang))}"><img src="${esc(c.hero.image)}" alt="" width="600" height="600" fetchpriority="high" draggable="false"></div></div>
      <div class="orbit" aria-hidden="true">${pearl(50, -2, 26, 1.6)}${pearl(98, 50, 18, 2.2)}${pearl(50, 98, 30, 1.2)}${pearl(-2, 50, 16, 2.6)}</div>
      <div class="orbit o2" aria-hidden="true">${pearl(14, 14, 14, 1.9)}${pearl(86, 86, 22, 2.8)}${pearl(86, 14, 12, 1.4)}</div>
      <span class="spin-hint" id="spinHint" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>${hint}</span>
    </div>
  </div>
</header>
${c.expand && c.expand.show !== false && c.expand.image ? `<section class="expand" id="expand" aria-label="${esc(t(c.expand.title, lang))}">
  <div class="sticky">
    <div class="frame" id="expFrame">
      <img id="expImg" src="${esc(c.expand.image)}" alt="${esc(t(c.expand.title, lang))}" loading="lazy">
      <div class="cap" id="expCap"><h2>${esc(t(c.expand.title, lang))}</h2><p>${esc(t(c.expand.text, lang))}</p></div>
    </div>
  </div>
</section>` : ""}`;
}

function orderHero(c, lang, title, lead) {
  const sizes = ((c.menu || {}).sizes || []).map((z) => z.cm);
  const OH = {
    hy: { yours: "Ձեր գաթան", size: "Ընտրեք չափը", cm: "սմ", steps: ["Ընտրեք գաթան", "Նշեք օրը", "Ուղարկեք պատվերը"] },
    ru: { yours: "Ваша гата", size: "Выберите размер", cm: "см", steps: ["Выберите гату", "Укажите день", "Отправьте заказ"] },
    en: { yours: "Your gata", size: "Pick a size", cm: "cm", steps: ["Choose your gata", "Pick the day", "Send the order"] },
  }[lang];
  const angles = sizes.length === 1 ? [-35] : sizes.map((_, i) => -70 + (70 / (sizes.length - 1)) * i);
  const sizeBtns = sizes.map((cm, i) => { const a = (angles[i] * Math.PI) / 180, x = 50 + 49 * Math.cos(a), y = 50 + 49 * Math.sin(a);
    return `<button type="button" class="szb" data-size="${i}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%" aria-pressed="false">${cm}<small>${OH.cm}</small></button>`; }).join("");
  const pearl = (x, y, sz, d) => `<span class="pearl" style="--x:${x}%;--y:${y}%;--s:${sz}px;--d:${d}"></span>`;
  return `<header class="order-hero">
  <div class="wrap oh-grid">
    <div class="oh-text">
      <h1 class="load">${esc(title)}</h1>
      ${lead ? `<p class="lead load d1">${inline(lead)}</p>` : ""}
      <ol class="oh-steps load d2">${OH.steps.map((s, i) => `<li><i>${i + 1}</i>${esc(s)}</li>`).join("")}</ol>
    </div>
    <div class="oh-visual load d1">
      <div class="hero-stage oh-stage" id="heroStage" data-order>
        <div class="hero-glow" aria-hidden="true"></div>
        <svg class="hero-ring" id="heroRing" viewBox="0 0 400 400" aria-hidden="true"><defs><path id="ringPath" d="M200,200 m-170,0 a170,170 0 1,1 340,0 a170,170 0 1,1 -340,0"/></defs>
          <circle cx="200" cy="200" r="192" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="2 7"/>
          <text><textPath href="#ringPath" id="ringText" textLength="1060" lengthAdjust="spacing">${esc((t(c.brand.logoText, lang) + " · ").repeat(3))}</textPath></text></svg>
        <div class="hero-tilt" id="heroTilt"><div class="oh-scale" id="ohScale"><div class="hero-gata" id="heroGata" role="img" aria-label="${esc(OH.yours)}"><img src="${esc(c.hero.image)}" alt="" width="600" height="600" draggable="false"></div></div></div>
        <div class="orbit" aria-hidden="true">${pearl(50, -2, 22, 1.6)}${pearl(-2, 50, 14, 2.6)}${pearl(50, 98, 26, 1.2)}</div>
        <div class="oh-sizes" role="group" aria-label="${esc(OH.size)}">${sizeBtns}</div>
      </div>
      <p class="oh-cap" id="ohCap" aria-live="polite"><small>${esc(OH.yours)}</small><b id="ohCapT"></b></p>
    </div>
  </div>
</header>`;
}

function cardsHtml(c, lang, list) {
  const H = HL[lang], { sizes, minAt } = priceData(c);
  return `<div class="products">
      ${list.map((k) => `<article class="card" data-avoid>
        <a class="pic" href="${productUrl(lang, k._slug)}" tabindex="-1" aria-hidden="true"><img src="${esc(k.image)}" alt="" loading="lazy" width="400" height="400"></a>
        <div class="body">
          <span class="tag">${esc(t(k.tag, lang))}</span>
          <h3><a href="${productUrl(lang, k._slug)}">${esc(t(k.title, lang))}</a></h3>
          <p>${inline(t(k.text, lang))}</p>
          <div class="sp"><b>${H.sizesPrices}</b><ul>${sizes.map((s, i) => isFinite(minAt(i)) ? `<li><span>${s.cm} ${H.cm}</span><span>${esc(H.from(num(minAt(i))))}</span></li>` : "").join("")}</ul></div>
          <p class="packnote">${esc(packNoteOf(c, lang, k))}</p>
        </div>
        <div class="act"><a class="btn btn-gold" data-avoid href="${siteUrl_(lang, "order")}?product=${esc(k._slug)}">${esc(t(c.products.btn, lang))}</a></div>
      </article>`).join("\n      ")}
    </div>`;
}

function priceTableHtml(c, lang) {
  const H = HL[lang], { sizes, shown } = priceData(c);
  return `<div class="price-table">
      <h3>${esc(t(c.products.pricesTitle, lang))}</h3>
      <div class="pt-scroll"><table>
        <caption>${H.cur}</caption>
        <thead><tr><th scope="col">${H.filling}</th>${sizes.map((s) => `<th scope="col">${s.cm} ${H.cm}</th>`).join("")}</tr></thead>
        <tbody>${shown.map((f) => `<tr><th scope="row">${esc(t(f.short, lang))}</th>${sizes.map((s, i) => `<td>${num(f.prices[i])}</td>`).join("")}</tr>`).join("")}</tbody>
      </table></div>
      <p class="note">${esc(t(c.products.pricesNote, lang))}</p>
    </div>`;
}

function deliveryCards(c, lang) {
  const H = HL[lang];
  return `<div class="deliv">
      ${c.delivery.options.filter((d) => d.show !== false).map((d) => `<div class="dcard"><h3>${esc(t(d.label, lang))}</h3><p class="fee">${d.price > 0 ? num(d.price) + " " + H.cur : d.price < 0 ? H.deliveryLater : H.deliveryFree}</p>${t(d.note, lang) ? `<p>${esc(t(d.note, lang))}</p>` : ""}</div>`).join("\n      ")}
    </div>`;
}

function storyHtml(c, lang, { gallery = true, button = true, tag = "h2" } = {}) {
  const H = HL[lang], gal = c.gallery.images;
  const igLink = c.contact.instagram ? `<a href="${esc(c.contact.instagram)}" target="_blank" rel="noopener">${esc(c.contact.instagramHandle || "Instagram")}</a>` : "";
  return `<section class="section dark" id="story">
  <div class="wrap story">
    <div class="photo"><img src="${esc(c.story.image)}" alt="${esc(t(c.story.title, lang))}" loading="lazy" width="600" height="750"></div>
    <div>
      <span class="kicker">${esc(t(c.story.kicker, lang))}</span>
      <${tag}>${esc(t(c.story.title, lang))}</${tag}>
      <p>${inline(t(c.story.p1, lang))}</p>
      ${t(c.story.p2, lang) ? `<p>${inline(t(c.story.p2, lang))}</p>` : ""}
      <div class="btns on-dark" data-avoid>${button ? `<a class="btn btn-gold" href="${siteUrl_(lang, "about")}">${H.aboutMore}</a>` : `<a class="btn btn-gold" href="${siteUrl_(lang, "order")}">${H.orderNow}</a>`}${c.contact.instagram ? `<a class="btn btn-line" href="${esc(c.contact.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ""}</div>
    </div>
  </div>
  ${gallery ? `<div class="wrap" id="gallery">
    <div class="gal-head"><h3>${esc(t(c.gallery.title, lang))}</h3><p>${esc(t(c.gallery.lead, lang))} ${igLink}</p>
      <div class="gal-nav" data-avoid><button type="button" class="gbtn" data-dir="-1" aria-label="${H.prev}">‹</button><button type="button" class="gbtn" data-dir="1" aria-label="${H.next}">›</button></div></div>
    <div class="gal" id="gal" tabindex="0" aria-label="${esc(t(c.gallery.title, lang))}">
      ${gal.map((i) => `<img src="${esc(i.src)}" alt="${esc(t(i.alt, lang))}" loading="lazy" width="400" height="400">`).join("")}
    </div>
  </div>` : ""}
</section>`;
}

function faqList(c, lang, limit) {
  const items = limit ? c.faq.items.slice(0, limit) : c.faq.items;
  return `<div class="faq">
      ${items.map((f) => `<details class="qa" data-avoid><summary>${esc(t(f.q, lang))}</summary><p>${inline(t(f.a, lang))}</p></details>`).join("\n      ")}
    </div>`;
}

function ctaHtml(c, lang) {
  const H = HL[lang];
  return `<section class="section cta"><div class="wrap cta-box"><div><h2 class="h2">${H.ctaTitle}</h2><p class="lead">${H.ctaText}</p></div><div class="btns" data-avoid><a class="btn btn-gold" href="${siteUrl_(lang, "order")}">${H.orderNow}</a><a class="btn btn-line" href="${siteUrl_(lang, "contact")}">${esc(FT[lang].contact)}</a></div></div></section>`;
}

function contactBlock(c, lang) {
  const H = HL[lang], ct = c.contact;
  const tel = (p) => p.replace(/[^\d+]/g, "").replace(/^0/, "+374");
  return `<div class="contact-grid">
    <div class="ccard"><h3>${FT[lang].contact}</h3>
      <ul class="clist">${ct.phones.map((p) => `<li><a href="tel:${esc(tel(p))}">${esc(p)}</a></li>`).join("")}</ul>
      <div class="btns" data-avoid>${ct.phones[0] ? `<a class="btn btn-gold" href="tel:${esc(tel(ct.phones[0]))}">${H.call}</a>` : ""}${ct.whatsapp ? `<a class="btn btn-line" href="https://wa.me/${esc(ct.whatsapp)}" target="_blank" rel="noopener">${H.write}</a>` : ""}</div>
    </div>
    <div class="ccard"><h3>${esc(UI[lang].address)}</h3><p>${inline(t(ct.address, lang))}</p><p class="note">${H.hoursUnknown}</p>${ct.mapUrl ? `<p><a href="${esc(ct.mapUrl)}" target="_blank" rel="noopener">Google Maps</a></p>` : ""}</div>
    <div class="ccard"><h3>Instagram</h3>${ct.instagram ? `<p><a href="${esc(ct.instagram)}" target="_blank" rel="noopener">${esc(ct.instagramHandle || "Instagram")}</a></p>` : ""}${ct.email ? `<p><a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a></p>` : ""}</div>
  </div>`;
}

function crumbs(lang, items) {
  return `<nav class="crumbs wrap" aria-label="${FT[lang].crumbs}"><a href="${PREFIX[lang]}">${FT[lang].home}</a>${items.map(([h, l]) => h ? ` <span aria-hidden="true">›</span> <a href="${esc(h)}">${esc(l)}</a>` : ` <span aria-hidden="true">›</span> <span aria-current="page">${esc(l)}</span>`).join("")}</nav>`;
}
function crumbLd(base, lang, items) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [[PREFIX[lang], FT[lang].home], ...items].map(([h, n], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: base + h })) };
}

export function renderHome(c, lang, pages, base) {
  const H = HL[lang], SP = c.sitePages || {};
  const paths = allPaths((l) => PREFIX[l]);
  const body = `
${nav(c, lang, pages, PREFIX[lang], paths)}
${heroHtml(c, lang)}
<section class="section" id="products">
  <div class="wrap">
    ${secHead(t(c.products.kicker, lang), t(c.products.title, lang), t(c.products.lead, lang))}
    ${cardsHtml(c, lang, visibleCards(c))}
    ${more(siteUrl_(lang, "menu"), H.allPrices)}
  </div>
</section>
<section class="section alt" id="delivery">
  <div class="wrap">
    ${secHead(t(c.deliveryInfo.kicker, lang), t(c.deliveryInfo.title, lang), t(c.deliveryInfo.lead, lang))}
    ${deliveryCards(c, lang)}
    ${more(siteUrl_(lang, "delivery"), H.deliveryMore)}
  </div>
</section>
${storyHtml(c, lang)}
<section class="section" id="faq">
  <div class="wrap">
    ${secHead(t(c.faq.kicker, lang), t(c.faq.title, lang))}
    ${faqList(c, lang, 3)}
    ${more(siteUrl_(lang, "faq"), H.faqMore)}
  </div>
</section>
${ctaHtml(c, lang)}
${chatHtml(c, lang)}
${footer(c, lang, pages, paths)}`;
  return head(c, lang, {
    title: t(c.seo.title, lang), description: t(c.seo.description, lang), path: PREFIX[lang], base,
    jsonld: jsonLd(c, lang, base), alt: LANGS.map((l) => [l, PREFIX[l]]),
  }) + body + tail(c, lang);
}

/* one of the main pages: /menu /delivery /order /about /faq /contact */
export function renderSitePage(c, lang, key, pages, base) {
  const H = HL[lang], sp = (c.sitePages || {})[key] || {};
  const url = siteUrl_(lang, key), paths = allPaths((l) => siteUrl_(l, key));
  const title = t(sp.title, lang), lead = t(sp.lead, lang);
  let main = "", ld = [crumbLd(base, lang, [[url, title]])];
  if (key === "menu") {
    main = `<section class="section"><div class="wrap">${cardsHtml(c, lang, visibleCards(c))}${priceTableHtml(c, lang)}</div></section>
<section class="section alt"><div class="wrap">${secHead(t(c.deliveryInfo.kicker, lang), t(c.deliveryInfo.title, lang), t(c.deliveryInfo.lead, lang))}${deliveryCards(c, lang)}</div></section>${ctaHtml(c, lang)}`;
    ld.push(jsonLd(c, lang, base)[0]);
  } else if (key === "delivery") {
    main = `<section class="section"><div class="wrap">${deliveryCards(c, lang)}<div class="advice-box"><p class="advice"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>${inline(t(c.hero.advice, lang))}</span></p></div></div></section>
<section class="section alt"><div class="wrap">${secHead("", t(c.faq.title, lang))}${faqList(c, lang)}</div></section>${ctaHtml(c, lang)}`;
  } else if (key === "order") {
    main = `<section class="section order" id="order"><div class="wrap"><form class="box" id="f" novalidate></form></div></section>`;
  } else if (key === "about") {
    main = `${storyHtml(c, lang, { button: false })}${ctaHtml(c, lang)}`;
  } else if (key === "faq") {
    main = `<section class="section"><div class="wrap">${faqList(c, lang)}</div></section>${ctaHtml(c, lang)}`;
    ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: c.faq.items.map((f) => ({ "@type": "Question", name: t(f.q, lang), acceptedAnswer: { "@type": "Answer", text: t(f.a, lang) } })) });
  } else if (key === "contact") {
    main = `<section class="section"><div class="wrap">${contactBlock(c, lang)}</div></section>${ctaHtml(c, lang)}`;
  }
  const body = `
${nav(c, lang, pages, url, paths)}
${crumbs(lang, [[null, title]])}
${key === "order" ? orderHero(c, lang, title, lead) : `<header class="page-hero"><div class="wrap">${sp.kicker ? `<span class="kicker">${esc(t(sp.kicker, lang))}</span>` : ""}<h1>${esc(title)}</h1>${lead ? `<p class="lead">${inline(lead)}</p>` : ""}</div></header>`}
${main}
${chatHtml(c, lang)}
${footer(c, lang, pages, paths)}`;
  return head(c, lang, {
    title: `${title} | ${t(c.brand.name, lang)}`, description: t(sp.seo, lang) || lead || t(c.seo.description, lang),
    path: url, base, jsonld: ld, alt: LANGS.map((l) => [l, siteUrl_(l, key)]), noindex: key === "order" ? false : false,
  }) + body + tail(c, lang);
}

/* one page per product card: /product/<slug> */
export function renderProduct(c, lang, slug, pages, base) {
  const list = visibleCards(c), k = list.find((x) => x._slug === slug);
  if (!k) return null;
  const H = HL[lang], { sizes, shown, minAt, minAll } = priceData(c);
  const url = productUrl(lang, slug), paths = allPaths((l) => productUrl(l, slug));
  const title = t(k.title, lang), menuT = t(((c.sitePages || {}).menu || {}).title, lang);
  const others = list.filter((x) => x._slug !== slug);
  const body = `
${nav(c, lang, pages, siteUrl_(lang, "menu"), paths)}
${crumbs(lang, [[siteUrl_(lang, "menu"), menuT], [null, title]])}
<section class="section product-page"><div class="wrap pgrid">
  <div class="pimg"><img src="${esc(k.image)}" alt="${esc(title)}" width="700" height="700"></div>
  <div class="pinfo">
    <span class="kicker">${esc(t(k.tag, lang))}</span>
    <h1>${esc(title)}</h1>
    <p class="lead">${inline(t(k.text, lang))}</p>
    <div class="sp big"><b>${H.sizesPrices}</b><ul>${sizes.map((s, i) => isFinite(minAt(i)) ? `<li><span>${s.cm} ${H.cm}</span><span>${esc(H.from(num(minAt(i))))}</span></li>` : "").join("")}</ul></div>
    <p class="packnote">${esc(packNoteOf(c, lang, k))}</p>
    <div class="btns" data-avoid><a class="btn btn-gold" href="${siteUrl_(lang, "order")}?product=${esc(slug)}">${H.orderThis}</a><a class="btn btn-line" href="${siteUrl_(lang, "menu")}">${H.allPrices}</a></div>
    <p class="advice"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>${inline(t(c.hero.advice, lang))}</span></p>
  </div>
</div>
<div class="wrap">${priceTableHtml(c, lang)}</div></section>
<section class="section alt"><div class="wrap">${secHead("", t(c.deliveryInfo.title, lang))}${deliveryCards(c, lang)}</div></section>
${others.length ? `<section class="section"><div class="wrap">${secHead("", H.otherProducts)}${cardsHtml(c, lang, others)}</div></section>` : ""}
${chatHtml(c, lang)}
${footer(c, lang, pages, paths)}`;
  const ld = [crumbLd(base, lang, [[siteUrl_(lang, "menu"), menuT], [url, title]]), {
    "@context": "https://schema.org", "@type": "Product", name: title, description: t(k.text, lang), image: base + k.image, brand: { "@type": "Brand", name: t(c.brand.name, lang) },
    offers: { "@type": "AggregateOffer", priceCurrency: "AMD", lowPrice: String(minAll), highPrice: String(Math.max(...shown.flatMap((f) => f.prices.map(Number)))), offerCount: shown.length * sizes.length },
  }];
  return head(c, lang, { title: `${title} | ${t(c.brand.name, lang)}`, description: `${t(k.text, lang)} ${H.fromFact(num(minAll))}.`, path: url, base, ogImage: k.image, jsonld: ld, alt: LANGS.map((l) => [l, productUrl(l, slug)]) }) + body + tail(c, lang);
}

export function renderPage(c, lang, p, pages, base) {
  const paths = allPaths((l) => pageUrl(l, p.slug));
  const title = t(p.title, lang);
  const body = `
${nav(c, lang, pages, pageUrl(lang, p.slug), paths)}
${crumbs(lang, [[null, title]])}
<header class="page-hero"><div class="wrap">${p.kicker ? `<span class="kicker">${esc(t(p.kicker, lang))}</span>` : ""}<h1>${esc(title)}</h1></div></header>
${p.image ? `<div class="wrap" style="max-width:960px"><img src="${esc(p.image)}" alt="${esc(title)}" style="border-radius:var(--r);box-shadow:var(--shadow);width:100%;max-height:520px;object-fit:cover"></div>` : ""}
<article class="prose">${md(t(p.body, lang))}</article>
${chatHtml(c, lang)}
${footer(c, lang, pages, paths)}`;
  return head(c, lang, {
    title: `${title} | ${t(c.brand.name, lang)}`, description: t(p.seoDescription, lang) || t(c.seo.description, lang),
    path: pageUrl(lang, p.slug), base, ogImage: p.image || null, alt: LANGS.map((l) => [l, pageUrl(l, p.slug)]),
  }) + body + tail(c, lang);
}

export function render404(c, lang, pages, base) {
  const u = UI[lang];
  const paths = allPaths((l) => PREFIX[l]);
  return head(c, lang, { title: `${u.notFound} | ${t(c.brand.name, lang)}`, description: u.notFoundTxt, path: PREFIX[lang], base, noindex: true }) +
    `${nav(c, lang, pages, "", paths)}<header class="page-hero" style="min-height:50vh"><div class="wrap"><span class="kicker">404</span><h1>${u.notFound}</h1><p class="lead">${u.notFoundTxt}</p><div class="btns"><a class="btn btn-gold" href="${PREFIX[lang]}">${u.home}</a><a class="btn btn-line" href="${siteUrl_(lang, "menu")}">${esc(t(((c.sitePages || {}).menu || {}).title, lang))}</a></div></div></header>${chatHtml(c, lang)}${footer(c, lang, pages, paths)}` +
    tail(c, lang);
}
