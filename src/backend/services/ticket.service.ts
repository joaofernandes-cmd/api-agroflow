import { Ticket, TicketInput, TicketStatus, TicketPrioridade, TicketCategoria } from '../models/ticket.model'
import { TicketRepository } from '../repositories/ticket.repository'
import { Usuario } from '../models/usuario.model'
import { UUID } from '../models/uuid'

export const TicketService = {
  // RN08: Validar campos obrigatórios e existência de evidência
  // RN11: Validar prioridade obrigatória
  validarCamposObrigatorios(dados: TicketInput): void {
    if (!dados.prioridade) {
      throw new Error('Campo "prioridade" é obrigatório (alta, média, baixa)')
    }

    if (!dados.categoria) {
      throw new Error('Campo "categoria" é obrigatório')
    }

    if (!dados.localizacao || dados.localizacao.trim().length === 0) {
      throw new Error('Campo "localizacao" é obrigatório')
    }

    if (!dados.descricao || dados.descricao.trim().length === 0) {
      throw new Error('Campo "descricao" é obrigatório')
    }
  },

  // RN08: Criar ticket com validação de evidência obrigatória
  // RN11: Validar prioridade obrigatória
  // Apenas Capataz pode criar tickets
  async criar(
    dados: Omit<TicketInput, 'data_criacao' | 'aberto_por' | 'status' | 'data_realizado' | 'atribuido_a'>,
    usuarioAbridorTicket: Usuario,
    temEvidenciaDescritiva: boolean
  ): Promise<Ticket> {
    if (usuarioAbridorTicket.cargo !== 'capataz') {
      throw new Error('Apenas Capatazes podem criar tickets')
    }

    if (!temEvidenciaDescritiva) {
      throw new Error('Ticket rejeitado: ao menos uma evidência descritiva é obrigatória (mensagem com mínimo 10 caracteres ou áudio com mínimo 3 segundos)')
    }

    this.validarCamposObrigatorios(dados as TicketInput)

    const ticket = await TicketRepository.criar({
      ...dados,
      aberto_por: usuarioAbridorTicket.id,
      status: 'pendente',
      data_criacao: new Date(),
      data_realizado: new Date(),
      atribuido_a: null,
    } as TicketInput)

    return ticket
  },

  // RN11: Alterar prioridade de um ticket
  async alterarPrioridade(id: number, novaPrioridade: TicketPrioridade): Promise<Ticket | null> {
    const ticket = await TicketRepository.buscarPorId(id)

    if (!ticket) {
      return null
    }

    const prioridadesValidas: TicketPrioridade[] = ['alta', 'media', 'baixa']
    if (!prioridadesValidas.includes(novaPrioridade)) {
      throw new Error('Prioridade inválida. Escolha entre: alta, média, baixa')
    }

    return TicketRepository.atualizar(id, {
      ...ticket,
      prioridade: novaPrioridade,
    })
  },

  // Listar tickets por status
  async listarPorStatus(status: TicketStatus, retiroId?: number): Promise<Ticket[]> {
    const tickets = await TicketRepository.buscarTodos()

    return tickets.filter(t => {
      if (t.status !== status) {
        return false
      }

      if (retiroId && t.retiro_id !== retiroId) {
        return false
      }

      return true
    })
  },

  // Listar tickets por prioridade
  async listarPorPrioridade(prioridade: TicketPrioridade, retiroId?: number): Promise<Ticket[]> {
    const tickets = await TicketRepository.buscarTodos()

    return tickets.filter(t => {
      if (t.prioridade !== prioridade) {
        return false
      }

      if (retiroId && t.retiro_id !== retiroId) {
        return false
      }

      return true
    })
  },

  // Listar tickets por categoria
  async listarPorCategoria(categoria: TicketCategoria, retiroId?: number): Promise<Ticket[]> {
    const tickets = await TicketRepository.buscarTodos()

    return tickets.filter(t => {
      if (t.categoria !== categoria) {
        return false
      }

      if (retiroId && t.retiro_id !== retiroId) {
        return false
      }

      return true
    })
  },

  // Atualizar status do ticket
  async atualizarStatus(id: number, novoStatus: TicketStatus): Promise<Ticket | null> {
    const ticket = await TicketRepository.buscarPorId(id)

    if (!ticket) {
      return null
    }

    return TicketRepository.atualizar(id, {
      ...ticket,
      status: novoStatus,
    })
  },

  // Atribuir ticket a um usuário
  async atribuirA(id: number, usuarioId: UUID): Promise<Ticket | null> {
    const ticket = await TicketRepository.buscarPorId(id)

    if (!ticket) {
      return null
    }

    return TicketRepository.atualizar(id, {
      ...ticket,
      atribuido_a: usuarioId,
    })
  },

  // Buscar ticket por ID
  async buscarPorId(id: number): Promise<Ticket | null> {
    return TicketRepository.buscarPorId(id)
  },

  // Listar todos os tickets
  async listarTodos(): Promise<Ticket[]> {
    return TicketRepository.buscarTodos()
  },

  // Listar tickets pendentes (aguardando aprovação do supervisor)
  async listarPendentes(retiroId?: number): Promise<Ticket[]> {
    const tickets = await TicketRepository.buscarTodos()

    return tickets.filter(t => {
      if (t.status !== 'pendente') {
        return false
      }

      if (retiroId && t.retiro_id !== retiroId) {
        return false
      }

      return true
    })
  },

  // Contar tickets por prioridade
  async contarPorPrioridade(retiroId?: number): Promise<Record<TicketPrioridade, number>> {
    const tickets = await TicketRepository.buscarTodos()

    const contagem: Record<TicketPrioridade, number> = {
      alta: 0,
      media: 0,
      baixa: 0,
    }

    tickets.forEach(t => {
      if (!retiroId || t.retiro_id === retiroId) {
        contagem[t.prioridade]++
      }
    })

    return contagem
  },
}
