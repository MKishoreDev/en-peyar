const CACHE_NAME = 'en-peyar-cache-v2';
const urlsToCache = [
  '/',
  '/static/css/tailwind.css?v=1.0.2',
  '/static/css/style.css?v=1.0.2',
  '/static/images/logo.png',
  '/static/images/favicon.png',
  '/static/images/banner.png',
  '/static/images/home.png',
  '/static/images/generator.png',
  '/static/images/map.png',
  '/static/js/app.js',
  '/static/js/generator.js',
  '/static/js/i18n.js',
  '/static/js/main.js',
  '/static/js/map.js',
  '/static/data/districts.js',
  '/static/data/tamil_roots.js',
  '/static/data/thesaurus.js',
  '/static/locales/en.json',
  '/static/locales/ta.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
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
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

