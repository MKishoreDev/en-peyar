const swParams = new URLSearchParams(self.location.search);
const BUILD_VER = swParams.get('v') || 'v11';
const CACHE_NAME = 'en-peyar-cache-' + BUILD_VER;
const urlsToCache = [
  '/',
  '/static/css/tailwind.css',
  '/static/css/style.css',
  '/static/images/logo.png',
  '/static/images/favicon.png',
  '/static/images/banner.png',
  '/static/images/home.png',
  '/static/images/generator.png',
  '/static/images/map.png',
  '/static/images/tamilnadu_map.svg',
  '/static/js/purify.min.js',
  '/static/js/events.js',
  '/static/js/generator_api.js',
  '/static/js/generator_ui.js',
  '/static/js/generator.js',
  '/static/js/i18n.js',
  '/static/js/main.js',
  '/static/js/map.js',
  '/static/data/districts.json',
  '/static/data/tamil_roots.json',
  '/static/locales/en.json',
  '/static/locales/ta.json'
];

self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(url => {
          const req = new Request(url, { cache: 'reload' });
          return fetch(req).then(resp => {
            if (resp.status === 200) {
              return cache.put(req, resp);
            }
          }).catch(() => {});
        })
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Network-First for HTML/Navigation so updates immediately show up
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Stale-While-Revalidate for static assets
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque' || networkResponse.type === 'cors')) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy));
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse || new Response('Asset not found', { status: 404, statusText: 'Not Found' });
      });

      return cachedResponse || fetchPromise;
    })
  );
});

