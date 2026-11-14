// Default content of the Garnu Gata site. Everything here can be edited in the admin panel.
// Every text is { hy, ru, en }.
const L = (hy, ru, en) => ({ hy, ru, en });

export const LANGS = ["hy", "ru", "en"];
export const CONTENT_VERSION = 4;

export const DEFAULT_CONTENT = {
  version: CONTENT_VERSION,
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
    { label: L("Տեսականի և գներ", "Ассортимент и цены", "Menu & prices"), href: "/menu", show: true },
    { label: L("Առաքում", "Доставка", "Delivery"), href: "/delivery", show: true },
    { label: L("Մեր մասին", "О нас", "About"), href: "/about", show: true },
    { label: L("Հարցեր", "Вопросы", "FAQ"), href: "/faq", show: true },
    { label: L("Կապ", "Контакты", "Contact"), href: "/contact", show: true },
  ],
  hero: {
    kicker: L("Գաթաներ՝ հարսանիքի և նվերի համար", "Гата для свадьбы и в подарок", "Gata for weddings and gifts"),
    title: L("Գառնու Գաթա", "Гарну Гата", "Garnu Gata"),
    lead: L(
      "Գառնիում թխում ենք ավանդական գաթա և գեղեցիկ փաթեթավորում՝ հարսանիքի, նշանադրության, կնունքի կամ նվերի համար։",
      "Мы печём традиционную гату в Гарни и красиво упаковываем её для свадьбы, помолвки, крестин или в подарок.",
      "We bake traditional gata in Garni and wrap it beautifully for weddings, engagements, christenings or as a gift."
    ),
    advice: L(
      "Խնդրում ենք պատվիրել առնվազն 2–3 օր առաջ։ Եթե պատվերը պետք է այսօր կամ վաղը, զանգահարեք մեզ՝ հնարավորությունը ճշտելու համար։",
      "Пожалуйста, заказывайте минимум за 2–3 дня. Если заказ нужен сегодня или завтра, позвоните нам, чтобы уточнить возможность.",
      "Please order at least 2–3 days ahead. If you need it today or tomorrow, call us to check if it's possible."
    ),
    btnOrder: L("Պատվիրել", "Заказать", "Order"),
    btnMenu: L("Տեսնել տեսականին", "Смотреть ассортимент", "See the menu"),
    image: "/img/hero.webp",
    alt: L("Ուլունքներով զարդարված Գառնու գաթա", "Гата из Гарни, украшенная бусинами", "Garnu gata decorated with beads"),
  },
  expand: {
    show: true,
    image: "/img/box_pile.webp",
    title: L("Յուրաքանչյուր տուփ զարդարում ենք ձեռքով", "Каждую коробку мы украшаем вручную", "We decorate every box by hand"),
    text: L(
      "Ուլունքներով, ժապավեններով ու ժանյակով զարդարված տուփեր՝ ձեր տոնի համար։",
      "Коробки с бусинами, лентами и кружевом — для вашего праздника.",
      "Boxes decorated with beads, ribbons and lace for your celebration."
    ),
  },
  products: {
    kicker: L("Տեսականի", "Ассортимент", "Menu"),
    title: L("Ընտրեք ձեր գաթան", "Выберите свою гату", "Choose your gata"),
    lead: L(
      "Ընտրեք փաթեթավորման տարբերակը։ Չափսը, միջուկը և քանակը կնշեք պատվերի ձևում։",
      "Выберите вариант упаковки. Размер, начинку и количество укажете в форме заказа.",
      "Choose a packaging option. You'll pick the size, filling and quantity in the order form."
    ),
    pricesTitle: L("Միջուկներ և գներ", "Начинки и цены", "Fillings and prices"),
    pricesNote: L(
      "Գները՝ մեկ գաթայի համար, առանց տուփի կամ այլ փաթեթավորման։",
      "Цены за одну гату, без коробки и другой упаковки.",
      "Prices are per gata, without a box or other packaging."
    ),
    cards: [
      { slug: "wedding-box", image: "/img/marble.webp", packaging: "box", packNote: "separate", tag: L("Հարսանիք", "Свадьба", "Wedding"), title: L("Հարսանեկան գաթա՝ տուփով", "Свадебная гата в коробке", "Wedding gata in a box"), text: L("Ավանդական գաթա՝ խորիզով, գեղեցիկ զարդարված հարսանեկան տուփում։", "Традиционная гата с хоризом в красиво украшенной свадебной коробке.", "Traditional gata with khoriz in a beautifully decorated wedding box.") },
      { slug: "gift-bag", image: "/img/bag_pearl.webp", packaging: "bag", packNote: "separate", tag: L("Նվեր", "Подарок", "Gift"), title: L("Գաթա՝ նվեր-պայուսակում", "Гата в подарочном пакете", "Gata in a gift bag"), text: L("Գաթա՝ ուլունքներով զարդարված թափանցիկ նվեր-պայուսակում։", "Гата в прозрачном подарочном пакете, украшенном бусинами.", "Gata in a clear gift bag decorated with beads.") },
      { slug: "bride-suitcase", image: "/img/bride.webp", packaging: "wrap", packNote: "separate", tag: L("Ավանդույթ", "Традиция", "Tradition"), title: L("Գաթա՝ հարսի ճամպրուկի համար", "Гата для чемодана невесты", "Gata for the bride's suitcase"), text: L("Ավանդական գաթա՝ շղարշով ու ժապավենով փաթեթավորված։", "Традиционная гата, упакованная в фатин с лентой.", "Traditional gata wrapped in tulle and ribbon.") },
      { slug: "initials-boxes", image: "/img/initials.webp", packaging: "box", packNote: "variable", tag: L("Անհատական", "Персонально", "Personal"), title: L("Գաթայի տուփեր՝ ձեր սկզբնատառերով", "Коробки для гаты с вашими инициалами", "Gata boxes with your initials"), text: L("Ձեր անունների սկզբնատառերով ձևավորված տուփեր՝ հարսանիքի հյուրերին նվիրելու համար։", "Коробки, оформленные инициалами ваших имён, — в подарок гостям свадьбы.", "Boxes decorated with your initials, as gifts for your wedding guests.") },
    ],
    btn: L("Ընտրել այս տարբերակը", "Выбрать этот вариант", "Choose this option"),
  },
  // the main pages, each with its own link: /menu /delivery /order /about /faq /contact
  sitePages: {
    menu: {
      title: L("Տեսականի և գներ", "Ассортимент и цены", "Menu and prices"),
      lead: L("Գաթաներ՝ տուփով, նվեր-պայուսակում կամ առանց փաթեթավորման։ Գները՝ ըստ չափսի և միջուկի։", "Гата в коробке, в подарочном пакете или без упаковки. Цены — по размеру и начинке.", "Gata in a box, a gift bag or without packaging. Prices by size and filling."),
      seo: L("Գառնու գաթայի տեսականի և գներ՝ 25, 30 և 40 սմ, խորիզով, ընկույզով, չրերով և խուրմայով։ Հարսանեկան տուփեր և նվեր-պայուսակներ։", "Ассортимент и цены гаты из Гарни: 25, 30 и 40 см, с хоризом, орехами, сухофруктами и хурмой. Свадебные коробки и подарочные пакеты.", "Garnu Gata menu and prices: 25, 30 and 40 cm, khoriz, walnut, dried fruit and persimmon. Wedding boxes and gift bags."),
    },
    delivery: {
      title: L("Առաքում և ստացում", "Доставка и получение", "Delivery and pickup"),
      lead: L("Վերցրեք պատվերը Գառնիից կամ Մեգամոլից, կամ պատվիրեք առաքում Երևանում և Աբովյանում։", "Заберите заказ в Гарни или в «Мегамолле» либо закажите доставку по Еревану и в Абовян.", "Pick up in Garni or at Megamall, or order delivery in Yerevan and Abovyan."),
      seo: L("Գառնու Գաթա․ վերցնել Գառնիից կամ Երևանի Մեգամոլից, առաքում Երևանում և Աբովյանում։", "Гарну Гата: самовывоз из Гарни или «Мегамолла», доставка по Еревану и в Абовян.", "Garnu Gata: pickup in Garni or at Megamall Yerevan, delivery in Yerevan and Abovyan."),
    },
    order: {
      title: L("Պատվիրել գաթա", "Заказать гату", "Order gata"),
      lead: L("Լրացրեք ձևը քայլ առ քայլ․ գինը կհաշվարկվի անմիջապես։ Պատվերն ուղարկելուց հետո կկապվենք ձեզ հետ։", "Заполните форму шаг за шагом — цена посчитается сразу. После отправки мы свяжемся с вами.", "Fill in the form step by step; the price is calculated right away. We'll contact you after you send it."),
      seo: L("Պատվիրեք Գառնու գաթա առցանց՝ ընտրեք չափսը, միջուկը, փաթեթավորումը և ստացման եղանակը։", "Закажите гату из Гарни онлайн: выберите размер, начинку, упаковку и способ получения.", "Order Garnu Gata online: choose the size, filling, packaging and how you'll receive it."),
    },
    about: {
      title: L("Մեր մասին", "О нас", "About us"),
      lead: L("Գառնու Գաթան ավանդական գաթա է՝ թխված Գառնիում։", "Гарну Гата — традиционная гата, испечённая в Гарни.", "Garnu Gata is traditional gata baked in Garni."),
      seo: L("Գառնու Գաթա․ ավանդական գաթա Գառնիից՝ հարսանիքի, նշանադրության, կնունքի և նվերի համար։", "Гарну Гата: традиционная гата из Гарни для свадьбы, помолвки, крестин и в подарок.", "Garnu Gata: traditional gata from Garni for weddings, engagements, christenings and gifts."),
    },
    faq: {
      title: L("Հաճախ տրվող հարցեր", "Частые вопросы", "Frequently asked questions"),
      lead: L("Պատասխաններ առաքման, պատվերի և գաթաների մասին։", "Ответы о доставке, заказе и гате.", "Answers about delivery, ordering and our gata."),
      nav: L("Հարցեր", "Вопросы", "FAQ"),
    },
    contact: {
      title: L("Կապ", "Контакты", "Contact"),
      lead: L("Զանգահարեք, գրեք կամ պատվիրեք կայքում։", "Звоните, пишите или заказывайте на сайте.", "Call, message us or order on the website."),
      seo: L("Գառնու Գաթայի հեռախոսահամարները, WhatsApp և Instagram։", "Телефоны, WhatsApp и Instagram Гарну Гата.", "Garnu Gata phone numbers, WhatsApp and Instagram."),
    },
  },
  deliveryInfo: {
    kicker: L("Առաքում", "Доставка", "Delivery"),
    title: L("Առաքում և ստացում", "Доставка и получение", "Delivery and pickup"),
    lead: L("Ստացման եղանակը կընտրեք պատվերի ձևում։", "Способ получения вы выберете в форме заказа.", "You'll choose how to receive your order in the form."),
  },
  ring: { show: true, kicker: L("Մեր աշխատանքները", "Наши работы", "Our work"), title: L("Գաթա՝ ձեր տոնի համար", "Гата для вашего праздника", "Gata for your celebration") },
  words: {
    show: true,
    // *word* is shown in gold
    text: L("Գառնիում թխված *գաթա՝* ձեր տոնի համար։", "Гата из *Гарни* для вашего праздника.", "Gata baked in *Garni* for your celebration."),
  },
  features: {
    kicker: L("Ինչու մենք", "Почему мы", "Why us"),
    title: L("Ինչո՞ւ ընտրել Գառնու Գաթան", "Почему Гарну Гата?", "Why choose Garnu Gata?"),
    items: [
      { big: L("", "", ""), title: L("Ձեր ընտրությամբ", "На ваш выбор", "Your choice"), text: L("Ընտրեք գաթայի միջուկը, չափսը և փաթեթավորումը։", "Выберите начинку, размер и упаковку.", "Choose the filling, size and packaging.") },
      { big: L("", "", ""), title: L("Ձեռքով զարդարված", "Украшено вручную", "Decorated by hand"), text: L("Տուփերը զարդարում ենք ուլունքներով, ժապավեններով ու ժանյակով։", "Мы украшаем коробки бусинами, лентами и кружевом.", "We decorate the boxes with beads, ribbons and lace.") },
      { big: L("", "", ""), title: L("Թխում ենք Գառնիում", "Печём в Гарни", "Baked in Garni"), text: L("Պատվերը կարող եք վերցնել նաև Գառնիից։ Հասցեն ճշտելու համար զանգահարեք մեզ։", "Заказ можно забрать и в Гарни. Позвоните нам, чтобы уточнить адрес.", "You can also pick up your order in Garni. Call us for the address.") },
      { big: L("", "", ""), title: L("Առաքում Երևան և Աբովյան", "Доставка в Ереван и Абовян", "Delivery to Yerevan & Abovyan"), text: L("Պատվերը կարող եք վերցնել Երևանի «Մեգամոլից»՝ առանց առաքման վճարի, կամ պատվիրել վճարովի առաքում ձեր հասցեով։", "Заказ можно забрать в ереванском «Мегамолле» без оплаты доставки или заказать платную доставку на ваш адрес.", "Pick up your order at Megamall in Yerevan with no delivery fee, or choose paid delivery to your address.") },
    ],
  },
  story: {
    image: "/img/bag_satin.webp",
    kicker: L("Գառնիից", "Из Гарни", "From Garni"),
    title: L("Գառնիի համը՝ ձեր սեղանին", "Вкус Гарни на вашем столе", "The taste of Garni on your table"),
    p1: L(
      "Գառնիում գաթան թխում են սերնդեսերունդ։ Մենք էլ մեր գաթան թխում ենք այստեղ՝ ավանդական բաղադրատոմսով։",
      "В Гарни гату пекут из поколения в поколение. Мы тоже печём нашу гату здесь, по традиционному рецепту.",
      "In Garni, gata has been baked for generations. We bake ours here too, from a traditional recipe."
    ),
    p2: L(
      "Հարսանիքի, նշանադրության կամ կնունքի համար առաջարկում ենք գաթաներ՝ զարդարված տուփերով ու նվեր-պայուսակներով։ Փաթեթավորման ձևավորումը կընտրենք ձեզ հետ։",
      "Для свадьбы, помолвки или крестин мы предлагаем гату в украшенных коробках и подарочных пакетах. Оформление упаковки выберем вместе с вами.",
      "For weddings, engagements and christenings we offer gata in decorated boxes and gift bags. We choose the packaging design together with you."
    ),
  },
  gallery: {
    kicker: L("Լուսանկարներ", "Фотографии", "Photos"),
    title: L("Մեր գաթաներն ու փաթեթավորումները", "Наша гата и упаковка", "Our gata and packaging"),
    lead: L("Ավելի շատ լուսանկարներ՝ մեր Instagram-ի էջում։", "Больше фотографий — в нашем Instagram.", "More photos on our Instagram."),
    images: [
      { src: "/img/top.webp", alt: L("Գառնու գաթա՝ ուլունքներով", "Гата с бусинами", "Gata with beads") },
      { src: "/img/box_pile.webp", alt: L("Հարսանեկան գաթաներ տուփերում", "Свадебные гаты в коробках", "Wedding gata in boxes") },
      { src: "/img/shelf.webp", alt: L("Զարդարված գաթայի տուփեր", "Украшенные коробки с гатой", "Decorated gata boxes") },
      { src: "/img/vase.webp", alt: L("Շղարշով փաթեթավորված գաթա", "Гата в фатине", "Gata wrapped in tulle") },
      { src: "/img/bag_pearl.webp", alt: L("Գաթա՝ նվեր-պայուսակում", "Гата в подарочном пакете", "Gata in a gift bag") },
      { src: "/img/marble.webp", alt: L("Գաթաներ սպիտակ տուփերում", "Гаты в белых коробках", "Gata in white boxes") },
      { src: "/img/bride.webp", alt: L("Գաթա՝ հարսի ճամպրուկի համար", "Гата для чемодана невесты", "Gata for the bride's suitcase") },
      { src: "/img/bag_satin.webp", alt: L("Գաթա՝ ժապավենով նվեր-պայուսակում", "Гата в подарочном пакете с лентой", "Gata in a gift bag with ribbon") },
      { src: "/img/initials.webp", alt: L("Գաթայի տուփեր՝ սկզբնատառերով", "Коробки с инициалами", "Boxes with initials") },
      { src: "/img/bags_shelf.webp", alt: L("Նվեր-պայուսակներ հյուրերի համար", "Подарочные пакеты для гостей", "Gift bags for guests") },
    ],
  },
  steps: {
    kicker: L("Քայլ առ քայլ", "Шаг за шагом", "Step by step"),
    title: L("Ինչպես պատվիրել", "Как заказать", "How to order"),
    items: [
      { title: L("Ընտրեք ձեր գաթան", "Выберите гату", "Choose your gata"), text: L("Ընտրեք միջուկը, չափսը, քանակը, փաթեթավորումը և ստանալու օրը։", "Выберите начинку, размер, количество, упаковку и день получения.", "Choose the filling, size, quantity, packaging and the day you need it.") },
      { title: L("Ուղարկեք պատվերը", "Отправьте заказ", "Send your order"), text: L("Լրացրեք պատվերի ձևը կամ պատվիրեք չատով։ Կարող եք նաև զանգահարել մեզ։", "Заполните форму заказа или закажите в чате. Можно также позвонить нам.", "Fill in the order form or order in the chat. You can also call us.") },
      { title: L("Ստացեք ձեր գաթան", "Получите гату", "Get your gata"), text: L("Կկապվենք ձեզ հետ՝ պատվերը, վերջնական գինը և ստանալու մանրամասները հաստատելու համար։", "Мы свяжемся с вами, чтобы подтвердить заказ, итоговую цену и детали получения.", "We'll contact you to confirm the order, the final price and how you'll receive it.") },
    ],
  },
  order: {
    kicker: L("Պատվեր", "Заказ", "Order"),
    title: L("Պատվիրեք ձեր գաթան", "Закажите свою гату", "Order your gata"),
    lead: L(
      "Լրացրեք ձևը քայլ առ քայլ․ գինը կհաշվարկվի անմիջապես։",
      "Заполните форму шаг за шагом — цена посчитается сразу.",
      "Fill in the form step by step; the price is calculated right away."
    ),
    note: L(
      "Պատվերն ուղարկելուց հետո կկապվենք ձեզ հետ՝ վերջնական գինը և ստացման ժամկետը հաստատելու համար։",
      "После отправки заказа мы свяжемся с вами, чтобы подтвердить итоговую цену и срок получения.",
      "After you send your order, we'll contact you to confirm the final price and when you'll receive it."
    ),
    minDays: 2,
    accept: true,
    closedText: L(
      "Այս պահին առցանց պատվերներ չենք ընդունում։ Պատվիրելու համար զանգահարեք մեզ։",
      "Сейчас мы не принимаем онлайн-заказы. Чтобы заказать, позвоните нам.",
      "We're not taking online orders right now. Please call us to order."
    ),
  },
  faq: {
    kicker: L("Հարցեր", "Вопросы", "FAQ"),
    title: L("Հաճախ տրվող հարցեր", "Частые вопросы", "Frequently asked questions"),
    items: [
      { q: L("Առաքո՞ւմ եք Երևան և Աբովյան։", "Доставляете в Ереван и Абовян?", "Do you deliver to Yerevan and Abovyan?"), a: L("Այո, առաքում ենք Երևան և Աբովյան։ Երևանի «Մեգամոլից» պատվերը կարող եք վերցնել առանց առաքման վճարի։ Ձեր հասցեով առաքման արժեքը ճշտում ենք առանձին։ Պատվերը կարող եք վերցնել նաև Գառնիից։", "Да, доставляем в Ереван и Абовян. В ереванском «Мегамолле» заказ можно забрать без оплаты доставки. Стоимость доставки на ваш адрес уточняем отдельно. Заказ можно забрать и в Гарни.", "Yes, we deliver to Yerevan and Abovyan. You can pick up your order at Megamall in Yerevan with no delivery fee. Delivery to your address is priced separately. You can also pick up in Garni.") },
      { q: L("Քանի՞ օր առաջ պետք է պատվիրել։", "За сколько дней нужно заказывать?", "How far ahead should I order?"), a: L("Խորհուրդ ենք տալիս պատվիրել 2–3 օր առաջ։ Մեծ պատվերների ժամկետը համաձայնեցրեք նախապես։ Շտապ պատվերի հնարավորությունը ճշտելու համար զանգահարեք մեզ։", "Рекомендуем заказывать за 2–3 дня. Сроки больших заказов согласуйте заранее. Чтобы узнать о срочном заказе, позвоните нам.", "We recommend ordering 2–3 days ahead. Please agree on timing for large orders in advance. For urgent orders, call us.") },
      { q: L("Ի՞նչ միջուկներով գաթա ունեք։", "Какие начинки у вас есть?", "Which fillings do you have?"), a: L("Ունենք խորիզով, ընկույզով, չրերով և խուրմայով գաթա։ Չափսերը՝ 25, 30 և 40 սմ։", "У нас есть гата с хоризом, с орехами, с сухофруктами и с хурмой. Размеры: 25, 30 и 40 см.", "We have gata with khoriz, walnut, dried fruit and persimmon. Sizes: 25, 30 and 40 cm.") },
      { q: L("Հարսանեկան գաթաներ պատրաստո՞ւմ եք։", "Делаете свадебную гату?", "Do you make wedding gata?"), a: L("Այո։ Առաջարկում ենք գաթաներ՝ զարդարված տուփերով և նվեր-պայուսակներով, ինչպես նաև հարսի ճամպրուկի համար գաթա։ Փաթեթավորման ձևավորումն ու արժեքը ճշտում ենք պատվիրելիս։", "Да. Предлагаем гату в украшенных коробках и подарочных пакетах, а также гату для чемодана невесты. Оформление и стоимость упаковки уточняем при заказе.", "Yes. We offer gata in decorated boxes and gift bags, and gata for the bride's suitcase. We confirm the packaging design and price when you order.") },
      { q: L("Ինչպե՞ս պատվիրել։", "Как заказать?", "How do I order?"), a: L("Լրացրեք կայքի պատվերի ձևը, պատվիրեք չատով կամ զանգահարեք մեզ։ Կարող եք գրել նաև Instagram-ում։", "Заполните форму заказа на сайте, закажите в чате или позвоните нам. Можно также написать в Instagram.", "Fill in the order form on the site, order in the chat or call us. You can also message us on Instagram.") },
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
      { id: "classic", name: L("Խորիզով (դասական)", "С хоризом (классическая)", "Khoriz (classic)"), short: L("Խորիզով", "С хоризом", "Khoriz"), prices: [3000, 3500, 4500], show: true },
      { id: "walnut", name: L("Ընկույզով", "С орехами", "Walnut"), short: L("Ընկույզով", "С орехами", "Walnut"), prices: [3500, 4000, 5000], show: true },
      { id: "raisin", name: L("Չրերով", "С сухофруктами", "Dried fruit"), short: L("Չրերով", "С сухофруктами", "Dried fruit"), prices: [4000, 4500, 5500], show: true },
      { id: "date", name: L("Խուրմայով", "С хурмой", "Persimmon"), short: L("Խուրմայով", "С хурмой", "Persimmon"), prices: [4000, 4500, 5500], show: true },
      { id: "choco", name: L("Շոկոլադով", "Шоколадная", "Chocolate"), short: L("Շոկոլադով", "Шоколадная", "Chocolate"), prices: [4000, 4500, 5500], show: false },
    ],
    box: { enabled: true, price: 0 }, // kept for older versions; see packs
    // packaging options; price: -1 = confirmed later, 0 = free, >0 = fixed price per gata
    packs: [
      { id: "none", label: L("Առանց տուփի", "Без коробки", "No box"), price: 0, show: true },
      { id: "box", label: L("Տուփով", "В коробке", "In a box"), price: -1, show: true },
      { id: "bag", label: L("Նվեր-պայուսակով", "В подарочном пакете", "In a gift bag"), price: -1, show: true },
      { id: "wrap", label: L("Շղարշով և ժապավենով", "В фатине с лентой", "Wrapped in tulle and ribbon"), price: -1, show: true },
    ],
  },
  delivery: {
    options: [
      { id: "pickup", label: L("Վերցնել Գառնիից", "Самовывоз из Гарни", "Pick up in Garni"), address: false, price: 0, show: true,
        note: L("Վերցնելու հասցեն և ժամը կճշտենք պատվերը հաստատելիս։", "Адрес и время самовывоза уточним при подтверждении заказа.", "We'll confirm the pickup address and time when we confirm your order.") },
      { id: "megamall", label: L("Վերցնել Մեգամոլից", "Забрать в «Мегамолле»", "Pick up at Megamall"), address: false, price: 0, show: true,
        note: L("Երևանի «Մեգամոլ» առևտրի կենտրոն։ Ժամը կճշտենք պատվերը հաստատելիս։", "Торговый центр «Мегамолл» в Ереване. Время уточним при подтверждении заказа.", "Megamall shopping centre in Yerevan. We'll confirm the time when we confirm your order.") },
      { id: "yerevan", label: L("Առաքում Երևանում", "Доставка по Еревану", "Delivery in Yerevan"), address: true, price: -1, show: true,
        note: L("Ձեր հասցեով՝ Yandex կամ այլ ծառայությամբ։ Առաքման արժեքը կճշտենք պատվերը հաստատելիս։", "На ваш адрес через Yandex или другую службу. Стоимость доставки уточним при подтверждении заказа.", "To your address by Yandex or another service. We'll confirm the delivery price when we confirm your order.") },
      { id: "abovyan", label: L("Առաքում Աբովյանում", "Доставка в Абовян", "Delivery in Abovyan"), address: true, price: -1, show: true,
        note: L("Ձեր հասցեով։ Առաքման արժեքը կճշտենք պատվերը հաստատելիս։", "На ваш адрес. Стоимость доставки уточним при подтверждении заказа.", "To your address. We'll confirm the delivery price when we confirm your order.") },
    ],
    // price: 0 = free, -1 = extra fee confirmed later, >0 = fixed fee in AMD
  },
  chat: {
    show: true,
    ai: false, // let the AI answer questions the built-in assistant does not understand
    welcome: L(
      "Բարև ձեզ։ Ես Գառնու Գաթայի ավտոմատ օգնականն եմ։ Կարող եմ ցույց տալ գներն ու չափսերը, տեղեկացնել առաքման մասին և օգնել պատվեր ուղարկել։",
      "Здравствуйте! Я автоматический помощник Гарну Гата. Могу показать цены и размеры, рассказать о доставке и помочь отправить заказ.",
      "Hello! I'm Garnu Gata's automated assistant. I can show prices and sizes, explain delivery and help you send an order."
    ),
    // Answers to common questions. {phones} = phone numbers, {instagram} = Instagram handle.
    answers: {
      delivery: L(
        "Առաքում ենք Երևան և Աբովյան։ Երևանի «Մեգամոլից» պատվերը կարող եք վերցնել առանց առաքման վճարի։ Ձեր հասցեով առաքման արժեքը ճշտում ենք առանձին։ Պատվերը կարող եք վերցնել նաև Գառնիից։",
        "Доставляем в Ереван и Абовян. В ереванском «Мегамолле» заказ можно забрать без оплаты доставки. Стоимость доставки на ваш адрес уточняем отдельно. Заказ можно забрать и в Гарни.",
        "We deliver to Yerevan and Abovyan. You can pick up your order at Megamall in Yerevan with no delivery fee. Delivery to your address is priced separately. You can also pick up in Garni."
      ),
      where: L(
        "Մենք Գառնիում ենք՝ Կոտայքի մարզում։ Պատվերը վերցնելու հասցեն ճշտելու համար զանգահարեք՝ {phones}։",
        "Мы в Гарни, Котайкская область. Чтобы уточнить адрес самовывоза, позвоните: {phones}.",
        "We're in Garni, Kotayk Province. Call us for the pickup address: {phones}."
      ),
      khoriz: L(
        "Խորիզը գաթայի քաղցր միջուկն է՝ ալյուրից, կարագից և շաքարից։",
        "Хориз — это сладкая начинка гаты из муки, масла и сахара.",
        "Khoriz is gata's sweet filling, made of flour, butter and sugar."
      ),
      fresh: L(
        "Պահպանման պայմաններն ու ժամկետը ճշտեք պատվիրելիս․ դրանք կարող են տարբեր լինել՝ ըստ միջուկի և փաթեթավորման։",
        "Условия и срок хранения уточните при заказе: они зависят от начинки и упаковки.",
        "Please ask about storage and shelf life when you order: they depend on the filling and packaging."
      ),
      when: L(
        "Խորհուրդ ենք տալիս պատվիրել 2–3 օր առաջ։ Մեծ պատվերների ժամկետը համաձայնեցրեք նախապես։ Եթե գաթան պետք է այսօր կամ վաղը, զանգահարեք՝ {phones}։",
        "Рекомендуем заказывать за 2–3 дня. Сроки больших заказов согласуйте заранее. Если гата нужна сегодня или завтра, позвоните: {phones}.",
        "We recommend ordering 2–3 days ahead. Please agree on timing for large orders in advance. If you need gata today or tomorrow, call: {phones}."
      ),
      hours: L(
        "Աշխատանքային ժամերն ու պատրաստի գաթաների առկայությունը ճշտելու համար զանգահարեք՝ {phones}։",
        "Чтобы уточнить часы работы и наличие готовой гаты, позвоните: {phones}.",
        "To check opening hours and ready-made gata, call: {phones}."
      ),
      pay: L(
        "Կարող եք վճարել պատվերը ստանալիս։ Վճարման եղանակը կճշտենք պատվերը հաստատելիս։",
        "Оплатить можно при получении заказа. Способ оплаты уточним при подтверждении заказа.",
        "You can pay when you receive your order. We'll confirm the payment method when we confirm the order."
      ),
      payOnline: L(
        "Կարող եք վճարել պատվիրելիս՝ առցանց (քարտով, Idram-ով կամ Telcell-ով), կամ պատվերը ստանալիս։",
        "Оплатить можно онлайн при заказе (картой, Idram или Telcell) или при получении.",
        "You can pay online when ordering (card, Idram or Telcell) or when you receive your order."
      ),
      wedding: L(
        "Հարսանիքի, նշանադրության և կնունքի համար առաջարկում ենք գաթաներ՝ զարդարված տուփերով կամ նվեր-պայուսակներով։ Ունենք նաև հարսի ճամպրուկի համար գաթա և ձեր անունների սկզբնատառերով տուփեր։ Ձևավորումն ու արժեքը ճշտում ենք պատվիրելիս։",
        "Для свадьбы, помолвки и крестин мы предлагаем гату в украшенных коробках или подарочных пакетах. Есть также гата для чемодана невесты и коробки с инициалами ваших имён. Оформление и стоимость уточняем при заказе.",
        "For weddings, engagements and christenings we offer gata in decorated boxes or gift bags. We also have gata for the bride's suitcase and boxes with your initials. We confirm the design and price when you order."
      ),
    },
  },
  seo: {
    title: L(
      "Գառնու Գաթա — գաթաներ հարսանիքի և նվերի համար | Գառնի",
      "Гарну Гата — гата для свадьбы и в подарок | Гарни",
      "Garnu Gata — gata for weddings and gifts | Garni, Armenia"
    ),
    description: L(
      "Գառնիում թխված ավանդական գաթա՝ խորիզով, ընկույզով, չրերով և խուրմայով։ Հարսանեկան տուփեր, նվեր-պայուսակներ, սկզբնատառերով տուփեր։ Առաքում Երևան և Աբովյան։",
      "Традиционная гата из Гарни: с хоризом, орехами, сухофруктами и хурмой. Свадебные коробки, подарочные пакеты, коробки с инициалами. Доставка в Ереван и Абовян.",
      "Traditional gata baked in Garni: khoriz, walnut, dried fruit and persimmon. Wedding boxes, gift bags, boxes with initials. Delivery to Yerevan and Abovyan."
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
