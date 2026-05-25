import request from 'supertest'
import app from '../app'
import { pool } from '../database/connection'

// Este arquivo concentra todas as verificações de persistência no banco
// para o fluxo "abrir" — tanto a abertura de retiro (GET /retiros/:id)
// quanto a abertura de ticket (POST /tickets). O foco é confirmar que
// os dados realmente foram gravados/lidos do banco, independentemente
// do contrato HTTP (que vive nos arquivos .sucesso.spec.ts).

afterAll(async () => {
  await pool.end()
})

describe('GET /retiros/:id - abrir - persistência no banco', () => {
  let retiroId: string

  beforeEach(async () => {
    const result = await pool.query(
      'INSERT INTO retiro (nome) VALUES ($1) RETURNING id',
      ['Retiro Persistencia Abrir']
    )
    retiroId = result.rows[0].id
  })

  it('deve recuperar o retiro persistido no banco com os campos corretos', async () => {
    const res = await request(app).get(`/retiros/${retiroId}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      id: retiroId,
      nome: 'Retiro Persistencia Abrir',
    })

    // Verificação direta no banco: a linha realmente está lá.
    const retiroDb = await pool.query(
      'SELECT id, nome FROM retiro WHERE id = $1',
      [retiroId]
    )
    expect(retiroDb.rows.length).toBe(1)
    expect(retiroDb.rows[0]).toEqual({
      id: retiroId,
      nome: 'Retiro Persistencia Abrir',
    })
  })

  it('deve retornar 404 quando o id não está persistido no banco', async () => {
    const idInexistente = '00000000-0000-0000-0000-000000000000'

    const res = await request(app).get(`/retiros/${idInexistente}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ message: 'Retiro não encontrado' })

    // Confirmação: o id de fato não existe no banco.
    const retiroDb = await pool.query(
      'SELECT id FROM retiro WHERE id = $1',
      [idInexistente]
    )
    expect(retiroDb.rows.length).toBe(0)
  })
})

// Diagrama Sequencial RF008 (Figura 17 do WAD) - passos 4 e 5:
//   4. O ServicoTicket aciona o RepositorioTicket, que persiste o
//      ticket e suas evidências no banco.
//   5. O banco retorna o identificador do ticket criado.
describe('POST /tickets - abrir - persistência no banco', () => {
  let retiroId: string
  let capatazId: string
  let supervisorId: string

  beforeAll(async () => {
    const retiroResult = await pool.query(
      'INSERT INTO retiro (nome) VALUES ($1) RETURNING id',
      ['Retiro Persistencia Ticket']
    )
    retiroId = retiroResult.rows[0].id

    const suffix = Date.now()

    const capatazResult = await pool.query(
      `INSERT INTO usuario
         (retiro_id, nome, login, senha_hash, status, data_criacao, cargo)
       VALUES ($1, $2, $3, $4, 'ativo', NOW(), 'capataz')
       RETURNING id`,
      [retiroId, 'Capataz Persistencia', `capataz-persist-${suffix}`, 'hash-fake']
    )
    capatazId = capatazResult.rows[0].id

    const supervisorResult = await pool.query(
      `INSERT INTO usuario
         (retiro_id, nome, login, senha_hash, status, data_criacao, cargo)
       VALUES ($1, $2, $3, $4, 'ativo', NOW(), 'supervisor')
       RETURNING id`,
      [retiroId, 'Supervisor Persistencia', `supervisor-persist-${suffix}`, 'hash-fake']
    )
    supervisorId = supervisorResult.rows[0].id
  })

  it('deve gravar o ticket na tabela ticket com os campos corretos', async () => {
    const res = await request(app)
      .post('/tickets')
      .send({
        retiro_id: retiroId,
        aberto_por: capatazId,
        categoria: 'cerca',
        localizacao: 'Norte do retiro',
        atribuido_a: supervisorId,
        descricao: 'Cerca quebrada na divisa norte',
        evidencias: [
          { tipo: 'mensagem', conteudo: 'descrição detalhada do problema' },
        ],
      })

    const ticketId = res.body.id

    const ticketDb = await pool.query('SELECT * FROM ticket WHERE id = $1', [
      ticketId,
    ])
    expect(ticketDb.rows.length).toBe(1)
    expect(ticketDb.rows[0].descricao).toBe('Cerca quebrada na divisa norte')
    expect(ticketDb.rows[0].retiro_id).toBe(retiroId)
    expect(ticketDb.rows[0].aberto_por).toBe(capatazId)
    expect(ticketDb.rows[0].atribuido_a).toBe(supervisorId)
    expect(ticketDb.rows[0].status).toBe('aberto')
  })

  it('deve gravar a evidência de mensagem associada ao ticket via evidencia_ticket', async () => {
    const res = await request(app)
      .post('/tickets')
      .send({
        retiro_id: retiroId,
        aberto_por: capatazId,
        categoria: 'cerca',
        localizacao: 'Sul do retiro',
        atribuido_a: supervisorId,
        descricao: 'Outro problema de cerca',
        evidencias: [
          { tipo: 'mensagem', conteudo: 'mensagem com conteúdo válido' },
        ],
      })

    const ticketId = res.body.id

    const evidenciaDb = await pool.query(
      `SELECT e.tipo, em.conteudo
         FROM evidencia_ticket et
         JOIN evidencia e            ON e.id = et.evidencia_id
         JOIN evidencia_mensagem em  ON em.evidencia_id = e.id
        WHERE et.ticket_id = $1`,
      [ticketId]
    )
    expect(evidenciaDb.rows.length).toBe(1)
    expect(evidenciaDb.rows[0]).toEqual({
      tipo: 'mensagem',
      conteudo: 'mensagem com conteúdo válido',
    })
  })
})
