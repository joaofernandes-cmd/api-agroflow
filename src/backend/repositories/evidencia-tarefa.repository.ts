import sql from '../database/connection'
import { EvidenciaTarefa, EvidenciaTarefaInput } from '../models/evidencia-tarefa.model'

// Retorna todas as evidencias de tarefas cadastradas
export const EvidenciaTarefaRepository = {

    // Ordena evidencias de tarefas por evidencia
    async findAll(): Promise<EvidenciaTarefa[]> {
        return sql<EvidenciaTarefa[]>`
            SELECT evidencia_id, tarefa_id
            FROM evidencia_tarefa
            ORDER BY evidencia_id
        `
    },

    // Busca uma evidencia de tarefa pela chave composta e retorna null se nao encontrar
    async findById(evidencia_id: string, tarefa_id: string): Promise<EvidenciaTarefa | null> {
        const evidenciaTarefa = await sql<EvidenciaTarefa[]>`
            SELECT evidencia_id, tarefa_id
            FROM evidencia_tarefa
            WHERE evidencia_id = ${evidencia_id} AND tarefa_id = ${tarefa_id}
            LIMIT 1
        `

        return evidenciaTarefa[0] ?? null
    },

    // Cria uma nova evidencia de tarefa no banco de dados
    async create(input: EvidenciaTarefaInput): Promise<EvidenciaTarefa> {
        const [created] = await sql<EvidenciaTarefa[]>`
            INSERT INTO evidencia_tarefa (evidencia_id, tarefa_id)
            VALUES (${input.evidencia_id}, ${input.tarefa_id})
            RETURNING evidencia_id, tarefa_id
        `

        return created
    }
}
