const CACHE_NAME = 'battleshipz-v2';
const OFFLINE_PAGE = '/battleship/offline.html';
const APP_SHELL = [
  '/battleship/',
  '/battleship/index.html',
  '/battleship/offline.html',
  '/battleship/favicon.svg',
  '/battleship/apple-touch-icon.png',
  '/battleship/icon-192.png',
  '/battleship/icon-512.png',
  '/battleship/maskable-icon-192.png',
  '/battleship/maskable-icon-512.png',
  '/battleship/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch((err) => {
        console.error('Service worker failed to cache app shell:', err);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseClone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone))
            .catch((err) => console.error('Service worker cache put failed:', err));

          return response;
        })
        .catch((err) => {
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_PAGE).then((offline) => offline || new Response('Offline'));
          }
          throw err;
        });
    })
  );
});
