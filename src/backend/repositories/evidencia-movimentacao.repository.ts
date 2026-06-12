import sql from '../database/connection'
import { EvidenciaMovimentacao, EvidenciaMovimentacaoInput } from '../models/evidencia-movimentacao.model'
import { UUID } from '../models/uuid'

// Retorna todas as evidências de movimentações cadastradas
export const EvidenciaMovimentacaoRepository = {

    // Ordena evidências de movimentações por evidência
    async buscarTodos(): Promise<EvidenciaMovimentacao[]> {
        return sql<EvidenciaMovimentacao[]>`
            SELECT evidencia_id, movimentacao_id
            FROM evidencia_movimentacao
            ORDER BY evidencia_id
        `
    },

    // Busca uma evidência de movimentação pela chave composta e retorna null se não encontrar
    async buscarPorId(evidencia_id: UUID, movimentacao_id: UUID): Promise<EvidenciaMovimentacao | null> {
        const evidenciaMovimentacao = await sql<EvidenciaMovimentacao[]>`
            SELECT evidencia_id, movimentacao_id
            FROM evidencia_movimentacao
            WHERE evidencia_id = ${evidencia_id} AND movimentacao_id = ${movimentacao_id}
            LIMIT 1
        `

        return evidenciaMovimentacao[0] ?? null
    },

    // Cria uma nova evidência de movimentação no banco de dados
    async criar(input: EvidenciaMovimentacaoInput): Promise<EvidenciaMovimentacao> {
        const [created] = await sql<EvidenciaMovimentacao[]>`
            INSERT INTO evidencia_movimentacao (evidencia_id, movimentacao_id)
            VALUES (${input.evidencia_id}, ${input.movimentacao_id})
            RETURNING evidencia_id, movimentacao_id
        `

        return created
    }
}
