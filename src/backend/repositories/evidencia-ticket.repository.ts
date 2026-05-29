import sql from '../database/connection'
import { EvidenciaTicket, EvidenciaTicketInput } from '../models/evidencia-ticket.model'

// Retorna todas as evidências de tickets cadastradas
export const EvidenciaTicketRepository = {
    // Ordena evidências de tickets por data de criacao
    async buscarTodos(): Promise<EvidenciaTicket[]> {
        return sql<EvidenciaTicket[]>`
            SELECT evidencia_id, ticket_id
            FROM evidencia_ticket
            ORDER BY evidencia_id
        `
    },

    // Busca uma evidência de ticket pelo seu id e retorna null se não encontrar
    async buscarPorId(evidencia_id: number, ticket_id: number): Promise<EvidenciaTicket | null> {
        const evidenciaTicket = await sql<EvidenciaTicket[]>`
            SELECT evidencia_id, ticket_id
            FROM evidencia_ticket
            WHERE evidencia_id = ${evidencia_id} AND ticket_id = ${ticket_id}
            LIMIT 1
        `
        return evidenciaTicket[0] ?? null
    },

    // Cria uma nova evidência de ticket no banco de dados
    async criar(input: EvidenciaTicketInput): Promise<EvidenciaTicket> {
        const [created] = await sql<EvidenciaTicket[]>`
            INSERT INTO evidencia_ticket (evidencia_id, ticket_id)
            VALUES (${input.evidencia_id}, ${input.ticket_id})
            RETURNING evidencia_id, ticket_id
        `
        return created
    }
}
