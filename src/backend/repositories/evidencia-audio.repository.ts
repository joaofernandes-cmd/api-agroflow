import sql from '../database/connection'
import { EvidenciaAudio, EvidenciaAudioInput } from '../models/evidencia-audio.model'

// Retorna todas as evidencias de audio cadastradas
export const EvidenciaAudioRepository = {

    // Ordena evidencias de audio por evidencia
    async findAll(): Promise<EvidenciaAudio[]> {
        return sql<EvidenciaAudio[]>`
            SELECT evidencia_id, url_arquivo
            FROM evidencia_audio
            ORDER BY evidencia_id
        `
    },

    // Busca uma evidencia de audio pelo id da evidencia e retorna null se nao encontrar
    async findById(evidencia_id: string): Promise<EvidenciaAudio | null> {
        const evidenciaAudio = await sql<EvidenciaAudio[]>`
            SELECT evidencia_id, url_arquivo
            FROM evidencia_audio
            WHERE evidencia_id = ${evidencia_id}
            LIMIT 1
        `

        return evidenciaAudio[0] ?? null
    },

    // Cria uma nova evidencia de audio no banco de dados
    async create(input: EvidenciaAudioInput): Promise<EvidenciaAudio> {
        const [created] = await sql<EvidenciaAudio[]>`
            INSERT INTO evidencia_audio (evidencia_id, url_arquivo)
            VALUES (${input.evidencia_id}, ${input.url_arquivo})
            RETURNING evidencia_id, url_arquivo
        `

        return created
    },

    // Atualiza uma evidencia de audio existente
    async update(evidencia_id: string, input: Partial<EvidenciaAudioInput>): Promise<EvidenciaAudio | null> {
        const [updated] = await sql<EvidenciaAudio[]>`
            UPDATE evidencia_audio
            SET
                url_arquivo = COALESCE(${input.url_arquivo ?? null}, url_arquivo)
            WHERE evidencia_id = ${evidencia_id}
            RETURNING evidencia_id, url_arquivo
        `

        return updated ?? null
    },

    // Remove uma evidencia de audio pelo id da evidencia
    async delete(evidencia_id: string): Promise<void> {
        await sql`
            DELETE FROM evidencia_audio
            WHERE evidencia_id = ${evidencia_id}
        `
    }
}
