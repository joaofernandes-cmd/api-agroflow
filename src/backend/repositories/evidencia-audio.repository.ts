import sql from '../database/connection'
import { EvidenciaAudio, EvidenciaAudioInput } from '../models/evidencia-audio.model'
import { UUID } from '../models/uuid'

// Retorna todas as evidencias de audio cadastradas
export const EvidenciaAudioRepository = {

    // Ordena evidencias de audio por evidencia
    async buscarTodos(): Promise<EvidenciaAudio[]> {
        return sql<EvidenciaAudio[]>`
            SELECT evidencia_id, url_arquivo
            FROM evidencia_audio
            ORDER BY evidencia_id
        `
    },

    // Busca uma evidência de áudio pelo id da evidência e retorna null se não encontrar
    async buscarPorId(evidencia_id: UUID): Promise<EvidenciaAudio | null> {
        const evidenciaAudio = await sql<EvidenciaAudio[]>`
            SELECT evidencia_id, url_arquivo
            FROM evidencia_audio
            WHERE evidencia_id = ${evidencia_id}
            LIMIT 1
        `

        return evidenciaAudio[0] ?? null
    },

    // Cria uma nova evidência de áudio no banco de dados
    async criar(input: EvidenciaAudioInput): Promise<EvidenciaAudio> {
        const [created] = await sql<EvidenciaAudio[]>`
            INSERT INTO evidencia_audio (evidencia_id, url_arquivo)
            VALUES (${input.evidencia_id}, ${input.url_arquivo})
            RETURNING evidencia_id, url_arquivo
        `

        return created
    },

    // Atualiza uma evidência de áudio existente
    async atualizar(evidencia_id: UUID, input: Partial<EvidenciaAudioInput>): Promise<EvidenciaAudio | null> {
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
    async remover(evidencia_id: UUID): Promise<void> {
        await sql`
            DELETE FROM evidencia_audio
            WHERE evidencia_id = ${evidencia_id}
        `
    }
}
