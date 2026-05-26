import { EvidenciaTicketRepository } from '../repositories/evidencia-ticket.repository'
import { EvidenciaTicket, EvidenciaTicketInput } from '../models/evidencia-ticket.model'

export class EvidenciaTicketService {
  constructor(private repository: EvidenciaTicketRepository) {}

  async listar(): Promise<EvidenciaTicket[]> {
    return this.repository.findAll()
  }

  async buscarPorEvidenciaId(evidenciaId: string): Promise<EvidenciaTicket[]> {
    return this.repository.findByEvidenciaId(evidenciaId)
  }

  async buscarPorTicketId(ticketId: string): Promise<EvidenciaTicket[]> {
    return this.repository.findByTicketId(ticketId)
  }

  async cadastrar(data: EvidenciaTicketInput): Promise<EvidenciaTicket> {
    return this.repository.create(data)
  }

  async remover(evidenciaId: string, ticketId: string): Promise<void> {
    return this.repository.delete(evidenciaId, ticketId)
  }
}
