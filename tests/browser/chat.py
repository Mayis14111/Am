# Chat checks. Needs `netlify dev --port 8888`. Dates are computed in Armenia time (UTC+4), so it runs on any day.
import asyncio, datetime
from playwright.async_api import async_playwright
B="http://localhost:8888"
MON=["հունվարի","փետրվարի","մարտի","ապրիլի","մայիսի","հունիսի","հուլիսի","օգոստոսի","սեպտեմբերի","հոկտեմբերի","նոյեմբերի","դեկտեմբերի"]
AM=(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(hours=4)).date()
hy=lambda d: f"{d.day} {MON[d.month-1]}, {d.year}"
dmy=lambda d: f"{d.day:02d}.{d.month:02d}.{d.year}"
TOMORROW=AM+datetime.timedelta(days=1); FUTURE=AM+datetime.timedelta(days=12); PAST=AM-datetime.timedelta(days=5)
AMBIG=AM-datetime.timedelta(days=30)  # same year? use a day.month that has passed this year
if AMBIG.year!=AM.year: AMBIG=datetime.date(AM.year,1,2) if AM>datetime.date(AM.year,1,2) else None
RES=[]
def ok(name, cond, info=""): RES.append(cond); print(("PASS" if cond else "FAIL"), name, info.replace("\n"," ⏎ ")[:240])
async def say(pg, t, wait=1600):
    await pg.fill("#q", t); await pg.press("#q","Enter"); await pg.wait_for_timeout(wait)
    return await pg.evaluate("[...document.querySelectorAll('#msgs .m.bot')].pop().textContent")
async def chat(pg, path="/"):
    await pg.goto(B+path); await pg.wait_for_timeout(400)
    await pg.evaluate("localStorage.clear()"); await pg.goto(B+path); await pg.wait_for_timeout(400)
    await pg.evaluate("document.getElementById('chatBtn').click()"); await pg.wait_for_timeout(300)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    await chat(pg)
    r=await say(pg,"ինչքան արժե 30 սմ ընկույզով գաթան?"); ok("price answer works", "4 000" in r, r)
    r=await say(pg,"ուզում եմ պատվիրել 2 հատ ընկույզով գաթա 30 սմ վաղը"); ok("several details in one message", "2 հատ" in r and f"{TOMORROW.day} {MON[TOMORROW.month-1]}" in r, r)
    await chat(pg)
    r=await say(pg,"պատվիրել 2 հատ ընկույզով գաթա 30 սմ առանց տուփի")
    ok("date question uses a future example, not 20.10", "Ո՞ր օրն" in r and "20.10" not in r and str(AM.year) in r, r)
    if AMBIG:
        r=await say(pg,f"{AMBIG.day:02d}.{AMBIG.month:02d}"); ok("day.month already passed this year -> asks which year", "արդեն անցել" in r and f".{AM.year+1}" in r and "Ո՞ր օրն" in r, r)
    r=await say(pg,dmy(PAST)); ok("past explicit date rejected and asked again", "անցել է" in r and "Ո՞ր օրն" in r, r)
    r=await say(pg,dmy(FUTURE)); ok("explicit future date repeated with year", hy(FUTURE) in r, r)
    await chat(pg); await say(pg,"պատվիրել 1 հատ խորիզով գաթա 25 սմ առանց տուփի"); r=await say(pg,"վաղը")
    ok("'վաղը' = tomorrow in Armenia", hy(TOMORROW) in r, r)
    await chat(pg); await say(pg,"պատվիրել 1 հատ խորիզով գաթա 25 սմ առանց տուփի"); r=await say(pg,"այսօր")
    ok("'այսօր' = today in Armenia + short-notice warning", hy(AM) in r and "զանգահարել" in r, r)
    # form -> chat consistency (custom product)
    await pg.goto(B+"/order?product=wedding-box"); await pg.wait_for_timeout(500)
    await pg.select_option("#fpack","none"); await pg.select_option("#kind","walnut"); await pg.fill("#qty","2"); await pg.wait_for_timeout(200)
    await pg.evaluate("document.getElementById('chatBtn').click()"); await pg.wait_for_timeout(300)
    await say(pg,"պատվիրել"); await say(pg,dmy(FUTURE)); await say(pg,"Վերցնել Գառնիից"); await say(pg,"Անի"); await say(pg,"077123456"); r=await say(pg,"Նշում չունեմ", 2000)
    ok("chat summary uses the same product rule", "Ձեր ընտրած տարբերակը" in r and "Հարսանեկան գաթա՝ տուփով" not in r and "8 000" in r and "Ընդհանուր գումար" in r, r)
    await pg.goto(B+"/order?product=initials-boxes"); await pg.wait_for_timeout(500); await pg.fill("#qty","2"); await pg.wait_for_timeout(200)
    await pg.evaluate("document.getElementById('chatBtn').click()"); await pg.wait_for_timeout(300)
    r=await say(pg,"պատվիրել"); ok("chat asks for initials for personalised boxes", "սկզբնատառերը" in r, r)
    r=await say(pg,"Մանրամասները կհամաձայնեցնեմ ձեզ հետ"); ok("deferral accepted, moves on to the date", "Ո՞ր օրն" in r, r)
    ok("no page errors", not errs, str(errs))
    await b.close()
    print(f"RESULT {sum(RES)}/{len(RES)} passed")
asyncio.run(main())
