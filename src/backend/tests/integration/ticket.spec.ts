import request from 'supertest'
import app from '../../app'
import { TicketService } from '../../services/ticket.service'
import { mockCapataz, mockTicket } from '../helpers/fixtures'

jest.mock('../../services/ticket.service', () => ({
  TicketService: {
    criar: jest.fn(),
    listarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    listarPendentes: jest.fn(),
    listarPorStatus: jest.fn(),
    listarPorPrioridade: jest.fn(),
    listarPorCategoria: jest.fn(),
    contarPorPrioridade: jest.fn(),
    atualizarStatus: jest.fn(),
    alterarPrioridade: jest.fn(),
    atribuirA: jest.fn(),
  },
}))

const mockedService = TicketService as jest.Mocked<typeof TicketService>

describe('Tickets', () => {
  beforeEach(() => {
    mockedService.criar.mockResolvedValue(mockTicket as any)
    mockedService.listarTodos.mockResolvedValue([mockTicket as any])
    mockedService.buscarPorId.mockResolvedValue(mockTicket as any)
    mockedService.listarPendentes.mockResolvedValue([mockTicket as any])
    mockedService.listarPorStatus.mockResolvedValue([mockTicket as any])
    mockedService.listarPorPrioridade.mockResolvedValue([mockTicket as any])
    mockedService.listarPorCategoria.mockResolvedValue([mockTicket as any])
    mockedService.contarPorPrioridade.mockResolvedValue({ alta: 0, media: 1, baixa: 0 })
    mockedService.atualizarStatus.mockResolvedValue(mockTicket as any)
    mockedService.alterarPrioridade.mockResolvedValue(mockTicket as any)
    mockedService.atribuirA.mockResolvedValue(mockTicket as any)
  })

  it('POST /tickets deve criar ticket', async () => {
    const response = await request(app).post('/tickets').send({
      retiro_id: 1,
      categoria: 'cerca',
      localizacao: mockTicket.localizacao,
      descricao: mockTicket.descricao,
      prioridade: mockTicket.prioridade,
      usuarioAbridorTicket: mockCapataz,
      temEvidenciaDescritiva: true,
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(mockTicket)
  })

  it('GET /tickets deve listar todos os tickets', async () => {
    const response = await request(app).get('/tickets')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTicket])
  })

  it('GET /tickets/pendentes deve listar tickets pendentes', async () => {
    const response = await request(app).get('/tickets/pendentes').query({ retiroId: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTicket])
  })

  it('GET /tickets/status deve filtrar por status', async () => {
    const response = await request(app).get('/tickets/status').query({ status: 'pendente', retiroId: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTicket])
  })

  it('GET /tickets/prioridade deve filtrar por prioridade', async () => {
    const response = await request(app).get('/tickets/prioridade').query({ prioridade: 'media', retiroId: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTicket])
  })

  it('GET /tickets/categoria deve filtrar por categoria', async () => {
    const response = await request(app).get('/tickets/categoria').query({ categoria: 'cerca', retiroId: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTicket])
  })

  it('GET /tickets/contagem/prioridade deve retornar contagem por prioridade', async () => {
    const response = await request(app).get('/tickets/contagem/prioridade').query({ retiroId: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ alta: 0, media: 1, baixa: 0 })
  })

  it('GET /tickets/:id deve buscar ticket por id', async () => {
    const response = await request(app).get('/tickets/21')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTicket)
  })

  it('PATCH /tickets/:id/status deve atualizar status', async () => {
    const response = await request(app).patch('/tickets/21/status').send({
      novoStatus: 'aprovado',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTicket)
  })

  it('PATCH /tickets/:id/prioridade deve alterar prioridade', async () => {
    const response = await request(app).patch('/tickets/21/prioridade').send({
      novaPrioridade: 'alta',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTicket)
  })

  it('PATCH /tickets/:id/atribuicao deve atribuir ticket', async () => {
    const response = await request(app).patch('/tickets/21/atribuicao').send({
      usuarioId: mockCapataz.id,
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTicket)
  })
})
