import sql from '../database/connection' 
import { randomUUID } from 'crypto'
import { Ticket, TicketInput } from '../models/ticket.model' 

// Retorna todos os tickets cadastrados
export const TicketRepository = {

    // Ordena tickets por data de criação
    async findAll(): Promise<Ticket[]> {
        return sql<Ticket[]>`
            SELECT id, retiro_id, aberto_por, categoria, localizacao, status, atribuido_a, descricao, prioridade, data_criacao, data_realizado
            FROM ticket
            ORDER BY data_criacao
        `
    },

    // Busca um ticket pelo seu id e retorna null se não encontrar
    async findById(id: string): Promise<Ticket | null> {
        const ticket = await sql<Ticket[]>`
            SELECT id, retiro_id, aberto_por, categoria, localizacao, status, atribuido_a, descricao, prioridade, data_criacao, data_realizado
            FROM ticket
            WHERE id = ${id}
            LIMIT 1
        `

        return ticket[0] ?? null
    },

    // Cria um novo ticket no banco de dados
    async create(input: TicketInput): Promise<Ticket> {
        // Retorna o ticket criado, incluindo o id gerado pelo banco de dados
        const [created] = await sql<Ticket[]>`
            INSERT INTO ticket (id, retiro_id, aberto_por, categoria, localizacao, status, atribuido_a, descricao, prioridade, data_criacao, data_realizado)
            VALUES (
                ${randomUUID()},
                ${input.retiro_id},
                ${input.aberto_por},
                ${input.categoria},
                ${input.localizacao},
                ${input.status},
                ${input.atribuido_a},
                ${input.descricao},
                ${input.prioridade},
                ${input.data_criacao ?? new Date()},
                ${input.data_realizado ?? new Date()}
            )
            RETURNING id, retiro_id, aberto_por, categoria, localizacao, status, atribuido_a, descricao, prioridade, data_criacao, data_realizado
        `
        return created
    },

    // Atualiza os dados de um ticket existente
    // Campos não enviados permanecem com os valores atuais
    async update(id: string, input: Partial<TicketInput>): Promise<Ticket | null> {
        const updated = await sql<Ticket[]>`
            UPDATE ticket
            SET
            retiro_id = COALESCE(${input.retiro_id ?? null}, retiro_id),
            aberto_por = COALESCE(${input.aberto_por ?? null}, aberto_por),
            categoria = COALESCE(${input.categoria ?? null}, categoria),
            localizacao = COALESCE(${input.localizacao ?? null}, localizacao),
            status = COALESCE(${input.status ?? null}, status),
            atribuido_a = COALESCE(${input.atribuido_a ?? null}, atribuido_a),
            descricao = COALESCE(${input.descricao ?? null}, descricao),
            prioridade = COALESCE(${input.prioridade ?? null}, prioridade),
            data_criacao = COALESCE(${input.data_criacao ?? null}, data_criacao),
            data_realizado = COALESCE(${input.data_realizado ?? null}, data_realizado)
            WHERE id = ${id}
            RETURNING id, retiro_id, aberto_por, categoria, localizacao, status, atribuido_a, descricao, prioridade, data_criacao, data_realizado
        `
        return updated[0] ?? null
    }
}
