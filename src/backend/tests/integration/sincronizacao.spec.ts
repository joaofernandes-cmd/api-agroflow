import request from 'supertest'
import app from '../../app'
import { SincronizacaoService } from '../../services/sincronizacao.service'
import { mockMovimentacaoValidada, mockSincronizacaoStatus, mockTarefa, mockTicket } from '../helpers/fixtures'

jest.mock('../../services/sincronizacao.service', () => ({
  SincronizacaoService: {
    detectarConexao: jest.fn(),
    sincronizar: jest.fn(),
    buscarMovimentacoesParaRelatrio: jest.fn(),
    buscarTarefasParaRelatrio: jest.fn(),
    buscarTicketsParaDashboard: jest.fn(),
    obterStatusSincronizacao: jest.fn(),
    obterMensagemSincronizacao: jest.fn(),
  },
}))

const mockedService = SincronizacaoService as jest.Mocked<typeof SincronizacaoService>

describe('Sincronizacao', () => {
  beforeEach(() => {
    mockedService.detectarConexao.mockResolvedValue(true)
    mockedService.sincronizar.mockResolvedValue({
      sucesso: true,
      registrosSincronizados: 3,
      erros: [],
    })
    mockedService.buscarMovimentacoesParaRelatrio.mockResolvedValue([mockMovimentacaoValidada as any])
    mockedService.buscarTarefasParaRelatrio.mockResolvedValue([mockTarefa as any])
    mockedService.buscarTicketsParaDashboard.mockResolvedValue([mockTicket as any])
    mockedService.obterStatusSincronizacao.mockResolvedValue(mockSincronizacaoStatus)
    mockedService.obterMensagemSincronizacao.mockResolvedValue('Tudo sincronizado!')
  })

  it('GET /sincronizacao/conexao deve detectar conexao', async () => {
    const response = await request(app).get('/sincronizacao/conexao')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ temConexao: true })
  })

  it('POST /sincronizacao deve sincronizar dados pendentes', async () => {
    const response = await request(app).post('/sincronizacao')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      sucesso: true,
      registrosSincronizados: 3,
      erros: [],
    })
  })

  it('POST /sincronizacao deve retornar 400 quando a sincronizacao falhar', async () => {
    mockedService.sincronizar.mockResolvedValueOnce({
      sucesso: false,
      registrosSincronizados: 0,
      erros: ['Sem conexão com o servidor'],
    })

    const response = await request(app).post('/sincronizacao')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      sucesso: false,
      registrosSincronizados: 0,
      erros: ['Sem conexão com o servidor'],
    })
  })

  it('GET /sincronizacao/status deve retornar status geral', async () => {
    const response = await request(app).get('/sincronizacao/status')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockSincronizacaoStatus)
  })

  it('GET /sincronizacao/mensagem deve retornar mensagem amigavel', async () => {
    const response = await request(app).get('/sincronizacao/mensagem')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ mensagem: 'Tudo sincronizado!' })
  })

  it('GET /sincronizacao/relatorios/movimentacoes deve buscar dados sincronizados', async () => {
    const response = await request(app).get('/sincronizacao/relatorios/movimentacoes').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockMovimentacaoValidada])
  })

  it('GET /sincronizacao/relatorios/movimentacoes deve rejeitar retiro invalido', async () => {
    const response = await request(app)
      .get('/sincronizacao/relatorios/movimentacoes')
      .query({ retiroId: 'retiro-invalido' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Retiro inválido' })
  })

  it('GET /sincronizacao/relatorios/tarefas deve buscar tarefas sincronizadas', async () => {
    const response = await request(app).get('/sincronizacao/relatorios/tarefas').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTarefa])
  })

  it('GET /sincronizacao/dashboard/tickets deve buscar tickets sincronizados', async () => {
    const response = await request(app).get('/sincronizacao/dashboard/tickets').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTicket])
  })
})
