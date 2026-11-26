const VERSION = 'dondeva-27';
const LIBS = 'dondeva-libs-1';
const CORE = ['./', 'index.html', 'meds.json', 'manifest.webmanifest', 'icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== LIBS).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const path = new URL(e.request.url).pathname;
  const isData = /\/(index\.html|meds\.json)?$/.test(path) || e.request.mode === 'navigate';
  const store = /\/v\//.test(path) ? LIBS : VERSION;
  e.respondWith(isData
    ? fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request))
    : caches.match(e.request).then(m => m || fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(store).then(x => x.put(e.request, c)); } return r; })));
});
