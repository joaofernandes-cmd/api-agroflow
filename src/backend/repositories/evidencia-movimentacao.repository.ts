import sql from '../database/connection'
import { EvidenciaMovimentacao, EvidenciaMovimentacaoInput } from '../models/evidencia-movimentacao.model'
import { EvidenciaDetalhada } from '../models/evidencia.model'
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
    },

    async buscarEvidenciasDaMovimentacao(movimentacao_id: UUID): Promise<EvidenciaDetalhada[]> {
        return sql<EvidenciaDetalhada[]>`
            SELECT
                e.id, e.usuario_id, e.tipo, e.data_criacao,
                COALESCE(f.url_arquivo, a.url_arquivo) AS url_arquivo,
                f.latitude, f.longitude,
                m.conteudo
            FROM evidencia_movimentacao em
            JOIN evidencia e ON e.id = em.evidencia_id
            LEFT JOIN evidencia_foto f ON f.evidencia_id = e.id
            LEFT JOIN evidencia_audio a ON a.evidencia_id = e.id
            LEFT JOIN evidencia_mensagem m ON m.evidencia_id = e.id
            WHERE em.movimentacao_id = ${movimentacao_id}
            ORDER BY e.data_criacao
        `
    },
}
