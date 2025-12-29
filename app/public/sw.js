const CACHE_NAME = 'word-link-v1';
const CDN_CACHE = 'word-link-cdn-v1';

// Files to cache on install (will be updated during build)
const urlsToCache = [
  './',
  './index.html',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files:', urlsToCache);
        // Cache files individually to handle failures gracefully
        const cachePromises = urlsToCache.map(url => {
          return cache.add(url).then(() => {
            console.log('Service Worker: Cached:', url);
          }).catch((error) => {
            console.warn('Service Worker: Failed to cache:', url, error);
            // Don't fail the entire installation if one file fails
          });
        });
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache installation failed:', error);
        throw error;
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== CDN_CACHE) {
            console.log('Service Worker: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle CDN requests (p5.js, etc.) separately
  if (url.origin !== location.origin) {
    event.respondWith(
      caches.open(CDN_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((error) => {
            // CDN is offline and not in cache
            console.error('Service Worker: CDN resource not available:', request.url, error);
            throw error;
          });
        });
      })
    );
    return;
  }

  // Handle same-origin requests (our app assets)
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          console.log('Service Worker: Serving from cache:', request.url);
          return response;
        }

        // Clone the request
        const fetchRequest = request.clone();

        return fetch(fetchRequest).then((networkResponse) => {
          // Check if valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          console.log('Service Worker: Caching new resource:', request.url);

          // Clone the response
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });

          return networkResponse;
        }).catch((error) => {
          // Network failed and not in cache
          console.error('Service Worker: Fetch failed for:', request.url, error);
          throw error;
        });
      })
  );
});