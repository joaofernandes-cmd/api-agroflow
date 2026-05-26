import sql from '../database/connection'
import { EvidenciaFoto, EvidenciaFotoInput } from '../models/evidencia-foto.model'

// Retorna todas as evidencias de foto cadastradas
export const EvidenciaFotoRepository = {

    // Ordena evidencias de foto por evidencia
    async findAll(): Promise<EvidenciaFoto[]> {
        return sql<EvidenciaFoto[]>`
            SELECT evidencia_id, url_arquivo, latitude, longitude
            FROM evidencia_foto
            ORDER BY evidencia_id
        `
    },

    // Busca uma evidencia de foto pelo id da evidencia e retorna null se nao encontrar
    async findById(evidencia_id: string): Promise<EvidenciaFoto | null> {
        const evidenciaFoto = await sql<EvidenciaFoto[]>`
            SELECT evidencia_id, url_arquivo, latitude, longitude
            FROM evidencia_foto
            WHERE evidencia_id = ${evidencia_id}
            LIMIT 1
        `

        return evidenciaFoto[0] ?? null
    },

    // Cria uma nova evidencia de foto no banco de dados
    async create(input: EvidenciaFotoInput): Promise<EvidenciaFoto> {
        const [created] = await sql<EvidenciaFoto[]>`
            INSERT INTO evidencia_foto (evidencia_id, url_arquivo, latitude, longitude)
            VALUES (${input.evidencia_id}, ${input.url_arquivo}, ${input.latitude}, ${input.longitude})
            RETURNING evidencia_id, url_arquivo, latitude, longitude
        `

        return created
    },

    // Atualiza uma evidencia de foto existente
    async update(evidencia_id: string, input: Partial<EvidenciaFotoInput>): Promise<EvidenciaFoto | null> {
        const [updated] = await sql<EvidenciaFoto[]>`
            UPDATE evidencia_foto
            SET
                url_arquivo = COALESCE(${input.url_arquivo ?? null}, url_arquivo),
                latitude = COALESCE(${input.latitude ?? null}, latitude),
                longitude = COALESCE(${input.longitude ?? null}, longitude)
            WHERE evidencia_id = ${evidencia_id}
            RETURNING evidencia_id, url_arquivo, latitude, longitude
        `

        return updated ?? null
    },

    // Remove uma evidencia de foto pelo id da evidencia
    async delete(evidencia_id: string): Promise<void> {
        await sql`
            DELETE FROM evidencia_foto
            WHERE evidencia_id = ${evidencia_id}
        `
    }
}
