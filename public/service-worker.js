const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/db.js",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/manifest.webmanifest"
  ];
  
  const CACHE_NAME = "static-cache-v2";
  const DATA_CACHE_NAME = "data-cache-v1";
  
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(PRECACHE)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
  });
  
  // The activate handler takes care of cleaning up old caches.
  self.addEventListener('activate', (event) => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
        })
        .then((cachesToDelete) => {
          return Promise.all(
            cachesToDelete.map((cacheToDelete) => {
              return caches.delete(cacheToDelete);
            })
          );
        })
        .then(() => self.clients.claim())
    );
  });
  
  self.addEventListener('fetch', (event) => {
    if (event.request.url.startsWith(self.location.origin)) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
  
          return caches.open(RUNTIME).then((cache) => {
            return fetch(event.request).then((response) => {
              return cache.put(event.request, response.clone()).then(() => {
                return response;
              });
            });
          });
        })
      );
    }
  });
  