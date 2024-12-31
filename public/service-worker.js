const CACHE_NAME = "yokd-app-cache-v1";

// Add your app's specific assets here
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/favicon-96x96.png",
  "/yokdlogo.png",
  "/boxing-bell.mp3",
  // Add other static assets you want to cache
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Try to get the response from cache first
      if (response) {
        return response;
      }

      // If not in cache, fetch it
      return fetch(event.request).then((response) => {
        // Don't cache if not a success response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Clone the response since we need to use it twice
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    }),
  );
});
