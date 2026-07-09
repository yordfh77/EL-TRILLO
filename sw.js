// EL TRILLO - SERVICE WORKER
// Designed to minimize data usage over ETECSA mobile networks in Cuba.

const CACHE_NAME = 'el-trillo-static-v4';
const CDN_CACHE_NAME = 'el-trillo-cdn-v4';
const DYNAMIC_CACHE_NAME = 'el-trillo-dynamic-v4';

const STATIC_ASSETS = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './logo.svg',
  './manifest.json',
  './fallback.html'
];

// Supabase and other CDNs to cache aggressively (Cache First)
const DATA_CDNS = [
  'cdn.jsdelivr.net',
  'unpkg.com',
  'supabase-js'
];

// Install Event - Pre-cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline page and assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== CDN_CACHE_NAME && cache !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Dynamic routing to optimize data
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Bypass non-GET requests (e.g. database inserts, updates)
  if (event.request.method !== 'GET') {
    return;
  }

  // 1. Check if it's a CDN or third-party script/asset (e.g. Supabase library, icons, fonts)
  const isCdn = DATA_CDNS.some(cdn => requestUrl.hostname.includes(cdn) || requestUrl.pathname.includes(cdn));
  if (isCdn) {
    event.respondWith(
      caches.open(CDN_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached script immediately to avoid network hit
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 2. Static Application Shell Assets (Cache-First or Stale-While-Revalidate)
  const isStaticAsset = STATIC_ASSETS.some(asset => {
    const cleanPath = asset.replace('./', '');
    return requestUrl.pathname.endsWith(cleanPath) || (cleanPath === '' && requestUrl.pathname === '/');
  });

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          }
          return networkResponse;
        }).catch(() => {
          // Silent catch for offline fetch failure
        });
        
        // Return cached right away (fast load) and update in background
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Dynamic Feeds & Supabase API Queries (Network-First with fallback to dynamic cache/offline page)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful requests for dynamic query results
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed! Attempt to load from dynamic cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If it is a page navigation request and offline, show fallback page
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./fallback.html');
          }
          
          // Otherwise return empty json or error
          return new Response(JSON.stringify({ error: "Offline mode active. Check your connection." }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
  );
});
