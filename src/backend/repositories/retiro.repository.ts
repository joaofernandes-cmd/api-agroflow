import { pool } from '../database/connection'

export class RetiroRepository {
  async findAll() {
    const result = await pool.query('SELECT * FROM retiro ORDER BY nome')
    return result.rows
  }

  async findById(id: string) {
    const result = await pool.query('SELECT * FROM retiro WHERE id = $1', [id])
    return result.rows[0] ?? null
  }

  async save(data: { nome: string }) {
    const result = await pool.query(
      'INSERT INTO retiro (nome) VALUES ($1) RETURNING *',
      [data.nome]
    )
    return result.rows[0]
  }
}
