import { SincronizacaoService } from '../../services/sincronizacao.service'
import { MovimentacaoRepository } from '../../repositories/movimentacao.repository'
import { TarefaRepository } from '../../repositories/tarefa.repository'
import { TicketRepository } from '../../repositories/ticket.repository'
import { mockMovimentacao, mockMovimentacaoValidada, mockTarefa, mockTicket } from '../helpers/fixtures'

jest.mock('../../repositories/movimentacao.repository', () => ({
  MovimentacaoRepository: {
    buscarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    atualizar: jest.fn(),
  },
}))

jest.mock('../../repositories/tarefa.repository', () => ({
  TarefaRepository: {
    buscarTodos: jest.fn(),
    atualizar: jest.fn(),
  },
}))

jest.mock('../../repositories/ticket.repository', () => ({
  TicketRepository: {
    buscarTodos: jest.fn(),
    atualizar: jest.fn(),
  },
}))

const mockedMovRepo = MovimentacaoRepository as jest.Mocked<typeof MovimentacaoRepository>
const mockedTarefaRepo = TarefaRepository as jest.Mocked<typeof TarefaRepository>
const mockedTicketRepo = TicketRepository as jest.Mocked<typeof TicketRepository>

describe('SincronizacaoService', () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    ;(global as any).fetch = fetchMock
    fetchMock.mockReset()

    mockedMovRepo.buscarTodos.mockResolvedValue([mockMovimentacao as any])
    mockedMovRepo.buscarPorId.mockResolvedValue(mockMovimentacao as any)
    mockedMovRepo.atualizar.mockResolvedValue(mockMovimentacaoValidada as any)
    mockedTarefaRepo.buscarTodos.mockResolvedValue([mockTarefa as any])
    mockedTarefaRepo.atualizar.mockResolvedValue({ ...mockTarefa, sincronizado: true } as any)
    mockedTicketRepo.buscarTodos.mockResolvedValue([mockTicket as any])
    mockedTicketRepo.atualizar.mockResolvedValue({ ...mockTicket, sincronizado: true } as any)
  })

  it('detectarConexao deve retornar true com status 200', async () => {
    fetchMock.mockResolvedValueOnce({ status: 200 })

    await expect(SincronizacaoService.detectarConexao()).resolves.toBe(true)
  })

  it('detectarConexao deve retornar false quando fetch falha', async () => {
    fetchMock.mockRejectedValueOnce(new Error('sem rede'))

    await expect(SincronizacaoService.detectarConexao()).resolves.toBe(false)
  })

  it('enviarMovimentacao deve lancar erro quando resposta nao for ok', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 })

    await expect(SincronizacaoService.enviarMovimentacao(mockMovimentacao as any)).rejects.toThrow(
      'Erro ao enviar movimentação: HTTP 500'
    )
  })

  it('enviarTarefa deve lancar erro quando resposta nao for ok', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 })

    await expect(SincronizacaoService.enviarTarefa(mockTarefa as any)).rejects.toThrow('Erro ao enviar tarefa: HTTP 500')
  })

  it('enviarTicket deve lancar erro quando resposta nao for ok', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 })

    await expect(SincronizacaoService.enviarTicket(mockTicket as any)).rejects.toThrow('Erro ao enviar ticket: HTTP 500')
  })

  it('buscarMovimentacoesParaRelatrio deve retornar apenas sincronizadas e validadas', async () => {
    mockedMovRepo.buscarTodos.mockResolvedValueOnce([
      mockMovimentacao as any,
      mockMovimentacaoValidada as any,
      { ...mockMovimentacaoValidada, id: 2, retiro_id: 2 } as any,
    ])

    const resultado = await SincronizacaoService.buscarMovimentacoesParaRelatrio(1)

    expect(resultado).toEqual([mockMovimentacaoValidada])
  })

  it('buscarTarefasParaRelatrio deve retornar apenas aprovadas e sincronizadas', async () => {
    mockedTarefaRepo.buscarTodos.mockResolvedValueOnce([
      mockTarefa as any,
      { ...mockTarefa, id: 12, status: 'aprovado', sincronizado: true } as any,
      { ...mockTarefa, id: 13, status: 'aprovado', sincronizado: true, retiro_id: 2 } as any,
    ])

    const resultado = await SincronizacaoService.buscarTarefasParaRelatrio(1)

    expect(resultado).toEqual([{ ...mockTarefa, id: 12, status: 'aprovado', sincronizado: true }])
  })

  it('buscarTicketsParaDashboard deve retornar apenas aprovados e sincronizados', async () => {
    mockedTicketRepo.buscarTodos.mockResolvedValueOnce([
      mockTicket as any,
      { ...mockTicket, id: 22, status: 'aprovado', sincronizado: true } as any,
      { ...mockTicket, id: 23, status: 'aprovado', sincronizado: true, retiro_id: 2 } as any,
    ])

    const resultado = await SincronizacaoService.buscarTicketsParaDashboard(1)

    expect(resultado).toEqual([{ ...mockTicket, id: 22, status: 'aprovado', sincronizado: true }])
  })

  it('sincronizar deve retornar erro quando nao houver conexao', async () => {
    fetchMock.mockResolvedValueOnce({ status: 500 })

    const resultado = await SincronizacaoService.sincronizar()

    expect(resultado).toEqual({
      sucesso: false,
      registrosSincronizados: 0,
      erros: ['Sem conexão com o servidor.'],
    })
  })

  it('sincronizar deve processar movimentacoes, tarefas e tickets pendentes', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200 })
    mockedMovRepo.buscarTodos.mockResolvedValueOnce([{ ...mockMovimentacao, sincronizado: false } as any])
    mockedTarefaRepo.buscarTodos.mockResolvedValueOnce([{ ...mockTarefa, sincronizado: false } as any])
    mockedTicketRepo.buscarTodos.mockResolvedValueOnce([{ ...mockTicket, sincronizado: false } as any])

    const resultado = await SincronizacaoService.sincronizar()

    expect(resultado.sucesso).toBe(true)
    expect(resultado.registrosSincronizados).toBe(3)
    expect(mockedMovRepo.atualizar).toHaveBeenCalled()
    expect(mockedTarefaRepo.atualizar).toHaveBeenCalled()
    expect(mockedTicketRepo.atualizar).toHaveBeenCalled()
  })

  it('obterStatusSincronizacao deve contar pendencias e verificar conexao', async () => {
    fetchMock.mockResolvedValueOnce({ status: 200 })
    mockedMovRepo.buscarTodos.mockResolvedValueOnce([{ ...mockMovimentacao, sincronizado: false } as any])
    mockedTarefaRepo.buscarTodos.mockResolvedValueOnce([{ ...mockTarefa, sincronizado: false } as any])
    mockedTicketRepo.buscarTodos.mockResolvedValueOnce([{ ...mockTicket, sincronizado: false } as any])

    const status = await SincronizacaoService.obterStatusSincronizacao()

    expect(status).toEqual({
      movimentacoesNaoSincronizadas: 1,
      tarefasNaoSincronizadas: 1,
      ticketsNaoSincronizados: 1,
      temConexao: true,
    })
  })

  it('obterMensagemSincronizacao deve retornar mensagem de tudo sincronizado', async () => {
    jest.spyOn(SincronizacaoService, 'obterStatusSincronizacao').mockResolvedValueOnce({
      movimentacoesNaoSincronizadas: 0,
      tarefasNaoSincronizadas: 0,
      ticketsNaoSincronizados: 0,
      temConexao: true,
    })

    await expect(SincronizacaoService.obterMensagemSincronizacao()).resolves.toContain('Tudo sincronizado')
  })

  it('obterMensagemSincronizacao deve retornar mensagem com pendencias', async () => {
    jest.spyOn(SincronizacaoService, 'obterStatusSincronizacao').mockResolvedValueOnce({
      movimentacoesNaoSincronizadas: 1,
      tarefasNaoSincronizadas: 0,
      ticketsNaoSincronizados: 0,
      temConexao: true,
    })

    await expect(SincronizacaoService.obterMensagemSincronizacao()).resolves.toContain('Sincronizando')
  })

  it('obterMensagemSincronizacao deve retornar mensagem sem internet', async () => {
    jest.spyOn(SincronizacaoService, 'obterStatusSincronizacao').mockResolvedValueOnce({
      movimentacoesNaoSincronizadas: 1,
      tarefasNaoSincronizadas: 1,
      ticketsNaoSincronizados: 1,
      temConexao: false,
    })

    await expect(SincronizacaoService.obterMensagemSincronizacao()).resolves.toContain('Sem internet')
  })
})
