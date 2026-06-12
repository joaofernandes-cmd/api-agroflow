import request from 'supertest'
import app from '../../app'
import { RelatorioService } from '../../services/relatorio.service'
import { mockRelatorioLinha } from '../helpers/fixtures'

jest.mock('../../services/relatorio.service', () => ({
  RelatorioService: {
    buscarDadosMovimentacoes: jest.fn(),
    buscarDadosTarefas: jest.fn(),
    formatarRelatorioMovimentacoes: jest.fn(),
    gerarRelatorioSemanal: jest.fn(),
    gerarRelatorioMensal: jest.fn(),
  },
}))

const mockedService = RelatorioService as jest.Mocked<typeof RelatorioService>

describe('Relatorios', () => {
  beforeEach(() => {
    mockedService.buscarDadosMovimentacoes.mockResolvedValue([mockRelatorioLinha as any])
    mockedService.buscarDadosTarefas.mockResolvedValue([{ id: '00000000-0000-4000-8000-000000000301', descricao: 'Tarefa', status: 'aprovado' } as any])
    mockedService.formatarRelatorioMovimentacoes.mockResolvedValue([mockRelatorioLinha as any])
    mockedService.gerarRelatorioSemanal.mockResolvedValue([mockRelatorioLinha as any])
    mockedService.gerarRelatorioMensal.mockResolvedValue([mockRelatorioLinha as any])
  })

  it('GET /relatorios/movimentacoes/dados deve buscar dados brutos de movimentacoes', async () => {
    const response = await request(app).get('/relatorios/movimentacoes/dados').query({
      retiroId: '00000000-0000-4000-8000-000000000001',
      dataInicio: '2026-05-01',
      dataFim: '2026-05-29',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockRelatorioLinha])
  })

  it('GET /relatorios/tarefas/dados deve buscar dados brutos de tarefas', async () => {
    const response = await request(app).get('/relatorios/tarefas/dados').query({
      retiroId: '00000000-0000-4000-8000-000000000001',
      dataInicio: '2026-05-01',
      dataFim: '2026-05-29',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([{ id: '00000000-0000-4000-8000-000000000301', descricao: 'Tarefa', status: 'aprovado' }])
  })

  it('GET /relatorios/movimentacoes deve formatar o relatorio', async () => {
    const response = await request(app).get('/relatorios/movimentacoes').query({
      retiroId: '00000000-0000-4000-8000-000000000001',
      dataInicio: '2026-05-01',
      dataFim: '2026-05-29',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockRelatorioLinha])
  })

  it('GET /relatorios/semanal deve gerar relatorio semanal', async () => {
    const response = await request(app).get('/relatorios/semanal').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockRelatorioLinha])
  })

  it('GET /relatorios/mensal deve gerar relatorio mensal', async () => {
    const response = await request(app).get('/relatorios/mensal').query({ retiroId: '00000000-0000-4000-8000-000000000001' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockRelatorioLinha])
  })
})
