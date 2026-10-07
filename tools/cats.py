import re,requests,json
H={'User-Agent':'Mozilla/5.0'}
urls=[l.strip() for l in open('urls.txt') if l.strip()]
cats=[u for u in urls if '/productos/' not in u and '/search/' not in u and u.rstrip('/').count('/')>=3 and not any(x in u for x in ['contacto','terminos','envios-y'])]
res={}
for c in cats:
    path=c.replace('https://papeleraavellaneda.com','')
    ids=[];n=1;title=None
    while True:
        u=c+('' if n==1 else f'page/{n}/')
        r=requests.get(u,headers=H,timeout=30)
        if title is None:
            m=re.search(r'<h1[^>]*>(.*?)</h1>',r.text,re.S); title=re.sub(r'<[^>]+>','',m.group(1)).strip() if m else ''
        pids=re.findall(r'data-product-id="(\d+)"',r.text)
        new=[p for p in dict.fromkeys(pids) if p not in ids]
        if r.status_code!=200 or not new: break
        ids+=new; n+=1
    res[path]={'title':title,'ids':[int(i) for i in ids]}
    print(path,title,len(ids),flush=True)
json.dump(res,open('categories_raw.json','w'),ensure_ascii=False,indent=1)
print('DONE')
