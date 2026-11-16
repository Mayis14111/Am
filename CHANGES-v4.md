# Garnu Gata — fixes v4 (not deployed)

## What changed
1. **Order draft is kept** in the customer's browser (localStorage, never in the link) across language switches,
   page reloads, and trips to the menu. Values are stored by stable ids (size in cm, filling id, packaging id,
   delivery id, product slug). A product chosen on the menu (`/order?product=slug`) only changes the packaging;
   all other fields stay. The `?product=` part is removed from the address after it is applied.
   The draft is cleared only after the server confirms the order, or when the customer taps
   "Մաքրել ձևը" twice. The order key is kept with the draft, so a retry after a failure or reload
   can't create a second order.
2. **Product name always matches the packaging.** If the packaging is changed away from the product's own,
   the banner, header caption, review, chat summary, saved order, admin, CSV and Telegram show
   "Ձեր ընտրած տարբերակը" (admin/Telegram also show what it started from). The server decides this from
   the product slug, not from free text sent by the browser.
3. **Invalid quantity** (empty, 0, negative, fractional, >9999): inline error, no total, no review total,
   submit blocked. The server validates the same rule and recalculates all prices.
4. **Personalised boxes** ("Գաթայի տուփեր՝ ձեր սկզբնատառերով"): fields Սկզբնատառեր / Նախընտրելի գույն /
   Ձևավորման ցանկություններ + "Մանրամասները կհամաձայնեցնեմ ձեզ հետ". Initials or the deferral are
   required (browser and server). Shown only while that product keeps its box; never sent for other
   orders. Saved in the order, shown in admin, CSV and Telegram. The chat asks for initials too.
   Admin: product cards have a new "Ask for initials" switch.
5. **Finished-product prices:** a known mandatory charge is included in the card's "from" price
   (bride's suitcase: 4 000 / 4 500 / 5 500 դրամից, note "Գինը ներառում է ձևավորումը…").
   Products whose packaging price is unknown show "Գաթայի գինը՝ առանց փաթեթավորման" and
   "Փաթեթավորման արժեքը կճշտենք պատվերը հաստատելիս։". Same on cards, product pages and Google data.
   "Ընդհանուր գումար" only when every charge is known, otherwise "Նախնական գումար" + "Ենթակա է ճշտման".
6. **Phone order page:** the big decorative gata is hidden on phones; the form starts right after the title
   with a compact summary row (thumbnail + product + size · filling · packaging + "Փոխել").
   The circular size buttons were removed everywhere: the size is chosen only in the form.
   Price rows keep amounts on one line; long amounts move under their label at 320px.
7. **Armenian copy:** homepage sentence and order-page introduction replaced (with matching RU/EN);
   chat intro no longer says the order "will be ready".
8. **Chat dates:** the example date is generated (always in the future, Armenia time). "վաղը"/"այսօր" use
   Armenia time. A day.month with no year that already passed this year is not guessed: the chat asks
   (e.g. "20.10-ն այս տարի արդեն անցել է։ Նկատի ունե՞ք 20.10.2027-ը։…"). The understood date is
   repeated with weekday and year.
9. **New page /privacy** ("Անձնական տվյալների օգտագործում"), built from what the site really does
   (Netlify storage, Telegram, Google Fonts; Paynet, AI chat and Google Analytics are mentioned only when
   switched on). Linked in the footer and under the order button.

Content version is 6 (snapshot `defaults_v5.mjs`). Texts you never edited in admin update automatically;
texts you edited stay as you wrote them.

## Business information still needed (not published)
- Exact pickup address in Garni and pickup instructions.
- Megamall pickup instructions (where to meet, whom to call).
- Pickup hours / available time windows.
- How soon you answer after an order is sent.
- Accepted payment methods (cash, card, bank transfer, Idram…) and whether a deposit is required.
- How customers change or cancel an order, and until when.
- Ingredients, allergens (gluten, eggs, milk, nuts…), storage and shelf life.
- How long you keep order data and how customers can ask to delete it.
- Packaging prices for box and gift bag; delivery fees for Yerevan and Abovyan.

## v5 — order handling made exactly-once (`netlify/lib/submit.mjs`)
Problems fixed:
1. Two requests with the same key at the same moment could both pass the "seen before?" check and create two orders.
2. A retry with the same key but changed details got "success" for the earlier order.
3. If anything failed after the order was saved (Telegram, the retry record, a timeout), a retry could create a second order.
4. Short random order numbers could collide and overwrite another order.

How it works now:
- The key is claimed with a create-only write (Netlify Blobs `onlyIfNew`) **before** the order is saved. The claim stores a
  fingerprint of the order details and the reserved order number. Parallel requests wait for the first one's result.
- Same key + different details → 409, with the earlier order number; never a success. The browser then makes a new key,
  so tapping "Ուղարկել պատվերը" again sends a new, separate order (explicit choice).
- If the function stops after saving, the retry finds the reserved number, sees the order and returns it (and re-sends
  Telegram if it hadn't gone). If it stopped before saving, a retry after 30 s takes the claim over with the same number.
- Telegram calls time out after 4 s; a Telegram failure never fails or duplicates the order (`notify` is kept on the order).
- Order numbers are now GG-YYMMDD-XXXXX (5 characters) and are written create-only, also for admin "New order".
- Requests without a key are refused.

Tests: `npm test` (Node built-in test runner, in-memory Blobs with real create-only/etag rules and fault injection).
Browser tests in `tests/browser/` need `netlify dev` on port 8888 and a local admin cookie in /tmp/cookie.
(Telegram details in v5 were replaced in v6, below.)

## v6 — notifications separated from orders (`netlify/lib/notify.mjs`, `netlify/functions/notify-retry.mjs`)
- Each website order has its own notification record `notify/<orderId>` (pending → sending → done / failed),
  created **before** the order is written, so the work can't be lost.
- Only the request that wins the "sending" lease (conditional write, 20 s) may call Telegram. Parallel same-key
  requests that find the order get "busy" and send nothing.
- A failed or interrupted notification is retried by the scheduled function `notify-retry` every 5 minutes
  (backoff 1, 2, 4 … 60 min, up to 12 attempts) and by any identical customer retry. It never creates an order.
- Sending never writes the order. Payment start, Paynet webhook, Telegram status buttons and admin edits now use
  `updateOrder()` (read with etag → change only their own fields → write only if unchanged, else repeat), so they
  don't overwrite each other.
- Limit (unavoidable without Telegram supporting idempotent sends): if the process dies after Telegram accepted the
  message but before "done" is saved, the lease expires and the message is sent again — at-least-once, identical
  text, never zero, never a second order (test N5).
- Tests: `npm test` (= `node --test tests/*.test.mjs`, Node 22). Browser tests: `tests/browser/*.py` with
  `netlify dev --port 8888`; dates are computed in Armenia time so they run on any day.
