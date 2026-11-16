import asyncio, json
from playwright.async_api import async_playwright
B="http://localhost:8888"
res=[]
def ok(name, cond, info=""):
    res.append(("PASS" if cond else "FAIL", name, info)); print(("PASS" if cond else "FAIL"), name, info)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); ctx=await b.new_context(viewport={"width":1280,"height":900})
    pg=await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    # ---- 1. draft through languages
    await pg.goto(B+"/order?product=wedding-box"); await pg.wait_for_timeout(700)
    ok("product param removed from link", "product=" not in pg.url, pg.url)
    await pg.select_option("#fsize","2"); await pg.select_option("#kind","walnut"); await pg.fill("#qty","3")
    await pg.fill("#date","2026-12-20"); await pg.select_option("#how2","yerevan"); await pg.fill("#faddr","Երևան, Աբովյան 10, բն. 5")
    await pg.fill("#name","Անի"); await pg.fill("#phone","077123456"); await pg.fill("#notes","Զանգել առավոտյան")
    await pg.wait_for_timeout(300)
    snap = lambda: pg.evaluate("""({size:document.getElementById('fsize').value,kind:kind.value,pack:fpack.value,qty:qty.value,date:date.value,how:how2.value,addr:faddr.value,name:document.getElementById('name').value,phone:phone.value,notes:notes.value,banner:fpickedS.textContent})""")
    s0=await snap()
    for path in ["/en/order","/ru/order","/order"]:
        await pg.goto(B+path); await pg.wait_for_timeout(600)
        s=await snap()
        same={k:v for k,v in s.items() if k!="banner"}=={k:v for k,v in s0.items() if k!="banner"}
        ok(f"draft kept after switching to {path}", same, s["banner"])
        ok(f"no contact data in link {path}", "077" not in pg.url and "%D5" not in pg.url)
    # ---- menu round trip with another product
    await pg.click("#fpickedX"); await pg.wait_for_timeout(600)
    ok("Change goes to menu", "/menu" in pg.url, pg.url)
    await pg.click("a[href*='product=gift-bag']"); await pg.wait_for_timeout(700)
    s=await snap()
    ok("new product applied (pack=bag)", s["pack"]=="bag", s["banner"])
    ok("other fields kept after product change", s["name"]=="Անի" and s["phone"]=="077123456" and s["qty"]=="3" and s["kind"]=="walnut" and s["addr"].startswith("Երևան") and s["date"]=="2026-12-20", json.dumps(s,ensure_ascii=False))
    # ---- 2. consistency: boxed product -> no box
    await pg.goto(B+"/order?product=wedding-box"); await pg.wait_for_timeout(600)
    b1=await pg.text_content("#fpickedS")
    await pg.select_option("#fpack","none"); await pg.wait_for_timeout(200)
    b2=await pg.text_content("#fpickedS"); rv=await pg.text_content("#freview"); cap=await pg.text_content("#ohCapT")
    ok("boxed product name while box", "տուփով" in b1, b1)
    ok("custom label after 'no box' (banner)", b2=="Ձեր ընտրած տարբերակը", b2)
    ok("review has no boxed name", "Հարսանեկան գաթա՝ տուփով" not in rv and "Ձեր ընտրած տարբերակը" in rv, rv.split("\n")[0])
    ok("header caption consistent", "տուփով" not in cap.split("—")[0] , cap)
    # ---- 4. initials fields
    await pg.goto(B+"/order?product=initials-boxes"); await pg.wait_for_timeout(600)
    ok("initials fields shown", await pg.is_visible("#pini") and await pg.is_visible("#pdefer"))
    await pg.fill("#pini","Ա.Մ."); await pg.fill("#pcol","սպիտակ"); await pg.wait_for_timeout(200)
    rv=await pg.text_content("#freview"); ok("initials in review", "Սկզբնատառեր՝ Ա.Մ." in rv and "Նախընտրելի գույն՝ սպիտակ" in rv)
    await pg.select_option("#fpack","bag"); await pg.wait_for_timeout(200)
    ok("initials hidden for other packaging", not await pg.is_visible("#pini"))
    rv=await pg.text_content("#freview"); ok("no stale initials in review", "Սկզբնատառեր" not in rv and "Ձեր ընտրած տարբերակը" in rv)
    await pg.select_option("#fpack","box"); await pg.wait_for_timeout(200)
    await pg.fill("#pini",""); await pg.fill("#date","2026-12-20"); await pg.select_option("#how2","pickup"); await pg.fill("#qty","2")
    await pg.click("#fsubmit"); await pg.wait_for_timeout(400)
    ok("initials required or deferral", await pg.is_visible("#piniE"), await pg.text_content("#piniE"))
    # ---- 3. quantity
    for v,label in [("", "empty"),("0","zero"),("-2","negative"),("1.5","fraction"),("10000","above max")]:
        await pg.fill("#qty", v); await pg.dispatch_event("#qty","input"); await pg.locator("#qty").blur(); await pg.wait_for_timeout(150)
        pr=await pg.text_content("#fprice"); rv=await pg.text_content("#freview"); er=await pg.text_content("#qtyE")
        ok(f"qty {label}: no total", "Նշեք ճիշտ քանակը՝ արժեքը հաշվարկելու համար։" in pr and "դրամ" not in pr and "գումար" not in rv, (er or "").strip())
    await pg.fill("#qty","2"); await pg.dispatch_event("#qty","input"); await pg.wait_for_timeout(150)
    pr=await pg.inner_text("#fprice"); ok("qty valid again restores price", "2 ×" in pr, pr.replace("\n"," | "))
    # ---- 5. pricing examples
    await pg.goto(B+"/order"); await pg.wait_for_timeout(500)
    await pg.select_option("#fpack","none"); await pg.select_option("#fsize","1"); await pg.select_option("#kind","walnut"); await pg.fill("#qty","2"); await pg.select_option("#how2","pickup"); await pg.wait_for_timeout(200)
    pr=await pg.inner_text("#fprice"); ok("2x30 walnut = 8 000, final total", "8 000" in pr and "Ընդհանուր գումար" in pr, pr.replace("\n"," | "))
    await pg.select_option("#kind","classic"); await pg.select_option("#fpack","wrap"); await pg.wait_for_timeout(200)
    pr=await pg.inner_text("#fprice"); ok("2x30 classic + decoration = 9 000", "9 000" in pr and "Ձևավորման արժեքը" in pr, pr.replace("\n"," | "))
    await pg.select_option("#fpack","box"); await pg.select_option("#how2","yerevan"); await pg.wait_for_timeout(200)
    pr=await pg.inner_text("#fprice"); ok("unknown box + delivery stay unconfirmed", pr.count("Ենթակա է ճշտման")==2 and "Նախնական գումար" in pr and "Ընդհանուր գումար" not in pr, pr.replace("\n"," | "))
    # ---- cards
    await pg.goto(B+"/menu"); await pg.wait_for_timeout(400)
    cards=await pg.evaluate("[...document.querySelectorAll('.products .card')].map(c=>c.querySelector('h3').textContent+' || '+c.querySelector('.sp').innerText.replace(/\\n/g,' ')+' || '+(c.querySelector('.packnote')||{}).textContent)")
    for c in cards: print("   card:", c)
    ok("bride suitcase from 4 000", any("ճամպրուկ" in c and "4 000 դրամից" in c for c in cards))
    ok("boxed card says price without packaging", any("տուփով" in c and "Գաթայի գինը՝ առանց փաթեթավորման" in c and "կճշտենք" in c for c in cards))
    await pg.goto(B+"/product/bride-suitcase"); await pg.wait_for_timeout(300)
    ok("product page bride from 4 000", "4 000 դրամից" in await pg.inner_text(".pinfo"))
    print("ERRS", errs)
    await b.close()
asyncio.run(main())
