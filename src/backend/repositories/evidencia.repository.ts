import sql from '../database/connection'
import { randomUUID } from 'crypto'
import { Evidencia, EvidenciaInput } from '../models/evidencia.model'

// Retorna todas as evidencias cadastradas
export const EvidenciaRepository = {

  // Ordena evidencias por data de criacao
  async findAll(): Promise<Evidencia[]> {
    return sql<Evidencia[]>`
      SELECT id, usuario_id, tipo, data_criacao
      FROM evidencia
      ORDER BY data_criacao
    `
  },

  // Busca uma evidencia pelo seu id e retorna null se nao encontrar
  async findById(id: string): Promise<Evidencia | null> {
    const evidencia = await sql<Evidencia[]>`
      SELECT id, usuario_id, tipo, data_criacao
      FROM evidencia
      WHERE id = ${id}
      LIMIT 1
    `

    return evidencia[0] ?? null
  },

  // Cria uma nova evidencia no banco de dados
  async create(input: EvidenciaInput): Promise<Evidencia> {
    const [created] = await sql<Evidencia[]>`
      INSERT INTO evidencia (id, usuario_id, tipo, data_criacao)
      VALUES (
        ${randomUUID()},
        ${input.usuario_id},
        ${input.tipo},
        ${input.data_criacao ?? new Date()}
      )
      RETURNING id, usuario_id, tipo, data_criacao
    `

    return created
  },

  // Atualiza uma evidencia existente
  async update(id: string, input: Partial<EvidenciaInput>): Promise<Evidencia | null> {
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

  // Remove uma evidencia pelo id
  async delete(id: string): Promise<void> {
    await sql`
      DELETE FROM evidencia
      WHERE id = ${id}
    `
  }
}