const CACHE_NAME = 'en-peyar-cache-v2';
const urlsToCache = [
  '/',
  '/about',
  '/static/css/style.css',
  '/static/css/tailwind.css',
  '/static/images/logo.png',
  '/static/images/favicon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Clear old cache versions on activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('ServiceWorker clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Network-first for HTML pages, Cache-first for static assets
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // If requesting an HTML page (like / or /about)
  if (event.request.mode === 'navigate' || requestUrl.pathname === '/' || requestUrl.pathname === '/about') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Update cache with the fresh page
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If offline, serve from cache
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-first for images, CSS, JS, etc.
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request).then(fetchResponse => {
            if (event.request.method === 'GET' && fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return fetchResponse;
          });
        })
    );
  }
});
