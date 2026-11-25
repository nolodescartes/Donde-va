// Guarda la app para que funcione sin conexión. Cambia VERSION al actualizar el listado.
const VERSION = 'dondeva-16';
const CORE = ['./', 'index.html', 'meds.json', 'manifest.webmanifest', 'icon-192.png', 'v/tesseract.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const isData = /\/(index\.html|meds\.json)?$/.test(new URL(e.request.url).pathname) || e.request.mode === 'navigate';
  e.respondWith(isData
    // listado y página: primero la red (para coger cambios), si no hay conexión, la copia guardada
    ? fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request))
    // lector OCR e iconos: la copia guardada
    : caches.match(e.request).then(m => m || fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); return r; })));
});
