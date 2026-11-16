// Sealify Service Worker for PWA install and offline support
const CACHE_NAME = 'sealify-v4';
// Only cache immutable static assets up front — never HTML pages.
const STATIC_ASSETS = [
    '/logo.png',
    '/manifest.json',
    '/css/app.css',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch event
// - Page navigations: network-first (always show fresh HTML, fall back to cache offline)
// - Static assets: cache-first
// - Everything else (POST, auth, API): network only
self.addEventListener('fetch', (event) => {
    const req = event.request;

    if (req.method !== 'GET') {
        return; // let the browser handle non-GET requests normally
    }

    const isNavigation = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
    const isStatic = /\.(css|js|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf)$/i.test(new URL(req.url).pathname);

    if (isNavigation) {
        event.respondWith(
            fetch(req)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
                    return response;
                })
                .catch(() => caches.match(req).then((cached) => cached || caches.match('/')))
        );
        return;
    }

    if (isStatic) {
        event.respondWith(
            caches.match(req).then((cached) => cached || fetch(req).then((response) => {
                if (response && response.status === 200) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
                }
                return response;
            }))
        );
        return;
    }

    // Default: network, no caching
    event.respondWith(fetch(req));
});

// Handle push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New notification from Sealify',
        icon: '/logo.png',
        badge: '/logo.png',
        vibrate: [100, 50, 100],
        data: { dateOfArrival: Date.now(), primaryKey: 1 },
        actions: [
            { action: 'explore', title: 'View', icon: '/logo.png' },
            { action: 'close', title: 'Close', icon: '/logo.png' }
        ]
    };
    event.waitUntil(self.registration.showNotification('Sealify', options));
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'explore') {
        event.waitUntil(clients.openWindow('/'));
    }
});
