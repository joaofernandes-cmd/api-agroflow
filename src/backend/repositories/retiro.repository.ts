import sql from '../database/connection'
import { Retiro, RetiroInput } from '../models/retiro.model'

// Retorna todas os retiros cadastrados
export const RetiroRepository = {

    // Ordena retiros por data de criação
    async buscarTodos(): Promise<Retiro[]> {
        return sql<Retiro[]>`
            SELECT id, nome
            FROM retiro
            ORDER BY nome
        `
    },

    // Busca um retiro pelo seu id e retorna null se não encontrar
    async buscarPorId(id: number): Promise<Retiro | null> {
        const retiro = await sql<Retiro[]>`
            SELECT id, nome
            FROM retiro
            WHERE id = ${id}
            LIMIT 1
        `
        return retiro[0] ?? null
    },

    // Cria um novo retiro no banco de dados
    async criar(input: RetiroInput): Promise<Retiro> {
        const [created] = await sql<Retiro[]>`
            INSERT INTO retiro (nome)
            VALUES (${input.nome})
            RETURNING id, nome
        `
        return created
    },

    // Atualiza os dados de um retiro existente
    async atualizar(id: number, input: Partial<RetiroInput>): Promise<Retiro | null> {
        const updated = await sql<Retiro[]>`
            UPDATE retiro
            SET
                nome = COALESCE(${input.nome ?? null}, nome)
            WHERE id = ${id}
            RETURNING id, nome
        `
        return updated[0] ?? null
    }
}

