// Stale-page guard. GitHub Pages serves HTML with Cache-Control: max-age=600 and we
// can't change headers, so a phone may show an old page for a while (or restore it from
// the back/forward cache). Every page carries <html data-build>; we compare it against
// /version.json fetched with cache: 'no-store'. On a mismatch we reload once through a
// cache-busting URL (?_v=<build>), which also bypasses the CDN and browser caches, then
// strip the param again. All assets are content-hashed, so the fresh page pulls fresh CSS/JS.
const html = document.documentElement;
const root = html.dataset.root || '';
const current = html.dataset.build;
const KEY = 'pelpa:fresh';
let last = 0;

async function check() {
  if (!current || Date.now() - last < 60_000) return;
  last = Date.now();
  try {
    const r = await fetch(`${root}version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) return;
    const { v } = await r.json();
    if (!v || v === current) return;
    // at most one forced refresh per new build per tab (no loops)
    if (sessionStorage.getItem(KEY) === v) return;
    sessionStorage.setItem(KEY, v);
    const u = new URL(location.href);
    u.searchParams.set('_v', v);
    location.replace(u.href);
  } catch { /* offline or blocked: keep the page as is */ }
}

export function initFresh() {
  const u = new URL(location.href);
  if (u.searchParams.has('_v')) {
    u.searchParams.delete('_v');
    history.replaceState(history.state, '', u.pathname + u.search + u.hash);
  }
  check();
  addEventListener('pageshow', (e) => { if (e.persisted) { last = 0; check(); } });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
}
