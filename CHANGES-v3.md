# Garnu Gata — easier ordering update (v3, 14 Nov 2026)

Status: **not published.** The live site still runs the previous version. This ZIP holds the full updated project. Pushing it to GitHub `main` publishes it.

## 1. Summary of changes

**Homepage (shorter, clearer)**
- New order: hero → products with sizes and prices → delivery and pickup → order form → short story + one photo gallery → FAQ → contacts.
- Removed: the 3D photo ring, the big animated words, the full-screen photo zoom, the "why us" boxes, the "3 steps" block, scroll-in effects and card tilting.
- Only one decoration moves: the pearls around the hero photo float gently, and they stop when the device asks for less motion.
- Content shows immediately, without waiting for scroll effects.
- The hero shows the sizes, the starting price, the order button and the order-ahead advice.

**Product cards**
- Each card shows the option, "Չափսեր և գներ" (every size with its starting price, from the menu prices), whether packaging is included or charged separately, and a "Ընտրել այս տարբերակը" button.
- A "Միջուկներ և գներ" table shows every filling × size price, with a note that prices are for the gata without a box or other packaging.
- On phones, cards are compact: small photo beside the text. Below 360px the photo sits on top.

**Delivery and pickup**
- New "Առաքում և ստացում" block with Վերցնել Գառնիից / Վերցնել Մեգամոլից / Առաքում Երևանում / Առաքում Աբովյանում.
- Each option shows its fee or "ենթակա է ճշտման", plus details from existing data only.

**Order form (steps 1–6)**
- Step 1 (gata): size, filling, packaging and quantity. The selected-product banner "Ձեր ընտրությունը" shows a thumbnail and a "Փոխել" button.
- Step 2 (price): separate lines Գաթայի արժեքը / Տուփի (Փաթեթավորման) արժեքը / Առաքման արժեքը. Unknown charges show "Ենթակա է ճշտման", never 0. The bottom line reads "Ընդհանուր գումար" only when every charge is known, otherwise "Նախնական գումար".
- Step 3 (receiving): date and delivery method. Address appears only for delivery.
- Step 4 (contact): name and phone.
- Step 5: optional requests.
- Step 6 (review and send): the date is written out in Armenian, for example "20 նոյեմբերի, 2026 (ուրբաթ)".
- Packaging choices: Առանց տուփի, Տուփով, Նվեր-պայուսակով, Շղարշով և ժապավենով. Choosing a product card sets the packaging automatically.
- Errors appear in red under each field, with screen-reader links.
- **Sending:**
  - Success is shown only after the server confirms the order was saved.
  - A failed send keeps everything the customer typed.
  - Double clicks send a single order. A retry after a lost answer returns the same order number instead of creating a second order.
- **Payment:** online payment can't be chosen while the total is "Նախնական". The server refuses it too.

**Chat**
- The launcher has no red dot and no green "online" dot. The header still says it is automated.
- The launcher moves out of the way while:
  - the order form is on screen,
  - any page field is focused,
  - a button or card sits in its corner.
- The size question lists every size with its price on its own line, using menu data.
- While ordering, the general suggestion buttons are hidden. "Հետ", "Փոխել ընտրությունը" and "Կապվել մեզ հետ" are shown instead.
- Choices already made in the form (only fields the customer touched) are reused, and the chat says what it took.
- The full summary shows the same price lines as the form. Nothing is sent until "Ուղարկել պատվերը" is pressed.
- Same validation, packaging and online-payment rules as the form. Duplicate protection works the same way.
- Answers given mid-order no longer show "Պատվիրել չատով", which could restart the order.

**Readability and access**
- Paragraphs, fields and buttons now use regular weight instead of light. Headings keep the serif font.
- **Contrast** (measured):
  - body text 6.4:1
  - gold labels 5.5:1
  - white text on gold buttons 5.2:1
  - footer text 8.6:1
- Bigger footer and FAQ text.
- Touch targets are at least 40–48px.
- Visible focus outline.
- The mobile menu moves focus to its first link, and Esc returns focus to the ☰ button.
- The chat keeps Tab focus inside the panel, and Esc closes it.
- The gallery no longer moves by itself. Swipe it on phones, or use the ‹ › buttons on computers.

**Admin, Telegram, data**
- **Orders:** every order shows "Նախնական գումար" or "Վերջնական գումար" in the list, the order detail and the Telegram message. Telegram also shows the three price lines.
- **Confirming the price:** a new button, "Հաստատել վերջնական գումարը", confirms the price. Payment links need a confirmed amount.
- **Payment status** is shown separately as "Վճարված է" / "Չի վճարվել" etc.
- **Dashboard:** order value (including estimates) and money actually received ("Վճարված է") are shown separately, with a count of orders still at "Նախնական".
- **Admin editors:**
  - Menu: packaging-option editor (price −1 = to confirm).
  - Delivery: details field for each option.
  - Homepage: editors match the new layout.
- **Saved data:** existing orders, customers, settings and integrations are kept. Saved homepage texts that were never edited switch to the new defaults, and edited ones stay.

## 2. Armenian copy changes
- Hero: advice text "Խնդրում ենք պատվիրել առնվազն 2–3 օր առաջ։ Եթե պատվերը պետք է այսօր կամ վաղը, զանգահարեք մեզ՝ հնարավորությունը ճշտելու համար։"
- Hero chips: "Չափսեր՝ 25, 30, 40 սմ" and "Գինը՝ 3 000 դրամից" (from the menu).
- **Menu link:** "Տեսականի և գներ".
- **Product cards:**
  - "Չափսեր և գներ", "… դրամից"
  - "Տուփի արժեքը հաշվարկվում է առանձին", "Փաթեթավորման արժեքը հաշվարկվում է առանձին", "Գինը՝ ըստ ընտրված տարբերակի"
  - button "Ընտրել այս տարբերակը"
- **Products intro:** "Ընտրեք փաթեթավորման տարբերակը։ Չափսը, միջուկը և քանակը կնշեք պատվերի ձևում։"
- **Price table:** "Միջուկներ և գներ" with "Գները՝ մեկ գաթայի համար, առանց տուփի կամ այլ փաթեթավորման։"
- **Delivery block:**
  - "Առաքում և ստացում" / "Ստացման եղանակը կընտրեք պատվերի ձևում։"
  - Options: "Վերցնել Գառնիից", "Վերցնել Մեգամոլից", "Առաքում Երևանում", "Առաքում Աբովյանում"
  - Fee text: "Առանց առաքման վճարի" or "Առաքման արժեքը՝ ենթակա է ճշտման"
- **Order section intro:** "Լրացրեք ձևը քայլ առ քայլ․ գինը կհաշվարկվի անմիջապես։"
- **Form steps:** Գաթան / Արժեքը / Ստացումը / Ձեր տվյալները / Լրացուցիչ ցանկություններ / Ստուգեք և ուղարկեք.
- **Form labels:** Չափս, Միջուկ, Փաթեթավորում, Քանակ, Ստացման ամսաթիվ, Ստացման եղանակ, Առաքման հասցե, Անուն, Հեռախոսահամար, Լրացուցիչ ցանկություններ (ոչ պարտադիր).
- **Form hints:**
  - "Օրինակ՝ գույնը, սկզբնատառերը կամ ստացման նախընտրելի ժամը։"
  - Selected product: "Ձեր ընտրությունը" with the "Փոխել" button.
- **Price lines:**
  - Գաթայի արժեքը, Տուփի արժեքը, Փաթեթավորման արժեքը, Առաքման արժեքը
  - Ենթակա է ճշտման, Անվճար
  - Ընդհանուր գումար / Նախնական գումար
  - "Վերջնական գումարը կհաստատենք պատվերը հաստատելիս։"
  - "Առցանց վճարումը հասանելի կլինի վերջնական գինը հաստատելուց հետո։"
- **Packaging names:** Առանց տուփի, Տուփով, Նվեր-պայուսակով, Շղարշով և ժապավենով.
- **Under the send button:** "Պատվերն ուղարկելուց հետո կկապվենք ձեզ հետ՝ վերջնական գինը և ստացման ժամկետը հաստատելու համար։"
- **Success message:** "Ձեր պատվերն ուղարկված է։ Պատվերի համարը՝ {id}։ Մենք կկապվենք ձեզ հետ՝ մանրամասները հաստատելու համար։"
- **After a failed send:** "Ձեր տվյալները պահպանված են ձևում․ կարող եք նորից փորձել։"
- **Chat:**
  - "Մի քանի հարց կտամ, հետո կկարողանաք ստուգել և ուղարկել պատվերը։"
  - "Չափսեր և գներ՝", "Ինչպե՞ս փաթեթավորենք գաթան։"
  - Controls: "Հետ", "Փոխել ընտրությունը", "Կապվել մեզ հետ"
  - "Պատվերի ձևից վերցրեցի՝ …", "Ստացման ամսաթիվ՝ …"
- **Admin labels:** Նախնական գումար, Վերջնական գումար, Վճարված է, Չի վճարվել, Հաստատել վերջնական գումարը.
- Russian and English were updated to say the same things.

## 3. Tests (local test server; no real orders, messages or payments)
- **Widths 320, 375, 390, 430 and 1280px:** no sideways scrolling, no script errors. At 320px, the form and the selected-product banner fit after a fix.
- **Product cards:** choosing the gift-bag card sets packaging to "Նվեր-պայուսակով" and shows its thumbnail. Choosing the box card sets "Տուփով".
- **Prices:**
  - No box + Garni pickup → "Ընդհանուր գումար 3 500".
  - Box + Yerevan delivery → box and delivery lines both "Ենթակա է ճշտման", total "Նախնական գումար".
- **Address field** appears only for delivery.
- **Validation:**
  - Empty send shows inline errors for address, name and phone.
  - A past date (Armenia time) is rejected.
  - Today shows the "please call" note.
- **Lost answer:** the server saved the order but the answer was cut. The customer's details stayed in the form, and the retry returned the **same** order number (no duplicate).
- **Triple click:** one request was sent.
- **Success message** appeared only after the server confirmed.
- **Chat:**
  - Reused 40 cm / walnut / box from the form.
  - "Հետ" went back a step.
  - A question mid-order was answered, then the order continued.
  - "Կապվել մեզ հետ" showed WhatsApp and Call buttons.
  - "Փոխել ընտրությունը" changed the quantity and the summary updated.
  - The order was sent only after "Ուղարկել պատվերը".
- **Russian chat on a phone:** the size list shows prices line by line. With the keyboard open, the panel sits above it and the launcher is hidden.
- **Launcher:** hidden while the form is on screen, while a field is focused, and when hero buttons sit in its corner.
- **Mobile menu focus** and **language switching (ՀԱՅ → EN)** work.
- **Admin:** all screens open without errors.
  - Order detail shows "Նախնական գումար" and "Չի վճարվել".
  - The payment-link button is disabled until the final amount is confirmed.
  - "Հաստատել վերջնական գումարը" changes the label to "Վերջնական գումար".
  - The dashboard shows order value and money received separately.
- **Old saved texts:** text that was never edited switches to the new defaults; edited settings, for example "orders off", are kept.
- **Telegram:** the production settings exist in Netlify (bot token and chat ID). No message was sent during testing, so end-to-end delivery is **not** verified here.
- **Paynet:** no keys are configured, so it couldn't be tested.

## 4. Missing business information (not published, please confirm)
1. **Packaging prices:**
   - Box, gift bag and tulle wrapping are all set to "Ենթակա է ճշտման".
   - Is any of them included in the price, or a fixed amount?
   - Is the initials-box option really variable?
2. **Pickup:** Garni address and hours, and Megamall pickup point and hours.
3. **Delivery fees:** for Yerevan and Abovyan.
4. **«Խուրմայով»:** persimmon or dates (it affects the Russian and English text).
5. **Product information:** ingredients, allergens (nuts, eggs, milk, gluten), storage time and serving advice. None of it is published.
6. **Chocolate gata:** still hidden.
7. **Same-day orders:** is today allowed, or should the site require at least 1–2 days? Currently today and tomorrow are allowed, with a "please call" note.
8. **Telegram:** please send one real test order after publishing to confirm messages arrive and the status buttons work.
9. **Paynet:** keys and webhook secret are not set yet.
