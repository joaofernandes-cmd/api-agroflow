import sql from '../database/connection'
import { Movimentacao, MovimentacaoInput } from '../models/movimentacao.model'

// Retorna todas as movimentações cadastradas
export const MovimentacaoRepository = {

  // Ordena movimentações por data de criação
  async findAll(): Promise<Movimentacao[]> {
    return sql<Movimentacao[]>`
      SELECT id, retiro_id, capataz_id, validado_por, tipo, origem, destino, quantidade, status, sincronizado, data_criacao, causa_obito, estagio_vida, motivo_rejeicao
      FROM movimentacao
      ORDER BY data_criacao
    `
  },

  // Busca uma movimentação pelo seu id e retorna null se não encontrar
  async findById(id: number): Promise<Movimentacao | null> {
    const movimentacao = await sql<Movimentacao[]>`
      SELECT id, retiro_id, capataz_id, validado_por, tipo, origem, destino, quantidade, status, sincronizado, data_criacao, causa_obito, estagio_vida, motivo_rejeicao
      FROM movimentacao
      WHERE id = ${id}
      LIMIT 1
    `

    return movimentacao[0] ?? null
  },

  // Cria uma nova movimentação no banco de dados
  async create(input: MovimentacaoInput): Promise<Movimentacao> {
    const [created] = await sql<Movimentacao[]>`
      INSERT INTO movimentacao (retiro_id, capataz_id, validado_por, tipo, origem, destino, quantidade, status, sincronizado, data_criacao, causa_obito, estagio_vida, motivo_rejeicao)
      VALUES (
        ${input.retiro_id},
        ${input.capataz_id},
        ${input.validado_por},
        ${input.tipo},
        ${input.origem ?? null},
        ${input.destino ?? null},
        ${input.quantidade},
        ${input.status},
        ${input.sincronizado ?? false},
        ${input.data_criacao ?? new Date()},
        ${input.causa_obito ?? null},
        ${input.estagio_vida},
        ${input.motivo_rejeicao ?? null}
      )
      RETURNING id, retiro_id, capataz_id, validado_por, tipo, origem, destino, quantidade, status, sincronizado, data_criacao, causa_obito, estagio_vida, motivo_rejeicao
    `

    return created
  },

  // Atualiza uma movimentação existente
  async update(id: number, input: Partial<MovimentacaoInput>): Promise<Movimentacao | null> {
    const [updated] = await sql<Movimentacao[]>`
      UPDATE movimentacao
      SET
        retiro_id = COALESCE(${input.retiro_id ?? null}, retiro_id),
        capataz_id = COALESCE(${input.capataz_id ?? null}, capataz_id),
        validado_por = COALESCE(${input.validado_por ?? null}, validado_por),
        tipo = COALESCE(${input.tipo ?? null}, tipo),
        origem = COALESCE(${input.origem ?? null}, origem),
        destino = COALESCE(${input.destino ?? null}, destino),
        quantidade = COALESCE(${input.quantidade ?? null}, quantidade),
        status = COALESCE(${input.status ?? null}, status),
        sincronizado = COALESCE(${input.sincronizado ?? null}, sincronizado),
        data_criacao = COALESCE(${input.data_criacao ?? null}, data_criacao),
        causa_obito = COALESCE(${input.causa_obito ?? null}, causa_obito),
        estagio_vida = COALESCE(${input.estagio_vida ?? null}, estagio_vida),
        motivo_rejeicao = COALESCE(${input.motivo_rejeicao ?? null}, motivo_rejeicao)
      WHERE id = ${id}
      RETURNING id, retiro_id, capataz_id, validado_por, tipo, origem, destino, quantidade, status, sincronizado, data_criacao, causa_obito, estagio_vida, motivo_rejeicao
    `

    return updated ?? null
  },

  // Remove uma movimentação pelo id
  async delete(id: number): Promise<void> {
    await sql`
      DELETE FROM movimentacao
      WHERE id = ${id}
    `
  }
}
