import sql from '../database/connection'
import { Evidencia, EvidenciaInput } from '../models/evidencia.model'

// Retorna todas as evidências cadastradas
export const EvidenciaRepository = {

  // Ordena evidências por data de criação
  async buscarTodos(): Promise<Evidencia[]> {
    return sql<Evidencia[]>`
      SELECT id, usuario_id, tipo, data_criacao
      FROM evidencia
      ORDER BY data_criacao
    `
  },

  // Busca uma evidência pelo seu id e retorna null se não encontrar
  async buscarPorId(id: number): Promise<Evidencia | null> {
    const evidencia = await sql<Evidencia[]>`
      SELECT id, usuario_id, tipo, data_criacao
      FROM evidencia
      WHERE id = ${id}
      LIMIT 1
    `

    return evidencia[0] ?? null
  },

  // Cria uma nova evidência no banco de dados
  async criar(input: EvidenciaInput): Promise<Evidencia> {
    const [created] = await sql<Evidencia[]>`
      INSERT INTO evidencia (usuario_id, tipo, data_criacao)
      VALUES (
        ${input.usuario_id},
        ${input.tipo},
        ${input.data_criacao ?? new Date()}
      )
      RETURNING id, usuario_id, tipo, data_criacao
    `

    return created
  },

  // Atualiza uma evidência existente
  async atualizar(id: number, input: Partial<EvidenciaInput>): Promise<Evidencia | null> {
    const [updated] = await sql<Evidencia[]>`
      UPDATE evidencia
      SET
        usuario_id = COALESCE(${input.usuario_id ?? null}, usuario_id),
        tipo = COALESCE(${input.tipo ?? null}, tipo),
        data_criacao = COALESCE(${input.data_criacao ?? null}, data_criacao)
      WHERE id = ${id}
      RETURNING id, usuario_id, tipo, data_criacao
    `

    return updated ?? null
  },

  // Remove uma evidência pelo id
  async remover(id: number): Promise<void> {
    await sql`
      DELETE FROM evidencia
      WHERE id = ${id}
    `
  }
}
