import type { TransactionSql } from 'postgres'
import sql from '../database/connection'
import { Movimentacao, MovimentacaoInput } from '../models/movimentacao.model'

type Transaction = TransactionSql<{}>

const movimentacaoSelect = sql`
  SELECT
    m.id,
    m.retiro_id,
    m.capataz_id,
    m.validado_por,
    m.tipo,
    COALESCE(mt.origem, mn.origem, mm.origem) AS origem,
    mt.destino,
    COALESCE(mc.quantidade, mv.quantidade, mt.quantidade, mn.quantidade) AS quantidade,
    m.status,
    m.sincronizado,
    m.data_criacao,
    m.data_validacao,
    mm.causa_obito,
    m.estagio_vida
  FROM movimentacao m
  LEFT JOIN movimentacao_compra mc ON mc.movimentacao_id = m.id
  LEFT JOIN movimentacao_venda mv ON mv.movimentacao_id = m.id
  LEFT JOIN movimentacao_transferencia mt ON mt.movimentacao_id = m.id
  LEFT JOIN movimentacao_nascimento mn ON mn.movimentacao_id = m.id
  LEFT JOIN movimentacao_morte mm ON mm.movimentacao_id = m.id
`

export const MovimentacaoRepository = {
  async findAll(): Promise<Movimentacao[]> {
    return sql<Movimentacao[]>`
      ${movimentacaoSelect}
      ORDER BY m.data_criacao
    `
  },

  async findById(id: number): Promise<Movimentacao | null> {
    const movimentacao = await sql<Movimentacao[]>`
      ${movimentacaoSelect}
      WHERE m.id = ${id}
      LIMIT 1
    `

    return movimentacao[0] ?? null
  },

  async create(input: MovimentacaoInput): Promise<Movimentacao> {
    const createdId = await sql.begin(async transaction => {
      const [created] = await transaction<{ id: number }[]>`
        INSERT INTO movimentacao (
          retiro_id,
          capataz_id,
          validado_por,
          tipo,
          status,
          sincronizado,
          data_criacao,
          estagio_vida,
          data_validacao
        )
        VALUES (
          ${input.retiro_id},
          ${input.capataz_id},
          ${input.validado_por},
          ${input.tipo},
          ${input.status},
          ${input.sincronizado ?? false},
          ${input.data_criacao ?? new Date()},
          ${input.estagio_vida},
          ${input.data_validacao ?? null}
        )
        RETURNING id
      `

      await this.createDetalhes(transaction, created.id, input)

      return created.id
    })

    const movimentacao = await this.findById(createdId)
    if (!movimentacao) {
      throw new Error('Movimentacao criada, mas nao encontrada')
    }

    return movimentacao
  },

  async update(id: number, input: Partial<MovimentacaoInput>): Promise<Movimentacao | null> {
    const deveAtualizarDetalhes = this.deveAtualizarDetalhes(input)
    const movimentacaoAtual = deveAtualizarDetalhes ? await this.findById(id) : null

    if (deveAtualizarDetalhes && !movimentacaoAtual) {
      return null
    }

    const updatedId = await sql.begin(async transaction => {
      const [updated] = await transaction<{ id: number }[]>`
        UPDATE movimentacao
        SET
          retiro_id = COALESCE(${input.retiro_id ?? null}, retiro_id),
          capataz_id = COALESCE(${input.capataz_id ?? null}, capataz_id),
          validado_por = COALESCE(${input.validado_por ?? null}, validado_por),
          tipo = COALESCE(${input.tipo ?? null}, tipo),
          status = COALESCE(${input.status ?? null}, status),
          sincronizado = COALESCE(${input.sincronizado ?? null}, sincronizado),
          data_criacao = COALESCE(${input.data_criacao ?? null}, data_criacao),
          data_validacao = COALESCE(${input.data_validacao ?? null}, data_validacao),
          estagio_vida = COALESCE(${input.estagio_vida ?? null}, estagio_vida)
        WHERE id = ${id}
        RETURNING id
      `

      if (!updated) {
        return null
      }

      if (deveAtualizarDetalhes && movimentacaoAtual) {
        await this.replaceDetalhes(transaction, id, {
          ...movimentacaoAtual,
          ...input,
        } as MovimentacaoInput)
      }

      return updated.id
    })

    if (!updatedId) {
      return null
    }

    return this.findById(updatedId)
  },

  async delete(id: number): Promise<void> {
    await sql.begin(async transaction => {
      await this.deleteDetalhes(transaction, id)

      await transaction`
        DELETE FROM movimentacao
        WHERE id = ${id}
      `
    })
  },

  deveAtualizarDetalhes(input: Partial<MovimentacaoInput>): boolean {
    return Boolean(
      input.tipo ||
      input.origem !== undefined ||
      input.destino !== undefined ||
      input.quantidade !== undefined ||
      input.causa_obito !== undefined
    )
  },

  async createDetalhes(transaction: Transaction, movimentacaoId: number, input: MovimentacaoInput): Promise<void> {
    if (input.tipo === 'compra') {
      await transaction`
        INSERT INTO movimentacao_compra (movimentacao_id, quantidade)
        VALUES (${movimentacaoId}, ${input.quantidade ?? null})
      `
      return
    }

    if (input.tipo === 'venda') {
      await transaction`
        INSERT INTO movimentacao_venda (movimentacao_id, quantidade)
        VALUES (${movimentacaoId}, ${input.quantidade ?? null})
      `
      return
    }

    if (input.tipo === 'transferencia') {
      await transaction`
        INSERT INTO movimentacao_transferencia (movimentacao_id, origem, destino, quantidade)
        VALUES (${movimentacaoId}, ${input.origem ?? null}, ${input.destino ?? null}, ${input.quantidade ?? null})
      `
      return
    }

    if (input.tipo === 'nascimento') {
      await transaction`
        INSERT INTO movimentacao_nascimento (movimentacao_id, origem, quantidade)
        VALUES (${movimentacaoId}, ${input.origem ?? null}, ${input.quantidade ?? null})
      `
      return
    }

    if (input.tipo === 'morte') {
      await transaction`
        INSERT INTO movimentacao_morte (movimentacao_id, origem, causa_obito)
        VALUES (${movimentacaoId}, ${input.origem ?? null}, ${input.causa_obito ?? null})
      `
    }
  },

  async replaceDetalhes(transaction: Transaction, movimentacaoId: number, input: MovimentacaoInput): Promise<void> {
    await this.deleteDetalhes(transaction, movimentacaoId)
    await this.createDetalhes(transaction, movimentacaoId, input)
  },

  async deleteDetalhes(transaction: Transaction, movimentacaoId: number): Promise<void> {
    await transaction`DELETE FROM movimentacao_compra WHERE movimentacao_id = ${movimentacaoId}`
    await transaction`DELETE FROM movimentacao_venda WHERE movimentacao_id = ${movimentacaoId}`
    await transaction`DELETE FROM movimentacao_transferencia WHERE movimentacao_id = ${movimentacaoId}`
    await transaction`DELETE FROM movimentacao_nascimento WHERE movimentacao_id = ${movimentacaoId}`
    await transaction`DELETE FROM movimentacao_morte WHERE movimentacao_id = ${movimentacaoId}`
  },
}
