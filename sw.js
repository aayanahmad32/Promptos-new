const CACHE_NAME = 'promptos-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700&family=Fira+Code:wght@400;500&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/tiktoken@1.0.14/lite/init_tiktoken_wasm.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
    .catch(error => {
      console.error('Failed to cache resources:', error);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      
      // Clone the request
      const fetchRequest = event.request.clone();
      
      return fetch(fetchRequest).then(response => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response
        const responseToCache = response.clone();
        
        // Cache the fetched resource
        if (event.request.url.startsWith(self.location.origin) ||
          urlsToCache.some(url => event.request.url.includes(url))) {
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        
        return response;
      }).catch(() => {
        // Return a custom offline page for HTML requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return new Response(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Offline - PromptOS</title>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      height: 100vh;
                      margin: 0;
                      background: #0a0c14;
                      color: #dfe6f2;
                      text-align: center;
                    }
                    .offline-container {
                      max-width: 500px;
                      padding: 2rem;
                    }
                    h1 { color: #9b59b6; }
                    button {
                      background: #9b59b6;
                      color: white;
                      border: none;
                      padding: 10px 20px;
                      border-radius: 5px;
                      cursor: pointer;
                      margin-top: 1rem;
                    }
                  </style>
                </head>
                <body>
                  <div class="offline-container">
                    <h1>You're Offline</h1>
                    <p>Please check your internet connection and try again.</p>
                    <button onclick="window.location.reload()">Retry</button>
                  </div>
                </body>
              </html>
            `, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages
  self.clients.claim();
});

// Message event - handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});