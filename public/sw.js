const CACHE_NAME = 'gasundo-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(event.request.url)
  const isSameOrigin = requestUrl.origin === self.location.origin
  const isNavigation = event.request.mode === 'navigate'
  const isStaticAsset =
    isSameOrigin &&
    (
      requestUrl.pathname.startsWith('/_next/static/') ||
      requestUrl.pathname.startsWith('/icons/') ||
      requestUrl.pathname.startsWith('/logos/') ||
      requestUrl.pathname === '/manifest.json' ||
      requestUrl.pathname === '/default-marker.png'
    )

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }

          return response
        })
        .catch(async () => {
          const cached = await caches.match(event.request)
          return cached || caches.match('/')
        })
    )
    return
  }

  if (!isStaticAsset) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached
      }

      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }

        return response
      })
    })
  )
})
