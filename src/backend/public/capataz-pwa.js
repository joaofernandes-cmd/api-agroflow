(function () {
  var DB_NAME = 'agroflow-capataz-pwa'
  var DB_VERSION = 1
  var QUEUE_STORE = 'queue'
  var META_STORE = 'meta'
  var SERVICE_WORKER_PATH = '/sw-capataz.js'
  var SERVICE_WORKER_SCOPE = '/capataz/'
  var INSTALL_BUTTON_SELECTOR = '#btn-instalar-pwa'
  var CONNECTION_STATUS_SELECTOR = '#pwa-connection-status'
  var QUEUE_STATUS_SELECTOR = '#pwa-queue-status'
  var INSTALL_HINT_SELECTOR = '#pwa-install-hint'
  var CONNECTIVITY_CHECK_URL = '/health'
  var CONNECTIVITY_CHECK_TIMEOUT_MS = 2500

  var deferredInstallPrompt = null
  var bootstrapped = false
  var registeredServiceWorker = false
  var lastKnownOnline = navigator.onLine
  var connectivityIntervalId = null

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID()
    }

    return 'offline-' + Date.now() + '-' + Math.random().toString(16).slice(2)
  }

  function deepClone(value) {
    if (typeof structuredClone === 'function') {
      return structuredClone(value)
    }

    return value
  }

  function setKnownOnline(online) {
    lastKnownOnline = Boolean(online)
    return lastKnownOnline
  }

  async function detectConnectivity() {
    if (!navigator.onLine) {
      return setKnownOnline(false)
    }

    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    var timeoutId = controller
      ? window.setTimeout(function () {
          controller.abort()
        }, CONNECTIVITY_CHECK_TIMEOUT_MS)
      : null

    try {
      var separator = CONNECTIVITY_CHECK_URL.indexOf('?') >= 0 ? '&' : '?'
      var response = await fetch(CONNECTIVITY_CHECK_URL + separator + 'pwa=' + Date.now(), {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: controller ? controller.signal : undefined,
      })

      return setKnownOnline(Boolean(response && response.ok))
    } catch (error) {
      return setKnownOnline(false)
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }

  async function refreshConnectivity() {
    var online = await detectConnectivity()
    notifyQueueChange(online)
    return online
  }

  function openDb() {
    return new Promise(function (resolve, reject) {
      var request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = function () {
        var db = request.result

        if (!db.objectStoreNames.contains(QUEUE_STORE)) {
          var queueStore = db.createObjectStore(QUEUE_STORE, { keyPath: 'id' })
          queueStore.createIndex('by_createdAt', 'createdAt', { unique: false })
          queueStore.createIndex('by_kind', 'kind', { unique: false })
        }

        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: 'key' })
        }
      }

      request.onsuccess = function () {
        resolve(request.result)
      }

      request.onerror = function () {
        reject(request.error)
      }
    })
  }

  async function withDb(mode, executor) {
    var db = await openDb()

    try {
      return await executor(db, mode)
    } finally {
      db.close()
    }
  }

  async function listQueuedOperations() {
    return withDb('readonly', function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(QUEUE_STORE, 'readonly')
        var store = tx.objectStore(QUEUE_STORE)
        var request = store.getAll()

        request.onsuccess = function () {
          var items = Array.isArray(request.result) ? request.result : []
          items.sort(function (a, b) {
            return String(a.createdAt || '').localeCompare(String(b.createdAt || ''))
          })
          resolve(items)
        }

        request.onerror = function () {
          reject(request.error)
        }
      })
    })
  }

  async function getQueueCount() {
    var items = await listQueuedOperations()
    return items.length
  }

  async function saveQueuedOperation(operation) {
    var item = {
      id: operation.id || makeId(),
      kind: operation.kind,
      url: operation.url,
      method: operation.method || 'POST',
      headers: operation.headers || {},
      body: deepClone(operation.body),
      createdAt: operation.createdAt || new Date().toISOString(),
      attempts: operation.attempts || 0,
      meta: operation.meta || {},
    }

    return withDb('readwrite', function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(QUEUE_STORE, 'readwrite')
        var store = tx.objectStore(QUEUE_STORE)
        store.put(item)

        tx.oncomplete = function () {
          resolve(item)
        }

        tx.onerror = function () {
          reject(tx.error)
        }
      })
    })
  }

  async function removeQueuedOperation(id) {
    return withDb('readwrite', function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(QUEUE_STORE, 'readwrite')
        tx.objectStore(QUEUE_STORE).delete(id)

        tx.oncomplete = function () {
          resolve(true)
        }

        tx.onerror = function () {
          reject(tx.error)
        }
      })
    })
  }

  function getSupabaseConfig() {
    return window.__SUPABASE__ || null
  }

  function inferExtension(mimeType, fallback) {
    if (mimeType === 'image/jpeg') return 'jpg'
    if (mimeType === 'image/png') return 'png'
    if (mimeType === 'audio/mp4') return 'm4a'
    if (mimeType === 'audio/ogg') return 'ogg'
    if (mimeType === 'audio/webm') return 'webm'
    return fallback
  }

  async function uploadBinaryToSupabase(draft, usuarioId, destinoPadrao) {
    var config = getSupabaseConfig()

    if (!config || !config.url || !config.anonKey || !config.bucket) {
      throw new Error('Configuração do Supabase ausente. O registro offline será mantido até o app conseguir enviar.')
    }

    if (!draft || !draft.blob) {
      throw new Error('Draft de mídia ausente.')
    }

    var blob = draft.blob instanceof Blob ? draft.blob : new Blob([draft.blob], { type: draft.mimeType || 'application/octet-stream' })
    var pasta = config.folder || destinoPadrao
    var extensao = inferExtension(draft.mimeType, destinoPadrao === 'evidencias/audio' ? 'webm' : 'jpg')
    var nomeArquivo = [usuarioId || 'capataz', Date.now() + '.' + extensao].join('/')
    var caminho = (pasta + '/' + nomeArquivo).replace(/^\/+/, '')
    var baseUrl = config.url.replace(/\/+$/, '')
    var uploadUrl = baseUrl + '/storage/v1/object/' + config.bucket + '/' + caminho

    var response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        apikey: config.anonKey,
        Authorization: 'Bearer ' + config.anonKey,
        'Content-Type': draft.mimeType || 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: blob,
    })

    if (!response.ok) {
      var texto = await response.text().catch(function () {
        return ''
      })
      throw new Error('Falha ao enviar mídia para o Supabase (' + response.status + '): ' + (texto || 'sem detalhes'))
    }

    return {
      urlArquivo: baseUrl + '/storage/v1/object/public/' + config.bucket + '/' + caminho,
      caminho: caminho,
    }
  }

  async function buildMovimentacaoEvidencia(body) {
    if (!body || !body.evidenciaDraft) {
      return body && body.evidencia ? body.evidencia : null
    }

    var draft = body.evidenciaDraft

    if (draft.tipo === 'mensagem') {
      return {
        tipo: 'mensagem',
        conteudo: draft.conteudo,
      }
    }

    if (draft.tipo === 'audio') {
      var audioUpload = await uploadBinaryToSupabase(draft, body.capataz_id, 'evidencias/audio')

      return {
        tipo: 'audio',
        urlArquivo: audioUpload.urlArquivo,
        duracao: draft.durationSeconds,
      }
    }

    if (draft.tipo === 'foto') {
      var fotoUpload = await uploadBinaryToSupabase(draft, body.capataz_id, 'evidencias/foto')

      return {
        tipo: 'foto',
        urlArquivo: fotoUpload.urlArquivo,
        latitude: draft.latitude,
        longitude: draft.longitude,
      }
    }

    throw new Error('Tipo de evidência inválido.')
  }

  async function executeQueuedOperation(operation) {
    var body = deepClone(operation.body || {})

    if (operation.kind === 'movimentacao') {
      body.evidencia = await buildMovimentacaoEvidencia(body)
      delete body.evidenciaDraft
    }

    if (operation.kind === 'task-status') {
      body = {
        status: body.status,
      }
    }

    var response = await fetch(operation.url, {
      method: operation.method || 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, operation.headers || {}),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      var data = await response.json().catch(function () {
        return {}
      })
      var erro = data && data.error ? data.error : 'HTTP ' + response.status
      throw new Error(erro)
    }

    return response
  }

  function notifyQueueChange(onlineOverride) {
    var detail = {
      queueCount: 0,
      online: typeof onlineOverride === 'boolean' ? onlineOverride : lastKnownOnline,
      standalone: isStandalone(),
    }

    getQueueCount().then(function (queueCount) {
      detail.queueCount = queueCount
      window.dispatchEvent(new CustomEvent('agroflow:queue-change', { detail: detail }))
      renderHomeWidgets(detail)
    })
  }

  function getElements() {
    return {
      installButton: document.querySelector(INSTALL_BUTTON_SELECTOR),
      connectionStatus: document.querySelector(CONNECTION_STATUS_SELECTOR),
      queueStatus: document.querySelector(QUEUE_STATUS_SELECTOR),
      installHint: document.querySelector(INSTALL_HINT_SELECTOR),
    }
  }

  function renderHomeWidgets(state) {
    var els = getElements()
    var queueCount = state && typeof state.queueCount === 'number' ? state.queueCount : 0
    var online = state && typeof state.online === 'boolean' ? state.online : lastKnownOnline
    var standalone = state && typeof state.standalone === 'boolean' ? state.standalone : isStandalone()
    var installable = Boolean(deferredInstallPrompt) && !standalone

    if (els.installButton) {
      els.installButton.hidden = false
      els.installButton.disabled = false
      els.installButton.classList.toggle('pwa-install-icon--waiting', !installable)
      els.installButton.title = standalone
        ? 'App instalado'
        : installable
          ? 'Instalar app'
          : 'Toque para verificar a instalacao'
    }

    if (els.installHint) {
      els.installHint.hidden = true
      els.installHint.textContent = ''
    }

    if (els.connectionStatus) {
      els.connectionStatus.textContent = online ? 'Online' : 'Offline'
      els.connectionStatus.classList.toggle('pwa-status__pill--offline', !online)
      els.connectionStatus.classList.toggle('pwa-status__pill--pending', queueCount > 0)
    }

    if (els.queueStatus) {
      els.queueStatus.textContent = queueCount > 0
        ? queueCount + ' registro(s) na fila'
        : 'Nenhum registro pendente'
    }
  }

  async function syncPendingOperations() {
    var online = await detectConnectivity()

    if (!online) {
      notifyQueueChange(false)
      return { sucesso: false, sincronizados: 0, erros: ['Sem conexão com a internet.'] }
    }

    var queue = await listQueuedOperations()
    var sincronizados = 0
    var erros = []

    for (var i = 0; i < queue.length; i += 1) {
      var item = queue[i]

      try {
        await executeQueuedOperation(item)
        await removeQueuedOperation(item.id)
        sincronizados += 1
      } catch (error) {
        erros.push('Erro ao sincronizar ' + item.kind + ': ' + (error instanceof Error ? error.message : 'erro desconhecido'))
      }
    }

    notifyQueueChange()

    return {
      sucesso: sincronizados > 0 || erros.length === 0,
      sincronizados: sincronizados,
      erros: erros,
    }
  }

  async function fetchOrQueueOperation(config) {
    var body = config.body
    var queueBody = config.queueBody || config.body
    var method = config.method || 'POST'
    var headers = config.headers || {}
    var online = await detectConnectivity()

    if (!online) {
      await saveQueuedOperation({
        kind: config.kind,
        url: config.url,
        method: method,
        headers: headers,
        body: queueBody,
        meta: config.meta || {},
      })
      notifyQueueChange(false)

      return { queued: true, online: false }
    }

    try {
      var requestBody = deepClone(body || {})

      if (config.kind === 'movimentacao') {
        requestBody.evidencia = await buildMovimentacaoEvidencia(requestBody)
        delete requestBody.evidenciaDraft
      }

      var response = await fetch(config.url, {
        method: method,
        headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        var data = await response.json().catch(function () {
          return {}
        })
        throw new Error((data && data.error) || 'HTTP ' + response.status)
      }

      notifyQueueChange()

      return { queued: false, online: true, response: response }
    } catch (error) {
      if (error && (error.name === 'TypeError' || error.name === 'AbortError')) {
        setKnownOnline(false)
      }

      await saveQueuedOperation({
        kind: config.kind,
        url: config.url,
        method: method,
        headers: headers,
        body: queueBody,
        meta: config.meta || {},
      })
      notifyQueueChange()
      return { queued: true, online: lastKnownOnline, error: error }
    }
  }

  async function promptInstall() {
    if (!deferredInstallPrompt || isStandalone()) {
      return { available: false }
    }

    var promptEvent = deferredInstallPrompt
    deferredInstallPrompt = null
    promptEvent.prompt()
    var choice = await promptEvent.userChoice
    renderHomeWidgets()

    return {
      available: true,
      outcome: choice && choice.outcome ? choice.outcome : 'dismissed',
    }
  }

  function bindInstallButton(button) {
    if (!button) {
      return
    }

    if (button.dataset.agroflowBound === '1') {
      renderHomeWidgets()
      return
    }

    button.dataset.agroflowBound = '1'

    button.addEventListener('click', async function () {
      try {
        var resultado = await promptInstall()
        var els = getElements()

        if (!resultado.available && els.installHint) {
          els.installHint.hidden = false
          els.installHint.textContent = isStandalone()
            ? 'App já instalado neste dispositivo.'
            : 'Se o navegador não abrir a instalação, use o menu e escolha Instalar app.'
        }
      } catch (error) {
        console.error('Falha ao abrir instalação do PWA', error)
      }
    })

    renderHomeWidgets()
  }

  function bootstrap() {
    if (bootstrapped) {
      return
    }

    bootstrapped = true

    if ('serviceWorker' in navigator && !registeredServiceWorker) {
      registeredServiceWorker = true
      window.addEventListener('load', function () {
        navigator.serviceWorker.register(SERVICE_WORKER_PATH, { scope: SERVICE_WORKER_SCOPE }).catch(function (error) {
          console.warn('Não foi possível registrar o service worker do Capataz.', error)
        })
      })
    }

    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault()
      deferredInstallPrompt = event
      renderHomeWidgets()
    })

    window.addEventListener('appinstalled', function () {
      deferredInstallPrompt = null
      renderHomeWidgets()
    })

    window.addEventListener('online', function () {
      refreshConnectivity().then(function (online) {
        if (online) {
          syncPendingOperations().catch(function (error) {
            console.warn('Falha ao sincronizar fila offline do Capataz.', error)
          })
        }
      })
    })

    window.addEventListener('offline', function () {
      setKnownOnline(false)
      notifyQueueChange(false)
    })

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) {
        refreshConnectivity().catch(function () {
          notifyQueueChange(false)
        })
      }
    })

    window.addEventListener('agroflow:force-sync', function () {
      syncPendingOperations().catch(function (error) {
        console.warn('Falha ao sincronizar fila offline do Capataz.', error)
      })
    })

    notifyQueueChange(lastKnownOnline)
    refreshConnectivity().catch(function () {
      notifyQueueChange(false)
    })

    if (!connectivityIntervalId) {
      connectivityIntervalId = window.setInterval(function () {
        refreshConnectivity().catch(function () {
          notifyQueueChange(false)
        })
      }, 15000)
    }

    if (navigator.onLine) {
      syncPendingOperations().catch(function (error) {
        console.warn('Falha ao sincronizar fila offline do Capataz.', error)
      })
    }
  }

  window.AgroFlowCapataz = {
    bootstrap: bootstrap,
    bindInstallButton: bindInstallButton,
    fetchOrQueueOperation: fetchOrQueueOperation,
    getQueueCount: getQueueCount,
    isStandalone: isStandalone,
    notifyQueueChange: notifyQueueChange,
    promptInstall: promptInstall,
    queueOperation: saveQueuedOperation,
    renderHomeWidgets: renderHomeWidgets,
    syncPendingOperations: syncPendingOperations,
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bootstrap()
      renderHomeWidgets()
      bindInstallButton(document.querySelector(INSTALL_BUTTON_SELECTOR))
    })
  } else {
    bootstrap()
    renderHomeWidgets()
    bindInstallButton(document.querySelector(INSTALL_BUTTON_SELECTOR))
  }
})()
