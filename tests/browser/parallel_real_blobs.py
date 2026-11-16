import json, urllib.request, concurrent.futures, datetime
B="http://localhost:8888"; C=open('/tmp/cookie').read().strip()
def ok(n,c,i=""): print(("PASS" if c else "FAIL"), n, i)
def post(body):
    req=urllib.request.Request(B+"/api/order", data=json.dumps(body).encode(), headers={"Content-Type":"application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r: return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e: return e.code, json.loads(e.read() or b"{}")
def orders():
    req=urllib.request.Request(B+"/api/admin/orders",headers={"Cookie":C}); j=json.loads(urllib.request.urlopen(req).read()); return j.get("orders",j)
import uuid
base={"lang":"hy","source":"form","filling":"walnut","size":30,"qty":2,"pack":"none","date":"2026-12-20","delivery":"pickup","name":"Թեստ Զուգահեռ","phone":"099000001","pay":"cash"}
key="it-"+uuid.uuid4().hex[:12]; n0=len(orders())
with concurrent.futures.ThreadPoolExecutor(10) as ex: rs=list(ex.map(lambda _: post({**base,"key":key}), range(10)))
ids={j.get("id") for s,j in rs if s==200}
n1=len(orders())
ok("real Blobs: 10 parallel same-key requests -> 1 order", n1-n0==1, f"statuses={[s for s,_ in rs]} ids={ids}")
s,j=post({**base,"key":key,"name":"Փոխված"}); ok("real Blobs: same key + changed name -> 409 conflict", s==409 and j.get("conflict") and j.get("prevId") in ids, j.get("error","")[:90])
s,j=post({**base,"key":key}); ok("real Blobs: identical retry -> same order", s==200 and j.get("id") in ids and j.get("duplicate"))
ok("real Blobs: still exactly one order", len(orders())-n0==1)
o=[x for x in orders() if x["id"] in ids][0]; ok("order number has 5-letter suffix", len(o["id"].split("-")[-1])==5, o["id"])
