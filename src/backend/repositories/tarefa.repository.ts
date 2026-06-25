import sql from '../database/connection'
import { Tarefa, TarefaInput } from '../models/tarefa.model'
import { UUID } from '../models/uuid'

export const TarefaRepository = {

    async buscarTodos(): Promise<Tarefa[]> {
        return sql<Tarefa[]>`
            SELECT id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, status, aprovado_por, data_criacao, sincronizado
            FROM tarefa
            ORDER BY data_criacao
        `
    },

    async buscarPorId(id: UUID): Promise<Tarefa | null> {
        const tarefa = await sql<Tarefa[]>`
            SELECT id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, data_criacao, status, aprovado_por, sincronizado
            FROM tarefa
            WHERE id = ${id}
            LIMIT 1
        `

        return tarefa[0] ?? null
    },

    async criar(input: TarefaInput): Promise<Tarefa> {
        const [created] = await sql<Tarefa[]>`
            INSERT INTO tarefa (id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, data_criacao, status, aprovado_por, sincronizado)
            VALUES (
                COALESCE(${input.id ?? null}::uuid, gen_random_uuid()),
                ${input.retiro_id},
                ${input.criada_por},
                ${input.atribuida_a},
                ${input.descricao},
                ${input.categoria},
                ${input.prioridade},
                ${input.data_criacao ?? new Date()},
                ${input.status},
                ${input.aprovado_por ?? null},
                ${input.sincronizado ?? false}
            )
            ON CONFLICT (id) DO UPDATE SET
                retiro_id = EXCLUDED.retiro_id,
                criada_por = EXCLUDED.criada_por,
                atribuida_a = EXCLUDED.atribuida_a,
                descricao = EXCLUDED.descricao,
                categoria = EXCLUDED.categoria,
                prioridade = EXCLUDED.prioridade,
                data_criacao = EXCLUDED.data_criacao,
                status = EXCLUDED.status,
                aprovado_por = EXCLUDED.aprovado_por,
                sincronizado = EXCLUDED.sincronizado
            RETURNING id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, data_criacao, status, aprovado_por, sincronizado
        `

        return created
    },

    async atualizar(id: UUID, input: Partial<TarefaInput>): Promise<Tarefa | null> {
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
            aprovado_por = COALESCE(${input.aprovado_por ?? null}, aprovado_por),
            sincronizado = COALESCE(${input.sincronizado ?? null}, sincronizado)
            WHERE id = ${id}
            RETURNING id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, data_criacao, status, aprovado_por, sincronizado
        `

        return updated ?? null
    },

    async remover(id: UUID): Promise<void> {
        await sql`
            DELETE FROM tarefa
            WHERE id = ${id}
        `
    }
}
