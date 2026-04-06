// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Worker Push Event Handler
// Handles incoming push notifications and click events
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
  const targetUrl = actionUrl || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if available
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Open new window
      return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  // Analytics: track notification dismissal if needed
  const notificationId = event.notification.data?.notification_id;
  if (notificationId) {
    // Could POST to an analytics endpoint here
  }
});
