import { MovimentacaoRepository } from '../repositories/movimentacao.repository'
import { TarefaRepository } from '../repositories/tarefa.repository'
import { Movimentacao } from '../models/movimentacao.model'
import { Tarefa } from '../models/tarefa.model'
import { Usuario } from '../models/usuario.model'

// RN06: Validação e aprovação de registros - apenas Supervisor pode validar
export const ValidacaoService = {
  // RN06: Validar se usuário tem permissão para aprovar registros
  // Apenas Supervisor pode validar/aprovar
  podeValidar(usuario: Usuario): boolean {
    return usuario.cargo === 'supervisor'
  },

  // RN06: Aprovar movimentação (altera status de pendente → aprovado)
  // Apenas Supervisor pode fazer isso
  async aprovarMovimentacao(
    movimentacaoId: string,
    supervisorId: string,
    supervisorCargo: string
  ): Promise<{ sucesso: boolean; mensagem: string; movimentacao?: Movimentacao }> {
    // RN06: Verifica se quem está tentando validar é Supervisor
    if (supervisorCargo !== 'supervisor') {
      return {
        sucesso: false,
        mensagem: 'Apenas Supervisores podem validar movimentações. Acesso negado.',
      }
    }

    // Busca a movimentação no banco
    const movimentacao = await MovimentacaoRepository.findById(movimentacaoId)

    if (!movimentacao) {
      return {
        sucesso: false,
        mensagem: 'Movimentação não encontrada.',
      }
    }

    // RN06: Só pode aprovar se estiver pendente
    if (movimentacao.status !== 'pendente') {
      return {
        sucesso: false,
        mensagem: `Movimentação já foi ${movimentacao.status}. Não pode ser alterada.`,
      }
    }

    // Aprova a movimentação (altera status para aprovado)
    // e registra quem validou (validado_por)
    const movimentacaoAtualizada = await MovimentacaoRepository.update(
      movimentacaoId,
      {
        ...movimentacao,
        status: 'aprovado',
        validado_por: supervisorId,
      }
    )

    return {
      sucesso: true,
      mensagem: 'Movimentação aprovada com sucesso.',
      movimentacao: movimentacaoAtualizada || undefined,
    }
  },

  // RN06: Rejeitar movimentação (altera status de pendente → rejeitado)
  // Apenas Supervisor pode fazer isso
  async rejeitarMovimentacao(
    movimentacaoId: string,
    supervisorId: string,
    supervisorCargo: string,
    motivo: string
  ): Promise<{ sucesso: boolean; mensagem: string; movimentacao?: Movimentacao }> {
    // RN06: Verifica se quem está rejeitando é Supervisor
    if (supervisorCargo !== 'supervisor') {
      return {
        sucesso: false,
        mensagem: 'Apenas Supervisores podem rejeitar movimentações. Acesso negado.',
      }
    }

    // Busca a movimentação
    const movimentacao = await MovimentacaoRepository.findById(movimentacaoId)

    if (!movimentacao) {
      return {
        sucesso: false,
        mensagem: 'Movimentação não encontrada.',
      }
    }

    // Só pode rejeitar se estiver pendente
    if (movimentacao.status !== 'pendente') {
      return {
        sucesso: false,
        mensagem: `Movimentação já foi ${movimentacao.status}. Não pode ser alterada.`,
      }
    }

    // Rejeita a movimentação
    const movimentacaoAtualizada = await MovimentacaoRepository.update(
      movimentacaoId,
      {
        ...movimentacao,
        status: 'rejeitado',
        validado_por: supervisorId,
      }
    )

    return {
      sucesso: true,
      mensagem: `Movimentação rejeitada. Motivo: ${motivo}`,
      movimentacao: movimentacaoAtualizada || undefined,
    }
  },

  // RN06: Aprovar tarefa (altera status de pendente → concluida)
  // Apenas Supervisor pode fazer isso
  async aprovarTarefa(
    tarefaId: string,
    supervisorId: string,
    supervisorCargo: string
  ): Promise<{ sucesso: boolean; mensagem: string; tarefa?: Tarefa }> {
    // RN06: Verifica se quem está aprovando é Supervisor
    if (supervisorCargo !== 'supervisor') {
      return {
        sucesso: false,
        mensagem: 'Apenas Supervisores podem aprovar tarefas. Acesso negado.',
      }
    }

    // Busca a tarefa no banco
    const tarefa = await TarefaRepository.findById(tarefaId)

    if (!tarefa) {
      return {
        sucesso: false,
        mensagem: 'Tarefa não encontrada.',
      }
    }

    // Só pode aprovar se estiver pendente
    if (tarefa.status !== 'pendente') {
      return {
        sucesso: false,
        mensagem: `Tarefa já foi ${tarefa.status}. Não pode ser alterada.`,
      }
    }

    // Aprova a tarefa (altera status para concluida)
    const tarefaAtualizada = await TarefaRepository.update(tarefaId, {
      ...tarefa,
      status: 'concluida',
    })

    return {
      sucesso: true,
      mensagem: 'Tarefa aprovada e marcada como concluída.',
      tarefa: tarefaAtualizada || undefined,
    }
  },

  // RN06: Rejeitar tarefa (altera status para cancelada)
  // Apenas Supervisor pode fazer isso
  async rejeitarTarefa(
    tarefaId: string,
    supervisorId: string,
    supervisorCargo: string,
    motivo: string
  ): Promise<{ sucesso: boolean; mensagem: string; tarefa?: Tarefa }> {
    // RN06: Verifica se quem está rejeitando é Supervisor
    if (supervisorCargo !== 'supervisor') {
      return {
        sucesso: false,
        mensagem: 'Apenas Supervisores podem rejeitar tarefas. Acesso negado.',
      }
    }

    // Busca a tarefa
    const tarefa = await TarefaRepository.findById(tarefaId)

    if (!tarefa) {
      return {
        sucesso: false,
        mensagem: 'Tarefa não encontrada.',
      }
    }

    // Só pode rejeitar se estiver pendente
    if (tarefa.status !== 'pendente') {
      return {
        sucesso: false,
        mensagem: `Tarefa já foi ${tarefa.status}. Não pode ser alterada.`,
      }
    }

    // Rejeita a tarefa (altera status para cancelada)
    const tarefaAtualizada = await TarefaRepository.update(tarefaId, {
      ...tarefa,
      status: 'cancelada',
    })

    return {
      sucesso: true,
      mensagem: `Tarefa rejeitada e cancelada. Motivo: ${motivo}`,
      tarefa: tarefaAtualizada || undefined,
    }
  },
}
