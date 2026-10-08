// Cart drawer UI
import { cart } from './store.js';
import { money, installment, esc } from './format.js';
import { icon } from './icons.js';
import { openLayer, closeLayer, toast } from './ui.js';

const cfg = window.__SITE__ || {};
const root = document.documentElement.dataset.root || '';

export function initCart() {
  const drawer = document.getElementById('cart');
  if (!drawer) return;
  const list = drawer.querySelector('[data-cart-items]');
  const empty = drawer.querySelector('[data-cart-empty]');
  const foot = drawer.querySelector('[data-cart-foot]');
  const subtotalEl = drawer.querySelector('[data-cart-subtotal]');
  const instEl = drawer.querySelector('[data-cart-inst]');
  const countEl = drawer.querySelector('[data-cart-count]');
  const shipEl = drawer.querySelector('[data-cart-ship]');
  const badges = document.querySelectorAll('[data-cart-badge]');

  function render() {
    const its = cart.items;
    const count = cart.count;
    badges.forEach((b) => { b.textContent = count; b.classList.toggle('has-items', count > 0); });
    document.querySelectorAll('[data-cart-label]').forEach((el) => el.setAttribute('aria-label', `Carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`));
    countEl.textContent = count ? `(${count})` : '';
    empty.hidden = its.length > 0;
    foot.hidden = its.length === 0;
    list.innerHTML = its.map((i) => `
      <li class="line">
        <a class="line__img" href="${root}productos/${i.h}/" tabindex="-1" aria-hidden="true">${i.img ? `<img src="${root}assets/img/products/${i.img}-480.webp" alt="" width="76" height="106" loading="lazy">` : ''}</a>
        <div class="line__body">
          <div class="line__top"><a class="line__name" href="${root}productos/${i.h}/">${esc(i.n)}</a><span class="line__price">${money(i.p * i.qty)}</span></div>
          ${i.vl ? `<span class="line__variant">${esc(i.vl)}</span>` : ''}
          ${i.qty > 1 ? `<span class="line__unit">${money(i.p)} c/u</span>` : ''}
          <div class="line__bottom">
            <div class="qty qty--sm" role="group" aria-label="Cantidad de ${esc(i.n)}">
              <button type="button" data-dec="${i.vid}" aria-label="Restar uno">${icon('minus')}</button>
              <input type="number" inputmode="numeric" min="1" ${i.max ? `max="${i.max}"` : ''} value="${i.qty}" data-qty="${i.vid}" aria-label="Cantidad">
              <button type="button" data-inc="${i.vid}" aria-label="Sumar uno" ${i.max && i.qty >= i.max ? 'disabled' : ''}>${icon('plus')}</button>
            </div>
            <button type="button" class="line__remove" data-remove="${i.vid}">Quitar</button>
          </div>
        </div>
      </li>`).join('');
    const sub = cart.subtotal;
    subtotalEl.textContent = money(sub);
    if (instEl) instEl.textContent = cfg.installments ? `o ${cfg.installments} cuotas sin interés de ${installment(sub, cfg.installments)}` : '';
    if (shipEl) {
      const t = cfg.freeShippingThreshold;
      if (t) {
        const left = Math.max(0, t - sub);
        shipEl.innerHTML = `${icon('truck')}<div style="flex:1">${left > 0 ? `Te faltan <strong>${money(left)}</strong> para el envío gratis` : '<strong>¡Tenés envío gratis!</strong>'}<div class="cart__ship-bar"><span style="width:${Math.min(100, (sub / t) * 100)}%"></span></div></div>`;
      } else {
        shipEl.innerHTML = `${icon('truck')}<span>Envíos a todo el país · Moto en CABA · Retiro en el local</span>`;
      }
    }
  }
  cart.subscribe(render);
  render();

  list.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    const find = (id) => cart.items.find((i) => String(i.vid) === id);
    if (t.dataset.inc) { const i = find(t.dataset.inc); i && cart.setQty(i.vid, i.qty + 1); }
    if (t.dataset.dec) { const i = find(t.dataset.dec); i && cart.setQty(i.vid, i.qty - 1); }
    if (t.dataset.remove) { const i = find(t.dataset.remove); if (i) { cart.remove(i.vid); toast(`Quitaste ${i.n}`); } }
  });
  list.addEventListener('change', (e) => {
    const inp = e.target.closest('[data-qty]');
    if (!inp) return;
    const i = cart.items.find((x) => String(x.vid) === inp.dataset.qty);
    if (i) cart.setQty(i.vid, parseInt(inp.value, 10) || 0);
  });

  document.querySelectorAll('[data-open-cart]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); openCart(); }));

  // Checkout (demo)
  const checkoutBtn = drawer.querySelector('[data-checkout]');
  checkoutBtn?.addEventListener('click', () => {
    const modal = document.getElementById('checkout-modal');
    const sum = modal.querySelector('[data-checkout-summary]');
    sum.textContent = `Subtotal ${money(cart.subtotal)}`;
    const wa = modal.querySelector('[data-checkout-wa]');
    if (wa && cfg.whatsapp) {
      const lines = cart.items.map((i) => `• ${i.qty} × ${i.n}${i.vl ? ` (${i.vl})` : ''} — ${money(i.p * i.qty)}`);
      const msg = `Hola! Quiero hacer este pedido:\n${lines.join('\n')}\nSubtotal: ${money(cart.subtotal)}`;
      wa.href = `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(msg)}`;
    }
    openLayer(modal, checkoutBtn);
  });
}

export function openCart() {
  const d = document.getElementById('cart');
  openLayer(d, document.activeElement);
}

export function addToCart(line, qty = 1, { open = true } = {}) {
  cart.add(line, qty);
  document.querySelectorAll('[data-cart-badge]').forEach((b) => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
  if (open) openCart();
  else toast(`Listo, ${line.n} ya está en tu carrito`);
}
