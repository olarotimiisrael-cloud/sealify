const CACHE_NAME = 'sealify-pwa-v5';

// Only immutable, content-hashed build output is cached. The app shell
// (index.html) is deliberately NOT cached: a cached shell outlives the build
// that produced it, so after a deployment it points at chunk filenames that
// no longer exist. Cloudflare's SPA fallback answers those requests with
// text/html, the browser rejects them as module scripts, and the app dies
// with "Something went wrong" instead of loading the new release.
const STATIC_ASSETS = [
  '/manifest.json',
  '/logo.png',
  '/og-image.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Lets the page activate a waiting worker immediately after a deployment.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Event with Network First & Cache Fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) return;

  // Skip Supabase realtime WebSocket connections
  if (event.request.url.includes('supabase.co/realtime')) return;

  // Never serve a document from cache: see the note above CACHE_NAME.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => offlinePage())
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful GET requests, except HTML documents.
        const contentType = networkResponse.headers.get('Content-Type') || '';
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic' &&
          !contentType.includes('text/html')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline fallback. event.respondWith() MUST always settle with a
        // Response - returning undefined here produced
        // "TypeError: Failed to convert value to 'Response'" and left the
        // request permanently pending.
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return offlineResponse();
        });
      })
  );
});

// A real Response so respondWith() always receives one.
function offlineResponse() {
  return new Response(
    JSON.stringify({ error: 'You appear to be offline. Please check your connection and try again.' }),
    { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'application/json' } }
  );
}

// Offline stand-in for a document request. It must not reference build
// output, because none of it can be loaded while offline.
function offlinePage() {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<title>Sealify — offline</title></head>` +
      `<body style="font-family:system-ui,sans-serif;background:#0b1220;color:#e5e7eb;` +
      `display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">` +
      `<div style="text-align:center;max-width:32rem;padding:2rem">` +
      `<h1 style="font-size:1.25rem">You are offline</h1>` +
      `<p style="line-height:1.6">Sealify could not reach the network. ` +
      `Reconnect and reload to continue &mdash; this page deliberately does not serve a ` +
      `cached copy of the app, because that copy would point at files from an older build.</p>` +
      `</div></body></html>`,
    { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-queue') {
    event.waitUntil(processOfflineQueue());
  }
});

async function processOfflineQueue() {
  const cache = await caches.open('sealify-offline-queue');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
      }
    } catch (error) {
      console.log('Offline sync failed for:', request.url);
    }
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        const url = event.notification.data?.url || '/';
        
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
    );
  }
});