const CACHE_NAME = 'tagbanan-v17';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('firestore.googleapis.com')) return;
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request).catch(() => caches.match('./index.html')))
  );
});

// Réception des rappels de notification
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_DAILY_NOTIFICATION') {
    const { word, trans } = event.data;
    self.registration.showNotification("✨ Le mot Tagbanan du jour", {
      body: `« ${word} » signifie « ${trans} ». Venez entretenir votre série !`,
      icon: 'icon.png?v=17',
      badge: 'icon.png?v=17',
      data: { url: './' }
    });
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('Tagbanan') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
