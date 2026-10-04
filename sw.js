// New Creation service worker: fast start, offline reading, safe updates.
const VERSION = 'nc-2026-10-04-2';
const SHELL = ['./', 'index.html', 'config.js', 'css/app.css', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png',
  'js/app.js', 'js/util.js', 'js/api.js', 'js/bible.js', 'js/state.js', 'js/morph.js', 'js/audio.js',
  'js/views/today.js', 'js/views/bible.js', 'js/views/original.js', 'js/views/circle.js', 'js/views/journey.js', 'js/views/me.js', 'js/views/leader.js', 'js/views/privacy.js', 'js/views/auth.js', 'js/views/listen-help.js',
  'data/meta.json', 'data/plans.json'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('nc-') && k !== VERSION && k !== 'nc-data-v1' && k !== 'nc-fonts').map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;                                 // API calls (POST) always go to the network
  if (u.hostname.endsWith('script.google.com') || u.hostname.endsWith('googleusercontent.com')) return;
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') { e.respondWith(cacheFirst(e.request, 'nc-fonts')); return; }
  if (u.origin !== location.origin) return;
  if (/\/data\/(text|orig|lex)\//.test(u.pathname)) { e.respondWith(cacheFirst(e.request, 'nc-data-v1')); return; } // Bible data never changes for a version
  e.respondWith(staleWhileRevalidate(e.request));
});
async function cacheFirst(req, name) {
  const c = await caches.open(name); const hit = await c.match(req); if (hit) return hit;
  const res = await fetch(req); if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res;
}
async function staleWhileRevalidate(req) {
  const c = await caches.open(VERSION); const hit = await c.match(req, { ignoreSearch: req.mode === 'navigate' });
  const net = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}
