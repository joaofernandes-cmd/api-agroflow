import { RelatorioService } from '../../services/relatorio.service'
import { SincronizacaoService } from '../../services/sincronizacao.service'
import { mockMovimentacaoValidada, mockTarefa, mockTicket } from '../helpers/fixtures'

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
    mockedSincronizacao.buscarTicketsParaDashboard.mockResolvedValue([{ ...mockTicket, status: 'aprovado' } as any])
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

  it('buscarDadosMovimentacoes deve aceitar somente data inicial', async () => {
    mockedSincronizacao.buscarMovimentacoesParaRelatrio.mockResolvedValueOnce([
      { ...mockMovimentacaoValidada, data_criacao: new Date('2026-05-25T10:00:00.000Z') } as any,
      { ...mockMovimentacaoValidada, id: '00000000-0000-4000-8000-000000000202', data_criacao: new Date('2026-05-29T10:00:00.000Z') } as any,
    ])

    const resultado = await RelatorioService.buscarDadosMovimentacoes(
      new Date('2026-05-28T00:00:00.000Z')
    )

    expect(resultado).toHaveLength(1)
  })

  it('buscarDadosTarefas deve aceitar somente data final', async () => {
    mockedSincronizacao.buscarTarefasParaRelatrio.mockResolvedValueOnce([
      { ...mockTarefa, data_criacao: new Date('2026-05-25T10:00:00.000Z') } as any,
      { ...mockTarefa, id: '00000000-0000-4000-8000-000000000302', data_criacao: new Date('2026-05-29T10:00:00.000Z') } as any,
    ])

    const resultado = await RelatorioService.buscarDadosTarefas(
      undefined,
      new Date('2026-05-28T00:00:00.000Z')
    )

    expect(resultado).toHaveLength(1)
  })

  it('formatarRelatorioTarefas deve mapear campos da planilha', async () => {
    const relatorio = await RelatorioService.formatarRelatorioTarefas()

    expect(relatorio).toEqual([
      expect.objectContaining({
        Retiro: mockTarefa.retiro_id,
        Descricao: mockTarefa.descricao,
        Categoria: mockTarefa.categoria,
        Prioridade: mockTarefa.prioridade,
      }),
    ])
  })

  it('buscarDadosTickets deve filtrar por periodo', async () => {
    mockedSincronizacao.buscarTicketsParaDashboard.mockResolvedValueOnce([
      { ...mockTicket, data_criacao: new Date('2026-05-25T10:00:00.000Z') } as any,
      { ...mockTicket, id: '00000000-0000-4000-8000-000000000402', data_criacao: new Date('2026-05-29T10:00:00.000Z') } as any,
    ])

    const resultado = await RelatorioService.buscarDadosTickets(
      new Date('2026-05-28T00:00:00.000Z'),
      new Date('2026-05-30T00:00:00.000Z')
    )

    expect(resultado).toHaveLength(1)
  })

  it('formatarRelatorioTickets deve usar fallback para ticket sem atribuicao', async () => {
    mockedSincronizacao.buscarTicketsParaDashboard.mockResolvedValueOnce([
      { ...mockTicket, atribuido_a: null } as any,
    ])

    const relatorio = await RelatorioService.formatarRelatorioTickets()

    expect(relatorio[0]['Atribuido a']).toBe('-')
  })

  it.each([
    ['movimentacoes', 'formatarRelatorioMovimentacoes'],
    ['tarefas', 'formatarRelatorioTarefas'],
    ['tickets', 'formatarRelatorioTickets'],
  ] as const)('obterLinhasExportacao deve selecionar %s', async (tipo, metodo) => {
    const spy = jest.spyOn(RelatorioService, metodo).mockResolvedValue([])

    await RelatorioService.obterLinhasExportacao(tipo)

    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('gerarCsv deve retornar apenas BOM quando nao houver linhas', () => {
    expect(RelatorioService.gerarCsv([]).toString('utf8')).toBe('\uFEFF')
  })

  it('gerarCsv deve criar arquivo com cabecalho e proteger formulas', () => {
    const csv = RelatorioService.gerarCsv([
      { Nome: '=SOMA(1;1)', Observacao: 'valor "citado"', Quantidade: 2 },
    ]).toString('utf8')

    expect(csv).toContain('"Nome";"Observacao";"Quantidade"')
    expect(csv).toContain('"\'=SOMA(1;1)"')
    expect(csv).toContain('"valor ""citado"""')
  })

  it.each(['+SOMA(1;1)', '@formula', '-formula'])(
    'gerarCsv deve proteger valor iniciado por %s',
    valor => {
      expect(RelatorioService.gerarCsv([{ Valor: valor }]).toString('utf8')).toContain(`"'${valor}"`)
    }
  )

  it('gerarXlsx deve criar uma planilha valida', async () => {
    const arquivo = await RelatorioService.gerarXlsx([
      { Data: '12/06/2026', Quantidade: 2 },
    ], 'movimentacoes')

    expect(arquivo.subarray(0, 2).toString()).toBe('PK')
    expect(arquivo.length).toBeGreaterThan(1000)
  })

  it('gerarXlsx deve criar planilha vazia valida', async () => {
    const arquivo = await RelatorioService.gerarXlsx([], 'relatorio-com-nome-maior-que-trinta-e-um-caracteres')

    expect(arquivo.subarray(0, 2).toString()).toBe('PK')
  })

  it('gerarArquivo deve selecionar CSV', async () => {
    const linhasSpy = jest.spyOn(RelatorioService, 'obterLinhasExportacao').mockResolvedValue([])
    const csvSpy = jest.spyOn(RelatorioService, 'gerarCsv')

    await RelatorioService.gerarArquivo('tarefas', 'csv')

    expect(linhasSpy).toHaveBeenCalledWith('tarefas', undefined, undefined, undefined)
    expect(csvSpy).toHaveBeenCalledWith([])
    linhasSpy.mockRestore()
    csvSpy.mockRestore()
  })

  it('gerarArquivo deve exportar somente registros dentro do periodo filtrado', async () => {
    mockedSincronizacao.buscarMovimentacoesParaRelatrio.mockResolvedValueOnce([
      {
        ...mockMovimentacaoValidada,
        id: '00000000-0000-4000-8000-000000000211',
        origem: 'Aroeira',
        data_criacao: new Date('2026-06-22T21:00:00.000Z'),
      } as any,
      {
        ...mockMovimentacaoValidada,
        id: '00000000-0000-4000-8000-000000000212',
        origem: 'Puga',
        data_criacao: new Date('2026-06-23T02:52:00.000Z'),
      } as any,
      {
        ...mockMovimentacaoValidada,
        id: '00000000-0000-4000-8000-000000000213',
        origem: 'CMB',
        data_criacao: new Date('2026-06-24T00:00:00.000Z'),
      } as any,
    ])

    const csv = await RelatorioService.gerarArquivo(
      'movimentacoes',
      'csv',
      new Date('2026-06-22T00:00:00.000Z'),
      new Date('2026-06-23T23:59:59.999Z')
    )

    const conteudo = csv.toString('utf8')
    expect(conteudo).toContain('Aroeira')
    expect(conteudo).toContain('Puga')
    expect(conteudo).not.toContain('CMB')
  })

  it('gerarArquivo deve selecionar XLSX', async () => {
    const linhasSpy = jest.spyOn(RelatorioService, 'obterLinhasExportacao').mockResolvedValue([])
    const xlsxSpy = jest.spyOn(RelatorioService, 'gerarXlsx').mockResolvedValue(Buffer.from('xlsx'))

    await RelatorioService.gerarArquivo('tickets', 'xlsx')

    expect(xlsxSpy).toHaveBeenCalledWith([], 'tickets')
    linhasSpy.mockRestore()
    xlsxSpy.mockRestore()
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
