import request from 'supertest'
import app from '../../app'
import { TarefaService } from '../../services/tarefa.service'
import { mockSupervisor, mockTarefa } from '../helpers/fixtures'

jest.mock('../../services/tarefa.service', () => ({
  TarefaService: {
    criar: jest.fn(),
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
    mockedService.listarTodas.mockResolvedValue([mockTarefa as any])
    mockedService.buscarPorId.mockResolvedValue(mockTarefa as any)
    mockedService.buscarParaDashboard.mockResolvedValue([mockTarefa as any])
    mockedService.listarPorStatus.mockResolvedValue([mockTarefa as any])
    mockedService.listarPorUsuario.mockResolvedValue([mockTarefa as any])
    mockedService.listarPorPrioridade.mockResolvedValue([mockTarefa as any])
    mockedService.listarPorCategoria.mockResolvedValue([mockTarefa as any])
    mockedService.atualizarStatus.mockResolvedValue(mockTarefa as any)
    mockedService.atualizar.mockResolvedValue(mockTarefa as any)
    mockedService.contarPorStatus.mockResolvedValue({ pendente: 1, aprovado: 0 })
    mockedService.remover.mockResolvedValue(undefined)
  })

  it('POST /tarefas deve criar tarefa', async () => {
    const response = await request(app).post('/tarefas').send({
      retiro_id: 1,
      atribuida_a: mockSupervisor.id,
      descricao: mockTarefa.descricao,
      categoria: mockTarefa.categoria,
      prioridade: mockTarefa.prioridade,
      usuarioCriador: mockSupervisor,
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(mockTarefa)
  })

  it('GET /tarefas deve listar todas as tarefas', async () => {
    const response = await request(app).get('/tarefas')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTarefa])
  })

  it('GET /tarefas/dashboard deve retornar dados de dashboard', async () => {
    const response = await request(app).get('/tarefas/dashboard').query({ retiroId: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTarefa])
  })

  it('GET /tarefas/status/:status deve filtrar por status', async () => {
    const response = await request(app).get('/tarefas/status/pendente').query({ retiroId: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTarefa])
  })

  it('GET /tarefas/usuario/:usuarioId deve filtrar por usuario', async () => {
    const response = await request(app).get(`/tarefas/usuario/${mockSupervisor.id}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTarefa])
  })

  it('GET /tarefas/prioridade/:prioridade deve filtrar por prioridade', async () => {
    const response = await request(app).get('/tarefas/prioridade/alta').query({ retiroId: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTarefa])
  })

  it('GET /tarefas/categoria/:categoria deve filtrar por categoria', async () => {
    const response = await request(app).get('/tarefas/categoria/manutencao').query({ retiroId: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockTarefa])
  })

  it('GET /tarefas/contagem/status deve retornar contagem por status', async () => {
    const response = await request(app).get('/tarefas/contagem/status').query({ retiroId: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ pendente: 1, aprovado: 0 })
  })

  it('GET /tarefas/:id deve buscar uma tarefa', async () => {
    const response = await request(app).get('/tarefas/11')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTarefa)
  })

  it('PATCH /tarefas/:id deve atualizar tarefa', async () => {
    const response = await request(app).patch('/tarefas/11').send({
      descricao: 'Descricao atualizada',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTarefa)
  })

  it('PATCH /tarefas/:id/status deve atualizar status', async () => {
    const response = await request(app).patch('/tarefas/11/status').send({
      status: 'aprovado',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTarefa)
  })

  it('DELETE /tarefas/:id deve remover tarefa', async () => {
    const response = await request(app).delete('/tarefas/11')

    expect(response.status).toBe(204)
    expect(mockedService.remover).toHaveBeenCalledWith(11)
  })
})
