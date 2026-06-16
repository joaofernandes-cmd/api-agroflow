const VERSION = 'v1'
const STATIC_CACHE = `agroflow-capataz-static-${VERSION}`
const RUNTIME_CACHE = `agroflow-capataz-runtime-${VERSION}`

const PRECACHE_URLS = [
  '/manifest-capataz.json',
  '/capataz-pwa.js',
  '/capataz/index',
  '/capataz/home',
  '/capataz/tarefas',
  '/capataz/detalhe-tarefa',
  '/capataz/movimentacao',
  '/capataz/chamado',
  '/css/capataz.css',
  '/assets/logo-agro-flow.svg',
  '/assets/icons/home.svg',
  '/assets/icons/tarefas.svg',
  '/assets/icons/movimentacao.svg',
  '/assets/icons/notificacao.svg',
  '/assets/pwa/icon-192.png',
  '/assets/pwa/icon-192-maskable.png',
  '/assets/pwa/icon-512.png',
  '/assets/pwa/icon-512-maskable.png',
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

    const fallback = await caches.match('/capataz/home') || await caches.match('/capataz/index')
    if (fallback) {
      return fallback
    }

    throw error
  }
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
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
