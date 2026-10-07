// Static site generator — no dependencies. `node build/build.mjs` → dist/
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { home, catalog, product, shippingPage, faqPage, contactPage, termsPage, notFound } from './pages.mjs';

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
const cats = data.categories.map((c) => ({ ...c, count: countOf(c.slug) }));
const tree = cats.filter((c) => !c.parent).map((t) => ({ ...t, children: cats.filter((c) => c.parent === t.slug) }));
const collections = data.collections.map((c) => ({ ...c, count: countOf(c.slug), children: [] }));
const catBySlug = {};
tree.forEach((t) => { catBySlug[t.slug] = t; t.children.forEach((c) => (catBySlug[c.slug] = { ...c, children: [] })); });
collections.forEach((c) => (catBySlug[c.slug] = c));

const fit = (im) => { const r = im.h / im.w; return r >= 1.2 && r <= 1.62 ? 'v' : 'c'; };
function record(p) {
  const single = p.variants.length === 1 ? p.variants[0] : null;
  return {
    i: p.id, h: p.handle, n: p.display_name, p: p.price, x: p.price_max !== p.price ? p.price_max : undefined,
    c: p.compare_at_price || undefined, a: p.available ? 1 : 0, k: p.categories,
    m: p.images.slice(0, 2).map((i) => i.key), f: p.images.slice(0, 2).map(fit).join(''),
    v: single && single.available ? single.id : 0, vl: p.variants.length, s: single ? single.stock : undefined, r: p.rank,
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

// Assets
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
const cssFiles = fs.readdirSync(path.join(ROOT, 'src/css')).filter((f) => f.endsWith('.css')).sort();
const css = cssFiles.map((f) => `/* ${f} */\n` + fs.readFileSync(path.join(ROOT, 'src/css', f), 'utf8')).join('\n');
const jsDir = path.join(ROOT, 'src/js');
const hash = crypto.createHash('md5').update(css);
fs.readdirSync(jsDir).sort().forEach((f) => hash.update(fs.readFileSync(path.join(jsDir, f))));
const assetV = hash.digest('hex').slice(0, 8);
fs.mkdirSync(path.join(DIST, 'assets/css'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'assets/css/site.css'), css);
fs.cpSync(jsDir, path.join(DIST, 'assets/js'), { recursive: true });
fs.cpSync(path.join(ROOT, 'assets/img'), path.join(DIST, 'assets/img'), { recursive: true });
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
// Cache-bust module imports inside JS (relative imports carry the version too)
for (const f of fs.readdirSync(path.join(DIST, 'assets/js'))) {
  const p = path.join(DIST, 'assets/js', f);
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/from '(\.\/[\w-]+\.js)'/g, `from '$1?v=${assetV}'`).replace(/import\('(\.\/[\w-]+\.js)'\)/g, `import('$1?v=${assetV}')`));
}

// Client catalog
const subsOf = Object.fromEntries([...tree.map((t) => [t.slug, t.children.map((c) => c.slug)]), ['', tree.map((t) => t.slug)]]);
const catalogJson = {
  categories: [...cats, ...collections].map((c) => ({ slug: c.slug, name: c.name, parent: c.parent || null })),
  tops: tree.map((t) => t.slug), subsOf,
  items: products.map(record),
};
fs.mkdirSync(path.join(DIST, 'data'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'data/catalog.json'), JSON.stringify(catalogJson));

// Pages
const baseCtx = { site, products, tree, collections, catBySlug, byHandle, record, fit, primaryCat, related, assetV };
const write = (rel, html) => { const p = path.join(DIST, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, html); };
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
write('envios-y-devoluciones/index.html', shippingPage(ctxAt(1)));
write('preguntas-frecuentes/index.html', faqPage(ctxAt(1)));
write('contacto/index.html', contactPage(ctxAt(1)));
write('terminos-y-condiciones/index.html', termsPage(ctxAt(1), policies.terminos));
write('404.html', notFound(ctxAt('abs')));

// sitemap (informational; pages are noindex)
const urls = ['', 'productos/', ...Object.keys(catBySlug).map((s) => `categorias/${s}/`), ...products.map((p) => `productos/${p.handle}/`), 'envios-y-devoluciones/', 'preguntas-frecuentes/', 'contacto/', 'terminos-y-condiciones/'];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${site.base_url}${u}</loc></url>`).join('')}</urlset>`);
write('robots.txt', 'User-agent: *\nDisallow: /\n');
console.log(`Built ${products.length} products, ${Object.keys(catBySlug).length} category pages → dist/ (v${assetV})`);
