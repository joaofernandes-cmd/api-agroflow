import sql from '../database/connection'
import { EvidenciaTarefa, EvidenciaTarefaInput } from '../models/evidencia-tarefa.model'
import { EvidenciaDetalhada } from '../models/evidencia.model'
import { UUID } from '../models/uuid'

// Retorna todas as evidências de tarefas cadastradas
export const EvidenciaTarefaRepository = {

    // Ordena evidências de tarefas por evidência
    async buscarTodos(): Promise<EvidenciaTarefa[]> {
        return sql<EvidenciaTarefa[]>`
            SELECT evidencia_id, tarefa_id
            FROM evidencia_tarefa
            ORDER BY evidencia_id
        `
    },

    // Busca uma evidência de tarefa pela chave composta e retorna null se não encontrar
    async buscarPorId(evidencia_id: UUID, tarefa_id: UUID): Promise<EvidenciaTarefa | null> {
        const evidenciaTarefa = await sql<EvidenciaTarefa[]>`
            SELECT evidencia_id, tarefa_id
            FROM evidencia_tarefa
            WHERE evidencia_id = ${evidencia_id} AND tarefa_id = ${tarefa_id}
            LIMIT 1
        `

        return evidenciaTarefa[0] ?? null
    },

    // Cria uma nova evidência de tarefa no banco de dados
    async criar(input: EvidenciaTarefaInput): Promise<EvidenciaTarefa> {
        const [created] = await sql<EvidenciaTarefa[]>`
            INSERT INTO evidencia_tarefa (evidencia_id, tarefa_id)
            VALUES (${input.evidencia_id}, ${input.tarefa_id})
            RETURNING evidencia_id, tarefa_id
        `

        return created
    },

    // Lista as evidências de uma tarefa já com o detalhe de cada tipo
    // (foto/áudio = url_arquivo; foto = latitude/longitude; mensagem = conteudo),
    // numa única consulta, para o supervisor revisar
    async buscarEvidenciasDaTarefa(tarefa_id: UUID): Promise<EvidenciaDetalhada[]> {
        return sql<EvidenciaDetalhada[]>`
            SELECT
                e.id, e.usuario_id, e.tipo, e.data_criacao,
                COALESCE(f.url_arquivo, a.url_arquivo) AS url_arquivo,
                f.latitude, f.longitude,
                m.conteudo
            FROM evidencia_tarefa et
            JOIN evidencia e ON e.id = et.evidencia_id
            LEFT JOIN evidencia_foto f ON f.evidencia_id = e.id
            LEFT JOIN evidencia_audio a ON a.evidencia_id = e.id
            LEFT JOIN evidencia_mensagem m ON m.evidencia_id = e.id
            WHERE et.tarefa_id = ${tarefa_id}
            ORDER BY e.data_criacao
        `
    }
}
