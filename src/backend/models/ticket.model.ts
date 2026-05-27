export type TicketCategoria = 'cerca' | 'hidraulica' | 'eletrica' | 'edificacao' | 'abastecimento_agua' | 'outro'

export type TicketStatus = 'aberto' | 'em_atendimento' | 'resolvido' | 'cancelado'

export type TicketPrioridade = 'alta' | 'media' | 'baixa'

export interface Ticket {
  id: string
  retiro_id: string
  aberto_por: string
  categoria: TicketCategoria
  localizacao: string
  status: TicketStatus
  atribuido_a: string
  descricao: string
  prioridade: TicketPrioridade
  data_criacao: Date
  data_realizado: Date
  sincronizado: boolean
}

export interface TicketInput {
  retiro_id: string
  aberto_por: string
  categoria: TicketCategoria
  localizacao: string
  status: TicketStatus
  atribuido_a: string
  descricao: string
  prioridade: TicketPrioridade
  data_criacao?: Date
  data_realizado?: Date
  sincronizado?: boolean
}
