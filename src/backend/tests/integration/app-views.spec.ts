import request from 'supertest'
import app from '../../app'

describe('Views principais da aplicacao', () => {
  it('GET /auth/perfil deve renderizar selecao de perfil', async () => {
    const response = await request(app).get('/auth/perfil')

    expect(response.status).toBe(200)
    expect(response.text).toContain('Supervisor')
    expect(response.text).toContain('Gerente')
  })

  it('GET /auth/login deve renderizar login do perfil selecionado', async () => {
    const response = await request(app).get('/auth/login?role=gerente')

    expect(response.status).toBe(200)
    expect(response.text).toContain('Gerente')
    expect(response.text).toContain('email')
  })

  it('GET /supervisor/relatorios deve renderizar tela de relatorios', async () => {
    const response = await request(app).get('/supervisor/relatorios')

    expect(response.status).toBe(200)
    expect(response.text).toContain('Resumo')
    expect(response.text).toContain('Gerar')
    expect(response.text).toContain('relatorio-head')
  })

  it('GET /gerente/relatorios deve renderizar tela de relatorios gerenciais', async () => {
    const response = await request(app).get('/gerente/relatorios')

    expect(response.status).toBe(200)
    expect(response.text).toContain('Resumo')
    expect(response.text).toContain('Gerar')
    expect(response.text).toContain('relatorio-head')
  })
})
