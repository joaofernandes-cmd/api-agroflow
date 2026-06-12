import { UUID } from './uuid'

export interface EvidenciaTicket {
  evidencia_id: UUID
  ticket_id: UUID
}

export interface EvidenciaTicketInput {
  evidencia_id: UUID
  ticket_id: UUID
}
