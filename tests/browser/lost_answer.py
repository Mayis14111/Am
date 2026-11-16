import asyncio, json, urllib.request
from playwright.async_api import async_playwright
B="http://localhost:8888"; C=open('/tmp/cookie').read().strip()
def ok(n,c,i=""): print(("PASS" if c else "FAIL"), n, str(i)[:220])
def orders():
    req=urllib.request.Request(B+"/api/admin/orders",headers={"Cookie":C}); j=json.loads(urllib.request.urlopen(req).read()); return j.get("orders",j)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(B+"/order"); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(500)
    await pg.select_option("#fpack","none"); await pg.fill("#qty","2"); await pg.fill("#date","2026-12-21"); await pg.select_option("#how2","pickup")
    await pg.fill("#name","Թեստ Կոնֆլիկտ"); await pg.fill("#phone","099000002"); await pg.wait_for_timeout(200)
    n0=len(orders())
    async def lose_answer(route):
        await route.fetch()          # the server really gets and saves it
        await route.abort()          # but the answer never reaches the browser
    await pg.route("**/api/order", lose_answer)
    await pg.click("#fsubmit"); await pg.wait_for_timeout(2500)
    await pg.unroute("**/api/order")
    ok("lost answer: customer told result unknown", "Չհաջողվեց ստանալ" in await pg.text_content("#done"))
    ok("server did save it once", len(orders())==n0+1)
    k1=await pg.evaluate("JSON.parse(localStorage.gg_order_draft_v1).key")
    await pg.fill("#name","Թեստ Կոնֆլիկտ Փոխված"); await pg.wait_for_timeout(200)
    await pg.click("#fsubmit"); await pg.wait_for_timeout(2500)
    d=await pg.text_content("#done")
    ok("changed details + same attempt -> no fake success, explains", "այլ տվյալներով" in d and "ուղարկված է" not in d, d)
    ok("no new order yet", len(orders())==n0+1)
    k2=await pg.evaluate("JSON.parse(localStorage.gg_order_draft_v1).key")
    ok("new key prepared for a separate order", k1!=k2)
    await pg.click("#fsubmit"); await pg.wait_for_timeout(2500)
    d=await pg.text_content("#done")
    ok("second tap = new separate order", "ուղարկված է" in d and len(orders())==n0+2, d.split("\n")[0])
    # unchanged retry after lost answer -> same order number shown
    await pg.goto(B+"/order"); await pg.wait_for_timeout(400)
    await pg.select_option("#fpack","none"); await pg.fill("#qty","1"); await pg.fill("#date","2026-12-22"); await pg.select_option("#how2","pickup"); await pg.fill("#name","Թեստ Նույն"); await pg.fill("#phone","099000003")
    await pg.route("**/api/order", lose_answer); await pg.click("#fsubmit"); await pg.wait_for_timeout(2500); await pg.unroute("**/api/order")
    n1=len(orders())
    await pg.click("#fsubmit"); await pg.wait_for_timeout(2500)
    d=await pg.text_content("#done"); ok("unchanged retry after lost answer -> success, no duplicate", "ուղարկված է" in d and len(orders())==n1, d.split("\n")[0])
    print("ERRS",errs); await b.close()
asyncio.run(main())
