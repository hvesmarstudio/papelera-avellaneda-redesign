// Navigation: slim sticky header, desktop mega menu (hover intent + keyboard),
// full-screen mobile menu with drill-down panels, and category rails.
import { openLayer, closeLayer } from './ui.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
// Images inside menus use data-src and load the first time the menu opens
const hydrate = (scope) => scope.querySelectorAll('img[data-src]').forEach((im) => { im.src = im.dataset.src; im.removeAttribute('data-src'); });

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const html = document.documentElement;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    // hysteresis avoids flicker at the threshold
    if (y > 120) html.classList.add('is-slim'); else if (y < 60) html.classList.remove('is-slim');
  };
  update();
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
}

function initMega() {
  document.querySelectorAll('.nav-item[data-mega]').forEach((item) => {
    const btn = item.querySelector('.nav-link');
    const mega = item.querySelector('.mega');
    const tabs = [...item.querySelectorAll('[data-mega-tab]')];
    const panes = [...item.querySelectorAll('[data-mega-pane]')];
    let openT, closeT, tabT, hydrated = false;
    const isOpen = () => item.classList.contains('is-open');
    const open = () => {
      clearTimeout(closeT);
      if (!hydrated) { hydrate(mega); hydrated = true; }
      item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true');
    };
    const close = () => { clearTimeout(openT); item.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };
    const activate = (id) => {
      tabs.forEach((t) => (t.dataset.megaTab === id ? t.setAttribute('aria-current', 'true') : t.removeAttribute('aria-current')));
      panes.forEach((p) => p.classList.toggle('is-active', p.dataset.megaPane === id));
    };
    // Hover intent: short delay to open, longer grace period to close
    item.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(closeT); if (!isOpen()) openT = setTimeout(open, 140); });
    item.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(openT); closeT = setTimeout(close, 280); });
    btn.addEventListener('click', () => (isOpen() ? close() : open()));
    // Tabs: hovering switches the pane after a short delay (prevents flicker on diagonal moves)
    tabs.forEach((t, i) => {
      t.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(tabT); tabT = setTimeout(() => activate(t.dataset.megaTab), 110); });
      t.addEventListener('pointerleave', () => clearTimeout(tabT));
      t.addEventListener('focus', () => activate(t.dataset.megaTab));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); tabs[(i + (e.key === 'ArrowDown' ? 1 : tabs.length - 1)) % tabs.length].focus(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); item.querySelector('.mega__pane.is-active a')?.focus(); }
      });
    });
    item.querySelectorAll('.mega__pane').forEach((p) => p.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); tabs.find((t) => t.dataset.megaTab === p.dataset.megaPane)?.focus(); }
    }));
    btn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); open(); requestAnimationFrame(() => (tabs.find((t) => t.hasAttribute('aria-current')) || tabs[0])?.focus()); } });
    item.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) { e.stopPropagation(); close(); btn.focus(); } });
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) close(); });
    document.addEventListener('pointerdown', (e) => { if (isOpen() && !item.contains(e.target)) close(); });
  });
}

function initMobileMenu() {
  const menu = document.getElementById('menu');
  if (!menu) return;
  const openers = document.querySelectorAll('[data-open-menu]');
  const views = menu.querySelector('.msheet__views');
  const root = menu.querySelector('[data-view="root"]');
  const back = menu.querySelector('[data-menu-back]');
  let hydrated = false, drillBtn = null;

  const setView = (view, focusTarget) => {
    const isRoot = view === root;
    menu.dataset.level = isRoot ? '0' : '1';
    menu.querySelectorAll('.mview').forEach((v) => {
      const on = v === view;
      v.classList.toggle('is-active', on);
      v.toggleAttribute('inert', !on);
      v.setAttribute('aria-hidden', String(!on));
    });
    back.tabIndex = isRoot ? -1 : 0;
    menu.querySelectorAll('[data-drill]').forEach((b) => b.setAttribute('aria-expanded', String(!isRoot && b.getAttribute('aria-controls') === view.id)));
    if (!isRoot) view.querySelector('.mview__scroll').scrollTop = 0;
    setTimeout(() => focusTarget?.focus({ preventScroll: true }), reduce.matches ? 0 : 60);
  };
  const goRoot = () => { setView(root, drillBtn); drillBtn = null; };

  openers.forEach((b) => b.addEventListener('click', () => {
    if (!hydrated) { hydrate(menu); hydrated = true; }
    setView(root);
    openLayer(menu, b);
  }));
  menu.addEventListener('layer:open', () => openers.forEach((b) => b.setAttribute('aria-expanded', 'true')));
  menu.addEventListener('layer:close', () => { openers.forEach((b) => b.setAttribute('aria-expanded', 'false')); setTimeout(() => setView(root), 400); });
  menu.querySelectorAll('[data-drill]').forEach((b) => b.addEventListener('click', () => {
    const view = document.getElementById(b.getAttribute('aria-controls'));
    drillBtn = b;
    setView(view, view.querySelector('.mview__title'));
  }));
  back.addEventListener('click', goRoot);
  // "Ver todas las subcategorías": largest 6 first, the rest on demand
  menu.querySelectorAll('[data-subs-more]').forEach((b) => {
    const list = b.previousElementSibling;
    const toggle = (on) => { list.classList.toggle('is-expanded', on); b.setAttribute('aria-expanded', String(on)); b.firstChild.textContent = on ? 'Ver menos ' : 'Ver todas las subcategorías '; };
    b.addEventListener('click', () => toggle(b.getAttribute('aria-expanded') !== 'true'));
    if (list.querySelector('.is-extra [aria-current]')) toggle(true);
  });
  // Esc steps back one level before closing the sheet
  menu._onEsc = () => { if (menu.dataset.level === '1') { goRoot(); return true; } return false; };
  // Edge swipe right on a sub-panel goes back (touch)
  let sx = null, sy = 0;
  views.addEventListener('touchstart', (e) => { if (menu.dataset.level !== '1') return; sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  views.addEventListener('touchend', (e) => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = Math.abs(e.changedTouches[0].clientY - sy);
    if (sx < 48 && dx > 70 && dy < 50) goRoot();
    sx = null;
  }, { passive: true });
  // Search field opens the instant-search overlay
  menu.querySelector('[data-menu-search]')?.addEventListener('click', () => {
    closeLayer(menu);
    document.querySelector('[data-open-search]')?.click();
  });
}

function initRails() {
  document.querySelectorAll('[data-rail]').forEach((rail) => {
    const track = rail.querySelector('[data-rail-track]');
    const prev = rail.querySelector('[data-rail-prev]');
    const next = rail.querySelector('[data-rail-next]');
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const scrollable = max > 4 && getComputedStyle(track).overflowX !== 'visible';
      prev.hidden = !scrollable || track.scrollLeft < 4;
      next.hidden = !scrollable || track.scrollLeft > max - 4;
      rail.classList.toggle('is-scrollable', scrollable);
      rail.classList.toggle('at-end', !scrollable || track.scrollLeft > max - 4);
    };
    const step = (dir) => track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reduce.matches ? 'auto' : 'smooth' });
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    track.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(track);
    // keep the current item in view
    const cur = track.querySelector('[aria-current]');
    if (cur && cur.parentElement !== track.firstElementChild) {
      const li = cur.parentElement; track.scrollLeft = li.offsetLeft - track.clientWidth / 2 + li.offsetWidth / 2;
    }
    update();
  });
}

// Breadcrumb sibling switcher (<details>): close on outside click / Esc
function initCrumbSwitch() {
  const all = document.querySelectorAll('[data-crumb-switch]');
  if (!all.length) return;
  document.addEventListener('click', (e) => all.forEach((d) => { if (d.open && !d.contains(e.target)) d.open = false; }));
  all.forEach((d) => d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && d.open) { e.stopPropagation(); d.open = false; d.querySelector('summary').focus(); } }));
}

export function initNav() {
  initCrumbSwitch();
  initHeaderScroll();
  initMega();
  initMobileMenu();
  initRails();
}
