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
      id: mockMovimentacao.id,
      retiro_id: '00000000-0000-4000-8000-000000000001',
      capataz_id: 'user-003',
      tipo: 'nascimento',
      origem: 'Acurizal',
      quantidade: 1,
      estagio_vida: 'BEZERRO 0 A 7 MESES',
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(mockMovimentacao)
    expect(mockedService.criar).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockMovimentacao.id })
    )
    expect(mockedService.criar).toHaveBeenCalledTimes(1)
  })

  it('POST /movimentacoes deve rejeitar payload incompleto', async () => {
    const response = await request(app).post('/movimentacoes').send({
      retiro_id: '00000000-0000-4000-8000-000000000001',
      tipo: 'nascimento',
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Campos obrigatorios nao informados' })
    expect(mockedService.criar).not.toHaveBeenCalled()
  })

  it('POST /movimentacoes deve rejeitar violacao de regra de negocio', async () => {
    mockedService.criar.mockRejectedValueOnce(new Error('Quantidade deve ser maior que zero'))

    const response = await request(app).post('/movimentacoes').send({
      retiro_id: '00000000-0000-4000-8000-000000000001',
      capataz_id: 'user-003',
      tipo: 'nascimento',
      origem: 'Acurizal',
      quantidade: 0,
      estagio_vida: 'BEZERRO 0 A 7 MESES',
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Quantidade deve ser maior que zero' })
  })

  it('GET /movimentacoes deve listar todas as movimentacoes', async () => {
    const response = await request(app).get('/movimentacoes')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockMovimentacao])
    expect(mockedService.filtrar).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001')
  })

  it('GET /movimentacoes/filtrar deve aplicar filtros', async () => {
    const response = await request(app)
      .get('/movimentacoes/filtrar')
      .query({
        retiro: '00000000-0000-4000-8000-000000000001',
        tipo: 'nascimento',
        status: 'pendente',
        dataInicio: '2026-05-29',
        dataFim: '2026-05-29',
      })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockMovimentacao])
    expect(mockedService.filtrar).toHaveBeenCalledTimes(1)
  })

  it('GET /movimentacoes/filtrar deve rejeitar tipo invalido', async () => {
    const response = await request(app)
      .get('/movimentacoes/filtrar')
      .query({
        retiro: '00000000-0000-4000-8000-000000000001',
        tipo: 'invalido',
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Tipo de movimentação inválido' })
    expect(mockedService.filtrar).not.toHaveBeenCalled()
  })

  it('GET /movimentacoes/filtrar deve rejeitar Status inválido', async () => {
    const response = await request(app)
      .get('/movimentacoes/filtrar')
      .query({
        retiro: '00000000-0000-4000-8000-000000000001',
        status: 'invalido',
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Status de movimentação inválido' })
    expect(mockedService.filtrar).not.toHaveBeenCalled()
  })

  it('POST /movimentacoes/sincronizar deve receber uma movimentacao sincronizada', async () => {
    const response = await request(app).post('/movimentacoes/sincronizar').send({
      retiro_id: '00000000-0000-4000-8000-000000000001',
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
    const response = await request(app).get('/movimentacoes/pendentes').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockMovimentacao])
    expect(mockedService.listarPendentes).toHaveBeenCalledTimes(1)
  })

  it('GET /movimentacoes/dashboard deve retornar dados do dashboard', async () => {
    const response = await request(app).get('/movimentacoes/dashboard').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockMovimentacaoValidada])
    expect(mockedService.buscarParaDashboard).toHaveBeenCalledTimes(1)
  })

  it('GET /movimentacoes/contagem/tipo deve retornar a contagem por tipo', async () => {
    const response = await request(app).get('/movimentacoes/contagem/tipo').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

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
    const response = await request(app).get('/movimentacoes/00000000-0000-4000-8000-000000000201')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockMovimentacao)
    expect(mockedService.buscarPorId).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000201')
  })

  it('GET /movimentacoes/:id deve retornar 404 para movimentacao inexistente', async () => {
    mockedService.buscarPorId.mockResolvedValueOnce(null)

    const response = await request(app).get('/movimentacoes/00000000-0000-4000-8000-999999999999')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Movimentacao nao encontrada' })
  })

  it('PATCH /movimentacoes/:id deve atualizar uma movimentacao', async () => {
    const response = await request(app).patch('/movimentacoes/00000000-0000-4000-8000-000000000201').send({
      quantidade: 2,
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockMovimentacao)
    expect(mockedService.atualizar).toHaveBeenCalledTimes(1)
  })

  it('PATCH /movimentacoes/:id/sincronizar deve marcar como sincronizada', async () => {
    const response = await request(app).patch('/movimentacoes/00000000-0000-4000-8000-000000000201/sincronizar')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockMovimentacaoValidada)
    expect(mockedService.sincronizar).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000201')
  })

  it('DELETE /movimentacoes/:id deve remover uma movimentacao', async () => {
    const response = await request(app).delete('/movimentacoes/00000000-0000-4000-8000-000000000201')

    expect(response.status).toBe(204)
    expect(mockedService.remover).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000201')
  })
})
