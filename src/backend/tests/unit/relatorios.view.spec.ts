import fs from 'fs'
import path from 'path'
import vm from 'vm'

type EventoFake = { preventDefault?: jest.Mock; stopPropagation?: jest.Mock; target?: unknown }
type ListenerMap = Record<string, Array<(event?: EventoFake) => void>>

class ElementoFake {
  textContent = ''
  value = ''
  checked = false
  hidden = false
  className = ''
  href = ''
  download = ''
  dataset: Record<string, string> = {}
  style: Record<string, string> = {}
  children: ElementoFake[] = []
  listeners: ListenerMap = {}
  tagName: string

  constructor(tagName = 'div') {
    this.tagName = tagName
  }

  appendChild(filho: ElementoFake) {
    this.children.push(filho)
    return filho
  }

  replaceChildren(...filhos: ElementoFake[]) {
    this.children = filhos
  }

  addEventListener(evento: string, handler: (event?: EventoFake) => void) {
    this.listeners[evento] = this.listeners[evento] || []
    this.listeners[evento].push(handler)
  }

  setAttribute(nome: string, valor: string) {
    Object.assign(this, { [nome]: valor })
  }

  remove() {}

  click() {
    const evento = { preventDefault: jest.fn() }
    const handlers = this.listeners.click || []
    handlers.forEach(handler => handler(evento))
  }

  querySelector(_seletor: string): ElementoFake | null {
    return null
  }

  querySelectorAll(_seletor: string): ElementoFake[] {
    return []
  }

  contains(_elemento: unknown) {
    return false
  }
}

class MultiselectFake extends ElementoFake {
  toggle = new ElementoFake('button')
  panel = new ElementoFake('div')
  summary = new ElementoFake('span')
  all = new ElementoFake('input')
  itens: ElementoFake[] = []

  constructor() {
    super('div')
    this.all.checked = true
  }

  querySelector(seletor: string): ElementoFake | null {
    if (seletor === '.multiselect__toggle') return this.toggle
    if (seletor === '.multiselect__panel') return this.panel
    if (seletor === '.multiselect__summary') return this.summary
    if (seletor === '.multiselect__all') return this.all
    return null
  }

  querySelectorAll(seletor: string): ElementoFake[] {
    return seletor === '.multiselect__item' ? this.itens : []
  }
}

function extrairScriptRelatorios() {
  const arquivo = fs.readFileSync(
    path.resolve(__dirname, '../../../views/partials/relatorios.ejs'),
    'utf8'
  )
  const script = arquivo.match(/<script>([\s\S]*)<\/script>/)

  if (!script) {
    throw new Error('Script da view de relatorios nao encontrado')
  }

  return script[1]
}

function criarDocumentoFake() {
  const elementos: Record<string, ElementoFake> = {
    'data-hoje-desktop': new ElementoFake(),
    'relatorio-feedback': new ElementoFake(),
    'relatorio-feedback-mobile': new ElementoFake(),
    'relatorio-head': new ElementoFake('thead'),
    'relatorio-body': new ElementoFake('tbody'),
    'resumo-total': new ElementoFake(),
    'resumo-validado': new ElementoFake(),
    'resumo-pendente': new ElementoFake(),
    'resumo-retiros': new ElementoFake(),
    'resumo-periodo': new ElementoFake(),
    'form-relatorio': new ElementoFake('form'),
    'tipo-desktop': new ElementoFake('select'),
    'data-inicio-desktop': new ElementoFake('input'),
    'data-fim-desktop': new ElementoFake('input'),
    'formato-desktop': new ElementoFake('select'),
    'tipo-mobile': new ElementoFake('select'),
    'data-inicio-mobile': new ElementoFake('input'),
    'data-fim-mobile': new ElementoFake('input'),
    'formato-mobile': new ElementoFake('select'),
    'retiro-desktop': new MultiselectFake(),
    'retiro-mobile': new MultiselectFake(),
  }

  elementos['tipo-desktop'].value = 'todos'
  elementos['tipo-mobile'].value = 'todos'
  elementos['formato-desktop'].value = 'csv'
  elementos['formato-mobile'].value = 'csv'

  const botaoExportar = new ElementoFake('button')
  const body = new ElementoFake('body')

  const document = {
    body,
    getElementById: jest.fn((id: string) => elementos[id] || null),
    createElement: jest.fn((tag: string) => new ElementoFake(tag)),
    querySelector: jest.fn((seletor: string) => (
      seletor === '.btn--exportar-desktop' ? botaoExportar : null
    )),
    addEventListener: jest.fn(),
  }

  return { document, elementos, botaoExportar }
}

describe('View relatorios - JavaScript inline', () => {
  it('filtra previa e exportacao pelo mesmo periodo selecionado', async () => {
    const { document, elementos } = criarDocumentoFake()
    let blobExportado: Blob | undefined

    const relatorioDemo = {
      movimentacoes: {
        colunas: ['Data', 'Retiro', 'Registro', 'Detalhe', 'Status'],
        linhas: [
          { celulas: ['22/06/2026, 21:00', 'Aroeira', 'Eletrica', 'Alta'], status: 'Validado' },
          { celulas: ['23/06/2026, 02:52', 'Puga -> Baia Bonita', 'Transferencia', '40'], status: 'Validado' },
          { celulas: ['24/06/2026', 'CMB', 'Contagem geral', 'Baixa'], status: 'Validado' },
        ],
      },
      tarefas: { colunas: ['Data', 'Retiro', 'Registro', 'Detalhe', 'Status'], linhas: [] },
      tickets: { colunas: ['Data', 'Retiro', 'Registro', 'Detalhe', 'Status'], linhas: [] },
    }

    const codigo = extrairScriptRelatorios().replace(
      /const RELATORIO_DEMO = <%- JSON\.stringify\(typeof relatorioDemo !== 'undefined' \? relatorioDemo : \{\}\) %>;/,
      `const RELATORIO_DEMO = ${JSON.stringify(relatorioDemo)};`
    )

    const sandbox = {
      document,
      Blob,
      URL: {
        createObjectURL: jest.fn((blob: Blob) => {
          blobExportado = blob
          return 'blob:relatorio'
        }),
        revokeObjectURL: jest.fn(),
      },
      Date,
      Set,
      String,
      Number,
      RegExp,
    } as Record<string, unknown>

    vm.runInNewContext(codigo, sandbox)

    elementos['data-inicio-desktop'].value = '2026-06-22'
    elementos['data-fim-desktop'].value = '2026-06-23'
    elementos['tipo-desktop'].value = 'movimentacoes'
    elementos['formato-desktop'].value = 'csv'

    const carregarRelatorio = sandbox.carregarRelatorio as () => void
    const exportarRelatorio = sandbox.exportarRelatorio as (contexto: string) => void

    carregarRelatorio()
    exportarRelatorio('desktop')

    expect(elementos['relatorio-body'].children).toHaveLength(2)
    expect(elementos['resumo-total'].textContent).toBe('2')
    expect(elementos['resumo-periodo'].textContent).toContain('22/06/2026')
    expect(elementos['resumo-periodo'].textContent).toContain('23/06/2026')

    const csv = await blobExportado?.text()
    expect(csv).toContain('Aroeira')
    expect(csv).toContain('Puga')
    expect(csv).not.toContain('CMB')
    expect(elementos['relatorio-feedback'].textContent).toBe('Arquivo gerado com 2 registro(s).')
  })
})
