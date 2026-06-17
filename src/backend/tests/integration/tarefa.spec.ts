import request from 'supertest'
import app from '../../app'
import { TarefaService } from '../../services/tarefa.service'
import { mockSupervisor, mockTarefa } from '../helpers/fixtures'

jest.mock('../../services/tarefa.service', () => ({
  TarefaService: {
    criar: jest.fn(),
    sincronizarRecebida: jest.fn(),
    listarTodas: jest.fn(),
    buscarPorId: jest.fn(),
    buscarParaDashboard: jest.fn(),
    listarPorStatus: jest.fn(),
    listarPorUsuario: jest.fn(),
    listarPorPrioridade: jest.fn(),
    listarPorCategoria: jest.fn(),
    atualizarStatus: jest.fn(),
    atualizar: jest.fn(),
    contarPorStatus: jest.fn(),
    remover: jest.fn(),
  },
}))

const mockedService = TarefaService as jest.Mocked<typeof TarefaService>

describe('Tarefas', () => {
  beforeEach(() => {
    mockedService.criar.mockResolvedValue(mockTarefa as any)
    mockedService.sincronizarRecebida.mockResolvedValue(mockTarefa as any)
    mockedService.listarTodas.mockResolvedValue([mockTarefa as any])
    mockedService.buscarPorId.mockResolvedValue(mockTarefa as any)
    mockedService.buscarParaDashboard.mockResolvedValue([mockTarefa as any])
    mockedService.listarPorStatus.mockResolvedValue([mockTarefa as any])
    mockedService.listarPorUsuario.mockResolvedValue([mockTarefa as any])
    mockedService.listarPorPrioridade.mockResolvedValue([mockTarefa as any])
    mockedService.listarPorCategoria.mockResolvedValue([mockTarefa as any])
    mockedService.atualizarStatus.mockResolvedValue(mockTarefa as any)
    mockedService.atualizar.mockResolvedValue(mockTarefa as any)
    mockedService.contarPorStatus.mockResolvedValue({ pendente: 1, concluido: 0, aprovado: 0 })
    mockedService.remover.mockResolvedValue(undefined)
  })

  it('POST /tarefas deve criar tarefa', async () => {
    const response = await request(app).post('/tarefas').send({
      id: mockTarefa.id,
      retiro_id: '00000000-0000-4000-8000-000000000001',
      atribuida_a: mockSupervisor.id,
      descricao: mockTarefa.descricao,
      categoria: mockTarefa.categoria,
      prioridade: mockTarefa.prioridade,
      usuarioCriador: mockSupervisor,
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(mockTarefa)
    expect(mockedService.criar).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockTarefa.id }),
      expect.objectContaining({
        id: mockSupervisor.id,
        cargo: mockSupervisor.cargo,
        retiro_id: mockSupervisor.retiro_id,
      })
    )
  })

  it('POST /tarefas deve rejeitar payload incompleto', async () => {
    const response = await request(app).post('/tarefas').send({
      retiro_id: '00000000-0000-4000-8000-000000000001',
      descricao: 'Tarefa incompleta',
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Campos obrigatorios nao informados' })
    expect(mockedService.criar).not.toHaveBeenCalled()
  })

  it('POST /tarefas deve rejeitar violacao de regra de negocio', async () => {
    mockedService.criar.mockRejectedValueOnce(new Error('Apenas supervisores podem criar tarefas'))

    const response = await request(app).post('/tarefas').send({
      retiro_id: '00000000-0000-4000-8000-000000000001',
      atribuida_a: mockSupervisor.id,
      descricao: mockTarefa.descricao,
      categoria: mockTarefa.categoria,
      prioridade: mockTarefa.prioridade,
      usuarioCriador: { ...mockSupervisor, cargo: 'gerente' },
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Apenas supervisores podem criar tarefas' })
  })

  it('POST /tarefas/sincronizar deve criar tarefa sincronizada', async () => {
    const response = await request(app).post('/tarefas/sincronizar').send({
      id: mockTarefa.id,
      retiro_id: '00000000-0000-4000-8000-000000000001',
      criada_por: mockSupervisor.id,
      atribuida_a: mockSupervisor.id,
      descricao: mockTarefa.descricao,
      categoria: mockTarefa.categoria,
      prioridade: mockTarefa.prioridade,
      status: 'pendente',
      sincronizado: false,
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(mockTarefa)
    expect(mockedService.sincronizarRecebida).toHaveBeenCalledTimes(1)
  })

  it('POST /tarefas/sincronizar deve rejeitar Status inválido', async () => {
    const response = await request(app).post('/tarefas/sincronizar').send({
      id: mockTarefa.id,
      retiro_id: '00000000-0000-4000-8000-000000000001',
      criada_por: mockSupervisor.id,
      atribuida_a: mockSupervisor.id,
      descricao: mockTarefa.descricao,
      categoria: mockTarefa.categoria,
      prioridade: mockTarefa.prioridade,
      status: 'invalido',
      sincronizado: false,
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Status inválido' })
    expect(mockedService.sincronizarRecebida).not.toHaveBeenCalled()
  })

  it('GET /tarefas deve listar todas as tarefas', async () => {
    const response = await request(app).get('/tarefas')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTarefa])
  })

  it('GET /tarefas/dashboard deve retornar dados de dashboard', async () => {
    const response = await request(app).get('/tarefas/dashboard').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTarefa])
  })

  it('GET /tarefas/status/:status deve filtrar por status', async () => {
    const response = await request(app).get('/tarefas/status/pendente').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTarefa])
  })

  it('GET /tarefas/status/:status deve rejeitar Status inválido', async () => {
    const response = await request(app).get('/tarefas/status/invalido').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Status inválido' })
    expect(mockedService.listarPorStatus).not.toHaveBeenCalled()
  })

  it('GET /tarefas/usuario/:usuarioId deve filtrar por usuario', async () => {
    const response = await request(app).get(`/tarefas/usuario/${mockSupervisor.id}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTarefa])
  })

  it('GET /tarefas/prioridade/:prioridade deve filtrar por prioridade', async () => {
    const response = await request(app).get('/tarefas/prioridade/alta').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTarefa])
  })

  it('GET /tarefas/prioridade/:prioridade deve rejeitar Prioridade inválida', async () => {
    const response = await request(app).get('/tarefas/prioridade/urgente').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Prioridade inválida' })
    expect(mockedService.listarPorPrioridade).not.toHaveBeenCalled()
  })

  it('GET /tarefas/categoria/:categoria deve filtrar por categoria', async () => {
    const response = await request(app).get('/tarefas/categoria/manutencao').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTarefa])
  })

  it('GET /tarefas/contagem/status deve retornar contagem por status', async () => {
    const response = await request(app).get('/tarefas/contagem/status').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ pendente: 1, concluido: 0, aprovado: 0 })
  })

  it('GET /tarefas/:id deve buscar uma tarefa', async () => {
    const response = await request(app).get('/tarefas/00000000-0000-4000-8000-000000000301')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTarefa)
  })

  it('GET /tarefas/:id deve retornar 404 para tarefa inexistente', async () => {
    mockedService.buscarPorId.mockResolvedValueOnce(null)

    const response = await request(app).get('/tarefas/00000000-0000-4000-8000-999999999999')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Tarefa nao encontrada' })
  })

  it('PATCH /tarefas/:id deve atualizar tarefa', async () => {
    const response = await request(app).patch('/tarefas/00000000-0000-4000-8000-000000000301').send({
      descricao: 'Descricao atualizada',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTarefa)
  })

  it('PATCH /tarefas/:id/status deve atualizar status', async () => {
    const response = await request(app).patch('/tarefas/00000000-0000-4000-8000-000000000301/status').send({
      status: 'aprovado',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTarefa)
  })

  it('PATCH /tarefas/:id/status deve rejeitar Status inválido', async () => {
    const response = await request(app).patch('/tarefas/00000000-0000-4000-8000-000000000301/status').send({
      status: 'invalido',
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Status inválido' })
    expect(mockedService.atualizarStatus).not.toHaveBeenCalled()
  })

  it('DELETE /tarefas/:id deve remover tarefa', async () => {
    const response = await request(app).delete('/tarefas/00000000-0000-4000-8000-000000000301')

    expect(response.status).toBe(204)
    expect(mockedService.remover).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000301')
  })
})
