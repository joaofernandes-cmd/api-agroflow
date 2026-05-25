import sql from '../database/connection'
import { randomUUID } from 'crypto'
import { Tarefa, TarefaInput } from '../models/tarefa.model'

// Retorna todas as tarefas cadastradas
export const TarefaRepository = {

    // Ordena tarefas por data de criação
    async findAll(): Promise<Tarefa[]> {
        return sql<Tarefa[]>`
            SELECT id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, status, data_criacao
            FROM tarefa
            ORDER BY data_criacao
        `
    },

    // Busca uma tarefa pelo seu id e retorna null se não encontrar.
    async findById(id: string): Promise<Tarefa | null> {
        const tarefa = await sql<Tarefa[]>`
            SELECT id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, data_criacao, status
            FROM tarefa
            WHERE id = ${id}
            LIMIT 1
        `   

        return tarefa[0] ?? null
    },

    // Cria uma nova tarefa no banco de dados      
    async create(data: TarefaInput): Promise<Tarefa> {  
        const [created] = await sql<Tarefa[]>`
            INSERT INTO tarefa (id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, data_criacao, status)
            VALUES (
                ${randomUUID()},
                ${data.retiro_id},
                ${data.criada_por},
                ${data.atribuida_a},
                ${data.descricao},
                ${data.categoria},
                ${data.prioridade},
                ${data.data_criacao},
                ${data.status}
            )
            RETURNING id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, data_criacao, status
        `   

        return created
    },

    // Atualiza uma tarefa existente no banco de dados
    async update(id: string, data: Partial<TarefaInput>): Promise<Tarefa | null> {
        const [updated] = await sql<Tarefa[]>`
            UPDATE tarefa
            SET
            retiro_id = COALESCE(${data.retiro_id ?? null}, retiro_id),
            criada_por = COALESCE(${data.criada_por ?? null}, criada_por),
            atribuida_a = COALESCE(${data.atribuida_a ?? null}, atribuida_a),
            categoria = COALESCE(${data.categoria ?? null}, categoria),
            prioridade = COALESCE(${data.prioridade ?? null}, prioridade),
            descricao = COALESCE(${data.descricao ?? null}, descricao),
            data_criacao = COALESCE(${data.data_criacao ?? null}, data_criacao),
            status = COALESCE(${data.status ?? null}, status)
            WHERE id = ${id}
            RETURNING id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, data_criacao, status
        `

        return updated ?? null
    }, 

    // Exclui uma tarefa do banco de dados
    async delete(id: string): Promise<void> {
        await sql`
            DELETE FROM tarefa
            WHERE id = ${id}
        `
    }   
}
