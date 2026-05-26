import sql from '../database/connection'
import { EvidenciaMovimentacao, EvidenciaMovimentacaoInput } from '../models/evidencia-movimentacao.model'

// Retorna todas as evidencias de movimentacoes cadastradas
export const EvidenciaMovimentacaoRepository = {

    // Ordena evidencias de movimentacoes por evidencia
    async findAll(): Promise<EvidenciaMovimentacao[]> {
        return sql<EvidenciaMovimentacao[]>`
            SELECT evidencia_id, movimentacao_id
            FROM evidencia_movimentacao
            ORDER BY evidencia_id
        `
    },

    // Busca uma evidencia de movimentacao pela chave composta e retorna null se nao encontrar
    async findById(evidencia_id: string, movimentacao_id: string): Promise<EvidenciaMovimentacao | null> {
        const evidenciaMovimentacao = await sql<EvidenciaMovimentacao[]>`
            SELECT evidencia_id, movimentacao_id
            FROM evidencia_movimentacao
            WHERE evidencia_id = ${evidencia_id} AND movimentacao_id = ${movimentacao_id}
            LIMIT 1
        `

        return evidenciaMovimentacao[0] ?? null
    },

    // Cria uma nova evidencia de movimentacao no banco de dados
    async create(input: EvidenciaMovimentacaoInput): Promise<EvidenciaMovimentacao> {
        const [created] = await sql<EvidenciaMovimentacao[]>`
            INSERT INTO evidencia_movimentacao (evidencia_id, movimentacao_id)
            VALUES (${input.evidencia_id}, ${input.movimentacao_id})
            RETURNING evidencia_id, movimentacao_id
        `

        return created
    }
}
