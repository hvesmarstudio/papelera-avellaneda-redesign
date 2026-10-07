// Product detail page: gallery, variant selection, quantity, add to cart.
import { money, installment, pct } from './format.js';
import { addToCart } from './cart-drawer.js';

const cfg = window.__SITE__ || {};

export function initProduct() {
  const dataEl = document.getElementById('product-data');
  if (!dataEl) return;
  const P = JSON.parse(dataEl.textContent);
  const $ = (s) => document.querySelector(s);

  // ---- Gallery
  const main = $('[data-gallery]');
  const slides = main ? [...main.querySelectorAll('.gallery__slide')] : [];
  const thumbs = [...document.querySelectorAll('[data-thumb]')];
  const dots = [...document.querySelectorAll('[data-dot]')];
  let current = 0;
  function setActive(i) {
    current = i;
    thumbs.forEach((t, j) => t.setAttribute('aria-current', String(j === i)));
    dots.forEach((t, j) => t.setAttribute('aria-current', String(j === i)));
  }
  function goTo(i, smooth = true) {
    if (!main || !slides[i]) return;
    main.scrollTo({ left: slides[i].offsetLeft, behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
    setActive(i);
  }
  if (main) {
    let raf;
    main.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setActive(Math.round(main.scrollLeft / main.clientWidth))); }, { passive: true });
    thumbs.forEach((t, i) => t.addEventListener('click', () => goTo(i)));
    dots.forEach((t, i) => t.addEventListener('click', () => goTo(i)));
    $('[data-gallery-prev]')?.addEventListener('click', () => goTo((current - 1 + slides.length) % slides.length));
    $('[data-gallery-next]')?.addEventListener('click', () => goTo((current + 1) % slides.length));
    main.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') goTo(Math.min(current + 1, slides.length - 1)); if (e.key === 'ArrowLeft') goTo(Math.max(current - 1, 0)); });
  }

  // ---- Variants
  const sel = [];
  const firstAvail = P.variants.find((v) => v.a) || P.variants[0];
  (firstAvail?.o || []).forEach((v, i) => (sel[i] = v));
  const groups = [...document.querySelectorAll('[data-option]')];
  const priceNow = $('[data-price-now]'), priceWas = $('[data-price-was]'), saleBadge = $('[data-sale-badge]');
  const instEl = $('[data-installments]'), stockEl = $('[data-stock]'), atc = $('[data-atc]');
  const stickyPrice = $('[data-sticky-price]'), stickyBtn = $('[data-sticky-atc]');
  const qtyInput = $('[data-qty-input]');
  const selLabels = groups.map((g) => g.querySelector('[data-selected]'));

  const match = (vals) => P.variants.find((v) => v.o.every((o, i) => o === vals[i]));
  function variant() { return P.variants.length === 1 ? P.variants[0] : match(sel); }

  function update(fromUser) {
    const v = variant();
    groups.forEach((g, gi) => {
      g.querySelectorAll('.option__btn').forEach((b) => {
        const val = b.dataset.value;
        b.setAttribute('aria-pressed', String(sel[gi] === val));
        const test = sel.slice(); test[gi] = val;
        const mv = match(test);
        const ok = mv && mv.a;
        b.classList.toggle('is-unavailable', !ok);
        b.setAttribute('aria-label', `${val}${ok ? '' : ' (sin stock)'}`);
      });
      if (selLabels[gi]) selLabels[gi].textContent = sel[gi] || '';
    });
    const available = !!(v && v.a);
    if (v) {
      const off = pct(v.p, v.c);
      priceNow.textContent = money(v.p);
      priceNow.classList.toggle('price__now--sale', !!off);
      if (priceWas) { priceWas.hidden = !off; priceWas.querySelector('[data-was]').textContent = off ? money(v.c) : ''; }
      if (saleBadge) { saleBadge.hidden = !off; saleBadge.textContent = off ? `−${off}%` : ''; }
      if (instEl) instEl.textContent = installment(v.p, cfg.installments || 3);
      if (stickyPrice) stickyPrice.textContent = money(v.p);
      if (qtyInput) { if (v.s != null && v.s > 0) qtyInput.max = v.s; else qtyInput.removeAttribute('max'); if (v.s && +qtyInput.value > v.s) qtyInput.value = v.s; }
      if (fromUser && v.img) { const idx = P.images.indexOf(v.img); if (idx > -1) goTo(idx); }
    }
    if (stockEl) {
      stockEl.classList.remove('is-low', 'is-out');
      if (!v) { stockEl.textContent = 'Elegí una opción disponible'; stockEl.classList.add('is-out'); }
      else if (!available) { stockEl.textContent = 'Sin stock en esta opción'; stockEl.classList.add('is-out'); }
      else if (v.s != null && v.s > 0 && v.s <= 3) { stockEl.textContent = `¡Últimas ${v.s} unidades!`; stockEl.classList.add('is-low'); }
      else stockEl.textContent = 'En stock · listo para enviar';
    }
    [atc, stickyBtn].forEach((b) => { if (!b) return; b.disabled = !available; b.querySelector('[data-atc-label]').textContent = available ? 'Agregar al carrito' : 'Sin stock'; });
  }
  groups.forEach((g, gi) => g.addEventListener('click', (e) => {
    const b = e.target.closest('.option__btn'); if (!b) return;
    sel[gi] = b.dataset.value;
    // if the combination doesn't exist, pick the first available variant with this value
    if (!match(sel)) { const alt = P.variants.find((v) => v.o[gi] === sel[gi] && v.a) || P.variants.find((v) => v.o[gi] === sel[gi]); if (alt) alt.o.forEach((o, i) => (sel[i] = o)); }
    update(true);
  }));

  // ---- Quantity
  const step = (d) => { const max = qtyInput.max ? +qtyInput.max : Infinity; qtyInput.value = Math.min(max, Math.max(1, (+qtyInput.value || 1) + d)); };
  $('[data-qty-dec]')?.addEventListener('click', () => step(-1));
  $('[data-qty-inc]')?.addEventListener('click', () => step(1));
  qtyInput?.addEventListener('change', () => step(0));

  // ---- Add to cart
  function add() {
    const v = variant(); if (!v || !v.a) return;
    const vl = P.options.length ? v.o.map((o, i) => `${P.options[i]}: ${o}`).join(' · ') : '';
    addToCart({ vid: v.id, pid: P.id, h: P.h, n: P.n, vl, p: v.p, img: v.img || P.images[0] || null, max: v.s ?? null }, +qtyInput?.value || 1);
  }
  atc?.addEventListener('click', add);
  stickyBtn?.addEventListener('click', add);

  // ---- Sticky ATC on mobile when the main button scrolls out of view
  const sticky = $('.sticky-atc');
  if (sticky && atc && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      const show = !en.isIntersecting && en.boundingClientRect.top < 0;
      sticky.classList.toggle('is-visible', show);
      document.body.classList.toggle('has-sticky-atc', show);
    }).observe(atc);
  }
  update(false);
}
