// Lazy-loaded compact catalog (data/catalog.json) shared by search + catalog pages
import { norm } from './format.js';
const root = document.documentElement.dataset.root || '';
let promise;
export function getCatalog() {
  if (!promise) {
    promise = fetch(`${root}data/catalog.json`).then((r) => r.json()).then((d) => {
      const catNames = Object.fromEntries(d.categories.map((c) => [c.slug, c.name]));
      d.items.forEach((p) => { p._n = norm(p.n); p._q = norm(p.n + ' ' + (p.k || []).map((k) => catNames[k] || '').join(' ') + ' ' + (p.t || '')); });
      d.catNames = catNames;
      return d;
    });
  }
  return promise;
}
