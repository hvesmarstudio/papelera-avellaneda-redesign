// Entry point
import { initHeader, initAnnouncements, initReveal, initAccordions, initCardHover, openLayer, toast } from './ui.js';
import { initCart, addToCart } from './cart-drawer.js';
import { initSearch } from './search.js';

document.documentElement.classList.remove('no-js');
initHeader();
initAnnouncements();
initReveal();
initAccordions();
initCardHover();
initCart();
initSearch();

// Quick add from product cards (single-variant products)
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-quick-add]');
  if (!b) return;
  e.preventDefault();
  try {
    const line = JSON.parse(b.dataset.quickAdd);
    addToCart(line, 1, { open: false });
    b.classList.add('is-done');
    setTimeout(() => b.classList.remove('is-done'), 1400);
  } catch {}
});

// Demo-only forms (newsletter, contact): no data is sent anywhere
document.querySelectorAll('form[data-demo-form]').forEach((f) => f.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!f.reportValidity()) return;
  const msg = f.querySelector('[data-form-msg]');
  if (msg) { msg.hidden = false; msg.textContent = f.dataset.demoForm; }
  else toast(f.dataset.demoForm);
  f.reset();
}));

const page = document.body.dataset.page;
if (page === 'catalog') import('./catalog.js').then((m) => m.initCatalog());
if (page === 'product') import('./product.js').then((m) => m.initProduct());
