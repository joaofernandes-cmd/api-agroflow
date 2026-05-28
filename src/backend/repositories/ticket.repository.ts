import sql from '../database/connection'
import { Ticket, TicketInput } from '../models/ticket.model'

export const TicketRepository = {

    async findAll(): Promise<Ticket[]> {
        return sql<Ticket[]>`
            SELECT id, retiro_id, aberto_por, categoria, localizacao, status, atribuido_a, aprovado_por, descricao, prioridade, data_criacao, data_realizado, sincronizado
            FROM ticket
            ORDER BY data_criacao
        `
    },

    async findById(id: number): Promise<Ticket | null> {
        const ticket = await sql<Ticket[]>`
            SELECT id, retiro_id, aberto_por, categoria, localizacao, status, atribuido_a, aprovado_por, descricao, prioridade, data_criacao, data_realizado, sincronizado
            FROM ticket
            WHERE id = ${id}
            LIMIT 1
        `

        return ticket[0] ?? null
    },

    async create(input: TicketInput): Promise<Ticket> {
        const [created] = await sql<Ticket[]>`
            INSERT INTO ticket (retiro_id, aberto_por, categoria, localizacao, status, atribuido_a, aprovado_por, descricao, prioridade, data_criacao, data_realizado, sincronizado)
            VALUES (
                ${input.retiro_id},
                ${input.aberto_por},
                ${input.categoria},
                ${input.localizacao},
                ${input.status},
                ${input.atribuido_a},
                ${input.aprovado_por ?? null},
                ${input.descricao},
                ${input.prioridade},
                ${input.data_criacao ?? new Date()},
                ${input.data_realizado ?? new Date()},
                ${input.sincronizado ?? false}
            )
            RETURNING id, retiro_id, aberto_por, categoria, localizacao, status, atribuido_a, aprovado_por, descricao, prioridade, data_criacao, data_realizado, sincronizado
        `
        return created
    },

    async update(id: number, input: Partial<TicketInput>): Promise<Ticket | null> {
        const updated = await sql<Ticket[]>`
            UPDATE ticket
            SET
            retiro_id = COALESCE(${input.retiro_id ?? null}, retiro_id),
            aberto_por = COALESCE(${input.aberto_por ?? null}, aberto_por),
            categoria = COALESCE(${input.categoria ?? null}, categoria),
            localizacao = COALESCE(${input.localizacao ?? null}, localizacao),
            status = COALESCE(${input.status ?? null}, status),
            atribuido_a = COALESCE(${input.atribuido_a ?? null}, atribuido_a),
            aprovado_por = COALESCE(${input.aprovado_por ?? null}, aprovado_por),
            descricao = COALESCE(${input.descricao ?? null}, descricao),
            prioridade = COALESCE(${input.prioridade ?? null}, prioridade),
            data_criacao = COALESCE(${input.data_criacao ?? null}, data_criacao),
            data_realizado = COALESCE(${input.data_realizado ?? null}, data_realizado),
            sincronizado = COALESCE(${input.sincronizado ?? null}, sincronizado)
            WHERE id = ${id}
            RETURNING id, retiro_id, aberto_por, categoria, localizacao, status, atribuido_a, aprovado_por, descricao, prioridade, data_criacao, data_realizado, sincronizado
        `
        return updated[0] ?? null
    }
}
