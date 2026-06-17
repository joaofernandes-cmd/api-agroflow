import request from 'supertest'
import app from '../../app'
import { TicketService } from '../../services/ticket.service'
import { mockCapataz, mockTicket } from '../helpers/fixtures'

jest.mock('../../services/ticket.service', () => ({
  TicketService: {
    criar: jest.fn(),
    sincronizarRecebida: jest.fn(),
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
    mockedService.sincronizarRecebida.mockResolvedValue(mockTicket as any)
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
      id: mockTicket.id,
      retiro_id: '00000000-0000-4000-8000-000000000001',
      categoria: 'cerca',
      localizacao: mockTicket.localizacao,
      descricao: mockTicket.descricao,
      prioridade: mockTicket.prioridade,
      usuarioAbridorTicket: mockCapataz,
      temEvidenciaDescritiva: true,
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(mockTicket)
    expect(mockedService.criar).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockTicket.id }),
      mockCapataz,
      true
    )
  })

  it('POST /tickets deve rejeitar payload incompleto', async () => {
    const response = await request(app).post('/tickets').send({
      retiro_id: '00000000-0000-4000-8000-000000000001',
      categoria: 'cerca',
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Campos obrigatórios não informados' })
    expect(mockedService.criar).not.toHaveBeenCalled()
  })

  it('POST /tickets deve rejeitar Categoria inválida', async () => {
    const response = await request(app).post('/tickets').send({
      retiro_id: '00000000-0000-4000-8000-000000000001',
      categoria: 'invalida',
      localizacao: mockTicket.localizacao,
      descricao: mockTicket.descricao,
      prioridade: mockTicket.prioridade,
      usuarioAbridorTicket: mockCapataz,
      temEvidenciaDescritiva: true,
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Categoria inválida' })
    expect(mockedService.criar).not.toHaveBeenCalled()
  })

  it('POST /tickets deve rejeitar Prioridade inválida', async () => {
    const response = await request(app).post('/tickets').send({
      retiro_id: '00000000-0000-4000-8000-000000000001',
      categoria: 'cerca',
      localizacao: mockTicket.localizacao,
      descricao: mockTicket.descricao,
      prioridade: 'urgente',
      usuarioAbridorTicket: mockCapataz,
      temEvidenciaDescritiva: true,
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Prioridade inválida' })
    expect(mockedService.criar).not.toHaveBeenCalled()
  })

  it('POST /tickets deve rejeitar violacao de regra de negocio', async () => {
    mockedService.criar.mockRejectedValueOnce(
      new Error('Ticket rejeitado: ao menos uma evidência descritiva é obrigatória')
    )

    const response = await request(app).post('/tickets').send({
      retiro_id: '00000000-0000-4000-8000-000000000001',
      categoria: 'cerca',
      localizacao: mockTicket.localizacao,
      descricao: mockTicket.descricao,
      prioridade: mockTicket.prioridade,
      usuarioAbridorTicket: mockCapataz,
      temEvidenciaDescritiva: false,
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: 'Ticket rejeitado: ao menos uma evidência descritiva é obrigatória',
    })
  })

  it('POST /tickets/sincronizar deve criar ticket sincronizado', async () => {
    const response = await request(app).post('/tickets/sincronizar').send({
      id: mockTicket.id,
      retiro_id: '00000000-0000-4000-8000-000000000001',
      aberto_por: mockCapataz.id,
      categoria: mockTicket.categoria,
      localizacao: mockTicket.localizacao,
      descricao: mockTicket.descricao,
      prioridade: mockTicket.prioridade,
      status: 'pendente',
      sincronizado: false,
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(mockTicket)
    expect(mockedService.sincronizarRecebida).toHaveBeenCalledTimes(1)
  })

  it('POST /tickets/sincronizar deve rejeitar Status inválido', async () => {
    const response = await request(app).post('/tickets/sincronizar').send({
      id: mockTicket.id,
      retiro_id: '00000000-0000-4000-8000-000000000001',
      aberto_por: mockCapataz.id,
      categoria: mockTicket.categoria,
      localizacao: mockTicket.localizacao,
      descricao: mockTicket.descricao,
      prioridade: mockTicket.prioridade,
      status: 'invalido',
      sincronizado: false,
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Status inválido' })
    expect(mockedService.sincronizarRecebida).not.toHaveBeenCalled()
  })

  it('GET /tickets deve listar todos os tickets', async () => {
    const response = await request(app).get('/tickets')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTicket])
  })

  it('GET /tickets/pendentes deve listar tickets pendentes', async () => {
    const response = await request(app).get('/tickets/pendentes').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTicket])
  })

  it('GET /tickets/status deve filtrar por status', async () => {
    const response = await request(app).get('/tickets/status').query({ status: 'pendente', retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTicket])
  })

  it('GET /tickets/status deve rejeitar Status inválido', async () => {
    const response = await request(app).get('/tickets/status').query({ status: 'invalido', retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Status inválido' })
    expect(mockedService.listarPorStatus).not.toHaveBeenCalled()
  })

  it('GET /tickets/prioridade deve filtrar por prioridade', async () => {
    const response = await request(app).get('/tickets/prioridade').query({ prioridade: 'media', retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTicket])
  })

  it('GET /tickets/prioridade deve rejeitar Prioridade inválida', async () => {
    const response = await request(app).get('/tickets/prioridade').query({ prioridade: 'urgente', retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Prioridade inválida' })
    expect(mockedService.listarPorPrioridade).not.toHaveBeenCalled()
  })

  it('GET /tickets/categoria deve filtrar por categoria', async () => {
    const response = await request(app).get('/tickets/categoria').query({ categoria: 'cerca', retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTicket])
  })

  it('GET /tickets/categoria deve rejeitar Categoria inválida', async () => {
    const response = await request(app).get('/tickets/categoria').query({ categoria: 'invalida', retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Categoria inválida' })
    expect(mockedService.listarPorCategoria).not.toHaveBeenCalled()
  })

  it('GET /tickets/contagem/prioridade deve retornar contagem por prioridade', async () => {
    const response = await request(app).get('/tickets/contagem/prioridade').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ alta: 0, media: 1, baixa: 0 })
  })

  it('GET /tickets/:id deve buscar ticket por id', async () => {
    const response = await request(app).get('/tickets/00000000-0000-4000-8000-000000000401')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTicket)
  })

  it('GET /tickets/:id deve retornar 404 para ticket inexistente', async () => {
    mockedService.buscarPorId.mockResolvedValueOnce(null)

    const response = await request(app).get('/tickets/00000000-0000-4000-8000-999999999999')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Ticket não encontrado' })
  })

  it('PATCH /tickets/:id/status deve atualizar status', async () => {
    const response = await request(app).patch('/tickets/00000000-0000-4000-8000-000000000401/status').send({
      novoStatus: 'aprovado',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTicket)
  })

  it('PATCH /tickets/:id/status deve rejeitar Status inválido', async () => {
    const response = await request(app).patch('/tickets/00000000-0000-4000-8000-000000000401/status').send({
      novoStatus: 'invalido',
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Status inválido' })
    expect(mockedService.atualizarStatus).not.toHaveBeenCalled()
  })

  it('PATCH /tickets/:id/prioridade deve alterar prioridade', async () => {
    const response = await request(app).patch('/tickets/00000000-0000-4000-8000-000000000401/prioridade').send({
      novaPrioridade: 'alta',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTicket)
  })

  it('PATCH /tickets/:id/prioridade deve rejeitar Prioridade inválida', async () => {
    const response = await request(app).patch('/tickets/00000000-0000-4000-8000-000000000401/prioridade').send({
      novaPrioridade: 'urgente',
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Prioridade inválida' })
    expect(mockedService.alterarPrioridade).not.toHaveBeenCalled()
  })

  it('PATCH /tickets/:id/atribuicao deve atribuir ticket', async () => {
    const response = await request(app).patch('/tickets/00000000-0000-4000-8000-000000000401/atribuicao').send({
      usuarioId: mockCapataz.id,
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTicket)
  })
})
