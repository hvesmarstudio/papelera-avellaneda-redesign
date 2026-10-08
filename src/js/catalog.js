// Catalog page: filtering, sorting, "ver más" pagination, URL state.
import { getCatalog } from './catalog-data.js';
import { renderCard } from './card.js';
import { rank } from './search.js';
import { money, esc } from './format.js';
import { icon } from './icons.js';
import { openLayer } from './ui.js';

const PAGE = 24;
const root = document.documentElement.dataset.root || '';
const cfg = window.__SITE__ || {};

export async function initCatalog() {
  const host = document.querySelector('[data-catalog]');
  if (!host) return;
  const scopeType = host.dataset.scopeType;
  const scope = host.dataset.scope;
  const grid = host.querySelector('[data-grid]');
  const moreWrap = host.querySelector('[data-more]');
  const moreBtn = host.querySelector('[data-more-btn]');
  const moreBar = host.querySelector('[data-more-bar]');
  const empty = host.querySelector('[data-empty]');
  const active = host.querySelector('[data-active]');
  const sortSel = document.getElementById('sort');
  const filters = document.getElementById('filters');
  const aside = host.querySelector('.catalog__aside');
  const drawer = document.getElementById('filters-drawer');
  const drawerBody = drawer?.querySelector('.drawer__body');
  const title = document.querySelector('[data-page-title]');
  const defaultTitle = title?.textContent;

  // Mobile: move the same filter DOM into the drawer (no duplication)
  const mq = matchMedia('(min-width: 1024px)');
  const place = () => { if (mq.matches) aside.appendChild(filters); else drawerBody.appendChild(filters); };
  place(); mq.addEventListener('change', place);
  document.querySelectorAll('[data-open-filters]').forEach((b) => b.addEventListener('click', () => openLayer(drawer, b)));

  const params = new URLSearchParams(location.search);
  const state = {
    q: params.get('q') || '',
    sub: (params.get('sub') || '').split(',').filter(Boolean),
    min: params.get('min') ? Number(params.get('min')) : null,
    max: params.get('max') ? Number(params.get('max')) : null,
    stock: params.get('stock') === '1',
    sale: params.get('oferta') === '1',
    low: params.get('ultimas') === '1',
    sort: params.get('orden') || 'destacados',
    shown: PAGE,
  };
  const hadParams = [...params.keys()].length > 0;

  const data = await getCatalog();
  const base = data.items.filter((p) => scopeType === 'all' || (p.k || []).includes(scope));

  // reflect state into controls
  function syncControls() {
    filters.querySelectorAll('input[name="sub"]').forEach((i) => (i.checked = state.sub.includes(i.value)));
    const mn = filters.querySelector('input[name="min"]'), mx = filters.querySelector('input[name="max"]');
    if (mn) mn.value = state.min ?? '';
    if (mx) mx.value = state.max ?? '';
    const st = filters.querySelector('input[name="stock"]'); if (st) st.checked = state.stock;
    const sa = filters.querySelector('input[name="sale"]'); if (sa) sa.checked = state.sale;
    const lo = filters.querySelector('input[name="low"]'); if (lo) lo.checked = state.low;
    if (sortSel) sortSel.value = state.sort;
    filters.querySelectorAll('[data-preset]').forEach((b) => b.classList.toggle('is-active', String(state.min ?? '') === (b.dataset.min || '') && String(state.max ?? '') === (b.dataset.max || '')));
    // Active-filter badge on the Filtrar button
    const nActive = state.sub.length + (state.min != null || state.max != null ? 1 : 0) + (state.stock ? 1 : 0) + (state.sale ? 1 : 0) + (state.low ? 1 : 0);
    document.querySelectorAll('[data-filter-badge]').forEach((el) => { el.hidden = !nActive; el.textContent = nActive; });
  }

  function compute() {
    let list = state.q ? rank(base, state.q) : base.slice();
    if (state.sub.length) list = list.filter((p) => state.sub.some((s) => (p.k || []).includes(s)));
    if (state.min != null) list = list.filter((p) => p.p >= state.min);
    if (state.max != null) list = list.filter((p) => p.p <= state.max);
    if (state.stock) list = list.filter((p) => p.a);
    if (state.sale) list = list.filter((p) => p.c && p.c > p.p);
    if (state.low) list = list.filter((p) => p.a && p.l);
    const by = {
      'precio-asc': (a, b) => a.p - b.p,
      'precio-desc': (a, b) => b.p - a.p,
      'az': (a, b) => a.n.localeCompare(b.n, 'es'),
      'za': (a, b) => b.n.localeCompare(a.n, 'es'),
      'destacados': state.q ? null : (a, b) => (b.a - a.a) || a.r - b.r,
    }[state.sort];
    if (by) list.sort(by);
    return list;
  }

  function writeURL() {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.sub.length) p.set('sub', state.sub.join(','));
    if (state.min != null) p.set('min', state.min);
    if (state.max != null) p.set('max', state.max);
    if (state.stock) p.set('stock', '1');
    if (state.sale) p.set('oferta', '1');
    if (state.low) p.set('ultimas', '1');
    if (state.sort !== 'destacados') p.set('orden', state.sort);
    const s = p.toString();
    history.replaceState(null, '', s ? `?${s}` : location.pathname);
  }

  function chips() {
    const c = [];
    const subName = (s) => data.catNames[s] || s;
    if (state.q) c.push(['q', `“${esc(state.q)}”`]);
    state.sub.forEach((s) => c.push(['sub:' + s, esc(subName(s))]));
    if (state.min != null || state.max != null) c.push(['price', `${state.min != null ? money(state.min) : '$0'} – ${state.max != null ? money(state.max) : 'más'}`]);
    if (state.stock) c.push(['stock', 'Con stock']);
    if (state.sale) c.push(['sale', 'En oferta']);
    if (state.low) c.push(['low', 'Últimas unidades']);
    active.innerHTML = c.map(([k, l]) => `<button type="button" class="chip" data-chip="${k}" aria-label="Quitar filtro ${l.replace(/<[^>]+>/g, '')}">${l} ${icon('close')}</button>`).join('') + (c.length > 1 ? '<button type="button" class="chip chip--clear" data-chip="all">Limpiar todo</button>' : '');
  }

  let list = [];
  function render({ append = false } = {}) {
    list = compute();
    const n = list.length;
    if (title) title.textContent = state.q ? `Resultados para “${state.q}”` : defaultTitle;
    const from = append ? grid.children.length : 0;
    const slice = list.slice(from, state.shown);
    const html = slice.map((p, i) => renderCard(p, { root, installments: cfg.installments, eager: !append && i < 4, catLabel: cardLabel(p) })).join('');
    if (append) grid.insertAdjacentHTML('beforeend', html); else grid.innerHTML = html;
    empty.hidden = n > 0;
    const shown = Math.min(state.shown, n);
    moreWrap.hidden = n === 0;
    moreBar.style.width = n ? `${(shown / n) * 100}%` : '0';
    moreBtn.hidden = shown >= n;
    chips();
    syncControls();
  }
  function cardLabel(p) {
    // show the most specific category relevant to this page
    const k = (p.k || []).filter((s) => data.subsOf[scope]?.includes(s) || (scopeType === 'all' && data.tops.includes(s)));
    if (k.length) return data.catNames[k[0]];
    const any = (p.k || []).find((s) => s !== scope);
    return any ? data.catNames[any] : '';
  }
  function update() { state.shown = PAGE; writeURL(); render(); }

  filters.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'sub') state.sub = [...filters.querySelectorAll('input[name="sub"]:checked')].map((i) => i.value);
    if (t.name === 'stock') state.stock = t.checked;
    if (t.name === 'sale') state.sale = t.checked;
    if (t.name === 'low') state.low = t.checked;
    if (t.name === 'min' || t.name === 'max') {
      const v = t.value === '' ? null : Math.max(0, Number(t.value));
      state[t.name] = isNaN(v) ? null : v;
    }
    update();
  });
  filters.addEventListener('click', (e) => {
    const b = e.target.closest('[data-preset]');
    if (!b) return;
    const same = b.classList.contains('is-active');
    state.min = same || !b.dataset.min ? null : Number(b.dataset.min);
    state.max = same || !b.dataset.max ? null : Number(b.dataset.max);
    update();
  });
  sortSel?.addEventListener('change', () => { state.sort = sortSel.value; update(); });
  active.addEventListener('click', (e) => {
    const b = e.target.closest('[data-chip]');
    if (!b) return;
    const k = b.dataset.chip;
    if (k === 'all') { state.q = ''; state.sub = []; state.min = state.max = null; state.stock = state.sale = state.low = false; }
    else if (k === 'q') state.q = '';
    else if (k.startsWith('sub:')) state.sub = state.sub.filter((s) => s !== k.slice(4));
    else if (k === 'price') state.min = state.max = null;
    else if (k === 'stock') state.stock = false;
    else if (k === 'sale') state.sale = false;
    else if (k === 'low') state.low = false;
    update();
  });
  moreBtn.addEventListener('click', () => {
    const before = grid.children.length;
    state.shown += PAGE; render({ append: true });
    grid.children[before]?.querySelector('a')?.focus({ preventScroll: true });
  });
  document.querySelectorAll('[data-reset-filters]').forEach((b) => b.addEventListener('click', () => { state.q = ''; state.sub = []; state.min = state.max = null; state.stock = state.sale = state.low = false; update(); }));

  // Initial: pre-rendered markup matches the default state; re-render only if needed
  if (hadParams) render(); else { list = compute(); syncControls(); }

  // Back/forward from a product: restore "ver más" depth and scroll position
  const KEY = 'pelpa:cat:' + location.pathname;
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ shown: state.shown, y: scrollY, qs: location.search })); } catch {} };
  addEventListener('pagehide', save);
  grid.addEventListener('click', (e) => { if (e.target.closest('a')) save(); });
  const navEntry = performance.getEntriesByType?.('navigation')?.[0];
  if (navEntry?.type === 'back_forward') {
    let saved = null; try { saved = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch {}
    if (saved && saved.qs === location.search) {
      if (saved.shown > PAGE) { state.shown = saved.shown; render(); }
      requestAnimationFrame(() => scrollTo({ top: saved.y, behavior: 'instant' }));
    }
  }
}
