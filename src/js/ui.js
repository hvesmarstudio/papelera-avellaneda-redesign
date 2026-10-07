// Generic UI behaviours: layers (drawers/modals) with focus trap, accordions,
// header, menus, announcement rotation, reveal-on-scroll, toast.
import { icon } from './icons.js';

const stack = [];
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function openLayer(el, opener) {
  if (!el || el.classList.contains('is-open')) return;
  el.hidden = false;
  el._opener = opener || document.activeElement;
  requestAnimationFrame(() => el.classList.add('is-open'));
  el.setAttribute('aria-hidden', 'false');
  stack.push(el);
  document.body.classList.add('is-locked');
  setTimeout(() => {
    const target = el.querySelector('[data-autofocus]') || el.querySelector(FOCUSABLE);
    target?.focus({ preventScroll: true });
  }, 60);
}
export function closeLayer(el) {
  el = el || stack[stack.length - 1];
  if (!el) return;
  el.classList.remove('is-open');
  el.setAttribute('aria-hidden', 'true');
  const i = stack.indexOf(el); if (i > -1) stack.splice(i, 1);
  if (!stack.length) document.body.classList.remove('is-locked');
  el.dispatchEvent(new CustomEvent('layer:close'));
  const op = el._opener; if (op && document.contains(op)) op.focus({ preventScroll: true });
}
document.addEventListener('keydown', (e) => {
  const top = stack[stack.length - 1];
  if (!top) return;
  if (e.key === 'Escape') { e.preventDefault(); closeLayer(top); }
  if (e.key === 'Tab') {
    const f = [...top.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null || n === document.activeElement);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
document.addEventListener('click', (e) => {
  const c = e.target.closest('[data-close]');
  if (c) { e.preventDefault(); closeLayer(c.closest('.drawer, .modal, .search')); }
});

let toastTimer;
export function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
  t.innerHTML = `${icon('check')}<span></span>`;
  t.querySelector('span').textContent = msg;
  t.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-visible'), 2600);
}

export function initAccordions(scope = document) {
  scope.querySelectorAll('[data-acc]').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel || btn._acc) return;
    btn._acc = true;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.classList.toggle('is-open', !open);
    });
  });
}

export function initHeader() {
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }
  // Mega menu (desktop): hover with intent + click/keyboard toggle
  document.querySelectorAll('.nav-item[data-mega]').forEach((item) => {
    const btn = item.querySelector('.nav-link');
    let t;
    const open = () => { clearTimeout(t); document.querySelectorAll('.nav-item.is-open').forEach((o) => o !== item && close(o)); item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); };
    const close = (it = item) => { it.classList.remove('is-open'); it.querySelector('.nav-link').setAttribute('aria-expanded', 'false'); };
    item.addEventListener('mouseenter', () => { t = setTimeout(open, 80); });
    item.addEventListener('mouseleave', () => { clearTimeout(t); t = setTimeout(() => close(), 160); });
    btn.addEventListener('click', () => (item.classList.contains('is-open') ? close() : open()));
    item.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); btn.focus(); } });
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) close(); });
  });
  // Mobile menu
  const menu = document.getElementById('menu');
  document.querySelectorAll('[data-open-menu]').forEach((b) => b.addEventListener('click', () => openLayer(menu, b)));
  menu?.querySelectorAll('.mnav__toggle').forEach((b) => b.addEventListener('click', () => {
    const exp = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', String(!exp));
    document.getElementById(b.getAttribute('aria-controls')).hidden = exp;
  }));
}

export function initAnnouncements() {
  const items = [...document.querySelectorAll('.announce__item')];
  if (items.length < 2) return;
  let i = 0; items[0].classList.add('is-active');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setInterval(() => { items[i].classList.remove('is-active'); i = (i + 1) % items.length; items[i].classList.add('is-active'); }, 3800);
}

export function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach((e) => io.observe(e));
}

// Load secondary card image on first hover (pointer devices only)
export function initCardHover() {
  if (!matchMedia('(hover: hover)').matches) return;
  document.addEventListener('pointerover', (e) => {
    const card = e.target.closest?.('.card.has-2');
    if (!card || card._h) return;
    card._h = true;
    const im = card.querySelector('.card__img-2[data-src]');
    if (im) { im.srcset = im.dataset.srcset; im.src = im.dataset.src; im.removeAttribute('data-src'); }
  });
}
