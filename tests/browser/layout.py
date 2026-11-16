import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8888"
def ok(name, cond, info=""): print(("PASS" if cond else "FAIL"), name, str(info)[:200])
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); errs=[]
    # form dates
    pg=await b.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(B+"/order"); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(500)
    import datetime
    AM=(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(hours=4)).date(); d=lambda n: (AM+datetime.timedelta(days=n)).isoformat()
    for v,exp in [(d(-5),"past"),(d(0),"soon"),(d(1),"soon"),(d(20),"ok")]:
        await pg.fill("#date", v); await pg.locator("#date").blur(); await pg.wait_for_timeout(150)
        er=await pg.is_visible("#dateE"); soon=await pg.is_visible("#fsoon"); rv=await pg.text_content("#freview")
        good = (exp=="past" and er) or (exp=="soon" and soon and not er) or (exp=="ok" and not soon and not er)
        ok(f"form date {v} -> {exp}", good, [l for l in rv.split("\n") if "ամսաթիվ" in l])
    await pg.close()
    for w,h in [(320,640),(375,667),(390,844),(430,932),(1280,800)]:
      ctx=await b.new_context(viewport={"width":w,"height":h}, is_mobile=w<600, has_touch=w<600); pg=await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
      await pg.goto(B+"/order?product=wedding-box"); await pg.wait_for_timeout(1200)
      over=await pg.evaluate("document.documentElement.scrollWidth>innerWidth")
      top=await pg.evaluate("""(()=>{const r=e=>Math.round(document.getElementById(e).getBoundingClientRect().top+scrollY);return {banner:r('fpicked'),size:r('fsize'),price:r('fprice')}})()""")
      await pg.screenshot(path=f"/tmp/l_{w}_top.png")
      # price rows: amounts on one line
      await pg.select_option("#how2","yerevan"); await pg.fill("#qty","12"); await pg.wait_for_timeout(200)
      wrap=await pg.evaluate("""[...document.querySelectorAll('#fprice div span:last-child')].some(s=>s.getClientRects().length>1||s.scrollWidth>s.clientWidth+1)""")
      await pg.locator("#fprice").scroll_into_view_if_needed(); await pg.screenshot(path=f"/tmp/l_{w}_price.png")
      # chat launcher vs submit, errors and focused field
      await pg.fill("#qty","0"); await pg.dispatch_event("#qty","input")
      await pg.locator("#fsubmit").scroll_into_view_if_needed(); await pg.wait_for_timeout(500)
      cover=await pg.evaluate("""(()=>{const b=document.getElementById('chatBtn');const st=getComputedStyle(b);if(b.classList.contains('away')||st.visibility==='hidden'||+st.opacity<0.1||st.display==='none')return false;const r=b.getBoundingClientRect();
        return ['fsubmit','qtyE','phone','name'].some(id=>{const e=document.getElementById(id);if(!e||e.hidden)return false;const q=e.getBoundingClientRect();return !(q.right<r.left||q.left>r.right||q.bottom<r.top||q.top>r.bottom)})})()""")
      await pg.focus("#phone"); await pg.wait_for_timeout(400)
      hid=await pg.evaluate("(()=>{const b=document.getElementById('chatBtn');const st=getComputedStyle(b);return b.classList.contains('away')||+st.opacity<0.1||st.visibility==='hidden'})()")
      await pg.screenshot(path=f"/tmp/l_{w}_submit.png")
      ok(f"{w}px: no sideways scroll", not over); ok(f"{w}px: amounts not wrapped", not wrap)
      ok(f"{w}px: launcher clear of submit/errors/fields", not cover); ok(f"{w}px: launcher hidden while typing", hid)
      if w<600: ok(f"{w}px: size control and price high up", top["size"]<h*0.85 and top["price"]<h*1.6, top)
      await ctx.close()
    print("ERRS",errs); await b.close()
asyncio.run(main())
