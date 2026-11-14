// Default content of the Garnu Gata site. Everything here can be edited in the admin panel.
// Every text is { hy, ru, en }.
const L = (hy, ru, en) => ({ hy, ru, en });



export const V1_CONTENT = {
  version: 1,
  brand: {
    name: L("Գառնու Գաթա", "Гарну Гата", "Garnu Gata"),
    logoText: L("ԳԱՌՆՈՒ ԳԱԹԱ", "ГАРНУ ГАТА", "GARNU GATA"),
    sub: L("Գառնի · Հայաստան", "Гарни · Армения", "Garni · Armenia"),
    logo: "/img/logo.svg",
    logoLight: "/img/logo-light.svg",
  },
  contact: {
    phones: ["041-55-10-56", "055-57-73-81"],
    whatsapp: "37455577381",
    instagram: "https://www.instagram.com/garnugata/",
    instagramHandle: "@garnugata",
    telegram: "",
    facebook: "",
    tiktok: "",
    email: "",
    mapUrl: "",
    address: L("Գառնի, Կոտայքի մարզ, Հայաստան", "Гарни, Котайкская область, Армения", "Garni, Kotayk Province, Armenia"),
    domain: "garnugata.am",
  },
  nav: [
    { label: L("Տեսականի", "Ассортимент", "Menu"), href: "#products", show: true },
    { label: L("Մեր մասին", "О нас", "About"), href: "#story", show: true },
    { label: L("Լուսանկարներ", "Фото", "Photos"), href: "#gallery", show: true },
    { label: L("Ինչպես պատվիրել", "Как заказать", "How to order"), href: "#how", show: true },
    { label: L("Հարցեր", "Вопросы", "FAQ"), href: "#faq", show: true },
  ],
  hero: {
    kicker: L("Հարսանեկան և նվերային գաթաներ", "Свадебные и подарочные гаты", "Wedding & gift gata"),
    title: L("Գառնու Գաթա", "Гарну Гата", "Garnu Gata"),
    lead: L(
      "Ավանդական հայկական գաթա՝ ձեռքով թխված Գառնիում և զարդարված Ձեր կարևոր օրվա համար։",
      "Традиционная армянская гата — испечённая вручную в Гарни и украшенная для вашего важного дня.",
      "Traditional Armenian gata, baked by hand in Garni and decorated for your special day."
    ),
    btnOrder: L("Պատվիրել հիմա", "Заказать сейчас", "Order now"),
    btnMenu: L("Տեսնել տեսականին", "Смотреть ассортимент", "See the menu"),
    image: "/img/hero.webp",
    alt: L("Մարգարիտներով զարդարված Գառնու գաթա", "Гата из Гарни, украшенная жемчугом", "Garnu gata decorated with pearls"),
  },
  expand: {
    show: true,
    image: "/img/box_pile.webp",
    title: L("Ամեն տուփ՝ ձեռքի աշխատանք։", "Каждая коробка — ручная работа.", "Every box is handmade."),
    text: L(
      "Մարգարիտներ, տյուլ և նրբագեղ տուփեր՝ Ձեր տոնի համար։",
      "Жемчуг, фатин и изящные коробки для вашего праздника.",
      "Pearls, tulle and elegant boxes for your celebration."
    ),
  },
  products: {
    kicker: L("Տեսականի", "Ассортимент", "Menu"),
    title: L("Ընտրեք Ձեր գաթան", "Выберите свою гату", "Choose your gata"),
    lead: L(
      "Ամեն գաթա թխվում է պատվերով և զարդարվում ձեռքով։ Գինը՝ ըստ չափսի և քանակի։",
      "Каждая гата выпекается на заказ и украшается вручную. Цена зависит от размера и количества.",
      "Every gata is baked to order and decorated by hand. Price depends on size and quantity."
    ),
    cards: [
      { image: "/img/marble.webp", tag: L("Հարսանիք", "Свадьба", "Wedding"), title: L("Հարսանեկան գաթա տուփով", "Свадебная гата в коробке", "Wedding gata in a box"), text: L("Դասական խորիզով գաթա՝ մարգարիտներով զարդարված տուփում։", "Классическая гата с хоризом в коробке, украшенной жемчугом.", "Classic gata with khoriz in a pearl-decorated box.") },
      { image: "/img/bag_pearl.webp", tag: L("Նվեր", "Подарок", "Gift"), title: L("Պայուսակ-գաթա", "Гата в сумочке", "Gata gift bag"), text: L("Ամբողջական գաթա թափանցիկ պայուսակում՝ մարգարիտներով։", "Целая гата в прозрачной сумочке с жемчугом.", "A whole gata in a clear bag with pearls.") },
      { image: "/img/bride.webp", tag: L("Ավանդույթ", "Традиция", "Tradition"), title: L("Հարսի ճամպրուկի գաթա", "Гата для чемодана невесты", "Bride's suitcase gata"), text: L("Տյուլով և ժապավենով փաթեթավորված ավանդական գաթա։", "Традиционная гата, упакованная в фатин с лентой.", "Traditional gata wrapped in tulle and ribbon.") },
      { image: "/img/initials.webp", tag: L("Անհատական", "Персонально", "Personal"), title: L("Սկզբնատառերով տուփեր", "Коробки с инициалами", "Boxes with initials"), text: L("Զույգի սկզբնատառերով տուփեր՝ հյուրերի համար։", "Коробки с инициалами пары для гостей.", "Boxes with the couple's initials for your guests.") },
    ],
    btn: L("Պատվիրել", "Заказать", "Order"),
  },
  ring: { show: true, kicker: L("Մեր աշխատանքները", "Наши работы", "Our work"), title: L("Ամեն տոնի համար՝ յուրահատուկ։", "Особенная для каждого праздника.", "Unique for every celebration.") },
  words: {
    show: true,
    // *word* is shown in gold
    text: L("Ամեն առավոտ։ Ամեն գաթա։ *Ձեռքով։* Գառնիում։", "Каждое утро. Каждая гата. *Вручную.* В Гарни.", "Every morning. Every gata. *By hand.* In Garni."),
  },
  features: {
    kicker: L("Ինչու մենք", "Почему мы", "Why us"),
    title: L("Ինչու՞ Գառնու Գաթա", "Почему Гарну Гата?", "Why Garnu Gata?"),
    items: [
      { big: L("100%", "100%", "100%"), title: L("Իսկական կարագ", "Настоящее масло", "Real butter"), text: L("Ալյուր, ձու, շաքար և կարագ։ Առանց կոնսերվանտների։", "Мука, яйца, сахар и масло. Без консервантов.", "Flour, eggs, sugar and butter. No preservatives.") },
      { big: L("Ձեռքով", "Вручную", "By hand"), title: L("Ամեն զարդ", "Каждое украшение", "Every decoration"), text: L("Մարգարիտները, ժապավեններն ու ժանյակը դրվում են ձեռքով։", "Жемчуг, ленты и кружево мы кладём вручную.", "Pearls, ribbons and lace are placed by hand.") },
      { big: L("30 կմ", "30 км", "30 km"), title: L("Երևանից", "от Еревана", "from Yerevan"), text: L("Գառնիում՝ տաճարի և Գեղարդի ճանապարհին։", "В Гарни, по дороге к храму и Гегарду.", "In Garni, on the road to the temple and Geghard.") },
      { big: L("Առաքում", "Доставка", "Delivery"), title: L("Երևան և Աբովյան", "Ереван и Абовян", "Yerevan & Abovyan"), text: L("Անվճար վերցրեք Երևանի «Մեգամոլից», կամ հավելավճարով կառաքենք Ձեր հասցեով։", "Бесплатно заберите в ереванском «Мегамолле» или мы доставим по вашему адресу за доплату.", "Pick up free at Megamall in Yerevan, or we deliver to your address for an extra fee.") },
    ],
  },
  story: {
    image: "/img/bag_satin.webp",
    kicker: L("Գառնիից", "Из Гарни", "From Garni"),
    title: L("Գյուղ, որը հայտնի է իր գաթայով։", "Село, известное своей гатой.", "A village famous for its gata."),
    p1: L(
      "Գառնին գտնվում է Ազատ գետի կիրճի վերևում՝ առաջին դարի տաճարի կողքին։ **Այստեղ գաթան թխում են սերնդեսերունդ։**",
      "Гарни стоит над ущельем реки Азат, рядом с храмом I века. **Здесь гату пекут из поколения в поколение.**",
      "Garni sits above the Azat river gorge, next to a 1st-century temple. **Gata has been baked here for generations.**"
    ),
    p2: L(
      "Մենք պահում ենք ավանդական բաղադրատոմսը և ավելացնում ենք մեր ոճը՝ մարգարիտներ, ժանյակ և նրբագեղ տուփեր, որպեսզի **Ձեր գաթան դառնա տոնի զարդը։**",
      "Мы храним традиционный рецепт и добавляем свой стиль — жемчуг, кружево и изящные коробки, чтобы **ваша гата стала украшением праздника.**",
      "We keep the traditional recipe and add our own style, pearls, lace and elegant boxes, so **your gata becomes the highlight of the celebration.**"
    ),
  },
  gallery: {
    kicker: L("Լուսանկարներ", "Фотографии", "Photos"),
    title: L("Մեր խոհանոցից", "С нашей кухни", "From our kitchen"),
    lead: L("Ավելին՝ մեր Instagram էջում։", "Больше — в нашем Instagram.", "More on our Instagram."),
    images: [
      { src: "/img/top.webp", alt: L("Գառնու գաթա մարգարիտներով", "Гата с жемчугом", "Gata with pearls") },
      { src: "/img/box_pile.webp", alt: L("Հարսանեկան գաթաներ տուփերում", "Свадебные гаты в коробках", "Wedding gata in boxes") },
      { src: "/img/shelf.webp", alt: L("Զարդարված գաթաների տուփեր", "Украшенные коробки с гатой", "Decorated gata boxes") },
      { src: "/img/vase.webp", alt: L("Տյուլով փաթեթավորված գաթա", "Гата в фатине", "Gata wrapped in tulle") },
      { src: "/img/bag_pearl.webp", alt: L("Պայուսակ-գաթա մարգարիտներով", "Гата в сумочке с жемчугом", "Gata gift bag with pearls") },
      { src: "/img/marble.webp", alt: L("Գաթաներ սպիտակ տուփերում", "Гаты в белых коробках", "Gata in white boxes") },
      { src: "/img/bride.webp", alt: L("Հարսի ճամպրուկի գաթա", "Гата для чемодана невесты", "Bride's suitcase gata") },
      { src: "/img/bag_satin.webp", alt: L("Պայուսակ-գաթա ժապավենով", "Гата в сумочке с лентой", "Gata gift bag with ribbon") },
      { src: "/img/initials.webp", alt: L("Սկզբնատառերով գաթայի տուփեր", "Коробки с инициалами", "Boxes with initials") },
      { src: "/img/bags_shelf.webp", alt: L("Հյուրերի նվեր-պայուսակներ", "Подарочные пакеты для гостей", "Guest gift bags") },
    ],
  },
  steps: {
    kicker: L("Ինչպես պատվիրել", "Как заказать", "How to order"),
    title: L("Երեք պարզ քայլ", "Три простых шага", "Three simple steps"),
    items: [
      { title: L("Ընտրեք գաթան", "Выберите гату", "Choose your gata"), text: L("Ընտրեք չափսը, միջուկը, քանակը և օրը։", "Выберите размер, начинку, количество и дату.", "Pick the size, filling, quantity and date.") },
      { title: L("Ուղարկեք պատվերը", "Отправьте заказ", "Send your order"), text: L("Պատվիրեք ձևով կամ չատում՝ մենք անմիջապես կստանանք։", "Закажите через форму или в чате — мы сразу его получим.", "Order with the form or in the chat, and we receive it instantly.") },
      { title: L("Ստացեք թարմ", "Получите свежей", "Get it fresh"), text: L("Կզանգենք հաստատելու, կթխենք և կառաքենք կամ կսպասենք Ձեզ։", "Мы позвоним для подтверждения, испечём и доставим или будем ждать вас.", "We call to confirm, bake, and deliver or wait for you.") },
    ],
  },
  order: {
    kicker: L("Պատվեր", "Заказ", "Order"),
    title: L("Պատվիրեք Ձեր գաթան", "Закажите свою гату", "Order your gata"),
    lead: L(
      "Խնդրում ենք պատվիրել առնվազն 2–3 օր առաջ, մեծ պատվերների համար՝ ավելի շուտ։",
      "Пожалуйста, заказывайте минимум за 2–3 дня, а большие заказы — раньше.",
      "Please order at least 2–3 days ahead, and earlier for large orders."
    ),
    note: L(
      "Պատվերը կստանանք անմիջապես, և կզանգենք Ձեզ՝ հաստատելու մանրամասները։",
      "Мы сразу получим заказ и позвоним вам, чтобы подтвердить детали.",
      "We receive your order instantly and will call you to confirm the details."
    ),
    minDays: 1,
    accept: true,
    closedText: L(
      "Այս պահին առցանց պատվերներ չենք ընդունում։ Զանգահարեք մեզ։",
      "Сейчас мы не принимаем онлайн-заказы. Позвоните нам.",
      "We're not taking online orders right now. Please call us."
    ),
  },
  faq: {
    kicker: L("Հարցեր", "Вопросы", "FAQ"),
    title: L("Հաճախ տրվող հարցեր", "Частые вопросы", "Frequently asked questions"),
    items: [
      { q: L("Առաքում ունե՞ք Երևան և Աբովյան։", "Есть ли доставка в Ереван и Абовян?", "Do you deliver to Yerevan and Abovyan?"), a: L("Այո։ Երևանում կարող եք անվճար վերցնել գաթան «Մեգամոլից», կամ հավելավճարով կուղարկենք Ձեր հասցեով՝ Yandex Delivery կամ այլ ծառայությամբ։ Առաքում ունենք նաև Աբովյան, իսկ Գառնիից կարող եք վերցնել տեղում։", "Да. В Ереване можно бесплатно забрать гату в «Мегамолле» или мы отправим её по вашему адресу за доплату через Yandex Delivery или другую службу. Также доставляем в Абовян, а в Гарни можно забрать на месте.", "Yes. In Yerevan you can pick up your gata free at Megamall, or we send it to your address for an extra fee by Yandex Delivery or another service. We also deliver to Abovyan, and you can pick up in Garni.") },
      { q: L("Քանի՞ օր առաջ պետք է պատվիրել։", "За сколько дней нужно заказывать?", "How far ahead should I order?"), a: L("Խորհուրդ ենք տալիս պատվիրել 2–3 օր առաջ, իսկ հարսանեկան մեծ պատվերների համար՝ ավելի շուտ։ Շտապ պատվերի համար զանգահարեք մեզ։", "Рекомендуем заказывать за 2–3 дня, а большие свадебные заказы — раньше. Для срочного заказа позвоните нам.", "We recommend ordering 2–3 days ahead, and earlier for large wedding orders. For urgent orders, please call us.") },
      { q: L("Ի՞նչ միջուկներով գաթա ունեք։", "Какие начинки у вас есть?", "Which fillings do you have?"), a: L("Թխում ենք դասական գաթա խորիզով, ինչպես նաև ընկույզով, չրերով և խուրմայով գաթա՝ երեք չափսի՝ 25, 30 և 40 սմ։", "Мы печём классическую гату с хоризом, а также с орехами, сухофруктами и финиками — трёх размеров: 25, 30 и 40 см.", "We bake classic gata with khoriz, plus walnut, dried fruit and date gata, in three sizes: 25, 30 and 40 cm.") },
      { q: L("Հարսանիքի համար գաթա զարդարո՞ւմ եք։", "Украшаете ли вы гату к свадьбе?", "Do you decorate gata for weddings?"), a: L("Այո։ Պատրաստում ենք հարսանեկան գաթաներ մարգարիտներով և ժանյակով զարդարված տուփերում, պայուսակ-գաթա, հարսի ճամպրուկի գաթա, զույգի սկզբնատառերով տուփեր և հյուրերի նվեր-պայուսակներ։", "Да. Мы делаем свадебные гаты в коробках с жемчугом и кружевом, гату в сумочке, гату для чемодана невесты, коробки с инициалами пары и подарочные пакеты для гостей.", "Yes. We make wedding gata in boxes decorated with pearls and lace, gata gift bags, bride's suitcase gata, boxes with the couple's initials and gift bags for guests.") },
      { q: L("Ինչպե՞ս պատվիրել գաթա։", "Как заказать гату?", "How do I order?"), a: L("Պատվիրեք կայքի չատում կամ պատվերի ձևով, կամ զանգահարեք մեզ։ Կարող եք գրել նաև Instagram-ում։", "Закажите в чате на сайте или через форму заказа, или позвоните нам. Можно также написать в Instagram.", "Order in the chat on this site or with the order form, or call us. You can also message us on Instagram.") },
    ],
  },
  footer: {
    copy: L("© Գառնու Գաթա · Ավանդական հայկական գաթա", "© Гарну Гата · Традиционная армянская гата", "© Garnu Gata · Traditional Armenian gata"),
  },
  menu: {
    sizes: [
      { cm: 25, label: L("Փոքր", "Маленькая", "Small") },
      { cm: 30, label: L("Միջին", "Средняя", "Medium") },
      { cm: 40, label: L("Մեծ", "Большая", "Large") },
    ],
    fillings: [
      { id: "classic", name: L("Դասական (խորիզով)", "Классическая (с хоризом)", "Classic (khoriz)"), short: L("Դասական", "Классическая", "Classic"), prices: [3000, 3500, 4500], show: true },
      { id: "walnut", name: L("Ընկույզով", "С орехами", "Walnut"), short: L("Ընկույզով", "С орехами", "Walnut"), prices: [3500, 4000, 5000], show: true },
      { id: "raisin", name: L("Չրերով", "С сухофруктами", "Dried fruit"), short: L("Չրերով", "С сухофруктами", "Dried fruit"), prices: [4000, 4500, 5500], show: true },
      { id: "date", name: L("Խուրմայով", "С финиками", "Date"), short: L("Խուրմայով", "С финиками", "Date"), prices: [4000, 4500, 5500], show: true },
      { id: "choco", name: L("Շոկոլադով", "Шоколадная", "Chocolate"), short: L("Շոկոլադով", "Шоколадная", "Chocolate"), prices: [4000, 4500, 5500], show: false },
    ],
    box: { enabled: true, price: 0 }, // price 0 = confirmed later
  },
  delivery: {
    options: [
      { id: "pickup", label: L("Վերցնել Գառնիից", "Самовывоз из Гарни", "Pick up in Garni"), address: false, price: 0, show: true },
      { id: "megamall", label: L("Անվճար վերցնել Երևանի «Մեգամոլից»", "Бесплатно забрать в «Мегамолле» (Ереван)", "Free pickup at Megamall (Yerevan)"), address: false, price: 0, show: true },
      { id: "yerevan", label: L("Առաքում Երևան՝ իմ հասցեով", "Доставка по Еревану на мой адрес", "Delivery to my address in Yerevan"), address: true, price: -1, show: true },
      { id: "abovyan", label: L("Առաքում Աբովյան", "Доставка в Абовян", "Delivery to Abovyan"), address: true, price: -1, show: true },
    ],
    // price: 0 = free, -1 = extra fee confirmed later, >0 = fixed fee in AMD
  },
  chat: {
    show: true,
    ai: false, // let the AI answer questions the built-in assistant does not understand
    welcome: L(
      "Բարև Ձեզ 😊 Ես Գառնու Գաթայից եմ։ Հարցրեք ինչ ուզում եք՝ գներ, չափսեր, առաքում, կամ պատվիրեք հենց այստեղ, ես կօգնեմ քայլ առ քայլ։",
      "Здравствуйте 😊 Я из Гарну Гата. Спрашивайте что угодно — цены, размеры, доставка — или закажите прямо здесь, я помогу шаг за шагом.",
      "Hello 😊 I'm from Garnu Gata. Ask me anything about prices, sizes or delivery, or order right here and I'll guide you step by step."
    ),
    // Answers to common questions. {phones} = phone numbers, {instagram} = Instagram handle.
    answers: {
      delivery: L(
        "Այո 🚗 Գառնիից առաքում ենք Երևան և Աբովյան։\n• Երևանում կարող եք անվճար վերցնել գաթան «Մեգամոլից»\n• Կամ հավելավճարով կուղարկենք Ձեր հասցեով՝ Yandex Delivery կամ այլ ծառայությամբ\n• Կարող եք նաև վերցնել անմիջապես Գառնիից",
        "Да 🚗 Доставляем из Гарни в Ереван и Абовян.\n• В Ереване можно бесплатно забрать гату в «Мегамолле»\n• Или за доплату отправим по вашему адресу через Yandex Delivery или другую службу\n• Можно также забрать прямо в Гарни",
        "Yes 🚗 We deliver from Garni to Yerevan and Abovyan.\n• In Yerevan you can pick up free at Megamall\n• Or we send it to your address for an extra fee by Yandex Delivery or another service\n• You can also pick up in Garni"
      ),
      where: L(
        "Մենք Գառնիում ենք՝ Կոտայքի մարզ, տաճարի և Գեղարդի ճանապարհին։ Ճշգրիտ հասցեի համար զանգահարեք՝ {phones}։",
        "Мы в Гарни, Котайкская область, по дороге к храму и Гегарду. Точный адрес уточните по телефону: {phones}.",
        "We're in Garni, Kotayk Province, on the road to the temple and Geghard. Call us for the exact address: {phones}."
      ),
      khoriz: L(
        "Գաթան ավանդական հայկական թխվածք է՝ շերտավոր խմորով և քաղցր խորիզով։ Խորիզը ալյուրից, կարագից և շաքարից է, որը թխվելիս դառնում է փափուկ ու կարագոտ 😋",
        "Гата — традиционная армянская выпечка из слоёного теста со сладкой начинкой хориз. Хориз делают из муки, масла и сахара, при выпечке он становится мягким и сливочным 😋",
        "Gata is a traditional Armenian pastry with layered dough and a sweet filling called khoriz. Khoriz is made of flour, butter and sugar, and turns soft and buttery when baked 😋"
      ),
      fresh: L(
        "Գաթան թարմ է մնում 3–4 օր՝ կտորե կամ թղթե տոպրակում, սենյակային ջերմաստիճանում։ Մատուցելուց առաջ մի քանի րոպե տաքացրեք ջեռոցում։",
        "Гата остаётся свежей 3–4 дня в тканевом или бумажном пакете при комнатной температуре. Перед подачей разогрейте несколько минут в духовке.",
        "Gata stays fresh for 3–4 days in a cloth or paper bag at room temperature. Warm it in the oven for a few minutes before serving."
      ),
      when: L(
        "Խորհուրդ ենք տալիս պատվիրել 2–3 օր առաջ, իսկ հարսանեկան մեծ պատվերների համար՝ ավելի շուտ։ Եթե գաթան պետք է այսօր կամ վաղը, զանգահարեք՝ {phones} 🙏",
        "Рекомендуем заказывать за 2–3 дня, а большие свадебные заказы — раньше. Если гата нужна сегодня или завтра, позвоните: {phones} 🙏",
        "We recommend ordering 2–3 days ahead, and earlier for big wedding orders. If you need it today or tomorrow, call us: {phones} 🙏"
      ),
      hours: L(
        "Այսօրվա աշխատանքային ժամերի և պատրաստ գաթաների մասին ճշտելու համար զանգահարեք՝ {phones}։",
        "Чтобы уточнить часы работы и наличие готовой гаты сегодня, позвоните: {phones}.",
        "To check today's opening hours and ready gata, please call: {phones}."
      ),
      pay: L(
        "Կարող եք վճարել գաթան ստանալիս, իսկ եթե առցանց վճարումը միացված է, նաև քարտով, Idram-ով կամ Telcell-ով պատվերի ժամանակ։",
        "Можно оплатить при получении, а если включена онлайн-оплата — картой, Idram или Telcell при заказе.",
        "You can pay when you receive your gata, and if online payment is on, by card, Idram or Telcell when ordering."
      ),
      wedding: L(
        "Հարսանիքների, նշանդրեքների և կնունքների համար պատրաստում ենք զարդարված գաթաներ 🤍\n• Տուփերով՝ մարգարիտներով և ժանյակով\n• Պայուսակ-գաթա\n• Հարսի ճամպրուկի գաթա\n• Զույգի սկզբնատառերով տուփեր\n• Հյուրերի նվեր-պայուսակներ",
        "Для свадеб, помолвок и крестин мы делаем украшенные гаты 🤍\n• В коробках с жемчугом и кружевом\n• Гата в сумочке\n• Гата для чемодана невесты\n• Коробки с инициалами пары\n• Подарочные пакеты для гостей",
        "For weddings, engagements and christenings we make decorated gata 🤍\n• In boxes with pearls and lace\n• Gata gift bags\n• Bride's suitcase gata\n• Boxes with the couple's initials\n• Gift bags for guests"
      ),
    },
  },
  seo: {
    title: L(
      "Գառնու Գաթա — հարսանեկան և նվերային գաթա Գառնիից",
      "Гарну Гата — свадебная и подарочная гата из Гарни",
      "Garnu Gata — wedding & gift gata from Garni, Armenia"
    ),
    description: L(
      "Ավանդական Գառնու գաթա՝ դասական, ընկույզով, չրերով և խուրմայով։ Հարսանեկան տուփեր, պայուսակ-գաթա, սկզբնատառերով տուփեր։ Առաքում Երևան և Աբովյան։ Պատվիրեք առցանց։",
      "Традиционная гата из Гарни: классическая, с орехами, сухофруктами и финиками. Свадебные коробки, гата в сумочке, коробки с инициалами. Доставка в Ереван и Абовян. Закажите онлайн.",
      "Traditional gata from Garni: classic, walnut, dried fruit and date. Wedding boxes, gata gift bags, boxes with initials. Delivery to Yerevan and Abovyan. Order online."
    ),
    ogImage: "/img/og-image.jpg",
    googleVerification: "",
    googleTag: "",
  },
  payments: {
    enabled: false,       // offer "Pay online" at checkout
    provider: "paynet",
    domain: "garnugata.am",
    processor: "",        // empty = customer chooses on Paynet; or "idram", "telcell", "arca"...
  },
  pagesInNav: true,
};
