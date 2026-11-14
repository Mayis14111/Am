# Garnu Gata — Armenian wording and order fixes (14 Nov 2026)

## What changed

### Armenian text (whole site)
- New Armenian copy from the brief, sections 1–15: hero, packaging, products, short headings, benefits, about, photos, how to order, order section, form labels, prices, errors, chatbot, chatbot answers, FAQ and footer.
- Removed the "100% butter / no preservatives" claims and "every box is handmade". The decoration is now described as handmade.
- Lowercase «ձեզ / ձեր», "ուլունք" instead of "մարգարիտ", "շղարշ" for tulle.
- Russian and English texts were updated to say the same facts.
- Page title, Google description, FAQ structured data, photo descriptions and the share image text follow the new copy.
- The chatbot header says it is an automated assistant.

### Order and chat fixes
- **Hidden fillings:** fillings switched off in the admin panel can no longer be ordered anywhere: not in the form, the chat or the server. The admin can still add them to phone orders.
- **Dates:** the form, the chat and the server all use the date in Armenia. Past dates, impossible dates (31.02) and dates more than a year ahead are rejected. Today and tomorrow are allowed, with a "please also call us" note.
- **Validation:** whole-number quantity (at least 1), full phone number (8–15 digits) and full delivery address. Messages come from the brief.
- **Product cards:** tapping "Order" on a card shows the chosen product in the form and sets the packaging (box / no box). The product is saved with the order and shown in Telegram and the admin panel.
- **Prices:** "Նախնական գումար" with an explanation when the box or delivery price is still unknown, and "Ընդհանուր գումար" when everything is known. The same wording is used in the form, the chat summary and the WhatsApp text. Telegram and the admin panel mark estimates.
- **Payment wording:** the chat answer and the form options depend on whether online payment is actually turned on *and* connected.
- **Chat buttons:** the six quick buttons trigger fixed actions, so changing their text can't break them. "Հարսանեկան պատվեր" now answers about wedding orders instead of starting an order.
- **Lost confirmation:** if the order confirmation can't be received, the form and the chat show the brief's message plus three buttons: Գրել WhatsApp-ով, Զանգահարել, Պատճենել պատվերի տվյալները.
- **Cancelling:** cancelling in the chat uses the new message and only applies before sending.
- **robots.txt and sitemap:** both now follow the real site address automatically.

### Safe update of saved texts
If texts were already saved in the admin panel, any text still equal to the old default is replaced by the new one. Texts the owner edited are kept.

## Tests performed (local test server, no real orders or payments)
- Armenian, Russian and English pages, sitemap and robots.txt load.
- Server rejects: a hidden filling (chocolate), quantities 0 and 1.5, yesterday, 31.02, a short phone number and a short address. A valid order with a product card is accepted.
- Form on phone (390px) and desktop (1280px): card selection, every error message, the today/tomorrow note, estimate price text, a simulated lost confirmation with fallback buttons, and a successful send.
- Chat: all six quick buttons, the chocolate question, payment, an unknown question, a full Armenian order with wrong inputs (0, 31.02, short address, short phone), the summary, a simulated lost confirmation, and cancelling.
- Chat in English and Russian: full orders, changing the date before sending, and an Armenian question typed on the Russian page.
- Admin panel: every screen, changing an order status, saving texts, uploading a photo, creating a page.
- Text migration: old saved content shows the new Armenian copy.

## Open questions for the owner
1. **«Խուրմայով»:** is it persimmon (Russian «хурма») or dates (Armenian «արմավ», Russian «финики»)? The Armenian word is kept. Russian and English now say persimmon; before this update they said dates.
2. **Chocolate gata:** it's switched off, so it can't be ordered online and the chat asks people to call. Turn it on in Menu & prices if it's available.
3. **Box price:** it's set to "confirm later". If there's a fixed box price, enter it so totals become final.
4. **Delivery fee:** delivery to an address in Yerevan or Abovyan is set to "confirm later". A fixed fee can be entered under Delivery.
5. **Storage time:** the chat no longer promises "3–4 days". Add a confirmed answer if you want one.
6. **Domain:** canonical links follow the Netlify address until garnugata.am is connected. The footer and Paynet settings already say garnugata.am.
7. **Garni pickup:** customers are told to call for the exact pickup address. Add it if it may be published.
