export type TicketCategoria = 'cerca' | 'hidraulica' | 'eletrica' | 'edificacao' | 'abastecimento_agua' | 'outro'

export type TicketStatus = 'aberto' | 'em_atendimento' | 'resolvido' | 'cancelado'

export interface Ticket {
  id: string
  retiro_id: string
  aberto_por: string
  categoria: TicketCategoria
  localizacao: string
  status: TicketStatus
  atribuido_a: string
  descricao: string
  data_criacao: Date
  data_realizado: Date
}

export interface TicketInput {
  retiro_id: string
  aberto_por: string
  categoria: TicketCategoria
  localizacao: string
  status: TicketStatus
  atribuido_a: string
  descricao: string
  data_criacao: Date
  data_realizado: Date
}
