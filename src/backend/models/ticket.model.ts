import { UUID } from './uuid'

export type TicketCategoria = 'cerca' | 'hidraulica' | 'eletrica'

export type TicketStatus = 'pendente' | 'aprovado'

export type TicketPrioridade = 'alta' | 'media' | 'baixa'

export interface Ticket {
  id: UUID
  retiro_id: UUID
  aberto_por: UUID
  categoria: TicketCategoria
  categoria_outro?: string | null
  localizacao: string
  status: TicketStatus
  atribuido_a: UUID | null
  aprovado_por: UUID | null
  descricao: string
  prioridade: TicketPrioridade
  data_criacao: Date
  data_realizado: Date
  sincronizado: boolean
}

export interface TicketInput {
  id?: UUID
  retiro_id: UUID
  aberto_por: UUID
  categoria: TicketCategoria
  categoria_outro?: string | null
  localizacao: string
  status: TicketStatus
  atribuido_a: UUID | null
  aprovado_por?: UUID | null
  descricao: string
  prioridade: TicketPrioridade
  data_criacao?: Date
  data_realizado?: Date
  sincronizado?: boolean
}
