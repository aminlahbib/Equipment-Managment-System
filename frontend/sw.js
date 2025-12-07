/**
 * Service Worker for Equipment Management System
 * Provides offline support and caching
 */

const CACHE_NAME = 'equipment-management-v1';
const STATIC_CACHE_NAME = 'equipment-static-v1';
const DYNAMIC_CACHE_NAME = 'equipment-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/variables.css',
    '/css/base.css',
    '/css/components.css',
    '/css/animations.css',
    '/css/pages.css',
    '/js/config.js',
    '/js/theme.js',
    '/js/router.js',
    '/js/utilities.js',
    '/js/notifications.js',
    '/js/api.js',
    '/js/export.js',
    '/templates/login.html',
    '/templates/register.html',
    '/templates/forgot-password.html',
    '/templates/equipments-dashboard.html',
    '/templates/Admin-Dashboard.html',
    '/assets/favicon.ico',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching static assets');
            return cache.addAll(STATIC_ASSETS).catch((error) => {
                console.warn('[Service Worker] Failed to cache some assets:', error);
            });
        })
    );
    self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE_NAME && 
                        cacheName !== DYNAMIC_CACHE_NAME &&
                        cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim(); // Take control of all pages
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip API requests (they should always go to network)
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/benutzer/') || url.pathname.startsWith('/admin/')) {
        return;
    }

    // Skip external resources
    if (url.origin !== self.location.origin && !url.href.startsWith('http://localhost')) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            // Return cached version if available
            if (cachedResponse) {
                return cachedResponse;
            }

            // Otherwise fetch from network
            return fetch(request).then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone the response
                const responseToCache = response.clone();

                // Cache dynamic content
                caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                    cache.put(request, responseToCache);
                });

                return response;
            }).catch(() => {
                // If network fails and it's a navigation request, return offline page
                if (request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});

// Message event - handle messages from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

