import request from 'supertest'
import app from '../app'
import { pool } from '../database/connection'

// Diagrama Sequencial RF008 (Figura 17 do WAD) - fluxo principal:
//   1. Capataz envia POST /tickets para o ControladorTicket.
//   2. O controlador encaminha os dados ao ServicoTicket.
//   3. O ServicoTicket verifica que existe ao menos uma evidência
//      (mensagem, áudio ou imagem) associada ao chamado.
//   4. O ServicoTicket aciona o RepositorioTicket, que persiste o
//      ticket e suas evidências no banco.
//   5. O banco retorna o identificador do ticket criado.
//   6. O sistema responde com status 201 - Criado.
//
// Este arquivo cobre exclusivamente o contrato HTTP da resposta
// (status code e formato do body). A verificação de que os dados
// foram gravados no banco vive em abrir-ticket.persistencia.spec.ts.
describe('POST /tickets - abrir - sucesso (contrato HTTP)', () => {
  let retiroId: string
  let capatazId: string
  let supervisorId: string

  beforeAll(async () => {
    const retiroResult = await pool.query(
      'INSERT INTO retiro (nome) VALUES ($1) RETURNING id',
      ['Retiro Sucesso Ticket']
    )
    retiroId = retiroResult.rows[0].id

    const suffix = Date.now()

    const capatazResult = await pool.query(
      `INSERT INTO usuario
         (retiro_id, nome, login, senha_hash, status, data_criacao, cargo)
       VALUES ($1, $2, $3, $4, 'ativo', NOW(), 'capataz')
       RETURNING id`,
      [retiroId, 'Capataz Teste', `capataz-${suffix}`, 'hash-fake']
    )
    capatazId = capatazResult.rows[0].id

    const supervisorResult = await pool.query(
      `INSERT INTO usuario
         (retiro_id, nome, login, senha_hash, status, data_criacao, cargo)
       VALUES ($1, $2, $3, $4, 'ativo', NOW(), 'supervisor')
       RETURNING id`,
      [retiroId, 'Supervisor Teste', `supervisor-${suffix}`, 'hash-fake']
    )
    supervisorId = supervisorResult.rows[0].id
  })

  afterAll(async () => {
    await pool.end()
  })

  it('deve responder 201 com o ticket criado quando há evidência válida', async () => {
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

    expect(res.status).toBe(201)
    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        retiro_id: retiroId,
        aberto_por: capatazId,
        atribuido_a: supervisorId,
        categoria: 'cerca',
        localizacao: 'Norte do retiro',
        status: 'aberto',
        descricao: 'Cerca quebrada na divisa norte',
      })
    )
  })
})
