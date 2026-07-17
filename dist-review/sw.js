const CACHE_NAME = 'battleshipz-v3';
const OFFLINE_PAGE = '/offline.html';
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/maskable-icon-192.png',
  '/maskable-icon-512.png',
  '/manifest.json',
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

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|svg|json|webp|woff2?|ttf|otf)$/.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseClone))
              .catch((err) => console.error('Service worker cache put failed:', err));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then(
              (cached) =>
                cached ||
                caches
                  .match('/index.html')
                  .then(
                    (index) =>
                      index ||
                      caches
                        .match('/')
                        .then(
                          (root) =>
                            root ||
                            caches
                              .match(OFFLINE_PAGE)
                              .then((offline) => offline || new Response('Offline'))
                        )
                  )
            )
        )
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          fetch(event.request)
            .then((response) => {
              if (response && response.status === 200 && response.type === 'basic') {
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response));
              }
            })
            .catch(() => {});
          return cached;
        }

        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseClone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone))
            .catch((err) => console.error('Service worker cache put failed:', err));
          return response;
        });
      })
    );
    return;
  }
});
