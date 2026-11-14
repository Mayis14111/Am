/* Garnu Gata admin panel */
(() => {
const $app = document.getElementById("app");
const LANGS = ["hy", "ru", "en"];
const LN = { hy: "ՀԱՅ", ru: "RU", en: "EN" };
const STATUS = { new: "New", confirmed: "Confirmed", baking: "Baking", ready: "Ready", delivered: "Delivered", cancelled: "Cancelled" };
const PAYST = { none: "Pay on receipt", pending: "Waiting payment", processing: "Processing", completed: "Paid", failed: "Failed", expired: "Expired", refunded: "Refunded" };
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => (+n || 0).toLocaleString("en-US").replace(/,/g, " ") + " ֏";
const tx = (v, l = "hy") => (v == null ? "" : typeof v === "object" ? v[l] || v.hy || v.en || "" : String(v));
const clone = (o) => JSON.parse(JSON.stringify(o));
const today = () => new Date(Date.now() + 4 * 3600e3).toISOString().slice(0, 10);

function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (k === "value") e.value = v;
    else if (k === "checked") e.checked = !!v;
    else e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
}
function toast(msg, bad) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.className = "toast" + (bad ? " bad" : ""); t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), bad ? 5000 : 2600);
}
async function api(path, opts = {}) {
  const o = { method: opts.method || "GET", headers: {} };
  if (opts.body !== undefined) {
    if (opts.raw) { o.body = opts.body; o.headers["content-type"] = opts.type; if (opts.name) o.headers["x-file-name"] = encodeURIComponent(opts.name); }
    else { o.body = JSON.stringify(opts.body); o.headers["content-type"] = "application/json"; }
  }
  const r = await fetch("/api/admin/" + path, o);
  let j = {}; try { j = await r.json(); } catch {}
  if (r.status === 401 && path !== "login" && path !== "verify") { showLogin(); throw new Error("Please log in again"); }
  if (!r.ok) throw new Error(j.error || "Error " + r.status);
  return j;
}
const busy = async (btn, fn) => { const t = btn.textContent; btn.disabled = true; btn.textContent = "…"; try { return await fn(); } catch (e) { toast(e.message, true); } finally { btn.disabled = false; btn.textContent = t; } };

/* =============== login =============== */
function showLogin() {
  $app.innerHTML = "";
  let nonce = null;
  const pw = el("input", { type: "password", placeholder: "Password", autocomplete: "current-password", required: true });
  const code = el("input", { type: "text", inputmode: "numeric", class: "code", placeholder: "••••••", maxlength: 6, autocomplete: "one-time-code" });
  const msg = el("p", { class: "small muted" });
  const btn = el("button", { class: "btn gold", type: "submit" }, "Continue");
  const step2 = el("div", { class: "grid", hidden: true }, el("p", { class: "small" }, "We sent a 6-digit code to your Telegram (@GarnuGataBot). Type it here:"), code);
  const f = el("form", { onsubmit: async (e) => {
    e.preventDefault(); msg.textContent = "";
    await busy(btn, async () => {
      if (!nonce) {
        const j = await api("login", { method: "POST", body: { password: pw.value } });
        nonce = j.nonce; pw.parentNode.hidden = true; step2.hidden = false; btn.textContent = "Log in"; code.focus();
      } else {
        await api("verify", { method: "POST", body: { nonce, code: code.value } });
        start();
      }
    }).catch(() => {});
    if (nonce && step2.hidden === false) btn.textContent = "Log in";
  } },
    el("label", { class: "f" }, "Admin password", pw), step2, btn, msg,
  );
  $app.append(el("div", { class: "login" }, el("div", { class: "card" }, el("div", { class: "logo" }, "ԳԱՌՆՈՒ ԳԱԹԱ", el("small", {}, "ADMIN")), f)));
  pw.focus();
}

/* =============== state =============== */
let C = null, DEF = null, saved = "", ORDERS = null, STATUS_INFO = null, PAGES = null;
const dirty = () => C && JSON.stringify(C) !== saved;
async function loadContent() { const j = await api("content"); C = j.content; DEF = j.defaults; saved = JSON.stringify(C); }
async function saveContent(btn) {
  await busy(btn, async () => { const j = await api("content", { method: "PUT", body: { content: C } }); C = j.content; saved = JSON.stringify(C); toast("Saved ✓ The website is updated."); updateSaveBar(); });
}
addEventListener("beforeunload", (e) => { if (dirty()) { e.preventDefault(); e.returnValue = ""; } });

/* =============== layout =============== */
const NAV = [
  ["dashboard", "📊", "Dashboard"], ["orders", "🧾", "Orders"], ["customers", "👥", "Customers"], null,
  ["menu", "🥐", "Menu & prices"], ["delivery", "🚗", "Delivery"], ["home", "🏠", "Homepage"], ["photos", "🖼️", "Photos"], ["pages", "📄", "Pages"], ["links", "🔗", "Links & contacts"], ["faq", "❓", "FAQ"], ["chat", "💬", "Chat assistant"], ["seo", "🔎", "SEO & Google"], null,
  ["payments", "💳", "Online payments"], ["settings", "⚙️", "Settings"], ["ai", "✨", "AI helper"],
];
let side, main, newCount = 0;
function shell() {
  $app.innerHTML = "";
  side = el("nav", { class: "side" });
  main = el("main", { class: "main" });
  const mtop = el("div", { class: "mtop" }, el("button", { onclick: () => side.classList.toggle("open") }, "☰"), el("b", {}, "GARNU GATA"), el("a", { href: "/", target: "_blank", style: "color:#e6c27e;font-size:13px" }, "View site ↗"));
  $app.append(mtop, el("div", { class: "shell" }, side, main));
  drawSide();
  addEventListener("hashchange", route);
  document.addEventListener("click", (e) => { if (side.classList.contains("open") && !side.contains(e.target) && !mtop.contains(e.target)) side.classList.remove("open"); });
}
function drawSide() {
  const cur = (location.hash.slice(1) || "dashboard").split("/")[0];
  side.innerHTML = "";
  side.append(el("div", { class: "brand" }, "ԳԱՌՆՈՒ ԳԱԹԱ", el("small", {}, "ADMIN PANEL")));
  for (const n of NAV) {
    if (!n) { side.append(el("div", { class: "sep" })); continue; }
    side.append(el("a", { href: "#" + n[0], class: cur === n[0] ? "on" : "", onclick: () => side.classList.remove("open") }, n[1], " ", n[2], n[0] === "orders" && newCount ? el("span", { class: "n" }, newCount) : null));
  }
  side.append(el("div", { class: "bottom" }, el("div", { class: "sep" }),
    el("a", { href: "/", target: "_blank" }, "🌐 View website ↗"),
    el("a", { href: "#", onclick: async (e) => { e.preventDefault(); if (dirty() && !confirm("You have unsaved changes. Log out anyway?")) return; await api("logout", { method: "POST" }).catch(() => {}); saved = JSON.stringify(C); showLogin(); } }, "🚪 Log out")));
}
const VIEWS = {};
async function route() {
  const [v, arg] = (location.hash.slice(1) || "dashboard").split("/");
  drawSide();
  main.innerHTML = "";
  const fn = VIEWS[v] || VIEWS.dashboard;
  try { await fn(arg); } catch (e) { main.append(el("div", { class: "card bad" }, e.message)); }
  scrollTo(0, 0);
}
function top(title, ...right) { main.append(el("div", { class: "top" }, el("h1", {}, title), ...right)); }

/* =============== field builders =============== */
let saveBar;
function updateSaveBar() { if (saveBar) saveBar.hidden = !dirty(); }
function contentPage(title, intro, build) {
  top(title);
  if (intro) main.append(el("div", { class: "help", style: "margin-bottom:16px", html: intro }));
  const body = el("div", { class: "sec" });
  main.append(body);
  build(body);
  const btn = el("button", { class: "btn gold", onclick: () => saveContent(btn) }, "💾 Save changes");
  const undo = el("button", { class: "btn", onclick: () => { C = JSON.parse(saved); route(); } }, "Undo");
  saveBar = el("div", { class: "savebar", hidden: true }, el("span", { class: "dirty" }, "You have unsaved changes"), undo, btn);
  main.append(saveBar);
  main.addEventListener("input", updateSaveBar); main.addEventListener("change", updateSaveBar);
}
async function translate(obj, key, btn) {
  const src = obj[key] && obj[key].hy;
  if (!src) return toast("Write the Armenian text first", true);
  await busy(btn, async () => {
    const j = await api("ai", { method: "POST", body: { task: "translate", text: src, from: "hy", to: ["ru", "en"] } });
    obj[key] = { ...obj[key], ...j.result };
    btn.closest(".ml").querySelectorAll("[data-l]").forEach((i) => { if (i.dataset.l !== "hy") i.value = obj[key][i.dataset.l] || ""; });
    updateSaveBar(); toast("Translated ✓ Please check it.");
  });
}
function Lf(obj, key, label, opts = {}) {
  if (!obj[key] || typeof obj[key] !== "object") obj[key] = { hy: obj[key] || "", ru: "", en: "" };
  const wrap = el("div", { class: "ml" });
  const tb = el("button", { class: "btn sm", type: "button", title: "Fill Russian and English from Armenian", onclick: (e) => translate(obj, key, e.currentTarget) }, "✨ Translate");
  wrap.append(el("div", { class: "fieldhead" }, label, tb));
  for (const l of LANGS) {
    const inp = el(opts.area ? "textarea" : "input", { type: "text", "data-l": l, value: obj[key][l] || "", rows: opts.rows || 3, oninput: (e) => { obj[key][l] = e.target.value; } });
    wrap.append(el("div", { class: "lr" }, el("span", {}, LN[l]), inp));
  }
  if (opts.hint) wrap.append(el("div", { class: "small muted" }, opts.hint));
  return wrap;
}
function Tf(obj, key, label, opts = {}) {
  const inp = el(opts.area ? "textarea" : "input", { type: opts.type || "text", value: obj[key] ?? "", placeholder: opts.ph || "", oninput: (e) => { obj[key] = opts.type === "number" ? (e.target.value === "" ? 0 : +e.target.value) : e.target.value; } });
  return el("label", { class: "f" }, label, inp, opts.hint ? el("span", { class: "small muted", style: "font-weight:400" }, opts.hint) : null);
}
function Bf(obj, key, label, hint) {
  return el("div", {}, el("label", { class: "check" }, el("input", { type: "checkbox", checked: obj[key] !== false, onchange: (e) => { obj[key] = e.target.checked; } }), label), hint ? el("div", { class: "small muted", style: "margin-left:26px" }, hint) : null);
}
function If(obj, key, label) {
  const img = el("img", { src: obj[key] || "", alt: "" });
  const pick = el("button", { class: "btn sm", type: "button", onclick: () => mediaPicker((url) => { obj[key] = url; img.src = url; updateSaveBar(); }) }, "Change photo");
  return el("div", { class: "f" }, el("div", { class: "fieldhead" }, label), el("div", { class: "imgf" }, img, el("div", { class: "btns" }, pick, el("span", { class: "small muted" }, obj[key] ? obj[key].split("/").pop() : "No photo"))));
}
function Lst(arr, title, render, make, opts = {}) {
  const box = el("div", { class: "grid" });
  const draw = () => {
    box.innerHTML = "";
    arr.forEach((it, i) => {
      const head = el("div", { class: "ih" }, el("b", {}, `${opts.name || "Item"} ${i + 1}${opts.label ? " · " + opts.label(it) : ""}`),
        el("button", { class: "btn sm", type: "button", title: "Move up", disabled: i === 0, onclick: () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; draw(); updateSaveBar(); } }, "↑"),
        el("button", { class: "btn sm", type: "button", title: "Move down", disabled: i === arr.length - 1, onclick: () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; draw(); updateSaveBar(); } }, "↓"),
        el("button", { class: "btn sm red", type: "button", onclick: () => { if (confirm("Remove this?")) { arr.splice(i, 1); draw(); updateSaveBar(); } } }, "Remove"));
      box.append(el("div", { class: "item" }, head, render(it, i)));
    });
    if (make) box.append(el("div", {}, el("button", { class: "btn", type: "button", onclick: () => { arr.push(make()); draw(); updateSaveBar(); } }, "+ Add " + (opts.name || "item").toLowerCase())));
  };
  draw();
  return el("div", { class: "grid" }, title ? el("h2", {}, title) : null, box);
}
const L0 = () => ({ hy: "", ru: "", en: "" });
const card = (...k) => el("div", { class: "card grid" }, ...k);

/* =============== media =============== */
function resizeImage(file, max = 1800) {
  return new Promise((res, rej) => {
    if (/svg|gif/.test(file.type)) return res({ blob: file, type: file.type });
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => (b ? res({ blob: b, type: "image/webp" }) : rej(new Error("Could not read image"))), "image/webp", 0.86);
    };
    img.onerror = () => rej(new Error("Could not read this image"));
    img.src = URL.createObjectURL(file);
  });
}
async function uploadFiles(files) {
  const out = [];
  for (const f of files) {
    if (!/^image\//.test(f.type)) continue;
    const { blob, type } = await resizeImage(f, f.type === "image/png" && f.size < 300e3 ? 4000 : 1800);
    const j = await api("media", { method: "POST", raw: true, body: blob, type, name: f.name });
    out.push(j.url);
  }
  return out;
}
function dropZone(onDone, multiple = true) {
  const inp = el("input", { type: "file", accept: "image/*", multiple, hidden: true });
  const z = el("div", { class: "drop" }, "📤 Tap to upload photos, or drag them here", el("div", { class: "small" }, "Photos are made smaller automatically for fast loading."));
  const go = async (files) => { z.textContent = "Uploading…"; try { const u = await uploadFiles([...files]); toast(`Uploaded ${u.length} photo(s) ✓`); onDone(u); } catch (e) { toast(e.message, true); } z.textContent = "📤 Tap to upload more photos"; };
  z.onclick = () => inp.click(); inp.onchange = () => go(inp.files);
  z.ondragover = (e) => { e.preventDefault(); z.classList.add("over"); }; z.ondragleave = () => z.classList.remove("over");
  z.ondrop = (e) => { e.preventDefault(); z.classList.remove("over"); go(e.dataTransfer.files); };
  return el("div", {}, z, inp);
}
const BUILTIN = ["hero", "top", "box_pile", "shelf", "vase", "bag_pearl", "marble", "bride", "bag_satin", "initials", "bags_shelf"].map((n) => `/img/${n}.webp`);
async function mediaPicker(onPick) {
  const grid = el("div", { class: "media" });
  const ov = el("div", { class: "ov center", onclick: (e) => { if (e.target === ov) ov.remove(); } });
  const draw = async () => {
    grid.innerHTML = "Loading…";
    const { media } = await api("media");
    grid.innerHTML = "";
    for (const u of [...media.map((m) => m.url), ...BUILTIN]) grid.append(el("div", { class: "m", onclick: () => { onPick(u); ov.remove(); } }, el("img", { src: u, loading: "lazy" })));
  };
  ov.append(el("div", { class: "modal" }, el("div", { class: "dh" }, el("h2", {}, "Choose a photo"), el("button", { class: "x", onclick: () => ov.remove() }, "×")),
    dropZone((u) => { if (u.length === 1) { onPick(u[0]); ov.remove(); } else draw(); }), grid));
  document.body.append(ov);
  draw();
}

/* =============== dashboard =============== */
VIEWS.dashboard = async () => {
  top("Dashboard", el("a", { class: "btn", href: "#orders/new" }, "+ New order"));
  const [s, o] = await Promise.all([api("stats"), getOrders()]);
  main.append(el("div", { class: "grid g4" },
    el("a", { class: "card stat", href: "#orders", style: "text-decoration:none;color:inherit" }, el("b", { class: s.newCount ? "bad" : "" }, s.newCount), el("span", {}, "New orders to confirm")),
    el("div", { class: "card stat" }, el("b", {}, s.todayDue), el("span", {}, "Due today")),
    el("div", { class: "card stat" }, el("b", {}, s.upcoming), el("span", {}, "Upcoming (not delivered)")),
    el("div", { class: "card stat" }, el("b", {}, money(s.monthSum)), el("span", {}, `This month · ${s.monthOrders} orders`)),
  ));
  const days = Object.entries(s.byDay), max = Math.max(1, ...days.map(([, v]) => v.n));
  main.append(el("div", { class: "grid g2", style: "margin-top:16px" },
    card(el("h2", {}, "Orders, last 30 days"), el("div", { class: "bars" }, days.map(([d, v]) => el("div", { style: `height:${(v.n / max) * 100}%`, "data-t": `${d.slice(5)} · ${v.n} · ${money(v.sum)}` }))), el("div", { class: "small muted" }, `Paid online (3 months): ${money(s.paidOnline)}`)),
    card(el("h2", {}, "Most ordered"), ...Object.entries(s.byFilling).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => el("div", { class: "btns", style: "justify-content:space-between" }, el("span", {}, k), el("b", {}, v + " pcs"))), Object.keys(s.byFilling).length ? null : el("div", { class: "muted" }, "No orders yet")),
  ));
  const up = o.filter((x) => x.date >= today() && !["delivered", "cancelled"].includes(x.status)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
  main.append(el("h2", { style: "margin:22px 0 10px" }, "Next orders"), orderList(up));
  checkSetup();
};
async function checkSetup() {
  try {
    STATUS_INFO = await api("status");
    const miss = [];
    if (!STATUS_INFO.sessionSecret) miss.push("SESSION_SECRET");
    if (!STATUS_INFO.telegram) miss.push("Telegram bot");
    if (miss.length) main.prepend(el("div", { class: "help", style: "margin-bottom:16px" }, "⚠️ Setup not finished: " + miss.join(", ") + ". See Settings."));
  } catch {}
}

/* =============== orders =============== */
async function getOrders(force) { if (!ORDERS || force) { ORDERS = (await api("orders?months=6")).orders; newCount = ORDERS.filter((o) => o.status === "new").length; drawSide(); } return ORDERS; }
const pill = (s) => el("span", { class: "pill s-" + s }, STATUS[s] || s);
const ppill = (o) => { const p = o.payment?.status || "none"; return el("span", { class: "pill p-" + p }, PAYST[p] || p); };
function fdate(d) { if (!d) return "—"; const [y, m, dd] = d.split("-"); const t = today(); const tm = new Date(Date.parse(t) + 864e5).toISOString().slice(0, 10); return d === t ? "Today" : d === tm ? "Tomorrow" : `${dd}.${m}.${y}`; }
function orderList(list) {
  if (!list.length) return el("div", { class: "card empty" }, "No orders here yet 🙂");
  return el("div", { class: "olist" }, list.map((o) => el("div", { class: "card oc", onclick: () => openOrder(o.id) },
    el("div", { class: "btns" }, pill(o.status), el("span", { class: "small muted" }, o.id)),
    el("div", { class: "amt" }, money(o.total)),
    el("div", { class: "who" }, `${o.customer?.name || "—"} · ${o.customer?.phone || ""}`),
    el("div", { class: "what" }, `${o.fillingName}${o.choco ? " (" + o.choco + ")" : ""} · ${o.size} cm × ${o.qty}${o.box ? " · box" : ""} · ${o.delivery?.label || ""}`),
    el("div", { class: "when" }, "📅 ", el("b", {}, fdate(o.date)), " ", ppill(o)),
  )));
}
VIEWS.orders = async (arg) => {
  top("Orders", el("a", { class: "btn", href: "/api/admin/orders.csv" }, "⬇️ Excel/CSV"), el("button", { class: "btn gold", onclick: () => newOrderForm() }, "+ New order"));
  const all = await getOrders(true);
  let st = "open", q = "", when = "all";
  const listBox = el("div");
  const tabs = el("div", { class: "tabs" });
  const TABS = [["open", "Open"], ["new", "New"], ["confirmed", "Confirmed"], ["baking", "Baking"], ["ready", "Ready"], ["delivered", "Delivered"], ["cancelled", "Cancelled"], ["all", "All"]];
  const draw = () => {
    tabs.innerHTML = "";
    TABS.forEach(([k, l]) => tabs.append(el("button", { class: st === k ? "on" : "", onclick: () => { st = k; draw(); } }, l, k !== "all" && k !== "open" ? ` (${all.filter((o) => o.status === k).length})` : "")));
    let L = all.filter((o) => st === "all" ? true : st === "open" ? !["delivered", "cancelled"].includes(o.status) : o.status === st);
    if (when === "today") L = L.filter((o) => o.date === today());
    if (when === "week") L = L.filter((o) => o.date >= today() && o.date <= new Date(Date.parse(today()) + 7 * 864e5).toISOString().slice(0, 10));
    if (q) { const s = q.toLowerCase(); L = L.filter((o) => JSON.stringify([o.id, o.customer, o.notes, o.fillingName, o.delivery]).toLowerCase().includes(s)); }
    if (st === "open") L.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    listBox.innerHTML = ""; listBox.append(orderList(L));
  };
  main.append(el("div", { class: "filters" },
    el("input", { type: "search", placeholder: "Search name, phone, order number…", value: arg && arg !== "new" ? decodeURIComponent(arg) : "", oninput: (e) => { q = e.target.value; draw(); } }),
    el("select", { onchange: (e) => { when = e.target.value; draw(); } }, el("option", { value: "all" }, "Any date"), el("option", { value: "today" }, "For today"), el("option", { value: "week" }, "Next 7 days"))),
    tabs, el("div", { style: "height:12px" }), listBox);
  if (arg && arg !== "new") q = decodeURIComponent(arg);
  draw();
  if (arg === "new") newOrderForm();
};
function drawer(title, ...kids) {
  const ov = el("div", { class: "ov", onclick: (e) => { if (e.target === ov) ov.remove(); } });
  const d = el("div", { class: "drawer" }, el("div", { class: "dh" }, el("h2", {}, title), el("button", { class: "x", onclick: () => ov.remove() }, "×")), ...kids);
  ov.append(d); document.body.append(ov);
  const esc_ = (e) => { if (e.key === "Escape") { ov.remove(); removeEventListener("keydown", esc_); } };
  addEventListener("keydown", esc_);
  return { ov, d };
}
function waTo(phone, text) {
  const p = String(phone || "").replace(/\D/g, "").replace(/^0/, "374").replace(/^(?!374)(\d{8})$/, "374$1");
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}
async function openOrder(id) {
  let o = (ORDERS || []).find((x) => x.id === id);
  const refresh = (n) => { const i = ORDERS.findIndex((x) => x.id === n.id); if (i >= 0) ORDERS[i] = n; else ORDERS.unshift(n); o = n; newCount = ORDERS.filter((x) => x.status === "new").length; drawSide(); };
  const patch = async (body, msg) => { const j = await api("orders/" + o.id, { method: "PATCH", body }); refresh(j.order); toast(msg || "Saved ✓"); render(); };
  const { ov, d } = drawer("Order " + o.id);
  const content = el("div", { class: "grid" });
  d.append(content);
  function render() {
    content.innerHTML = "";
    const tel = (o.customer?.phone || "").replace(/[^\d+]/g, "");
    content.append(
      card(el("div", { class: "fieldhead" }, "Status"), el("div", { class: "stbtns" }, Object.entries(STATUS).map(([k, l]) => el("button", { class: o.status === k ? "on" : "", onclick: () => patch({ status: k }, "Status: " + l) }, l))),
        el("div", { class: "small muted" }, (o.statusHistory || []).map((h) => `${STATUS[h.status]} · ${new Date(h.at).toLocaleString()} (${h.by})`).join("  ←  "))),
      card(el("dl", { class: "kv" },
        el("dt", {}, "Gata"), el("dd", {}, `${o.fillingName}${o.choco ? " (" + o.choco + ")" : ""}, ${o.size} cm`),
        el("dt", {}, "Quantity"), el("dd", {}, `${o.qty} × ${money(o.unit)}`),
        el("dt", {}, "Box"), el("dd", {}, o.box ? "Yes, in a box" : "No"),
        el("dt", {}, "Total"), el("dd", {}, el("b", {}, money(o.total)), o.box && !o.boxFee ? " + box (confirm price)" : "", o.delivery?.feeLater ? " + delivery fee" : ""),
        el("dt", {}, "Date"), el("dd", {}, el("b", {}, fdate(o.date)), " (" + (o.date || "") + ")"),
        el("dt", {}, "Delivery"), el("dd", {}, o.delivery?.label || "—", o.delivery?.address ? el("div", {}, "📍 " + o.delivery.address) : null),
        el("dt", {}, "Customer"), el("dd", {}, o.customer?.name || "—"),
        el("dt", {}, "Phone"), el("dd", {}, el("a", { href: "tel:" + tel }, o.customer?.phone || "—"), " · ", el("a", { href: waTo(o.customer?.phone, ""), target: "_blank" }, "WhatsApp")),
        el("dt", {}, "Notes"), el("dd", {}, o.notes || "—"),
        el("dt", {}, "From"), el("dd", {}, `${o.source} · ${(o.lang || "").toUpperCase()} · ${new Date(o.createdAt).toLocaleString()}`),
      )),
      payBox(),
      editBox(),
      card(el("div", { class: "btns" },
        el("button", { class: "btn", onclick: (e) => busy(e.currentTarget, async () => { await api(`orders/${o.id}/telegram`, { method: "POST" }); toast("Sent to Telegram ✓"); }) }, "📨 Send to Telegram"),
        el("button", { class: "btn red", onclick: async () => { if (!confirm("Delete this order forever?")) return; await api("orders/" + o.id, { method: "DELETE" }); ORDERS = ORDERS.filter((x) => x.id !== o.id); ov.remove(); toast("Deleted"); route(); } }, "🗑 Delete"))),
    );
  }
  function payBox() {
    const p = o.payment || {};
    const amt = el("input", { type: "number", value: p.amount || o.total, style: "max-width:140px" });
    const box = card(el("div", { class: "fieldhead" }, "Payment ", ppill(o)));
    if (p.checkoutUrl && p.status === "pending") {
      const link = p.checkoutUrl;
      box.append(el("div", { class: "small", style: "word-break:break-all" }, link),
        el("div", { class: "btns" },
          el("button", { class: "btn sm", onclick: () => { navigator.clipboard.writeText(link); toast("Link copied ✓"); } }, "Copy link"),
          el("a", { class: "btn sm", href: waTo(o.customer?.phone, `Բարև Ձեզ 🤍 Գառնու Գաթա։ Պատվեր ${o.id}, ${money(p.amount || o.total)}։ Վճարելու հղումը՝ ${link}`), target: "_blank" }, "Send by WhatsApp"),
          el("button", { class: "btn sm", onclick: (e) => busy(e.currentTarget, async () => { const j = await api(`orders/${o.id}/check`, { method: "POST" }); refresh(j.order); render(); toast("Status: " + (PAYST[j.order.payment.status] || j.order.payment.status)); }) }, "Check status")));
    }
    box.append(el("div", { class: "btns" }, el("span", { class: "small muted" }, "Amount ֏"), amt,
      el("button", { class: "btn sm gold", onclick: (e) => busy(e.currentTarget, async () => { const j = await api(`orders/${o.id}/paylink`, { method: "POST", body: { amount: +amt.value } }); refresh(j.order); render(); navigator.clipboard?.writeText(j.url).catch(() => {}); toast("Payment link created and copied ✓"); }) }, "💳 Create payment link")));
    box.append(el("div", { class: "btns" },
      p.status !== "completed" ? el("button", { class: "btn sm", onclick: () => patch({ paymentStatus: "completed" }, "Marked as paid") }, "✓ Mark as paid (cash/transfer)") : null,
      p.status === "completed" && p.uuid ? el("button", { class: "btn sm red", onclick: async (e) => { const a = prompt("Refund amount ֏", p.paidAmount || p.amount); if (!a) return; await busy(e.currentTarget, async () => { const j = await api(`orders/${o.id}/refund`, { method: "POST", body: { amount: +a } }); refresh(j.order); render(); toast("Refunded"); }); } }, "↩️ Refund") : null,
      p.status === "completed" && !p.uuid ? el("button", { class: "btn sm", onclick: () => patch({ paymentStatus: "none" }, "Marked as not paid") }, "Mark as not paid") : null));
    if (p.paidAt) box.append(el("div", { class: "small ok" }, "Paid " + new Date(p.paidAt).toLocaleString()));
    return box;
  }
  function editBox() {
    const e = { adminNote: o.adminNote || "", date: o.date || "", total: o.total, qty: o.qty, notes: o.notes || "", address: o.delivery?.address || "", name: o.customer?.name || "", phone: o.customer?.phone || "" };
    const btn = el("button", { class: "btn gold sm", onclick: (ev) => busy(ev.currentTarget, () => patch({ adminNote: e.adminNote, date: e.date, total: e.total, qty: e.qty, notes: e.notes, address: e.address, customer: { name: e.name, phone: e.phone } })) }, "Save");
    return card(el("div", { class: "fieldhead" }, "Edit order"),
      el("div", { class: "grid g2" }, Tf(e, "date", "Date", { type: "date" }), Tf(e, "qty", "Quantity", { type: "number" }), Tf(e, "total", "Total ֏ (you can change the price)", { type: "number" }), Tf(e, "address", "Address"), Tf(e, "name", "Name"), Tf(e, "phone", "Phone")),
      Tf(e, "notes", "Customer notes", { area: true }), Tf(e, "adminNote", "Private note (only you see it)", { area: true }), el("div", {}, btn));
  }
  render();
}
async function newOrderForm() {
  if (!C) await loadContent();
  const m = C.menu;
  const n = { filling: m.fillings[0]?.id, size: m.sizes[1]?.cm || m.sizes[0]?.cm, qty: 1, box: false, date: today(), delivery: C.delivery.options[0]?.id, address: "", name: "", phone: "", notes: "", adminNote: "", total: "", source: "phone" };
  const sel = (key, opts) => el("select", { onchange: (e) => { n[key] = e.target.value; } }, opts.map(([v, l]) => el("option", { value: v, selected: String(n[key]) === String(v) }, l)));
  const btn = el("button", { class: "btn gold", onclick: (e) => busy(e.currentTarget, async () => {
    const j = await api("orders", { method: "POST", body: { ...n, size: +n.size, qty: +n.qty, total: n.total ? +n.total : undefined } });
    ORDERS = null; toast("Order added ✓"); ov.remove(); location.hash = "#orders"; route();
  }) }, "Add order");
  const { ov } = drawer("New order (phone / Instagram)",
    card(el("div", { class: "grid g2" },
      el("label", { class: "f" }, "Filling", sel("filling", m.fillings.map((f) => [f.id, tx(f.name)]))),
      el("label", { class: "f" }, "Size", sel("size", m.sizes.map((s) => [s.cm, s.cm + " cm"]))),
      Tf(n, "qty", "Quantity", { type: "number" }), Tf(n, "date", "Date", { type: "date" }),
      el("label", { class: "f" }, "Delivery", sel("delivery", C.delivery.options.map((d) => [d.id, tx(d.label)]))), Tf(n, "address", "Address"),
      Tf(n, "name", "Customer name"), Tf(n, "phone", "Phone"),
      el("label", { class: "f" }, "Came from", sel("source", [["phone", "Phone call"], ["instagram", "Instagram"], ["whatsapp", "WhatsApp"], ["shop", "In person"]])),
      Tf(n, "total", "Total ֏ (empty = from menu)", { type: "number" })),
      Bf(n, "box", "In a box"), Tf(n, "notes", "Notes", { area: true }), Tf(n, "adminNote", "Private note", { area: true }), el("div", {}, btn)));
  n.box = false;
}

/* =============== customers =============== */
VIEWS.customers = async () => {
  top("Customers");
  const all = (await api("orders?all=1")).orders;
  const map = new Map();
  for (const o of all) {
    const k = String(o.customer?.phone || "").replace(/\D/g, "").slice(-8) || o.customer?.name;
    if (!k) continue;
    const c = map.get(k) || { name: o.customer?.name, phone: o.customer?.phone, n: 0, sum: 0, last: "" };
    c.n++; if (o.status !== "cancelled") c.sum += o.total; if ((o.createdAt || "") > c.last) { c.last = o.createdAt; c.name = o.customer?.name || c.name; }
    map.set(k, c);
  }
  const list = [...map.values()].sort((a, b) => b.last.localeCompare(a.last));
  let q = "";
  const tb = el("tbody");
  const draw = () => {
    tb.innerHTML = "";
    list.filter((c) => !q || (c.name + c.phone).toLowerCase().includes(q)).forEach((c) => tb.append(el("tr", { class: "row", onclick: () => (location.hash = "#orders/" + encodeURIComponent(c.phone || c.name)) },
      el("td", {}, el("b", {}, c.name || "—")), el("td", {}, c.phone), el("td", {}, c.n), el("td", {}, money(c.sum)), el("td", { class: "muted" }, c.last ? new Date(c.last).toLocaleDateString() : ""))));
  };
  main.append(el("div", { class: "filters" }, el("input", { type: "search", placeholder: "Search…", oninput: (e) => { q = e.target.value.toLowerCase(); draw(); } })),
    list.length ? el("div", { class: "card", style: "padding:6px;overflow:auto" }, el("table", { class: "tbl" }, el("thead", {}, el("tr", {}, ["Name", "Phone", "Orders", "Spent", "Last order"].map((h) => el("th", {}, h)))), tb)) : el("div", { class: "card empty" }, "No customers yet"));
  draw();
};

/* =============== menu & delivery =============== */
VIEWS.menu = async () => {
  if (!C) await loadContent();
  contentPage("Menu & prices", "These prices are used by the order form, the chat assistant and Google. <b>Hidden</b> fillings are not shown as buttons, but customers can still order them by writing (for example chocolate).", (b) => {
    const m = C.menu;
    const priceTable = () => {
      const t = el("table", { class: "tbl price-grid" });
      t.append(el("thead", {}, el("tr", {}, el("th", {}, "Filling"), m.sizes.map((s) => el("th", {}, s.cm + " cm")), el("th", {}, "Shown"))));
      const tb = el("tbody");
      m.fillings.forEach((f) => { while (f.prices.length < m.sizes.length) f.prices.push(0); tb.append(el("tr", {}, el("td", {}, tx(f.name)), m.sizes.map((s, i) => el("td", {}, el("input", { type: "number", value: f.prices[i], style: "width:90px", oninput: (e) => { f.prices[i] = +e.target.value; } }))), el("td", {}, el("input", { type: "checkbox", checked: f.show !== false, onchange: (e) => { f.show = e.target.checked; } })))); });
      t.append(tb); return t;
    };
    b.append(card(el("h2", {}, "Prices (֏ per gata)"), el("div", { style: "overflow:auto" }, priceTable())));
    b.append(Lst(m.fillings, "Fillings", (f) => el("div", { class: "grid" },
      el("div", { class: "grid g2" }, Tf(f, "id", "Short code (latin, no spaces)", { hint: "Used inside the system. Don't change for existing ones." }), Bf(f, "show", "Show as a button in order form and chat")),
      Lf(f, "name", "Full name"), Lf(f, "short", "Short name")), () => ({ id: "new" + Date.now().toString(36).slice(-3), name: L0(), short: L0(), prices: m.sizes.map(() => 0), show: true }), { name: "Filling", label: (f) => tx(f.name) }));
    b.append(Lst(m.sizes, "Sizes", (s) => el("div", { class: "grid" }, Tf(s, "cm", "Size in cm", { type: "number" }), Lf(s, "label", "Name")), () => ({ cm: 35, label: L0() }), { name: "Size", label: (s) => s.cm + " cm" }));
    b.append(card(el("h2", {}, "Box"), Bf(m.box, "enabled", "Ask customers if they want a box"), Tf(m.box, "price", "Box price ֏ (0 = you confirm the price later by phone)", { type: "number" })));
  });
};
VIEWS.delivery = async () => {
  if (!C) await loadContent();
  contentPage("Delivery options", "Fee: <b>0</b> = free, <b>-1</b> = extra fee you confirm later, any other number = fixed fee in ֏ added to the total.<br>The chat knows these codes: <code>pickup</code>, <code>megamall</code>, <code>yerevan</code>, <code>abovyan</code>.", (b) => {
    b.append(Lst(C.delivery.options, null, (d) => el("div", { class: "grid" },
      el("div", { class: "grid g3" }, Tf(d, "id", "Code"), Tf(d, "price", "Fee ֏", { type: "number" }), el("div", { class: "grid" }, Bf(d, "address", "Ask for address"), Bf(d, "show", "Show on site"))),
      Lf(d, "label", "Name shown to customers")), () => ({ id: "new", label: L0(), address: true, price: -1, show: true }), { name: "Option", label: (d) => tx(d.label) }));
  });
};

/* =============== homepage =============== */
VIEWS.home = async () => {
  if (!C) await loadContent();
  contentPage("Homepage texts & photos", "Write in Armenian, then press <b>✨ Translate</b> to fill Russian and English automatically. Use <code>**text**</code> for bold. Press <b>Save</b> at the bottom when done.", (b) => {
    const sec = (t, ...k) => card(el("h2", {}, t), ...k);
    b.append(sec("Logo & name", Lf(C.brand, "name", "Business name"), Lf(C.brand, "logoText", "Logo text (when no logo image)"), Lf(C.brand, "sub", "Small text under logo"), If(C.brand, "logo", "Logo image (top menu, dark)"), If(C.brand, "logoLight", "Logo image for dark footer (light)"), C.brand.logo ? el("button", { class: "btn sm", onclick: () => { C.brand.logo = ""; route(); } }, "Remove logo image (use text)") : null, If(C.brand, "favicon", "Small browser icon (favicon)")));
    b.append(sec("Top of page (hero)", Lf(C.hero, "kicker", "Small line above title"), Lf(C.hero, "title", "Big title"), Lf(C.hero, "lead", "Text under title", { area: true }), Lf(C.hero, "btnOrder", "Order button"), Lf(C.hero, "btnMenu", "Second button"), If(C.hero, "image", "Round gata photo"), Lf(C.hero, "alt", "Photo description (for Google)")));
    b.append(sec("Big photo scene", Bf(C.expand, "show", "Show this section"), If(C.expand, "image", "Photo"), Lf(C.expand, "title", "Title"), Lf(C.expand, "text", "Text")));
    b.append(sec("Products", Lf(C.products, "kicker", "Small line"), Lf(C.products, "title", "Title"), Lf(C.products, "lead", "Text", { area: true }), Lf(C.products, "btn", "Button text on cards"),
      Lst(C.products.cards, "Product cards", (k) => el("div", { class: "grid" }, If(k, "image", "Photo"), Lf(k, "tag", "Small tag"), Lf(k, "title", "Title"), Lf(k, "text", "Text", { area: true }), Bf(k, "show", "Show")), () => ({ image: "/img/top.webp", tag: L0(), title: L0(), text: L0(), show: true }), { name: "Card", label: (k) => tx(k.title) })));
    b.append(sec("3D photo ring", Bf(C.ring, "show", "Show this section"), Lf(C.ring, "kicker", "Small line"), Lf(C.ring, "title", "Title"), el("div", { class: "small muted" }, "Uses the photos from Photos → Gallery.")));
    b.append(sec("Big words scene", Bf(C.words, "show", "Show this section"), Lf(C.words, "text", "Words", { hint: "Put *stars* around a word to make it gold." })));
    b.append(sec("Why us", Lf(C.features, "kicker", "Small line"), Lf(C.features, "title", "Title"),
      Lst(C.features.items, null, (f) => el("div", { class: "grid" }, Lf(f, "big", "Big text (a number counts up)"), Lf(f, "title", "Title"), Lf(f, "text", "Text", { area: true })), () => ({ big: L0(), title: L0(), text: L0() }), { name: "Box", label: (f) => tx(f.title) })));
    b.append(sec("Our story", If(C.story, "image", "Photo"), Lf(C.story, "kicker", "Small line"), Lf(C.story, "title", "Title"), Lf(C.story, "p1", "Paragraph 1", { area: true }), Lf(C.story, "p2", "Paragraph 2", { area: true })));
    b.append(sec("How to order (steps)", Lf(C.steps, "kicker", "Small line"), Lf(C.steps, "title", "Title"),
      Lst(C.steps.items, null, (s) => el("div", { class: "grid" }, Lf(s, "title", "Title"), Lf(s, "text", "Text", { area: true })), () => ({ title: L0(), text: L0() }), { name: "Step" })));
    b.append(sec("Order section", Lf(C.order, "kicker", "Small line"), Lf(C.order, "title", "Title"), Lf(C.order, "lead", "Text", { area: true }), Lf(C.order, "note", "Note under the form", { area: true })));
    b.append(sec("Footer", Lf(C.footer, "copy", "Bottom line")));
  });
};
VIEWS.photos = async () => {
  if (!C) await loadContent();
  contentPage("Photos", "Upload new photos here, then choose them in the gallery, homepage or pages. The gallery photos also make the 3D ring.", (b) => {
    const lib = el("div", { class: "media" });
    const drawLib = async () => {
      const { media } = await api("media");
      lib.innerHTML = "";
      if (!media.length) lib.append(el("div", { class: "muted small" }, "No uploaded photos yet."));
      media.forEach((m) => lib.append(el("div", { class: "m", title: m.name || "" }, el("img", { src: m.url, loading: "lazy" }),
        el("button", { class: "del", onclick: async (e) => { e.stopPropagation(); if (!confirm("Delete this photo? If it is used on the site it will disappear there.")) return; await api("media/" + m.id, { method: "DELETE" }); drawLib(); } }, "Delete"))));
    };
    b.append(card(el("h2", {}, "Gallery (moving photo strip)"),
      Lst(C.gallery.images, null, (g) => el("div", { class: "grid" }, If(g, "src", "Photo"), Lf(g, "alt", "Description (for Google)")), () => ({ src: "/img/top.webp", alt: L0() }), { name: "Photo" }),
      el("div", { class: "btns" }, el("button", { class: "btn", onclick: () => mediaPicker((u) => { C.gallery.images.push({ src: u, alt: L0() }); route(); }) }, "+ Add from library")),
      Lf(C.gallery, "kicker", "Small line"), Lf(C.gallery, "title", "Title"), Lf(C.gallery, "lead", "Text")));
    b.append(card(el("h2", {}, "Uploaded photos"), dropZone(() => drawLib()), lib));
    drawLib();
  });
};

/* =============== pages =============== */
VIEWS.pages = async (slug) => {
  if (!C) await loadContent();
  PAGES = (await api("pages")).pages;
  if (slug) return pageEditor(slug === "new" ? null : PAGES.find((p) => p.slug === slug));
  top("Pages", el("a", { class: "btn gold", href: "#pages/new" }, "+ New page"));
  main.append(el("div", { class: "help", style: "margin-bottom:16px", html: "Make extra pages like <b>Wedding gata</b>, <b>Delivery info</b>, <b>About us</b> or <b>Price list</b>. Each page has Armenian, Russian and English versions and appears in Google." }));
  if (!PAGES.length) return main.append(el("div", { class: "card empty" }, "No pages yet. Press “New page”."));
  main.append(el("div", { class: "card", style: "padding:6px;overflow:auto" }, el("table", { class: "tbl" },
    el("thead", {}, el("tr", {}, ["Title", "Address", "Status", "Menu", ""].map((h) => el("th", {}, h)))),
    el("tbody", {}, PAGES.map((p) => el("tr", { class: "row", onclick: () => (location.hash = "#pages/" + p.slug) },
      el("td", {}, el("b", {}, tx(p.title))), el("td", {}, "/p/" + p.slug), el("td", {}, p.published ? el("span", { class: "pill p-completed" }, "Published") : el("span", { class: "pill p-none" }, "Draft")),
      el("td", { class: "small" }, [p.showInNav && "Top", p.showInFooter && "Footer"].filter(Boolean).join(", ") || "—"),
      el("td", {}, el("a", { href: "/p/" + p.slug, target: "_blank", onclick: (e) => e.stopPropagation() }, "View ↗"))))))));
};
function pageEditor(p) {
  const isNew = !p;
  p = p ? clone(p) : { slug: "", title: L0(), kicker: L0(), body: L0(), seoDescription: L0(), image: "", published: true, showInNav: false, showInFooter: true, order: 0 };
  const oldSlug = p.slug;
  top(isNew ? "New page" : "Edit page", el("a", { class: "btn", href: "#pages" }, "← All pages"), !isNew ? el("a", { class: "btn", href: "/p/" + p.slug, target: "_blank" }, "View ↗") : null);
  const slugF = Tf(p, "slug", "Page address (latin letters, numbers and -)", { ph: "wedding-gata", hint: "The page will open at garnugata.am/p/your-address" });
  const save = el("button", { class: "btn gold", onclick: (e) => busy(e.currentTarget, async () => {
    p.slug = String(p.slug || "").toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    if (!p.slug) throw new Error("Write the page address");
    if (!tx(p.title)) throw new Error("Write the page title");
    await api("pages/" + p.slug, { method: "PUT", body: { ...p, oldSlug: isNew ? undefined : oldSlug } });
    toast("Page saved ✓"); location.hash = "#pages";
  }) }, "💾 Save page");
  main.append(el("div", { class: "grid" },
    card(el("div", { class: "grid g2" }, slugF, el("div", { class: "grid" }, Bf(p, "published", "Published (visible)"), Bf(p, "showInNav", "Show in top menu"), Bf(p, "showInFooter", "Show in footer"))), Lf(p, "title", "Title"), Lf(p, "kicker", "Small line above title (optional)"), If(p, "image", "Top photo (optional)")),
    card(el("div", { class: "help", html: "<b>How to format:</b> empty line = new paragraph · <code># Heading</code> · <code>- list item</code> · <code>**bold**</code> · <code>[link text](https://...)</code> · <code>[Order now](/#order){btn}</code> = gold button · <code>![photo](/media/...)</code> = photo" }),
      Lf(p, "body", "Page text", { area: true, rows: 12 }),
      el("div", { class: "btns" }, el("button", { class: "btn sm", onclick: () => mediaPicker((u) => { p.body.hy = (p.body.hy || "") + `\n\n![](${u})\n`; route2(); }) }, "🖼 Insert photo into Armenian text"))),
    card(Lf(p, "seoDescription", "Google description (1–2 sentences)", { area: true, rows: 2 })),
    el("div", { class: "btns" }, save, !isNew ? el("button", { class: "btn red", onclick: async () => { if (!confirm("Delete this page?")) return; await api("pages/" + oldSlug, { method: "DELETE" }); toast("Deleted"); location.hash = "#pages"; } }, "Delete page") : null),
  ));
  function route2() { main.innerHTML = ""; pageEditor(isNew ? null : p); }
}

/* =============== links & contacts =============== */
VIEWS.links = async () => {
  if (!C) await loadContent();
  contentPage("Links & contacts", "Top menu links can point to a part of the homepage (<code>#products</code>, <code>#story</code>, <code>#gallery</code>, <code>#how</code>, <code>#order</code>, <code>#faq</code>), to a page (<code>/p/page-address</code>) or to any website (<code>https://…</code>).", (b) => {
    const ct = C.contact;
    const phones = { v: ct.phones.join(", ") };
    b.append(card(el("h2", {}, "Contacts"),
      el("label", { class: "f" }, "Phone numbers (separate with commas)", el("input", { type: "text", value: phones.v, oninput: (e) => { ct.phones = e.target.value.split(",").map((x) => x.trim()).filter(Boolean); } })),
      el("div", { class: "grid g2" }, Tf(ct, "whatsapp", "WhatsApp number (with 374, no +)", { ph: "37455577381" }), Tf(ct, "email", "Email"), Tf(ct, "domain", "Website domain")),
      Lf(ct, "address", "Address"), Tf(ct, "mapUrl", "Google Maps link")));
    b.append(card(el("h2", {}, "Social media"), el("div", { class: "grid g2" }, Tf(ct, "instagram", "Instagram link"), Tf(ct, "instagramHandle", "Instagram name", { ph: "@garnugata" }), Tf(ct, "facebook", "Facebook link"), Tf(ct, "tiktok", "TikTok link"), Tf(ct, "telegram", "Telegram link"))));
    b.append(card(el("h2", {}, "Top menu"), Bf(C, "pagesInNav", "Also show pages marked “Show in top menu”"),
      Lst(C.nav, null, (n) => el("div", { class: "grid" }, el("div", { class: "grid g2" }, Tf(n, "href", "Link"), Bf(n, "show", "Show")), Lf(n, "label", "Text")), () => ({ label: L0(), href: "#order", show: true }), { name: "Link", label: (n) => tx(n.label) })));
  });
};
VIEWS.faq = async () => {
  if (!C) await loadContent();
  contentPage("Questions & answers (FAQ)", "Shown on the homepage and sent to Google as FAQ, so they can appear in search results.", (b) => {
    b.append(card(Lf(C.faq, "kicker", "Small line"), Lf(C.faq, "title", "Title")));
    b.append(Lst(C.faq.items, null, (f) => el("div", { class: "grid" }, Lf(f, "q", "Question"), Lf(f, "a", "Answer", { area: true })), () => ({ q: L0(), a: L0() }), { name: "Question", label: (f) => tx(f.q) }));
  });
};
VIEWS.chat = async () => {
  if (!C) await loadContent();
  contentPage("Chat assistant", "The assistant answers in Armenian, Russian and English and takes orders step by step. Prices come from <b>Menu & prices</b>. Below you can change its answers. <code>{phones}</code> = your phone numbers, <code>{instagram}</code> = Instagram name.", (b) => {
    b.append(card(Bf(C.chat, "show", "Show the chat button on the website"),
      Bf(C.chat, "ai", "✨ Let AI answer questions the assistant does not understand", "Uses Netlify AI credits. The AI only knows your menu, prices, delivery and FAQ."),
      Lf(C.chat, "welcome", "First message", { area: true })));
    const N = { delivery: "Delivery", where: "Where are you", khoriz: "What is gata / khoriz", fresh: "How long it stays fresh", when: "How early to order", hours: "Opening hours", pay: "Payment", wedding: "Weddings & decoration" };
    b.append(card(el("h2", {}, "Answers"), ...Object.keys(C.chat.answers).map((k) => Lf(C.chat.answers, k, N[k] || k, { area: true, rows: 4 }))));
    b.append(card(el("h2", {}, "Try it"), el("a", { class: "btn", href: "/", target: "_blank" }, "Open the website and test the chat ↗")));
  });
};
VIEWS.seo = async () => {
  if (!C) await loadContent();
  contentPage("SEO & Google", "This is what Google shows in search results. Keep the title under 60 letters and the description under 160.", (b) => {
    b.append(card(Lf(C.seo, "title", "Page title (Google)"), Lf(C.seo, "description", "Description (Google)", { area: true, rows: 3 }), If(C.seo, "ogImage", "Picture when the link is shared (1200×630)")));
    b.append(card(el("h2", {}, "Google tools"), Tf(C.seo, "googleVerification", "Google Search Console code", { hint: "From Search Console → HTML tag → the content=\"…\" part only." }), Tf(C.seo, "googleTag", "Google Analytics ID", { ph: "G-XXXXXXXXXX" }),
      el("div", { class: "small" }, "Sitemap for Google: ", el("a", { href: "/sitemap.xml", target: "_blank" }, location.origin + "/sitemap.xml"))));
  });
};

/* =============== payments =============== */
VIEWS.payments = async () => {
  if (!C) await loadContent();
  const s = STATUS_INFO || (STATUS_INFO = await api("status"));
  contentPage("Online payments (Paynet)", "Customers can pay with ArCa / Visa / Mastercard cards, Idram or Telcell. Paynet costs 20 ֏ per payment. When a payment is done, the order is marked <b>Paid</b> and you get a Telegram message.", (b) => {
    const ck = (ok, t) => el("div", { class: "chk" }, el("span", {}, ok ? "✅" : "⬜"), el("span", {}, t));
    b.append(card(el("h2", {}, "Setup checklist"),
      ck(s.paynet, "Paynet API key added in Netlify (PAYNET_API_KEY)"),
      ck(s.paynetWebhook, "Paynet webhook secret added in Netlify (PAYNET_WEBHOOK_SECRET)"),
      ck(!!C.payments.domain, "Your domain is verified in Paynet → Websites"),
      el("div", { class: "help", html: `In Paynet → Websites → your site, set the <b>Webhook URL</b> to:<br><code>${esc(s.paynetWebhookUrl)}</code>` }),
      el("button", { class: "btn sm", onclick: () => { navigator.clipboard.writeText(s.paynetWebhookUrl); toast("Copied ✓"); } }, "Copy webhook URL")));
    b.append(card(el("h2", {}, "Settings"),
      Bf(C.payments, "enabled", "Offer “Pay online now” to customers", s.paynet ? "" : "⚠️ Add the Paynet API key first, otherwise customers will only see “pay on receipt”."),
      Tf(C.payments, "domain", "Verified domain in Paynet", { ph: "garnugata.am" }),
      el("label", { class: "f" }, "Payment method", el("select", { onchange: (e) => { C.payments.processor = e.target.value; } },
        [["", "Customer chooses on Paynet page"], ["arca", "Cards (ArCa)"], ["idram", "Idram"], ["telcell", "Telcell"], ["sandbox", "Sandbox (testing)"]].map(([v, l]) => el("option", { value: v, selected: (C.payments.processor || "") === v }, l))))));
    b.append(card(el("h2", {}, "Payment links"), el("div", { class: "small" }, "For orders by phone or Instagram: open the order → “Create payment link” → send it by WhatsApp. You can also change the amount (for example a deposit).")));
  });
};

/* =============== settings =============== */
VIEWS.settings = async () => {
  if (!C) await loadContent();
  const s = STATUS_INFO = await api("status");
  contentPage("Settings", null, (b) => {
    b.append(card(el("h2", {}, "Orders"), Bf(C.order, "accept", "Accept online orders", "Turn off when you are on holiday or fully booked."),
      Lf(C.order, "closedText", "Message when orders are off", { area: true }),
      Tf(C.order, "minDays", "Recommended days before (chat warns if sooner)", { type: "number" })));
    const ck = (ok, t) => el("div", { class: "chk" }, el("span", {}, ok ? "✅" : "⚠️"), el("span", {}, t));
    b.append(card(el("h2", {}, "Telegram"),
      ck(s.telegram, "Bot token (TELEGRAM_BOT_TOKEN)"), ck(!!s.chats, "Messages go to chat ID(s): " + s.chats),
      el("div", { class: "btns" },
        el("button", { class: "btn", onclick: (e) => busy(e.currentTarget, async () => { const j = await api("telegram/test", { method: "POST" }); toast(j.ok ? "Sent ✓ Check Telegram" : "Failed: " + (j.results?.[0]?.description || ""), !j.ok); }) }, "Send test message"),
        el("button", { class: "btn", onclick: (e) => busy(e.currentTarget, async () => { const j = await api("telegram/connect", { method: "POST" }); toast(j.ok ? "Connected ✓ Order buttons in Telegram now work" : "Failed: " + (j.result?.description || ""), !j.ok); }) }, "Connect Telegram buttons")),
      el("div", { class: "small muted" }, "“Connect Telegram buttons” lets you change order status right from Telegram, and write /orders to the bot to see open orders. Do it once after the site is live.")));
    b.append(card(el("h2", {}, "Security"), ck(s.password, "Admin password set"), ck(s.sessionSecret, "Session secret set"),
      el("div", { class: "btns" }, el("button", { class: "btn", onclick: async () => { if (!confirm("Log out on all phones and computers?")) return; await api("logout-all", { method: "POST" }); showLogin(); } }, "Log out everywhere")),
      el("div", { class: "small muted" }, "To change the password: Netlify → Project configuration → Environment variables → ADMIN_PASSWORD.")));
    const bk = el("div", { class: "grid" }, "Loading…");
    b.append(card(el("h2", {}, "Backups"), el("div", { class: "small muted" }, "Every time you save, a copy is kept (last 15). You can go back to one."), bk));
    api("backups").then(({ backups }) => {
      bk.innerHTML = "";
      if (!backups.length) bk.append(el("div", { class: "muted small" }, "No backups yet."));
      backups.forEach((k) => bk.append(el("div", { class: "btns", style: "justify-content:space-between" }, el("span", {}, new Date(k.slice(4)).toLocaleString()),
        el("button", { class: "btn sm", onclick: async (e) => { if (!confirm("Go back to this version? Current texts will be replaced.")) return; await busy(e.currentTarget, async () => { await api("restore", { method: "POST", body: { key: k } }); await loadContent(); toast("Restored ✓"); route(); }); } }, "Restore"))));
    });
  });
};

/* =============== AI helper =============== */
let AIMSG = [];
VIEWS.ai = async () => {
  top("✨ AI helper");
  main.append(el("div", { class: "help", style: "margin-bottom:14px" }, "Ask for Instagram posts, answers to customers, new texts for the website, translations or ideas. Write in any language."));
  const log = el("div", { class: "ai-log" });
  const draw = () => { log.innerHTML = ""; AIMSG.forEach((m) => log.append(el("div", { class: "b " + (m.role === "user" ? "u" : "a") }, m.content))); log.scrollTop = 1e6; };
  const inp = el("textarea", { rows: 3, placeholder: "e.g. Write an Instagram post about our wedding gata in Armenian with emojis" });
  const btn = el("button", { class: "btn gold", onclick: (e) => busy(e.currentTarget, async () => {
    const t = inp.value.trim(); if (!t) return;
    AIMSG.push({ role: "user", content: t }); inp.value = ""; draw();
    try { const j = await api("ai", { method: "POST", body: { messages: AIMSG } }); AIMSG.push({ role: "assistant", content: j.text }); }
    catch (err) { AIMSG.pop(); inp.value = t; throw err; }
    draw();
  }) }, "Send");
  const ideas = ["Write an Instagram post about our wedding gata", "Write a polite reply to a customer asking for a discount", "Translate our story text to Russian and English", "Give me 5 ideas for holiday gift boxes"];
  main.append(card(log, el("div", { class: "btns" }, ideas.map((i) => el("button", { class: "btn sm", onclick: () => { inp.value = i; inp.focus(); } }, i))), inp, el("div", { class: "btns" }, btn, el("button", { class: "btn", onclick: () => { AIMSG = []; draw(); } }, "New chat"))));
  draw();
};

/* =============== start =============== */
async function start() {
  try { await api("me"); } catch { return showLogin(); }
  shell();
  await loadContent().catch((e) => toast(e.message, true));
  getOrders().catch(() => {});
  route();
}
start();
})();
