import { RelatorioService } from '../../services/relatorio.service'
import { SincronizacaoService } from '../../services/sincronizacao.service'
import { mockMovimentacao, mockMovimentacaoValidada, mockTarefa } from '../helpers/fixtures'

jest.mock('../../services/sincronizacao.service', () => ({
  SincronizacaoService: {
    buscarMovimentacoesParaRelatrio: jest.fn(),
    buscarTarefasParaRelatrio: jest.fn(),
    buscarTicketsParaDashboard: jest.fn(),
  },
}))

const mockedSincronizacao = SincronizacaoService as jest.Mocked<typeof SincronizacaoService>

describe('RelatorioService', () => {
  beforeEach(() => {
    mockedSincronizacao.buscarMovimentacoesParaRelatrio.mockResolvedValue([mockMovimentacaoValidada as any])
    mockedSincronizacao.buscarTarefasParaRelatrio.mockResolvedValue([{ ...mockTarefa, status: 'aprovado' } as any])
  })

  it('buscarDadosMovimentacoes deve filtrar por periodo', async () => {
    mockedSincronizacao.buscarMovimentacoesParaRelatrio.mockResolvedValueOnce([
      { ...mockMovimentacaoValidada, data_criacao: new Date('2026-05-25T10:00:00.000Z') } as any,
      { ...mockMovimentacaoValidada, id: '00000000-0000-4000-8000-000000000202', data_criacao: new Date('2026-05-29T10:00:00.000Z') } as any,
    ])

    const resultado = await RelatorioService.buscarDadosMovimentacoes(
      new Date('2026-05-28T00:00:00.000Z'),
      new Date('2026-05-30T00:00:00.000Z'),
      1
    )

    expect(resultado).toHaveLength(1)
    expect(resultado[0].id).toBe('00000000-0000-4000-8000-000000000202')
  })

  it('buscarDadosTarefas deve filtrar por periodo', async () => {
    mockedSincronizacao.buscarTarefasParaRelatrio.mockResolvedValueOnce([
      { ...mockTarefa, data_criacao: new Date('2026-05-25T10:00:00.000Z') } as any,
      { ...mockTarefa, id: '00000000-0000-4000-8000-000000000302', data_criacao: new Date('2026-05-29T10:00:00.000Z') } as any,
    ])

    const resultado = await RelatorioService.buscarDadosTarefas(
      new Date('2026-05-28T00:00:00.000Z'),
      new Date('2026-05-30T00:00:00.000Z'),
      1
    )

    expect(resultado).toHaveLength(1)
    expect(resultado[0].id).toBe('00000000-0000-4000-8000-000000000302')
  })

  it('formatarRelatorioMovimentacoes deve mapear campos da planilha', async () => {
    mockedSincronizacao.buscarMovimentacoesParaRelatrio.mockResolvedValueOnce([
      {
        ...mockMovimentacaoValidada,
        data_criacao: new Date('2026-05-29T10:00:00.000Z'),
      } as any,
    ])

    const relatorio = await RelatorioService.formatarRelatorioMovimentacoes()

    expect(relatorio).toEqual([
      expect.objectContaining({
        Data: '29/05/2026',
        Tipo: 'nascimento',
        Retiro: '00000000-0000-4000-8000-000000000001',
        Origem: 'Acurizal',
        Destino: '-',
        Quantidade: 1,
        'Estágio de Vida': 'BEZERRO 0 A 7 MESES',
        'Causa do Óbito': '-',
      }),
    ])
  })

  it('gerarCsv deve criar arquivo com cabecalho e proteger formulas', () => {
    const csv = RelatorioService.gerarCsv([
      { Nome: '=SOMA(1;1)', Quantidade: 2 },
    ]).toString('utf8')

    expect(csv).toContain('"Nome";"Quantidade"')
    expect(csv).toContain('"\'=SOMA(1;1)";"2"')
  })

  it('gerarXlsx deve criar uma planilha valida', async () => {
    const arquivo = await RelatorioService.gerarXlsx([
      { Data: '12/06/2026', Quantidade: 2 },
    ], 'movimentacoes')

    expect(arquivo.subarray(0, 2).toString()).toBe('PK')
    expect(arquivo.length).toBeGreaterThan(1000)
  })

  it('gerarRelatorioSemanal deve usar janela de 7 dias', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-06-10T12:00:00.000Z'))

    const spy = jest.spyOn(RelatorioService, 'formatarRelatorioMovimentacoes').mockResolvedValue([])

    await RelatorioService.gerarRelatorioSemanal('00000000-0000-4000-8000-000000000001')

    expect(spy).toHaveBeenCalledTimes(1)
    const [dataInicio, dataFim, retiroId] = spy.mock.calls[0]
    expect(retiroId).toBe('00000000-0000-4000-8000-000000000001')
    expect(dataFim.getTime()).toBe(new Date('2026-06-10T12:00:00.000Z').getTime())
    expect(dataInicio.getTime()).toBe(new Date('2026-06-03T12:00:00.000Z').getTime())

    spy.mockRestore()
    jest.useRealTimers()
  })

  it('gerarRelatorioMensal deve usar janela de 30 dias', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-06-10T12:00:00.000Z'))

    const spy = jest.spyOn(RelatorioService, 'formatarRelatorioMovimentacoes').mockResolvedValue([])

    await RelatorioService.gerarRelatorioMensal('00000000-0000-4000-8000-000000000001')

    expect(spy).toHaveBeenCalledTimes(1)
    const [dataInicio, dataFim, retiroId] = spy.mock.calls[0]
    expect(retiroId).toBe('00000000-0000-4000-8000-000000000001')
    expect(dataFim.getTime()).toBe(new Date('2026-06-10T12:00:00.000Z').getTime())
    expect(dataInicio.getTime()).toBe(new Date('2026-05-11T12:00:00.000Z').getTime())

    spy.mockRestore()
    jest.useRealTimers()
  })
})
