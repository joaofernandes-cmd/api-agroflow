import { MovimentacaoRepository } from '../repositories/movimentacao.repository'
import { TarefaRepository } from '../repositories/tarefa.repository'
import { TicketRepository } from '../repositories/ticket.repository'
import { Movimentacao } from '../models/movimentacao.model'
import { Tarefa } from '../models/tarefa.model'
import { Ticket } from '../models/ticket.model'
import { Usuario } from '../models/usuario.model'
import { UUID } from '../models/uuid'

// RN06: Validação e aprovação de registros - apenas Supervisor pode validar
export const ValidacaoService = {
  // RN06: Validar se usuário tem permissão para aprovar registros
  podeValidar(usuario: Usuario): boolean {
    return usuario.cargo === 'supervisor'
  },

  // RN06: Aprovar movimentação (pendente → aprovado)
  async aprovarMovimentacao(
    movimentacaoId: number,
    supervisorId: UUID,
    supervisorCargo: string
  ): Promise<{ sucesso: boolean; mensagem: string; movimentacao?: Movimentacao }> {
    if (supervisorCargo !== 'supervisor') {
      return {
        sucesso: false,
        mensagem: 'Apenas Supervisores podem validar movimentações. Acesso negado.',
      }
    }

    const movimentacao = await MovimentacaoRepository.findById(movimentacaoId)

    if (!movimentacao) {
      return { sucesso: false, mensagem: 'Movimentação não encontrada.' }
    }

    if (movimentacao.status !== 'pendente') {
      return {
        sucesso: false,
        mensagem: `Movimentação já foi ${movimentacao.status}. Não pode ser alterada.`,
      }
    }

    const movimentacaoAtualizada = await MovimentacaoRepository.update(movimentacaoId, {
      ...movimentacao,
      status: 'aprovado',
      validado_por: supervisorId,
    })

    return {
      sucesso: true,
      mensagem: 'Movimentação aprovada com sucesso.',
      movimentacao: movimentacaoAtualizada || undefined,
    }
  },

  // RN06: Rejeitar movimentação (pendente → rejeitado)
  async rejeitarMovimentacao(
    movimentacaoId: number,
    supervisorId: UUID,
    supervisorCargo: string
  ): Promise<{ sucesso: boolean; mensagem: string; movimentacao?: Movimentacao }> {
    if (supervisorCargo !== 'supervisor') {
      return {
        sucesso: false,
        mensagem: 'Apenas Supervisores podem rejeitar movimentações. Acesso negado.',
      }
    }

    const movimentacao = await MovimentacaoRepository.findById(movimentacaoId)

    if (!movimentacao) {
      return { sucesso: false, mensagem: 'Movimentação não encontrada.' }
    }

    if (movimentacao.status !== 'pendente') {
      return {
        sucesso: false,
        mensagem: `Movimentação já foi ${movimentacao.status}. Não pode ser alterada.`,
      }
    }

    const movimentacaoAtualizada = await MovimentacaoRepository.update(movimentacaoId, {
      ...movimentacao,
      status: 'rejeitado',
      validado_por: supervisorId,
    })

    return {
      sucesso: true,
      mensagem: 'Movimentação rejeitada com sucesso.',
      movimentacao: movimentacaoAtualizada || undefined,
    }
  },

  // RN06: Aprovar ticket (pendente → aprovado) — apenas Supervisor
  async aprovarTicket(
    ticketId: number,
    supervisorId: UUID,
    supervisorCargo: string
  ): Promise<{ sucesso: boolean; mensagem: string; ticket?: Ticket }> {
    if (supervisorCargo !== 'supervisor') {
      return {
        sucesso: false,
        mensagem: 'Apenas Supervisores podem aprovar tickets. Acesso negado.',
      }
    }

    const ticket = await TicketRepository.findById(ticketId)

    if (!ticket) {
      return { sucesso: false, mensagem: 'Ticket não encontrado.' }
    }

    if (ticket.status !== 'pendente') {
      return {
        sucesso: false,
        mensagem: `Ticket já foi ${ticket.status}. Não pode ser alterado.`,
      }
    }

    const ticketAtualizado = await TicketRepository.update(ticketId, {
      ...ticket,
      status: 'aprovado',
      aprovado_por: supervisorId,
    })

    return {
      sucesso: true,
      mensagem: 'Ticket aprovado com sucesso.',
      ticket: ticketAtualizado || undefined,
    }
  },

  // RN06: Aprovar tarefa (pendente → aprovado) — apenas Supervisor
  async aprovarTarefa(
    tarefaId: number,
    supervisorId: UUID,
    supervisorCargo: string
  ): Promise<{ sucesso: boolean; mensagem: string; tarefa?: Tarefa }> {
    if (supervisorCargo !== 'supervisor') {
      return {
        sucesso: false,
        mensagem: 'Apenas Supervisores podem aprovar tarefas. Acesso negado.',
      }
    }

    const tarefa = await TarefaRepository.findById(tarefaId)

    if (!tarefa) {
      return { sucesso: false, mensagem: 'Tarefa não encontrada.' }
    }

    if (tarefa.status !== 'pendente') {
      return {
        sucesso: false,
        mensagem: `Tarefa já foi ${tarefa.status}. Não pode ser alterada.`,
      }
    }

    const tarefaAtualizada = await TarefaRepository.update(tarefaId, {
      ...tarefa,
      status: 'aprovado',
      aprovado_por: supervisorId,
    })

    return {
      sucesso: true,
      mensagem: 'Tarefa aprovada com sucesso.',
      tarefa: tarefaAtualizada || undefined,
    }
  },
}
