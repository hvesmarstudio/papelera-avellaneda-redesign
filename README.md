# La Pelpa! · Papelera Avellaneda — Concept redesign

**Live demo:** https://hvesmarstudio.github.io/papelera-avellaneda-redesign/

An unofficial, concept redesign of the online store [papeleraavellaneda.com](https://papeleraavellaneda.com/) (La Pelpa! — papelería, deco y fiesta, Buenos Aires), created by **Hvesmar Studio** as a proposal for the brand.

> ⚠️ This is a design concept, not the official store. No orders or payments are processed. Products, prices, stock and policies were captured from the current public site on **7 October 2026** and may be out of date. All pages carry `noindex` so the demo never competes with the real store in search engines.

---

## What's inside

- **The full catalog — 1,142 products** with 2,149 variants and 3,103 product photos (re-encoded to WebP at 480 px and 960 px), in 29 categories, subcategories and collections. Everything mirrors the live store: names, ARS prices, sale prices, variants (color/size/design…), stock status and descriptions.
- **Real store information only:** WhatsApp, email, address (Av. Avellaneda 2871, CABA), opening and pickup hours, shipping methods (Correo Argentino, Moto CABA, Moto Flash, store pickup), the 30-day returns policy, payment methods (Mercado Pago with 3 interest-free installments, bank transfer, cash), Instagram/Facebook, the legally required consumer-protection link and the "Botón de arrepentimiento". No reviews, ratings, testimonials or stats were invented.

## Main improvements over the current site

| Area | Current site | Concept |
|---|---|---|
| Brand and look | Generic theme with a red accent | Calm, airy minimalism: soft warm neutrals, large product imagery on soft backgrounds, understated Fraunces + Inter type with small tracked labels, pill buttons and chips, consistent rounded corners (radius tokens), subtle motion. Brand red is kept for sale prices, badges and "Ofertas" only |
| Home | Slider and product list | A clear value proposition, trust strip (installments, nationwide shipping, pickup, returns), visual category tiles, featured and on-sale rails, collections, shipping methods, FAQ, store/visit block and newsletter |
| Navigation | Long uppercase menus | Full-screen mobile menu (search, quick chips, visual category rows with real thumbnails and counts, drill-down sub-panels, store/help block, iOS safe areas). Desktop mega menu with category column, subcategory thumbnails and a real featured product, with hover intent and full keyboard support. Slim sticky header on scroll. Collections the store already has but doesn't show in its menu (Para regalos, Bonetes, Animalitos de felpa…) are now visible |
| Finding products | Plain listing, server pagination | All-categories hub, editorial category headers (counts, prices from, image mosaic), visual subcategory rails, a breadcrumb that switches between sibling categories, a sticky mobile chip bar (filter, sort, subcategory chips with counts). Instant search that suggests matching categories with counts before products, highlights matches and offers suggested searches. Filters (subcategory, price, in stock, on sale), sorting, shareable URLs, "Ver más" pagination, and back-button restoration of the list depth and scroll position |
| Product cards | Uppercase names, little hierarchy | Clean names, sale badges with % off, a "from" price for variant products, installment price, quick add to cart, a second image on hover and clear sold-out states |
| Product page | Shipping and payment details buried in modals | Swipeable gallery with thumbnails, variant buttons that show unavailable options, live price/stock/installments, a quantity stepper, a sticky add-to-cart bar on mobile, WhatsApp help, assurance list, accordions (description, shipping, returns, payments) and related products |
| Cart | Classic cart | Slide-out cart drawer saved in localStorage, with quantities, subtotal, installments, shipping info, a checkout CTA (demo notice) and payment methods |
| Trust | Policies hidden in long pages | Shipping, returns, payment and contact details on every key page. Restructured "Envíos y devoluciones" page, a new FAQ page and a contact page with a map |
| Mobile | Responsive theme | Built mobile-first: sticky header, rotating announcement bar, thumb-sized tap targets (≥44 px), bottom sticky ATC, no horizontal scroll |
| Accessibility / SEO | — | Semantic HTML, skip link, focus-visible styles, focus-trapped dialogs, AA color contrast, alt text, `prefers-reduced-motion`, JSON-LD (Store, Product, BreadcrumbList), OG/Twitter tags, canonical URLs |
| Performance | — | Static HTML, WebP images with `srcset`/lazy loading, hover images fetched only on hover, ~60 KB gzipped catalog index, no frameworks |

## Information architecture (category UX for 1,142 products)

- **Shopping intents, from the real tree.** The store has four top categories, and each one is a clear intent: *Para decorar y festejar* (Deco y fiesta), *Para envolver y regalar* (Bolsas y embalaje), *Para poner la mesa* (Todo para la mesa), *De temporada* (Navidad). Intents label the categories; no categories were invented or merged. The store's six collections sit beside them as curated entry points.
- **Biggest first.** Top categories and subcategories are ordered by how many products they hold (real counts), so the deepest assortments lead. The mobile sub-panels show the six largest subcategories, then "Ver todas las subcategorías". Empty categories are hidden automatically.
- **Counts everywhere.** Menus, the mega menu, rails, chips, the hub, search suggestions and breadcrumb switchers all show live product counts from the catalog.
- **Several ways in.** Search can be the main path: category matches with counts come first, then products. Visual browsing works through the hub, rails and mega menu. Quick chips cover Ofertas and Todos los productos. Inside a parent category, subcategory chips filter in place without a page load, and the breadcrumb switches to a sibling in one tap.
- **Only real copy.** Category descriptions are used only where the store wrote one (Navidad). Elsewhere the header shows factual stats (count, lowest price, on-sale count). "Suggested searches" are the largest real subcategories, not invented popularity data.

## Project structure

```
data/
  products.json        # full scraped catalog (one clean JSON: products, variants, images, categories)
  site.json            # store info: contact, shipping, payments, hero/cover picks
  policies.raw.json    # T&C and shipping/returns text captured from the store
src/
  css/01-tokens.css    # design tokens (colors, type, spacing, radii, motion) as CSS variables
  css/02…10-*.css      # base, controls, header, card, home, catalog, product, cart, footer
  css/11-nav.css       # mega menu, mobile sheet, breadcrumbs, category header/rails, sticky filter bar, hub
  css/12-refine.css    # visual refinement layer (type, pills, radii, search overlay)
  js/card.js           # product card component (shared by build + browser)
  js/store.js          # cart state (localStorage)
  js/cart-drawer.js    # cart drawer UI
  js/catalog.js        # filters / sort / pagination
  js/product.js        # gallery, variants, add to cart
  js/nav.js            # slim header, mega menu, mobile menu drill-down, rails, breadcrumb switcher
  js/search.js, ui.js, main.js, icons.js, format.js
build/
  build.mjs            # zero-dependency static site generator → dist/
  components.mjs       # head, header + mega menu, mobile menu, search, cart, footer
  pages.mjs            # home, catalog, categories hub, product, content pages
  content.mjs          # FAQ (taken from the store's published policies)
assets/img/            # optimized product photos (WebP) + brand assets
tools/                 # scraping + image pipeline used to capture the catalog
.github/workflows/pages.yml  # builds and deploys to GitHub Pages
```

## Tiendanube port map

Each component lines up with a template or snipplet in Tiendanube's official [base-theme](https://github.com/TiendaNube/base-theme), so the design can later become a Twig theme. Design tokens in `src/css/01-tokens.css` are CSS variables that can be generated from `config/settings.txt`: `--c-paper` → `background_color`, `--c-ink` → `text_color`/`primary_color`, `--c-accent` → `accent_color`, `--f-serif`/`--f-sans` → `font_headings`/`font_rest`, and radius tokens → new settings. In the base theme these are emitted from `static/css/style-colors.scss.tpl`.

| Component (this repo) | Tiendanube base-theme | Notes |
|---|---|---|
| `layout()` in `build/components.mjs` | `layouts/layout.tpl` | Head, header, footer, overlays. JSON-LD and OG come from Tiendanube's head helpers |
| `header()` + announcement bar | `snipplets/header/header.tpl`, `header-utilities.tpl`, `header-advertising.tpl` | The slim-on-scroll header is CSS/JS only |
| Mega menu (`header()`) | `snipplets/navigation/navigation.tpl` + `navigation-nav-list.tpl` | The tree comes from the admin menu (`navigation`, `item.subitems`, `item.isCategory`). Thumbnails need category images (`category.images` → `category_image_url`) uploaded in the admin, or a theme setting per category. The featured product can be a "featured products" section or a product picked per category in settings. **Custom work** |
| `mobileMenu()` (sheet + drill-down) | `snipplets/navigation/navigation-panel.tpl` (inside `modal.tpl`) + `navigation-foot.tpl` | The base theme uses accordions with a "Ver todo en {name}" link. Our drill-down panels are custom markup and JS over the same `navigation` data |
| `searchOverlay()` + `search.js` | `snipplets/header/header-search.tpl` + `header-search-results.tpl`, `templates/search.tpl` | Native AJAX suggestions return **products only** (with `highlight(query)`). Category suggestions with counts need a small categories JSON printed in the layout and filtered client-side. **Custom work** |
| `crumbs()` | `snipplets/breadcrumbs.tpl` | The sibling switcher needs the parent's `subcategories` (available on `category`) |
| `catalog()` header + rail | `templates/category.tpl` + `snipplets/page-header.tpl`, `category-banner.tpl`, `grid/categories.tpl` | The mosaic needs category images or product images from the first page. Subcategory rail from `category.subcategories` |
| Filters, sort, sticky chip bar | `snipplets/grid/filters.tpl`, `grid/sort-by.tpl`, `grid/categories.tpl` | Use native server-side filters (`product_filters`, `filter_categories`, URL params) instead of our client-side `catalog.json` filtering. Subcategory chips map to `filter_categories` |
| "Ver más" pagination | `snipplets/grid/pagination.tpl` (`{% paginate %}`, infinite scroll option) | Back-button restoration has to be added to the theme JS |
| Categories hub (`hubPage()`) | No dedicated template | Build it as a custom `templates/page.tpl` variant or a home section that loops over the global `categories`. **Custom work** |
| `renderCard()` (`src/js/card.js`) | `snipplets/grid/item.tpl`, `product_grid.tpl`, `grid/quick-shop.tpl`, `labels.tpl` | Images via `product_image_url('medium'/'large')` + lazyload. Quick add maps to the base theme's quick shop |
| `product()` page | `templates/product.tpl` + `snipplets/product/product-image.tpl`, `product-form.tpl`, `product-variants.tpl`, `product-quantity.tpl`, `product-payment-details.tpl`, `product-related.tpl` | Variant pills = `settings.bullet_variants` (`js-insta-variant`). Live price and stock come from `product.variants_object` (the same `data-variants` JSON we scraped) |
| Cart drawer (`cartDrawer()`, `cart-drawer.js`, `store.js`) | `snipplets/cart-panel.tpl`, `cart-item-ajax.tpl`, `cart-totals.tpl`, `notification-cart.tpl`, `templates/cart.tpl` | AJAX cart panel is native; swap our localStorage store for the theme's cart endpoints. The free-shipping bar is native (`shipping/shipping-free-rest.tpl`) and appears only if the store sets a minimum |
| Checkout demo modal | Native checkout | Remove it; "Iniciar compra" posts to the real checkout |
| `footer()` | `snipplets/footer.tpl`, `social/social-links.tpl`, `contact-links.tpl`, `newsletter.tpl` | The newsletter form is native |
| WhatsApp FAB | `snipplets/whatsapp-chat.tpl` | Native |
| FAQ, shipping, contact, terms pages | `templates/page.tpl`, `templates/contact.tpl` | Content goes in admin pages |
| 404 | `templates/404.tpl` | Native |
| Icons (`src/js/icons.js`) | `snipplets/svg/*.tpl` | One snipplet per icon |

**Gotchas**
- Category product counts are not part of the base theme's menu data. Show them only where the template exposes them, or precompute them through the API or an app.
- Category thumbnails need images uploaded per category in the admin.
- Product images come in Tiendanube's fixed sizes (`small` to `1080p`), not our own 480/960 WebP set.

## Run locally

Requires Node 18+ (no npm dependencies).

```bash
node build/build.mjs          # generates dist/
npx serve dist                # or: python3 -m http.server -d dist 8080
```

All links are relative, so the site works at a domain root or under a sub-path (like GitHub Pages). Set `BASE_URL` to change the canonical/OG URLs:

```bash
BASE_URL=https://example.com/ node build/build.mjs
```

### Refreshing the catalog

The scripts in `tools/` capture the catalog from the public store (sitemap, product pages, category listings and images) and rebuild `data/products.json` plus the WebP images:

```bash
# in a scratch folder: fetch.sh (product pages) → parse.py → cats.py → dl.sh (images)
python3 tools/prepare.py /path/to/scrape   # writes data/products.json + assets/img/products
```

---

Concept and design: **Hvesmar Studio** · 2026. Product photos, brand name and content belong to Papelera Avellaneda / La Pelpa!.
