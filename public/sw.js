// Service Worker for offline support and PWA functionality

const CACHE_NAME = 'notebook-app-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
]

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        // Cache successful GET requests
        if (event.request.method === 'GET') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }

        return response
      })
    }).catch(() => {
      // Return offline page or placeholder if both cache and network fail
      if (event.request.destination === 'document') {
        return caches.match('/')
      }
    })
  )
})