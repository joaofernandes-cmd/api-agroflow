import fs from 'fs'
import path from 'path'
import vm from 'vm'

type Sandbox = {
  window: any
  navigator: any
  document: any
  fetch: jest.Mock
}

function criarIndexedDbFake() {
  const stores = new Map<string, Map<string, any>>()

  function requestAsync<T>(action: () => T) {
    const request: any = {}
    setTimeout(() => {
      try {
        request.result = action()
        request.onsuccess?.()
      } catch (error) {
        request.error = error
        request.onerror?.()
      }
    }, 0)
    return request
  }

  function criarStore(nome: string) {
    if (!stores.has(nome)) stores.set(nome, new Map())
    const store = stores.get(nome)!

    return {
      createIndex: jest.fn(),
      getAll: () => requestAsync(() => Array.from(store.values())),
      put: (item: any) => {
        store.set(item.id, item)
      },
      delete: (id: string) => {
        store.delete(id)
      },
    }
  }

  const db = {
    objectStoreNames: {
      contains: (nome: string) => stores.has(nome),
    },
    createObjectStore: (nome: string) => criarStore(nome),
    transaction: (nome: string) => {
      const tx: any = {
        objectStore: () => criarStore(nome),
      }

      setTimeout(() => tx.oncomplete?.(), 0)
      return tx
    },
    close: jest.fn(),
  }

  return {
    open: jest.fn(() => {
      const request: any = { result: db }
      setTimeout(() => {
        request.onupgradeneeded?.()
        request.onsuccess?.()
      }, 0)
      return request
    }),
    stores,
  }
}

async function carregarPwa(options: { online?: boolean; fetch?: jest.Mock } = {}): Promise<Sandbox> {
  const indexedDB = criarIndexedDbFake()
  const document = {
    readyState: 'loading',
    addEventListener: jest.fn(),
    querySelector: jest.fn(() => null),
    hidden: false,
  }
  const navigator = {
    onLine: options.online ?? true,
    standalone: false,
    serviceWorker: undefined,
  }
  const consoleMock = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
  }
  const window: any = {
    navigator,
    document,
    indexedDB,
    Blob,
    CustomEvent,
    structuredClone,
    crypto: { randomUUID: jest.fn(() => 'offline-id') },
    matchMedia: jest.fn(() => ({ matches: false })),
    addEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    setTimeout,
    clearTimeout,
    setInterval: jest.fn(() => 1),
    clearInterval: jest.fn(),
    console: consoleMock,
  }

  const sandbox: Sandbox & Record<string, any> = {
    window,
    navigator,
    document,
    indexedDB,
    Blob,
    CustomEvent,
    structuredClone,
    AbortController,
    fetch: options.fetch ?? jest.fn(),
    console: consoleMock,
    setTimeout,
    clearTimeout,
    setInterval: window.setInterval,
    clearInterval: window.clearInterval,
  }

  window.fetch = sandbox.fetch

  const codigo = fs.readFileSync(
    path.join(process.cwd(), 'src/backend/public/capataz-pwa.js'),
    'utf8'
  )

  vm.runInNewContext(codigo, sandbox)

  return sandbox
}

describe('PWA do capataz', () => {
  it('deve salvar operacao na fila quando estiver offline', async () => {
    const sandbox = await carregarPwa({ online: false })

    const resultado = await sandbox.window.AgroFlowCapataz.fetchOrQueueOperation({
      kind: 'movimentacao',
      url: '/movimentacoes/sincronizar',
      body: { tipo: 'nascimento' },
    })

    await new Promise(resolve => setTimeout(resolve, 5))

    await expect(sandbox.window.AgroFlowCapataz.getQueueCount()).resolves.toBe(1)
    expect(resultado).toEqual({ queued: true, online: false })
    expect(sandbox.fetch).not.toHaveBeenCalled()
  })

  it('deve sincronizar pendencias quando a conexao voltar', async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
    const sandbox = await carregarPwa({ online: true, fetch })

    await sandbox.window.AgroFlowCapataz.queueOperation({
      id: 'mov-1',
      kind: 'movimentacao',
      url: '/movimentacoes/sincronizar',
      body: { tipo: 'nascimento', evidenciaDraft: { tipo: 'mensagem', conteudo: 'Registro local' } },
    })

    const resultado = await sandbox.window.AgroFlowCapataz.syncPendingOperations()

    await expect(sandbox.window.AgroFlowCapataz.getQueueCount()).resolves.toBe(0)
    expect(resultado).toEqual({ sucesso: true, sincronizados: 1, erros: [] })
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      '/movimentacoes/sincronizar',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          tipo: 'nascimento',
          evidencia: { tipo: 'mensagem', conteudo: 'Registro local' },
        }),
      })
    )
  })

  it('deve manter pendencia na fila quando sincronizacao falhar', async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Falha técnica' }),
      })
    const sandbox = await carregarPwa({ online: true, fetch })

    await sandbox.window.AgroFlowCapataz.queueOperation({
      id: 'mov-erro',
      kind: 'movimentacao',
      url: '/movimentacoes/sincronizar',
      body: { tipo: 'nascimento' },
    })

    const resultado = await sandbox.window.AgroFlowCapataz.syncPendingOperations()

    await expect(sandbox.window.AgroFlowCapataz.getQueueCount()).resolves.toBe(1)
    expect(resultado.sucesso).toBe(false)
    expect(resultado.sincronizados).toBe(0)
    expect(resultado.erros).toHaveLength(1)
  })

  it('deve rejeitar midia invalida antes de enfileirar movimentacao', async () => {
    const sandbox = await carregarPwa({ online: false })

    await expect(
      sandbox.window.AgroFlowCapataz.fetchOrQueueOperation({
        kind: 'movimentacao',
        url: '/movimentacoes/sincronizar',
        body: {
          tipo: 'nascimento',
          evidenciaDraft: {
            tipo: 'foto',
            blob: new Blob(['conteudo'], { type: 'application/pdf' }),
            mimeType: 'application/pdf',
          },
        },
      })
    ).rejects.toMatchObject({ name: 'AgroFlowMediaValidationError' })

    await expect(sandbox.window.AgroFlowCapataz.getQueueCount()).resolves.toBe(0)
  })
})
