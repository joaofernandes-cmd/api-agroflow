import request from 'supertest'
import app from '../../app'
import { MovimentacaoService } from '../../services/movimentacao.service'
import { mockMovimentacao, mockMovimentacaoValidada } from '../helpers/fixtures'

jest.mock('../../services/movimentacao.service', () => ({
  MovimentacaoService: {
    criar: jest.fn(),
    sincronizarRecebida: jest.fn(),
    listarTodas: jest.fn(),
    buscarPorId: jest.fn(),
    filtrar: jest.fn(),
    buscarParaRelatorio: jest.fn(),
    buscarParaDashboard: jest.fn(),
    sincronizar: jest.fn(),
    listarPendentes: jest.fn(),
    contarPorTipo: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
  },
}))

const mockedService = MovimentacaoService as jest.Mocked<typeof MovimentacaoService>

describe('Movimentacoes', () => {
  beforeEach(() => {
    mockedService.criar.mockResolvedValue(mockMovimentacao as any)
    mockedService.sincronizarRecebida.mockResolvedValue(mockMovimentacaoValidada as any)
    mockedService.listarTodas.mockResolvedValue([mockMovimentacao as any])
    mockedService.buscarPorId.mockResolvedValue(mockMovimentacao as any)
    mockedService.filtrar.mockResolvedValue([mockMovimentacao as any])
    mockedService.buscarParaRelatorio.mockResolvedValue([mockMovimentacaoValidada as any])
    mockedService.buscarParaDashboard.mockResolvedValue([mockMovimentacaoValidada as any])
    mockedService.sincronizar.mockResolvedValue(mockMovimentacaoValidada as any)
    mockedService.listarPendentes.mockResolvedValue([mockMovimentacao as any])
    mockedService.contarPorTipo.mockResolvedValue({
      nascimento: 1,
      morte: 0,
      transferencia: 0,
      compra: 0,
      venda: 0,
      outros: 0,
    })
    mockedService.atualizar.mockResolvedValue(mockMovimentacao as any)
    mockedService.remover.mockResolvedValue(undefined)
  })

  it('POST /movimentacoes deve criar uma movimentacao', async () => {
    const response = await request(app).post('/movimentacoes').send({
      retiro_id: 1,
      capataz_id: 'user-003',
      tipo: 'nascimento',
      origem: 'Acurizal',
      quantidade: 1,
      estagio_vida: 'BEZERRO 0 A 7 MESES',
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(mockMovimentacao)
    expect(mockedService.criar).toHaveBeenCalledTimes(1)
  })

  it('GET /movimentacoes deve listar todas as movimentacoes', async () => {
    const response = await request(app).get('/movimentacoes')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockMovimentacao])
    expect(mockedService.listarTodas).toHaveBeenCalledTimes(1)
  })

  it('GET /movimentacoes/filtrar deve aplicar filtros', async () => {
    const response = await request(app)
      .get('/movimentacoes/filtrar')
      .query({
        retiro: 1,
        tipo: 'nascimento',
        status: 'pendente',
        dataInicio: '2026-05-29',
        dataFim: '2026-05-29',
      })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockMovimentacao])
    expect(mockedService.filtrar).toHaveBeenCalledTimes(1)
  })

  it('POST /movimentacoes/sincronizar deve receber uma movimentacao sincronizada', async () => {
    const response = await request(app).post('/movimentacoes/sincronizar').send({
      retiro_id: 1,
      capataz_id: 'user-003',
      tipo: 'nascimento',
      origem: 'Acurizal',
      quantidade: 1,
      estagio_vida: 'BEZERRO 0 A 7 MESES',
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(mockMovimentacaoValidada)
    expect(mockedService.sincronizarRecebida).toHaveBeenCalledTimes(1)
  })

  it('GET /movimentacoes/pendentes deve listar pendentes', async () => {
    const response = await request(app).get('/movimentacoes/pendentes').query({ retiroId: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockMovimentacao])
    expect(mockedService.listarPendentes).toHaveBeenCalledTimes(1)
  })

  it('GET /movimentacoes/dashboard deve retornar dados do dashboard', async () => {
    const response = await request(app).get('/movimentacoes/dashboard').query({ retiroId: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockMovimentacaoValidada])
    expect(mockedService.buscarParaDashboard).toHaveBeenCalledTimes(1)
  })

  it('GET /movimentacoes/contagem/tipo deve retornar a contagem por tipo', async () => {
    const response = await request(app).get('/movimentacoes/contagem/tipo').query({ retiroId: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      nascimento: 1,
      morte: 0,
      transferencia: 0,
      compra: 0,
      venda: 0,
      outros: 0,
    })
    expect(mockedService.contarPorTipo).toHaveBeenCalledTimes(1)
  })

  it('GET /movimentacoes/:id deve buscar uma movimentacao', async () => {
    const response = await request(app).get('/movimentacoes/1')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockMovimentacao)
    expect(mockedService.buscarPorId).toHaveBeenCalledWith(1)
  })

  it('PATCH /movimentacoes/:id deve atualizar uma movimentacao', async () => {
    const response = await request(app).patch('/movimentacoes/1').send({
      quantidade: 2,
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockMovimentacao)
    expect(mockedService.atualizar).toHaveBeenCalledTimes(1)
  })

  it('PATCH /movimentacoes/:id/sincronizar deve marcar como sincronizada', async () => {
    const response = await request(app).patch('/movimentacoes/1/sincronizar')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockMovimentacaoValidada)
    expect(mockedService.sincronizar).toHaveBeenCalledWith(1)
  })

  it('DELETE /movimentacoes/:id deve remover uma movimentacao', async () => {
    const response = await request(app).delete('/movimentacoes/1')

    expect(response.status).toBe(204)
    expect(mockedService.remover).toHaveBeenCalledWith(1)
  })
})
