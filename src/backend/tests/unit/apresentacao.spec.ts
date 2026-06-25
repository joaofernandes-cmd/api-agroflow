import {
  limparPrefixoCargo,
  montarRelatorio,
  movimentacaoParaExibicao,
  nomeUsuarioPorId,
  tarefaParaExibicao,
  ticketParaExibicao,
} from '../../utils/apresentacao'
import {
  CAPATAZ_ID,
  mockMovimentacaoValidada,
  mockTarefa,
  mockTicket,
  RETIRO_ID,
  SUPERVISOR_ID,
} from '../helpers/fixtures'

describe('Utils de apresentacao', () => {
  const ctx = {
    mapaRetiro: new Map([[RETIRO_ID, 'Aroeira']]),
    mapaUsuario: new Map([
      [CAPATAZ_ID, 'Daniel'],
      [SUPERVISOR_ID, 'Luiz'],
    ]),
    nomeUsuario: 'Luiz',
    primeiroNomeUsuario: 'Luiz',
  }

  it('limparPrefixoCargo deve remover cargo duplicado do nome exibido', () => {
    expect(limparPrefixoCargo('Capataz Daniel')).toBe('Daniel')
    expect(limparPrefixoCargo('Supervisor Luiz')).toBe('Luiz')
    expect(limparPrefixoCargo('Gerente Marcos')).toBe('Marcos')
    expect(limparPrefixoCargo('Lucas')).toBe('Lucas')
  })

  it('nomeUsuarioPorId deve retornar nome limpo a partir do contexto', () => {
    expect(nomeUsuarioPorId(ctx, CAPATAZ_ID)).toBe('Daniel')
    expect(nomeUsuarioPorId(ctx, null)).toBe('')
  })

  it('ticketParaExibicao deve formatar dados usados nas telas', () => {
    const ticket = ticketParaExibicao(mockTicket as any, ctx)

    expect(ticket.nome).toBe('Cerca')
    expect(ticket.retiro).toBe('Aroeira')
    expect(ticket.capataz).toBe('Daniel')
    expect(ticket.severidade).toBe('Média')
    expect(ticket.descricao).toBe(mockTicket.descricao)
  })

  it('tarefaParaExibicao deve mapear status e nomes de usuario', () => {
    const tarefa = tarefaParaExibicao({ ...mockTarefa, status: 'aprovado' } as any, ctx)

    expect(tarefa.titulo).toBe(mockTarefa.categoria)
    expect(tarefa.retiro).toBe('Aroeira')
    expect(tarefa.capataz).toBe('Daniel')
    expect(tarefa.supervisor).toBe('Luiz')
    expect(tarefa.statusRotulo).toBe('Validada')
    expect(tarefa.autor).toBe('Criada por Luiz')
  })

  it('movimentacaoParaExibicao deve formatar labels e detalhes', () => {
    const movimentacao = movimentacaoParaExibicao(mockMovimentacaoValidada as any, ctx)

    expect(movimentacao.tipo).toBe('Nascimento')
    expect(movimentacao.retiro).toBe('Aroeira')
    expect(movimentacao.capataz).toBe('Daniel')
    expect(movimentacao.supervisor).toBe('Luiz')
    expect(movimentacao.estagio).toBe('Bezerro 0 a 7 meses')
    expect(movimentacao.quantidadeRotulo).toBe('1 animal')
  })

  it('montarRelatorio deve consolidar datasets de tickets tarefas e movimentacoes', () => {
    const relatorio = montarRelatorio(
      ctx,
      [{ ...mockTicket, status: 'aprovado', sincronizado: true } as any],
      [{ ...mockTarefa, status: 'aprovado', sincronizado: true } as any],
      [mockMovimentacaoValidada as any]
    )

    expect(relatorio.tickets.resumo.total).toBe(1)
    expect(relatorio.tarefas.resumo.validados).toBe(1)
    expect(relatorio.movimentacoes.linhas[0].celulas).toEqual(
      expect.arrayContaining(['Aroeira', 'Nascimento'])
    )
  })
})
