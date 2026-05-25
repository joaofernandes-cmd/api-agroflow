import { pool } from '../database/connection'

export type EvidenciaInput =
  | { tipo: 'mensagem'; conteudo: string }
  | { tipo: 'audio'; url_arquivo: string; duracao_segundos: number }
  | {
      tipo: 'foto'
      url_arquivo: string
      latitude: number
      longitude: number
    }

export interface AbrirTicketInput {
  retiro_id: string
  aberto_por: string
  categoria: string
  localizacao: string
  atribuido_a: string
  descricao: string
  evidencias: EvidenciaInput[]
}

export class TicketRepository {
  async save(data: AbrirTicketInput) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const dataCriacao = new Date()

      const ticketResult = await client.query(
        `INSERT INTO ticket (
           retiro_id, aberto_por, categoria, localizacao, status,
           atribuido_a, descricao, data_criacao, data_realizado
         ) VALUES ($1, $2, $3, $4, 'aberto', $5, $6, $7, $7)
         RETURNING *`,
        [
          data.retiro_id,
          data.aberto_por,
          data.categoria,
          data.localizacao,
          data.atribuido_a,
          data.descricao,
          dataCriacao,
        ]
      )
      const ticket = ticketResult.rows[0]

      for (const ev of data.evidencias) {
        const evResult = await client.query(
          `INSERT INTO evidencia (usuario_id, tipo, data_criacao)
           VALUES ($1, $2, $3) RETURNING id`,
          [data.aberto_por, ev.tipo, dataCriacao]
        )
        const evidenciaId = evResult.rows[0].id

        if (ev.tipo === 'mensagem') {
          await client.query(
            `INSERT INTO evidencia_mensagem (evidencia_id, conteudo)
             VALUES ($1, $2)`,
            [evidenciaId, ev.conteudo]
          )
        } else if (ev.tipo === 'audio') {
          await client.query(
            `INSERT INTO evidencia_audio (evidencia_id, url_arquivo)
             VALUES ($1, $2)`,
            [evidenciaId, ev.url_arquivo]
          )
        } else if (ev.tipo === 'foto') {
          await client.query(
            `INSERT INTO evidencia_foto (evidencia_id, url_arquivo, latitude, longitude)
             VALUES ($1, $2, $3, $4)`,
            [evidenciaId, ev.url_arquivo, ev.latitude, ev.longitude]
          )
        }

        await client.query(
          `INSERT INTO evidencia_ticket (evidencia_id, ticket_id)
           VALUES ($1, $2)`,
          [evidenciaId, ticket.id]
        )
      }

      await client.query('COMMIT')
      return ticket
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
}
