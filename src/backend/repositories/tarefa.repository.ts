import sql from '../database/connection'
import { Tarefa, TarefaInput } from '../models/tarefa.model'

// Retorna todas as tarefas cadastradas
export const TarefaRepository = {

    // Ordena tarefas por data de criação
    async findAll(): Promise<Tarefa[]> {
        return sql<Tarefa[]>`
            SELECT id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, status, data_criacao, sincronizado
            FROM tarefa
            ORDER BY data_criacao
        `
    },

    // Busca uma tarefa pelo seu id e retorna null se não encontrar
    async findById(id: number): Promise<Tarefa | null> {
        const tarefa = await sql<Tarefa[]>`
            SELECT id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, data_criacao, status, sincronizado
            FROM tarefa
            WHERE id = ${id}
            LIMIT 1
        `   

        return tarefa[0] ?? null
    },

    // Cria uma nova tarefa no banco de dados
    async create(input: TarefaInput): Promise<Tarefa> {
        const [created] = await sql<Tarefa[]>`
            INSERT INTO tarefa (retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, data_criacao, status, sincronizado)
            VALUES (
                ${input.retiro_id},
                ${input.criada_por},
                ${input.atribuida_a},
                ${input.descricao},
                ${input.categoria},
                ${input.prioridade},
                ${input.data_criacao ?? new Date()},
                ${input.status},
                ${input.sincronizado ?? false}
            )
            RETURNING id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, data_criacao, status, sincronizado
        `

        return created
    },

    // Atualiza uma tarefa existente no banco de dados
    async update(id: number, input: Partial<TarefaInput>): Promise<Tarefa | null> {
        const [updated] = await sql<Tarefa[]>`
            UPDATE tarefa
            SET
            retiro_id = COALESCE(${input.retiro_id ?? null}, retiro_id),
            criada_por = COALESCE(${input.criada_por ?? null}, criada_por),
            atribuida_a = COALESCE(${input.atribuida_a ?? null}, atribuida_a),
            categoria = COALESCE(${input.categoria ?? null}, categoria),
            prioridade = COALESCE(${input.prioridade ?? null}, prioridade),
            descricao = COALESCE(${input.descricao ?? null}, descricao),
            data_criacao = COALESCE(${input.data_criacao ?? null}, data_criacao),
            status = COALESCE(${input.status ?? null}, status),
            sincronizado = COALESCE(${input.sincronizado ?? null}, sincronizado)
            WHERE id = ${id}
            RETURNING id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, data_criacao, status, sincronizado
        `

        return updated ?? null
    }, 

    // Exclui uma tarefa do banco de dados
    async delete(id: number): Promise<void> {
        await sql`
            DELETE FROM tarefa
            WHERE id = ${id}
        `
    }   
}
