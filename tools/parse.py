import re, json, gzip, html, glob, os
from bs4 import BeautifulSoup
out=[]; problems=[]
def clean_desc(el):
    if not el: return '', ''
    for t in el(['script','style','iframe']): t.decompose()
    # paragraphs as text
    paras=[]
    for blk in el.find_all(['p','li','h1','h2','h3','h4','div']):
        if blk.find(['p','li','div']): continue
        t=blk.get_text(' ',strip=True).replace('\xa0',' ')
        t=re.sub(r'\s+',' ',t).strip()
        if t: paras.append(('• ' if blk.name=='li' else '')+t)
    if not paras:
        t=re.sub(r'\s+',' ',el.get_text(' ',strip=True).replace('\xa0',' ')).strip()
        if t: paras=[t]
    return paras
for f in sorted(glob.glob('pages/*.html.gz')):
    slug=os.path.basename(f)[:-8]
    s=gzip.open(f,'rt',encoding='utf-8').read()
    b=BeautifulSoup(s,'lxml')
    sp=b.find(id='single-product')
    if not sp: problems.append((slug,'no single-product')); continue
    variants=json.loads(html.unescape(sp['data-variants']) if '&quot;' in sp['data-variants'] else sp['data-variants'])
    pid=variants[0]['product_id']
    h1=b.find('h1',class_='js-product-name')
    name=h1.get_text(strip=True) if h1 else ''
    crumbs=[]
    bc=b.find('div',class_='breadcrumbs')
    if bc:
        for a in bc.find_all('a',class_='crumb'):
            if a.get('href','').startswith('/'): crumbs.append({'name':a.get_text(strip=True),'path':a['href']})
    # option names
    optnames=[]
    for g in sp.select('.js-product-variants-group'):
        lab=g.find('label'); optnames.append(lab.get_text(strip=True) if lab else '')
    # images
    imgs=[]; seen=set()
    for sl in sp.select('.js-product-slide'):
        a=sl.find('a',class_='js-product-slide-link')
        if not a: continue
        u=a.get('href','')
        if u.startswith('//'): u='https:'+u
        if u and u not in seen:
            seen.add(u); imgs.append({'id':int(sl.get('data-image') or 0),'url':u})
    desc_el=sp.find(attrs={'data-store':re.compile(r'product-description')})
    uc=desc_el.find(class_='user-content') if desc_el else None
    desc_html=uc.decode_contents().strip() if uc else ''
    paras=clean_desc(BeautifulSoup(desc_html,'lxml')) if uc else []
    vs=[]
    for v in variants:
        opts=[v.get(f'option{i}') for i in range(3) if v.get(f'option{i}') is not None]
        iu=v.get('image_url') or ''
        if iu.startswith('//'): iu='https:'+iu
        vs.append({'id':v['id'],'options':opts,'price':v.get('price_number'),'price_display':v.get('price_short'),
                   'compare_at_price':v.get('compare_at_price_number'),'compare_at_display':v.get('compare_at_price_short'),
                   'promotional_price':v.get('promotional_price_number'),'has_promotional_price':v.get('has_promotional_price'),
                   'stock':v.get('stock'),'available':v.get('available'),'contact_for_price':v.get('contact'),
                   'sku':v.get('sku'),'image_id':v.get('image'),'image_url':iu})
    out.append({'id':pid,'slug':slug,'url':f'https://papeleraavellaneda.com/productos/{slug}/','name':name,
        'breadcrumb':crumbs,'option_names':optnames,'variants':vs,'images':imgs,
        'description':paras,'description_html':desc_html})
json.dump({'products':out,'problems':problems},open('parsed.json','w'),ensure_ascii=False)
print(len(out),'parsed;',len(problems),'problems',problems[:5])
