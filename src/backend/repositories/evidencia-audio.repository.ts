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

    // Busca uma evidência de áudio pelo id da evidência e retorna null se não encontrar
    async findById(evidencia_id: number): Promise<EvidenciaAudio | null> {
        const evidenciaAudio = await sql<EvidenciaAudio[]>`
            SELECT evidencia_id, url_arquivo
            FROM evidencia_audio
            WHERE evidencia_id = ${evidencia_id}
            LIMIT 1
        `

        return evidenciaAudio[0] ?? null
    },

    // Cria uma nova evidência de áudio no banco de dados
    async create(input: EvidenciaAudioInput): Promise<EvidenciaAudio> {
        const [created] = await sql<EvidenciaAudio[]>`
            INSERT INTO evidencia_audio (evidencia_id, url_arquivo)
            VALUES (${input.evidencia_id}, ${input.url_arquivo})
            RETURNING evidencia_id, url_arquivo
        `

        return created
    },

    // Atualiza uma evidência de áudio existente
    async update(evidencia_id: number, input: Partial<EvidenciaAudioInput>): Promise<EvidenciaAudio | null> {
        const [updated] = await sql<EvidenciaAudio[]>`
            UPDATE evidencia_audio
            SET
                url_arquivo = COALESCE(${input.url_arquivo ?? null}, url_arquivo)
            WHERE evidencia_id = ${evidencia_id}
            RETURNING evidencia_id, url_arquivo
        `

        return updated ?? null
    },

    // Remove uma evidência de áudio pelo id da evidência 
    async delete(evidencia_id: number): Promise<void> {
        await sql`
            DELETE FROM evidencia_audio
            WHERE evidencia_id = ${evidencia_id}
        `
    }
}
