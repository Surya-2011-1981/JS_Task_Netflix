// Service Worker - Handles caching and offline support
// Cache versioning strategy

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `netflix-static-${CACHE_VERSION}`;
const API_CACHE = `netflix-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `netflix-images-${CACHE_VERSION}`;

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch(() => {
                // Gracefully handle if some assets fail to cache
                console.log('Some assets failed to cache during install');
            });
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE && cacheName !== IMAGE_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Strategy for API calls: Network-first, fallback to cache
    if (url.pathname.includes('/api/') || url.pathname.includes('/v1/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful API responses
                    if (response.ok) {
                        const cache = caches.open(API_CACHE);
                        cache.then((c) => c.put(request, response.clone()));
                    }
                    return response;
                })
                .catch(() => {
                    // Return cached response if network fails
                    return caches.match(request).then((response) => {
                        return response || new Response(JSON.stringify({ error: 'offline' }), {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({ 'Content-Type': 'application/json' })
                        });
                    });
                })
        );
    }

    // Strategy for images: Cache-first, fallback to network
    else if (request.destination === 'image') {
        event.respondWith(
            caches.match(request).then((response) => {
                return response || fetch(request).then((networkResponse) => {
                    if (networkResponse.ok) {
                        caches.open(IMAGE_CACHE).then((cache) => {
                            cache.put(request, networkResponse.clone());
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // Return placeholder image if offline
                    return new Response(
                        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect fill="#333"/><text x="50%" y="50%" text-anchor="middle" fill="#999">Image Unavailable</text></svg>',
                        { headers: { 'Content-Type': 'image/svg+xml' } }
                    );
                });
            })
        );
    }

    // Strategy for HTML/CSS/JS: Cache-first, fallback to network
    else {
        event.respondWith(
            caches.match(request).then((response) => {
                return response || fetch(request).then((networkResponse) => {
                    return caches.open(STATIC_CACHE).then((cache) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                }).catch(() => {
                    // Return offline page for navigation requests
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            })
        );
    }
});

// Message handler for cache updates from client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(API_CACHE).then(() => {
            console.log('API cache cleared');
        });
    }
});
