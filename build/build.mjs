// Static site generator — no dependencies. `node build/build.mjs` → dist/
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { home, catalog, product, shippingPage, faqPage, contactPage, termsPage, notFound, hubPage } from './pages.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const data = read('data/products.json');
const site = read('data/site.json');
const policies = read('data/policies.raw.json');
if (process.env.BASE_URL) site.base_url = process.env.BASE_URL.replace(/\/?$/, '/');

const products = data.products.filter((p) => p.images.length || true);
const byHandle = Object.fromEntries(products.map((p) => [p.handle, p]));

// Category tree with counts from actual membership
const countOf = (slug) => products.filter((p) => p.categories.includes(slug)).length;
// IA: empty categories are hidden; top categories and subcategories are ordered by
// how many products they hold (largest first), so the deepest assortments lead.
const cats = data.categories.map((c) => ({ ...c, count: countOf(c.slug) })).filter((c) => c.count > 0);
const byCount = (a, b) => b.count - a.count;
const tree = cats.filter((c) => !c.parent).sort(byCount).map((t) => ({ ...t, intent: site.intents?.[t.slug] || '', children: cats.filter((c) => c.parent === t.slug).sort(byCount) }));
const collections = data.collections.map((c) => ({ ...c, count: countOf(c.slug), children: [] })).filter((c) => c.count > 0).sort(byCount);
const catBySlug = {};
tree.forEach((t) => { catBySlug[t.slug] = t; t.children.forEach((c) => (catBySlug[c.slug] = { ...c, children: [] })); });
collections.forEach((c) => (catBySlug[c.slug] = c));

// Navigation metadata per category/collection — all derived from real catalog data
const byRank = products.slice().sort((a, b) => a.rank - b.rank);
const nav = {};
for (const slug of Object.keys(catBySlug)) {
  const all = byRank.filter((p) => p.categories.includes(slug));
  const avail = all.filter((p) => p.available && p.images.length);
  const pick = (h) => h && byHandle[h] && byHandle[h].images.length ? byHandle[h] : null;
  const thumbP = pick(site.nav_thumbs?.[slug]) || avail[0];
  // featured: first on-sale product in store order, else the thumbnail product
  // prefer items that live only in this top category (avoids e.g. napkins featured in "Deco")
  const otherTops = data.categories.filter((c) => !c.parent && c.slug !== slug && c.slug !== (catBySlug[slug].parent || '')).map((c) => c.slug);
  const own = (p) => !otherTops.some((t) => p.categories.includes(t));
  // ...and prefer the category's largest subcategories, so the promo is representative
  const mainSubs = cats.filter((c) => c.parent === slug).sort((a, b) => b.count - a.count).slice(0, 3).map((c) => c.slug);
  const core = (p) => !mainSubs.length || mainSubs.some((s) => p.categories.includes(s));
  const featured = avail.find((p) => p.compare_at_price && own(p) && core(p)) || avail.find((p) => p.compare_at_price && own(p)) || thumbP;
  // mosaic: thumbnail product + next strongest distinct items in store order
  const mosaic = [thumbP, ...avail.filter((p) => p !== thumbP)].filter(Boolean).slice(0, 3);
  nav[slug] = {
    thumb: `assets/img/nav/${slug}.webp`, count: all.length,
    min: avail.length ? Math.min(...avail.map((p) => p.price)) : null,
    sale: all.filter((p) => p.compare_at_price > p.price).length,
    featured, mosaic, picks: avail.slice(0, 6),
    description: site.category_descriptions?.[slug] || null,
  };
}
const saleCountAll = products.filter((p) => p.compare_at_price > p.price).length; // matches the ?oferta=1 filter

// Low-stock nudge (real snapshot data): a product counts as "Últimas unidades" when every
// in-stock variant has tracked stock and their total is at or below the threshold.
// Untracked (null) stock never gets the badge. On Tiendanube this maps to variant.stock.
const LOW = site.low_stock_threshold ?? 2;
function isLow(p) {
  const vs = p.variants.filter((v) => v.available);
  if (!p.available || !vs.length || vs.some((v) => typeof v.stock !== 'number')) return false;
  const total = vs.reduce((a, v) => a + v.stock, 0);
  return total > 0 && total <= LOW;
}
const fit = (im) => { const r = im.h / im.w; return r >= 1.2 && r <= 1.62 ? 'v' : 'c'; };
function record(p) {
  const single = p.variants.length === 1 ? p.variants[0] : null;
  return {
    i: p.id, h: p.handle, n: p.display_name, p: p.price, x: p.price_max !== p.price ? p.price_max : undefined,
    c: p.compare_at_price || undefined, a: p.available ? 1 : 0, k: p.categories,
    m: p.images.slice(0, 2).map((i) => i.key), f: p.images.slice(0, 2).map(fit).join(''),
    v: single && single.available ? single.id : 0, vl: p.variants.length, s: single ? single.stock : undefined, r: p.rank, l: isLow(p) ? 1 : undefined,
  };
}
const order = [...tree.flatMap((t) => [...t.children.map((c) => c.slug), t.slug]), ...collections.map((c) => c.slug)];
function primaryCat(p) {
  const subs = order.filter((s) => catBySlug[s]?.parent && p.categories.includes(s));
  if (subs.length) return catBySlug[subs[0]];
  const top = tree.find((t) => p.categories.includes(t.slug));
  if (top) return top;
  const col = collections.find((c) => p.categories.includes(c.slug));
  return col || null;
}
function related(p, n) {
  const pc = primaryCat(p);
  if (!pc) return products.filter((x) => x.id !== p.id && x.available).slice(0, n);
  const pool = (slug) => products.filter((x) => x.id !== p.id && x.available && x.categories.includes(slug));
  let out = pool(pc.slug);
  if (out.length < n && pc.parent) out = [...out, ...pool(pc.parent).filter((x) => !out.includes(x))];
  // deterministic variety: rotate by product id
  const start = out.length ? p.id % out.length : 0;
  return [...out.slice(start), ...out.slice(0, start)].slice(0, n);
}

// Assets — every URL carries a content hash (?v=…), so a new deploy never mixes
// stale and fresh files. HTML itself can't be versioned on GitHub Pages (max-age=600),
// so pages also carry data-build and main.js checks /version.json (see fresh.js).
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
const md5 = (...parts) => { const h = crypto.createHash('md5'); parts.forEach((x) => h.update(x)); return h.digest('hex').slice(0, 10); };
const cssFiles = fs.readdirSync(path.join(ROOT, 'src/css')).filter((f) => f.endsWith('.css')).sort();
const css = cssFiles.map((f) => `/* ${f} */\n` + fs.readFileSync(path.join(ROOT, 'src/css', f), 'utf8')).join('\n');
fs.mkdirSync(path.join(DIST, 'assets/css'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'assets/css/site.css'), css);
const cssV = md5(css);
// JS: per-module hash = own source + hashes of the modules it imports (so a change in a
// dependency re-versions every importer up to main.js).
const jsDir = path.join(ROOT, 'src/js');
const jsSrc = Object.fromEntries(fs.readdirSync(jsDir).filter((f) => f.endsWith('.js')).map((f) => [f, fs.readFileSync(path.join(jsDir, f), 'utf8')]));
const IMPORT_RE = /(from '|import\(')\.\/([\w-]+\.js)'/g;
const jsV = {};
const jsHash = (f, seen = new Set()) => {
  if (jsV[f]) return jsV[f];
  if (seen.has(f)) return md5(jsSrc[f]); // cycle guard
  seen.add(f);
  const deps = [...jsSrc[f].matchAll(IMPORT_RE)].map((m) => m[2]).sort();
  return (jsV[f] = md5(jsSrc[f], ...deps.map((d) => jsHash(d, seen))));
};
Object.keys(jsSrc).forEach((f) => jsHash(f));
fs.mkdirSync(path.join(DIST, 'assets/js'), { recursive: true });
for (const [f, src] of Object.entries(jsSrc)) fs.writeFileSync(path.join(DIST, 'assets/js', f), src.replace(IMPORT_RE, (_, pre, dep) => `${pre}./${dep}?v=${jsV[dep]}'`));
fs.cpSync(path.join(ROOT, 'assets/img'), path.join(DIST, 'assets/img'), { recursive: true });
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
// Static images (brand, nav thumbnails) get a per-file hash; product images already use
// immutable keys derived from their source URL.
const imgV = {};
const imgHash = (rel) => (imgV[rel] ??= fs.existsSync(path.join(ROOT, rel)) ? md5(fs.readFileSync(path.join(ROOT, rel))) : null);
const versionImgs = (html) => html.replace(/(assets\/img\/(?:brand|nav)\/[\w.-]+\.(?:webp|png|jpe?g|svg|ico))(?![?\w])/g, (m) => (imgHash(m) ? `${m}?v=${imgHash(m)}` : m));

// Client catalog
const subsOf = Object.fromEntries([...tree.map((t) => [t.slug, t.children.map((c) => c.slug)]), ['', tree.map((t) => t.slug)]]);
// Categories ship with a size rank (r: 0 = largest) for ordering suggestions — no counts.
const allCats = [...tree.flatMap((t) => [t, ...t.children]), ...collections];
const sizeRank = Object.fromEntries(allCats.slice().sort(byCount).map((c, i) => [c.slug, i]));
const catalogJson = {
  categories: allCats.map((c) => ({ r: sizeRank[c.slug], slug: c.slug, name: c.name, parent: c.parent || null, t: !!collections.find((x) => x.slug === c.slug), i: versionImgs(`assets/img/nav/${c.slug}.webp`) })),
  tops: tree.map((t) => t.slug), subsOf,
  items: products.map(record),
};
fs.mkdirSync(path.join(DIST, 'data'), { recursive: true });
const catalogStr = JSON.stringify(catalogJson);
fs.writeFileSync(path.join(DIST, 'data/catalog.json'), catalogStr);
const catalogV = md5(catalogStr);
// Build id: hash of every input (data, templates, sources, images list, base URL).
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const inputs = [...walk(path.join(ROOT, 'data')), ...walk(path.join(ROOT, 'build')), ...walk(path.join(ROOT, 'src'))].sort();
const buildV = md5(site.base_url, ...inputs.map((f) => fs.readFileSync(f)), String(fs.readdirSync(path.join(ROOT, 'assets/img/products')).length));
fs.writeFileSync(path.join(DIST, 'version.json'), JSON.stringify({ v: buildV }));

// Pages
const assetV = { css: cssV, main: jsV['main.js'], catalog: catalogV, build: buildV };
const baseCtx = { site, products, tree, collections, catBySlug, byHandle, record, fit, primaryCat, related, assetV, nav, saleCountAll, isLow, LOW };
const write = (rel, html) => { const p = path.join(DIST, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, rel.endsWith('.html') ? versionImgs(html) : html); };
const ctxAt = (depth) => {
  const root = depth === 'abs' ? new URL(site.base_url).pathname : '../'.repeat(depth);
  return { ...baseCtx, root, abs: (href) => site.base_url + String(href).replace(/^(\.\.\/)+/, '').replace(new RegExp('^' + new URL(site.base_url).pathname), '') };
};

write('index.html', home(ctxAt(0)));
write('productos/index.html', catalog(ctxAt(1), { type: 'all', slug: '', name: 'Todos los productos', items: products }));
for (const c of [...tree, ...tree.flatMap((t) => t.children.map((ch) => catBySlug[ch.slug])), ...collections]) {
  const isCol = collections.includes(c);
  write(`categorias/${c.slug}/index.html`, catalog(ctxAt(2), { type: isCol ? 'collection' : 'category', slug: c.slug, name: c.name, parent: c.parent, children: c.children || [], items: products.filter((p) => p.categories.includes(c.slug)) }));
}
for (const p of products) write(`productos/${p.handle}/index.html`, product(ctxAt(2), p));
write('categorias/index.html', hubPage(ctxAt(1)));
write('envios-y-devoluciones/index.html', shippingPage(ctxAt(1)));
write('preguntas-frecuentes/index.html', faqPage(ctxAt(1)));
write('contacto/index.html', contactPage(ctxAt(1)));
write('terminos-y-condiciones/index.html', termsPage(ctxAt(1), policies.terminos));
write('404.html', notFound(ctxAt('abs')));

// sitemap (informational; pages are noindex)
const urls = ['', 'productos/', 'categorias/', ...Object.keys(catBySlug).map((s) => `categorias/${s}/`), ...products.map((p) => `productos/${p.handle}/`), 'envios-y-devoluciones/', 'preguntas-frecuentes/', 'contacto/', 'terminos-y-condiciones/'];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${site.base_url}${u}</loc></url>`).join('')}</urlset>`);
write('robots.txt', 'User-agent: *\nDisallow: /\n');
const lowN = products.filter(isLow).length, inStock = products.filter((p) => p.available).length;
console.log(`Built ${products.length} products, ${Object.keys(catBySlug).length} category pages → dist/ (build ${buildV}, css ${cssV}, main ${jsV['main.js']}, catalog ${catalogV}) · low-stock ≤${LOW}: ${lowN}/${inStock} in stock (${(lowN / inStock * 100).toFixed(1)}%)`);
