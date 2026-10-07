// Page templates: home, catalog (all/category/collection), product, content pages.
import { icon } from '../src/js/icons.js';
import { esc, money, installment, pct } from '../src/js/format.js';
import { renderCard } from '../src/js/card.js';
import { layout, crumbs, catRail } from './components.mjs';
import { faqs } from './content.mjs';

const img = (root, key, w = 960) => `${root}assets/img/products/${key}-${w}.webp`;
const acc = (items, prefix) => `<div class="acc">${items.map((f, i) => `<div class="acc__item"><h3><button type="button" class="acc__btn" data-acc aria-expanded="false" aria-controls="${prefix}-${i}">${esc(f.q)} ${icon('plus')}</button></h3><div class="acc__panel" id="${prefix}-${i}" role="region"><div><div class="acc__content">${f.a}</div></div></div></div>`).join('')}</div>`;

function card(ctx, p, opts = {}) {
  return renderCard(ctx.record(p), { root: ctx.root, installments: ctx.site.installments_no_interest, ...opts });
}

/* ------------------------------------------------------------------ HOME */
export function home(ctx) {
  const { root, site, products, tree, collections, byHandle } = ctx;
  const c = (slug) => `${root}categorias/${slug}/`;
  const total = products.length.toLocaleString('es-AR');
  const [h1, h2, h3] = site.hero.map((h) => byHandle[h]);
  const featured = products.filter((p) => p.available && p.images.length).slice(0, 8);
  const sale = products.filter((p) => p.available && p.compare_at_price).slice(0, 8);
  const cover = (slug) => byHandle[site.covers[slug]];
  const allSubs = tree.flatMap((t) => t.children);
  const ways = [
    { icon: 'truck', ...site.shipping[0] },
    { icon: 'moto', title: 'Moto CABA y Moto Flash', eta: '2 a 5 días hábiles · o al día siguiente', text: 'Mensajería en la Ciudad de Buenos Aires. Con Moto Flash, tu pedido sale al día siguiente; la mensajería se comunica antes para coordinar.' },
    { icon: 'store', title: 'Retiro en el local', eta: 'Estándar 2 a 5 días hábiles · Flash al día siguiente', text: `${site.contact.address}, CABA. ${site.contact.pickup_hours}. Te avisamos cuando tu pedido está listo.` },
  ];
  const tile = (key, cls, alt, label, href) => `<a class="hero__tile ${cls}" href="${href}"><img src="${img(root, key)}" alt="${esc(alt)}" width="960" height="1344" ${cls ? 'fetchpriority="high"' : 'loading="eager"'} decoding="async" sizes="(min-width: 960px) 30vw, 60vw" srcset="${img(root, key, 480)} 480w, ${img(root, key, 960)} 960w"><span class="hero__tag">${esc(label)} ${icon('arrowRight')}</span></a>`;
  const body = `
<section class="hero">
  <div class="container hero__grid">
    <div class="hero__copy reveal">
      <p class="eyebrow">Papelera Avellaneda · Buenos Aires</p>
      <h1 class="display">Todo para <em>celebrar</em>, envolver y poner la mesa.</h1>
      <p class="lead">Papelería, deco y fiesta: globos, guirnaldas, servilletas, bolsas, cajas y mucho más para tus cumpleaños, regalos y encuentros. Envíos a todo el país y retiro en nuestro local de CABA.</p>
      <div class="hero__ctas">
        <a class="btn btn--lg" href="${root}productos/">Ver todos los productos ${icon('arrowRight')}</a>
        <a class="btn btn--ghost btn--lg" href="#categorias">Explorar categorías</a>
      </div>
      <ul class="hero__facts">
        <li><strong>${total}</strong><span>productos en la tienda</span></li>
        <li><strong>${site.installments_no_interest} cuotas</strong><span>sin interés</span></li>
        <li><strong>${site.returns_days} días</strong><span>para cambios y devoluciones</span></li>
      </ul>
    </div>
    <div class="hero__art reveal" style="transition-delay:.1s">
      <div class="hero__stamp" aria-hidden="true"><span>Envíos a<br>todo el país<small>Correo Argentino</small></span></div>
      ${tile(h1.images[0].key, 'hero__tile--main', h1.display_name, 'Bonetes', c('bonetes'))}
      ${tile(h2.images[0].key, '', h2.display_name, 'Deco y fiesta', c('deco-y-fiesta'))}
      ${tile(h3.images[0].key, '', h3.display_name, 'Para la mesa', c('todo-para-la-mesa'))}
    </div>
  </div>
</section>

<section class="trust" aria-label="Por qué comprar en La Pelpa!">
  <div class="container"><ul class="trust__list">
    <li class="trust__item"><span class="trust__icon">${icon('card')}</span><div><p class="trust__title">${site.installments_no_interest} cuotas sin interés</p><p class="trust__text">Con Mercado Pago. También transferencia y efectivo.</p></div></li>
    <li class="trust__item"><span class="trust__icon">${icon('truck')}</span><div><p class="trust__title">Envíos a todo el país</p><p class="trust__text">Correo Argentino a domicilio o sucursal, con seguimiento.</p></div></li>
    <li class="trust__item"><span class="trust__icon">${icon('store')}</span><div><p class="trust__title">Retiro en el local</p><p class="trust__text">${esc(site.contact.address)}, CABA · Lun a vie 10:30–17 h.</p></div></li>
    <li class="trust__item"><span class="trust__icon">${icon('returns')}</span><div><p class="trust__title">Cambios y devoluciones</p><p class="trust__text">Dentro de los ${site.returns_days} días de recibido tu pedido.</p></div></li>
  </ul></div>
</section>

<section class="section" id="categorias" aria-labelledby="cat-title">
  <div class="container">
    <div class="section-head reveal"><div class="section-head__intro"><p class="eyebrow">Comprá por categoría</p><h2 class="h2" id="cat-title">Todo lo que necesitás para cada <em>ocasión</em>.</h2></div><a class="link-arrow" href="${root}productos/">Ver los ${total} productos ${icon('arrowRight')}</a></div>
    <div class="cats">
      ${tree.map((t, i) => { const p = cover(t.slug); return `<a class="cat-tile reveal" style="transition-delay:${i * 0.06}s" href="${c(t.slug)}"><img src="${img(root, p.images[0].key, 960)}" srcset="${img(root, p.images[0].key, 480)} 480w, ${img(root, p.images[0].key, 960)} 960w" sizes="(min-width: 1024px) 24vw, 48vw" alt="" loading="lazy" decoding="async" width="960" height="1280"><span class="cat-tile__body"><span><span class="cat-tile__name">${esc(t.name)}</span><span class="cat-tile__count">${t.count} productos</span></span><span class="cat-tile__arrow">${icon('arrowRight')}</span></span></a>`; }).join('')}
    </div>
    <div class="home-subcats reveal">
      <div class="home-subcats__head"><p class="eyebrow eyebrow--plain">Explorá por tipo de producto</p><p class="home-subcats__meta">${allSubs.length} subcategorías</p></div>
      ${catRail(ctx, allSubs.map((s) => ({ href: c(s.slug), name: s.name, count: ctx.nav[s.slug].count, thumb: ctx.nav[s.slug].thumb })), { label: 'Subcategorías', grid: true })}
    </div>
  </div>
</section>

<section class="section section--surface" aria-labelledby="feat-title">
  <div class="container">
    <div class="section-head reveal"><div class="section-head__intro"><p class="eyebrow">Selección de la tienda</p><h2 class="h2" id="feat-title">Para tu próxima <em>celebración</em>.</h2></div><a class="link-arrow" href="${root}productos/">Ver todo ${icon('arrowRight')}</a></div>
    <div class="rail">${featured.map((p) => card(ctx, p)).join('')}</div>
  </div>
</section>

<section class="section" aria-label="Destacados de deco y fiesta">
  <div class="container editorial">
    <a class="story reveal" href="${c('globos')}"><div class="story__media"><img src="${root}assets/img/brand/banner-1.webp" alt="Guirnalda de globos dorados, blancos y con confetti" width="921" height="432" loading="lazy"></div><div class="story__body"><div><p class="eyebrow eyebrow--plain">Globos</p><h2 class="h3">Globos para armar tu deco</h2><p>Látex, metalizados, con confetti, números y letras.</p></div><span class="btn btn--ghost">Ver globos</span></div></a>
    <a class="story reveal" style="transition-delay:.08s" href="${c('banderines-y-guirnaldas')}"><div class="story__media"><img src="${root}assets/img/brand/banner-2.webp" alt="Banderín de tela en colores pastel con pompones" width="921" height="432" loading="lazy"></div><div class="story__body"><div><p class="eyebrow eyebrow--plain">Banderines y guirnaldas</p><h2 class="h3">Color para cada rincón</h2><p>Banderines, guirnaldas de flecos y más para decorar.</p></div><span class="btn btn--ghost">Ver banderines</span></div></a>
  </div>
</section>

${sale.length ? `<section class="section section--surface" aria-labelledby="sale-title">
  <div class="container">
    <div class="section-head reveal"><div class="section-head__intro"><p class="eyebrow">Precios especiales</p><h2 class="h2" id="sale-title">Aprovechá estas <em>ofertas</em>.</h2></div><a class="link-arrow" href="${root}productos/?oferta=1">Ver todas las ofertas ${icon('arrowRight')}</a></div>
    <div class="rail">${sale.map((p) => card(ctx, p)).join('')}</div>
  </div>
</section>` : ''}

<section class="section" aria-labelledby="coll-title">
  <div class="container">
    <div class="section-head reveal"><div class="section-head__intro"><p class="eyebrow">Colecciones</p><h2 class="h2" id="coll-title">Pequeñas cosas, grandes <em>detalles</em>.</h2></div></div>
    <div class="collections">${collections.map((s, i) => { const p = cover(s.slug); return `<a class="coll reveal" style="transition-delay:${i * 0.05}s" href="${c(s.slug)}"><span class="coll__media"><img src="${img(root, p.images[0].key, 480)}" alt="" loading="lazy" decoding="async" width="480" height="672"></span><span class="coll__name">${esc(s.name)}<span class="coll__count">${s.count} productos</span></span></a>`; }).join('')}</div>
  </div>
</section>

<section class="section section--surface" aria-labelledby="ship-title">
  <div class="container">
    <div class="section-head reveal"><div class="section-head__intro"><p class="eyebrow">Envíos y retiro</p><h2 class="h2" id="ship-title">Llega a todo el país. <em>O pasá a buscarlo.</em></h2></div><a class="link-arrow" href="${root}envios-y-devoluciones/">Envíos y devoluciones ${icon('arrowRight')}</a></div>
    <ul class="ways">${ways.map((w) => `<li class="way reveal"><span class="way__icon">${icon(w.icon)}</span><h3 class="way__title">${esc(w.title)}</h3><p class="way__eta">${esc(w.eta)}</p><p class="way__text">${esc(w.text)}</p></li>`).join('')}</ul>
  </div>
</section>

<section class="section" aria-labelledby="faq-title">
  <div class="container split">
    <div class="split__aside reveal">
      <p class="eyebrow">Preguntas frecuentes</p>
      <h2 class="h2" id="faq-title">Comprá con <em>tranquilidad</em>.</h2>
      <p class="lead">Envíos, retiros, pagos y cambios: lo que más nos consultan. ¿Te quedó alguna duda? Escribinos.</p>
      <div class="hero__ctas"><a class="btn btn--wa" href="https://wa.me/${site.contact.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp ${esc(site.contact.whatsapp_display)}</a><a class="btn btn--ghost" href="${root}preguntas-frecuentes/">Ver todas</a></div>
    </div>
    <div class="reveal">${acc(faqs(site).slice(0, 6), 'faq')}</div>
  </div>
</section>

<section class="section section--tight" aria-label="Visitanos">
  <div class="container">
    <div class="visit reveal">
      <div><p class="eyebrow">Visitanos</p><h2 class="h2" style="margin-top:.75rem">Nuestro local en <em>Av. Avellaneda</em>.</h2><p class="lead" style="margin-top:1rem">Retirá tus compras o consultanos lo que necesites.</p></div>
      <ul class="visit__list">
        <li>${icon('pin')}<div><strong>Dirección</strong>${esc(site.contact.address)}, ${esc(site.contact.city)}</div></li>
        <li>${icon('clock')}<div><strong>Atención</strong>${esc(site.contact.hours)} · Retiros ${esc(site.contact.pickup_hours.toLowerCase())}</div></li>
        <li>${icon('whatsapp')}<div><strong>WhatsApp</strong><a href="https://wa.me/${site.contact.whatsapp}" target="_blank" rel="noopener">${esc(site.contact.whatsapp_display)}</a></div></li>
        <li>${icon('mail')}<div><strong>Email</strong><a href="mailto:${site.contact.email}">${esc(site.contact.email)}</a></div></li>
        <li>${icon('instagram')}<div><strong>Instagram</strong><a href="${site.social.instagram}" target="_blank" rel="noopener">${esc(site.social.instagram_handle)}</a></div></li>
      </ul>
    </div>
  </div>
</section>

<section class="section section--tight" aria-labelledby="nl-title">
  <div class="container">
    <div class="newsletter reveal">
      <span class="newsletter__deco" aria-hidden="true"></span>
      <div><p class="eyebrow">Newsletter</p><h2 class="h2" id="nl-title" style="margin-top:.75rem">Enterate de las <em>novedades</em>.</h2><p style="margin-top:1rem">Suscribite y recibí en tu mail las novedades de la tienda.</p></div>
      <form class="newsletter__form" data-demo-form="¡Gracias! (Demo: en este concepto no se guarda ningún dato.)" novalidate>
        <label class="sr-only" for="nl-email">Tu email</label>
        <input class="input" id="nl-email" type="email" name="email" placeholder="Tu email" autocomplete="email" required>
        <button class="btn btn--light" type="submit">Suscribirme</button>
        <p class="newsletter__msg" data-form-msg hidden role="status"></p>
        <p class="newsletter__note">Concepto de diseño: el formulario no envía datos.</p>
      </form>
    </div>
  </div>
</section>`;
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'Store', name: `${site.name} · ${site.legal_name}`, url: site.base_url,
    logo: `${site.base_url}assets/img/brand/logo-ink.png`, image: `${site.base_url}assets/img/brand/og.jpg`,
    email: site.contact.email, telephone: '+54 11 6852-3157',
    address: { '@type': 'PostalAddress', streetAddress: site.contact.address, addressLocality: 'Ciudad Autónoma de Buenos Aires', addressRegion: 'CABA', addressCountry: 'AR' },
    openingHours: 'Mo-Fr 10:00-17:00', sameAs: [site.social.instagram, site.social.facebook],
  }];
  return layout(ctx, { title: '', description: site.meta_description, canonical: site.base_url, jsonld, page: 'home', body });
}

/* --------------------------------------------------------------- CATALOG */
export function catalog(ctx, scope) {
  // scope: { type: 'all'|'category'|'collection', slug, name, parent, children, items }
  const { root, site, tree, collections } = ctx;
  const c = (slug) => `${root}categorias/${slug}/`;
  const items = scope.items.slice().sort((a, b) => (b.available - a.available) || a.rank - b.rank);
  const first = items.slice(0, 24);
  const n = items.length;
  const parent = scope.parent ? ctx.catBySlug[scope.parent] : null;
  // Breadcrumb: the current level doubles as a switcher to its siblings (with counts)
  const sib = (list) => list.map((x) => ({ name: x.name, href: c(x.slug), count: x.count, current: x.slug === scope.slug }));
  const crumbItems = [{ name: 'Inicio', href: root }];
  if (scope.type === 'all') crumbItems.push({ name: 'Todos los productos' });
  else {
    crumbItems.push({ name: 'Categorías', href: `${root}categorias/` });
    if (parent) crumbItems.push({ name: parent.name, href: c(parent.slug) });
    crumbItems.push({ name: scope.name, siblings: sib(parent ? parent.children : scope.type === 'collection' ? collections : tree) });
  }

  // Visual subcategory rail (real thumbnails); "Ver todo" never repeats the category name
  const nav = ctx.nav;
  const ri = (cat, extra = {}) => ({ href: c(cat.slug), name: cat.name, count: nav[cat.slug].count, thumb: nav[cat.slug].thumb, current: cat.slug === scope.slug, ...extra });
  let railItems, railLabel;
  if (scope.type === 'all') { railItems = [...tree, ...collections].map((t) => ri(t)); railLabel = 'Categorías y colecciones'; }
  else if (scope.children?.length) { railItems = [ri(scope, { name: 'Ver todo', current: true }), ...scope.children.map((s) => ri(s))]; railLabel = `Subcategorías de ${scope.name}`; }
  else if (parent) { railItems = [ri(parent, { name: 'Ver todo', current: false }), ...parent.children.map((s) => ri(s))]; railLabel = `Subcategorías de ${parent.name}`; }
  else { railItems = [{ href: `${root}productos/`, name: 'Todos los productos', count: ctx.products.length }, ...[...tree, ...collections].filter((t) => t.slug !== scope.slug).map((t) => ri(t))]; railLabel = 'Explorá también'; }
  const chipsNav = `<div class="cathead__rail"><p class="cathead__rail-label">${scope.children?.length || parent ? 'Subcategorías' : scope.type === 'all' ? 'Comprá por categoría' : 'Explorá también'}</p>${catRail(ctx, railItems, { label: railLabel, eager: true })}</div>`;

  // Filter checkboxes: subcategories inside this scope (or top categories on "all")
  const subOptions = scope.type === 'all' ? [...tree, ...collections] : (scope.children || []);
  const count = (pred) => items.filter(pred).length;
  const saleCount = count((p) => p.compare_at_price > p.price);
  const prices = [[null, 5000, 'Hasta $5.000'], [5000, 15000, '$5.000 – $15.000'], [15000, 30000, '$15.000 – $30.000'], [30000, null, 'Más de $30.000']];
  const tree2 = `<ul class="filters__list">${tree.map((t) => `<li><a class="filters__cat" href="${c(t.slug)}"${t.slug === scope.slug || t.slug === scope.parent ? ' aria-current="page"' : ''}>${esc(t.name)} <span class="check__count">${t.count}</span></a>${(t.slug === scope.slug || t.slug === scope.parent) && t.children.length ? `<ul class="filters__list">${t.children.map((s) => `<li><a class="filters__cat" href="${c(s.slug)}"${s.slug === scope.slug ? ' aria-current="page"' : ''}>${esc(s.name)} <span class="check__count">${s.count}</span></a></li>`).join('')}</ul>` : ''}</li>`).join('')}<li><a class="filters__cat" href="${root}productos/"${scope.type === 'all' ? ' aria-current="page"' : ''}>Todos los productos <span class="check__count">${ctx.products.length}</span></a></li></ul>`;
  const filters = `<div id="filters" class="filters">
    ${subOptions.length ? `<fieldset class="filters__group" style="border:0;margin:0;padding-inline:0"><legend class="filters__title">${scope.type === 'all' ? 'Categoría' : 'Tipo de producto'}</legend><div class="filters__list">${subOptions.map((s) => `<label class="check"><input type="checkbox" name="sub" value="${s.slug}"> ${esc(s.name)} <span class="check__count">${count((p) => p.categories.includes(s.slug))}</span></label>`).join('')}</div></fieldset>` : ''}
    <fieldset class="filters__group" style="border:0;margin:0;padding-inline:0"><legend class="filters__title">Precio</legend>
      <div class="filters__price"><label class="sr-only" for="f-min">Precio mínimo</label><input class="input" id="f-min" type="number" inputmode="numeric" min="0" step="100" name="min" placeholder="Mín."><span>–</span><label class="sr-only" for="f-max">Precio máximo</label><input class="input" id="f-max" type="number" inputmode="numeric" min="0" step="100" name="max" placeholder="Máx."></div>
      <div class="filters__presets">${prices.map(([a, b, l]) => `<button type="button" class="chip" data-preset data-min="${a ?? ''}" data-max="${b ?? ''}">${l}</button>`).join('')}</div>
    </fieldset>
    <fieldset class="filters__group" style="border:0;margin:0;padding-inline:0"><legend class="filters__title">Disponibilidad</legend>
      <label class="check"><input type="checkbox" name="stock"> Solo con stock <span class="check__count">${count((p) => p.available)}</span></label>
      ${saleCount ? `<label class="check"><input type="checkbox" name="sale"> En oferta <span class="check__count">${saleCount}</span></label>` : ''}
    </fieldset>
    <div class="filters__group"><p class="filters__title">Categorías</p>${tree2}</div>
  </div>`;

  const title = scope.type === 'all' ? 'Todos los productos' : scope.name;
  const avail = items.filter((p) => p.available);
  const minP = avail.length ? Math.min(...avail.map((p) => p.price)) : null;
  const saleN = saleCount;
  const kicker = scope.type === 'all' ? 'Tienda' : scope.type === 'collection' ? 'Colección' : parent ? parent.name : 'Categoría';
  // Only real copy: the store's own category text when it exists, otherwise a factual line
  const desc = scope.type === 'all' ? `${esc(site.tagline)}: el catálogo completo de La Pelpa!, en ${tree.length} categorías y ${collections.length} colecciones.`
    : nav[scope.slug].description ? esc(nav[scope.slug].description)
    : parent ? `Parte de <a href="${c(parent.slug)}">${esc(parent.name)}</a>.`
    : scope.children?.length ? `${scope.children.length} subcategorías para elegir.` : '';
  const mosaic = scope.type === 'all' ? tree.slice(0, 3).map((t) => nav[t.slug].mosaic[0]).filter(Boolean) : nav[scope.slug].mosaic;
  const label = (p) => {
    const subs = scope.type === 'all' ? tree.map((t) => t.slug) : (scope.children || []).map((s) => s.slug);
    const k = p.categories.find((s) => subs.includes(s)) || p.categories.find((s) => s !== scope.slug);
    return k ? ctx.catBySlug[k].name : '';
  };
  const body = `
<section class="cathead">
  <div class="container">
    ${crumbs(crumbItems)}
    <div class="cathead__grid${mosaic.length ? '' : ' cathead__grid--solo'}">
      <div class="cathead__copy">
        <p class="eyebrow">${esc(kicker)}</p>
        <div class="cathead__titlerow">
          <h1 class="cathead__title" data-page-title>${esc(title)}</h1>
          ${mosaic[0] ? `<span class="cathead__thumb" aria-hidden="true"><img src="${root}${scope.type === 'all' ? `assets/img/nav/${tree[0].slug}.webp` : nav[scope.slug].thumb}" alt="" width="120" height="120"></span>` : ''}
        </div>
        ${desc ? `<p class="cathead__desc">${desc}</p>` : ''}
        <ul class="cathead__stats">
          <li><strong data-count>${n.toLocaleString('es-AR')} productos</strong></li>
          ${minP ? `<li>Desde <strong>${money(minP)}</strong></li>` : ''}
          ${saleN ? `<li><a href="?oferta=1" data-quick-link="sale"><strong>${saleN}</strong> en oferta</a></li>` : ''}
          <li>${site.installments_no_interest} cuotas sin interés</li>
        </ul>
      </div>
      ${mosaic.length ? `<div class="cathead__art" aria-hidden="true">${mosaic.map((m, i) => `<span class="cathead__tile cathead__tile--${i}"><img src="${img(root, m.images[0].key, i ? 480 : 960)}" alt="" width="${i ? 480 : 960}" height="${i ? 672 : 1344}" ${i ? 'loading="lazy" ' : 'fetchpriority="high" '}decoding="async"></span>`).join('')}</div>` : ''}
    </div>
    ${chipsNav}
  </div>
</section>
<div class="container catalog" data-catalog data-scope-type="${scope.type === 'collection' ? 'category' : scope.type}" data-scope="${scope.slug || ''}">
  <aside class="catalog__aside" aria-label="Filtros">${filters}</aside>
  <div>
    <div class="toolbar" data-toolbar>
      <p class="toolbar__count" data-count aria-live="polite">${n.toLocaleString('es-AR')} productos</p>
      <div class="toolbar__right">
        <button type="button" class="tchip tchip--filter" data-open-filters aria-controls="filters-drawer">${icon('sliders')}Filtrar<span class="tchip__badge" data-filter-badge hidden>0</span></button>
        <label class="tchip tchip--sort"><span class="sort-label">Ordenar</span><select class="tchip__select" id="sort" name="orden" aria-label="Ordenar productos">
          <option value="destacados">Destacados</option>
          <option value="precio-asc">Menor precio</option>
          <option value="precio-desc">Mayor precio</option>
          <option value="az">Nombre A–Z</option>
          <option value="za">Nombre Z–A</option>
        </select>${icon('chevronDown')}</label>
        ${scope.children?.length
          // Parent category: in-place subcategory filter chips with counts (sticky on mobile)
          ? `<span class="toolbar__div" aria-hidden="true"></span><span class="toolbar__subs" role="group" aria-label="Filtrar por subcategoría">${scope.children.map((s) => `<button type="button" class="tchip tchip--sub" data-sub-chip="${s.slug}" aria-pressed="false">${esc(s.name)} <span class="tchip__n">${s.count}</span></button>`).join('')}</span>`
          : `${saleCount ? `<button type="button" class="tchip tchip--quick" data-quick="sale" aria-pressed="false">${icon('sparkle')}En oferta <span class="tchip__n">${saleCount}</span></button>` : ''}
        <button type="button" class="tchip tchip--quick" data-quick="stock" aria-pressed="false">Con stock</button>
        <button type="button" class="tchip tchip--quick" data-quick="p5000" aria-pressed="false">Hasta $5.000</button>`}
      </div>
    </div>
    <div class="active-filters" data-active></div>
    <div class="grid grid--catalog" data-grid>${first.map((p, i) => card(ctx, p, { eager: i < 4, catLabel: label(p) })).join('')}</div>
    <div class="empty" data-empty hidden>${icon('search')}<p class="h4">No encontramos productos con esos filtros</p><p class="muted">Probá quitar algún filtro o buscá con otra palabra.</p><button type="button" class="btn btn--ghost" data-reset-filters>Limpiar filtros</button></div>
    <div class="load-more" data-more>
      <p class="load-more__text" data-more-text>Mostrando ${Math.min(24, n)} de ${n.toLocaleString('es-AR')}</p>
      <div class="load-more__bar" aria-hidden="true"><span data-more-bar style="width:${n ? (Math.min(24, n) / n) * 100 : 0}%"></span></div>
      <button type="button" class="btn btn--ghost" data-more-btn${n <= 24 ? ' hidden' : ''}>Ver más productos</button>
      <noscript><p class="muted small">Activá JavaScript para ver todos los productos y usar los filtros.</p></noscript>
    </div>
  </div>
</div>`;
  const after = `<div class="drawer drawer--left" id="filters-drawer" role="dialog" aria-modal="true" aria-labelledby="filters-title" aria-hidden="true">
  <button type="button" class="drawer__scrim" data-close tabindex="-1" aria-label="Cerrar filtros"></button>
  <div class="drawer__panel">
    <div class="drawer__head"><h2 class="drawer__title" id="filters-title">Filtrar</h2><button type="button" class="icon-btn" data-close aria-label="Cerrar filtros">${icon('close')}</button></div>
    <div class="drawer__body"></div>
    <div class="drawer__foot" style="display:grid;grid-template-columns:auto 1fr;gap:.75rem"><button type="button" class="btn btn--ghost" data-reset-filters>Limpiar</button><button type="button" class="btn" data-close>Ver <span data-count>${n} productos</span></button></div>
  </div>
</div>`;
  const path = scope.type === 'all' ? 'productos/' : `categorias/${scope.slug}/`;
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbItems.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, ...(it.href ? { item: ctx.abs(it.href) } : {}) })) }];
  return layout(ctx, {
    title, description: scope.type === 'all' ? `Todos los productos de La Pelpa!: ${n} artículos de papelería, deco y fiesta.` : `${scope.name}: ${n} productos en La Pelpa! · Papelera Avellaneda. Envíos a todo el país y retiro en CABA.`,
    canonical: site.base_url + path, page: 'catalog', current: scope.parent || scope.slug, here: scope.slug, body, after, jsonld,
  });
}

/* --------------------------------------------------------------- PRODUCT */
export function product(ctx, p) {
  const { root, site } = ctx;
  const c = (slug) => `${root}categorias/${slug}/`;
  const primary = ctx.primaryCat(p);
  const crumbItems = [{ name: 'Inicio', href: root }];
  if (primary?.parent) crumbItems.push({ name: ctx.catBySlug[primary.parent].name, href: c(primary.parent) });
  if (primary) crumbItems.push({ name: primary.name, href: c(primary.slug) });
  else crumbItems.push({ name: 'Productos', href: `${root}productos/` });
  crumbItems.push({ name: p.display_name });

  const v0 = p.variants.find((v) => v.available) || p.variants[0];
  const off = pct(v0.price, v0.compare_at_price);
  const imgs = p.images;
  const fit = (im) => (ctx.fit(im) === 'c' ? ' class="fit-contain"' : '');
  const gallery = `<div class="gallery">
    <div class="gallery__wrap">
      <div class="gallery__main" data-gallery tabindex="0" aria-label="Galería de imágenes de ${esc(p.display_name)}" role="region">
        ${imgs.map((im, i) => `<div class="gallery__slide" id="img-${i}"><img${fit(im)} src="${img(root, im.key, 960)}" srcset="${img(root, im.key, 480)} 480w, ${img(root, im.key, 960)} 960w" sizes="(min-width: 960px) 50vw, 100vw" alt="${esc(p.display_name)}${imgs.length > 1 ? ` — imagen ${i + 1} de ${imgs.length}` : ''}" width="${im.w}" height="${im.h}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></div>`).join('')}
      </div>
      <div class="gallery__badges">${!p.available ? '<span class="badge badge--soldout">Sin stock</span>' : ''}<span class="badge badge--sale" data-sale-badge${off && p.available ? '' : ' hidden'}>−${off}%</span></div>
      ${imgs.length > 1 ? `<div class="gallery__nav"><button type="button" class="icon-btn" data-gallery-prev aria-label="Imagen anterior">${icon('chevronLeft')}</button><button type="button" class="icon-btn" data-gallery-next aria-label="Imagen siguiente">${icon('chevronRight')}</button></div>` : ''}
    </div>
    ${imgs.length > 1 ? `<ul class="gallery__thumbs" aria-label="Miniaturas">${imgs.map((im, i) => `<li><button type="button" data-thumb aria-label="Ver imagen ${i + 1}" aria-current="${i === 0}"><img src="${img(root, im.key, 480)}" alt="" loading="lazy" width="76" height="106"></button></li>`).join('')}</ul>
    <div class="gallery__dots">${imgs.map((_, i) => `<button type="button" data-dot aria-label="Ver imagen ${i + 1}" aria-current="${i === 0}"></button>`).join('')}</div>` : ''}
  </div>`;

  const options = p.option_names.map((name, gi) => {
    const values = [...new Set(p.variants.map((v) => v.options[gi]).filter((x) => x != null))];
    return `<fieldset class="option" data-option="${gi}"><legend>${esc(name)}:<span data-selected>${esc(v0.options[gi] || '')}</span></legend><div class="option__values">${values.map((val) => `<button type="button" class="option__btn" data-value="${esc(val)}" aria-pressed="${val === v0.options[gi]}">${esc(val)}</button>`).join('')}</div></fieldset>`;
  }).join('');

  const desc = p.description.length ? p.description.map((t) => `<p>${esc(t.charAt(0).toUpperCase() + t.slice(1))}</p>`).join('') : '';
  const sections = [
    desc ? { q: 'Descripción', a: `<div class="desc">${desc}</div>`, open: true } : null,
    { q: 'Envíos y retiro', a: `<ul><li><strong>Correo Argentino:</strong> a domicilio o sucursal en todo el país, dentro de los 10 días hábiles.</li><li><strong>Moto CABA:</strong> 2 a 5 días hábiles. <strong>Moto Flash:</strong> al día siguiente.</li><li><strong>Retiro en el local:</strong> ${esc(site.contact.address)}, CABA (estándar 2 a 5 días hábiles, flash al día siguiente).</li></ul><p>El costo de envío se calcula durante la compra. <a href="${root}envios-y-devoluciones/">Más información</a></p>` },
    { q: 'Cambios y devoluciones', a: `<p>Tenés ${site.returns_days} días desde que recibís tu pedido. El producto debe estar sin usar, en su estado original y con sus envoltorios. <a href="${root}envios-y-devoluciones/#devoluciones">Ver política completa</a></p>` },
    { q: 'Medios de pago', a: `<ul><li>Mercado Pago: hasta ${site.installments_no_interest} cuotas sin interés con tarjeta.</li><li>Transferencia o depósito bancario.</li><li>Efectivo.</li></ul>` },
  ].filter(Boolean);

  const related = ctx.related(p, 8);
  const pdata = {
    id: p.id, h: p.handle, n: p.display_name, options: p.option_names,
    images: imgs.map((i) => i.key),
    variants: p.variants.map((v) => ({ id: v.id, o: v.options, p: v.price, c: v.compare_at_price, s: v.stock, a: v.available, img: v.image })),
  };
  const waMsg = encodeURIComponent(`Hola! Tengo una consulta sobre: ${p.display_name} (${site.original_url}productos/${p.handle}/)`);
  const body = `
<div class="container" style="padding-top:clamp(1rem,.5rem + 1.5vw,2rem)">
  <div class="pdp">
    ${gallery}
    <div class="buybox">
      ${crumbs(crumbItems)}
      <h1 class="buybox__title">${esc(p.display_name)}</h1>
      <div class="buybox__price">
        <div class="price"><span class="price__now${off ? ' price__now--sale' : ''}" data-price-now>${money(v0.price)}</span><span class="price__was" data-price-was${off ? '' : ' hidden'}><span class="sr-only">Precio anterior: </span><span data-was>${off ? money(v0.compare_at_price) : ''}</span></span></div>
        <p class="buybox__inst">${icon('card')}<span><strong>${site.installments_no_interest} cuotas sin interés</strong> de <span data-installments>${installment(v0.price, site.installments_no_interest)}</span></span></p>
      </div>
      ${options}
      <p class="stock" data-stock role="status">${p.available ? 'En stock · listo para enviar' : 'Sin stock'}</p>
      <div class="buybox__actions">
        <div class="qty" role="group" aria-label="Cantidad">
          <button type="button" data-qty-dec aria-label="Restar uno">${icon('minus')}</button>
          <input type="number" inputmode="numeric" min="1" value="1" data-qty-input aria-label="Cantidad">
          <button type="button" data-qty-inc aria-label="Sumar uno">${icon('plus')}</button>
        </div>
        <button type="button" class="btn btn--accent btn--lg" data-atc${v0.available ? '' : ' disabled'}>${icon('bag')}<span data-atc-label>${v0.available ? 'Agregar al carrito' : 'Sin stock'}</span></button>
        <a class="btn btn--wa" href="https://wa.me/${site.contact.whatsapp}?text=${waMsg}" target="_blank" rel="noopener">${icon('whatsapp')}Consultar por WhatsApp</a>
      </div>
      <ul class="assurances">
        <li>${icon('truck')}<span><strong>Envíos a todo el país</strong> por Correo Argentino, o moto en CABA.</span></li>
        <li>${icon('store')}<span><strong>Retiro en el local</strong> · ${esc(site.contact.address)}, CABA.</span></li>
        <li>${icon('returns')}<span><strong>${site.returns_days} días</strong> para cambios y devoluciones.</span></li>
        <li>${icon('lock')}<span><strong>Pagos con Mercado Pago</strong>, transferencia o efectivo.</span></li>
      </ul>
      <div class="acc">${sections.map((s, i) => `<div class="acc__item"><h2><button type="button" class="acc__btn" data-acc aria-expanded="${s.open ? 'true' : 'false'}" aria-controls="pd-${i}">${esc(s.q)} ${icon('plus')}</button></h2><div class="acc__panel${s.open ? ' is-open' : ''}" id="pd-${i}" role="region"><div><div class="acc__content">${s.a}</div></div></div></div>`).join('')}</div>
    </div>
  </div>
</div>
${related.length ? `<section class="section section--surface" aria-labelledby="rel-title">
  <div class="container">
    <div class="section-head"><div class="section-head__intro"><p class="eyebrow">${primary ? esc(primary.name) : 'Productos'}</p><h2 class="h2" id="rel-title">También te puede <em>gustar</em>.</h2></div>${primary ? `<a class="link-arrow" href="${c(primary.slug)}">Ver todo ${icon('arrowRight')}</a>` : ''}</div>
    <div class="rail">${related.map((r) => card(ctx, r)).join('')}</div>
  </div>
</section>` : ''}
<div class="sticky-atc" aria-hidden="false">
  <div class="sticky-atc__info"><p class="sticky-atc__name">${esc(p.display_name)}</p><p class="sticky-atc__price" data-sticky-price>${money(v0.price)}</p></div>
  <button type="button" class="btn btn--accent" data-sticky-atc${v0.available ? '' : ' disabled'}>${icon('bag')}<span data-atc-label>${v0.available ? 'Agregar al carrito' : 'Sin stock'}</span></button>
</div>
<script type="application/json" id="product-data">${JSON.stringify(pdata).replace(/</g, '\\u003c')}</script>`;
  const url = `${site.base_url}productos/${p.handle}/`;
  const ogImg = imgs[0] ? `${site.base_url}assets/img/products/${imgs[0].key}-960.webp` : undefined;
  const descText = p.description.join(' ').slice(0, 155) || `${p.display_name} en La Pelpa! · Papelera Avellaneda. Envíos a todo el país.`;
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'Product', name: p.display_name, url,
    image: imgs.map((i) => `${site.base_url}assets/img/products/${i.key}-960.webp`),
    description: p.description.join(' ') || undefined, brand: { '@type': 'Brand', name: 'La Pelpa!' },
    offers: p.variants.length > 1
      ? { '@type': 'AggregateOffer', priceCurrency: 'ARS', lowPrice: p.price, highPrice: p.price_max, offerCount: p.variants.length, availability: p.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' }
      : { '@type': 'Offer', priceCurrency: 'ARS', price: v0.price, availability: v0.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url },
  }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbItems.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, ...(it.href ? { item: ctx.abs(it.href) } : {}) })) }];
  return layout(ctx, { title: p.display_name, description: descText, canonical: url, image: ogImg, jsonld, page: 'product', current: primary?.parent || primary?.slug, here: primary?.slug, body });
}

/* --------------------------------------------------------- CONTENT PAGES */
function contentPage(ctx, { slug, title, eyebrow, intro, html, description }) {
  const { root, site } = ctx;
  const body = `
<div class="container container--narrow page-head">
  ${crumbs([{ name: 'Inicio', href: root }, { name: title }])}
  ${eyebrow ? `<p class="eyebrow" style="margin-bottom:.75rem">${esc(eyebrow)}</p>` : ''}
  <h1 class="page-head__title">${esc(title)}</h1>
  ${intro ? `<p class="lead" style="margin-top:1rem">${intro}</p>` : ''}
</div>
<div class="container container--narrow" style="padding-bottom:var(--section-y)">
  <nav class="policy-nav" aria-label="Ayuda">
    <a class="chip"${slug === 'envios-y-devoluciones' ? ' aria-current="page"' : ''} href="${root}envios-y-devoluciones/">Envíos y devoluciones</a>
    <a class="chip"${slug === 'preguntas-frecuentes' ? ' aria-current="page"' : ''} href="${root}preguntas-frecuentes/">Preguntas frecuentes</a>
    <a class="chip"${slug === 'contacto' ? ' aria-current="page"' : ''} href="${root}contacto/">Contacto</a>
    <a class="chip"${slug === 'terminos-y-condiciones' ? ' aria-current="page"' : ''} href="${root}terminos-y-condiciones/">Términos y condiciones</a>
  </nav>
  ${html}
</div>`;
  return layout(ctx, { title, description: description || intro?.replace(/<[^>]+>/g, ''), canonical: `${site.base_url}${slug}/`, page: 'content', body });
}

export function shippingPage(ctx) {
  const { site } = ctx;
  const ways = site.shipping.map((w) => `<li class="way"><span class="way__icon">${icon(w.id === 'correo' ? 'truck' : w.id.startsWith('pickup') ? 'store' : w.id === 'flash' ? 'bolt' : 'moto')}</span><h3 class="way__title">${esc(w.title)}</h3><p class="way__eta">${esc(w.eta)}</p><p class="way__text">${esc(w.text)}</p></li>`).join('');
  const html = `
  <h2 class="h3" style="margin-bottom:1.25rem">Envío y seguimiento</h2>
  <ul class="ways" style="margin-bottom:2rem">${ways}</ul>
  <div class="prose">
    <p>Los pedidos se entregan a través de Correo Argentino en toda la República Argentina. <strong>El costo de envío</strong> se indica durante la compra, antes de finalizar el pedido, y corre por cuenta del cliente.</p>
    <p>Los retiros se realizan de ${esc(site.contact.pickup_hours.toLowerCase())} en ${esc(site.contact.address)}, CABA, y se entregan solo con el número de pedido y el nombre de quien hizo la compra (o el de la persona que indicaste para retirar). Si no recibiste la notificación de que tu pedido está listo, comunicate con nosotros para consultar su estado.</p>
    <h3>¿Puedo hacer el seguimiento de mi pedido?</h3>
    <p>Te enviamos un mensaje con un código de seguimiento (tracking number) y las instrucciones para que puedas seguir tu pedido.</p>
    <h3>No recibí mi pedido y ya pasó el plazo de entrega</h3>
    <p>Es inusual. Comunicate con nosotros por mail o WhatsApp para que podamos ayudarte, y tené a mano tu número de pedido.</p>
    <h3>¿Qué pasa si no hay nadie cuando traen mi pedido?</h3>
    <p>Si no hay nadie en el domicilio que nos indicaste, el correo regresará a las 48 horas. Si tampoco encuentra a nadie, deberás dirigirte al centro de distribución asignado dentro de las 72 horas con tu DNI y el código de seguimiento.</p>
    <h3>No estaba en mi domicilio y no pude retirar mi pedido</h3>
    <p>Pasado el plazo de espera en la sucursal del correo, el paquete vuelve a nuestro local (puede demorar de 5 a 15 días hábiles). Cuando regrese, podés cancelar el pedido y solicitar el reembolso de la mercadería (el valor del envío no se reintegra) o pedir un nuevo envío, que se abona nuevamente.</p>
    <h3>¿Puede recibir el paquete otra persona?</h3>
    <p>Sí, cualquier persona mayor de 18 años que se encuentre en el domicilio registrado.</p>

    <h2 id="devoluciones">Devoluciones</h2>
    <p>Queremos que estés conforme con tu compra. Si no lo estás, podés devolver el artículo y recibir un reembolso o un cambio.</p>
    <h3>Devolución de productos</h3>
    <p>Los productos se pueden devolver dentro de los ${site.returns_days} días posteriores a la recepción del pedido. El artículo debe estar en su estado original, sin usar y con todas sus etiquetas y envoltorios originales; de lo contrario no podremos procesar la devolución. Incluí la factura original para agilizar el proceso. Los costos de envío de la devolución son responsabilidad del cliente.</p>
    <h3>Reembolsos</h3>
    <p>Cuando recibimos el artículo lo inspeccionamos para confirmar que esté en su estado original. Si se acepta la devolución, se reembolsa el precio original del producto, en la misma forma de pago utilizada para la compra. Los gastos de envío originales no son reembolsables.</p>
    <h3>Cambio de productos</h3>
    <p>Para cambiar un producto por otro, primero devolvé el original siguiendo los pasos anteriores. Al recibirlo te reembolsamos el precio original y podés hacer una nueva compra en el sitio.</p>
    <h3>Productos defectuosos o dañados</h3>
    <p>Si recibís un producto defectuoso o dañado, comunicate con nosotros lo antes posible. En ese caso, los costos de envío los cubre la tienda.</p>
    <h3>Cambios en esta política</h3>
    <p>La tienda se reserva el derecho de modificar sus políticas de devolución en cualquier momento; los cambios se publicarán en este sitio.</p>
  </div>`;
  return contentPage(ctx, { slug: 'envios-y-devoluciones', title: 'Envíos y devoluciones', eyebrow: 'Ayuda', intro: 'Envíos a todo el país, mensajería en CABA y retiro en nuestro local de Av. Avellaneda.', html });
}

export function faqPage(ctx) {
  const html = acc(faqs(ctx.site), 'faqp') + `<div class="visit" style="margin-top:3rem"><div><h2 class="h3">¿No encontraste tu respuesta?</h2><p class="muted" style="margin:.5rem 0 0">Escribinos y te ayudamos. ${esc(ctx.site.contact.hours)}.</p></div><div class="hero__ctas"><a class="btn btn--wa" href="https://wa.me/${ctx.site.contact.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp</a><a class="btn btn--ghost" href="mailto:${ctx.site.contact.email}">${icon('mail')}Email</a></div></div>`;
  return contentPage(ctx, { slug: 'preguntas-frecuentes', title: 'Preguntas frecuentes', eyebrow: 'Ayuda', intro: 'Todo sobre envíos, retiros, pagos, cambios y devoluciones.', html });
}

export function contactPage(ctx) {
  const { site } = ctx;
  const c = site.contact;
  const map = encodeURIComponent(`${c.address}, Ciudad Autónoma de Buenos Aires, Argentina`);
  const html = `<div class="contact-grid">
    <div style="display:grid;gap:1.25rem;align-content:start">
      <ul class="visit__list contact-card">
        <li>${icon('whatsapp')}<div><strong>WhatsApp</strong><a href="https://wa.me/${c.whatsapp}" target="_blank" rel="noopener">${esc(c.whatsapp_display)}</a></div></li>
        <li>${icon('phone')}<div><strong>Teléfono</strong><a href="tel:+54${c.phone}">${esc(c.whatsapp_display)}</a></div></li>
        <li>${icon('mail')}<div><strong>Email</strong><a href="mailto:${c.email}">${esc(c.email)}</a></div></li>
        <li>${icon('pin')}<div><strong>Local</strong>${esc(c.address)}, ${esc(c.city)}</div></li>
        <li>${icon('clock')}<div><strong>Horario de atención</strong>${esc(c.hours)}</div></li>
        <li>${icon('instagram')}<div><strong>Instagram</strong><a href="${site.social.instagram}" target="_blank" rel="noopener">${esc(site.social.instagram_handle)}</a></div></li>
      </ul>
      <iframe class="map-frame" title="Mapa: ${esc(c.address)}, CABA" src="https://www.google.com/maps?q=${map}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
    <form class="contact-form contact-card" data-demo-form="Gracias por tu mensaje. (Demo: en este concepto el formulario no envía datos.)">
      <h2 class="h3">Escribinos</h2>
      <div class="field"><label for="cf-name">Nombre</label><input class="input" id="cf-name" name="name" autocomplete="name" required></div>
      <div class="field"><label for="cf-email">Email</label><input class="input" id="cf-email" type="email" name="email" autocomplete="email" required></div>
      <div class="field"><label for="cf-phone">Teléfono <span class="muted" style="text-transform:none;letter-spacing:0;font-weight:400">(opcional)</span></label><input class="input" id="cf-phone" type="tel" name="phone" autocomplete="tel"></div>
      <div class="field"><label for="cf-msg">Mensaje</label><textarea class="input" id="cf-msg" name="message" rows="5" required></textarea></div>
      <button class="btn btn--block btn--lg" type="submit">Enviar mensaje</button>
      <p class="notice" data-form-msg hidden role="status"></p>
      <p class="muted small" style="margin:0">Concepto de diseño: este formulario no envía datos. Para consultas reales, usá WhatsApp o email.</p>
    </form>
  </div>`;
  return contentPage(ctx, { slug: 'contacto', title: 'Contacto', eyebrow: 'Estamos para ayudarte', intro: `Atendemos de ${c.hours.toLowerCase()}. La forma más rápida de contactarnos es por WhatsApp.`, html });
}

export function termsPage(ctx, blocks) {
  const html = `<div class="prose">${blocks.map(([t, x], i) => {
    if (i === 1) return '';
    if (t === 'h') return i === 0 ? `<p class="muted small">${esc(x)}</p>` : `<h2>${esc(x)}</h2>`;
    return `<p>${esc(x)}</p>`;
  }).join('')}</div>`;
  return contentPage(ctx, { slug: 'terminos-y-condiciones', title: 'Términos y condiciones', eyebrow: 'Legal', intro: 'Condiciones de uso del sitio de La Pelpa!', html });
}

export function notFound(ctx) {
  const { root } = ctx;
  const body = `<div class="container container--narrow empty" style="min-height:50vh">${icon('search')}<p class="eyebrow eyebrow--plain">Error 404</p><h1 class="h2">No encontramos esta página</h1><p class="muted">Puede que el enlace haya cambiado. Buscá lo que necesitás o volvé al inicio.</p><div class="hero__ctas" style="justify-content:center"><a class="btn" href="${root}">Ir al inicio</a><a class="btn btn--ghost" href="${root}productos/">Ver productos</a></div></div>`;
  return layout(ctx, { title: 'Página no encontrada', canonical: ctx.site.base_url, page: '404', body });
}

/* ------------------------------------------------------- CATEGORIES HUB */
// All categories at a glance, grouped by shopping intent (one intent per top category),
// each with visual subcategory cards and real counts.
export function hubPage(ctx) {
  const { root, site, tree, collections, nav, products } = ctx;
  const c = (slug) => `${root}categorias/${slug}/`;
  const nSubs = tree.reduce((a, t) => a + t.children.length, 0);
  const cc = (cat, extra = {}) => ({ href: c(cat.slug), name: cat.name, count: nav[cat.slug].count, thumb: nav[cat.slug].thumb, ...extra });
  const section = (t, i) => {
    const n = nav[t.slug];
    return `<section class="hub__sec reveal" aria-labelledby="hub-${t.slug}">
      <div class="hub__head">
        <a class="hub__cover" href="${c(t.slug)}" tabindex="-1" aria-hidden="true">${n.mosaic[0] ? `<img src="${img(root, n.mosaic[0].images[0].key, 480)}" alt="" width="480" height="672" ${i ? 'loading="lazy" ' : ''}decoding="async">` : ''}</a>
        <div class="hub__intro">
          ${t.intent ? `<p class="eyebrow">${esc(t.intent)}</p>` : ''}
          <h2 class="hub__title" id="hub-${t.slug}"><a href="${c(t.slug)}">${esc(t.name)}</a></h2>
          <p class="hub__meta">${n.count.toLocaleString('es-AR')} productos${t.children.length ? ` · ${t.children.length} subcategorías` : ''}${n.min ? ` · desde ${money(n.min)}` : ''}</p>
          ${n.description ? `<p class="hub__desc">${esc(n.description)}</p>` : ''}
          <a class="btn btn--ghost btn--sm" href="${c(t.slug)}">Ver todo ${icon('arrowRight')}</a>
        </div>
      </div>
      ${t.children.length ? catRail(ctx, t.children.map((s) => cc(s)), { label: `Subcategorías de ${t.name}`, grid: true }) : `<div class="hub__picks">${n.picks.slice(0, 4).map((p) => card(ctx, p)).join('')}</div>`}
    </section>`;
  };
  const body = `
<section class="cathead cathead--hub">
  <div class="container">
    ${crumbs([{ name: 'Inicio', href: root }, { name: 'Categorías' }])}
    <p class="eyebrow">Tienda</p>
    <h1 class="cathead__title">Todas las categorías</h1>
    <p class="cathead__desc">${tree.length} categorías, ${nSubs} subcategorías y ${collections.length} colecciones para encontrar rápido lo que buscás.</p>
    <ul class="cathead__stats">
      <li><strong>${products.length.toLocaleString('es-AR')}</strong> productos</li>
      ${ctx.saleCountAll ? `<li><a href="${root}productos/?oferta=1"><strong>${ctx.saleCountAll}</strong> en oferta</a></li>` : ''}
      <li>${site.installments_no_interest} cuotas sin interés</li>
    </ul>
    <nav class="hub__jump" aria-label="Ir a">${tree.map((t) => `<a class="chip" href="#hub-${t.slug}">${esc(t.name)} <span class="chip__count">${nav[t.slug].count}</span></a>`).join('')}<a class="chip" href="#hub-colecciones">Colecciones <span class="chip__count">${collections.length}</span></a></nav>
  </div>
</section>
<div class="container hub">
  ${tree.map(section).join('')}
  <section class="hub__sec reveal" aria-labelledby="hub-colecciones">
    <div class="hub__intro hub__intro--solo"><p class="eyebrow">Selecciones de La Pelpa!</p><h2 class="hub__title" id="hub-colecciones">Colecciones</h2><p class="hub__meta">${collections.length} colecciones</p></div>
    ${catRail(ctx, collections.map((s) => cc(s)), { label: 'Colecciones', grid: true })}
  </section>
</div>`;
  return layout(ctx, { title: 'Todas las categorías', description: `Todas las categorías de La Pelpa!: ${tree.map((t) => t.name.toLowerCase()).join(', ')} y colecciones.`, canonical: `${site.base_url}categorias/`, page: 'hub', current: '', body });
}
