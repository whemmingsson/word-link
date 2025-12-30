const CACHE_NAME = "word-link-v1";

// Files to cache on install (will be updated during build)
const urlsToCache = ["./index.html"];

// Install event - cache core assets
self.addEventListener("install", (event) => {
  console.log("[service worker] Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[service worker] Caching files:", urlsToCache);
        // Cache files individually to handle failures gracefully
        const cachePromises = urlsToCache.map((url) => {
          return cache
            .add(url)
            .then(() => {
              console.log("[service worker] Cached:", url);
            })
            .catch((error) => {
              console.warn("[service worker] Failed to cache:", url, error);
              // Don't fail the entire installation if one file fails
            });
        });
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log("[service worker] Installation complete");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[service worker] Cache installation failed:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[service worker] Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[service worker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[service worker] Activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Clone the request
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then((networkResponse) => {
          // Check if valid response
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type === "error"
          ) {
            return networkResponse;
          }

          // Clone the response
          const responseToCache = networkResponse.clone();

          // Cache the new response for future use
          caches.open(CACHE_NAME).then((cache) => {
            // Only cache GET requests
            if (event.request.method === "GET") {
              cache.put(event.request, responseToCache);
            }
          });

          return networkResponse;
        })
        .catch((error) => {
          console.error("[service worker] Fetch failed:", error);
          // Return a fallback response if available
          return caches.match("./index.html");
        });
    })
  );
});
