import sql from '../database/connection'
import { EvidenciaMensagem, EvidenciaMensagemInput } from '../models/evidencia-mensagem.model'

// Retorna todas as evidencias de mensagem cadastradas
export const EvidenciaMensagemRepository = {

    // Ordena evidencias de mensagem por evidencia
    async findAll(): Promise<EvidenciaMensagem[]> {
        return sql<EvidenciaMensagem[]>`
            SELECT evidencia_id, conteudo
            FROM evidencia_mensagem
            ORDER BY evidencia_id
        `
    },

    // Busca uma evidencia de mensagem pelo id da evidencia e retorna null se nao encontrar
    async findById(evidencia_id: string): Promise<EvidenciaMensagem | null> {
        const evidenciaMensagem = await sql<EvidenciaMensagem[]>`
            SELECT evidencia_id, conteudo
            FROM evidencia_mensagem
            WHERE evidencia_id = ${evidencia_id}
            LIMIT 1
        `

        return evidenciaMensagem[0] ?? null
    },

    // Cria uma nova evidencia de mensagem no banco de dados
    async create(input: EvidenciaMensagemInput): Promise<EvidenciaMensagem> {
        const [created] = await sql<EvidenciaMensagem[]>`
            INSERT INTO evidencia_mensagem (evidencia_id, conteudo)
            VALUES (${input.evidencia_id}, ${input.conteudo})
            RETURNING evidencia_id, conteudo
        `

        return created
    },

    // Atualiza uma evidencia de mensagem existente
    async update(evidencia_id: string, input: Partial<EvidenciaMensagemInput>): Promise<EvidenciaMensagem | null> {
        const [updated] = await sql<EvidenciaMensagem[]>`
            UPDATE evidencia_mensagem
            SET
                conteudo = COALESCE(${input.conteudo ?? null}, conteudo)
            WHERE evidencia_id = ${evidencia_id}
            RETURNING evidencia_id, conteudo
        `

        return updated ?? null
    },

    // Remove uma evidencia de mensagem pelo id da evidencia
    async delete(evidencia_id: string): Promise<void> {
        await sql`
            DELETE FROM evidencia_mensagem
            WHERE evidencia_id = ${evidencia_id}
        `
    }
}
