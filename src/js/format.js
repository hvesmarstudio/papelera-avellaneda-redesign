// Formatting helpers (ARS, as shown on the original store: "$3.000", "$2.166,67")
export function money(n) {
  if (n == null || isNaN(n)) return '';
  const hasDec = Math.round(n * 100) % 100 !== 0;
  return '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: hasDec ? 2 : 0, maximumFractionDigits: 2 });
}
export function installment(n, count = 3) { return money(Math.round((n / count) * 100) / 100); }
export function norm(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function pct(price, compare) { return compare && compare > price ? Math.round((1 - price / compare) * 100) : 0; }
