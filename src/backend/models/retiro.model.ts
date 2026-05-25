import { pool } from '../database/connection'
import { randomUUID } from 'crypto'

export interface Retiro {
  id: string
  nome: string
}

export interface RetiroInput {
  nome: string
}

export class RetiroModel {
  async findAll(): Promise<Retiro[]> {
    const result = await pool.query('SELECT * FROM retiro ORDER BY nome')
    return result.rows as Retiro[]
  }

  async findById(id: string): Promise<Retiro | null> {
    const result = await pool.query('SELECT * FROM retiro WHERE id = $1', [id])
    return (result.rows[0] as Retiro) ?? null
  }

  async create(data: RetiroInput): Promise<Retiro> {
    const id = randomUUID()
    const result = await pool.query(
      'INSERT INTO retiro (id, nome) VALUES ($1, $2) RETURNING *',
      [id, data.nome]
    )
    return result.rows[0] as Retiro
  }

  async update(id: string, data: RetiroInput): Promise<Retiro | null> {
    const result = await pool.query(
      'UPDATE retiro SET nome = $1 WHERE id = $2 RETURNING *',
      [data.nome, id]
    )
    return (result.rows[0] as Retiro) ?? null
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM retiro WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  }
}
