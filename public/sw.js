// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Worker for Asset Caching & Offline Support
// ═══════════════════════════════════════════════════════════════
const CACHE_NAME = 'sita-os-v1';
const STATIC_ASSETS = ['/'];
const API_CACHE = 'sita-api-v1';

// Cache-first for static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== API_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== 'GET') return;

  // Static assets: cache-first
  if (url.pathname.match(/\.(js|css|woff2?|ttf|png|jpg|jpeg|svg|ico)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // API: stale-while-revalidate
  if (url.pathname.includes('/rest/') || url.pathname.includes('/functions/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(API_CACHE).then((c) => c.put(request, clone));
          }
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Navigation: network-first with fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
  }
});
