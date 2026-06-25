import { MovimentacaoRepository } from '../repositories/movimentacao.repository'
import { TarefaRepository } from '../repositories/tarefa.repository'
import { TicketRepository } from '../repositories/ticket.repository'
import { Movimentacao } from '../models/movimentacao.model'
import { Tarefa } from '../models/tarefa.model'
import { Ticket } from '../models/ticket.model'
import { UUID } from '../models/uuid'

function obterBaseApi(): string {
  const base = process.env.API_BASE_URL?.trim()
  if (base) {
    return base.replace(/\/+$/, '')
  }

  const porta = process.env.PORT ?? '3000'
  return `http://127.0.0.1:${porta}`
}

function montarUrlApi(caminho: string): string {
  return `${obterBaseApi()}${caminho.startsWith('/') ? caminho : `/${caminho}`}`
}

const MENSAGEM_ERRO_SINCRONIZACAO = 'Não foi possível sincronizar os dados. Tente novamente.'

function registrarFalhaSincronizacao(contexto: string, error: unknown) {
  console.warn(`Falha na sincronização: ${contexto}`, {
    erro: error instanceof Error ? error.message : error,
  })
}

function erroSincronizacao(categoria: string, response: Response): Error {
  console.warn(`Falha ao sincronizar ${categoria}`, {
    status: response.status,
    statusText: response.statusText,
  })

  return new Error(MENSAGEM_ERRO_SINCRONIZACAO)
}

// RN03: Sincronização offline com detecção automática de conexão
// RN07: Apenas dados com sincronizado=true entram em relatórios
export const SincronizacaoService = {
  // RN03: Detectar se há conexão disponível
  // Retorna true se HTTP 200 foi recebido do servidor
  async detectarConexao(): Promise<boolean> {
    try {
      const response = await fetch(montarUrlApi('/health'), {
        method: 'HEAD',
        cache: 'no-cache',
      })
      // RN03: Sincronização disparada com HTTP 200 válido
      return response.status === 200
    } catch (error) {
      return false
    }
  },

  // RN03: Sincronizar dados pendentes (sincronizado = false) com o servidor
  // Fluxo: offline (sincronizado=false) → detecta internet → envia → servidor marca sincronizado=true
  // A validação (status=validado) acontece depois pelo Supervisor
  async sincronizar(): Promise<{ sucesso: boolean; registrosSincronizados: number; erros: string[] }> {
    const erros: string[] = []
    let registrosSincronizados = 0

    try {
      const temConexao = await SincronizacaoService.detectarConexao()
      if (!temConexao) {
        erros.push('Sem conexão com o servidor.')
        return { sucesso: false, registrosSincronizados: 0, erros }
      }

      // RN03: Busca movimentações ainda não sincronizadas (sincronizado=false)
      // Essas são as que foram salvas offline e aguardam envio
      const todasMovimentacoes = await MovimentacaoRepository.buscarTodos()
      const movimentacoesPendentes = todasMovimentacoes.filter(m => !m.sincronizado)

      for (const mov of movimentacoesPendentes) {
        try {
          // Envia para o servidor (que valida integridade e armazena)
          await SincronizacaoService.enviarMovimentacao(mov)
          // Após receber confirmação do servidor, marca como sincronizado
          await MovimentacaoRepository.atualizar(mov.id, {
            ...mov,
            sincronizado: true,
          } as any)
          registrosSincronizados++
        } catch (error) {
          registrarFalhaSincronizacao(`movimentação ${mov.id}`, error)
          erros.push(MENSAGEM_ERRO_SINCRONIZACAO)
        }
      }

      // RN03: Busca tarefas ainda não sincronizadas
      const todasTarefas = await TarefaRepository.buscarTodos()
      const tarefasPendentes = todasTarefas.filter(t => !t.sincronizado)

      for (const tarefa of tarefasPendentes) {
        try {
          // Envia para o servidor
          await SincronizacaoService.enviarTarefa(tarefa)
          // Marca como sincronizado após confirmação
          await TarefaRepository.atualizar(tarefa.id, {
            ...tarefa,
            sincronizado: true,
          } as any)
          registrosSincronizados++
        } catch (error) {
          registrarFalhaSincronizacao(`tarefa ${tarefa.id}`, error)
          erros.push(MENSAGEM_ERRO_SINCRONIZACAO)
        }
      }

      // RN03: Busca tickets ainda não sincronizados
      const todosTickets = await TicketRepository.buscarTodos()
      const ticketsPendentes = todosTickets.filter(t => !t.sincronizado)

      for (const ticket of ticketsPendentes) {
        try {
          // Envia para o servidor
          await SincronizacaoService.enviarTicket(ticket)
          // Marca como sincronizado após confirmação
          await TicketRepository.atualizar(ticket.id, {
            ...ticket,
            sincronizado: true,
          } as any)
          registrosSincronizados++
        } catch (error) {
          registrarFalhaSincronizacao(`ticket ${ticket.id}`, error)
          erros.push(MENSAGEM_ERRO_SINCRONIZACAO)
        }
      }

      const sucesso = registrosSincronizados > 0 || erros.length === 0
      return { sucesso, registrosSincronizados, erros }
    } catch (error) {
      registrarFalhaSincronizacao('fluxo geral', error)
      erros.push(MENSAGEM_ERRO_SINCRONIZACAO)
      return { sucesso: false, registrosSincronizados, erros }
    }
  },

  // RN07: Buscar movimentações sincronizadas para relatórios
  // Retorna apenas registros com sincronizado=true e status=validado
  async buscarMovimentacoesParaRelatrio(retiroId?: UUID): Promise<Movimentacao[]> {
    const movimentacoes = await MovimentacaoRepository.buscarTodos()

    return movimentacoes.filter(m => {
      const sincronizado = m.sincronizado === true
      const validado = m.status === 'validado'

      if (retiroId && m.retiro_id !== retiroId) {
        return false
      }

      return sincronizado && validado
    })
  },

  // RN07: Buscar tarefas sincronizadas para relatórios
  // Retorna apenas registros com sincronizado=true e status=aprovado
  async buscarTarefasParaRelatrio(retiroId?: UUID): Promise<Tarefa[]> {
    const tarefas = await TarefaRepository.buscarTodos()

    return tarefas.filter(t => {
      const sincronizado = t.sincronizado === true
      const aprovado = t.status === 'aprovado'

      if (retiroId && t.retiro_id !== retiroId) {
        return false
      }

      return sincronizado && aprovado
    })
  },

  // RN10: Buscar tickets sincronizados para dashboard
  // Retorna apenas tickets com sincronizado=true e status=aprovado
  async buscarTicketsParaDashboard(retiroId?: UUID): Promise<Ticket[]> {
    const tickets = await TicketRepository.buscarTodos()

    return tickets.filter(t => {
      const sincronizado = t.sincronizado === true
      const aprovado = t.status === 'aprovado'

      if (retiroId && t.retiro_id !== retiroId) {
        return false
      }

      return sincronizado && aprovado
    })
  },


  // RN03: Envia movimentação para o servidor
  async enviarMovimentacao(movimentacao: Movimentacao): Promise<void> {
    const response = await fetch(montarUrlApi('/movimentacoes/sincronizar'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movimentacao),
    })

    if (!response.ok) {
      throw erroSincronizacao('movimentação', response)
    }
  },

  // RN03: Envia tarefa para o servidor
  async enviarTarefa(tarefa: Tarefa): Promise<void> {
    const response = await fetch(montarUrlApi('/tarefas/sincronizar'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tarefa),
    })

    if (!response.ok) {
      throw erroSincronizacao('tarefa', response)
    }
  },

  // RN03: Envia ticket para o servidor
  async enviarTicket(ticket: Ticket): Promise<void> {
    const response = await fetch(montarUrlApi('/tickets/sincronizar'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    })

    if (!response.ok) {
      throw erroSincronizacao('ticket', response)
    }
  },

  // Obter status geral de sincronização
  async obterStatusSincronizacao(): Promise<{
    movimentacoesNaoSincronizadas: number
    tarefasNaoSincronizadas: number
    ticketsNaoSincronizados: number
    temConexao: boolean
  }> {
    const [todasMovimentacoes, todasTarefas, todosTickets, temConexao] = await Promise.all([
      MovimentacaoRepository.buscarTodos(),
      TarefaRepository.buscarTodos(),
      TicketRepository.buscarTodos(),
      SincronizacaoService.detectarConexao(),
    ])

    const movimentacoesNaoSincronizadas = todasMovimentacoes.filter(m => !m.sincronizado).length
    const tarefasNaoSincronizadas = todasTarefas.filter(t => !t.sincronizado).length
    const ticketsNaoSincronizados = todosTickets.filter(t => !t.sincronizado).length

    return {
      movimentacoesNaoSincronizadas,
      tarefasNaoSincronizadas,
      ticketsNaoSincronizados,
      temConexao,
    }
  },

  // Mensagem amigável para o capataz sobre status de sincronização
  async obterMensagemSincronizacao(): Promise<string> {
    const status = await SincronizacaoService.obterStatusSincronizacao()

    // Se tem conexão e nenhum dado aguardando
    if (status.temConexao && status.movimentacoesNaoSincronizadas === 0 &&
        status.tarefasNaoSincronizadas === 0 && status.ticketsNaoSincronizados === 0) {
      return '✅ Tudo sincronizado! Seus dados estão salvos no servidor.'
    }

    // Se tem conexão mas há dados aguardando sincronização
    if (status.temConexao &&
        (status.movimentacoesNaoSincronizadas > 0 || status.tarefasNaoSincronizadas > 0 || status.ticketsNaoSincronizados > 0)) {
      const total = status.movimentacoesNaoSincronizadas + status.tarefasNaoSincronizadas + status.ticketsNaoSincronizados
      return `⏳ Sincronizando... ${total} registro(s) aguardando envio.`
    }

    // Se não tem conexão
    if (!status.temConexao) {
      const total = status.movimentacoesNaoSincronizadas + status.tarefasNaoSincronizadas + status.ticketsNaoSincronizados
      return `📴 Sem internet. ${total} registro(s) salvos localmente. Serão sincronizados quando houver conexão.`
    }

    return 'Verificando sincronização...'
  },
}
