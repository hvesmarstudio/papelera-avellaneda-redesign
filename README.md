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
| Brand and look | Generic theme with a red accent | Editorial, premium look based on the brand's own cream product photography: Fraunces + Inter type pairing, a warm paper palette and a refined brand red, generous whitespace, subtle motion |
| Home | Slider and product list | A clear value proposition, trust strip (installments, nationwide shipping, pickup, returns), visual category tiles, featured and on-sale rails, collections, shipping methods, FAQ, store/visit block and newsletter |
| Navigation | Long uppercase menus | Desktop mega menu and an accordion menu on mobile. Collections the store already has but doesn't show in its menu (Para regalos, Bonetes, Animalitos de felpa…) are now visible |
| Finding products | Plain listing, server pagination | Instant search overlay that ignores accents, plus catalog filters (category/subcategory, price range and presets, in stock, on sale), sorting, active filter chips, shareable URLs and "Ver más" pagination with progress |
| Product cards | Uppercase names, little hierarchy | Clean names, sale badges with % off, a "from" price for variant products, installment price, quick add to cart, a second image on hover and clear sold-out states |
| Product page | Shipping and payment details buried in modals | Swipeable gallery with thumbnails, variant buttons that show unavailable options, live price/stock/installments, a quantity stepper, a sticky add-to-cart bar on mobile, WhatsApp help, assurance list, accordions (description, shipping, returns, payments) and related products |
| Cart | Classic cart | Slide-out cart drawer saved in localStorage, with quantities, subtotal, installments, shipping info, a checkout CTA (demo notice) and payment methods |
| Trust | Policies hidden in long pages | Shipping, returns, payment and contact details on every key page. Restructured "Envíos y devoluciones" page, a new FAQ page and a contact page with a map |
| Mobile | Responsive theme | Built mobile-first: sticky header, rotating announcement bar, thumb-sized tap targets (≥44 px), bottom sticky ATC, no horizontal scroll |
| Accessibility / SEO | — | Semantic HTML, skip link, focus-visible styles, focus-trapped dialogs, AA color contrast, alt text, `prefers-reduced-motion`, JSON-LD (Store, Product, BreadcrumbList), OG/Twitter tags, canonical URLs |
| Performance | — | Static HTML, WebP images with `srcset`/lazy loading, hover images fetched only on hover, ~60 KB gzipped catalog index, no frameworks |

## Project structure

```
data/
  products.json        # full scraped catalog (one clean JSON: products, variants, images, categories)
  site.json            # store info: contact, shipping, payments, hero/cover picks
  policies.raw.json    # T&C and shipping/returns text captured from the store
src/
  css/01-tokens.css    # design tokens (colors, type, spacing, radii, motion) as CSS variables
  css/02…10-*.css      # base, controls, header, card, home, catalog, product, cart, footer
  js/card.js           # product card component (shared by build + browser)
  js/store.js          # cart state (localStorage)
  js/cart-drawer.js    # cart drawer UI
  js/catalog.js        # filters / sort / pagination
  js/product.js        # gallery, variants, add to cart
  js/search.js, ui.js, main.js, icons.js, format.js
build/
  build.mjs            # zero-dependency static site generator → dist/
  components.mjs       # head, header + mega menu, mobile menu, search, cart, footer
  pages.mjs            # home, catalog, product, content pages
  content.mjs          # FAQ (taken from the store's published policies)
assets/img/            # optimized product photos (WebP) + brand assets
tools/                 # scraping + image pipeline used to capture the catalog
.github/workflows/pages.yml  # builds and deploys to GitHub Pages
```

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
