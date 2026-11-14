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
const CUR = { hy: "դրամ", ru: "драм", en: "AMD" };
const CM = { hy: "սմ", ru: "см", en: "cm" };
const MON = {
  hy: ["հունվարի", "փետրվարի", "մարտի", "ապրիլի", "մայիսի", "հունիսի", "հուլիսի", "օգոստոսի", "սեպտեմբերի", "հոկտեմբերի", "նոյեմբերի", "դեկտեմբերի"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const CHOCO = { dark: { hy: "սև", ru: "тёмный", en: "dark" }, milk: { hy: "կաթնային", ru: "молочный", en: "milk" }, white: { hy: "սպիտակ", ru: "белый", en: "white" } };

const T = {
  hy: {
    greet: "Բարև ձեզ։ Ինչո՞վ կարող եմ օգնել՝ գներ, չափսեր, առաքո՞ւմ, թե՞ պատվեր։",
    hi: "Բարև ձեզ։",
    thanks: "Խնդրեմ։ Հարցեր ունենալու դեպքում գրեք։",
    bye: "Շնորհակալություն։ Սպասում ենք ձեր պատվերին։",
    pricesHead: "Մեր գները՝",
    priceNote: "Տուփի ու ձևավորման արժեքը կճշտենք պատվերը հաստատելիս։",
    one: (s, f, p) => `${f} գաթա, ${s.toLowerCase()}՝ ${p}։`,
    sizeHead: (s) => `${s} գաթայի գները՝`,
    fillHead: (f) => `${f} գաթայի գները՝`,
    chocoTypes: "Կա սև, կաթնային և սպիտակ շոկոլադով։",
    chocoYes: "Ունենք շոկոլադով գաթա՝ սև, կաթնային և սպիտակ շոկոլադով։ Գները՝",
    chocoNo: (p) => `Շոկոլադով գաթայի առկայությունը ճշտելու համար զանգահարեք՝ ${p}։`,
    sizes: (l) => `Գաթան թխում ենք հետևյալ չափսերով՝ ${l}։`,
    delivOther: (p) => `Այժմ առաքում ենք միայն Երևան և Աբովյան։ Այլ վայրի համար զանգահարեք՝ ${p}։`,
    orderHint: "Պատվիրելու համար սեղմեք «Պատվիրել չատով»։",
    phone: (p, ig) => `Մեր հեռախոսահամարները՝\n${p.join("\n")}${ig ? `\n\nԿարող եք գրել նաև Instagram-ում՝ ${ig}։` : ""}`,
    wantOrder: "Ցանկանո՞ւմ եք պատվիրել չատով։",
    types: (l) => `Ունենք՝\n${l}\n\nՀարսանիքի համար առաջարկում ենք նաև զարդարված տուփեր և նվեր-պայուսակներ։`,
    more: "Լավ։ Էլ ի՞նչ կցանկանայիք իմանալ։",
    noOk: "Լավ։ Հարցեր ունենալու դեպքում գրեք։",
    unknown: (p) => `Չկարողացա հասկանալ հարցը։ Փորձեք հարցնել գնի, չափսի կամ առաքման մասին։ Այլ հարցերի համար կարող եք զանգահարել՝ ${p}։`,
    orderChip: "Պատվիրել չատով",
    // ordering
    from: (p) => `${p}-ից`,
    askSize: "Ո՞ր չափսի գաթա եք ուզում։",
    askKind: () => "Ի՞նչ միջուկով գաթա եք ուզում։",
    askChoco: "Ո՞ր շոկոլադով։",
    chocoChips: ["Սև շոկոլադով", "Կաթնային շոկոլադով", "Սպիտակ շոկոլադով"],
    askBox: "Գաթան տուփո՞վ եք ուզում, թե՞ առանց տուփի։",
    boxChips: ["Տուփով", "Առանց տուփի"],
    boxInfo: "Տուփի ու ձևավորման արժեքը կճշտենք պատվերը հաստատելիս։",
    boxGot: "Նշեցի՝ տուփով։",
    askQty: "Քանի՞ հատ գաթա եք ուզում պատվիրել։",
    askDate: "Ո՞ր օրն եք ուզում ստանալ պատվերը։ Կարող եք գրել, օրինակ՝ 20.10 կամ «վաղը»։",
    dateChips: ["Վաղը", "Մյուս օրը"],
    askDelivery: "Ինչպե՞ս եք ուզում ստանալ պատվերը։",
    askYmode: "Երևանում կա երկու տարբերակ՝\n• պատվերը վերցնել Երևանի «Մեգամոլից»՝ առանց առաքման վճարի,\n• վճարովի առաքում ձեր հասցեով (Yandex կամ այլ ծառայությամբ)։\n\nՈ՞րն եք նախընտրում։",
    askAddress: "Գրեք առաքման հասցեն՝ փողոց, շենք կամ տուն, բնակարան։",
    askName: "Ինչպե՞ս դիմենք ձեզ։",
    askPhone: "Գրեք ձեր հեռախոսահամարը, որպեսզի կապվենք և հաստատենք պատվերը։",
    askNotes: "Լրացուցիչ ցանկություններ ունե՞ք։ Օրինակ՝ տուփի գույնը, սկզբնատառերը կամ ստանալու ժամը։",
    notesChip: "Նշում չունեմ",
    askPay: "Ինչպե՞ս եք ուզում վճարել։",
    payChips: ["Վճարել առցանց հիմա", "Վճարել ստանալիս"],
    confirmQ: "Ստուգեք պատվերի տվյալները։ Ամեն ինչ ճի՞շտ է։",
    confirmChips: ["Ուղարկել պատվերը", "Փոխել տվյալները", "Չեղարկել լրացումը"],
    yourOrder: "📋 Ձեր պատվերը՝",
    product: (p) => `Ընտրված տեսակը՝ ${p}`,
    qty: (n) => `Քանակը՝ ${n} հատ`,
    withBox: "Տուփով", noBox: "Առանց տուփի",
    day: (d) => `Ստանալու օրը՝ ${d}`,
    payOnline: "Վճարում՝ առցանց", payCash: "Վճարում՝ պատվերը ստանալիս",
    note: (n) => `Լրացուցիչ ցանկություններ՝ ${n}`,
    estimate: (p) => `Նախնական գումար՝ ${p}`,
    total: (p) => `Ընդհանուր գումար՝ ${p}`,
    extras: (box, del) => box && del ? "Տուփի, ձևավորման և առաքման հավելավճարները կճշտենք պատվերը հաստատելիս։" : box ? "Տուփի ու ձևավորման հավելավճարը կճշտենք պատվերը հաստատելիս։" : "Առաքման հավելավճարը կճշտենք պատվերը հաստատելիս։",
    cancelled: "Պատվերի լրացումը դադարեցվել է։ Պատվերը չի ուղարկվել։ Նորից սկսելու համար սեղմեք «Պատվիրել չատով»։",
    changeWhat: "Ի՞նչն եք ուզում փոխել։",
    changeChoose: "Ընտրեք, թե ինչն եք ուզում փոխել։",
    changeAck: "Լավ, փոխենք։",
    fields: { kind: "Միջուկը", pack: "Փաթեթավորումը", size: "Չափսը", qty: "Քանակը", date: "Ստանալու օրը", delivery: "Ստանալու եղանակը", name: "Անունը", phone: "Հեռախոսահամարը", notes: "Ցանկությունները", pay: "Վճարումը" },
    acks: ["Լավ։", "Նշեցի։", "Շատ լավ։", "Պարզ է։", "Հիանալի է։"],
    dateBad: "Չհասկացա ամսաթիվը։ Գրեք, օրինակ՝ 20.10 կամ «25 հոկտեմբերի»։",
    phoneBad: "Խնդրում ենք ստուգել հեռախոսահամարը և գրել այն ամբողջությամբ։",
    qtyBad: "Խնդրում ենք նշել գաթաների քանակը՝ ամբողջ թվով, առնվազն 1 հատ։",
    addrBad: "Խնդրում ենք գրել առաքման ամբողջական հասցեն։",
    sorry: "Չհասկացա պատասխանը։ ",
    cont: "Շարունակենք պատվերը։ ",
    past: "Նշված օրն արդեն անցել է։ Ընտրեք մեկ այլ օր։\n\n",
    soon: (p) => `Եթե գաթան պետք է այսօր կամ վաղը, խնդրում ենք նաև զանգահարել՝ ${p}։\n\n`,
    intro: "Այո, կարող եք պատվիրել հենց այստեղ։",
    introGot: (g) => ` Նշեցի՝ ${g}։`,
    introNone: " Մի քանի հարց կտամ, և պատվերը պատրաստ կլինի։",
    pcs: (n) => `${n} հատ`,
    gataWord: " գաթա",
    sending: "Պատվերն ուղարկվում է…",
    received: (id) => `Ձեր պատվերն ուղարկվել է։ Շնորհակալություն։\nՊատվերի համարը՝ ${id}\nԿկապվենք ձեզ հետ՝ մանրամասներն ու վերջնական գինը հաստատելու համար։`,
    payNow: "Վճարել առցանց",
    payInfo: "Վճարելու համար սեղմեք կոճակը։ Կարող եք վճարել քարտով, Idram-ով կամ Telcell-ով։",
    payFail: "Առցանց վճարումն այս պահին հասանելի չէ։ Կարող եք վճարել պատվերը ստանալիս։",
    failed: "Չհաջողվեց ստանալ պատվերի ուղարկման հաստատումը։ Նախ կապվեք մեզ հետ՝ ճշտելու համար, թե արդյոք պատվերը ստացվել է։",
    wa: "Գրել WhatsApp-ով", call: "Զանգահարել", copy: "Պատճենել պատվերի տվյալները", copied: "Պատճենված է", copyFail: "Չհաջողվեց պատճենել",
    plainHead: "Բարև ձեզ։ Նոր պատվեր կայքից՝",
    typing: "Պատրաստում է պատասխանը…",
  },
  ru: {
    greet: "Здравствуйте! Чем помочь: цены, размеры, доставка или заказ?",
    hi: "Здравствуйте!",
    thanks: "Пожалуйста. Если будут вопросы — пишите.",
    bye: "Спасибо! Ждём ваш заказ.",
    pricesHead: "Наши цены:",
    priceNote: "Стоимость коробки и оформления уточним при подтверждении заказа.",
    one: (s, f, p) => `${f} гата, ${s.toLowerCase()} — ${p}.`,
    sizeHead: (s) => `Цены — ${s.toLowerCase()}:`,
    fillHead: (f) => `Цены — гата ${f.toLowerCase()}:`,
    chocoTypes: "Есть с тёмным, молочным и белым шоколадом.",
    chocoYes: "Есть шоколадная гата — с тёмным, молочным и белым шоколадом. Цены:",
    chocoNo: (p) => `О наличии шоколадной гаты, пожалуйста, узнайте по телефону: ${p}.`,
    sizes: (l) => `Мы печём гату таких размеров: ${l}.`,
    delivOther: (p) => `Сейчас мы доставляем только в Ереван и Абовян. Для другого места позвоните: ${p}.`,
    orderHint: "Чтобы заказать, нажмите «Заказать в чате».",
    phone: (p, ig) => `Наши телефоны:\n${p.join("\n")}${ig ? `\n\nМожно также написать в Instagram: ${ig}.` : ""}`,
    wantOrder: "Хотите заказать в чате?",
    types: (l) => `У нас есть:\n${l}\n\nДля свадьбы также предлагаем украшенные коробки и подарочные пакеты.`,
    more: "Хорошо. Что ещё хотите узнать?",
    noOk: "Хорошо. Если будут вопросы — пишите.",
    unknown: (p) => `Не удалось понять вопрос. Спросите о цене, размере или доставке. По другим вопросам звоните: ${p}.`,
    orderChip: "Заказать в чате",
    from: (p) => `от ${p}`,
    askSize: "Какой размер гаты вы хотите?",
    askKind: () => "С какой начинкой?",
    askChoco: "С каким шоколадом?",
    chocoChips: ["С тёмным шоколадом", "С молочным шоколадом", "С белым шоколадом"],
    askBox: "Гату нужно в коробке или без коробки?",
    boxChips: ["В коробке", "Без коробки"],
    boxInfo: "Стоимость коробки и оформления уточним при подтверждении заказа.",
    boxGot: "Записала: в коробке.",
    askQty: "Сколько гат вы хотите заказать?",
    askDate: "В какой день вы хотите получить заказ? Например: 20.10 или «завтра».",
    dateChips: ["Завтра", "Послезавтра"],
    askDelivery: "Как вы хотите получить заказ?",
    askYmode: "В Ереване есть два варианта:\n• забрать заказ в «Мегамолле» без оплаты доставки,\n• платная доставка на ваш адрес (Yandex или другая служба).\n\nЧто вам удобнее?",
    askAddress: "Напишите адрес доставки: улица, дом, квартира.",
    askName: "Как к вам обращаться?",
    askPhone: "Напишите ваш номер телефона, чтобы мы связались и подтвердили заказ.",
    askNotes: "Есть дополнительные пожелания? Например: цвет коробки, инициалы или время получения.",
    notesChip: "Без пожеланий",
    askPay: "Как вы хотите оплатить?",
    payChips: ["Оплатить онлайн сейчас", "Оплатить при получении"],
    confirmQ: "Проверьте данные заказа. Всё верно?",
    confirmChips: ["Отправить заказ", "Изменить данные", "Отменить оформление"],
    yourOrder: "📋 Ваш заказ:",
    product: (p) => `Выбранный вид: ${p}`,
    qty: (n) => `Количество: ${n} шт.`,
    withBox: "В коробке", noBox: "Без коробки",
    day: (d) => `Дата получения: ${d}`,
    payOnline: "Оплата: онлайн", payCash: "Оплата: при получении",
    note: (n) => `Пожелания: ${n}`,
    estimate: (p) => `Предварительная сумма: ${p}`,
    total: (p) => `Итого: ${p}`,
    extras: (box, del) => box && del ? "Стоимость коробки, оформления и доставки уточним при подтверждении заказа." : box ? "Стоимость коробки и оформления уточним при подтверждении заказа." : "Стоимость доставки уточним при подтверждении заказа.",
    cancelled: "Оформление заказа остановлено. Заказ не отправлен. Чтобы начать заново, нажмите «Заказать в чате».",
    changeWhat: "Что хотите изменить?",
    changeChoose: "Выберите, что изменить.",
    changeAck: "Хорошо, меняем.",
    fields: { kind: "Начинку", pack: "Упаковку", size: "Размер", qty: "Количество", date: "Дату", delivery: "Получение", name: "Имя", phone: "Телефон", notes: "Пожелания", pay: "Оплату" },
    acks: ["Хорошо.", "Записала.", "Отлично.", "Понятно.", "Прекрасно."],
    dateBad: "Не поняла дату. Напишите, например: 20.10 или «25 октября».",
    phoneBad: "Пожалуйста, проверьте номер телефона и напишите его полностью.",
    qtyBad: "Пожалуйста, укажите количество целым числом, не меньше 1.",
    addrBad: "Пожалуйста, напишите полный адрес доставки.",
    sorry: "Не поняла ответ. ",
    cont: "Продолжим заказ. ",
    past: "Эта дата уже прошла. Выберите другой день.\n\n",
    soon: (p) => `Если гата нужна сегодня или завтра, пожалуйста, также позвоните: ${p}.\n\n`,
    intro: "Да, можно заказать прямо здесь.",
    introGot: (g) => ` Записала: ${g}.`,
    introNone: " Задам несколько вопросов — и заказ готов.",
    pcs: (n) => `${n} шт.`,
    gataWord: "",
    sending: "Заказ отправляется…",
    received: (id) => `Ваш заказ отправлен. Спасибо!\nНомер заказа: ${id}\nМы свяжемся с вами, чтобы подтвердить детали и итоговую цену.`,
    payNow: "Оплатить онлайн",
    payInfo: "Чтобы оплатить, нажмите кнопку. Можно картой, Idram или Telcell.",
    payFail: "Онлайн-оплата сейчас недоступна. Можно оплатить при получении.",
    failed: "Не удалось получить подтверждение отправки заказа. Сначала свяжитесь с нами, чтобы уточнить, получен ли заказ.",
    wa: "Написать в WhatsApp", call: "Позвонить", copy: "Скопировать данные заказа", copied: "Скопировано", copyFail: "Не удалось скопировать",
    plainHead: "Здравствуйте! Новый заказ с сайта:",
    typing: "Готовит ответ…",
  },
  en: {
    greet: "Hello! How can I help: prices, sizes, delivery or an order?",
    hi: "Hello!",
    thanks: "You're welcome. If you have more questions, just write.",
    bye: "Thank you! We look forward to your order.",
    pricesHead: "Our prices:",
    priceNote: "We confirm the price of the box and decoration when we confirm your order.",
    one: (s, f, p) => `${f} gata, ${s.toLowerCase()}: ${p}.`,
    sizeHead: (s) => `${s} gata prices:`,
    fillHead: (f) => `${f} gata prices:`,
    chocoTypes: "Available with dark, milk and white chocolate.",
    chocoYes: "We have chocolate gata with dark, milk and white chocolate. Prices:",
    chocoNo: (p) => `Please call us to check if chocolate gata is available: ${p}.`,
    sizes: (l) => `We bake gata in these sizes: ${l}.`,
    delivOther: (p) => `Right now we deliver only to Yerevan and Abovyan. For other places, call: ${p}.`,
    orderHint: "To order, tap “Order in chat”.",
    phone: (p, ig) => `Our phone numbers:\n${p.join("\n")}${ig ? `\n\nYou can also message us on Instagram: ${ig}.` : ""}`,
    wantOrder: "Would you like to order in the chat?",
    types: (l) => `We have:\n${l}\n\nFor weddings we also offer decorated boxes and gift bags.`,
    more: "Great. What else would you like to know?",
    noOk: "Okay. If you have questions, just write.",
    unknown: (p) => `I couldn't understand the question. Try asking about prices, sizes or delivery. For anything else, call: ${p}.`,
    orderChip: "Order in chat",
    from: (p) => `from ${p}`,
    askSize: "Which size would you like?",
    askKind: () => "Which filling would you like?",
    askChoco: "Which chocolate?",
    chocoChips: ["Dark chocolate", "Milk chocolate", "White chocolate"],
    askBox: "Would you like it in a box or without a box?",
    boxChips: ["In a box", "No box"],
    boxInfo: "We confirm the price of the box and decoration when we confirm your order.",
    boxGot: "Noted: in a box.",
    askQty: "How many gata would you like to order?",
    askDate: "Which day would you like to receive your order? For example: 20.10 or “tomorrow”.",
    dateChips: ["Tomorrow", "Day after tomorrow"],
    askDelivery: "How would you like to receive your order?",
    askYmode: "In Yerevan there are two options:\n• pick up at Megamall with no delivery fee,\n• paid delivery to your address (Yandex or another service).\n\nWhich do you prefer?",
    askAddress: "Write the delivery address: street, building or house, apartment.",
    askName: "What's your name?",
    askPhone: "Write your phone number so we can contact you and confirm the order.",
    askNotes: "Any extra requests? For example: box colour, initials or pickup time.",
    notesChip: "No notes",
    askPay: "How would you like to pay?",
    payChips: ["Pay online now", "Pay on receipt"],
    confirmQ: "Please check your order. Is everything correct?",
    confirmChips: ["Send order", "Change details", "Cancel"],
    yourOrder: "📋 Your order:",
    product: (p) => `Selected: ${p}`,
    qty: (n) => `Quantity: ${n}`,
    withBox: "In a box", noBox: "No box",
    day: (d) => `Date: ${d}`,
    payOnline: "Payment: online", payCash: "Payment: on receipt",
    note: (n) => `Requests: ${n}`,
    estimate: (p) => `Estimated total: ${p}`,
    total: (p) => `Total: ${p}`,
    extras: (box, del) => box && del ? "We'll confirm the box, decoration and delivery charges when we confirm your order." : box ? "We'll confirm the box and decoration charge when we confirm your order." : "We'll confirm the delivery charge when we confirm your order.",
    cancelled: "Order stopped. Nothing was sent. To start again, tap “Order in chat”.",
    changeWhat: "What would you like to change?",
    changeChoose: "Choose what you want to change.",
    changeAck: "Okay, let's change it.",
    fields: { kind: "Filling", pack: "Packaging", size: "Size", qty: "Quantity", date: "Date", delivery: "Delivery", name: "Name", phone: "Phone", notes: "Requests", pay: "Payment" },
    acks: ["Great.", "Noted.", "Lovely.", "Got it.", "Perfect."],
    dateBad: "I didn't get the date. Type for example: 20.10 or “25 October”.",
    phoneBad: "Please check the phone number and write it in full.",
    qtyBad: "Please enter the quantity as a whole number, at least 1.",
    addrBad: "Please write the full delivery address.",
    sorry: "I didn't understand that. ",
    cont: "Let's continue. ",
    past: "That date has already passed. Please choose another day.\n\n",
    soon: (p) => `If you need it today or tomorrow, please also call us: ${p}.\n\n`,
    intro: "Yes, you can order right here.",
    introGot: (g) => ` Noted: ${g}.`,
    introNone: " I'll ask a few questions and your order will be ready.",
    pcs: (n) => `${n} pcs`,
    gataWord: " gata",
    sending: "Sending your order…",
    received: (id) => `Your order has been sent. Thank you!\nOrder number: ${id}\nWe'll contact you to confirm the details and the final price.`,
    payNow: "Pay online",
    payInfo: "Tap the button to pay by card, Idram or Telcell.",
    payFail: "Online payment isn't available right now. You can pay when you receive your order.",
    failed: "We couldn't confirm that your order was sent. Please contact us first to check whether we received it.",
    wa: "Write on WhatsApp", call: "Call", copy: "Copy order details", copied: "Copied", copyFail: "Couldn't copy",
    plainHead: "Hello Garnu Gata. New order from the website:",
    typing: "Preparing a reply…",
  },
};

/* form labels */
const F = {
  hy: { title: "Պատվերի ձև", name: "Անուն", namePh: "Աննա", phone: "Հեռախոսահամար", size: "Գաթայի չափսը", kind: "Միջուկը", choco: "Շոկոլադը", box: "Փաթեթավորումը", noBox: "Առանց տուփի", withBox: "Տուփով", qty: "Քանակը", date: "Ստանալու օրը", how: "Ստանալու եղանակը", addr: "Առաքման հասցեն", addrPh: "Փողոց, շենք կամ տուն, բնակարան", notes: "Լրացուցիչ ցանկություններ", notesPh: "Օրինակ՝ տուփի գույնը, սկզբնատառերը կամ ստանալու ժամը", pay: "Վճարում", payOn: "Վճարել առցանց հիմա", payOnS: "Քարտ, Idram, Telcell", payCash: "Վճարել պատվերը ստանալիս", payCashS: "Վճարման եղանակը կճշտենք պատվերը հաստատելիս", submit: "Ուղարկել պատվերը", submitPay: "Ուղարկել պատվերը և վճարել", sending: "Պատվերն ուղարկվում է…", redirect: "Անցնում ենք վճարման էջ…", need: "Խնդրում ենք լրացնել այս դաշտը։", dateBad: "Խնդրում ենք նշել ճիշտ ամսաթիվ։" },
  ru: { title: "Форма заказа", name: "Имя", namePh: "Анна", phone: "Номер телефона", size: "Размер гаты", kind: "Начинка", choco: "Шоколад", box: "Упаковка", noBox: "Без коробки", withBox: "В коробке", qty: "Количество", date: "Дата получения", how: "Способ получения", addr: "Адрес доставки", addrPh: "Улица, дом, квартира", notes: "Дополнительные пожелания", notesPh: "Например: цвет коробки, инициалы или время получения", pay: "Оплата", payOn: "Оплатить онлайн сейчас", payOnS: "Карта, Idram, Telcell", payCash: "Оплатить при получении", payCashS: "Способ оплаты уточним при подтверждении заказа", submit: "Отправить заказ", submitPay: "Отправить заказ и оплатить", sending: "Заказ отправляется…", redirect: "Переходим на страницу оплаты…", need: "Пожалуйста, заполните это поле.", dateBad: "Пожалуйста, укажите правильную дату." },
  en: { title: "Order form", name: "Name", namePh: "Anna", phone: "Phone number", size: "Gata size", kind: "Filling", choco: "Chocolate", box: "Packaging", noBox: "No box", withBox: "In a box", qty: "Quantity", date: "Date you need it", how: "How you'll receive it", addr: "Delivery address", addrPh: "Street, building or house, apartment", notes: "Extra requests", notesPh: "For example: box colour, initials or pickup time", pay: "Payment", payOn: "Pay online now", payOnS: "Card, Idram, Telcell", payCash: "Pay on receipt", payCashS: "We'll confirm the payment method with you", submit: "Send order", submitPay: "Send order and pay", sending: "Sending your order…", redirect: "Taking you to the payment page…", need: "Please fill in this field.", dateBad: "Please enter a valid date." },
};
const PAID = {
  hy: { ok: "Վճարումը ստացվել է", okT: (id) => `Շնորհակալություն։ Պատվեր ${id}։ Շուտով կկապվենք ձեզ հետ։`, wait: "Ստուգում ենք վճարումը…", waitT: "Մի քանի վայրկյան։", bad: "Վճարումը չի ավարտվել", badT: "Պատվերը պահպանված է, և կկապվենք ձեզ հետ։ Կարող եք կրկին փորձել կամ վճարել պատվերը ստանալիս։", retry: "Կրկին փորձել", close: "Լավ" },
  ru: { ok: "Оплата получена", okT: (id) => `Спасибо! Заказ ${id}. Скоро свяжемся с вами.`, wait: "Проверяем оплату…", waitT: "Несколько секунд.", bad: "Оплата не завершена", badT: "Заказ сохранён, мы свяжемся с вами. Можно попробовать снова или оплатить при получении.", retry: "Попробовать снова", close: "Хорошо" },
  en: { ok: "Payment received", okT: (id) => `Thank you! Order ${id}. We'll contact you soon.`, wait: "Checking your payment…", waitT: "Just a few seconds.", bad: "Payment not completed", badT: "Your order is saved and we'll contact you. You can try again or pay when you receive it.", retry: "Try again", close: "OK" },
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
// "today" is always the date in Armenia (UTC+4), the same rule the server uses
const today = () => { const n = new Date(Date.now() + 4 * 3600e3); return new Date(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()); };

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
function buildForm() {
  if (!form) return;
  if (!G.accept) { form.innerHTML = `<h3>${FL.title}</h3><div class="closed">${G.closedText || ""}<br>📞 ${PHONES}</div>`; return; }
  const opt = (v, l, s) => `<option value="${v}"${s ? " selected" : ""}>${l}</option>`;
  const mid = Math.min(1, SIZES.length - 1);
  form.innerHTML = `
    <h3>${FL.title}</h3>
    <div class="picked" id="fpicked" hidden><span></span><button type="button" aria-label="×" id="fpickedX">×</button></div>
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
      <label for="qty">${FL.qty}<input id="qty" type="number" min="1" max="9999" step="1" value="1" inputmode="numeric"></label>
    </div>
    <div class="row">
      <label for="date">${FL.date}<input id="date" type="date" required></label>
      <label for="how2">${FL.how}<select id="how2">${DELIV.map((d) => opt(d.id, tx(d.label, PL))).join("")}</select></label>
    </div>
    <div class="fwarn" id="fsoon" hidden>${T[PL].soon(PHONES).trim()}</div>
    <label for="faddr" id="faddrL" hidden>${FL.addr}<input id="faddr" placeholder="${FL.addrPh}" maxlength="200"></label>
    <label for="notes">${FL.notes}<textarea id="notes" rows="2" placeholder="${FL.notesPh}" maxlength="600"></textarea></label>
    ${G.pay ? `<div class="pay-pick" role="radiogroup" aria-label="${FL.pay}">
      <label><input type="radio" name="pay" value="online" checked><span>${FL.payOn}<small>${FL.payOnS}</small></span></label>
      <label><input type="radio" name="pay" value="cash"><span>${FL.payCash}<small>${FL.payCashS}</small></span></label>
    </div>` : ""}
    <div class="fprice" id="fprice"></div>
    <button class="btn btn-gold" type="submit" id="fsubmit">${FL.submit}</button>
    <div class="done" id="done" hidden></div>`;
  const md = new Date(today().getTime() + Math.max(1, G.minDays || 0) * 864e5 + 36e5);
  $("date").min = isoDate(today());
  $("date").max = isoDate(new Date(today().getTime() + 366 * 864e5));
  $("date").value = isoDate(md);
  $("fpickedX").addEventListener("click", () => setPicked(null));
  form.addEventListener("input", fUpdate);
  form.addEventListener("change", fUpdate);
  form.addEventListener("submit", fSubmit);
  fUpdate();
}
function fState() {
  const si = +$("fsize").value, f = fill($("kind").value), qRaw = $("qty").value.trim(), q = Number(qRaw);
  const qOk = /^\d+$/.test(qRaw) && q >= 1 && q <= 9999, qq = qOk ? q : 1;
  const unit = f ? +f.prices[si] || 0 : 0, d = dOpt($("how2").value) || {};
  const box = !!($("fbox") && $("fbox").value === "box");
  const boxFee = box && MENU.box.price > 0 ? MENU.box.price * qq : 0;
  const dFee = d.price > 0 ? +d.price : 0;
  const pay = (form.querySelector("input[name=pay]:checked") || {}).value || "cash";
  return { si, f, q: qq, qOk, unit, box, d, total: unit * qq + boxFee + dFee, boxLater: box && !(MENU.box.price > 0), dLater: d.price < 0, dFee, boxFee, pay };
}
/* price text shared by the form, chat and WhatsApp message */
function priceText(total, boxLater, dLater, l, unit, q) {
  const t = T[l], est = boxLater || dLater;
  const head = (est ? t.estimate : t.total)(fmtL(total, l)) + (q > 1 ? ` (${q} × ${fmtL(unit, l)})` : "");
  return est ? head + "\n" + t.extras(boxLater, dLater) : head;
}
const dateCheck = (v) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "bad";
  const [y, m, dd] = v.split("-").map(Number), d = new Date(y, m - 1, dd);
  if (d.getFullYear() !== y || d.getMonth() !== m - 1 || d.getDate() !== dd) return "bad";
  if (d < today()) return "past";
  if ((d - today()) / 864e5 > 366) return "bad";
  return (d - today()) / 864e5 < Math.max(1, G.minDays || 0) ? "soon" : "ok";
};
function fUpdate() {
  const s = fState();
  $("faddrL").hidden = !s.d.address; $("faddr").required = !!s.d.address;
  $("fchocoL").hidden = !(s.f && s.f.id === "choco");
  const [h, x] = priceText(s.total, s.boxLater, s.dLater, PL, s.unit, s.q).split("\n");
  $("fprice").innerHTML = ""; $("fprice").append("💰 " + h);
  if (x) { const sm = document.createElement("small"); sm.textContent = x; $("fprice").append(sm); }
  $("fsoon").hidden = dateCheck($("date").value) !== "soon";
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
const telHref = () => "tel:" + String((G.phones || [])[0] || "").replace(/[^\d+]/g, "").replace(/^0/, "+374");
/* buttons shown when we could not confirm that the order arrived */
function fallbackButtons(text, l) {
  const t = T[l], w = document.createElement("div"); w.className = "qr keep";
  const link = waLink(text);
  if (link) { const a = document.createElement("a"); a.className = "wa"; a.href = link; a.target = "_blank"; a.rel = "noopener"; a.textContent = t.wa; w.appendChild(a); }
  if ((G.phones || []).length) { const a = document.createElement("a"); a.className = "call"; a.href = telHref(); a.textContent = t.call; w.appendChild(a); }
  const b = document.createElement("button"); b.type = "button"; b.className = "qrb"; b.textContent = t.copy;
  b.addEventListener("click", () => { navigator.clipboard?.writeText(text).then(() => { b.textContent = t.copied; }).catch(() => { b.textContent = t.copyFail; }); });
  w.appendChild(b);
  return w;
}
function fieldError(id, msg) {
  const el = $(id); el.focus(); el.setCustomValidity(msg); el.reportValidity();
  el.addEventListener("input", () => el.setCustomValidity(""), { once: true });
  setTimeout(() => el.setCustomValidity(""), 4000);
}
async function fSubmit(e) {
  e.preventDefault();
  const t = T[PL];
  for (const id of ["name", "phone", "qty", "date", "faddr"]) {
    const el = $(id);
    if ((el.required || id === "qty") && !el.value.trim()) return fieldError(id, FL.need);
  }
  const s = fState();
  const digits = $("phone").value.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return fieldError("phone", t.phoneBad);
  if (!s.qOk) return fieldError("qty", t.qtyBad);
  const dc = dateCheck($("date").value);
  if (dc === "bad") return fieldError("date", FL.dateBad);
  if (dc === "past") return fieldError("date", t.past.trim());
  if (s.d.address && $("faddr").value.replace(/\s/g, "").length < 5) return fieldError("faddr", t.addrBad);
  const d = $("done"), btn = $("fsubmit");
  const body = {
    lang: PL, source: "form", filling: s.f && s.f.id, choco: s.f && s.f.id === "choco" ? tx(CHOCO[$("fchoco").value], "hy") : "",
    size: SIZES[s.si] && SIZES[s.si].cm, qty: s.q, box: s.box, date: $("date").value, delivery: s.d.id, address: $("faddr").value,
    name: $("name").value, phone: $("phone").value, notes: $("notes").value, product: picked.title, pay: s.pay,
    website: form.querySelector("input[name=website]").value,
  };
  btn.disabled = true; d.hidden = false; d.textContent = FL.sending;
  const r = await postOrder(body);
  btn.disabled = false;
  if (r.ok) {
    if (r.checkoutUrl) { d.textContent = FL.redirect; location.href = r.checkoutUrl; return; }
    d.textContent = t.received(r.id) + (r.payError ? "\n\n" + t.payFail : "");
    form.querySelectorAll("input:not([type=radio]):not([name=website]),textarea").forEach((i) => { if (i.id !== "qty" && i.id !== "date") i.value = ""; });
    setPicked(null); fUpdate();
  } else if (r.error) {
    d.textContent = "⚠️ " + r.error;
  } else {
    const lines = [t.plainHead, ""];
    if (picked.title) lines.push("• " + t.product(picked.title));
    lines.push(`• ${tx(s.f && s.f.name, PL)}, ${sizeL(s.si, PL)}`, `• ${t.qty(s.q)}`);
    if ($("fbox")) lines.push(`• ${s.box ? t.withBox : t.noBox}`);
    lines.push(`• ${t.day(body.date)}`, `• ${tx(s.d.label, PL)}${body.address ? ", " + body.address : ""}`, `• ${body.name}, ${body.phone}`);
    if (body.notes) lines.push("• " + t.note(body.notes));
    lines.push("", priceText(s.total, s.boxLater, s.dLater, PL, s.unit, s.q));
    d.textContent = t.failed;
    d.appendChild(fallbackButtons(lines.join("\n"), PL));
  }
  d.scrollIntoView({ behavior: "smooth", block: "center" });
}
/* product cards: remember the chosen product and its packaging */
let picked = { title: "" };
function setPicked(card) {
  picked = card ? { title: card.dataset.pick, pack: card.dataset.pack || "" } : { title: "" };
  const box = $("fpicked"); if (!box) return;
  box.hidden = !picked.title;
  if (picked.title) box.querySelector("span").textContent = T[PL].product(picked.title);
  if (picked.pack && $("fbox")) $("fbox").value = picked.pack === "box" ? "box" : "none";
  if (picked.pack && picked.pack !== "box" && $("notes") && !$("notes").value) $("notes").value = picked.title;
  fUpdate();
}
buildForm();
document.querySelectorAll("[data-pick]").forEach((a) => a.addEventListener("click", () => setPicked(a)));

/* ================= chat assistant ================= */
/* keyword stems; a word matches if it starts with the stem (stems of 5+ letters also allow one typo) */
const INTENTS = {
  greet: ["բարև", "բարեւ", "ողջույն", "բարի", "barev", "barew", "bari", "voghj", "hello", "hi", "hey", "salam", "привет", "здравств", "добрый", "салам"],
  thanks: ["շնորհակ", "մերսի", "ապրեք", "ապրես", "shnorh", "mersi", "merci", "aprek", "apres", "thank", "thx", "спасиб", "благодар"],
  bye: ["ցտեսություն", "հաջող", "ctesutyun", "hajogh", "bye", "пока", "до свид"],
  price: ["գին*", "գներ*", "գնե", "գինը", "գինն", "արժ", "ինչքան", "ինչքա", "որքան", "դրամ", "դր", "gin*", "giny", "gine", "gner", "gnern", "arj*", "arzh", "arzhe", "inchqan", "inchkan", "inch kan", "inchqa", "vorqan", "dram", "price", "cost", "how much", "цен", "сколько", "стоит", "стоим", "прайс", "драм"],
  fill: ["ընկույզ", "enkuyz", "nkuyz", "չրեր", "chrer", "չամիչ", "chamich", "խուրմ", "xurm", "khurm", "орех", "изюм", "хурм", "финик", "walnut", "raisin", "сухофрукт"],
  choco: ["շոկոլ", "shokol", "chokol", "chocol", "chocolate", "choco", "шокол", "шоколад"],
  size: ["չափ", "սմ", "փոքր", "միջին", "մեծ*", "chap*", "sm", "poqr", "pokr", "mijin", "mec*", "mets", "size", "small", "medium", "large", "big", "размер", "см", "маленьк", "средн", "больш"],
  delivery: ["մեգամոլ", "megamol", "megamall", "мегамол", "яндекс", "yandex", "առաք", "բեր*", "հասցն", "երևան", "երեւան", "աբովյան", "գյումրի", "վանաձոր", "մարզ", "araq", "arak", "ber*", "hascn", "yerevan", "erevan", "abovyan", "deliver", "shipping", "доставк", "привез", "ереван", "абовян"],
  phone: ["հեռախ", "զանգ", "կապ*", "համարը", "համարն", "համար տվ", "վայբեր", "վոթսափ", "heraxos", "herakhos", "zang", "kap*", "hamary", "hamar@", "hamarn", "hamar tv", "nomer", "viber", "whatsapp", "phone", "call", "number", "contact", "телефон", "номер", "звон", "связ", "вайбер"],
  where: ["որտեղ", "հասցե", "գառնի", "գտնվ", "vortegh", "vorteg", "hasce", "garni", "where", "address", "location", "где", "адрес", "гарни"],
  order: ["պատվ", "պատվեր", "գնել", "order", "buy", "patver", "patvir", "gnel", "заказ", "закаж", "купить"],
  wedding: ["հարսան", "նշանդր", "նշանադր", "ուլունք", "կնունք", "տոն*", "միջոցառ", "հյուր", "տուփ", "պայուսակ", "սկզբնատառ", "զարդ", "մարգարիտ", "harsan", "nshandr", "knunq", "ton*", "hyur", "tup*", "payusak", "zard", "margarit", "wedding", "event", "box", "bag", "decor", "initial", "guest", "свадьб", "помолв", "крестин", "коробк", "упаковк", "инициал", "декор"],
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
  date: /խուրմ|xurm|khurm|хурм|финик|persimmon|(^|\s)dates?(\s|$)/,
  classic: /դասական|dasakan|klasik|classic|класс|խորիզ|xoriz|khoriz|սովորական գաթա/,
};
function fillFrom(h) {
  for (const f of SHOWN) for (const l of ["hy", "ru", "en"]) {
    const n = norm(tx(f.name, l)), s = norm(tx(f.short, l));
    if ((n && h.includes(n)) || (s && s.length > 3 && h.includes(s))) return f.id;
  }
  for (const id of Object.keys(FILL_KW)) if (SHOWN.some((f) => f.id === id) && FILL_KW[id].test(h)) return id;
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
const SEP = () => (CL === "hy" ? "՝ " : ": ");
const priceList = () => SHOWN.map((f) => `• ${tx(f.short, CL)}${SEP()}${f.prices.map((p) => (+p || 0).toLocaleString("en-US").replace(/,/g, " ")).join(" / ")} ${CUR[CL]}`).join("\n") + `\n(${SIZES.map((s) => s.cm).join(" / ")} ${CM[CL]})`;

let lastTopic = null;
const R = {
  greet: () => L().greet,
  thanks: () => L().thanks,
  bye: () => L().bye,
  price: (t) => {
    const s = sizeFrom(t), f = SHOWN.find((x) => x.id === fillFrom(norm(t)));
    if (s >= 0 && f) return L().one(sizeL(s, CL), tx(f.short, CL), fmt(f.prices[s]));
    if (s >= 0) return L().sizeHead(sizeL(s, CL)) + "\n" + SHOWN.map((x) => `• ${tx(x.short, CL)}${SEP()}${fmt(x.prices[s])}`).join("\n");
    if (f) return L().fillHead(tx(f.short, CL)) + "\n" + f.prices.map((p, i) => `• ${sizeL(i, CL)}${SEP()}${fmt(p)}`).join("\n") + (f.id === "choco" ? "\n\n" + L().chocoTypes : "");
    return `${L().pricesHead}\n\n${priceList()}\n\n${L().priceNote}`;
  },
  fill: (t) => R.price(t),
  choco: (t) => {
    const f = SHOWN.find((x) => x.id === "choco"); if (!f) return L().chocoNo(PHONES);
    const s = sizeFrom(t);
    if (s >= 0) return L().one(sizeL(s, CL), tx(f.short, CL), fmt(f.prices[s])) + " " + L().chocoTypes;
    return L().chocoYes + "\n" + f.prices.map((p, i) => `• ${sizeL(i, CL)}${SEP()}${fmt(p)}`).join("\n");
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
  pay: () => ans(G.pay ? "payOnline" : "pay"),
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
    const d = new Date(y, +m[2] - 1, +m[1]); if (d.getMonth() !== +m[2] - 1) return "bad";
    if (!m[3] && d < d0) d.setFullYear(y + 1); return d;
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
  const lines = [l.yourOrder];
  if (O.product) lines.push(`• ${l.product(O.product)}`);
  lines.push(`• ${tx(f.short, CL)}${L().gataWord}${O.kind === "choco" && O.choco ? ` (${tx(CHOCO[O.choco], CL)})` : ""}, ${sizeL(O.size, CL).toLowerCase()}`,
    `• ${l.qty(O.qty)}`);
  if (BOX_ON) lines.push(`• ${O.pack === "box" ? l.withBox : l.noBox}`);
  lines.push(`• ${l.day(fmtDate(O.date))}`, `• ${tx(d.label, CL)}${O.address ? `, ${O.address}` : ""}`, `• ${O.name}, ${O.phone}`);
  if (O.notes) lines.push(`• ${l.note(O.notes)}`);
  if (G.pay) lines.push(`• ${O.pay === "online" ? l.payOnline : l.payCash}`);
  lines.push("", priceText(tt.total, tt.boxLater, tt.dLater, CL, unitPrice(), O.qty));
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
  if (O.kind) got.push(tx(fill(O.kind).short, CL).toLowerCase() + L().gataWord);
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
  if (!O.date) { const d = dateFrom(t); if (d && d !== "bad" && (d - today()) / 864e5 <= 366) O.date = d; }
  if (O.qty == null) { const q = qtyFrom(t, step === "qty"); if (q && q >= 1 && q <= 9999) O.qty = q; }
  if (!O.delivery) { const dv = delivFrom(h); if (dv) { if (dv.id) { O.delivery = dv.id; O.dGroup = null; } else if (!O.dGroup) O.dGroup = dv.group; } }
}
function plainOrder() { return L().plainHead + "\n\n" + summary().split("\n").slice(1).join("\n"); }
function finish() {
  const msg = plainOrder();
  const f = fill(O.kind);
  const body = {
    lang: CL, source: "chat", filling: O.kind, choco: O.choco ? tx(CHOCO[O.choco], "hy") : "", size: SIZES[O.size].cm, qty: O.qty,
    box: O.pack === "box", date: isoDate(O.date), delivery: O.delivery, address: O.address || "", name: O.name, phone: O.phone, notes: O.notes || "", product: O.product || "", pay: O.pay,
  };
  const saved = O;
  O = null; waiting = null;
  return { text: L().sending, chips: [], submit: { body, msg, saved, f } };
}
function orderTurn(t) {
  const h = norm(t), l = L();
  if (/չեղարկ|cheghark|chexark|cancel|отмен|(^|\s)stop|стоп/.test(h)) { O = null; waiting = null; return { text: l.cancelled, chips: [l.orderChip] }; }
  if (waiting === "confirm") {
    if (/հաստատ|hastat|ուղարկ|uxark|ughark|այո|ayo|^ha$|^да|подтвер|отправ|yes|^ok|confirm|send/.test(h)) return finish();
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
  else if (waiting === "address") {
    if (t.replace(/\s/g, "").length >= 5) O.address = t.trim().slice(0, 200);
    else return { text: l.addrBad, chips: [] };
  }
  else if (waiting === "name") {
    const n = t.trim().replace(/^(իմ անունը|anuns|anunu|menya zovut|меня зовут|my name is|i am|i'm|ես)\s*/i, "").replace(/\s+(է|e|em|եմ)$/i, "");
    if (n.length >= 2 && n.length <= 40 && !/\d{4}/.test(n)) O.name = n;
  }
  else if (waiting === "phone") { const d = t.replace(/\D/g, ""); if (d.length >= 8 && d.length <= 15) O.phone = t.trim(); }
  else if (waiting === "notes") { O.notes = /^(ոչ|չէ|չունեմ|voch|che|chunem|no|нет|не|без)(\s|$)|նշում չունեմ|nshum chunem|no notes|без пожел/.test(h) ? "" : t.trim().slice(0, 600); }
  else if (waiting === "pay") {
    if (/առցանց|onlayn|online|онлайн|հիմա|now|сейчас|քարտ|qart|card|карт|idram|telcell/.test(h)) O.pay = "online";
    else if (/ստանալիս|կանխիկ|stanalis|kanxik|cash|налич|получен|receipt|delivery|pickup|later|հետո|потом/.test(h)) O.pay = "cash";
  }
  else extract(t, waiting);
  if (JSON.stringify(O) === before) {
    if (waiting === "qty" && /\d/.test(t)) return { text: l.qtyBad, chips: prompt("qty").chips };
    if (waiting === "date" && /\d/.test(t)) return { text: l.dateBad, chips: prompt("date").chips };
    if (waiting === "phone") return { text: l.phoneBad, chips: [] };
    const r = reply(t), p = prompt(waiting);
    if (r.topic && !["yes", "no", "greet", "order"].includes(r.topic)) return { text: r.text + "\n\n" + l.cont + p.text, chips: p.chips };
    return { text: l.sorry + p.text, chips: p.chips };
  }
  return nextAsk(l.acks[ackI++ % l.acks.length]);
}
/* quick-reply buttons: the same action whatever the button text says */
const QUICK = {};
document.querySelectorAll(".chip[data-act]").forEach((c) => (QUICK[norm(c.textContent)] = c.dataset.act));
const ACT = { price: () => R.price(""), delivery: () => R.delivery(""), wedding: () => R.wedding(), khoriz: () => R.khoriz(), phone: () => R.phone() };
function respond(t, act) {
  if (/[а-яё]/i.test(t)) CL = "ru"; else if (/[Ա-և]/.test(t)) CL = "hy";
  act = act || (!O && QUICK[norm(t)]);
  if (act === "order") { O = null; return startOrder(""); }
  if (act && ACT[act]) {
    if (O) { const p = prompt(waiting); return { text: ACT[act]() + "\n\n" + L().cont + p.text, chips: p.chips }; }
    return { text: ACT[act](), topic: act, chips: act === "price" || act === "wedding" ? [L().orderChip] : [] };
  }
  if (O) return orderTurn(t);
  const h = score(t), n = norm(t);
  // "wedding order" is a question about wedding orders, not the start of an order
  if (h.wedding && h.order && !qtyFrom(t, false) && !h.price) { const r = reply(t.replace(/պատվեր\S*|заказ\S*|order\S*|patver\S*/gi, "")); return { text: r.text, topic: "wedding", chips: [L().orderChip] }; }
  if (h.order || /պատվիրել չատ|chatum|chatov|в чате|in chat/.test(n) || qtyFrom(t, false)) return startOrder(t);
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
  t.innerHTML = "<i></i><i></i><i></i><span></span>"; t.lastChild.textContent = L().typing; $("msgs").appendChild(t); $("msgs").scrollTop = 1e6; return t;
}
function addExtras(r) {
  if (r.link || r.copy || r.pay) {
    const w = document.createElement("div"); w.className = "qr keep";
    if (r.pay) { const a = document.createElement("a"); a.className = "pay"; a.href = r.pay; a.textContent = L().payNow; w.appendChild(a); }
    if (r.link) { const a = document.createElement("a"); a.className = "wa"; a.href = r.link; a.target = "_blank"; a.rel = "noopener"; a.textContent = L().wa; w.appendChild(a); }
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
    add(L().failed, "bot");
    $("msgs").appendChild(fallbackButtons(s.msg, CL)); $("msgs").scrollTop = 1e6;
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
function send(q, act) {
  q = String(q).trim(); if (!q || busy) return;
  document.querySelectorAll("#msgs .qr:not(.keep)").forEach((x) => x.remove());
  add(q, "me"); busy = true;
  let r; try { r = respond(q, act); } catch (e) { console.error(e); r = { text: R.unknown(), chips: [] }; }
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
  document.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => send(c.textContent, c.dataset.act)));
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
