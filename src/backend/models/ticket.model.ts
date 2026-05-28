import { UUID } from './uuid'

export type TicketCategoria = 'cerca' | 'hidraulica' | 'eletrica' | 'edificacao' | 'abastecimento_agua' | 'outro'

export type TicketStatus = 'pendente' | 'aprovado'

export type TicketPrioridade = 'alta' | 'media' | 'baixa'

export interface Ticket {
  id: number
  retiro_id: number
  aberto_por: UUID
  categoria: TicketCategoria
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
  retiro_id: number
  aberto_por: UUID
  categoria: TicketCategoria
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
