import sql from '../database/connection'
import { EvidenciaTarefa, EvidenciaTarefaInput } from '../models/evidencia-tarefa.model'

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
    async buscarPorId(evidencia_id: number, tarefa_id: number): Promise<EvidenciaTarefa | null> {
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
    }
}
