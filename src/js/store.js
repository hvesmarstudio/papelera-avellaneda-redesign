// Cart state — persisted in localStorage. No server, no payments (concept demo).
const KEY = 'pelpa_cart_v1';
const listeners = new Set();
let items = load();

function load() {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  listeners.forEach((fn) => fn(items));
}
export const cart = {
  get items() { return items; },
  get count() { return items.reduce((a, i) => a + i.qty, 0); },
  get subtotal() { return items.reduce((a, i) => a + i.qty * i.p, 0); },
  /** line: { vid, pid, h, n, vl, p, img, max } */
  add(line, qty = 1) {
    const ex = items.find((i) => i.vid === line.vid);
    const max = line.max ?? null;
    if (ex) ex.qty = clamp(ex.qty + qty, max);
    else items.push({ ...line, qty: clamp(qty, max) });
    save();
  },
  setQty(vid, qty) {
    const ex = items.find((i) => i.vid === vid);
    if (!ex) return;
    if (qty <= 0) items = items.filter((i) => i.vid !== vid);
    else ex.qty = clamp(qty, ex.max);
    save();
  },
  remove(vid) { items = items.filter((i) => i.vid !== vid); save(); },
  clear() { items = []; save(); },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
};
function clamp(q, max) { q = Math.max(1, Math.floor(q) || 1); return max != null && max > 0 ? Math.min(q, max) : q; }
window.addEventListener('storage', (e) => { if (e.key === KEY) { items = load(); listeners.forEach((fn) => fn(items)); } });
