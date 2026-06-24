import { Tarefa, TarefaInput, TarefaStatus, TarefaPrioridade } from '../models/tarefa.model'
import { TarefaRepository } from '../repositories/tarefa.repository'
import { Usuario } from '../models/usuario.model'
import { UUID } from '../models/uuid'
import { filtrarPorRetiro } from '../utils/retiro-filtro'

export const TarefaService = {
  // RN02: Validar campos obrigatórios na criação de tarefa
  // Obrigatórios: usuário atribuído, prioridade, categoria, descrição
  // data_criacao é gerada automaticamente pelo sistema (timestamp)
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
  // data_criacao é gerada automaticamente pelo sistema (timestamp)
  async criar(dados: Omit<TarefaInput, 'data_criacao' | 'criada_por' | 'status'>, usuarioCriador: Usuario): Promise<Tarefa> { // Usuário só envia ISSO: retiro_id, atribuida_a, prioridade, categoria, descricao


    if (usuarioCriador.cargo !== 'supervisor') {
      throw new Error('Apenas Supervisores podem criar tarefas')
    }

    // Valida se todos os campos obrigatórios foram preenchidos
    this.validarCamposObrigatorios(dados as TarefaInput)

    // Cria tarefa no banco com campos fornecidos + campos gerados automaticamente
    const tarefa = await TarefaRepository.criar({
      ...dados,                         // Spread dos dados do usuário: retiro_id, atribuida_a, prioridade, categoria, descricao
      criada_por: usuarioCriador.id,    // Preenchido automaticamente com o ID do usuário logado
      status: 'pendente',               // Preenchido automaticamente como pendente
    } as TarefaInput)

    // Retorna tarefa criada com ID gerado pelo banco
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
    // Retorna a tarefa ou null se não encontrar
    return TarefaRepository.buscarPorId(id)
  },


  // Listar todas as tarefas sem filtros
  async listarTodas(): Promise<Tarefa[]> {
    // Retorna todas as tarefas do banco
    return TarefaRepository.buscarTodos()
  },


  // Atualizar apenas o status de uma tarefa
  async atualizarStatus(id: UUID, novoStatus: TarefaStatus): Promise<Tarefa | null> {
    // Busca a tarefa atual no banco
    const tarefa = await TarefaRepository.buscarPorId(id)

    // Se tarefa não existe, retorna null
    if (!tarefa) {
      return null
    }

    // Atualiza apenas o campo status mantendo outros campos intactos
    return TarefaRepository.atualizar(id, {
      ...tarefa,            // Mantém todos os campos atuais
      status: novoStatus,   // Sobrescreve apenas o status
    })
  },



  // Atualizar tarefa com validação de campos obrigatórios
  // Campos que NÃO podem ser alterados: data_criacao, criada_por, retiro_id, status
  async atualizar(id: UUID, dados: Partial<Omit<TarefaInput, 'data_criacao' | 'criada_por' | 'retiro_id' | 'status'>>): Promise<Tarefa | null> {
    // Busca a tarefa atual no banco
    const tarefaAtual = await TarefaRepository.buscarPorId(id)
    // Se tarefa não existe, retorna null
    if (!tarefaAtual) {
      return null
    }

    // Se está alterando campos críticos, revalida para garantir integridade
    if (dados.atribuida_a || dados.prioridade || dados.categoria || dados.descricao) {
      // Mescla dados atuais com novos dados para validação completa
      const dadosCompletos = {
        ...tarefaAtual,
        ...dados,
      } as TarefaInput

      // Revalida se todos os campos obrigatórios estão presentes
      this.validarCamposObrigatorios(dadosCompletos)
    }

    // Atualiza a tarefa no banco com os novos dados
    return TarefaRepository.atualizar(id, dados)
  },



  // Contar quantas tarefas existem em cada status
  async contarPorStatus(retiroId?: UUID | UUID[]): Promise<Record<TarefaStatus, number>> {
    // Busca todas as tarefas do banco
    const tarefas = await TarefaRepository.buscarTodos()

    // Inicializa contador para cada status possível
    const contagem: Record<TarefaStatus, number> = {
      pendente: 0,
      concluido: 0,
      aprovado: 0,
    }

    // Itera sobre todas as tarefas e incrementa o contador do status correspondente
    filtrarPorRetiro(tarefas, retiroId).forEach(t => {
      contagem[t.status]++
    })

    // Retorna objeto com contagem de tarefas por status
    return contagem
  },


  // Remover uma tarefa do banco de dados
  async remover(id: UUID): Promise<void> {
    // Deleta a tarefa do banco de dados permanentemente
    await TarefaRepository.remover(id)
  },
}
