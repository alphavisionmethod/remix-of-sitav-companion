// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Service Worker
// Asset Caching, Offline Support, and Push Notification Handling
// ═══════════════════════════════════════════════════════════════
const CACHE_NAME = 'sita-os-v2';
const STATIC_ASSETS = ['/', '/manifest.webmanifest', '/favicon.ico', '/icons/icon-192.png', '/icons/icon-512.png'];
const API_CACHE = 'sita-api-v1';

// ── Install & Activate ───────────────────────────────────────

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

// ── Fetch (Cache Strategies) ─────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

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

// ═══════════════════════════════════════════════════════════════
// PUSH NOTIFICATION HANDLERS
// ═══════════════════════════════════════════════════════════════

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'SITA OS', body: event.data.text() };
  }

  const options = {
    body: payload.body || '',
    icon: payload.icon || '/pwa-192x192.png',
    badge: payload.badge || '/pwa-64x64.png',
    tag: payload.tag || 'sita-os-notification',
    renotify: true,
    data: payload.data || {},
    actions: payload.data?.action_url
      ? [{ action: 'open', title: 'View' }]
      : [],
    vibrate: [200, 100, 200],
    requireInteraction: payload.data?.urgency === 'critical',
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'SITA OS', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const actionUrl = event.notification.data?.action_url;
  const notificationId = event.notification.data?.notification_id;
  const targetUrl = actionUrl || '/';

  // Track click via push-track edge function
  if (notificationId) {
    const trackUrl = (self.location.origin.includes('localhost')
      ? 'https://icrkipwlnuopqbsabngy.supabase.co'
      : self.location.origin.replace(/^https?:\/\/[^.]+/, 'https://icrkipwlnuopqbsabngy.supabase.co')
    ) + '/functions/v1/push-track';

    fetch(trackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: notificationId, action: 'clicked' }),
    }).catch(() => {});
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  const notificationId = event.notification.data?.notification_id;
  if (notificationId) {
    const trackUrl = 'https://icrkipwlnuopqbsabngy.supabase.co/functions/v1/push-track';
    fetch(trackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: notificationId, action: 'dismissed' }),
    }).catch(() => {});
  }
});
