import { RelatorioController } from '../../controllers/relatorio.controller'
import { UsuarioController } from '../../controllers/usuario.controller'
import { RelatorioService } from '../../services/relatorio.service'
import { UsuarioService } from '../../services/usuario.service'

jest.mock('../../services/usuario.service', () => ({
  UsuarioService: {
    autenticar: jest.fn(),
    autenticarCapatazPorToken: jest.fn(),
    estaAtivo: jest.fn(),
    listarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorRetiro: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
  },
}))

jest.mock('../../services/relatorio.service', () => ({
  RelatorioService: {
    buscarDadosMovimentacoes: jest.fn(),
    buscarDadosTarefas: jest.fn(),
    buscarDadosTickets: jest.fn(),
    formatarRelatorioMovimentacoes: jest.fn(),
    gerarArquivo: jest.fn(),
    gerarRelatorioSemanal: jest.fn(),
    gerarRelatorioMensal: jest.fn(),
  },
}))

const usuarioService = UsuarioService as jest.Mocked<typeof UsuarioService>
const relatorioService = RelatorioService as jest.Mocked<typeof RelatorioService>

function criarResponse() {
  const res: any = {
    status: jest.fn(),
    json: jest.fn(),
    send: jest.fn(),
    setHeader: jest.fn(),
    redirect: jest.fn(),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  }

  Object.values(res).forEach(fn => (fn as jest.Mock).mockReturnValue(res))
  return res
}

describe('Controllers - tratamento de erros', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('UsuarioController.listarTodos retorna erro generico quando service falha', async () => {
    usuarioService.listarTodos.mockRejectedValueOnce(new Error('DATABASE_URL nao definida'))
    const res = criarResponse()

    await UsuarioController.listarTodos({} as any, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('listar'),
    }))
  })

  it('UsuarioController.buscarPorId retorna 404 quando usuario nao existe', async () => {
    usuarioService.buscarPorId.mockResolvedValueOnce(null)
    const res = criarResponse()

    await UsuarioController.buscarPorId({ params: { id: 'usuario-inexistente' } } as any, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('encontrado'),
    }))
  })

  it('UsuarioController.criar rejeita payload incompleto antes de chamar o service', async () => {
    const res = criarResponse()

    await UsuarioController.criar({ body: { nome: 'Novo Usuario' } } as any, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(usuarioService.criar).not.toHaveBeenCalled()
  })

  it('UsuarioController.listarPorRetiro rejeita retiro invalido antes de consultar service', async () => {
    const res = criarResponse()

    await UsuarioController.listarPorRetiro({ params: { retiroId: 'retiro-invalido' } } as any, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(usuarioService.listarPorRetiro).not.toHaveBeenCalled()
  })

  it('RelatorioController.buscarDadosMovimentacoes nao expõe erro tecnico na resposta', async () => {
    relatorioService.buscarDadosMovimentacoes.mockRejectedValueOnce(new Error('DATABASE_URL não definida'))
    const res = criarResponse()

    await RelatorioController.buscarDadosMovimentacoes({ query: {} } as any, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erro ao buscar dados de movimentações',
    })
  })

  it('RelatorioController.exportar rejeita tipo ou formato invalido antes de gerar arquivo', async () => {
    const res = criarResponse()

    await RelatorioController.exportar({ query: { tipo: 'todos', formato: 'pdf' } } as any, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(relatorioService.gerarArquivo).not.toHaveBeenCalled()
  })

  it('RelatorioController.exportar retorna erro amigavel quando geracao falha', async () => {
    relatorioService.gerarArquivo.mockRejectedValueOnce(new Error('timeout'))
    const res = criarResponse()

    await RelatorioController.exportar({ query: { tipo: 'tickets', formato: 'csv' } } as any, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erro ao exportar relatório',
    })
  })
})
