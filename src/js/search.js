// Instant search overlay (client-side, accent-insensitive)
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

export function initSearch() {
  const el = document.getElementById('search');
  if (!el) return;
  const input = el.querySelector('input[type="search"]');
  const results = el.querySelector('[data-search-results]');
  const idle = el.querySelector('[data-search-idle]');
  const more = el.querySelector('[data-search-more]');
  document.querySelectorAll('[data-open-search]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); openLayer(el, b); getCatalog(); }));
  let t;
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 110); });
  async function run() {
    const q = input.value.trim();
    if (!q) { results.innerHTML = ''; idle.hidden = false; more.hidden = true; return; }
    const { items } = await getCatalog();
    const hits = rank(items, q);
    idle.hidden = true;
    if (!hits.length) { results.innerHTML = `<li class="search__empty">No encontramos productos para “${esc(q)}”. Probá con otra palabra o explorá las categorías.</li>`; more.hidden = true; return; }
    results.innerHTML = hits.slice(0, 8).map((p) => `<li><a class="search-hit" href="${root}productos/${p.h}/">${p.m?.[0] ? `<img src="${root}assets/img/products/${p.m[0]}-480.webp" alt="" width="56" height="72" loading="lazy">` : ''}<span><span class="search-hit__name">${esc(p.n)}</span><span class="search-hit__price">${p.x > p.p ? 'Desde ' : ''}${money(p.p)}${p.a ? '' : ' · Sin stock'}</span></span></a></li>`).join('');
    more.hidden = false;
    more.href = `${root}productos/?q=${encodeURIComponent(q)}`;
    more.textContent = `Ver los ${hits.length} resultados`;
  }
}
