import request from 'supertest'
import { mockGerente, mockSupervisor } from '../helpers/fixtures'

describe('Rotas protegidas', () => {
  const JWT_SECRET_TESTE = 'segredo-jwt-para-rotas-protegidas'
  let app: any
  let gerarToken: typeof import('../../middlewares/autenticacao.middleware').gerarToken

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET_TESTE
    jest.resetModules()
    jest.unmock('../../middlewares/autenticacao.middleware')
    jest.unmock('../../middlewares/cargo.middleware')

    gerarToken = require('../../middlewares/autenticacao.middleware').gerarToken
    app = require('../../app').default
  })

  it('deve bloquear rota protegida quando o usuario nao estiver autenticado', async () => {
    const response = await request(app).get('/relatorios/movimentacoes')

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: 'Token nao informado' })
  })

  it('deve bloquear rota de validacao para usuario autenticado sem cargo supervisor', async () => {
    const tokenGerente = gerarToken(mockGerente as any)

    const response = await request(app)
      .post('/validacoes/permissao')
      .set('Authorization', `Bearer ${tokenGerente}`)

    expect(response.status).toBe(403)
    expect(response.body).toEqual({ error: 'Acesso negado: cargo insuficiente' })
  })

  it('deve aceitar rota de validacao para usuario autenticado com cargo supervisor', async () => {
    const tokenSupervisor = gerarToken(mockSupervisor as any)

    const response = await request(app)
      .post('/validacoes/permissao')
      .set('Authorization', `Bearer ${tokenSupervisor}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ podeValidar: true })
  })

  it('deve redirecionar view protegida quando nao houver cookie de sessao', async () => {
    const response = await request(app).get('/supervisor/home')

    expect(response.status).toBe(302)
    expect(response.headers.location).toBe('/auth/perfil')
  })

  it('deve permitir logout sem header e limpar cookie de sessao', async () => {
    const response = await request(app).post('/usuarios/logout')
    const cookies = response.headers['set-cookie']
    const setCookie = Array.isArray(cookies) ? cookies.join(';') : String(cookies ?? '')

    expect(response.status).toBe(204)
    expect(setCookie).toContain('agroflow_token=')
  })

  it('deve bloquear supervisor tentando acessar view de gerente', async () => {
    const tokenSupervisor = gerarToken(mockSupervisor as any)

    const response = await request(app)
      .get('/gerente/home')
      .set('Cookie', [`agroflow_token=${tokenSupervisor}`])

    expect(response.status).toBe(302)
    expect(response.headers.location).toBe('/supervisor/home')
  })

  it('deve bloquear gerente tentando acessar view de supervisor', async () => {
    const tokenGerente = gerarToken(mockGerente as any)

    const response = await request(app)
      .get('/supervisor/home')
      .set('Cookie', [`agroflow_token=${tokenGerente}`])

    expect(response.status).toBe(302)
    expect(response.headers.location).toBe('/gerente/home')
  })

  it('deve renderizar view quando o cookie pertence ao cargo correto', async () => {
    const tokenSupervisor = gerarToken(mockSupervisor as any)

    const response = await request(app)
      .get('/supervisor/home')
      .set('Cookie', [`agroflow_token=${tokenSupervisor}`])

    expect(response.status).toBe(200)
    expect(response.text).toContain('Home Supervisor')
  })
})
