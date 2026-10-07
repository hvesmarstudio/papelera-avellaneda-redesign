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
<meta name="theme-color" content="#f6f1ea">
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

export function header(ctx, current = '') {
  const { root, tree, collections, site } = ctx;
  const c = (slug) => `${root}categorias/${slug}/`;
  const cols = tree.map((t) => `<div class="mega__col"><h3><a href="${c(t.slug)}">${esc(t.name)}</a></h3>${t.children.length ? `<ul>${t.children.map((s) => `<li><a href="${c(s.slug)}">${esc(s.name)}</a></li>`).join('')}</ul>` : ''}${t.slug === 'navidad' ? `<h3 style="margin-top:1.5rem">Colecciones</h3><ul>${collections.map((s) => `<li><a href="${c(s.slug)}">${esc(s.name)}</a></li>`).join('')}</ul>` : ''}</div>`).join('');
  return `<a class="skip-link" href="#main">Saltar al contenido</a>
${announce(ctx)}
<header class="site-header">
  <div class="container header__bar">
    <div class="header__left">
      <button type="button" class="icon-btn header__menu-btn" data-open-menu aria-controls="menu" aria-label="Abrir menú">${icon('menu')}</button>
      <nav class="header__nav" aria-label="Principal">
        <div class="nav-item" data-mega>
          <button type="button" class="nav-link" aria-expanded="false" aria-controls="mega-productos">Productos ${icon('chevronDown')}</button>
          <div class="mega" id="mega-productos">
            <div class="container mega__inner">${cols}
              <a class="mega__feature" href="${c('globos')}"><img src="${root}assets/img/brand/banner-1.webp" alt="Guirnalda de globos dorados y blancos" loading="lazy" width="921" height="432"><span>Globos y deco ${icon('arrowRight')}</span></a>
            </div>
          </div>
        </div>
        <a class="nav-link" href="${c('deco-y-fiesta')}"${current === 'deco-y-fiesta' ? ' aria-current="page"' : ''}>Deco y fiesta</a>
        <a class="nav-link" href="${c('todo-para-la-mesa')}"${current === 'todo-para-la-mesa' ? ' aria-current="page"' : ''}>Para la mesa</a>
        <a class="nav-link" href="${root}productos/?oferta=1">Ofertas</a>
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

export function mobileMenu(ctx) {
  const { root, tree, collections, site } = ctx;
  const c = (slug) => `${root}categorias/${slug}/`;
  const group = (id, name, href, children) => children.length ? `<li><button type="button" class="mnav__toggle" aria-expanded="false" aria-controls="mnav-${id}">${esc(name)} ${icon('plus')}</button>
    <ul class="mnav__sub" id="mnav-${id}" hidden>${href ? `<li><a class="mnav__all" href="${href}">Ver todo ${esc(name.toLowerCase())}</a></li>` : ''}${children.map((s) => `<li><a href="${c(s.slug)}">${esc(s.name)}</a></li>`).join('')}</ul></li>`
    : `<li><a class="mnav__link" href="${href}">${esc(name)}</a></li>`;
  return `<div class="drawer drawer--left" id="menu" role="dialog" aria-modal="true" aria-label="Menú" aria-hidden="true">
  <button type="button" class="drawer__scrim" data-close tabindex="-1" aria-label="Cerrar menú"></button>
  <div class="drawer__panel">
    <div class="drawer__head"><img src="${root}assets/img/brand/logo-ink.png" alt="La Pelpa!" width="428" height="70" style="height:18px;width:auto"><button type="button" class="icon-btn" data-close aria-label="Cerrar menú">${icon('close')}</button></div>
    <div class="drawer__body">
      <ul class="mnav">
        <li><a class="mnav__link" href="${root}productos/">Todos los productos</a></li>
        ${tree.map((t) => group(t.slug, t.name, c(t.slug), t.children)).join('')}
        ${group('colecciones', 'Colecciones', '', collections)}
        <li><a class="mnav__link" href="${root}productos/?oferta=1">Ofertas</a></li>
      </ul>
      <ul class="mnav-secondary">
        <li><a href="${root}envios-y-devoluciones/">${icon('truck')}Envíos y devoluciones</a></li>
        <li><a href="${root}preguntas-frecuentes/">${icon('info')}Preguntas frecuentes</a></li>
        <li><a href="${root}contacto/">${icon('mail')}Contacto</a></li>
        <li><a href="https://wa.me/${site.contact.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp ${esc(site.contact.whatsapp_display)}</a></li>
        <li><a href="${site.social.instagram}" target="_blank" rel="noopener">${icon('instagram')}Instagram ${esc(site.social.instagram_handle)}</a></li>
      </ul>
    </div>
  </div>
</div>`;
}

export function searchOverlay(ctx) {
  const { root } = ctx;
  const sugg = ['globos', 'servilletas', 'guirnaldas-de-flecos', 'bonetes', 'cajas', 'deco-torta-y-pirotines', 'navidad', 'para-regalos'];
  const names = ctx.catBySlug;
  return `<div class="search" id="search" role="dialog" aria-modal="true" aria-label="Buscar productos" aria-hidden="true">
  <button type="button" class="search__scrim" data-close tabindex="-1" aria-label="Cerrar búsqueda"></button>
  <div class="search__panel">
    <div class="container">
      <form class="search__form" role="search" action="${root}productos/" method="get">
        ${icon('search')}
        <label class="sr-only" for="search-input">Buscar productos</label>
        <input class="search__input" id="search-input" type="search" name="q" placeholder="¿Qué estás buscando?" autocomplete="off" data-autofocus>
        <button type="button" class="icon-btn" data-close aria-label="Cerrar búsqueda">${icon('close')}</button>
      </form>
      <div class="search__body">
        <div data-search-idle>
          <p class="eyebrow eyebrow--plain search__label">Sugerencias</p>
          <div class="search__suggest">${sugg.filter((s) => names[s]).map((s) => `<a class="chip" href="${root}categorias/${s}/">${esc(names[s].name)}</a>`).join('')}</div>
        </div>
        <ul class="search__results" data-search-results aria-live="polite"></ul>
        <a class="btn btn--ghost search__more" data-search-more hidden href="${root}productos/">Ver todos los resultados</a>
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
        <p class="h4">Tu carrito está vacío</p>
        <p class="muted small">Explorá la tienda y agregá lo que necesites para tu próxima celebración.</p>
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
    <h2 class="h3" id="checkout-title">Acá empezaría el checkout seguro</h2>
    <p class="muted small" data-checkout-summary></p>
    <p class="small">Este sitio es una propuesta de rediseño: no procesa pagos ni pedidos. En la tienda real, este paso continúa con:</p>
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
        <p>Papelera Avellaneda — papelería, deco y fiesta. Todo para la mesa, bolsas y embalaje, globos, guirnaldas y más, con envíos a todo el país desde Av. Avellaneda 2871, CABA.</p>
        <div class="footer__social">
          <a href="${site.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram ${esc(site.social.instagram_handle)}">${icon('instagram')}</a>
          <a href="${site.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icon('facebook')}</a>
          <a href="https://wa.me/${site.contact.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('whatsapp')}</a>
        </div>
      </div>
      <div class="footer__col"><h2>Tienda</h2><ul>
        <li><a href="${root}productos/">Todos los productos</a></li>
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
      <p class="footer__concept">${icon('info')}<span><strong>Concepto de rediseño por Hvesmar Studio.</strong> No es el sitio oficial de la tienda: los productos, precios y políticas se tomaron de <a href="${site.original_url}" target="_blank" rel="noopener">papeleraavellaneda.com</a> el 7/10/2026 y pueden no estar actualizados. No se procesan pedidos ni pagos.</span></p>
    </div>
  </div>
</footer>
<a class="wa-fab" href="https://wa.me/${site.contact.whatsapp}" target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp">${icon('whatsapp')}<span>¿Te ayudamos?</span></a>`;
}

export function crumbs(items) {
  return `<nav aria-label="Migas de pan"><ol class="crumbs">${items.map((it, i) => i === items.length - 1 ? `<li><span aria-current="page">${esc(it.name)}</span></li>` : `<li><a href="${it.href}">${esc(it.name)}</a></li>`).join('')}</ol></nav>`;
}

export function layout(ctx, { title, description, canonical, image, jsonld, page, current, body, extraHead, after = '' }) {
  return `${head({ ctx, title, description, canonical, image, jsonld, extraHead })}
<body data-page="${page}">
${header(ctx, current)}
<main id="main">
${body}
</main>
${footer(ctx)}
${mobileMenu(ctx)}
${searchOverlay(ctx)}
${cartDrawer(ctx)}
${after}
</body>
</html>`;
}
