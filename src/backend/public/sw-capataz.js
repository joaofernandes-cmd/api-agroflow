const VERSION = 'v10'
const STATIC_CACHE = `agroflow-capataz-static-${VERSION}`
const RUNTIME_CACHE = `agroflow-capataz-runtime-${VERSION}`

const PRECACHE_URLS = [
  '/manifest-capataz.json',
  '/capataz-pwa.js?v=8',
  '/capataz',
  '/capataz/home',
  '/capataz/tarefas',
  '/capataz/movimentacao',
  '/capataz/ticket',
  '/css/capataz.css?v=8',
  '/js/prioridade-seletor.js',
  '/assets/logo-agro-flow.svg',
  '/assets/icons/audio.svg',
  '/assets/icons/foto.svg',
  '/assets/icons/home.svg',
  '/assets/icons/movimentacao.svg',
  '/assets/icons/tarefas.svg',
  '/assets/icons/texto.svg',
  '/assets/icons/tickets.svg',
  '/assets/pwa/icon-agroflow-550.png',
  '/assets/pwa/icon-agroflow-550-maskeable.png',
  '/assets/pwa/icon-agroflow.png',
  '/assets/pwa/icon-agroflow-maskeable.png',
]

function isNavigationRequest(request) {
  return request.mode === 'navigate' || request.destination === 'document'
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  const response = await fetch(request)
  if (response && response.ok) {
    cache.put(request, response.clone())
  }

  return response
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE)

  try {
    const response = await fetch(request)
    if (response && response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }

    const fallback = await caches.match('/capataz/home') || await caches.match('/capataz')
    if (fallback) {
      return fallback
    }

    throw error
  }
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => Promise.all(PRECACHE_URLS.map(url => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
            return caches.delete(key)
          }

          return Promise.resolve(false)
        })
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)

  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(cacheFirst(request))
    return
  }

  if (url.origin !== self.location.origin) {
    return
  }

  if (request.method !== 'GET') {
    return
  }

  if (isNavigationRequest(request) && url.pathname.startsWith('/capataz/')) {
    event.respondWith(networkFirst(request))
    return
  }

  if (
    url.pathname === '/capataz-pwa.js' ||
    url.pathname === '/manifest-capataz.json' ||
    url.pathname.startsWith('/css/') ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  if (url.pathname.startsWith('/capataz/')) {
    event.respondWith(networkFirst(request))
  }
})
