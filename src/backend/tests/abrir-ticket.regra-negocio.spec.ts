import request from 'supertest'
import app from '../app'
import { pool } from '../database/connection'

// RN08 do WAD (Quadro 19):
// "Para a abertura de um ticket de infraestrutura por um Capataz, o
//  sistema deve exigir obrigatoriamente ao menos uma evidência descritiva
//  associada ao chamado (mensagem escrita com mínimo 10 caracteres ou
//  áudio com mínimo 3 segundos de duração). Tickets sem evidência devem
//  ser rejeitados."
//
// Fluxo alternativo da Figura 17 (Diagrama Sequencial RF008): quando
// o ServicoTicket não encontra evidência, o sistema responde com
// HTTP 422 - Entidade Não Processável. (Status code segue a Figura 17;
// há um conflito com o RN08 que menciona 400.)
describe('POST /tickets - abrir - regra de negócio RN08 violada', () => {
  const payloadBase = {
    retiro_id: '00000000-0000-0000-0000-000000000000',
    aberto_por: '00000000-0000-0000-0000-000000000000',
    categoria: 'cerca',
    localizacao: 'Norte do retiro',
    atribuido_a: '00000000-0000-0000-0000-000000000000',
    descricao: 'Cerca quebrada',
  }

  const mensagemErro = {
    message: 'Ticket rejeitado: ao menos uma evidência descritiva é obrigatória',
  }

  afterAll(async () => {
    await pool.end()
  })

  it('deve rejeitar abertura de ticket sem nenhuma evidência (400)', async () => {
    const res = await request(app)
      .post('/tickets')
      .send({ ...payloadBase, evidencias: [] })

    expect(res.status).toBe(422)
    expect(res.body).toEqual(mensagemErro)
  })

  it('deve rejeitar mensagem com menos de 10 caracteres (400)', async () => {
    const res = await request(app)
      .post('/tickets')
      .send({
        ...payloadBase,
        evidencias: [{ tipo: 'mensagem', conteudo: 'curto' }],
      })

    expect(res.status).toBe(422)
    expect(res.body).toEqual(mensagemErro)
  })

  it('deve rejeitar áudio com menos de 3 segundos (400)', async () => {
    const res = await request(app)
      .post('/tickets')
      .send({
        ...payloadBase,
        evidencias: [
          {
            tipo: 'audio',
            url_arquivo: 'https://storage/audio.mp3',
            duracao_segundos: 2,
          },
        ],
      })

    expect(res.status).toBe(422)
    expect(res.body).toEqual(mensagemErro)
  })
})
