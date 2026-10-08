// Instant search overlay (client-side, accent-insensitive): matching categories
// first, then products. Idle state shows suggested searches.
import { getCatalog } from './catalog-data.js';
import { money, norm, esc } from './format.js';
import { openLayer } from './ui.js';

const root = document.documentElement.dataset.root || '';

export function rank(items, q) {
  const terms = norm(q).split(' ').filter(Boolean);
  if (!terms.length) return [];
  const out = [];
  for (const p of items) {
    const hay = p._q;
    if (!terms.every((t) => hay.includes(t))) continue;
    const name = p._n;
    let s = 0;
    if (name.startsWith(terms[0])) s += 5;
    terms.forEach((t) => { if (name.includes(' ' + t) || name.startsWith(t)) s += 2; if (name.includes(t)) s += 1; });
    if (p.a) s += 1.5;
    out.push([s, p]);
  }
  return out.sort((a, b) => b[0] - a[0] || a[1].r - b[1].r).map((x) => x[1]);
}

// Highlight matched terms in a (plain) label
function mark(label, q) {
  const terms = norm(q).split(' ').filter((t) => t.length > 1);
  if (!terms.length) return esc(label);
  const n = norm(label);
  const hits = new Array(label.length).fill(false);
  // norm() keeps length for Latin text (accents stripped 1:1), so indexes line up
  if (n.length === label.length) terms.forEach((t) => { let i = n.indexOf(t); while (i > -1) { for (let k = i; k < i + t.length; k++) hits[k] = true; i = n.indexOf(t, i + 1); } });
  let out = '', open = false;
  for (let i = 0; i < label.length; i++) {
    if (hits[i] && !open) { out += '<mark>'; open = true; }
    if (!hits[i] && open) { out += '</mark>'; open = false; }
    out += esc(label[i]);
  }
  return out + (open ? '</mark>' : '');
}

export function initSearch() {
  const el = document.getElementById('search');
  if (!el) return;
  const input = el.querySelector('input[type="search"]');
  const q$ = (s) => el.querySelector(s);
  const results = q$('[data-search-results]'), idle = q$('[data-search-idle]'), more = q$('[data-search-more]');
  const catsWrap = q$('[data-search-cats-wrap]'), cats = q$('[data-search-cats]'), prodsWrap = q$('[data-search-prods-wrap]');
  const prodsLabel = q$('[data-search-prods-label]'), empty = q$('[data-search-empty]'), clear = q$('[data-search-clear]');
  let hydrated = false;
  document.querySelectorAll('[data-open-search]').forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault();
    if (!hydrated) { el.querySelectorAll('img[data-src]').forEach((im) => { im.src = im.dataset.src; im.removeAttribute('data-src'); }); hydrated = true; }
    openLayer(el, b); getCatalog();
  }));
  clear.addEventListener('click', () => { input.value = ''; run(); input.focus(); });
  let t;
  input.addEventListener('input', () => { clear.hidden = !input.value; clearTimeout(t); t = setTimeout(run, 90); });
  async function run() {
    const q = input.value.trim();
    if (!q) { idle.hidden = false; catsWrap.hidden = prodsWrap.hidden = empty.hidden = more.hidden = true; return; }
    const data = await getCatalog();
    const nq = norm(q);
    const terms = nq.split(' ').filter(Boolean);
    const catHits = data.categories.filter((c) => terms.every((tm) => norm(c.name).includes(tm)))
      .sort((a, b) => (norm(b.name).startsWith(nq) - norm(a.name).startsWith(nq)) || a.r - b.r).slice(0, 4);
    const hits = rank(data.items, q);
    idle.hidden = true;
    catsWrap.hidden = !catHits.length;
    cats.innerHTML = catHits.map((c) => {
      const parent = c.parent ? data.catNames[c.parent] : (c.t ? 'Colección' : 'Categoría');
      return `<li><a class="search-cat" href="${root}categorias/${c.slug}/"><img src="${root}${c.i || `assets/img/nav/${c.slug}.webp`}" alt="" width="56" height="56" loading="lazy"><span><span class="search-cat__name">${mark(c.name, q)}</span><span class="search-cat__n">${esc(parent)}</span></span></a></li>`;
    }).join('');
    prodsWrap.hidden = !hits.length;
    results.innerHTML = hits.slice(0, 8).map((p) => `<li><a class="search-hit" href="${root}productos/${p.h}/">${p.m?.[0] ? `<img src="${root}assets/img/products/${p.m[0]}-480.webp" alt="" width="56" height="72" loading="lazy">` : '<span class="search-hit__ph"></span>'}<span><span class="search-hit__name">${mark(p.n, q)}</span><span class="search-hit__price">${p.x > p.p ? 'Desde ' : ''}${money(p.p)}${p.c > p.p ? ` <s>${money(p.c)}</s>` : ''}${p.a ? '' : ' · Sin stock'}</span></span></a></li>`).join('');
    empty.hidden = !!(hits.length || catHits.length);
    empty.textContent = `Nada por acá con “${q}”. Probá con otra palabra.`;
    more.hidden = !hits.length;
    more.href = `${root}productos/?q=${encodeURIComponent(q)}`;
    more.textContent = 'Ver todos los resultados';
  }
}
