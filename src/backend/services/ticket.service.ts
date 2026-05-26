import { Ticket, TicketInput, TicketStatus, TicketPrioridade, TicketCategoria } from '../models/ticket.model'
import { TicketRepository } from '../repositories/ticket.repository'
import { Usuario } from '../models/usuario.model'

export const TicketService = {
  // RN08: Validar campos obrigatórios e existência de evidência
  // RN11: Validar prioridade obrigatória
  validarCamposObrigatorios(dados: TicketInput): void {
    // RN11: Prioridade é obrigatória
    if (!dados.prioridade) {
      throw new Error('Campo "prioridade" é obrigatório (alta, média, baixa)')
    }

    // RN08: Categoria obrigatória
    if (!dados.categoria) {
      throw new Error('Campo "categoria" é obrigatório')
    }

    // RN08: Localização obrigatória
    if (!dados.localizacao || dados.localizacao.trim().length === 0) {
      throw new Error('Campo "localizacao" é obrigatório')
    }

    // RN08: Descrição obrigatória
    if (!dados.descricao || dados.descricao.trim().length === 0) {
      throw new Error('Campo "descricao" é obrigatório')
    }
  },

  // RN08: Criar ticket com validação de evidência obrigatória
  // RN11: Validar prioridade obrigatória
  // Apenas Capataz e Supervisor podem criar tickets
  async criar(
    dados: Omit<TicketInput, 'data_criacao' | 'aberto_por' | 'status' | 'data_realizado' | 'atribuido_a'>,
    usuarioAbridorTicket: Usuario,
    temEvidenciaDescritiva: boolean
  ): Promise<Ticket> {
    // RN08: Exigir ao menos uma evidência descritiva
    if (!temEvidenciaDescritiva) {
      throw new Error('Ticket rejeitado: ao menos uma evidência descritiva é obrigatória (mensagem com mínimo 10 caracteres ou áudio com mínimo 3 segundos)')
    }

    this.validarCamposObrigatorios(dados as TicketInput)

    // Cria ticket no banco
    const ticket = await TicketRepository.create({
      ...dados,
      aberto_por: usuarioAbridorTicket.id,
      status: 'aberto',
      data_criacao: new Date(),
      data_realizado: new Date(),
      atribuido_a: '',
    } as TicketInput)

    return ticket
  },

  // RN11: Alterar prioridade de um ticket
  // A alteração deve ser registrada no log de auditoria (timestamp + usuário)
  async alterarPrioridade(id: string, novaPrioridade: TicketPrioridade, usuarioResponsavel: Usuario): Promise<Ticket | null> {
    // Busca ticket atual
    const ticket = await TicketRepository.findById(id)

    if (!ticket) {
      return null
    }

    // Valida nova prioridade
    const prioridadesValidas: TicketPrioridade[] = ['alta', 'media', 'baixa']
    if (!prioridadesValidas.includes(novaPrioridade)) {
      throw new Error('Prioridade inválida. Escolha entre: alta, média, baixa')
    }

    // Atualiza prioridade
    return TicketRepository.update(id, {
      ...ticket,
      prioridade: novaPrioridade,
    })
  },

  // Listar tickets por status
  async listarPorStatus(status: TicketStatus, retiroId?: string): Promise<Ticket[]> {
    // Busca todos os tickets do banco
    const tickets = await TicketRepository.findAll()

    // Filtra por status (e opcionalmente por retiro)
    return tickets.filter(t => {
      // Verifica se o status do ticket corresponde ao filtro
      if (t.status !== status) {
        return false
      }

      // Se retiroId foi informado, verifica se pertence a esse retiro
      if (retiroId && t.retiro_id !== retiroId) {
        return false
      }

      // Passou em todos os filtros? Inclui no resultado
      return true
    })
  },

  // Listar tickets por prioridade
  async listarPorPrioridade(prioridade: TicketPrioridade, retiroId?: string): Promise<Ticket[]> {
    // Busca todos os tickets do banco
    const tickets = await TicketRepository.findAll()

    // Filtra por prioridade (e opcionalmente por retiro)
    return tickets.filter(t => {
      // Verifica se a prioridade do ticket corresponde ao filtro
      if (t.prioridade !== prioridade) {
        return false
      }

      // Se retiroId foi informado, verifica se pertence a esse retiro
      if (retiroId && t.retiro_id !== retiroId) {
        return false
      }

      // Passou em todos os filtros? Inclui no resultado
      return true
    })
  },

  // Listar tickets por categoria
  async listarPorCategoria(categoria: TicketCategoria, retiroId?: string): Promise<Ticket[]> {
    // Busca todos os tickets do banco
    const tickets = await TicketRepository.findAll()

    // Filtra por categoria (e opcionalmente por retiro)
    return tickets.filter(t => {
      // Verifica se a categoria do ticket corresponde ao filtro
      if (t.categoria !== categoria) {
        return false
      }

      // Se retiroId foi informado, verifica se pertence a esse retiro
      if (retiroId && t.retiro_id !== retiroId) {
        return false
      }

      // Passou em todos os filtros? Inclui no resultado
      return true
    })
  },

  // Atualizar status do ticket
  async atualizarStatus(id: string, novoStatus: TicketStatus): Promise<Ticket | null> {
    // Busca o ticket atual no banco
    const ticket = await TicketRepository.findById(id)

    // Se ticket não existe, retorna null
    if (!ticket) {
      return null
    }

    // Atualiza apenas o campo status mantendo outros campos intactos
    return TicketRepository.update(id, {
      ...ticket,
      status: novoStatus,
    })
  },

  // Atribuir ticket a um usuário
  async atribuirA(id: string, usuarioId: string): Promise<Ticket | null> {
    // Busca o ticket atual no banco
    const ticket = await TicketRepository.findById(id)

    // Se ticket não existe, retorna null
    if (!ticket) {
      return null
    }

    // Atribui o ticket ao usuário
    return TicketRepository.update(id, {
      ...ticket,
      atribuido_a: usuarioId,
    })
  },

  // Buscar ticket por ID
  async buscarPorId(id: string): Promise<Ticket | null> {
    // Retorna o ticket ou null se não encontrar
    return TicketRepository.findById(id)
  },

  // Listar todos os tickets
  async listarTodos(): Promise<Ticket[]> {
    // Retorna todos os tickets do banco
    return TicketRepository.findAll()
  },

  // Listar tickets abertos
  async listarAbertos(retiroId?: string): Promise<Ticket[]> {
    // Busca todos os tickets do banco
    const tickets = await TicketRepository.findAll()

    // Filtra apenas tickets abertos
    return tickets.filter(t => {
      if (t.status !== 'aberto') {
        return false
      }

      // Se retiroId foi informado, verifica se pertence a esse retiro
      if (retiroId && t.retiro_id !== retiroId) {
        return false
      }

      return true
    })
  },

  // Contar tickets por prioridade
  async contarPorPrioridade(retiroId?: string): Promise<Record<TicketPrioridade, number>> {
    // Busca todos os tickets do banco
    const tickets = await TicketRepository.findAll()

    // Inicializa contador para cada prioridade
    const contagem: Record<TicketPrioridade, number> = {
      alta: 0,
      media: 0,
      baixa: 0,
    }

    // Itera sobre todos os tickets e incrementa o contador da prioridade
    tickets.forEach(t => {
      // Se retiroId foi informado, filtra por esse retiro; senão conta todas
      if (!retiroId || t.retiro_id === retiroId) {
        contagem[t.prioridade]++
      }
    })

    // Retorna objeto com contagem de tickets por prioridade
    return contagem
  },
}
