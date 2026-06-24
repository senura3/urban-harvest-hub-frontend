import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precache all assets compiled by Vite
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache-first strategy for static assets, images, and google fonts
registerRoute(
  ({ request }) => 
    request.destination === 'image' || 
    request.destination === 'font' || 
    request.destination === 'style' || 
    request.destination === 'script',
  new CacheFirst({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days cache duration
      }),
    ],
  })
);

// Network-first strategy for backend REST API calls
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-responses',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // Cache api calls for 24 Hours
      })
    ]
  })
);

// Offline page fallback handler for navigations
const navigationHandler = async (options) => {
  try {
    const networkStrategy = new NetworkFirst({ cacheName: 'page-navigations' });
    return await networkStrategy.handle(options);
  } catch (error) {
    // If navigation fails, check the precache for offline.html
    return (await caches.match('/offline.html')) || Response.error();
  }
};
registerRoute(new NavigationRoute(navigationHandler));

// Background Sync for offline booking form uploads
const syncPlugin = new BackgroundSyncPlugin('syncBookingsQueue', {
  maxRetentionTime: 24 * 60 // Retry form uploads for 24 hours
});

registerRoute(
  ({ url, request }) => url.pathname.includes('/api/bookings') && request.method === 'POST',
  new NetworkFirst({
    plugins: [syncPlugin]
  })
);

// Event listener for incoming web-push notifications
self.addEventListener('push', (event) => {
  let payload = { title: 'Urban Harvest Hub', body: 'A new event was posted! Check it out.' };
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: 'Urban Harvest Hub', body: event.data.text() };
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    vibrate: [100, 50, 100],
    data: {
      url: payload.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

// Event listener for user click actions on push notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If window is open, navigate it
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
