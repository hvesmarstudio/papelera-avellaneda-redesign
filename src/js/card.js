// Product card component — the single source of truth for card markup, used both
// by the static build (pre-rendered grids) and by the client (catalog, search).
import { icon } from './icons.js';
import { money, installment, esc, pct } from './format.js';

export const IMG_SIZES = '(min-width: 1200px) 22vw, (min-width: 768px) 30vw, 46vw';
export function imgSrc(root, key, w = 480) { return `${root}assets/img/products/${key}-${w}.webp`; }

/**
 * @param {object} p compact product record (see build: toCatalogRecord)
 * @param {object} o { root, installments, eager, catLabel }
 */
export function renderCard(p, o) {
  const root = o.root || '';
  const url = `${root}productos/${p.h}/`;
  const name = esc(p.n);
  const off = pct(p.p, p.c);
  const [k1, k2] = p.m || [];
  const [f1, f2] = (p.f || '').split('');
  const loading = o.eager ? 'eager' : 'lazy';
  // The secondary (hover) image is only fetched on first hover (see main.js) to save bandwidth.
  const img = (k, fit, cls, alt, lazyHover) => {
    if (!k) return '';
    const a = lazyHover ? 'data-' : '';
    return `<img class="${cls}${fit === 'c' ? ' fit-contain' : ''}" ${a}src="${imgSrc(root, k)}" ${a}srcset="${imgSrc(root, k)} 480w, ${imgSrc(root, k, 960)} 960w" sizes="${IMG_SIZES}" alt="${alt}" loading="${loading}" decoding="async" width="480" height="672">`;
  };
  const badges = [
    !p.a ? '<span class="badge badge--soldout">Sin stock</span>' : '',
    p.a && off ? `<span class="badge badge--sale">−${off}%</span>` : '',
    // real low stock (see build: isLow) — never shown for untracked stock, never a number
    p.a && p.l ? '<span class="badge badge--low">Últimas unidades</span>' : '',
  ].join('');
  let quick = '';
  if (p.a && p.v) quick = `<button type="button" class="card__quick" data-quick-add="${esc(JSON.stringify({ vid: p.v, pid: p.i, h: p.h, n: p.n, vl: '', p: p.p, img: k1 || null, max: p.s ?? null }))}" aria-label="Agregar ${name} al carrito">${icon('bagPlus')}</button>`;
  else if (p.a && p.vl > 1) quick = `<a class="card__quick" href="${url}" aria-label="Elegir opciones de ${name}" tabindex="-1">${icon('arrowRight')}</a>`;
  const from = p.x && p.x > p.p ? '<span class="price__from">Desde</span>' : '';
  const inst = o.installments && p.a ? `<p class="card__inst">${o.installments} cuotas sin interés de ${installment(p.p, o.installments)}</p>` : '';
  const opts = p.vl > 1 ? '<p class="card__swatches">Varias opciones</p>' : '';
  return `<article class="card${p.a ? '' : ' is-soldout'}${k2 ? ' has-2' : ''}">
<div class="card__visual"><div class="card__media">${img(k1, f1, 'card__img-1', name)}${img(k2, f2, 'card__img-2', '', true)}</div>
<div class="card__badges">${badges}</div>${quick}</div>
<div class="card__body">${o.catLabel ? `<p class="card__cat">${esc(o.catLabel)}</p>` : ''}
<h3 class="card__title"><a href="${url}">${name}</a></h3>
<div class="price">${from}<span class="price__now${off && p.a ? ' price__now--sale' : ''}">${money(p.p)}</span>${off ? `<span class="price__was"><span class="sr-only">Precio anterior: </span>${money(p.c)}</span>` : ''}</div>
${inst}${opts}</div></article>`;
}
