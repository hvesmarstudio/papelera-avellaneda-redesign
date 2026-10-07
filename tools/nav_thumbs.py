"""Square navigation thumbnails (menu, mega menu, category rails).
Each category/collection uses a real product photo from that category,
hand-picked in data/site.json -> nav_thumbs {slug: product handle}."""
import json, os
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(ROOT, 'data/products.json')))
site = json.load(open(os.path.join(ROOT, 'data/site.json')))
by = {p['handle']: p for p in d['products']}
out = os.path.join(ROOT, 'assets/img/nav'); os.makedirs(out, exist_ok=True)
for slug, handle in site['nav_thumbs'].items():
    p = by[handle]; assert slug in p['categories'], (slug, handle)
    im = Image.open(os.path.join(ROOT, f"assets/img/products/{p['images'][0]['key']}-480.webp")).convert('RGB')
    w, h = im.size; s = min(w, h)
    im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)).resize((240, 240), Image.LANCZOS)
    im.save(os.path.join(out, f'{slug}.webp'), 'WEBP', quality=78, method=6)
print(len(site['nav_thumbs']), 'thumbs')
