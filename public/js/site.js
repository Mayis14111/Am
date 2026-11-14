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
    from: (p) => `${p}ից`,
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
    day: (d) => `Ստացման ամսաթիվ՝ ${d}`,
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

/* ================= extra texts (form v3, price lines, chat controls) ================= */
const WD = {
  hy: ["կիրակի", "երկուշաբթի", "երեքշաբթի", "չորեքշաբթի", "հինգշաբթի", "ուրբաթ", "շաբաթ"],
  ru: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};
Object.assign(T.hy, {
  closeChat: "Փակել չատը",
  introNone: " Մի քանի հարց կտամ, հետո կկարողանաք ստուգել և ուղարկել պատվերը։",
  ctlBack: "Հետ", ctlChange: "Փոխել ընտրությունը", ctlContact: "Կապվել մեզ հետ",
  contactText: (p) => `Կարող եք զանգահարել կամ գրել մեզ՝ ${p}։ Պատվերի լրացումը կարող եք շարունակել այստեղ։`,
  backNone: "Ավելի հետ գնալ չի ստացվում։",
  sizesHead: "Չափսեր և գներ՝",
  kindHead: (s) => `${s}՝ միջուկներ և գներ՝`,
  packHead: "Ինչպե՞ս փաթեթավորենք գաթան։",
  fromForm: (g) => `Պատվերի ձևից վերցրեցի՝ ${g}։`,
  received: (id) => `Ձեր պատվերն ուղարկված է։ Պատվերի համարը՝ ${id}։ Մենք կկապվենք ձեզ հետ՝ մանրամասները հաստատելու համար։`,
  lineGata: "Գաթայի արժեքը", lineBox: "Տուփի արժեքը", linePack: "Փաթեթավորման արժեքը", lineDel: "Առաքման արժեքը",
  tbd: "Ենթակա է ճշտման", free: "Անվճար", estLabel: "Նախնական գումար", totLabel: "Ընդհանուր գումար",
  estNote: "Վերջնական գումարը կհաստատենք պատվերը հաստատելիս։",
  payLater: "Առցանց վճարումը հասանելի կլինի վերջնական գինը հաստատելուց հետո։",
  orderClosed: "Պատվերն արդեն ուղարկված է։ Նոր պատվերի համար սեղմեք «Պատվիրել չատով»։",
});
Object.assign(T.ru, {
  closeChat: "Закрыть чат",
  introNone: " Задам несколько вопросов, затем вы сможете проверить и отправить заказ.",
  ctlBack: "Назад", ctlChange: "Изменить выбор", ctlContact: "Связаться с нами",
  contactText: (p) => `Вы можете позвонить или написать нам: ${p}. Оформление заказа можно продолжить здесь.`,
  backNone: "Дальше назад нельзя.",
  sizesHead: "Размеры и цены:",
  kindHead: (s) => `${s}: начинки и цены:`,
  packHead: "Как упаковать гату?",
  fromForm: (g) => `Взяла из формы заказа: ${g}.`,
  received: (id) => `Ваш заказ отправлен. Номер заказа: ${id}. Мы свяжемся с вами, чтобы подтвердить детали.`,
  lineGata: "Стоимость гаты", lineBox: "Стоимость коробки", linePack: "Стоимость упаковки", lineDel: "Стоимость доставки",
  tbd: "Уточняется", free: "Бесплатно", estLabel: "Предварительная сумма", totLabel: "Итого",
  estNote: "Итоговую сумму подтвердим при подтверждении заказа.",
  payLater: "Онлайн-оплата будет доступна после подтверждения итоговой цены.",
  orderClosed: "Заказ уже отправлен. Для нового заказа нажмите «Заказать в чате».",
});
Object.assign(T.en, {
  closeChat: "Close chat",
  introNone: " I'll ask a few questions, then you can check and send your order.",
  ctlBack: "Back", ctlChange: "Change choice", ctlContact: "Contact us",
  contactText: (p) => `You can call or message us: ${p}. You can keep filling in your order here.`,
  backNone: "Can't go back any further.",
  sizesHead: "Sizes and prices:",
  kindHead: (s) => `${s}: fillings and prices:`,
  packHead: "How should we pack it?",
  fromForm: (g) => `Taken from the order form: ${g}.`,
  received: (id) => `Your order has been sent. Order number: ${id}. We'll contact you to confirm the details.`,
  lineGata: "Gata price", lineBox: "Box price", linePack: "Packaging price", lineDel: "Delivery price",
  tbd: "To be confirmed", free: "Free", estLabel: "Estimated total", totLabel: "Total",
  estNote: "We'll confirm the final total when we confirm your order.",
  payLater: "Online payment becomes available once the final price is confirmed.",
  orderClosed: "The order has been sent. For a new order, tap “Order in chat”.",
});
Object.assign(F.hy, {
  s1: "Գաթան", s2: "Արժեքը", s3: "Ստացումը", s4: "Ձեր տվյալները", s5: "Լրացուցիչ ցանկություններ", s6: "Ստուգեք և ուղարկեք",
  picked: "Ձեր ընտրությունը", change: "Փոխել",
  size: "Չափս", kind: "Միջուկ", box: "Փաթեթավորում", qty: "Քանակ", date: "Ստացման ամսաթիվ", how: "Ստացման եղանակ", addr: "Առաքման հասցե",
  name: "Անուն", phone: "Հեռախոսահամար", notes: "Լրացուցիչ ցանկություններ", optional: "ոչ պարտադիր",
  notesPh: "Օրինակ՝ գույնը, սկզբնատառերը կամ ստացման նախընտրելի ժամը։", submit: "Ուղարկել պատվերը", submitPay: "Ուղարկել պատվերը և վճարել",
  reviewEmpty: "Լրացրեք վերևի դաշտերը, և այստեղ կտեսնեք ձեր պատվերը։",
  failSaved: "Ձեր տվյալները պահպանված են ձևում․ կարող եք նորից փորձել։",
});
Object.assign(F.ru, {
  s1: "Гата", s2: "Стоимость", s3: "Получение", s4: "Ваши данные", s5: "Дополнительные пожелания", s6: "Проверьте и отправьте",
  picked: "Ваш выбор", change: "Изменить",
  size: "Размер", kind: "Начинка", box: "Упаковка", qty: "Количество", date: "Дата получения", how: "Способ получения", addr: "Адрес доставки",
  name: "Имя", phone: "Номер телефона", notes: "Дополнительные пожелания", optional: "необязательно",
  notesPh: "Например: цвет, инициалы или удобное время получения.", submit: "Отправить заказ", submitPay: "Отправить заказ и оплатить",
  reviewEmpty: "Заполните поля выше — здесь появится ваш заказ.",
  failSaved: "Ваши данные сохранены в форме — можно попробовать ещё раз.",
});
Object.assign(F.en, {
  s1: "Your gata", s2: "Price", s3: "Receiving", s4: "Your details", s5: "Extra requests", s6: "Check and send",
  picked: "Your choice", change: "Change",
  size: "Size", kind: "Filling", box: "Packaging", qty: "Quantity", date: "Date needed", how: "How you'll receive it", addr: "Delivery address",
  name: "Name", phone: "Phone number", notes: "Extra requests", optional: "optional",
  notesPh: "For example: colour, initials or preferred pickup time.", submit: "Send order", submitPay: "Send order and pay",
  reviewEmpty: "Fill in the fields above and your order will appear here.",
  failSaved: "Your details are kept in the form, so you can try again.",
});

/* ================= shared price rules (form and chat use the same) ================= */
const PACKS = (G.packs && G.packs.length ? G.packs : [{ id: "none", label: { hy: "Առանց տուփի", ru: "Без коробки", en: "No box" }, price: 0 }]);
const pOpt = (id) => PACKS.find((p) => p.id === id);
function calc({ fillingId, sizeIdx, qty, packId, deliveryId }) {
  const f = SHOWN.find((x) => x.id === fillingId), unit = f ? +f.prices[sizeIdx] || 0 : 0, q = qty || 1;
  const pk = pOpt(packId) || pOpt("none") || { id: "none", price: 0 }, d = dOpt(deliveryId) || {};
  const pack = pk.id === "none" ? null : { label: pk.id === "box" ? "box" : "pack", known: !(pk.price < 0), amount: pk.price > 0 ? pk.price * q : 0 };
  const deliv = deliveryId ? { known: !(d.price < 0), amount: d.price > 0 ? +d.price : 0 } : null;
  const gata = unit * q;
  const estimate = (pack && !pack.known) || (deliv && !deliv.known);
  return { unit, q, gata, pack, deliv, total: gata + (pack ? pack.amount : 0) + (deliv ? deliv.amount : 0), estimate: !!estimate };
}
/* price lines as [label, value, isUnknown] */
function priceLines(p, l) {
  const t = T[l], out = [[t.lineGata, (p.q > 1 ? `${p.q} × ${fmtL(p.unit, l)} = ` : "") + fmtL(p.gata, l)]];
  if (p.pack) out.push([p.pack.label === "box" ? t.lineBox : t.linePack, p.pack.known ? fmtL(p.pack.amount, l) : t.tbd, !p.pack.known]);
  if (p.deliv) out.push([t.lineDel, p.deliv.known ? (p.deliv.amount ? fmtL(p.deliv.amount, l) : t.free) : t.tbd, !p.deliv.known]);
  return out;
}
const totalLine = (p, l) => `${p.estimate ? T[l].estLabel : T[l].totLabel}՝ ${fmtL(p.total, l)}`.replace("՝", l === "hy" ? "՝" : ":");
function priceTextBlock(p, l) {
  const s = priceLines(p, l).map(([a, b]) => `${a}${l === "hy" ? "՝" : ":"} ${b}`).join("\n") + "\n" + totalLine(p, l);
  return p.estimate ? s + "\n" + T[l].estNote : s;
}
const longDate = (d, l) => (l === "en" ? `${WD.en[d.getDay()]}, ${d.getDate()} ${MON.en[d.getMonth()]} ${d.getFullYear()}` : `${d.getDate()} ${MON[l][d.getMonth()]}, ${d.getFullYear()} (${WD[l][d.getDay()]})`);
const parseISO = (v) => { const [y, m, dd] = String(v).split("-").map(Number); return new Date(y, m - 1, dd); };
const newKey = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12));

/* ================= mobile menu (focus moves into it, Esc returns) ================= */
const burger = $("burger"), mm = $("mmenu");
if (burger && mm) {
  const set = (o, focusBack) => {
    mm.hidden = !o; burger.setAttribute("aria-expanded", o);
    if (o) mm.querySelector("a")?.focus(); else if (focusBack) burger.focus();
  };
  burger.addEventListener("click", () => set(mm.hidden));
  mm.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !mm.hidden) set(false, true); });
}

/* ================= gallery: swipe on phones, arrows on computers ================= */
const gal = $("gal");
if (gal) document.querySelectorAll(".gbtn").forEach((b) => b.addEventListener("click", () => gal.scrollBy({ left: +b.dataset.dir * gal.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" })));

/* ================= order form ================= */
const FL = F[PL];
const form = $("f");
let formKey = newKey(), sending = false, picked = { title: "" };
const touched = new Set();
const opt = (v, l, s) => `<option value="${v}"${s ? " selected" : ""}>${l}</option>`;
const fieldHtml = (id, label, input, extra = "") => `<label for="${id}" id="${id}L"${extra}>${label}${input}<span class="err" id="${id}E" hidden></span></label>`;
function buildForm() {
  if (!form) return;
  if (!G.accept) { form.innerHTML = `<div class="closed">${G.closedText || ""}<br>📞 ${PHONES}</div>`; return; }
  const mid = Math.min(1, SIZES.length - 1);
  form.innerHTML = `
    <input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;width:1px;height:1px" aria-hidden="true">
    <div class="picked" id="fpicked" hidden><img alt="" id="fpickedImg"><div><small>${FL.picked}</small><b id="fpickedT"></b></div><button type="button" id="fpickedX">${FL.change}</button></div>
    <fieldset class="fs"><legend><i>1</i>${FL.s1}</legend>
      <div class="row">
        ${fieldHtml("fsize", FL.size, `<select id="fsize">${SIZES.map((s, i) => opt(i, sizeL(i, PL), i === mid)).join("")}</select>`)}
        ${fieldHtml("kind", FL.kind, `<select id="kind">${SHOWN.map((f) => opt(f.id, tx(f.name, PL))).join("")}</select>`)}
      </div>
      ${fieldHtml("fchoco", FL.choco, `<select id="fchoco">${Object.keys(CHOCO).map((k) => opt(k, tx(CHOCO[k], PL))).join("")}</select>`, " hidden")}
      <div class="row">
        ${fieldHtml("fpack", FL.box, `<select id="fpack">${PACKS.map((p) => opt(p.id, tx(p.label, PL))).join("")}</select>`)}
        ${fieldHtml("qty", FL.qty, `<input id="qty" type="number" min="1" max="9999" step="1" value="1" inputmode="numeric" aria-describedby="qtyE">`)}
      </div>
    </fieldset>
    <fieldset class="fs"><legend><i>2</i>${FL.s2}</legend><div class="breakdown" id="fprice" aria-live="polite"></div><p class="note" id="fpaynote" hidden></p></fieldset>
    <fieldset class="fs"><legend><i>3</i>${FL.s3}</legend>
      <div class="row">
        ${fieldHtml("date", FL.date, `<input id="date" type="date" required aria-describedby="dateE">`)}
        ${fieldHtml("how2", FL.how, `<select id="how2">${DELIV.map((d) => opt(d.id, tx(d.label, PL))).join("")}</select>`)}
      </div>
      <p class="note" id="fdnote"></p>
      <div class="fwarn" id="fsoon" hidden>${T[PL].soon(PHONES).trim()}</div>
      ${fieldHtml("faddr", FL.addr, `<input id="faddr" autocomplete="street-address" placeholder="${FL.addrPh}" maxlength="200" aria-describedby="faddrE">`, " hidden")}
    </fieldset>
    <fieldset class="fs"><legend><i>4</i>${FL.s4}</legend>
      <div class="row">
        ${fieldHtml("name", FL.name, `<input id="name" required autocomplete="name" maxlength="80" aria-describedby="nameE">`)}
        ${fieldHtml("phone", FL.phone, `<input id="phone" required type="tel" inputmode="tel" autocomplete="tel" placeholder="+374 …" maxlength="30" aria-describedby="phoneE">`)}
      </div>
    </fieldset>
    <fieldset class="fs"><legend><i>5</i>${FL.s5}</legend>
      ${fieldHtml("notes", `${FL.notes} <span class="note">(${FL.optional})</span>`, `<textarea id="notes" rows="2" maxlength="600" aria-describedby="notesH"></textarea><span class="note" id="notesH">${FL.notesPh}</span>`)}
    </fieldset>
    <fieldset class="fs"><legend><i>6</i>${FL.s6}</legend>
      <div class="review" id="freview" aria-live="polite"></div>
      ${G.pay ? `<div class="pay-pick" id="fpaypick" role="radiogroup" aria-label="${FL.pay}">
        <label><input type="radio" name="pay" value="cash" checked><span>${FL.payCash}<small>${FL.payCashS}</small></span></label>
        <label><input type="radio" name="pay" value="online"><span>${FL.payOn}<small>${FL.payOnS}</small></span></label>
      </div>` : ""}
      <button class="btn btn-gold btn-submit" type="submit" id="fsubmit">${FL.submit}</button>
      <p class="note">${G.orderNote || ""}</p>
      <div class="done" id="done" hidden tabindex="-1"></div>
    </fieldset>`;
  $("date").min = isoDate(today());
  $("date").max = isoDate(new Date(today().getTime() + 366 * 864e5));
  $("date").value = isoDate(new Date(today().getTime() + Math.max(1, G.minDays || 0) * 864e5 + 36e5));
  $("fpickedX").addEventListener("click", () => { const p = document.getElementById("products"); if (p) p.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); else location.href = G.menuUrl || "/menu"; });
  form.addEventListener("input", (e) => { if (e.target.id) { touched.add(e.target.id); clearErr(e.target.id); } fUpdate(); });
  form.addEventListener("change", (e) => { if (e.target.id) touched.add(e.target.id); fUpdate(); });
  form.addEventListener("focusout", (e) => { if (["name", "phone", "qty", "date", "faddr"].includes(e.target.id) && e.target.value) validateField(e.target.id); });
  form.addEventListener("submit", fSubmit);
  fUpdate();
}
function fState() {
  const si = +$("fsize").value, f = SHOWN.find((x) => x.id === $("kind").value), qRaw = $("qty").value.trim(), q = Number(qRaw);
  const qOk = /^\d+$/.test(qRaw) && q >= 1 && q <= 9999;
  const d = dOpt($("how2").value) || {};
  const packId = $("fpack").value;
  const pay = (form.querySelector("input[name=pay]:checked") || {}).value || "cash";
  const p = calc({ fillingId: f && f.id, sizeIdx: si, qty: qOk ? q : 1, packId, deliveryId: d.id });
  return { si, f, q: qOk ? q : 1, qOk, packId, d, p, pay };
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
  const s = fState(), t = T[PL];
  $("faddrL").hidden = !s.d.address;
  $("fchocoL").hidden = !(s.f && s.f.id === "choco");
  $("fdnote").textContent = tx(s.d.note, PL);
  // price breakdown
  const box = $("fprice"); box.innerHTML = "";
  for (const [a, b, unk] of priceLines(s.p, PL)) { const r = document.createElement("div"); r.innerHTML = "<span></span><span></span>"; r.firstChild.textContent = a; r.lastChild.textContent = b; if (unk) r.lastChild.className = "tbd"; box.append(r); }
  const tot = document.createElement("div"); tot.className = "tot"; tot.innerHTML = "<span></span><span></span>";
  tot.firstChild.textContent = s.p.estimate ? t.estLabel : t.totLabel; tot.lastChild.textContent = fmtL(s.p.total, PL); box.append(tot);
  if (s.p.estimate) { const sm = document.createElement("small"); sm.textContent = t.estNote; box.append(sm); }
  // online payment only for final prices
  const pp = $("fpaypick");
  if (pp) {
    pp.querySelector("input[value=online]").disabled = s.p.estimate;
    if (s.p.estimate) pp.querySelector("input[value=cash]").checked = true;
    $("fpaynote").hidden = !s.p.estimate; $("fpaynote").textContent = t.payLater;
  }
  $("fsoon").hidden = dateCheck($("date").value) !== "soon";
  $("fsubmit").textContent = G.pay && fState().pay === "online" ? FL.submitPay : FL.submit;
  // review
  $("freview").textContent = reviewText(s);
}
function reviewText(s) {
  const t = T[PL], l = PL, lines = [];
  if (picked.title) lines.push(t.product(picked.title));
  lines.push(`${tx(s.f && s.f.short, l)}${t.gataWord}, ${sizeL(s.si, l).toLowerCase()} — ${t.qty(s.q)}`);
  lines.push(`${FL.box}${l === "hy" ? "՝" : ":"} ${tx((pOpt(s.packId) || {}).label, l)}`);
  const dc = dateCheck($("date").value);
  lines.push(`${FL.date}${l === "hy" ? "՝" : ":"} ${dc === "bad" ? "—" : longDate(parseISO($("date").value), l)}`);
  lines.push(`${FL.how}${l === "hy" ? "՝" : ":"} ${tx(s.d.label, l)}${s.d.address && $("faddr").value.trim() ? ", " + $("faddr").value.trim() : ""}`);
  if ($("name").value.trim() || $("phone").value.trim()) lines.push(`${$("name").value.trim()} ${$("phone").value.trim()}`.trim());
  if ($("notes").value.trim()) lines.push(t.note($("notes").value.trim()));
  lines.push("", totalLine(s.p, l));
  return lines.join("\n");
}
function setErr(id, msg) {
  const el = $(id), e = $(id + "E"); if (!el || !e) return;
  el.setAttribute("aria-invalid", "true"); e.textContent = msg; e.hidden = false;
}
function clearErr(id) { const el = $(id), e = $(id + "E"); if (el) el.removeAttribute("aria-invalid"); if (e) { e.hidden = true; e.textContent = ""; } }
function validateField(id) {
  const t = T[PL], s = fState(), v = ($(id).value || "").trim();
  clearErr(id);
  if (id === "name" && !v) return setErr(id, FL.need), false;
  if (id === "phone") { const dg = v.replace(/\D/g, ""); if (!v) return setErr(id, FL.need), false; if (dg.length < 8 || dg.length > 15) return setErr(id, t.phoneBad), false; }
  if (id === "qty" && !s.qOk) return setErr(id, t.qtyBad), false;
  if (id === "date") { const dc = dateCheck(v); if (!v) return setErr(id, FL.need), false; if (dc === "bad") return setErr(id, FL.dateBad), false; if (dc === "past") return setErr(id, t.past.trim()), false; }
  if (id === "faddr" && s.d.address && v.replace(/\s/g, "").length < 5) return setErr(id, v ? t.addrBad : FL.need), false;
  return true;
}
async function postOrder(body) {
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctl.signal });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j.error, status: r.status };
    if (!j.ok || !j.id) return { ok: false, network: true };
    return j;
  } catch (e) { return { ok: false, network: true }; } finally { clearTimeout(tm); }
}
function waLink(text) { return G.whatsapp ? `https://wa.me/${G.whatsapp}?text=${encodeURIComponent(text)}` : ""; }
const telHref = () => "tel:" + String((G.phones || [])[0] || "").replace(/[^\d+]/g, "").replace(/^0/, "+374");
function fallbackButtons(text, l) {
  const t = T[l], w = document.createElement("div"); w.className = "qr keep";
  const link = waLink(text);
  if (link) { const a = document.createElement("a"); a.className = "wa"; a.href = link; a.target = "_blank"; a.rel = "noopener"; a.textContent = t.wa; w.appendChild(a); }
  if ((G.phones || []).length) { const a = document.createElement("a"); a.className = "call"; a.href = telHref(); a.textContent = `${t.call} · ${G.phones[0]}`; w.appendChild(a); }
  if (text) {
    const b = document.createElement("button"); b.type = "button"; b.className = "qrb"; b.textContent = t.copy;
    b.addEventListener("click", () => { navigator.clipboard?.writeText(text).then(() => { b.textContent = t.copied; }).catch(() => { b.textContent = t.copyFail; }); });
    w.appendChild(b);
  }
  return w;
}
async function fSubmit(e) {
  e.preventDefault();
  if (sending) return; // no double orders from repeated clicks
  const t = T[PL], s = fState();
  const ids = ["qty", "date", "faddr", "name", "phone"].filter((id) => id !== "faddr" || s.d.address);
  const bad = ids.filter((id) => !validateField(id));
  if (bad.length) { $(bad[0]).focus(); return; }
  const d = $("done"), btn = $("fsubmit");
  const body = {
    key: formKey, lang: PL, source: "form", filling: s.f && s.f.id, choco: s.f && s.f.id === "choco" ? tx(CHOCO[$("fchoco").value], "hy") : "",
    size: SIZES[s.si] && SIZES[s.si].cm, qty: s.q, pack: s.packId, box: s.packId !== "none", date: $("date").value, delivery: s.d.id, address: s.d.address ? $("faddr").value : "",
    name: $("name").value, phone: $("phone").value, notes: $("notes").value, product: picked.title, pay: s.p.estimate ? "cash" : s.pay,
    website: form.querySelector("input[name=website]").value,
  };
  sending = true; btn.disabled = true; btn.textContent = FL.sending; d.hidden = true; d.className = "done";
  const r = await postOrder(body);
  sending = false; btn.disabled = false; fUpdate();
  d.hidden = false;
  if (r.ok) {
    // success is shown only after the server confirms the order was saved
    if (r.checkoutUrl) { d.textContent = FL.redirect; location.href = r.checkoutUrl; return; }
    d.className = "done ok"; d.textContent = t.received(r.id) + (r.payError ? "\n\n" + t.payFail : "");
    formKey = newKey();
    $("notes").value = ""; setPicked(null); touched.clear(); fUpdate();
  } else if (r.error) {
    d.className = "done bad"; d.textContent = "⚠️ " + r.error + "\n" + FL.failSaved;
  } else {
    // we don't know if it arrived: keep the same key so a retry can't create a second order
    d.className = "done bad"; d.textContent = t.failed + "\n" + FL.failSaved;
    const lines = [t.plainHead, "", reviewText(s), "", priceTextBlock(s.p, PL)];
    d.appendChild(fallbackButtons(lines.join("\n"), PL));
  }
  d.focus({ preventScroll: true });
  d.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
}
/* product cards: remember the choice, show a thumbnail, set the packaging */
function setPicked(card) {
  picked = card ? { title: card.dataset.pick, pack: card.dataset.pack || "", img: card.dataset.img || "" } : { title: "" };
  const box = $("fpicked"); if (!box) return;
  box.hidden = !picked.title;
  if (picked.title) {
    $("fpickedT").textContent = picked.title;
    $("fpickedImg").hidden = !picked.img; if (picked.img) $("fpickedImg").src = picked.img;
    if (picked.pack && pOpt(picked.pack)) { $("fpack").value = picked.pack; touched.add("fpack"); }
    touched.add("picked");
  }
  fUpdate();
}
buildForm();
document.querySelectorAll("[data-pick]").forEach((a) => a.addEventListener("click", () => setPicked(a)));
/* /order?product=wedding-box — the product chosen on the menu or a product page */
(() => {
  const slug = new URL(location.href).searchParams.get("product");
  const pr = slug && (G.products || []).find((x) => x.slug === slug);
  if (pr && form && $("fpack")) setPicked({ dataset: { pick: pr.title, pack: pr.pack, img: pr.img } });
})();

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
    return ans("delivery") + (O ? "" : "\n\n" + L().orderHint);
  },
  phone: () => L().phone(G.phones || [], G.instagram),
  where: () => ans("where"),
  order: () => L().orderHint,
  wedding: () => ans("wedding") + (O ? "" : "\n\n" + L().wantOrder),
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


/* ================= ordering inside the chat (same rules as the form) ================= */
let O = null, waiting = null, HIST = [];
const newOrder = () => ({ kind: null, choco: null, pack: PACKS.length === 1 ? PACKS[0].id : null, size: null, qty: null, date: null, delivery: null, dGroup: null, address: null, name: null, phone: null, notes: null, pay: G.pay ? null : "cash", product: "", key: newKey() });
const STEPS = ["size", "kind", "choco", "pack", "qty", "date", "delivery", "ymode", "address", "name", "phone", "notes", "pay"];
const chatCalc = () => calc({ fillingId: O.kind, sizeIdx: O.size, qty: O.qty || 1, packId: O.pack || "none", deliveryId: O.delivery });
function need(k) {
  if (k === "choco") return O.kind === "choco" && !O.choco;
  if (k === "delivery") return !O.delivery && !O.dGroup;
  if (k === "ymode") return !O.delivery && !!O.dGroup;
  if (k === "address") return !!(dOpt(O.delivery) || {}).address && O.address == null;
  if (k === "pay") return O.pay == null && !chatCalc().estimate;
  return O[k] == null;
}
const SEPL = () => (CL === "hy" ? "՝ " : ": ");
const minAt = (i) => Math.min(...SHOWN.map((f) => +f.prices[i] || Infinity));
const ctlChips = () => [L().ctlBack, L().ctlChange, L().ctlContact];
function prompt(st) {
  const l = L();
  switch (st) {
    case "size": return { text: l.askSize + "\n\n" + l.sizesHead + "\n" + SIZES.map((s, i) => `${s.cm} ${CM[CL]} — ${l.from(fmt(minAt(i)))}`).join("\n"), chips: SIZES.map((s) => `${s.cm} ${CM[CL]}`) };
    case "kind": return { text: l.kindHead(`${SIZES[O.size].cm} ${CM[CL]}`) + "\n" + SHOWN.map((f) => `${tx(f.short, CL)} — ${fmt(f.prices[O.size])}`).join("\n") + "\n\n" + l.askKind(), chips: SHOWN.map((f) => tx(f.short, CL)) };
    case "choco": return { text: l.askChoco, chips: l.chocoChips };
    case "pack": return { text: l.packHead + "\n" + PACKS.map((p) => `${tx(p.label, CL)} — ${p.price < 0 ? l.tbd.toLowerCase() : p.price > 0 ? fmt(p.price) : l.free.toLowerCase()}`).join("\n"), chips: PACKS.map((p) => tx(p.label, CL)) };
    case "qty": return { text: l.askQty, chips: ["1", "2", "5", "10", "20"] };
    case "date": return { text: l.askDate, chips: l.dateChips };
    case "delivery": return { text: l.askDelivery + "\n" + DELIV.map((d) => `• ${tx(d.label, CL)}${tx(d.note, CL) ? " — " + tx(d.note, CL) : ""}`).join("\n"), chips: DELIV.map((d) => tx(d.label, CL)) };
    case "ymode": return { text: l.askYmode, chips: DELIV.filter((d) => d.id === "megamall" || d.id === "yerevan").map((d) => tx(d.label, CL)) };
    case "address": return { text: l.askAddress, chips: [] };
    case "name": return { text: l.askName, chips: [] };
    case "phone": return { text: l.askPhone, chips: [] };
    case "notes": return { text: l.askNotes, chips: [l.notesChip] };
    case "pay": return { text: l.askPay, chips: l.payChips };
    case "confirm": return { text: summary() + "\n\n" + l.confirmQ, chips: l.confirmChips, noCtl: true };
  }
}
function summary() {
  const l = L(), f = fill(O.kind), d = dOpt(O.delivery) || {}, p = chatCalc();
  const lines = [l.yourOrder];
  if (O.product) lines.push(`• ${l.product(O.product)}`);
  lines.push(`• ${tx(f.short, CL)}${l.gataWord}${O.kind === "choco" && O.choco ? ` (${tx(CHOCO[O.choco], CL)})` : ""}, ${sizeL(O.size, CL).toLowerCase()}`, `• ${l.qty(O.qty)}`);
  lines.push(`• ${tx((pOpt(O.pack) || {}).label, CL)}`);
  lines.push(`• ${l.day(longDate(O.date, CL))}`, `• ${tx(d.label, CL)}${O.address ? `, ${O.address}` : ""}`, `• ${O.name}, ${O.phone}`);
  if (O.notes) lines.push(`• ${l.note(O.notes)}`);
  if (G.pay && !p.estimate) lines.push(`• ${O.pay === "online" ? l.payOnline : l.payCash}`);
  lines.push("", priceTextBlock(p, CL));
  return lines.join("\n");
}
const CHANGE = [
  ["size", /չափ|chap|size|размер/, () => { O.size = null; }],
  ["kind", /միջուկ|mijuk|տեսակ|tesak|начин|вид|kind|filling/, () => { O.kind = null; O.choco = null; }],
  ["pack", /փաթեթ|տուփ|tup|box|pack|упак|короб/, () => { O.pack = null; }],
  ["qty", /քանակ|qanak|qty|quantity|колич/, () => { O.qty = null; }],
  ["date", /օր|ամսաթ|or\b|date|дат|день/, () => { O.date = null; }],
  ["delivery", /առաք|araq|deliv|достав|получ|վերցն|եղանակ/, () => { O.delivery = null; O.dGroup = null; O.address = null; }],
  ["name", /անուն|anun|name|имя/, () => { O.name = null; }],
  ["phone", /հեռախ|herax|phone|телеф/, () => { O.phone = null; }],
  ["notes", /նշում|ցանկ|nshum|note|request|пожел|примеч/, () => { O.notes = null; }],
  ["pay", /վճար|vchar|pay|оплат/, () => { O.pay = null; }],
].filter((c) => (c[0] !== "pack" || PACKS.length > 1) && (c[0] !== "pay" || G.pay));
const changeChips = () => CHANGE.map((c) => L().fields[c[0]]);
let ackI = 0;
function nextAsk(pre) {
  let note = "", extra = "";
  if (O.date && O.date < today()) { O.date = null; note = L().past; }
  const st = STEPS.find(need) || "confirm";
  waiting = st; const p = prompt(st);
  if ((st === "delivery" || st === "confirm") && O.date && (O.date - today()) / 864e5 < Math.max(1, G.minDays || 0) && !O._warned) { extra = L().soon(PHONES); O._warned = true; }
  return { text: (pre ? pre + "\n\n" : "") + note + extra + p.text, chips: p.chips, ctl: !p.noCtl };
}
/* reuse what the customer already chose in the order form (only fields they touched) */
function fromForm() {
  if (!form || !$("fsize") || !touched.size) return [];
  const got = [], l = L();
  if (touched.has("fsize") || touched.has("picked")) { O.size = +$("fsize").value; got.push(`${SIZES[O.size].cm} ${CM[CL]}`); }
  if (touched.has("kind")) { O.kind = $("kind").value; got.push(tx(fill(O.kind).short, CL).toLowerCase()); }
  if (touched.has("fpack") && pOpt($("fpack").value)) { O.pack = $("fpack").value; got.push(tx(pOpt(O.pack).label, CL).toLowerCase()); }
  if (touched.has("qty") && /^\d+$/.test($("qty").value) && +$("qty").value >= 1) { O.qty = +$("qty").value; got.push(l.pcs(O.qty)); }
  if (touched.has("date") && ["ok", "soon"].includes(dateCheck($("date").value))) { O.date = parseISO($("date").value); got.push(fmtDate(O.date)); }
  if (touched.has("how2")) { O.delivery = $("how2").value; got.push(tx(dOpt(O.delivery).label, CL)); }
  if (touched.has("faddr") && $("faddr").value.replace(/\s/g, "").length >= 5 && (dOpt(O.delivery) || {}).address) O.address = $("faddr").value.trim();
  if (touched.has("name") && $("name").value.trim().length >= 2) { O.name = $("name").value.trim(); got.push(O.name); }
  if (touched.has("phone")) { const dg = $("phone").value.replace(/\D/g, ""); if (dg.length >= 8 && dg.length <= 15) O.phone = $("phone").value.trim(); }
  if (picked.title) O.product = picked.title;
  return got;
}
function startOrder(t) {
  if (!G.accept) return { text: (G.closedText || "") + "\n📞 " + PHONES, chips: [] };
  O = newOrder(); waiting = null; HIST = [];
  const reused = fromForm();
  extract(t, null);
  const got = [];
  if (O.kind && !reused.length) got.push(tx(fill(O.kind).short, CL).toLowerCase() + L().gataWord);
  if (O.qty && !reused.length) got.push(L().pcs(O.qty));
  if (O.size != null && !reused.length) got.push(sizeL(O.size, CL).toLowerCase());
  if (O.date && !reused.length) got.push(fmtDate(O.date));
  let pre = L().intro + (got.length ? L().introGot(got.join(", ")) : L().introNone);
  if (reused.length) pre += "\n" + L().fromForm(reused.join(", "));
  return nextAsk(pre);
}
function packFrom(h, asked) {
  for (const p of PACKS) for (const l of ["hy", "ru", "en"]) if (norm(tx(p.label, l)) === h) return p.id;
  if (/պայուսակ|payusak|(^|\s)bag|пакет/.test(h) && pOpt("bag")) return "bag";
  if (/շղարշ|tul|фатин|tulle|wrap|լենտ|ժապավեն/.test(h) && pOpt("wrap")) return "wrap";
  const b = boxFrom(h, asked);
  if (b === "box" && pOpt("box")) return "box";
  if (b === "none") return "none";
  return null;
}
function extract(t, step) {
  const h = norm(t);
  if (!O.kind) { const f = fillFrom(h); if (f) O.kind = f; }
  if (O.kind === "choco" && !O.choco) { const c = chocoFrom(h); if (c) O.choco = c; }
  if (!O.pack) { const p = packFrom(h, step === "pack"); if (p) O.pack = p; }
  if (O.size == null) { const s = sizeFrom(t.replace(/մեծ պատվեր|mec patver|mets patver|большой заказ|big order/gi, "")); if (s >= 0 && (step === "size" || /սմ|sm|см|cm|փոքր|միջին|մեծ|poqr|pokr|mijin|mec|mets|small|medium|large|big|маленьк|средн|больш/.test(h))) O.size = s; }
  if (!O.date) { const d = dateFrom(t); if (d && d !== "bad" && (d - today()) / 864e5 <= 366) O.date = d; }
  if (O.qty == null) { const q = qtyFrom(t, step === "qty"); if (q && q >= 1 && q <= 9999) O.qty = q; }
  if (!O.delivery) { const dv = delivFrom(h); if (dv) { if (dv.id) { O.delivery = dv.id; O.dGroup = null; } else if (!O.dGroup) O.dGroup = dv.group; } }
}
function plainOrder() { return L().plainHead + "\n\n" + summary().split("\n").slice(1).join("\n"); }
function finish() {
  const msg = plainOrder(), p = chatCalc();
  const body = {
    key: O.key, lang: CL, source: "chat", filling: O.kind, choco: O.choco ? tx(CHOCO[O.choco], "hy") : "", size: SIZES[O.size].cm, qty: O.qty,
    pack: O.pack || "none", box: (O.pack || "none") !== "none", date: isoDate(O.date), delivery: O.delivery, address: O.address || "", name: O.name, phone: O.phone,
    notes: O.notes || "", product: O.product || "", pay: p.estimate ? "cash" : O.pay,
  };
  const saved = O;
  waiting = "sending";
  return { text: L().sending, chips: [], submit: { body, msg, saved } };
}
const isCtl = (h, key) => ["hy", "ru", "en"].some((l) => norm(T[l][key]) === h);
function orderTurn(t) {
  const h = norm(t), l = L();
  if (waiting === "sending") return { text: L().sending, chips: [] };
  // controls shown during ordering
  if (isCtl(h, "ctlBack")) {
    if (!HIST.length) { const p = prompt(waiting); return { text: l.backNone + "\n\n" + p.text, chips: p.chips, ctl: true }; }
    O = HIST.pop(); return nextAsk("");
  }
  if (isCtl(h, "ctlChange")) { waiting = "change"; return { text: l.changeWhat, chips: changeChips(), ctl: true }; }
  if (isCtl(h, "ctlContact")) { const p = prompt(waiting === "change" ? "confirm" : waiting); return { text: l.contactText(PHONES) + "\n\n" + p.text, chips: p.chips, ctl: true, contact: true }; }
  if (/չեղարկ|cheghark|chexark|cancel|отмен|(^|\s)stop|стоп/.test(h)) { O = null; waiting = null; HIST = []; return { text: l.cancelled, chips: [l.orderChip] }; }
  if (waiting === "confirm") {
    if (/ուղարկ|uxark|ughark|հաստատ|hastat|^այո|ayo|^ha$|^да|подтвер|отправ|yes|^ok|confirm|send/.test(h)) return finish();
    if (/փոխ|pox|poch|change|измен/.test(h)) { waiting = "change"; return { text: l.changeWhat, chips: changeChips(), ctl: true }; }
  }
  if (waiting === "change") {
    const c = CHANGE.find((c) => norm(l.fields[c[0]]) === h) || CHANGE.find((c) => c[1].test(h));
    if (!c) return { text: l.changeChoose, chips: changeChips(), ctl: true };
    HIST.push(JSON.parse(JSON.stringify(O), (k, v) => (k === "date" && v ? new Date(v) : v)));
    c[2](); return nextAsk(l.changeAck);
  }
  const snap = JSON.stringify(O);
  const sc = score(t), isQ = /[?՞]/.test(t) || ["price", "choco", "delivery", "phone", "where", "khoriz", "fresh", "when", "hours", "pay", "types", "wedding"].some((k) => sc[k] && !(waiting === "address" && k === "delivery") && !(waiting === "pay" && k === "pay") && !(waiting === "pack" && k === "wedding"));
  if (["address", "name", "notes"].includes(waiting) && isQ && !(waiting === "notes" && /սկզբնատառ|skzbnatar|initial|инициал/.test(h))) {
    const p = prompt(waiting), r = reply(t);
    return { text: r.text + "\n\n" + l.cont + p.text, chips: p.chips, ctl: true };
  }
  if (waiting === "pack") { const p = packFrom(h, true); if (p) O.pack = p; else extract(t, waiting); }
  else if (waiting === "size" && SIZES.findIndex((s) => norm(`${s.cm} ${CM[CL]}`) === h) >= 0) O.size = SIZES.findIndex((s) => norm(`${s.cm} ${CM[CL]}`) === h);
  else if (waiting === "ymode") {
    for (const d of DELIV) if (norm(tx(d.label, CL)) === h) { O.delivery = d.id; O.dGroup = null; }
    if (!O.delivery) {
      if (/մեգամոլ|megamol|megamall|мегамол|անվճար|anvchar|free|бесплат|վերցն|verc|заберу/.test(h)) { O.delivery = "megamall"; O.dGroup = null; }
      else if (ADDR_RE.test(h) || /առաք|araq|arak|достав|deliver/.test(h)) { O.delivery = "yerevan"; O.dGroup = null; }
    }
  }
  else if (waiting === "address") {
    if (t.replace(/\s/g, "").length >= 5) O.address = t.trim().slice(0, 200);
    else return { text: l.addrBad, chips: [], ctl: true };
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
  if (JSON.stringify(O) === snap) {
    if (waiting === "qty" && /\d/.test(t)) return { text: l.qtyBad, chips: prompt("qty").chips, ctl: true };
    if (waiting === "date" && /\d/.test(t)) return { text: l.dateBad, chips: prompt("date").chips, ctl: true };
    if (waiting === "phone") return { text: l.phoneBad, chips: [], ctl: true };
    const r = reply(t), p = prompt(waiting);
    if (r.topic && !["yes", "no", "greet", "order"].includes(r.topic)) return { text: r.text + "\n\n" + l.cont + p.text, chips: p.chips, ctl: true };
    return { text: l.sorry + p.text, chips: p.chips, ctl: true };
  }
  HIST.push(JSON.parse(snap, (k, v) => (k === "date" && v ? new Date(v) : v)));
  return nextAsk(l.acks[ackI++ % l.acks.length]);
}
/* quick-reply buttons: the same action whatever the button text says */
const QUICK = {};
document.querySelectorAll(".chip[data-act]").forEach((c) => (QUICK[norm(c.textContent)] = c.dataset.act));
const ACT = { price: () => R.price(""), delivery: () => R.delivery(""), wedding: () => R.wedding(), khoriz: () => R.khoriz(), phone: () => R.phone() };
function respond(t, act) {
  if (/[а-яё]/i.test(t)) CL = "ru"; else if (/[Ա-և]/.test(t)) CL = "hy";
  if (O) return orderTurn(t);
  act = act || QUICK[norm(t)];
  if (act === "order") return startOrder("");
  if (act && ACT[act]) return { text: ACT[act](), topic: act, chips: act === "price" || act === "wedding" ? [L().orderChip] : [] };
  const h = score(t), n = norm(t);
  // "wedding order" is a question about wedding orders, not the start of an order
  if (h.wedding && h.order && !qtyFrom(t, false) && !h.price) { const r = reply(t.replace(/պատվեր\S*|заказ\S*|order\S*|patver\S*/gi, "")); return { text: r.text, topic: "wedding", chips: [L().orderChip] }; }
  if (h.order || /պատվիրել չատ|chatum|chatov|в чате|in chat/.test(n) || qtyFrom(t, false)) return startOrder(t);
  const r = reply(t);
  return { text: r.text, topic: r.topic, unknown: r.unknown, chips: ["price", "choco", "wedding", "types", "size"].includes(r.topic) ? [L().orderChip] : [] };
}

/* conversation UI */
let busy = false;
function add(text, who) {
  const m = document.createElement("div"); m.className = "m " + who; m.textContent = text;
  $("msgs").appendChild(m); $("msgs").scrollTop = 1e6; return m;
}
function typing() {
  const t = document.createElement("div"); t.className = "m bot typing"; t.setAttribute("role", "status");
  t.innerHTML = "<i></i><i></i><i></i><span></span>"; t.lastChild.textContent = L().typing; $("msgs").appendChild(t); $("msgs").scrollTop = 1e6; return t;
}
function addExtras(r) {
  if (r.pay) { const w = document.createElement("div"); w.className = "qr keep"; const a = document.createElement("a"); a.className = "pay"; a.href = r.pay; a.textContent = L().payNow; w.appendChild(a); $("msgs").appendChild(w); }
  if (r.contact) $("msgs").appendChild(fallbackButtons("", CL));
  const chips = [...(r.chips || []), ...(r.ctl && O ? ctlChips() : [])];
  if (chips.length) {
    const w = document.createElement("div"); w.className = "qr";
    const ctl = r.ctl && O ? ctlChips() : [];
    chips.forEach((c) => { const b = document.createElement("button"); b.type = "button"; b.className = "qrb" + (ctl.includes(c) ? " ctl" : ""); b.textContent = c; b.addEventListener("click", () => send(c)); w.appendChild(b); });
    $("msgs").appendChild(w);
  }
  // the general suggestion row is hidden while an order is being filled in
  const row = document.querySelector(".chat-body .chips"); if (row) row.hidden = !!O;
  $("msgs").scrollTop = 1e6;
}
async function submitChat(s) {
  const r = await postOrder(s.body);
  if (r.ok) {
    O = null; waiting = null; HIST = [];
    add(L().received(r.id), "bot");
    if (r.checkoutUrl) { add(L().payInfo, "bot"); addExtras({ pay: r.checkoutUrl }); }
    else if (r.payError) add(L().payFail, "bot");
    addExtras({});
  } else if (r.error) {
    O = s.saved; waiting = "change";
    add("⚠️ " + r.error + "\n\n" + L().changeWhat, "bot"); addExtras({ chips: changeChips(), ctl: true });
  } else {
    // unknown result: keep the order (same key) so "send" again can't create a duplicate
    O = s.saved; waiting = "confirm";
    add(L().failed, "bot");
    $("msgs").appendChild(fallbackButtons(s.msg, CL)); addExtras({ chips: L().confirmChips });
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
  const wait = reduce ? 200 : Math.min(1200, 400 + r.text.length * 3);
  setTimeout(async () => {
    const t = typing();
    if (r.unknown && G.ai) { const a = await aiAnswer(q); if (a) r = { text: a, chips: [L().orderChip] }; }
    setTimeout(async () => {
      t.remove(); add(r.text, "bot"); addExtras(r);
      if (r.topic && !["yes", "no", "thanks", "greet"].includes(r.topic)) lastTopic = r.topic;
      if (r.submit) { const t2 = typing(); await submitChat(r.submit); t2.remove(); }
      busy = false;
    }, r.unknown && G.ai ? 150 : wait);
  }, 200);
}

/* chat launcher + panel */
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
    p.classList.add("kb"); document.body.classList.add("chat-typing");
    if (vv && innerHeight - vv.height > 120) { p.style.top = vv.offsetTop + 8 + "px"; p.style.bottom = "auto"; p.style.height = Math.max(220, vv.height - 16) + "px"; }
    else { p.style.top = "auto"; p.style.bottom = ""; p.style.height = Math.min(340, Math.round(innerHeight * 0.48)) + "px"; }
    $("msgs").scrollTop = 1e6;
  };
  const isOpen = () => !chatPanel.hidden;
  const setChat = (open) => {
    chatPanel.hidden = !open; chatBtn.setAttribute("aria-expanded", open);
    chatBtn.setAttribute("aria-label", open ? T[PL].closeChat || "×" : chatBtn.dataset.label || chatBtn.getAttribute("aria-label"));
    if (!open) { kbOpen = false; fitChat(); chatBtn.focus(); }
    if (open) { $("msgs").scrollTop = 1e6; (matchMedia("(hover:hover)").matches ? $("q") : $("chatX")).focus(); }
    placeLauncher();
  };
  chatBtn.dataset.label = chatBtn.getAttribute("aria-label");
  $("q").addEventListener("focus", () => { kbOpen = true; fitChat(); setTimeout(fitChat, 250); setTimeout(fitChat, 600); });
  $("q").addEventListener("blur", () => { kbOpen = false; setTimeout(fitChat, 80); });
  document.querySelector("#cf button").addEventListener("pointerdown", (e) => { if (kbOpen) e.preventDefault(); });
  if (window.visualViewport) { visualViewport.addEventListener("resize", fitChat); visualViewport.addEventListener("scroll", fitChat); }
  chatBtn.addEventListener("click", () => setChat(!isOpen()));
  $("chatX").addEventListener("click", () => setChat(false));
  // keep keyboard focus inside the open chat; Esc closes it
  chatPanel.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.stopPropagation(); setChat(false); return; }
    if (e.key !== "Tab") return;
    const f = [...chatPanel.querySelectorAll("button:not([disabled]),input,a[href]")].filter((x) => x.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  // the launcher steps aside while the order form or any page field is on screen
  let formVisible = false, fieldFocus = false;
  // also step aside when a button or question sits in the bottom-right corner where the launcher is
  const inZone = new Set();
  const placeLauncher = () => chatBtn.classList.toggle("away", !isOpen() && (formVisible || fieldFocus || inZone.size > 0));
  let zoneObs = null;
  const watchZone = () => {
    if (!("IntersectionObserver" in window)) return;
    if (zoneObs) zoneObs.disconnect();
    inZone.clear();
    zoneObs = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? inZone.add(e.target) : inZone.delete(e.target))); placeLauncher(); },
      { rootMargin: `-${Math.max(0, innerHeight - 96)}px 0px 0px 0px` });
    document.querySelectorAll("[data-avoid]").forEach((el) => zoneObs.observe(el));
  };
  watchZone(); addEventListener("resize", () => { clearTimeout(watchZone.t); watchZone.t = setTimeout(watchZone, 200); });
  const orderSec = $("order");
  if (orderSec && "IntersectionObserver" in window) new IntersectionObserver((es) => { formVisible = es[0].isIntersecting; placeLauncher(); }, { rootMargin: "0px 0px -60px 0px" }).observe(orderSec);
  document.addEventListener("focusin", (e) => { if (e.target.matches("input,select,textarea") && !chatPanel.contains(e.target)) { fieldFocus = true; placeLauncher(); } });
  document.addEventListener("focusout", (e) => { if (e.target.matches("input,select,textarea")) { fieldFocus = false; setTimeout(placeLauncher, 50); } });
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

/* ================= interactive header + scroll scenes ================= */
(() => {
  if (reduce) return;
  const gata = $("heroGata"), exp = $("expand"), pearls = [...document.querySelectorAll(".hero .pearl")];
  const sceneP = (el) => { const r = el.getBoundingClientRect(); return clamp(-r.top / (r.height - innerHeight)); };
  let px = 0, py = 0, tick = false;
  function frame() {
    tick = false;
    const hp = clamp(scrollY / innerHeight);
    if (gata) gata.style.transform = `rotateX(${hp * 40 - py * 10}deg) rotateY(${px * 14}deg) rotateZ(${hp * 60}deg) scale(${1 - hp * 0.12})`;
    pearls.forEach((p) => { const d = +p.style.getPropertyValue("--d") || 1; p.style.transform = `translate3d(${px * d * -14}px,${-hp * d * 110 - py * d * 10}px,0)`; });
    if (exp) {
      const sp = sceneP(exp), ep = ease(clamp(sp / 0.7));
      $("expFrame").style.width = 72 + 28 * ep + "%"; $("expFrame").style.height = 78 + 22 * ep + "%"; $("expFrame").style.borderRadius = 24 * (1 - ep) + "px";
      $("expImg").style.transform = `scale(${1.15 - 0.15 * ep})`;
      const cp = clamp((sp - 0.45) / 0.3); $("expCap").style.opacity = cp; $("expCap").style.transform = `translateY(${20 * (1 - cp)}px)`;
    }
  }
  const req = () => { if (!tick) { tick = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", req, { passive: true }); addEventListener("resize", req); frame();
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    addEventListener("pointermove", (e) => { px = e.clientX / innerWidth - 0.5; py = e.clientY / innerHeight - 0.5; req(); }, { passive: true });
    document.querySelectorAll(".card").forEach((el) => {
      el.insertAdjacentHTML("beforeend", '<span class="shine" aria-hidden="true"></span>');
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 9}deg) translateY(-4px)`;
        el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  } else if (gata && window.DeviceOrientationEvent) {
    addEventListener("deviceorientation", (e) => { if (e.gamma == null) return; px = Math.max(-0.5, Math.min(0.5, e.gamma / 60)); py = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 90)); req(); }, { passive: true });
  }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); } }), { threshold: 0.12 });
  document.querySelectorAll(".section .sec-head,.card,.qa,.story .photo,.dcard,.ccard").forEach((el, i) => {
    if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("rv", "pre"); el.style.transitionDelay = (i % 3) * 0.08 + "s"; io.observe(el); }
  });
})();

})();
