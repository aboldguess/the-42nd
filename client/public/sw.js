// A unique name for the cache so previous versions can be purged
const CACHE_NAME = 'treasure-hunt-cache-v1';
// Fallback page to show when a fetch fails (e.g. offline)
const OFFLINE_URL = '/';

// List of core assets we always want cached
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Cache core files during the install phase
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  // Activate the new service worker immediately
  self.skipWaiting();
});

// Clean up any previous caches when activating the new worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  // Allows the service worker to start controlling open pages
  self.clients.claim();
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      // Fall back to the network, otherwise return the offline page
      return res || fetch(event.request).catch(() => caches.match(OFFLINE_URL));
    })
  );
});

// Listen for messages from the client to display system notifications
self.addEventListener('message', (event) => {
  // Only handle the custom notification messages we expect
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data.payload || {};
    // Display the notification through the service worker so it also
    // appears when the PWA is in the background on mobile devices
    self.registration.showNotification(title || '', options);
  }
});

// Open a link when the notification itself is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data && event.notification.data.link;
  if (!link) return;
  // Focus an open client if possible, otherwise open a new window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const win of wins) {
        if ('focus' in win) {
          win.navigate(link);
          return win.focus();
        }
      }
      return clients.openWindow(link);
    })
  );
});
