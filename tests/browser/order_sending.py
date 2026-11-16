import asyncio, json, urllib.request
from playwright.async_api import async_playwright
B="http://localhost:8888"; COOKIE=open('/tmp/cookie').read().strip()
def ok(name, cond, info=""): print(("PASS" if cond else "FAIL"), name, info)
def api(path, body=None):
    req=urllib.request.Request(B+path, data=json.dumps(body).encode() if body is not None else None, headers={"Content-Type":"application/json","Cookie":COOKIE})
    try:
        with urllib.request.urlopen(req) as r: return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e: return e.code, json.loads(e.read() or b"{}")
def orders():
    s,j=api("/api/admin/orders"); return j.get("orders", j if isinstance(j,list) else [])
async def fill(pg, product="wedding-box"):
    await pg.goto(B+f"/order?product={product}"); await pg.wait_for_timeout(600)
    await pg.select_option("#fsize","1"); await pg.select_option("#kind","walnut"); await pg.fill("#qty","2")
    await pg.fill("#date","2026-12-20"); await pg.select_option("#how2","pickup")
    await pg.fill("#name","Թեստ Փորձնական"); await pg.fill("#phone","099000000"); await pg.wait_for_timeout(200)
async def main():
  before=len(orders())
  async with async_playwright() as p:
    b=await p.chromium.launch(); ctx=await b.new_context(viewport={"width":1280,"height":900}); pg=await ctx.new_page()
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    # network failure keeps draft, then retry with same key
    await fill(pg); await pg.select_option("#fpack","none")
    await pg.route("**/api/order", lambda r: r.abort())
    await pg.click("#fsubmit"); await pg.wait_for_timeout(800)
    d=await pg.text_content("#done"); key1=await pg.evaluate("JSON.parse(localStorage.gg_order_draft_v1).key")
    ok("network failure message + draft kept", "Ձեր տվյալները պահպանված են" in d and await pg.evaluate("!!localStorage.gg_order_draft_v1"), d.split("\n")[0])
    await pg.unroute("**/api/order")
    # server error (500) also keeps draft
    await pg.route("**/api/order", lambda r: r.fulfill(status=500, body='{"error":"Սերվերի սխալ (թեստ)"}', content_type="application/json"))
    await pg.click("#fsubmit"); await pg.wait_for_timeout(600)
    ok("server error keeps draft", await pg.evaluate("!!localStorage.gg_order_draft_v1") and await pg.input_value("#name")=="Թեստ Փորձնական", (await pg.text_content("#done")).split("\n")[0])
    await pg.unroute("**/api/order")
    # reload: same key restored
    await pg.reload(); await pg.wait_for_timeout(600)
    key2=await pg.evaluate("JSON.parse(localStorage.gg_order_draft_v1).key")
    ok("same order key after reload", key1==key2)
    # double click -> one order
    bodies=[]
    pg.on("request", lambda r: bodies.append(r.post_data) if r.url.endswith("/api/order") and r.method=="POST" else None)
    await pg.evaluate("document.getElementById('fsubmit').click(); document.getElementById('fsubmit').click(); document.getElementById('f').requestSubmit()")
    await pg.wait_for_timeout(2500)
    d=await pg.text_content("#done")
    ok("success message (sent, not confirmed)", "ուղարկված է" in d and "կկապվենք" in d, d.replace("\n"," "))
    ok("only one request from repeated clicks", len(bodies)==1, str(len(bodies)))
    ok("draft cleared after success", not await pg.evaluate("!!localStorage.gg_order_draft_v1"))
    body=json.loads(bodies[0])
    # replay same key -> duplicate, no new order
    s,j=api("/api/order", body); ok("retry with same key returns same order", j.get("duplicate") is True, j.get("id"))
    after=orders(); ok("exactly one new order saved", len(after)==before+1, f"{before}->{len(after)}")
    o=after[0] if after else {}
    print("   saved:", json.dumps({k:o.get(k) for k in ["id","product","productBase","packLabel","qty","unit","total","estimate","personalization"]}, ensure_ascii=False))
    ok("saved order: custom product + no box + 8000", o.get("product")=="Ձեր ընտրած տարբերակը" and o.get("packLabel")=="Առանց տուփի" and o.get("total")==8000 and o.get("estimate") is False)
    # initials order with deferral
    await fill(pg, "initials-boxes"); await pg.check("#pdefer"); await pg.fill("#pcol","ոսկեգույն"); await pg.wait_for_timeout(200)
    await pg.click("#fsubmit"); await pg.wait_for_timeout(2500)
    o=orders()[0]
    print("   saved:", json.dumps({k:o.get(k) for k in ["product","packLabel","estimate","total","personalization"]}, ensure_ascii=False))
    ok("initials order saved with design details", o.get("product")=="Գաթայի տուփեր՝ ձեր սկզբնատառերով" and o["personalization"]["deferred"] is True and o["personalization"]["color"]=="ոսկեգույն" and o.get("estimate") is True)
    # telegram text for it
    import subprocess
    tg=subprocess.run(["node","-e",f"import('/home/claude/gg/netlify/lib/telegram.mjs').then(m=>console.log(m.orderText({json.dumps(o)})))"],capture_output=True,text=True).stdout
    ok("telegram text has product, initials info, preliminary total", "🎀 Գաթայի տուփեր՝ ձեր սկզբնատառերով" in tg and "ոսկեգույն" in tg and "Նախնական գումար" in tg)
    print("ERRS", errs); await b.close()
  # server-side checks (no browser)
  base={"key":None,"lang":"hy","source":"form","filling":"walnut","size":30,"pack":"none","date":"2026-12-20","delivery":"pickup","name":"Թեստ","phone":"099000000"}
  for q in [0,-1,1.5,"",None,True,"2abc",10000]:
    s,j=api("/api/order", {**base,"qty":q}); ok(f"server rejects qty {q!r}", s==400, j.get("error"))
  s,j=api("/api/order", {**base,"qty":2,"productSlug":"initials-boxes","pack":"box"}); ok("server requires initials or deferral", s==400, j.get("error"))
  s,j=api("/api/order", {**base,"qty":2,"date":"2026-11-01"}); ok("server rejects past date", s==400, j.get("error"))
asyncio.run(main())
