import { Tarefa, TarefaInput, TarefaStatus, TarefaPrioridade } from '../models/tarefa.model'
import { TarefaRepository } from '../repositories/tarefa.repository'
import { Usuario } from '../models/usuario.model'
import { UUID } from '../models/uuid'
import { filtrarPorRetiro } from '../utils/retiro-filtro'

export const TarefaService = {
  // RN02: Validar campos obrigatórios na criação de tarefa
  // Obrigatórios: usuário atribuído, prioridade, categoria, descrição
  // data_criacao é gerada automaticamente pelo sistema
  validarCamposObrigatorios(dados: TarefaInput): void {
    if (!dados.atribuida_a) {
      throw new Error('Campo "atribuida_a" (usuário) é obrigatório')
    }

    if (!dados.prioridade) {
      throw new Error('Campo "prioridade" é obrigatório')
    }

    if (!dados.categoria) {
      throw new Error('Campo "categoria" é obrigatório')
    }

    if (!dados.descricao || dados.descricao.trim().length === 0) {
      throw new Error('Campo "descricao" é obrigatório')
    }
  },

  // RN02: Criar tarefa com validação de campos obrigatórios
  // Usuário só envia retiro_id, atribuida_a, prioridade, categoria e descricao;
  // criada_por e status são preenchidos automaticamente
  async criar(dados: Omit<TarefaInput, 'data_criacao' | 'criada_por' | 'status'>, usuarioCriador: Usuario): Promise<Tarefa> {
    if (usuarioCriador.cargo !== 'supervisor') {
      throw new Error('Apenas Supervisores podem criar tarefas')
    }

    this.validarCamposObrigatorios(dados as TarefaInput)

    const tarefa = await TarefaRepository.criar({
      ...dados,
      criada_por: usuarioCriador.id,
      status: 'pendente',
    } as TarefaInput)

    return tarefa
  },

  async sincronizarRecebida(dados: TarefaInput): Promise<Tarefa> {
    if (!dados.criada_por) {
      throw new Error('Campo "criada_por" é obrigatório')
    }

    if (!dados.status) {
      throw new Error('Campo "status" é obrigatório')
    }

    this.validarCamposObrigatorios(dados)

    return TarefaRepository.criar({
      ...dados,
      sincronizado: true,
    })
  },

  // RN10: Buscar tarefas para dashboard (apenas concluídas)
  async buscarParaDashboard(retiroId?: UUID | UUID[]): Promise<Tarefa[]> {
    const tarefas = await TarefaRepository.buscarTodos()
    return filtrarPorRetiro(tarefas, retiroId).filter(t => t.status === 'aprovado')
  },

  // Listar tarefas filtradas por status e opcionalmente por retiro
  async listarPorStatus(status: TarefaStatus, retiroId?: UUID | UUID[]): Promise<Tarefa[]> {
    const tarefas = await TarefaRepository.buscarTodos()
    return filtrarPorRetiro(tarefas, retiroId).filter(t => t.status === status)
  },

  // Listar tarefas atribuídas a um usuário
  async listarPorUsuario(usuarioId: UUID): Promise<Tarefa[]> {
    const tarefas = await TarefaRepository.buscarTodos()
    return tarefas.filter(t => t.atribuida_a === usuarioId)
  },

  // Listar tarefas filtradas por prioridade e opcionalmente por retiro
  async listarPorPrioridade(prioridade: TarefaPrioridade, retiroId?: UUID | UUID[]): Promise<Tarefa[]> {
    const tarefas = await TarefaRepository.buscarTodos()
    return filtrarPorRetiro(tarefas, retiroId).filter(t => t.prioridade === prioridade)
  },

  // Listar tarefas filtradas por categoria e opcionalmente por retiro
  async listarPorCategoria(categoria: string, retiroId?: UUID | UUID[]): Promise<Tarefa[]> {
    const tarefas = await TarefaRepository.buscarTodos()
    return filtrarPorRetiro(tarefas, retiroId).filter(t => t.categoria === categoria)
  },

  // Buscar uma tarefa específica pelo ID
  async buscarPorId(id: UUID): Promise<Tarefa | null> {
    return TarefaRepository.buscarPorId(id)
  },

  // Listar todas as tarefas sem filtros
  async listarTodas(): Promise<Tarefa[]> {
    return TarefaRepository.buscarTodos()
  },

  // Atualizar apenas o status de uma tarefa
  async atualizarStatus(id: UUID, novoStatus: TarefaStatus): Promise<Tarefa | null> {
    const tarefa = await TarefaRepository.buscarPorId(id)

    if (!tarefa) {
      return null
    }

    return TarefaRepository.atualizar(id, {
      ...tarefa,
      status: novoStatus,
    })
  },

  // Atualizar tarefa com validação de campos obrigatórios
  // Campos que NÃO podem ser alterados: data_criacao, criada_por, retiro_id, status
  async atualizar(id: UUID, dados: Partial<Omit<TarefaInput, 'data_criacao' | 'criada_por' | 'retiro_id' | 'status'>>): Promise<Tarefa | null> {
    const tarefaAtual = await TarefaRepository.buscarPorId(id)
    if (!tarefaAtual) {
      return null
    }

    // Revalida se algum campo crítico está sendo alterado
    if (dados.atribuida_a || dados.prioridade || dados.categoria || dados.descricao) {
      const dadosCompletos = {
        ...tarefaAtual,
        ...dados,
      } as TarefaInput

      this.validarCamposObrigatorios(dadosCompletos)
    }

    return TarefaRepository.atualizar(id, dados)
  },

  // Contar quantas tarefas existem em cada status
  async contarPorStatus(retiroId?: UUID | UUID[]): Promise<Record<TarefaStatus, number>> {
    const tarefas = await TarefaRepository.buscarTodos()

    const contagem: Record<TarefaStatus, number> = {
      pendente: 0,
      concluido: 0,
      aprovado: 0,
    }

    filtrarPorRetiro(tarefas, retiroId).forEach(t => {
      contagem[t.status]++
    })

    return contagem
  },

  // Remover uma tarefa do banco de dados
  async remover(id: UUID): Promise<void> {
    await TarefaRepository.remover(id)
  },
}
