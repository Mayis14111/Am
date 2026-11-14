/* Garnu Gata — site script. Data comes from window.GG (set by the server from the admin panel). */
(() => {
const G = window.GG || {};
const PL = G.lang || "hy";
const $ = (id) => document.getElementById(id);
const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const tx = (v, l) => (v == null ? "" : typeof v === "string" || typeof v === "number" ? String(v) : v[l] || v.hy || v.en || v.ru || "");
const API = "/api/order";

/* ================= texts ================= */
const CUR = { hy: "դր", ru: "др", en: "AMD" };
const CM = { hy: "սմ", ru: "см", en: "cm" };
const MON = {
  hy: ["հունվարի", "փետրվարի", "մարտի", "ապրիլի", "մայիսի", "հունիսի", "հուլիսի", "օգոստոսի", "սեպտեմբերի", "հոկտեմբերի", "նոյեմբերի", "դեկտեմբերի"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const CHOCO = { dark: { hy: "սև", ru: "тёмный", en: "dark" }, milk: { hy: "կաթնային", ru: "молочный", en: "milk" }, white: { hy: "սպիտակ", ru: "белый", en: "white" } };

const T = {
  hy: {
    greet: "Բարև Ձեզ 😊 Ուրախ եմ, որ գրեցիք։ Ինչո՞վ կարող եմ օգնել՝ գներ, չափսեր, առաքո՞ւմ, թե՞ պատվեր։",
    hi: "Բարև Ձեզ 😊",
    thanks: "Խնդրեմ 🤍 Եթե էլի հարց ունենաք, գրեք, ես այստեղ եմ։",
    bye: "Շնորհակալություն, որ գրեցիք 🤍 Սպասում ենք Ձեր պատվերին։",
    pricesHead: "Մեր գներն են՝",
    priceNote: "Հարսանեկան տուփերի և զարդարանքի գինը հաշվում ենք ըստ ձևավորման։",
    one: (s, f, p) => `${s} ${f.toLowerCase()} գաթան՝ ${p}։`,
    sizeHead: (s) => `${s} գաթան՝`,
    fillHead: (f) => `${f} գաթայի գներն են՝`,
    chocoTypes: "Կա սև, կաթնային և սպիտակ շոկոլադով։",
    chocoYes: "Այո, ունենք շոկոլադով գաթա 🍫 սև, կաթնային և սպիտակ շոկոլադով՝",
    sizes: (l) => `Գաթան թխում ենք այս չափսերով՝ ${l}։`,
    delivOther: (p) => `Ներկայումս առաքում ենք Գառնիից Երևան և Աբովյան։ Այլ վայրի համար զանգահարեք՝ ${p}, կքննարկենք 🙏`,
    orderHint: "Պատվիրելու համար գրեք «պատվիրել», և ես կօգնեմ հենց այստեղ։",
    phone: (p, ig) => `Սիրով կպատասխանենք 📞\n${p.join("\n")}${ig ? `\n\nԿարող եք նաև գրել Instagram-ում՝ ${ig}։` : ""}`,
    wantOrder: "Ցանկանո՞ւմ եք պատվիրել հենց այստեղ։",
    types: (l) => `Ունենք՝\n${l}\n\nՀարսանիքների համար նաև զարդարում ենք՝ տուփերով, պայուսակներով, սկզբնատառերով։ Ցանկանո՞ւմ եք տեսնել գները կամ պատվիրել։`,
    more: "Լավ 😊 Էլ ի՞նչ կուզենայիք իմանալ։",
    noOk: "Լավ 🙂 Եթե էլի հարց ունենաք, գրեք։",
    unknown: (p) => `Ներողություն, լավ չհասկացա 🙏 Կարող եք հարցնել գների, չափսերի, առաքման կամ հարսանեկան պատվերների մասին։ Կամ զանգահարեք՝ ${p}։`,
    orderChip: "Պատվիրել չատում",
    // ordering
    from: (p) => `${p}-ից`,
    askSize: "Ո՞ր չափսի գաթա եք ուզում։",
    askKind: (s) => `${s}՝ ո՞ր միջուկով։`,
    askChoco: "Ո՞ր շոկոլադով 🍫",
    chocoChips: ["Սև շոկոլադով", "Կաթնային շոկոլադով", "Սպիտակ շոկոլադով"],
    askBox: "Տուփով եք ուզում, թե՞ առանց տուփի։",
    boxChips: ["Այո, տուփով", "Առանց տուփի"],
    boxInfo: "Տուփի գինը կախված է ձևավորումից, այն կհաստատենք պատվերը ընդունելիս 🙂",
    boxGot: "Գրանցեցի՝ տուփով։",
    askQty: "Քանի՞ գաթա է պետք։ Գրեք թիվը։",
    askDate: "Ո՞ր օրվա համար։ Կարող եք գրել, օրինակ՝ 20.10 կամ «վաղը»։",
    dateChips: ["Վաղը", "Մյուս օրը"],
    askDelivery: "Ինչպե՞ս կստանաք գաթան։",
    askYmode: "Երևանում երկու տարբերակ ունենք՝\n• Անվճար վերցնել գաթան «Մեգամոլից»\n• Հավելավճարով կուղարկենք Ձեր նշած հասցեով՝ Yandex Delivery կամ այլ առաքման ծառայությամբ\n\nՈ՞րն եք նախընտրում։",
    askAddress: "Գրեք առաքման հասցեն՝ փողոց, շենք, բնակարան։",
    askName: "Ինչպե՞ս դիմենք Ձեզ։ Գրեք Ձեր անունը։",
    askPhone: "Ձեր հեռախոսահամարը, որով կկապվենք պատվերը հաստատելու համար։",
    askNotes: "Ունե՞ք նշումներ՝ սկզբնատառեր, գույներ, ժամ։",
    notesChip: "Նշում չունեմ",
    askPay: "Ինչպե՞ս կվճարեք։",
    payChips: ["💳 Վճարել հիմա առցանց", "Վճարել ստանալիս"],
    confirmQ: "Ամեն ինչ ճի՞շտ է։",
    confirmChips: ["Հաստատել և ուղարկել", "Փոխել", "Չեղարկել"],
    yourOrder: "📋 Ձեր պատվերը՝",
    gata: "գաթա",
    qty: (n) => `Քանակ՝ ${n} հատ`,
    withBox: "Տուփով", noBox: "Առանց տուփի",
    day: (d) => `Օր՝ ${d}`,
    payOnline: "Վճարում՝ առցանց", payCash: "Վճարում՝ ստանալիս",
    note: (n) => `Նշում՝ ${n}`,
    total: (p) => `💰 Ընդհանուր՝ ${p}`,
    boxLater: " + տուփ (գինը կհաստատենք)",
    delivLater: " + առաքում (հավելավճար)",
    cancelled: "Լավ, պատվերը չեղարկեցի 🙂 Եթե որոշեք, գրեք «պատվիրել», և նորից կսկսենք։",
    changeWhat: "Ի՞նչն եք ուզում փոխել։",
    changeChoose: "Ընտրեք, թե ինչն եք ուզում փոխել։",
    changeAck: "Լավ, փոխենք 🙂",
    fields: { kind: "Միջուկը", pack: "Տուփը", size: "Չափսը", qty: "Քանակը", date: "Օրը", delivery: "Առաքումը", name: "Անունը", phone: "Հեռախոսը", notes: "Նշումը", pay: "Վճարումը" },
    acks: ["Լավ 👍", "Գրանցեցի ✍️", "Հիանալի 😊", "Շատ լավ", "Պարզ է 👌"],
    dateBad: "Կներեք, չհասկացա ամսաթիվը 🙏 Գրեք, օրինակ՝ 20.10 կամ «25 հոկտեմբերի»։",
    phoneBad: "Խնդրում եմ գրեք ամբողջական հեռախոսահամարը, օրինակ՝ 077 12 34 56։",
    sorry: "Կներեք, լավ չհասկացա 🙏 ",
    cont: "Շարունակենք պատվերը 🙂 ",
    past: "Այդ օրն արդեն անցել է 🙂 ",
    soon: (p) => `Այդքան մոտ օրվա համար խնդրում ենք նաև զանգահարել՝ ${p} 🙏\n\n`,
    intro: "Այո, կարող եք պատվիրել հենց այստեղ 😊",
    introGot: (g) => ` Գրանցեցի՝ ${g}։`,
    introNone: " Մի քանի հարց կտամ, և պատվերը պատրաստ կլինի։",
    pcs: (n) => `${n} հատ`,
    sending: "Ուղարկում եմ պատվերը… ⏳",
    received: (id) => `Պատվերը ստացանք ✅ Շնորհակալություն 🤍\nՊատվերի համարը՝ ${id}\n\nՇուտով կզանգենք Ձեզ՝ հաստատելու մանրամասները։`,
    payNow: "💳 Վճարել հիմա",
    payInfo: "Վճարելու համար սեղմեք կոճակը։ Կարող եք վճարել քարտով, Idram-ով կամ Telcell-ով։",
    payFail: "Առցանց վճարումը հիմա հասանելի չէ, կարող եք վճարել գաթան ստանալիս։",
    failed: (p) => `Կներեք, ավտոմատ ուղարկել չհաջողվեց 😔 Խնդրում եմ ուղարկեք պատվերը WhatsApp-ով կամ զանգահարեք՝ ${p}։`,
    wa: "Ուղարկել WhatsApp-ով", copy: "Պատճենել պատվերը", copied: "✓ Պատճենված է", copyFail: "Չհաջողվեց պատճենել",
    plainHead: "Բարև Ձեզ, Գառնու Գաթա։ Նոր պատվեր կայքից՝",
    typing: "Գրում է",
  },
  ru: {
    greet: "Здравствуйте 😊 Рада, что вы написали. Чем помочь — цены, размеры, доставка или заказ?",
    hi: "Здравствуйте 😊",
    thanks: "Пожалуйста 🤍 Если будут ещё вопросы — пишите, я здесь.",
    bye: "Спасибо, что написали 🤍 Ждём ваш заказ.",
    pricesHead: "Наши цены:",
    priceNote: "Цену свадебных коробок и украшения считаем по оформлению.",
    one: (s, f, p) => `${f} гата, ${s.toLowerCase()} — ${p}.`,
    sizeHead: (s) => `${s} гата:`,
    fillHead: (f) => `Цены — ${f.toLowerCase()} гата:`,
    chocoTypes: "Есть с тёмным, молочным и белым шоколадом.",
    chocoYes: "Да, есть шоколадная гата 🍫 с тёмным, молочным и белым шоколадом:",
    sizes: (l) => `Мы печём гату таких размеров: ${l}.`,
    delivOther: (p) => `Сейчас доставляем из Гарни в Ереван и Абовян. Для другого места позвоните: ${p}, обсудим 🙏`,
    orderHint: "Чтобы заказать, напишите «заказать» — я помогу прямо здесь.",
    phone: (p, ig) => `С радостью ответим 📞\n${p.join("\n")}${ig ? `\n\nМожно также написать в Instagram: ${ig}.` : ""}`,
    wantOrder: "Хотите заказать прямо здесь?",
    types: (l) => `У нас есть:\n${l}\n\nДля свадеб также украшаем — коробки, сумочки, инициалы. Показать цены или оформить заказ?`,
    more: "Хорошо 😊 Что ещё хотите узнать?",
    noOk: "Хорошо 🙂 Если будут вопросы — пишите.",
    unknown: (p) => `Извините, не совсем поняла 🙏 Спросите о ценах, размерах, доставке или свадебных заказах. Или позвоните: ${p}.`,
    orderChip: "Заказать в чате",
    from: (p) => `от ${p}`,
    askSize: "Какой размер гаты вы хотите?",
    askKind: (s) => `${s} — с какой начинкой?`,
    askChoco: "С каким шоколадом 🍫",
    chocoChips: ["С тёмным шоколадом", "С молочным шоколадом", "С белым шоколадом"],
    askBox: "Нужна коробка?",
    boxChips: ["Да, в коробке", "Без коробки"],
    boxInfo: "Цена коробки зависит от оформления, мы подтвердим её при приёме заказа 🙂",
    boxGot: "Записала: в коробке.",
    askQty: "Сколько гат нужно? Напишите число.",
    askDate: "На какой день? Например: 20.10 или «завтра».",
    dateChips: ["Завтра", "Послезавтра"],
    askDelivery: "Как вы получите гату?",
    askYmode: "В Ереване есть два варианта:\n• Бесплатно забрать гату в «Мегамолле»\n• За доплату отправим на ваш адрес через Yandex Delivery или другую службу\n\nЧто вам удобнее?",
    askAddress: "Напишите адрес доставки: улица, дом, квартира.",
    askName: "Как к вам обращаться? Напишите ваше имя.",
    askPhone: "Ваш номер телефона, чтобы мы подтвердили заказ.",
    askNotes: "Есть пожелания — инициалы, цвета, время?",
    notesChip: "Без пожеланий",
    askPay: "Как будете оплачивать?",
    payChips: ["💳 Оплатить сейчас онлайн", "Оплатить при получении"],
    confirmQ: "Всё верно?",
    confirmChips: ["Подтвердить и отправить", "Изменить", "Отменить"],
    yourOrder: "📋 Ваш заказ:",
    gata: "гата",
    qty: (n) => `Количество: ${n} шт.`,
    withBox: "В коробке", noBox: "Без коробки",
    day: (d) => `Дата: ${d}`,
    payOnline: "Оплата: онлайн", payCash: "Оплата: при получении",
    note: (n) => `Пожелание: ${n}`,
    total: (p) => `💰 Итого: ${p}`,
    boxLater: " + коробка (цену подтвердим)",
    delivLater: " + доставка (доплата)",
    cancelled: "Хорошо, заказ отменила 🙂 Если решите — напишите «заказать», начнём заново.",
    changeWhat: "Что хотите изменить?",
    changeChoose: "Выберите, что изменить.",
    changeAck: "Хорошо, меняем 🙂",
    fields: { kind: "Начинку", pack: "Коробку", size: "Размер", qty: "Количество", date: "Дату", delivery: "Получение", name: "Имя", phone: "Телефон", notes: "Пожелание", pay: "Оплату" },
    acks: ["Хорошо 👍", "Записала ✍️", "Отлично 😊", "Прекрасно", "Понятно 👌"],
    dateBad: "Извините, не поняла дату 🙏 Напишите, например: 20.10 или «25 октября».",
    phoneBad: "Пожалуйста, напишите полный номер, например: 077 12 34 56.",
    sorry: "Извините, не совсем поняла 🙏 ",
    cont: "Продолжим заказ 🙂 ",
    past: "Этот день уже прошёл 🙂 ",
    soon: (p) => `Для такой близкой даты, пожалуйста, также позвоните: ${p} 🙏\n\n`,
    intro: "Да, можно заказать прямо здесь 😊",
    introGot: (g) => ` Записала: ${g}.`,
    introNone: " Задам несколько вопросов — и заказ готов.",
    pcs: (n) => `${n} шт.`,
    sending: "Отправляю заказ… ⏳",
    received: (id) => `Заказ получили ✅ Спасибо 🤍\nНомер заказа: ${id}\n\nСкоро позвоним, чтобы подтвердить детали.`,
    payNow: "💳 Оплатить сейчас",
    payInfo: "Чтобы оплатить, нажмите кнопку. Можно картой, Idram или Telcell.",
    payFail: "Онлайн-оплата сейчас недоступна — можно оплатить при получении.",
    failed: (p) => `Извините, не удалось отправить автоматически 😔 Отправьте заказ через WhatsApp или позвоните: ${p}.`,
    wa: "Отправить в WhatsApp", copy: "Скопировать заказ", copied: "✓ Скопировано", copyFail: "Не удалось скопировать",
    plainHead: "Здравствуйте, Гарну Гата. Новый заказ с сайта:",
    typing: "Печатает",
  },
  en: {
    greet: "Hello 😊 Glad you wrote. How can I help: prices, sizes, delivery or an order?",
    hi: "Hello 😊",
    thanks: "You're welcome 🤍 If you have more questions, just write, I'm here.",
    bye: "Thank you for writing 🤍 We look forward to your order.",
    pricesHead: "Our prices:",
    priceNote: "Wedding boxes and decorations are priced by design.",
    one: (s, f, p) => `${s} ${f.toLowerCase()} gata: ${p}.`,
    sizeHead: (s) => `${s} gata:`,
    fillHead: (f) => `${f} gata prices:`,
    chocoTypes: "Available with dark, milk and white chocolate.",
    chocoYes: "Yes, we have chocolate gata 🍫 with dark, milk and white chocolate:",
    sizes: (l) => `We bake gata in these sizes: ${l}.`,
    delivOther: (p) => `Right now we deliver from Garni to Yerevan and Abovyan. For other places call us: ${p}, and we'll see 🙏`,
    orderHint: "To order, write \"order\" and I'll help you right here.",
    phone: (p, ig) => `Happy to help 📞\n${p.join("\n")}${ig ? `\n\nYou can also message us on Instagram: ${ig}.` : ""}`,
    wantOrder: "Would you like to order right here?",
    types: (l) => `We have:\n${l}\n\nFor weddings we also decorate: boxes, bags, initials. Want to see prices or order?`,
    more: "Great 😊 What else would you like to know?",
    noOk: "Okay 🙂 If you have more questions, just write.",
    unknown: (p) => `Sorry, I didn't quite get that 🙏 You can ask about prices, sizes, delivery or wedding orders. Or call us: ${p}.`,
    orderChip: "Order in chat",
    from: (p) => `from ${p}`,
    askSize: "Which size would you like?",
    askKind: (s) => `${s}, which filling?`,
    askChoco: "Which chocolate 🍫",
    chocoChips: ["Dark chocolate", "Milk chocolate", "White chocolate"],
    askBox: "Would you like it in a box?",
    boxChips: ["Yes, in a box", "No box"],
    boxInfo: "The box price depends on the design; we'll confirm it when we accept the order 🙂",
    boxGot: "Noted: in a box.",
    askQty: "How many gata do you need? Type the number.",
    askDate: "For which day? For example: 20.10 or \"tomorrow\".",
    dateChips: ["Tomorrow", "Day after tomorrow"],
    askDelivery: "How will you get your gata?",
    askYmode: "In Yerevan there are two options:\n• Pick up free at Megamall\n• For an extra fee we send it to your address by Yandex Delivery or another service\n\nWhich do you prefer?",
    askAddress: "Type the delivery address: street, building, apartment.",
    askName: "What's your name?",
    askPhone: "Your phone number, so we can call to confirm.",
    askNotes: "Any notes? Initials, colours, time?",
    notesChip: "No notes",
    askPay: "How would you like to pay?",
    payChips: ["💳 Pay online now", "Pay on delivery/pickup"],
    confirmQ: "Is everything correct?",
    confirmChips: ["Confirm and send", "Change", "Cancel"],
    yourOrder: "📋 Your order:",
    gata: "gata",
    qty: (n) => `Quantity: ${n}`,
    withBox: "In a box", noBox: "No box",
    day: (d) => `Date: ${d}`,
    payOnline: "Payment: online", payCash: "Payment: on delivery/pickup",
    note: (n) => `Note: ${n}`,
    total: (p) => `💰 Total: ${p}`,
    boxLater: " + box (price to confirm)",
    delivLater: " + delivery (extra fee)",
    cancelled: "Okay, I cancelled the order 🙂 If you change your mind, write \"order\" and we'll start again.",
    changeWhat: "What would you like to change?",
    changeChoose: "Choose what you want to change.",
    changeAck: "Okay, let's change it 🙂",
    fields: { kind: "Filling", pack: "Box", size: "Size", qty: "Quantity", date: "Date", delivery: "Delivery", name: "Name", phone: "Phone", notes: "Note", pay: "Payment" },
    acks: ["Great 👍", "Noted ✍️", "Lovely 😊", "Perfect", "Got it 👌"],
    dateBad: "Sorry, I didn't get the date 🙏 Type for example: 20.10 or \"25 October\".",
    phoneBad: "Please type the full phone number, for example: 077 12 34 56.",
    sorry: "Sorry, I didn't quite get that 🙏 ",
    cont: "Let's continue 🙂 ",
    past: "That day has already passed 🙂 ",
    soon: (p) => `For such a close date please also call us: ${p} 🙏\n\n`,
    intro: "Yes, you can order right here 😊",
    introGot: (g) => ` Noted: ${g}.`,
    introNone: " I'll ask a few questions and your order will be ready.",
    pcs: (n) => `${n} pcs`,
    sending: "Sending your order… ⏳",
    received: (id) => `We got your order ✅ Thank you 🤍\nOrder number: ${id}\n\nWe'll call you soon to confirm the details.`,
    payNow: "💳 Pay now",
    payInfo: "Tap the button to pay by card, Idram or Telcell.",
    payFail: "Online payment isn't available right now; you can pay when you receive your gata.",
    failed: (p) => `Sorry, we couldn't send it automatically 😔 Please send your order by WhatsApp or call: ${p}.`,
    wa: "Send by WhatsApp", copy: "Copy order", copied: "✓ Copied", copyFail: "Couldn't copy",
    plainHead: "Hello Garnu Gata. New order from the website:",
    typing: "Typing",
  },
};

/* form labels */
const F = {
  hy: { title: "Պատվերի ձև", name: "Անուն", namePh: "Աննա", phone: "Հեռախոս", size: "Չափս", kind: "Միջուկ", choco: "Շոկոլադ", box: "Տուփ", noBox: "Առանց տուփի", withBox: "Տուփով", qty: "Քանակ", date: "Ամսաթիվ", how: "Ստանալ", addr: "Առաքման հասցե", addrPh: "Փողոց, շենք, բնակարան", notes: "Նշումներ", notesPh: "Սկզբնատառեր, գույներ, ժամ…", pay: "Վճարում", payOn: "Վճարել հիմա առցանց", payOnS: "Քարտ, Idram, Telcell", payCash: "Վճարել ստանալիս", payCashS: "Կանխիկ կամ փոխանցումով", submit: "Ուղարկել պատվերը", submitPay: "Պատվիրել և վճարել", sending: "Ուղարկում ենք… ⏳", ok: (id) => `Պատվերը ստացանք ✅ Շնորհակալություն 🤍\nՊատվերի համարը՝ ${id}\nՇուտով կզանգենք Ձեզ՝ հաստատելու մանրամասները։`, redirect: "Տեղափոխում ենք վճարման էջ… 💳", need: "Լրացրեք այս դաշտը" },
  ru: { title: "Форма заказа", name: "Имя", namePh: "Анна", phone: "Телефон", size: "Размер", kind: "Начинка", choco: "Шоколад", box: "Коробка", noBox: "Без коробки", withBox: "В коробке", qty: "Количество", date: "Дата", how: "Получение", addr: "Адрес доставки", addrPh: "Улица, дом, квартира", notes: "Пожелания", notesPh: "Инициалы, цвета, время…", pay: "Оплата", payOn: "Оплатить сейчас онлайн", payOnS: "Карта, Idram, Telcell", payCash: "Оплатить при получении", payCashS: "Наличными или переводом", submit: "Отправить заказ", submitPay: "Заказать и оплатить", sending: "Отправляем… ⏳", ok: (id) => `Заказ получили ✅ Спасибо 🤍\nНомер заказа: ${id}\nСкоро позвоним, чтобы подтвердить детали.`, redirect: "Переходим на страницу оплаты… 💳", need: "Заполните это поле" },
  en: { title: "Order form", name: "Name", namePh: "Anna", phone: "Phone", size: "Size", kind: "Filling", choco: "Chocolate", box: "Box", noBox: "No box", withBox: "In a box", qty: "Quantity", date: "Date", how: "Delivery", addr: "Delivery address", addrPh: "Street, building, apartment", notes: "Notes", notesPh: "Initials, colours, time…", pay: "Payment", payOn: "Pay online now", payOnS: "Card, Idram, Telcell", payCash: "Pay on delivery/pickup", payCashS: "Cash or bank transfer", submit: "Send order", submitPay: "Order and pay", sending: "Sending… ⏳", ok: (id) => `We got your order ✅ Thank you 🤍\nOrder number: ${id}\nWe'll call you soon to confirm the details.`, redirect: "Taking you to the payment page… 💳", need: "Please fill this in" },
};
const PAID = {
  hy: { ok: "Վճարումը ստացանք ✅", okT: (id) => `Շնորհակալություն 🤍 Պատվեր ${id}։ Շուտով կզանգենք Ձեզ։`, wait: "Ստուգում ենք վճարումը… ⏳", waitT: "Մի քանի վայրկյան։", bad: "Վճարումը չավարտվեց", badT: "Պատվերը պահպանված է, կզանգենք Ձեզ։ Կարող եք նորից փորձել կամ վճարել ստանալիս։", retry: "Նորից փորձել", close: "Լավ" },
  ru: { ok: "Оплата получена ✅", okT: (id) => `Спасибо 🤍 Заказ ${id}. Скоро позвоним вам.`, wait: "Проверяем оплату… ⏳", waitT: "Несколько секунд.", bad: "Оплата не завершена", badT: "Заказ сохранён, мы позвоним вам. Можно попробовать снова или оплатить при получении.", retry: "Попробовать снова", close: "Хорошо" },
  en: { ok: "Payment received ✅", okT: (id) => `Thank you 🤍 Order ${id}. We'll call you soon.`, wait: "Checking your payment… ⏳", waitT: "Just a few seconds.", bad: "Payment not completed", badT: "Your order is saved and we'll call you. You can try again or pay when you receive it.", retry: "Try again", close: "OK" },
};

/* ================= shared order data ================= */
const MENU = G.menu || { sizes: [], fillings: [], box: { enabled: false } };
const SIZES = MENU.sizes || [];
const FILLS = MENU.fillings || [];
const SHOWN = FILLS.filter((f) => f.show !== false);
const DELIV = G.delivery || [];
const PHONES = (G.phones || []).join(", ");
const fmtL = (n, l) => (+n || 0).toLocaleString("en-US").replace(/,/g, " ") + " " + CUR[l];
const sizeL = (i, l) => (SIZES[i] ? `${tx(SIZES[i].label, l)} (${SIZES[i].cm} ${CM[l]})` : "");
const fill = (id) => FILLS.find((f) => f.id === id);
const dOpt = (id) => DELIV.find((d) => d.id === id);
const pad = (n) => String(n).padStart(2, "0");
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };

/* ================= scenes & motion ================= */
if (G.ring && $("cyl")) $("cyl").innerHTML = G.ring.map((i) => `<div class="face"><img src="${i.src}" alt="${(i.alt || "").replace(/"/g, "&quot;")}" loading="lazy"></div>`).join("");
function layoutRing() {
  if (reduce || !$("cyl")) return;
  const faces = [...document.querySelectorAll(".face")]; if (!faces.length) return;
  const w = $("cyl").offsetWidth;
  const R = Math.round(w / 2 / Math.tan(Math.PI / Math.max(3, faces.length)) + w * 0.12);
  faces.forEach((f, i) => (f.style.transform = `rotateY(${(i * 360) / faces.length}deg) translateZ(${R}px)`));
}

/* mobile menu */
const burger = $("burger"), mm = $("mmenu");
if (burger && mm) {
  const set = (o) => { mm.hidden = !o; burger.setAttribute("aria-expanded", o); };
  burger.addEventListener("click", () => set(mm.hidden));
  mm.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
}

/* ================= order form ================= */
const FL = F[PL];
const form = $("f");
let pickedProduct = "";
function buildForm() {
  if (!form) return;
  if (!G.accept) { form.innerHTML = `<h3>${FL.title}</h3><div class="closed">${G.closedText || ""}<br>📞 ${PHONES}</div>`; return; }
  const opt = (v, l, s) => `<option value="${v}"${s ? " selected" : ""}>${l}</option>`;
  const mid = Math.min(1, SIZES.length - 1);
  form.innerHTML = `
    <h3>${FL.title}</h3>
    <input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;width:1px;height:1px" aria-hidden="true">
    <div class="row">
      <label for="name">${FL.name}<input id="name" required placeholder="${FL.namePh}" autocomplete="name" maxlength="80"></label>
      <label for="phone">${FL.phone}<input id="phone" required placeholder="+374 …" type="tel" autocomplete="tel" maxlength="30"></label>
    </div>
    <div class="row">
      <label for="fsize">${FL.size}<select id="fsize">${SIZES.map((s, i) => opt(i, sizeL(i, PL), i === mid)).join("")}</select></label>
      <label for="kind">${FL.kind}<select id="kind">${SHOWN.map((f) => opt(f.id, tx(f.name, PL))).join("")}</select></label>
    </div>
    <label for="fchoco" id="fchocoL" hidden>${FL.choco}<select id="fchoco">${Object.keys(CHOCO).map((k) => opt(k, tx(CHOCO[k], PL))).join("")}</select></label>
    <div class="row">
      ${MENU.box && MENU.box.enabled ? `<label for="fbox">${FL.box}<select id="fbox">${opt("none", FL.noBox)}${opt("box", FL.withBox)}</select></label>` : ""}
      <label for="qty">${FL.qty}<input id="qty" type="number" min="1" max="9999" value="1" inputmode="numeric"></label>
    </div>
    <div class="row">
      <label for="date">${FL.date}<input id="date" type="date" required></label>
      <label for="how2">${FL.how}<select id="how2">${DELIV.map((d) => opt(d.id, tx(d.label, PL))).join("")}</select></label>
    </div>
    <label for="faddr" id="faddrL" hidden>${FL.addr}<input id="faddr" placeholder="${FL.addrPh}" maxlength="200"></label>
    <label for="notes">${FL.notes}<textarea id="notes" rows="2" placeholder="${FL.notesPh}" maxlength="600"></textarea></label>
    ${G.pay ? `<div class="pay-pick" role="radiogroup" aria-label="${FL.pay}">
      <label><input type="radio" name="pay" value="online" checked><span>${FL.payOn}<small>${FL.payOnS}</small></span></label>
      <label><input type="radio" name="pay" value="cash"><span>${FL.payCash}<small>${FL.payCashS}</small></span></label>
    </div>` : ""}
    <div class="fprice" id="fprice"></div>
    <button class="btn btn-gold" type="submit" id="fsubmit">${FL.submit}</button>
    <div class="done" id="done" hidden></div>`;
  const md = new Date(Date.now() + Math.max(1, G.minDays || 0) * 864e5);
  $("date").min = isoDate(today());
  $("date").value = isoDate(md);
  form.addEventListener("input", fUpdate);
  form.addEventListener("change", fUpdate);
  form.addEventListener("submit", fSubmit);
  fUpdate();
}
function fState() {
  const si = +$("fsize").value, f = fill($("kind").value), q = Math.max(1, parseInt($("qty").value) || 1);
  const unit = f ? +f.prices[si] || 0 : 0, d = dOpt($("how2").value) || {};
  const box = !!($("fbox") && $("fbox").value === "box");
  const boxFee = box && MENU.box.price > 0 ? MENU.box.price * q : 0;
  const dFee = d.price > 0 ? +d.price : 0;
  const pay = (form.querySelector("input[name=pay]:checked") || {}).value || "cash";
  return { si, f, q, unit, box, d, total: unit * q + boxFee + dFee, boxLater: box && !(MENU.box.price > 0), dLater: d.price < 0, dFee, boxFee, pay };
}
function fUpdate() {
  const s = fState();
  $("faddrL").hidden = !s.d.address; $("faddr").required = !!s.d.address;
  $("fchocoL").hidden = !(s.f && s.f.id === "choco");
  let txt = `💰 ${s.q} × ${fmtL(s.unit, PL)}`;
  if (s.boxFee) txt += ` + ${FL.box.toLowerCase()} ${fmtL(s.boxFee, PL)}`;
  if (s.dFee) txt += ` + ${fmtL(s.dFee, PL)}`;
  txt += ` = ${fmtL(s.total, PL)}`;
  if (s.boxLater) txt += T[PL].boxLater;
  if (s.dLater) txt += T[PL].delivLater;
  $("fprice").textContent = txt;
  $("fsubmit").textContent = G.pay && s.pay === "online" ? FL.submitPay : FL.submit;
}
async function postOrder(body) {
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctl.signal });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j.error, status: r.status };
    return j;
  } catch (e) { return { ok: false, network: true }; } finally { clearTimeout(tm); }
}
function waLink(text) { return G.whatsapp ? `https://wa.me/${G.whatsapp}?text=${encodeURIComponent(text)}` : ""; }
async function fSubmit(e) {
  e.preventDefault();
  for (const id of ["name", "phone", "date", "faddr"]) {
    const el = $(id);
    if (el.required && !el.value.trim()) { el.focus(); el.setCustomValidity(FL.need); el.reportValidity(); setTimeout(() => el.setCustomValidity(""), 1500); return; }
  }
  const s = fState(), d = $("done"), btn = $("fsubmit");
  const body = {
    lang: PL, source: "form", filling: s.f && s.f.id, choco: s.f && s.f.id === "choco" ? tx(CHOCO[$("fchoco").value], "hy") : "",
    size: SIZES[s.si] && SIZES[s.si].cm, qty: s.q, box: s.box, date: $("date").value, delivery: s.d.id, address: $("faddr").value,
    name: $("name").value, phone: $("phone").value, notes: (pickedProduct ? pickedProduct + ". " : "") + $("notes").value, pay: s.pay,
    website: form.querySelector("input[name=website]").value,
  };
  btn.disabled = true; d.hidden = false; d.textContent = FL.sending;
  const r = await postOrder(body);
  btn.disabled = false;
  if (r.ok) {
    if (r.checkoutUrl) { d.textContent = FL.redirect; location.href = r.checkoutUrl; return; }
    d.textContent = FL.ok(r.id) + (r.payError ? "\n\n" + T[PL].payFail : "");
    form.querySelectorAll("input:not([type=radio]):not([name=website]),textarea").forEach((i) => { if (i.id !== "qty" && i.id !== "date") i.value = ""; });
    pickedProduct = "";
  } else if (r.error) {
    d.textContent = "⚠️ " + r.error;
  } else {
    const txt = `${T[PL].plainHead}\n\n• ${tx(s.f && s.f.name, PL)}, ${sizeL(s.si, PL)}\n• ${T[PL].qty(s.q)}\n• ${s.box ? T[PL].withBox : T[PL].noBox}\n• ${body.date}\n• ${tx(s.d.label, PL)}${body.address ? ", " + body.address : ""}\n• ${body.name}, ${body.phone}${body.notes ? "\n• " + body.notes : ""}\n\n${T[PL].total(fmtL(s.total, PL))}`;
    d.textContent = T[PL].failed(PHONES) + "\n\n";
    const link = waLink(txt);
    if (link) { const w = document.createElement("div"); w.className = "qr"; w.innerHTML = `<a class="wa" target="_blank" rel="noopener">💬 ${T[PL].wa}</a>`; w.firstChild.href = link; d.appendChild(w); }
  }
  d.scrollIntoView({ behavior: "smooth", block: "center" });
}
buildForm();
document.querySelectorAll("[data-pick]").forEach((a) => a.addEventListener("click", () => {
  pickedProduct = a.dataset.pick;
  if ($("notes") && !$("notes").value) $("notes").placeholder = a.dataset.pick;
}));

/* ================= chat assistant ================= */
/* keyword stems; a word matches if it starts with the stem (stems of 5+ letters also allow one typo) */
const INTENTS = {
  greet: ["բարև", "բարեւ", "ողջույն", "բարի", "barev", "barew", "bari", "voghj", "hello", "hi", "hey", "salam", "привет", "здравств", "добрый", "салам"],
  thanks: ["շնորհակ", "մերսի", "ապրեք", "ապրես", "shnorh", "mersi", "merci", "aprek", "apres", "thank", "thx", "спасиб", "благодар"],
  bye: ["ցտեսություն", "հաջող", "ctesutyun", "hajogh", "bye", "пока", "до свид"],
  price: ["գին*", "գնե", "գինը", "գինն", "արժ", "ինչքան", "ինչքա", "որքան", "դրամ", "դր", "gin*", "giny", "gine", "gner", "gnern", "arj*", "arzh", "arzhe", "inchqan", "inchkan", "inch kan", "inchqa", "vorqan", "dram", "price", "cost", "how much", "цен", "сколько", "стоит", "стоим", "прайс", "драм"],
  fill: ["ընկույզ", "enkuyz", "nkuyz", "չրեր", "chrer", "չամիչ", "chamich", "խուրմ", "xurm", "khurm", "орех", "изюм", "хурм", "финик", "walnut", "raisin", "сухофрукт"],
  choco: ["շոկոլ", "shokol", "chokol", "chocol", "chocolate", "choco", "шокол", "шоколад"],
  size: ["չափ", "սմ", "փոքր", "միջին", "մեծ*", "chap*", "sm", "poqr", "pokr", "mijin", "mec*", "mets", "size", "small", "medium", "large", "big", "размер", "см", "маленьк", "средн", "больш"],
  delivery: ["մեգամոլ", "megamol", "megamall", "мегамол", "яндекс", "yandex", "առաք", "բեր*", "հասցն", "երևան", "երեւան", "աբովյան", "գյումրի", "վանաձոր", "մարզ", "araq", "arak", "ber*", "hascn", "yerevan", "erevan", "abovyan", "deliver", "shipping", "доставк", "привез", "ереван", "абовян"],
  phone: ["հեռախ", "զանգ", "կապ*", "համարը", "համարն", "համար տվ", "վայբեր", "վոթսափ", "heraxos", "herakhos", "zang", "kap*", "hamary", "hamar@", "hamarn", "hamar tv", "nomer", "viber", "whatsapp", "phone", "call", "number", "contact", "телефон", "номер", "звон", "связ", "вайбер"],
  where: ["որտեղ", "հասցե", "գառնի", "գտնվ", "vortegh", "vorteg", "hasce", "garni", "where", "address", "location", "где", "адрес", "гарни"],
  order: ["պատվ", "պատվեր", "գնել", "order", "buy", "patver", "patvir", "gnel", "заказ", "закаж", "купить"],
  wedding: ["հարսան", "նշանդր", "կնունք", "տոն*", "միջոցառ", "հյուր", "տուփ", "պայուսակ", "սկզբնատառ", "զարդ", "մարգարիտ", "harsan", "nshandr", "knunq", "ton*", "hyur", "tup*", "payusak", "zard", "margarit", "wedding", "event", "box", "bag", "decor", "initial", "guest", "свадьб", "помолв", "крестин", "коробк", "упаковк", "инициал", "декор"],
  khoriz: ["խորիզ", "միջուկ", "բաղադր", "ինչից", "ինչ է գաթ", "xoriz", "khoriz", "mijuk", "baghadr", "filling", "ingredient", "начинк", "состав", "хориз", "what is gata"],
  fresh: ["թարմ", "պահ*", "քանի օր", "սառնարան", "tarm", "pah*", "qani or", "fresh", "store", "keep", "свеж", "хран"],
  when: ["առաջ", "araj", "arach", "advance", "ahead", "заранее", "երբ", "քանի օր առաջ", "որքան շուտ", "այսօր", "վաղը", "erb", "aysor", "vaghy", "vaxy", "when", "today", "tomorrow", "когда", "сегодня", "завтра"],
  hours: ["ժամ*", "բաց եք", "աշխատ", "zham*", "jam*", "bac ek", "ashxat", "open", "hours", "час", "работ", "открыт"],
  pay: ["վճար", "քարտ", "կանխիկ", "փոխանց", "vchar", "qart", "kanxik", "pay", "card", "cash", "оплат", "карт", "налич", "idram", "telcell"],
  types: ["տեսակ", "ինչ ունեք", "ինչ գաթա", "մենյու", "tesak", "inch unek", "menu", "what do you", "types", "какие", "что есть", "меню", "ассортимент"],
  yes: ["այո", "հա", "լավ", "օքեյ", "ok", "okay", "ayo", "ha", "lav", "da", "да", "хорошо", "ладно", "yes", "sure"],
  no: ["ոչ", "չէ", "voch", "che", "no", "нет"],
};
function norm(s) { return String(s).toLowerCase().replace(/[՞՛՜։՝«»"'`.,!?;:()\-–—_/\\·]+/g, " ").replace(/\s+/g, " ").trim(); }
function lev(a, b) {
  const m = a.length, n = b.length; if (Math.abs(m - n) > 1) return 2;
  const d = Array.from({ length: m + 1 }, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function score(text) {
  const t = " " + norm(text) + " ", words = t.trim().split(" "), hit = {};
  for (const [intent, stems] of Object.entries(INTENTS)) {
    for (const st of stems) {
      let ok = false;
      const pre = st.endsWith("*"), s0 = pre ? st.slice(0, -1) : st;
      if (s0.includes(" ")) ok = t.includes(" " + s0);
      else if (s0.length <= 3) ok = words.some((w) => w === s0 || (pre && w.startsWith(s0)));
      else ok = words.some((w) => w.startsWith(s0) || (s0.length >= 5 && w.length >= s0.length && lev(w.slice(0, s0.length), s0) <= 1));
      if (ok) { hit[intent] = (hit[intent] || 0) + 1; break; }
    }
  }
  return hit;
}

let CL = PL; // language of the conversation
const L = () => T[CL];
const fmt = (n) => fmtL(n, CL);
const ans = (k) => tx((G.answers || {})[k], CL).replace(/\{phones\}/g, PHONES).replace(/\{instagram\}/g, G.instagram || "");

const FILL_KW = {
  choco: /շոկոլ|shokol|chokol|chocol|шокол/,
  walnut: /ընկույզ|enkuyz|ynkuyz|nkuyz|ankuyz|орех|walnut|(^|\s)nut/,
  raisin: /չրեր|chrer|չամիչ|chamich|изюм|raisin|сухофрукт|dried/,
  date: /խուրմ|xurm|khurm|хурм|финик|(^|\s)dates?(\s|$)/,
  classic: /դասական|dasakan|klasik|classic|класс|խորիզ|xoriz|khoriz|սովորական գաթա/,
};
function fillFrom(h) {
  for (const f of FILLS) for (const l of ["hy", "ru", "en"]) {
    const n = norm(tx(f.name, l)), s = norm(tx(f.short, l));
    if ((n && h.includes(n)) || (s && s.length > 3 && h.includes(s))) return f.id;
  }
  for (const id of Object.keys(FILL_KW)) if (fill(id) && FILL_KW[id].test(h)) return id;
  return null;
}
function sizeFrom(text) {
  const h = norm(text.replace(/\d{1,2}[./-]\d{1,2}([./-]\d{2,4})?/g, " "));
  for (let i = 0; i < SIZES.length; i++) {
    const n = SIZES[i].cm;
    if (new RegExp("(^|\\s)" + n + "\\s*(սմ|sm|см|cm)|^" + n + "$").test(h)) return i;
  }
  if (/փոքր|poqr|pokr|poxr|small|маленьк/.test(h)) return 0;
  if (/միջին|mijin|medium|средн/.test(h) && SIZES.length > 1) return 1;
  if (/մեծ|(^|\s)mec|(^|\s)mets|large|(^|\s)big|больш/.test(h)) return SIZES.length - 1;
  return -1;
}
const priceList = () => SHOWN.map((f) => `${tx(f.short, CL)}: ${f.prices.map(fmt).join(" / ")}`).join("\n") + `\n(${SIZES.map((s, i) => sizeL(i, CL).toLowerCase()).join(" / ")})`;

let lastTopic = null;
const R = {
  greet: () => L().greet,
  thanks: () => L().thanks,
  bye: () => L().bye,
  price: (t) => {
    const s = sizeFrom(t), f = fill(fillFrom(norm(t)));
    if (s >= 0 && f) return L().one(sizeL(s, CL), tx(f.short, CL), fmt(f.prices[s]));
    if (s >= 0) return L().sizeHead(sizeL(s, CL)) + "\n" + SHOWN.map((x) => `• ${tx(x.short, CL)}: ${fmt(x.prices[s])}`).join("\n");
    if (f) return L().fillHead(tx(f.short, CL)) + "\n" + f.prices.map((p, i) => `• ${sizeL(i, CL)}: ${fmt(p)}`).join("\n") + (f.id === "choco" ? "\n\n" + L().chocoTypes : "");
    return `${L().pricesHead}\n\n${priceList()}\n\n${L().priceNote}`;
  },
  fill: (t) => R.price(t),
  choco: (t) => {
    const f = fill("choco"); if (!f) return R.types();
    const s = sizeFrom(t);
    if (s >= 0) return L().one(sizeL(s, CL), tx(f.short, CL), fmt(f.prices[s])) + " " + L().chocoTypes;
    return L().chocoYes + "\n" + f.prices.map((p, i) => `• ${sizeL(i, CL)}: ${fmt(p)}`).join("\n");
  },
  size: (t) => (sizeFrom(t) >= 0 ? R.price(t) : L().sizes(SIZES.map((s, i) => sizeL(i, CL).toLowerCase()).join(", ")) + "\n\n" + priceList()),
  delivery: (t) => {
    if (/գյումրի|վանաձոր|մարզ|gyumri|vanadzor|marz|другой|город/.test(norm(t))) return L().delivOther(PHONES);
    return ans("delivery") + "\n\n" + L().orderHint;
  },
  phone: () => L().phone(G.phones || [], G.instagram),
  where: () => ans("where"),
  order: () => L().orderHint,
  wedding: () => ans("wedding") + "\n\n" + L().wantOrder,
  khoriz: () => ans("khoriz"),
  fresh: () => ans("fresh"),
  when: () => ans("when"),
  hours: () => ans("hours"),
  pay: () => ans("pay"),
  types: () => L().types(SHOWN.map((f) => "• " + tx(f.name, CL)).join("\n")),
  yes: () => (lastTopic === "types" ? R.price("") : L().more),
  no: () => L().noOk,
  unknown: () => L().unknown(PHONES),
};
const ORDER = ["price", "fill", "choco", "size", "delivery", "phone", "where", "wedding", "khoriz", "fresh", "when", "hours", "pay", "types", "order", "thanks", "bye", "greet", "yes", "no"];
function reply(text) {
  const h = score(text);
  if (!Object.keys(h).length || (Object.keys(h).length === 1 && h.size)) {
    if (sizeFrom(text) >= 0 && ["price", "choco", "size"].includes(lastTopic)) return { text: R.price(text + (lastTopic === "choco" ? " shokolad" : "")), topic: lastTopic };
  }
  let found = ORDER.filter((k) => h[k]);
  if (found.some((k) => ["price", "choco", "fill", "wedding"].includes(k))) found = found.filter((k) => k !== "size");
  if (found.includes("when")) found = found.filter((k) => k !== "fresh" && k !== "order");
  if (found.includes("price")) found = found.filter((k) => k !== "choco" && k !== "fill");
  if (found.includes("fill")) found = found.filter((k) => k !== "choco");
  if (found.length > 1) found = found.filter((k) => !["greet", "yes", "no"].includes(k));
  if (!found.length) return { text: R.unknown(), topic: null, unknown: true };
  const parts = [];
  if (h.greet && found.length && !found.includes("greet")) parts.push(L().hi);
  found.slice(0, 3).forEach((k) => parts.push(R[k](text)));
  return { text: parts.join("\n\n"), topic: found[0] };
}

/* ---------- ordering inside the chat ---------- */
const MONTHS = [["հունվ", "hunv", "янв", "jan"], ["փետր", "petr", "фев", "feb"], ["մարտ", "mart", "мар", "mar"], ["ապր", "apr", "апр"], ["մայ", "may", "мая", "май"], ["հունիս", "hunis", "июн", "jun"], ["հուլիս", "hulis", "июл", "jul"], ["օգոստ", "ogost", "авг", "aug"], ["սեպտ", "sept", "сен", "sep"], ["հոկտ", "hokt", "окт", "oct"], ["նոյ", "noy", "ноя", "nov"], ["դեկտ", "dekt", "дек", "dec"]];
const fmtDate = (d) => (CL === "en" ? `${d.getDate()} ${MON.en[d.getMonth()]}` : `${d.getDate()} ${MON[CL][d.getMonth()]}`);
function chocoFrom(h) {
  if (/սև|sev\b|черн|тёмн|темн|dark|black|bitter/.test(h)) return "dark";
  if (/կաթնային|katnayin|katn|молоч|milk/.test(h)) return "milk";
  if (/սպիտակ|spitak|бел|white/.test(h)) return "white";
  return null;
}
const NO_RE = /առանց|без|without|aranc|arants|(^|\s)(ոչ|չէ|voch|che|no|нет|не)(\s|$)|պետք չէ|petq che|chem uzum|չեմ ուզում|no box/;
const BOX_RE = /տուփ|(^|\s)tup|box|коробк/;
function boxFrom(h, asked) {
  if (asked) { if (NO_RE.test(h)) return "none"; if (/այո|(^|\s)(ha|da|да|yes|ok)(\s|$)|petq e|պետք է/.test(h) || BOX_RE.test(h)) return "box"; return null; }
  return BOX_RE.test(h) && !NO_RE.test(h) ? "box" : null;
}
const D_KW = {
  megamall: /մեգամոլ|megamol|megamall|мегамол/,
  abovyan: /աբովյան|abovyan|abovian|абовян/,
  pickup: /վերցն|ինքս|գառնիից|verc|garniic|garnic|pickup|pick up|самовывоз|заберу|из гарни/,
  yerevan: /երևան|երեւան|yerevan|erevan|ереван/,
};
const ADDR_RE = /հասցե|hasce|address|адрес|yandex|յանդեքս|яндекс|ուղարկ|uxark|tun|տուն|домой|my address|իմ հասցե/;
function delivFrom(h) {
  for (const d of DELIV) for (const l of ["hy", "ru", "en"]) { const n = norm(tx(d.label, l)); if (n && h === n) return { id: d.id }; }
  if (D_KW.megamall.test(h) && dOpt("megamall")) return { id: "megamall" };
  if (D_KW.abovyan.test(h) && dOpt("abovyan")) return { id: "abovyan" };
  if (D_KW.yerevan.test(h) && dOpt("yerevan")) {
    if (ADDR_RE.test(h) || !dOpt("megamall")) return { id: "yerevan" };
    return { group: "yerevan" };
  }
  if (D_KW.pickup.test(h) && dOpt("pickup")) return { id: "pickup" };
  for (const d of DELIV) for (const l of ["hy", "ru", "en"]) { const n = norm(tx(d.label, l)); if (n && n.length > 4 && h.includes(n)) return { id: d.id }; }
  return null;
}
function dateFrom(t) {
  const h = norm(t), d0 = today(), add = (n) => { const d = new Date(d0); d.setDate(d.getDate() + n); return d; };
  if (/մյուս օր|myus or|mius or|послезавтра|day after/.test(h)) return add(2);
  if (/այսօր|aysor|сегодня|today/.test(h)) return add(0);
  if (/վաղը|vaghy|vaxy|vagh@|vaxe|завтра|tomorrow/.test(h)) return add(1);
  let m = t.match(/(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?/);
  if (m && +m[2] >= 1 && +m[2] <= 12 && +m[1] >= 1 && +m[1] <= 31) {
    const y = m[3] ? (+m[3] < 100 ? 2000 + +m[3] : +m[3]) : d0.getFullYear();
    const d = new Date(y, +m[2] - 1, +m[1]); if (!m[3] && d < d0) d.setFullYear(y + 1); return d;
  }
  const words = h.split(" ");
  for (let i = 0; i < 12; i++) {
    const wi = words.findIndex((w) => MONTHS[i].some((st) => w.startsWith(st)));
    if (wi < 0) continue;
    const num = [words[wi - 1], words[wi + 1]].map((x) => (x && /^\d{1,2}(ին|in|ի|y|th|st|nd|rd|го)?$/.test(x) ? parseInt(x) : NaN)).find((n) => n >= 1 && n <= 31);
    if (num) { const d = new Date(d0.getFullYear(), i, num); if (d < d0) d.setFullYear(d.getFullYear() + 1); return d; }
  }
  return null;
}
const NUMW = { "մեկ": 1, mek: 1, "один": 1, one: 1, "երկու": 2, erku: 2, "два": 2, two: 2, "երեք": 3, ereq: 3, erek: 3, "три": 3, three: 3, "չորս": 4, chors: 4, "четыре": 4, four: 4, "հինգ": 5, hing: 5, "пять": 5, five: 5, "վեց": 6, vec: 6, "шесть": 6, six: 6, "յոթ": 7, yot: 7, "семь": 7, seven: 7, "ութ": 8, ut: 8, "восемь": 8, eight: 8, "ինը": 9, iny: 9, "девять": 9, nine: 9, "տասը": 10, tasy: 10, tas: 10, "десять": 10, ten: 10, "տասներկու": 12, tasnerku: 12, "двенадцать": 12, twelve: 12, "քսան": 20, qsan: 20, "двадцать": 20, twenty: 20, "երեսուն": 30, eresun: 30, "հիսուն": 50, hisun: 50, "հարյուր": 100, haryur: 100, "сто": 100 };
function qtyFrom(t, asked) {
  const h = norm(t.replace(/\d{1,2}[./-]\d{1,2}([./-]\d{2,4})?/g, " "));
  let m = h.match(/(\d{1,4})\s*(?:[^\s\d]+\s+)?(հատ|hat|գաթա|gata|kata|qata|шт|штук|гат|pcs|pieces|tup|տուփ|payusak|պայուսակ)/);
  if (m) return +m[1];
  if (asked) {
    m = h.match(/(?:^|\s)(\d{1,4})(?:\s|$)/);
    if (m && !/^\s*(սմ|sm|см|cm)/.test(h.slice(h.indexOf(m[1]) + m[1].length))) return +m[1];
    for (const w of h.split(" ")) if (NUMW[w]) return NUMW[w];
  }
  return null;
}

let O = null, waiting = null;
const BOX_ON = !!(MENU.box && MENU.box.enabled);
const newOrder = () => ({ kind: null, choco: null, pack: BOX_ON ? null : "none", size: null, qty: null, date: null, delivery: null, dGroup: null, address: null, name: null, phone: null, notes: null, pay: G.pay ? null : "cash" });
const STEPS = ["size", "kind", "choco", "pack", "qty", "date", "delivery", "ymode", "address", "name", "phone", "notes", "pay"];
function need(k) {
  if (k === "choco") return O.kind === "choco" && !O.choco;
  if (k === "delivery") return !O.delivery && !O.dGroup;
  if (k === "ymode") return !O.delivery && !!O.dGroup;
  if (k === "address") return !!(dOpt(O.delivery) || {}).address && O.address == null;
  return O[k] == null;
}
const unitPrice = () => +fill(O.kind).prices[O.size] || 0;
function totals() {
  const d = dOpt(O.delivery) || {}, q = O.qty || 1;
  const boxFee = O.pack === "box" && MENU.box.price > 0 ? MENU.box.price * q : 0;
  return { total: unitPrice() * q + boxFee + (d.price > 0 ? +d.price : 0), boxLater: O.pack === "box" && !(MENU.box.price > 0), dLater: d.price < 0 };
}
function prompt(st) {
  const l = L();
  switch (st) {
    case "size": return { text: l.askSize, chips: SIZES.map((s, i) => `${sizeL(i, CL)} · ${l.from(fmt(Math.min(...SHOWN.map((f) => +f.prices[i] || 1e9))))}`) };
    case "kind": return { text: l.askKind(sizeL(O.size, CL)), chips: SHOWN.map((f) => `${tx(f.name, CL)} · ${fmt(f.prices[O.size])}`) };
    case "choco": return { text: l.askChoco, chips: l.chocoChips };
    case "pack": return { text: l.askBox, chips: l.boxChips };
    case "qty": return { text: l.askQty, chips: ["1", "2", "5", "10", "20"] };
    case "date": return { text: l.askDate, chips: l.dateChips };
    case "delivery": return { text: l.askDelivery, chips: DELIV.map((d) => tx(d.label, CL)) };
    case "ymode": return { text: l.askYmode, chips: DELIV.filter((d) => d.id === "megamall" || d.id === "yerevan").map((d) => tx(d.label, CL)) };
    case "address": return { text: l.askAddress, chips: [] };
    case "name": return { text: l.askName, chips: [] };
    case "phone": return { text: l.askPhone, chips: [] };
    case "notes": return { text: l.askNotes, chips: [l.notesChip] };
    case "pay": return { text: l.askPay, chips: l.payChips };
    case "confirm": return { text: summary() + "\n\n" + l.confirmQ, chips: l.confirmChips };
  }
}
function summary() {
  const l = L(), f = fill(O.kind), d = dOpt(O.delivery) || {}, tt = totals();
  const lines = [l.yourOrder,
    `• ${tx(f.name, CL)}${O.kind === "choco" && O.choco ? ` (${tx(CHOCO[O.choco], CL)})` : ""}, ${sizeL(O.size, CL)}`,
    `• ${l.qty(O.qty)}`];
  if (BOX_ON) lines.push(`• ${O.pack === "box" ? l.withBox : l.noBox}`);
  lines.push(`• ${l.day(fmtDate(O.date))}`, `• ${tx(d.label, CL)}${O.address ? `, ${O.address}` : ""}`, `• ${O.name}, ${O.phone}`);
  if (O.notes) lines.push(`• ${l.note(O.notes)}`);
  if (G.pay) lines.push(`• ${O.pay === "online" ? l.payOnline : l.payCash}`);
  lines.push("", l.total(fmt(tt.total)) + (tt.boxLater ? l.boxLater : "") + (tt.dLater ? l.delivLater : ""));
  return lines.join("\n");
}
const CHANGE = [
  ["kind", /միջուկ|mijuk|տեսակ|tesak|начин|вид|kind|filling/, () => { O.kind = null; O.choco = null; }],
  ["pack", /տուփ|tup|box|короб/, () => { O.pack = null; }],
  ["size", /չափ|chap|size|размер/, () => { O.size = null; }],
  ["qty", /քանակ|qanak|qty|quantity|колич/, () => { O.qty = null; }],
  ["date", /օր|ամսաթ|or\b|date|дат|день/, () => { O.date = null; }],
  ["delivery", /առաք|araq|deliv|достав|получ|վերցն/, () => { O.delivery = null; O.dGroup = null; O.address = null; }],
  ["name", /անուն|anun|name|имя/, () => { O.name = null; }],
  ["phone", /հեռախ|herax|phone|телеф/, () => { O.phone = null; }],
  ["notes", /նշում|nshum|note|пожел|примеч/, () => { O.notes = null; }],
  ["pay", /վճար|vchar|pay|оплат/, () => { O.pay = null; }],
].filter((c) => (c[0] !== "pack" || BOX_ON) && (c[0] !== "pay" || G.pay));
const changeChips = () => CHANGE.map((c) => L().fields[c[0]]);
let ackI = 0;
function nextAsk(pre) {
  let note = "", extra = "";
  if (O.date && O.date < today()) { O.date = null; note = L().past; }
  const st = STEPS.find(need) || "confirm";
  waiting = st; const p = prompt(st);
  if ((st === "delivery" || st === "confirm") && O.date && (O.date - today()) / 864e5 < Math.max(1, G.minDays || 0) && !O._warned) { extra = L().soon(PHONES); O._warned = true; }
  return { text: (pre ? pre + "\n\n" : "") + note + extra + p.text, chips: p.chips };
}
function startOrder(t) {
  if (!G.accept) return { text: (G.closedText || "") + "\n📞 " + PHONES, chips: [] };
  O = newOrder(); waiting = null; extract(t, null);
  const got = [];
  if (O.kind) got.push(tx(fill(O.kind).short, CL).toLowerCase() + (CL === "hy" ? " գաթա" : CL === "ru" ? "" : " gata"));
  if (O.qty) got.push(L().pcs(O.qty));
  if (O.size != null) got.push(sizeL(O.size, CL).toLowerCase());
  if (O.date) got.push(fmtDate(O.date));
  if (O.delivery) got.push(tx(dOpt(O.delivery).label, CL).toLowerCase());
  return nextAsk(L().intro + (got.length ? L().introGot(got.join(", ")) : L().introNone));
}
function extract(t, step) {
  const h = norm(t);
  if (!O.kind) { const f = fillFrom(h); if (f) O.kind = f; }
  if (O.kind === "choco" && !O.choco) { const c = chocoFrom(h); if (c) O.choco = c; }
  if (BOX_ON && !O.pack) { const p = boxFrom(h, step === "pack"); if (p) O.pack = p; }
  if (O.size == null) { const s = sizeFrom(t.replace(/մեծ պատվեր|mec patver|mets patver|большой заказ|big order/gi, "")); if (s >= 0 && (step === "size" || /սմ|sm|см|cm|փոքր|միջին|մեծ|poqr|pokr|mijin|mec|mets|small|medium|large|big|маленьк|средн|больш/.test(h))) O.size = s; }
  if (!O.date) { const d = dateFrom(t); if (d) O.date = d; }
  if (O.qty == null) { const q = qtyFrom(t, step === "qty"); if (q) O.qty = q; }
  if (!O.delivery) { const dv = delivFrom(h); if (dv) { if (dv.id) { O.delivery = dv.id; O.dGroup = null; } else if (!O.dGroup) O.dGroup = dv.group; } }
}
function plainOrder() { return L().plainHead + "\n\n" + summary().split("\n").slice(1).join("\n").replace("💰 ", ""); }
function finish() {
  const msg = plainOrder();
  const f = fill(O.kind);
  const body = {
    lang: CL, source: "chat", filling: O.kind, choco: O.choco ? tx(CHOCO[O.choco], "hy") : "", size: SIZES[O.size].cm, qty: O.qty,
    box: O.pack === "box", date: isoDate(O.date), delivery: O.delivery, address: O.address || "", name: O.name, phone: O.phone, notes: O.notes || "", pay: O.pay,
  };
  const saved = O;
  O = null; waiting = null;
  return { text: L().sending, chips: [], submit: { body, msg, saved, f } };
}
function orderTurn(t) {
  const h = norm(t), l = L();
  if (/չեղարկ|cheghark|chexark|cancel|отмен|(^|\s)stop|стоп/.test(h)) { O = null; waiting = null; return { text: l.cancelled, chips: [l.orderChip] }; }
  if (waiting === "confirm") {
    if (/հաստատ|hastat|ուղարկ|uxark|ughark|այո|ayo|^ha$|^да|подтвер|yes|^ok|confirm|send/.test(h)) return finish();
    if (/փոխ|pox|poch|change|измен/.test(h)) { waiting = "change"; return { text: l.changeWhat, chips: changeChips() }; }
  }
  if (waiting === "change") {
    const c = CHANGE.find((c) => c[1].test(h) || norm(l.fields[c[0]]) === h);
    if (!c) return { text: l.changeChoose, chips: changeChips() };
    c[2](); return nextAsk(l.changeAck);
  }
  const before = JSON.stringify(O);
  const sc = score(t), isQ = /[?՞]/.test(t) || ["price", "choco", "delivery", "phone", "where", "khoriz", "fresh", "when", "hours", "pay", "types", "wedding"].some((k) => sc[k] && !(waiting === "address" && k === "delivery") && !(waiting === "pay" && k === "pay"));
  if (["address", "name", "notes"].includes(waiting) && isQ && !(waiting === "notes" && /սկզբնատառ|skzbnatar|initial|инициал/.test(h))) {
    const p = prompt(waiting);
    if (sc.price && O.kind && O.size != null) {
      const u = unitPrice(), q = O.qty || 1;
      return { text: `${tx(fill(O.kind).short, CL)}, ${sizeL(O.size, CL)}: ${fmt(u)}` + (O.qty ? ` × ${q} = ${fmt(u * q)}` : "") + "\n\n" + l.cont + p.text, chips: p.chips };
    }
    const r = reply(t);
    return { text: r.text + "\n\n" + l.cont + p.text, chips: p.chips };
  }
  if (waiting === "pack" && (sc.price || /[?՞]/.test(t)) && BOX_RE.test(h)) {
    if (NO_RE.test(h)) return { text: l.boxInfo + "\n\n" + prompt("pack").text, chips: prompt("pack").chips };
    O.pack = "box"; return nextAsk(l.boxInfo + " " + l.boxGot);
  }
  if (waiting === "pack" && !/[?՞]/.test(t) && !sc.price) { const p = boxFrom(h, true); if (p) O.pack = p; else extract(t, waiting); }
  else if (waiting === "ymode") {
    for (const d of DELIV) if (norm(tx(d.label, CL)) === h) { O.delivery = d.id; O.dGroup = null; }
    if (!O.delivery) {
      if (/մեգամոլ|megamol|megamall|мегамол|անվճար|anvchar|free|бесплат|վերցն|verc|заберу/.test(h)) { O.delivery = "megamall"; O.dGroup = null; }
      else if (ADDR_RE.test(h) || /առաք|araq|arak|достав|deliver/.test(h)) { O.delivery = "yerevan"; O.dGroup = null; }
    }
  }
  else if (waiting === "address") { if (h.length >= 3) O.address = t.trim().slice(0, 200); }
  else if (waiting === "name") {
    const n = t.trim().replace(/^(իմ անունը|anuns|anunu|menya zovut|меня зовут|my name is|i am|i'm|ես)\s*/i, "").replace(/\s+(է|e|em|եմ)$/i, "");
    if (n.length >= 2 && n.length <= 40 && !/\d{4}/.test(n)) O.name = n;
  }
  else if (waiting === "phone") { const d = t.replace(/\D/g, ""); if (d.length >= 8 && d.length <= 13) O.phone = t.trim(); }
  else if (waiting === "notes") { O.notes = /^(ոչ|չէ|չունեմ|voch|che|chunem|no|нет|не|без)(\s|$)|նշում չունեմ|nshum chunem|no notes|без пожел/.test(h) ? "" : t.trim().slice(0, 600); }
  else if (waiting === "pay") {
    if (/առցանց|onlayn|online|онлайн|հիմա|now|сейчас|քարտ|qart|card|карт|idram|telcell/.test(h)) O.pay = "online";
    else if (/ստանալիս|կանխիկ|stanalis|kanxik|cash|налич|получен|delivery|pickup|later|հետո|потом/.test(h)) O.pay = "cash";
  }
  else extract(t, waiting);
  if (JSON.stringify(O) === before) {
    if (waiting === "date" && /\d/.test(t)) return { text: l.dateBad, chips: prompt("date").chips };
    if (waiting === "phone") return { text: l.phoneBad, chips: [] };
    const r = reply(t), p = prompt(waiting);
    if (r.topic && !["yes", "no", "greet", "order"].includes(r.topic)) return { text: r.text + "\n\n" + l.cont + p.text, chips: p.chips };
    return { text: l.sorry + p.text, chips: p.chips };
  }
  return nextAsk(l.acks[ackI++ % l.acks.length]);
}
function respond(t) {
  if (/[а-яё]/i.test(t)) CL = "ru"; else if (/[Ա-և]/.test(t)) CL = "hy";
  if (O) return orderTurn(t);
  const h = score(t), n = norm(t);
  if (h.order || /պատվիրել չատում|chatum|в чате|in chat/.test(n) || qtyFrom(t, false)) return startOrder(t);
  const r = reply(t);
  return { text: r.text, topic: r.topic, unknown: r.unknown, chips: ["price", "choco", "wedding", "types", "size"].includes(r.topic) ? [L().orderChip] : [] };
}

/* conversation UI: typing indicator, quick replies, human-like pace */
let busy = false;
function add(text, who) {
  const m = document.createElement("div"); m.className = "m " + who; m.textContent = text;
  $("msgs").appendChild(m); $("msgs").scrollTop = 1e6; return m;
}
function typing() {
  const t = document.createElement("div"); t.className = "m bot typing"; t.setAttribute("aria-label", L().typing);
  t.innerHTML = "<i></i><i></i><i></i>"; $("msgs").appendChild(t); $("msgs").scrollTop = 1e6; return t;
}
function addExtras(r) {
  if (r.link || r.copy || r.pay) {
    const w = document.createElement("div"); w.className = "qr keep";
    if (r.pay) { const a = document.createElement("a"); a.className = "pay"; a.href = r.pay; a.textContent = L().payNow; w.appendChild(a); }
    if (r.link) { const a = document.createElement("a"); a.className = "wa"; a.href = r.link; a.target = "_blank"; a.rel = "noopener"; a.textContent = "💬 " + L().wa; w.appendChild(a); }
    if (r.copy) {
      const b = document.createElement("button"); b.type = "button"; b.className = "qrb"; b.textContent = L().copy;
      b.addEventListener("click", () => { navigator.clipboard?.writeText(r.copy).then(() => { b.textContent = L().copied; }).catch(() => { b.textContent = L().copyFail; }); });
      w.appendChild(b);
    }
    $("msgs").appendChild(w);
  }
  if (r.chips && r.chips.length) {
    const w = document.createElement("div"); w.className = "qr";
    r.chips.forEach((c) => { const b = document.createElement("button"); b.type = "button"; b.className = "qrb"; b.textContent = c; b.addEventListener("click", () => send(c)); w.appendChild(b); });
    $("msgs").appendChild(w);
  }
  $("msgs").scrollTop = 1e6;
}
async function submitChat(s) {
  const r = await postOrder(s.body);
  if (r.ok) {
    add(L().received(r.id), "bot");
    if (r.checkoutUrl) { add(L().payInfo, "bot"); addExtras({ pay: r.checkoutUrl }); }
    else if (r.payError) add(L().payFail, "bot");
  } else if (r.error) {
    O = s.saved; waiting = "change";
    add("⚠️ " + r.error + "\n\n" + L().changeWhat, "bot"); addExtras({ chips: changeChips() });
  } else {
    add(L().failed(PHONES), "bot");
    addExtras({ link: waLink(s.msg), copy: s.msg });
  }
}
async function aiAnswer(q) {
  try {
    const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 15000);
    const r = await fetch("/api/chat-ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: q, lang: CL }), signal: ctl.signal });
    clearTimeout(tm);
    const j = await r.json(); return r.ok && j.text ? j.text : null;
  } catch { return null; }
}
function send(q) {
  q = String(q).trim(); if (!q || busy) return;
  document.querySelectorAll("#msgs .qr:not(.keep)").forEach((x) => x.remove());
  add(q, "me"); busy = true;
  let r; try { r = respond(q); } catch (e) { console.error(e); r = { text: R.unknown(), chips: [] }; }
  const wait = Math.min(1800, 600 + r.text.length * 4);
  setTimeout(async () => {
    const t = typing();
    if (r.unknown && G.ai) {
      const a = await aiAnswer(q);
      if (a) r = { text: a, chips: [L().orderChip] };
    }
    setTimeout(async () => {
      t.remove(); add(r.text, "bot"); addExtras(r);
      if (r.topic && !["yes", "no", "thanks", "greet"].includes(r.topic)) lastTopic = r.topic;
      if (r.submit) { const t2 = typing(); await submitChat(r.submit); t2.remove(); }
      busy = false;
    }, r.unknown && G.ai ? 200 : wait);
  }, 300);
}

/* floating chat */
const chatBtn = $("chatBtn"), chatPanel = $("chatPanel");
if (chatBtn && chatPanel) {
  document.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => send(c.textContent)));
  $("cf").addEventListener("submit", (e) => { e.preventDefault(); send($("q").value); $("q").value = ""; });
  const isPhone = () => matchMedia("(max-width:520px)").matches;
  let kbOpen = false;
  const fitChat = () => {
    const p = chatPanel;
    if (p.hidden || !isPhone() || !kbOpen) { p.classList.remove("kb"); p.style.top = p.style.height = p.style.bottom = ""; document.body.classList.remove("chat-typing"); return; }
    const vv = window.visualViewport;
    if (vv && innerHeight - vv.height > 120) {
      p.classList.add("kb"); document.body.classList.add("chat-typing");
      p.style.top = vv.offsetTop + 8 + "px"; p.style.bottom = "auto"; p.style.height = Math.max(220, vv.height - 16) + "px";
    } else {
      p.classList.add("kb"); document.body.classList.add("chat-typing");
      p.style.top = "auto"; p.style.bottom = ""; p.style.height = Math.min(330, Math.round(innerHeight * 0.46)) + "px";
    }
    $("msgs").scrollTop = 1e6;
  };
  const setChat = (open) => {
    chatPanel.hidden = !open; chatBtn.setAttribute("aria-expanded", open);
    document.body.classList.toggle("chat-open", open);
    if (!open) { kbOpen = false; fitChat(); }
    if (open) { chatBtn.classList.add("seen"); $("msgs").scrollTop = 1e6; if (matchMedia("(hover:hover)").matches) $("q").focus(); }
  };
  $("q").addEventListener("focus", () => { kbOpen = true; fitChat(); setTimeout(fitChat, 250); setTimeout(fitChat, 600); });
  $("q").addEventListener("blur", () => { kbOpen = false; setTimeout(fitChat, 80); });
  document.querySelector("#cf button").addEventListener("pointerdown", (e) => { if (kbOpen) e.preventDefault(); });
  if (window.visualViewport) { visualViewport.addEventListener("resize", fitChat); visualViewport.addEventListener("scroll", fitChat); }
  chatBtn.addEventListener("click", () => setChat(chatPanel.hidden));
  $("chatX").addEventListener("click", () => setChat(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !chatPanel.hidden) setChat(false); });
  window.ggChat = { send, open: () => setChat(true) };
}

/* ================= after online payment ================= */
(async () => {
  const u = new URL(location.href), id = u.searchParams.get("paid"), tok = u.searchParams.get("t");
  if (!id || !tok) return;
  history.replaceState(null, "", u.pathname + u.hash);
  const P = PAID[PL];
  const box = document.createElement("div"); box.className = "banner"; box.setAttribute("role", "status");
  document.body.appendChild(box);
  const show = (h, p, btns = "") => { box.innerHTML = `<button class="x" aria-label="×">×</button><h3>${h}</h3><p>${p}</p>${btns ? `<div class="btns">${btns}</div>` : ""}`; box.querySelector(".x").onclick = () => box.remove(); box.querySelectorAll("[data-close]").forEach((b) => (b.onclick = () => box.remove())); };
  show(P.wait, P.waitT);
  for (let i = 0; i < 8; i++) {
    let j = null;
    try { const r = await fetch(`${API}?id=${encodeURIComponent(id)}&t=${encodeURIComponent(tok)}`); j = await r.json(); } catch {}
    if (j && j.payment === "completed") return show(P.ok, P.okT(id), `<button class="btn btn-gold" data-close>${P.close}</button>`);
    if (j && ["failed", "expired", "refunded", "none"].includes(j.payment)) break;
    if (u.searchParams.get("cancel") && i >= 1) { if (j && j.checkoutUrl) return show(P.bad, P.badT, `<a class="btn btn-gold" href="${j.checkoutUrl}">${P.retry}</a><button class="btn btn-line" data-close>${P.close}</button>`); break; }
    await new Promise((r) => setTimeout(r, 2500));
    if (i === 7 && j && j.checkoutUrl) return show(P.bad, P.badT, `<a class="btn btn-gold" href="${j.checkoutUrl}">${P.retry}</a><button class="btn btn-line" data-close>${P.close}</button>`);
  }
  show(P.bad, P.badT, `<button class="btn btn-gold" data-close>${P.close}</button>`);
})();

/* ================= scroll scenes ================= */
const sceneP = (el) => { const r = el.getBoundingClientRect(); return clamp(-r.top / (r.height - innerHeight)); };
const words = [...document.querySelectorAll("#wordP span")];
const pearls = [...document.querySelectorAll(".pearl")];
let px = 0, py = 0;
function frame() {
  const vh = innerHeight, hp = clamp(scrollY / vh);
  if ($("heroGata")) $("heroGata").style.transform = `rotateX(${hp * 40 - py * 8}deg) rotateY(${px * 12}deg) rotateZ(${hp * 60}deg) scale(${1 - hp * 0.12})`;
  pearls.forEach((p) => { const d = +p.style.getPropertyValue("--d"); p.style.transform = `translate3d(${px * d * -12}px,${-hp * d * 110 - py * d * 8}px,0)`; });
  if ($("expand")) {
    const sp = sceneP($("expand")), ep = ease(clamp(sp / 0.7)), fr = $("expFrame");
    fr.style.width = 72 + 28 * ep + "%"; fr.style.height = 78 + 22 * ep + "%"; fr.style.borderRadius = 24 * (1 - ep) + "px";
    $("expImg").style.transform = `scale(${1.15 - 0.15 * ep})`;
    const cp = clamp((sp - 0.45) / 0.3);
    $("expCap").style.opacity = cp; $("expCap").style.transform = `translateY(${20 * (1 - cp)}px)`;
  }
  if ($("ring")) $("cyl").style.transform = `rotateX(-6deg) rotateY(${-sceneP($("ring")) * 324}deg)`;
  if ($("words")) { const wp = sceneP($("words")); words.forEach((w, i) => w.classList.toggle("on", wp > (i + 0.6) / (words.length + 1))); }
  if ($("storyImg")) { const sr = $("storyImg").parentNode.getBoundingClientRect(); $("storyImg").style.transform = `translateY(${-clamp((vh - sr.top) / (vh + sr.height)) * 12}%)`; }
}
if (!reduce) {
  let tick = false;
  const req = () => { if (!tick) { tick = true; requestAnimationFrame(() => { frame(); tick = false; }); } };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", () => { layoutRing(); req(); });
  layoutRing(); frame();
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    addEventListener("pointermove", (e) => { px = e.clientX / innerWidth - 0.5; py = e.clientY / innerHeight - 0.5; req(); }, { passive: true });
    document.querySelectorAll(".card,.feat").forEach((el) => {
      el.insertAdjacentHTML("beforeend", '<span class="shine"></span>');
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 9}deg) rotateY(${(x - 0.5) * 11}deg) translateY(-4px)`;
        el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); } }), { threshold: 0.12 });
  document.querySelectorAll(".section .kicker,.section .h2,.section .lead,.card,.feat,.step,.story .photo,.story h2,.story p,.box,.qa").forEach((el) => {
    if (el.getBoundingClientRect().top > innerHeight) {
      el.classList.add("rv", "pre");
      const i = [...el.parentNode.children].indexOf(el);
      el.style.transitionDelay = (i % 4) * 0.08 + "s";
      el.addEventListener("transitionend", () => { el.style.transitionDelay = ""; }, { once: true });
      io.observe(el);
    }
  });
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now();
    (function step(t) { const k = clamp((t - t0) / 1300); el.textContent = Math.round(end * ease(k)) + suf; if (k < 1) requestAnimationFrame(step); })(t0);
  }), { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((b) => cio.observe(b));
}
})();
