"""Builds data/products.json + optimized WebP images from the scraped catalog.
Inputs (from ../scrape, produced by tools/fetch.sh, parse.py, cats.py, dl.sh):
  parsed.json, categories_raw.json, order.txt, raw/<image files>
"""
import json, os, re, sys, unicodedata, hashlib
from concurrent.futures import ProcessPoolExecutor
from PIL import Image

SCRAPE = sys.argv[1] if len(sys.argv) > 1 else '../scrape'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_IMG = os.path.join(ROOT, 'assets/img/products')

parsed = json.load(open(os.path.join(SCRAPE, 'parsed.json')))['products']
cats_raw = json.load(open(os.path.join(SCRAPE, 'categories_raw.json')))
order = [int(x) for x in open(os.path.join(SCRAPE, 'order.txt')).read().split()]
rank = {pid: i for i, pid in enumerate(order)}

# Category tree (mirrors the original store navigation; clean slugs + display names)
TREE = [
  ('bolsas-y-embalaje', 'Bolsas y embalaje', '/bolsas-y-embalaje/', [
    ('hilos-cintas-tarjetas-y-stickers', 'Hilos, cintas, tarjetas y stickers', '/bolsas-y-embalaje/cintas/'),
    ('cajas', 'Cajas', '/bolsas-y-embalaje/cajas/'),
    ('bolsas-sobres-y-papeles', 'Bolsas, sobres y papeles', '/bolsas-y-embalaje/bolsas/'),
  ]),
  ('todo-para-la-mesa', 'Todo para la mesa', '/todo-para-la-mesa/', [
    ('sorbetes-de-polipapel', 'Sorbetes de polipapel', '/todo-para-la-mesa/sorbetes-de-polipapel/'),
    ('platos', 'Platos', '/todo-para-la-mesa/platos1/'),
    ('vasos', 'Vasos', '/todo-para-la-mesa/vasos/'),
    ('servilletas', 'Servilletas', '/todo-para-la-mesa/servilletas/'),
    ('cubiertos', 'Cubiertos', '/todo-para-la-mesa/cubiertos/'),
    ('contenedores-y-pinchos', 'Contenedores y pinchos', '/todo-para-la-mesa/contenedores-y-pinchos/'),
  ]),
  ('deco-y-fiesta', 'Deco y fiesta', '/deco-y-fiesta/', [
    ('guirnaldas-de-flecos', 'Guirnaldas de flecos', '/deco-y-fiesta/guirnalda-de-flecos/'),
    ('globos', 'Globos', '/deco-y-fiesta/globos/'),
    ('luces-y-sparklers', 'Luces y sparklers', '/deco-y-fiesta/luces/'),
    ('confetti-y-cortinas', 'Confetti y cortinas', '/deco-y-fiesta/confetti2/'),
    ('fanales-y-panales', 'Fanales y panales', '/deco-y-fiesta/fanales-y-panales/'),
    ('rosetas-y-pompas', 'Rosetas y pompas', '/deco-y-fiesta/rosetas1/'),
    ('banderines-y-guirnaldas', 'Banderines y guirnaldas', '/deco-y-fiesta/banderines/'),
    ('blondas', 'Blondas', '/deco-y-fiesta/blondas/'),
    ('deco-torta-y-pirotines', 'Deco torta y pirotines', '/deco-y-fiesta/deco-torta/'),
    ('eco-friendly-party', 'Eco friendly party', '/deco-y-fiesta/eco-friendly-party/'),
  ]),
  ('navidad', 'Navidad', '/navidad/', []),
]
# Secondary categories that exist on the store (not in its main menu) -> "colecciones"
COLLECTIONS = [
  ('para-regalos', 'Para regalos', '/envoltorios/'),
  ('cuadernos-y-anotadores', 'Cuadernos, anotadores y mini broches', '/cuadernos-y-anotadores/'),
  ('bonetes', 'Bonetes', '/bonetes/'),
  ('animalitos-de-felpa', 'Animalitos de felpa', '/animalitos-de-felpa/'),
  ('margaritas', 'Margaritas', '/margaritas/'),
  ('pelpa-basicos', 'Pelpa básicos', '/pelpa-basicos1/'),
]

categories = []
membership = {}  # pid -> set(slug)
def add(slug, name, src, parent=None):
    ids = cats_raw.get(src, {}).get('ids', [])
    for i in ids: membership.setdefault(i, set()).add(slug)
    return {'slug': slug, 'name': name, 'parent': parent, 'source_url': 'https://papeleraavellaneda.com' + src, 'count': len(ids)}
for slug, name, src, subs in TREE:
    categories.append(add(slug, name, src))
    for s2, n2, src2 in subs:
        categories.append(add(s2, n2, src2, slug))
collections = [add(s, n, src) | {'type': 'collection'} for s, n, src in COLLECTIONS]
# subcategory products also belong to parent
parents = {c['slug']: c['parent'] for c in categories}
for pid, ss in membership.items():
    for s in list(ss):
        if parents.get(s): ss.add(parents[s])

KEEP_UPPER = {'LED', 'DIY', 'XL', 'XXL', 'PVC', 'ABC', 'USA', 'OK'}
def display_name(n):
    n = re.sub(r'\s+', ' ', n).strip()
    words = n.split(' ')
    out = []
    for i, w in enumerate(words):
        if w.upper() in KEEP_UPPER: out.append(w.upper()); continue
        lw = w.lower()
        if re.fullmatch(r'x\d+\w*', lw): out.append(lw); continue
        out.append(lw)
    s = ' '.join(out)
    return s[:1].upper() + s[1:]

def img_key(url):
    base = os.path.basename(url.split('?')[0])
    return hashlib.md5(base.encode()).hexdigest()[:12]

jobs = {}
products = []
for p in parsed:
    imgs = []
    for im in p['images']:
        k = img_key(im['url'])
        jobs[k] = im['url']; imgs.append({'key': k, 'source_url': im['url'], 'source_id': im['id']})
    variants = []
    for v in p['variants']:
        vk = None
        if v['image_url']:
            vk = img_key(v['image_url']); jobs.setdefault(vk, v['image_url'])
        variants.append({
            'id': v['id'], 'options': v['options'], 'price': v['price'],
            'compare_at_price': v['compare_at_price'] if v['compare_at_price'] and v['compare_at_price'] > (v['price'] or 0) else None,
            'price_display': v['price_display'], 'compare_at_display': v['compare_at_display'],
            'stock': v['stock'], 'available': bool(v['available']), 'sku': v['sku'], 'image': vk,
        })
    avail = [v for v in variants if v['available']] or variants
    prices = [v['price'] for v in avail if v['price'] is not None]
    cats = sorted(membership.get(p['id'], []))
    crumb = p['breadcrumb']
    products.append({
        'id': p['id'], 'handle': p['slug'], 'name': p['name'], 'display_name': display_name(p['name']),
        'description': p['description'], 'description_html': p['description_html'],
        'option_names': [o.strip().capitalize() for o in p['option_names']],
        'variants': variants, 'images': imgs,
        'price': min(prices) if prices else None, 'price_max': max(prices) if prices else None,
        'compare_at_price': next((v['compare_at_price'] for v in avail if v['compare_at_price']), None),
        'available': any(v['available'] for v in variants),
        'categories': cats,
        'source_breadcrumb': [c['name'] for c in crumb],
        'rank': rank.get(p['id'], 99999),
        'source_url': p['url'],
    })
products.sort(key=lambda x: x['rank'])

def process(item):
    k, url = item
    src = os.path.join(SCRAPE, 'raw', os.path.basename(url.split('?')[0]))
    o1 = os.path.join(OUT_IMG, f'{k}-480.webp'); o2 = os.path.join(OUT_IMG, f'{k}-960.webp')
    try:
        im = Image.open(src); im.load()
        if im.mode in ('P', 'LA', 'RGBA'):
            bg = Image.new('RGB', im.size, (255, 255, 255)); im = im.convert('RGBA'); bg.paste(im, mask=im.split()[3]); im = bg
        else:
            im = im.convert('RGB')
        w, h = im.size
        if not os.path.exists(o1):
            a = im.copy(); a.thumbnail((480, 960), Image.LANCZOS); a.save(o1, 'WEBP', quality=72, method=6)
        if not os.path.exists(o2):
            b = im.copy(); b.thumbnail((960, 1400), Image.LANCZOS); b.save(o2, 'WEBP', quality=74, method=6)
        return k, (w, h)
    except Exception as e:
        return k, None

with ProcessPoolExecutor() as ex:
    dims = dict(ex.map(process, jobs.items(), chunksize=16))

missing = [k for k, d in dims.items() if d is None]
for p in products:
    good = []
    for im in p['images']:
        d = dims.get(im['key'])
        if d: im['w'], im['h'] = d; good.append(im)
    p['images_missing'] = len(p['images']) - len(good)
    p['images'] = good
    for v in p['variants']:
        if v['image'] and not dims.get(v['image']): v['image'] = None

data = {
  'source': 'https://papeleraavellaneda.com/', 'platform': 'Tiendanube (theme Morelia)',
  'scraped_at': '2026-10-07', 'currency': 'ARS',
  'count': len(products), 'categories': categories, 'collections': collections, 'products': products,
}
json.dump(data, open(os.path.join(ROOT, 'data/products.json'), 'w'), ensure_ascii=False, indent=1)
print('products', len(products), 'images', len(jobs), 'missing', missing)
print('no-image products', [p['handle'] for p in products if not p['images']])
print('uncategorized', sum(1 for p in products if not p['categories']))
