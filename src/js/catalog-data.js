// Lazy-loaded compact catalog (data/catalog.json) shared by search + catalog pages
import { norm } from './format.js';
const root = document.documentElement.dataset.root || '';
// Versioned URL (content hash) printed by the build on <html data-catalog-url>
const url = document.documentElement.dataset.catalogUrl || `${root}data/catalog.json`;
let promise;
export function getCatalog() {
  if (!promise) {
    promise = fetch(url).then((r) => r.json()).then((d) => {
      const catNames = Object.fromEntries(d.categories.map((c) => [c.slug, c.name]));
      d.items.forEach((p) => { p._n = norm(p.n); p._q = norm(p.n + ' ' + (p.k || []).map((k) => catNames[k] || '').join(' ') + ' ' + (p.t || '')); });
      d.catNames = catNames;
      return d;
    });
  }
  return promise;
}
