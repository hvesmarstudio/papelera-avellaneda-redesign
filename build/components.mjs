// Layout components: <head>, header (+ mega menu), mobile menu, search, cart drawer,
// checkout modal, footer. Each maps 1:1 to a reusable template/partial.
import { icon } from '../src/js/icons.js';
import { esc, money } from '../src/js/format.js';

export function head({ ctx, title, description, canonical, image, jsonld = [], extraHead = '' }) {
  const { site, root, assetV } = ctx;
  const fullTitle = title ? `${title} | ${site.name} · ${site.legal_name}` : `${site.name} · ${site.legal_name} — ${site.tagline}`;
  const ogImage = image || `${site.base_url}assets/img/brand/og.jpg`;
  return `<!doctype html>
<html lang="es-AR" class="no-js" data-root="${root}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || site.meta_description)}">
<!-- Concept/demo site: kept out of search indexes so it never competes with the real store -->
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="${esc(canonical)}">
<meta name="theme-color" content="#f5f2ee">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_AR">
<meta property="og:site_name" content="${esc(site.name)} · ${esc(site.legal_name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description || site.meta_description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${root}assets/img/brand/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${root}assets/img/brand/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..600,0..100;1,9..144,300..600,0..100&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="${root}assets/css/site.css?v=${assetV}">
<script>window.__SITE__=${JSON.stringify({ installments: site.installments_no_interest, whatsapp: site.contact.whatsapp, freeShippingThreshold: site.free_shipping_threshold })};</script>
<script type="module" src="${root}assets/js/main.js?v=${assetV}"></script>
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
${extraHead}
</head>`;
}

export function announce(ctx) {
  const icons = ['card', 'truck', 'store'];
  return `<div class="announce" role="region" aria-label="Beneficios"><div class="container announce__inner">${ctx.site.announcements.map((a, i) => `<p class="announce__item">${icon(icons[i] || 'sparkle')}${esc(a)}</p>`).join('')}</div></div>`;
}

const SUBS_FIRST = 6; // sub-panels show the 6 largest subcategories first, then "ver todas"
const nf = (n) => Number(n).toLocaleString('es-AR');
// Nav images load on first open (data-src) so they never cost the initial page load
const navImg = (root, src, { w = 120, h = 120, cls = '', eager = false } = {}) => `<img class="${cls}" ${eager ? 'src' : 'data-src'}="${root}${src}" alt="" width="${w}" height="${h}" decoding="async">`;

export function header(ctx, current = '') {
  const { root, tree, collections, site, nav, saleCountAll, products } = ctx;
  const c = (slug) => `${root}categorias/${slug}/`;
  const pimg = (p, w = 480) => `assets/img/products/${p.images[0].key}-${w}.webp`;
  const featureCard = (slug, label) => {
    const f = nav[slug].featured; if (!f) return '';
    const sale = f.compare_at_price && f.compare_at_price > f.price;
    return `<a class="mega__promo" href="${root}productos/${f.handle}/">
      <span class="mega__promo-media">${navImg(root, pimg(f, 960), { w: 480, h: 600 })}${sale ? `<span class="badge badge--sale">-${Math.round((1 - f.price / f.compare_at_price) * 100)}%</span>` : ''}</span>
      <span class="mega__promo-body"><span class="mega__promo-eyebrow">${sale ? 'En oferta' : 'Destacado'}</span><span class="mega__promo-name">${esc(f.display_name)}</span><span class="mega__promo-price">${sale ? `<s>${money(f.compare_at_price)}</s> ` : ''}${f.price_max !== f.price ? 'Desde ' : ''}${money(f.price)}</span></span>
    </a>`;
  };
  const subLink = (s) => `<li><a class="mega__sub" href="${c(s.slug)}">${navImg(root, nav[s.slug].thumb, { w: 56, h: 56 })}<span class="mega__sub-name">${esc(s.name)}</span></a></li>`;
  const pickLink = (p) => `<li><a class="mega__sub" href="${root}productos/${p.handle}/">${navImg(root, pimg(p), { w: 56, h: 56 })}<span><span class="mega__sub-name">${esc(p.display_name)}</span><span class="mega__sub-price">${p.price_max !== p.price ? 'Desde ' : ''}${money(p.price)}</span></span></a></li>`;
  const panes = [
    ...tree.map((t) => ({ id: t.slug, name: t.name, href: c(t.slug), count: nav[t.slug].count, thumb: nav[t.slug].thumb,
      head: t.children.length ? '' : 'Destacados',
      list: t.children.length ? t.children.map(subLink).join('') : nav[t.slug].picks.map(pickLink).join(''),
      sale: nav[t.slug].sale, promo: featureCard(t.slug, t.name) })),
    { id: 'colecciones', name: 'Colecciones', href: c(collections[0].slug), count: null, thumb: nav[collections[0].slug].thumb,
      head: '', list: collections.map(subLink).join(''), sale: 0, promo: featureCard('para-regalos', 'Para regalos'), noAll: true },
  ];
  const tabs = panes.map((p, i) => `<li><a class="mega__tab" href="${p.href}" data-mega-tab="${p.id}" aria-controls="mega-p-${p.id}"${i === 0 ? ' aria-current="true"' : ''}>${navImg(root, p.thumb, { w: 40, h: 40 })}<span class="mega__tab-name">${esc(p.name)}</span>${icon('chevronRight')}</a></li>`).join('');
  const paneHtml = panes.map((p, i) => `<div class="mega__pane${i === 0 ? ' is-active' : ''}" id="mega-p-${p.id}" data-mega-pane="${p.id}">
      <div class="mega__pane-main">
        <div class="mega__pane-head"><div>${p.head ? `<p class="mega__kicker">${esc(p.head)}</p>` : ''}<p class="mega__title">${esc(p.name)}</p></div>${p.noAll ? '' : `<a class="link-arrow" href="${p.href}">Ver todo ${icon('arrowRight')}</a>`}</div>
        <ul class="mega__subs">${p.list}</ul>
        ${p.sale ? `<a class="mega__sale" href="${p.href}?oferta=1">${icon('sparkle')}Ofertas en ${esc(p.name)}</a>` : ''}
      </div>
      ${p.promo}
    </div>`).join('');
  return `<a class="skip-link" href="#main">Saltar al contenido</a>
${announce(ctx)}
<header class="site-header">
  <div class="container header__bar">
    <div class="header__left">
      <button type="button" class="icon-btn header__menu-btn" data-open-menu aria-controls="menu" aria-expanded="false" aria-label="Abrir menú">${icon('menu')}</button>
      <nav class="header__nav" aria-label="Principal">
        <div class="nav-item" data-mega>
          <button type="button" class="nav-link" aria-expanded="false" aria-controls="mega-productos">Productos ${icon('chevronDown')}</button>
          <div class="mega" id="mega-productos">
            <div class="container"><div class="mega__inner">
              <div class="mega__aside">
                <ul class="mega__tabs">${tabs}</ul>
                <div class="mega__quick">
                  <a class="mega__quick-link" href="${root}categorias/">${icon('grid')}Todas las categorías</a>
                  <a class="mega__quick-link" href="${root}productos/">Ver todo</a>
                  ${saleCountAll ? `<a class="mega__quick-link mega__quick-link--accent" href="${root}productos/?oferta=1">${icon('sparkle')}Ofertas</a>` : ''}
                </div>
              </div>
              <div class="mega__panes">${paneHtml}</div>
            </div></div>
          </div>
        </div>
        <a class="nav-link" href="${c('deco-y-fiesta')}"${current === 'deco-y-fiesta' ? ' aria-current="page"' : ''}>Deco y fiesta</a>
        <a class="nav-link" href="${c('todo-para-la-mesa')}"${current === 'todo-para-la-mesa' ? ' aria-current="page"' : ''}>Para la mesa</a>
        <a class="nav-link" href="${c('bolsas-y-embalaje')}"${current === 'bolsas-y-embalaje' ? ' aria-current="page"' : ''}>Bolsas y embalaje</a>
        ${saleCountAll ? `<a class="nav-link nav-link--accent" href="${root}productos/?oferta=1">Ofertas</a>` : ''}
      </nav>
    </div>
    <a class="logo" href="${root}" aria-label="${esc(site.name)} — ${esc(site.legal_name)}, ir al inicio">
      <img src="${root}assets/img/brand/logo-ink.png" alt="La Pelpa!" width="428" height="70">
      <span class="logo__sub">Papelera Avellaneda</span>
    </a>
    <div class="header__right">
      <a class="nav-link header__help" href="${root}preguntas-frecuentes/">Ayuda</a>
      <button type="button" class="icon-btn" data-open-search aria-controls="search" aria-label="Buscar productos">${icon('search')}</button>
      <button type="button" class="icon-btn" data-open-cart data-cart-label aria-controls="cart" aria-label="Carrito, 0 productos">${icon('bag')}<span class="icon-btn__badge" data-cart-badge aria-hidden="true">0</span></button>
    </div>
  </div>
</header>`;
}

export function mobileMenu(ctx, current = '', here = '') {
  const { root, tree, collections, site, nav, saleCountAll, products } = ctx;
  const c = (slug) => `${root}categorias/${slug}/`;
  const pimg = (p, w = 960) => `assets/img/products/${p.images[0].key}-${w}.webp`;
  const cur = (slug) => (slug === current ? ' aria-current="true"' : '');
  const catRow = (t, i) => {
    const inner = `<span class="mcat__img">${navImg(root, nav[t.slug].thumb, { w: 72, h: 72 })}</span><span class="mcat__name">${esc(t.name)}</span><span class="mcat__go" aria-hidden="true">${icon('chevronRight')}</span>`;
    return `<li class="mstagger" style="--i:${i + 3}">${t.children.length
      ? `<button type="button" class="mcat" data-drill="${t.slug}" aria-expanded="false" aria-controls="mview-${t.slug}"${cur(t.slug)}>${inner}</button>`
      : `<a class="mcat" href="${c(t.slug)}"${cur(t.slug) ? ' aria-current="page"' : ''}>${inner}</a>`}</li>`;
  };
  const coll = (s) => `<a class="mcoll" href="${c(s.slug)}"${s.slug === here ? ' aria-current="page"' : ''}><span class="mcoll__img">${navImg(root, nav[s.slug].thumb, { w: 120, h: 120 })}</span><span class="mcoll__name">${esc(s.name)}</span></a>`;
  const subView = (t) => {
    const n = nav[t.slug];
    const hero = n.mosaic[0];
    return `<section class="mview mview--sub" id="mview-${t.slug}" data-view="${t.slug}" aria-labelledby="mview-${t.slug}-t" aria-hidden="true" inert>
      <div class="mview__scroll">
        <h2 class="mview__title" id="mview-${t.slug}-t" tabindex="-1">${esc(t.name)}</h2>
        <a class="mhero" href="${c(t.slug)}">
          <span class="mhero__media">${hero ? navImg(root, pimg(hero), { w: 960, h: 600 }) : ''}</span>
          <span class="mhero__body"><span class="mhero__label">Ver todo</span><span class="mhero__arrow">${icon('arrowRight')}</span></span>
        </a>
        <ul class="msubs">${t.children.map((s, i) => `<li class="mstagger${i >= SUBS_FIRST ? ' is-extra' : ''}" style="--i:${Math.min(i, 8)}"><a class="msub" href="${c(s.slug)}"${s.slug === here ? ' aria-current="page"' : ''}><span class="msub__img">${navImg(root, nav[s.slug].thumb, { w: 120, h: 120 })}</span><span class="msub__name">${esc(s.name)}</span></a></li>`).join('')}</ul>
        ${t.children.length > SUBS_FIRST ? `<button type="button" class="mmore" data-subs-more aria-expanded="false">Ver todas ${icon('chevronDown')}</button>` : ''}
        ${n.sale ? `<a class="mchip mchip--accent mview__sale" href="${c(t.slug)}?oferta=1">${icon('sparkle')}Ofertas en ${esc(t.name)}</a>` : ''}
      </div>
    </section>`;
  };
  return `<div class="msheet" id="menu" role="dialog" aria-modal="true" aria-label="Menú" aria-hidden="true" data-level="0">
  <button type="button" class="msheet__scrim" data-close tabindex="-1" aria-label="Cerrar menú"></button>
  <div class="msheet__panel">
    <div class="msheet__head">
      <div class="msheet__head-left">
        <a class="msheet__logo" href="${root}" aria-label="Ir al inicio"><img src="${root}assets/img/brand/logo-ink.png" alt="La Pelpa!" width="428" height="70"></a>
        <button type="button" class="mback" data-menu-back aria-label="Volver al menú principal" tabindex="-1">${icon('chevronLeft')}<span>Menú</span></button>
      </div>
      <button type="button" class="icon-btn msheet__close" data-close aria-label="Cerrar menú">${icon('close')}</button>
    </div>
    <div class="msheet__views">
      <section class="mview mview--root is-active" data-view="root" aria-label="Menú principal">
        <div class="mview__scroll">
          <button type="button" class="msearch mstagger" style="--i:0" data-menu-search aria-controls="search">${icon('search')}<span>¿Qué estás buscando?</span></button>
          <div class="mquick mstagger" style="--i:1" role="list" aria-label="Accesos rápidos">
            ${saleCountAll ? `<a role="listitem" class="mchip mchip--accent" href="${root}productos/?oferta=1">${icon('sparkle')}Ofertas</a>` : ''}
            <a role="listitem" class="mchip" href="${root}productos/">Ver todo</a>
            ${collections.slice(0, 3).map((s) => `<a role="listitem" class="mchip mchip--img" href="${c(s.slug)}">${navImg(root, nav[s.slug].thumb, { w: 28, h: 28 })}${esc(s.name)}</a>`).join('')}
          </div>
          <p class="mlabel mstagger" style="--i:2">Categorías</p>
          <ul class="mcats">${tree.map(catRow).join('')}</ul>
          <a class="mhub mstagger" style="--i:7" href="${root}categorias/">${icon('grid')}<span>Todas las categorías</span>${icon('arrowRight')}</a>
          <p class="mlabel mstagger" style="--i:8">Colecciones</p>
          <div class="mcolls mstagger" style="--i:8">${collections.map(coll).join('')}</div>
          <div class="mhelp mstagger" style="--i:9">
            <ul class="mtrust">
              <li>${icon('card')}<span><strong>${site.installments_no_interest} cuotas</strong> sin interés</span></li>
              <li>${icon('truck')}<span><strong>Envíos</strong> a todo el país</span></li>
              <li>${icon('store')}<span><strong>Retiro</strong> en CABA</span></li>
            </ul>
            <a class="mwa" href="https://wa.me/${site.contact.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')}<span><strong>¿Dudas? Escribinos</strong><span>WhatsApp ${esc(site.contact.whatsapp_display)}</span></span>${icon('arrowRight')}</a>
            <ul class="mstore">
              <li>${icon('pin')}<span><strong>${esc(site.contact.address)}, CABA</strong><span>Retiros: ${esc(site.contact.pickup_hours.toLowerCase())}</span></span></li>
              <li>${icon('clock')}<span><strong>Horario</strong><span>${esc(site.contact.hours)}</span></span></li>
            </ul>
            <nav class="mlinks" aria-label="Ayuda">
              <a href="${root}envios-y-devoluciones/">${icon('truck')}Envíos y devoluciones</a>
              <a href="${root}preguntas-frecuentes/">${icon('info')}Preguntas frecuentes</a>
              <a href="${root}contacto/">${icon('mail')}Contacto</a>
              <a href="${site.social.instagram}" target="_blank" rel="noopener">${icon('instagram')}${esc(site.social.instagram_handle)}</a>
            </nav>
          </div>
        </div>
      </section>
      ${tree.filter((t) => t.children.length).map(subView).join('')}
    </div>
  </div>
</div>`;
}

export function searchOverlay(ctx) {
  const { root, tree, nav, collections } = ctx;
  // Suggested searches = the largest real subcategories (by product count)
  const sugg = tree.flatMap((t) => t.children).sort((a, b) => b.count - a.count).slice(0, 8);
  return `<div class="search" id="search" role="dialog" aria-modal="true" aria-label="Buscar productos" aria-hidden="true">
  <button type="button" class="search__scrim" data-close tabindex="-1" aria-label="Cerrar búsqueda"></button>
  <div class="search__panel">
    <div class="container">
      <form class="search__form" role="search" action="${root}productos/" method="get">
        ${icon('search')}
        <label class="sr-only" for="search-input">Buscar productos</label>
        <input class="search__input" id="search-input" type="search" name="q" placeholder="Globos, platos, cintas…" autocomplete="off" enterkeyhint="search" data-autofocus>
        <button type="button" class="search__clear" data-search-clear aria-label="Borrar búsqueda" hidden>${icon('close')}</button>
        <button type="button" class="search__cancel" data-close>Cerrar</button>
      </form>
      <div class="search__body">
        <div data-search-idle>
          <p class="search__label">Ideas para empezar</p>
          <div class="search__suggest">${sugg.map((s) => `<a class="chip" href="${root}categorias/${s.slug}/">${icon('search')}${esc(s.name)}</a>`).join('')}</div>
          <p class="search__label">Categorías</p>
          <ul class="search__tops">${[...tree, ...collections.slice(0, 2)].map((t) => `<li><a class="search-cat" href="${root}categorias/${t.slug}/"><img data-src="${root}${nav[t.slug].thumb}" alt="" width="56" height="56"><span class="search-cat__name">${esc(t.name)}</span></a></li>`).join('')}</ul>
        </div>
        <div class="search__group" data-search-cats-wrap hidden>
          <p class="search__label">Categorías</p>
          <ul class="search__cats" data-search-cats></ul>
        </div>
        <div class="search__group" data-search-prods-wrap hidden>
          <p class="search__label" data-search-prods-label>Productos</p>
          <ul class="search__results" data-search-results aria-live="polite"></ul>
        </div>
        <p class="search__empty" data-search-empty hidden></p>
        <a class="btn btn--block search__more" data-search-more hidden href="${root}productos/">Ver todos los resultados</a>
      </div>
    </div>
  </div>
</div>`;
}

export function paymentMarks(ctx) {
  return `<span class="paymark paymark--mp">${icon('card')}Mercado Pago</span><span class="paymark">${icon('card')}Crédito y débito</span><span class="paymark">${icon('bank')}Transferencia</span><span class="paymark">${icon('cash')}Efectivo</span>`;
}

export function cartDrawer(ctx) {
  const { root, site } = ctx;
  return `<div class="drawer drawer--right" id="cart" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden="true">
  <button type="button" class="drawer__scrim" data-close tabindex="-1" aria-label="Cerrar carrito"></button>
  <div class="drawer__panel">
    <div class="drawer__head"><h2 class="drawer__title" id="cart-title">Tu carrito <span class="muted small" data-cart-count></span></h2><button type="button" class="icon-btn" data-close aria-label="Cerrar carrito">${icon('close')}</button></div>
    <div class="cart__ship" data-cart-ship></div>
    <div class="drawer__body">
      <div class="cart__empty" data-cart-empty>
        ${icon('bag')}
        <p class="h4">Tu carrito espera la fiesta</p>
        <p class="muted small">Empezá por acá:</p>
        <div class="cart__empty-links">
          <a class="chip" href="${root}categorias/deco-y-fiesta/">Deco y fiesta</a>
          <a class="chip" href="${root}categorias/todo-para-la-mesa/">Para la mesa</a>
          <a class="chip" href="${root}categorias/bolsas-y-embalaje/">Bolsas y embalaje</a>
        </div>
      </div>
      <ul class="cart__items" data-cart-items></ul>
    </div>
    <div class="drawer__foot" data-cart-foot hidden>
      <div class="cart__totals">
        <div class="cart__row cart__row--total"><span>Subtotal</span><span data-cart-subtotal>$0</span></div>
        <p class="cart__inst" data-cart-inst></p>
        <div class="cart__row"><span>Envío</span><span>Se calcula en el checkout</span></div>
      </div>
      <button type="button" class="btn btn--accent btn--block btn--lg" data-checkout>${icon('lock')}Iniciar compra</button>
      <p class="cart__secure">${icon('shield')}Pagos procesados por Mercado Pago</p>
      <div class="cart__pay">${paymentMarks(ctx)}</div>
    </div>
  </div>
</div>
<div class="modal" id="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" aria-hidden="true">
  <button type="button" class="modal__scrim" data-close tabindex="-1" aria-label="Cerrar"></button>
  <div class="modal__card">
    <button type="button" class="icon-btn modal__close" data-close aria-label="Cerrar">${icon('close')}</button>
    <p class="eyebrow eyebrow--plain">Concepto de diseño</p>
    <h2 class="h3" id="checkout-title">Acá arranca el checkout</h2>
    <p class="muted small" data-checkout-summary></p>
    <p class="small">Esto es una propuesta de rediseño: no procesa pagos ni pedidos. En la tienda real seguís con:</p>
    <ul class="modal__list">
      <li>${icon('check')}Mercado Pago — hasta ${site.installments_no_interest} cuotas sin interés</li>
      <li>${icon('check')}Transferencia o depósito bancario, o efectivo</li>
      <li>${icon('check')}Envío por Correo Argentino, moto en CABA o retiro en el local</li>
    </ul>
    <div class="modal__actions">
      <a class="btn btn--block" href="${site.original_url}" target="_blank" rel="noopener">Ir a la tienda actual ${icon('external')}</a>
      <a class="btn btn--ghost btn--block" data-checkout-wa href="https://wa.me/${site.contact.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')}Consultar este pedido por WhatsApp</a>
    </div>
  </div>
</div>`;
}

export function footer(ctx) {
  const { root, site, tree } = ctx;
  const c = (slug) => `${root}categorias/${slug}/`;
  const y = 2026;
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        <img src="${root}assets/img/brand/logo-cream.png" alt="La Pelpa!" width="428" height="70" loading="lazy">
        <p>Papelería, deco y fiesta desde Av. Avellaneda 2871, CABA. Para festejar en todo el país.</p>
        <div class="footer__social">
          <a href="${site.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram ${esc(site.social.instagram_handle)}">${icon('instagram')}</a>
          <a href="${site.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icon('facebook')}</a>
          <a href="https://wa.me/${site.contact.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('whatsapp')}</a>
        </div>
      </div>
      <div class="footer__col"><h2>Tienda</h2><ul>
        <li><a href="${root}productos/">Ver todo</a></li>
        <li><a href="${root}categorias/">Todas las categorías</a></li>
        ${tree.map((t) => `<li><a href="${c(t.slug)}">${esc(t.name)}</a></li>`).join('')}
        <li><a href="${root}productos/?oferta=1">Ofertas</a></li>
      </ul></div>
      <div class="footer__col"><h2>Ayuda</h2><ul>
        <li><a href="${root}envios-y-devoluciones/">Envíos y devoluciones</a></li>
        <li><a href="${root}preguntas-frecuentes/">Preguntas frecuentes</a></li>
        <li><a href="${root}contacto/">Contacto</a></li>
        <li><a href="${root}terminos-y-condiciones/">Términos y condiciones</a></li>
        <li><a href="${site.original_url}contacto/?order_cancellation_without_id=true" target="_blank" rel="noopener">Botón de arrepentimiento</a></li>
      </ul></div>
      <div class="footer__col"><h2>Contacto</h2><ul>
        <li><a href="https://wa.me/${site.contact.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')}${esc(site.contact.whatsapp_display)}</a></li>
        <li><a href="mailto:${site.contact.email}">${icon('mail')}${esc(site.contact.email)}</a></li>
        <li><span>${icon('pin')}${esc(site.contact.address)}, CABA</span></li>
        <li><span>${icon('clock')}${esc(site.contact.hours)}</span></li>
      </ul></div>
    </div>
    <div class="footer__pay"><span class="label">Medios de pago</span>${paymentMarks(ctx)}</div>
    <div class="footer__bottom">
      <span>© ${y} ${esc(site.legal_name)} · La Pelpa!</span>
      <span class="footer__legal">
        <a href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario" target="_blank" rel="noopener">Defensa de las y los consumidores</a>
        <a href="${root}terminos-y-condiciones/">Términos y condiciones</a>
      </span>
      <p class="footer__concept">${icon('info')}<span><strong>Concepto de rediseño por Hvesmar Studio.</strong> No es el sitio oficial. Productos, precios y políticas tomados de <a href="${site.original_url}" target="_blank" rel="noopener">papeleraavellaneda.com</a> el 7/10/2026. No procesa pedidos ni pagos.</span></p>
    </div>
  </div>
</footer>
<a class="wa-fab" href="https://wa.me/${site.contact.whatsapp}" target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp">${icon('whatsapp')}<span>¿Te ayudamos?</span></a>`;
}

// Visual category rail (cards with real product thumbnails); scroll-snap on touch, arrows on desktop
export function catRail(ctx, items, { label = 'Categorías', grid = false, eager = false } = {}) {
  const { root } = ctx;
  return `<div class="catrail${grid ? ' catrail--grid' : ''}" data-rail>
    <button type="button" class="catrail__btn catrail__btn--prev" data-rail-prev aria-label="Ver anteriores" tabindex="-1" hidden>${icon('chevronLeft')}</button>
    <ul class="catrail__track" data-rail-track aria-label="${esc(label)}">${items.map((it) => `<li><a class="ccard" href="${it.href}"${it.current ? ' aria-current="page"' : ''}><span class="ccard__img">${it.thumb ? `<img src="${root}${it.thumb}" alt="" width="120" height="120" ${eager ? '' : 'loading="lazy" '}decoding="async">` : `<span class="ccard__icon">${icon('grid')}</span>`}</span><span class="ccard__name">${esc(it.name)}</span></a></li>`).join('')}</ul>
    <button type="button" class="catrail__btn catrail__btn--next" data-rail-next aria-label="Ver más" tabindex="-1" hidden>${icon('chevronRight')}</button>
  </div>`;
}

export function crumbs(items) {
  const sep = `<span class="crumbs__sep" aria-hidden="true">${icon('chevronRight')}</span>`;
  const switcher = (it) => `<details class="crumbs__switch" data-crumb-switch><summary aria-label="${esc(it.name)}: cambiar de categoría"><span aria-current="page">${esc(it.name)}</span>${icon('chevronDown')}</summary>
    <ul class="crumbs__menu">${it.siblings.map((s) => `<li><a href="${s.href}"${s.current ? ' aria-current="page"' : ''}><span>${esc(s.name)}</span>${s.current ? icon('check') : ''}</a></li>`).join('')}</ul></details>`;
  return `<nav class="crumbs-nav" aria-label="Migas de pan"><ol class="crumbs">${items.map((it, i) => {
    const last = i === items.length - 1;
    const label = i === 0 ? `${icon('home')}<span class="sr-only">${esc(it.name)}</span>` : esc(it.name);
    const inner = it.siblings && it.siblings.length > 1 ? switcher(it) : last ? `<span aria-current="page">${label}</span>` : `<a href="${it.href}">${label}</a>`;
    return `<li${last ? ' class="crumbs__last"' : ''}>${i ? sep : ''}${inner}</li>`;
  }).join('')}</ol></nav>`;
}

export function layout(ctx, { title, description, canonical, image, jsonld, page, current, here = '', body, extraHead, after = '' }) {
  return `${head({ ctx, title, description, canonical, image, jsonld, extraHead })}
<body data-page="${page}">
${header(ctx, current)}
<main id="main">
${body}
</main>
${footer(ctx)}
${mobileMenu(ctx, current, here)}
${searchOverlay(ctx)}
${cartDrawer(ctx)}
${after}
</body>
</html>`;
}
