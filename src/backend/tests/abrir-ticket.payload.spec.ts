import request from 'supertest'
import app from '../app'
import { pool } from '../database/connection'

// Validação estrutural do payload: campos obrigatórios devem estar
// presentes na requisição (retiro_id, aberto_por, categoria, localizacao,
// atribuido_a, descricao). Caso falte qualquer um, o sistema retorna
// HTTP 400 listando os campos faltantes — antes de qualquer regra de
// negócio ou persistência ser avaliada.
describe('POST /tickets - abrir - payload inválido', () => {
  const payloadCompleto = {
    retiro_id: '00000000-0000-0000-0000-000000000000',
    aberto_por: '00000000-0000-0000-0000-000000000000',
    categoria: 'cerca',
    localizacao: 'Norte do retiro',
    atribuido_a: '00000000-0000-0000-0000-000000000000',
    descricao: 'Cerca quebrada',
    evidencias: [
      { tipo: 'mensagem', conteudo: 'mensagem com mais de dez caracteres' },
    ],
  }

  afterAll(async () => {
    await pool.end()
  })

  it('deve rejeitar payload sem descricao (400)', async () => {
    const payload: Record<string, unknown> = { ...payloadCompleto }
    delete payload.descricao

    const res = await request(app).post('/tickets').send(payload)

    expect(res.status).toBe(400)
    expect(res.body.message).toContain('descricao')
  })

  it('deve rejeitar payload sem categoria (400)', async () => {
    const payload: Record<string, unknown> = { ...payloadCompleto }
    delete payload.categoria

    const res = await request(app).post('/tickets').send(payload)

    expect(res.status).toBe(400)
    expect(res.body.message).toContain('categoria')
  })

  it('deve rejeitar payload sem retiro_id (400)', async () => {
    const payload: Record<string, unknown> = { ...payloadCompleto }
    delete payload.retiro_id

    const res = await request(app).post('/tickets').send(payload)

    expect(res.status).toBe(400)
    expect(res.body.message).toContain('retiro_id')
  })
})
