import jwt from 'jsonwebtoken'
import { mockGerente, mockSupervisor, RETIRO_ID, SUPERVISOR_ID } from '../helpers/fixtures'

const JWT_SECRET_TESTE = 'segredo-jwt-para-testes'

describe('Autenticacao e autorizacao', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET_TESTE
  })

  function criarResponse() {
    const json = jest.fn()
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({ json, send })

    return {
      response: { status } as any,
      status,
      json,
      send,
    }
  }

  it('deve gerar token e preencher req.usuario quando o Bearer token for valido', () => {
    const { gerarToken, autenticarUsuario } =
      jest.requireActual<typeof import('../../middlewares/autenticacao.middleware')>(
        '../../middlewares/autenticacao.middleware'
      )
    const token = gerarToken(mockSupervisor as any)
    const req = { headers: { authorization: `Bearer ${token}` } } as any
    const { response } = criarResponse()
    const next = jest.fn()

    autenticarUsuario(req, response, next)

    expect(next).toHaveBeenCalled()
    expect(req.usuario).toEqual({
      id: mockSupervisor.id,
      login: mockSupervisor.login,
      cargo: mockSupervisor.cargo,
      retiro_id: mockSupervisor.retiro_id,
    })
  })

  it('deve retornar 401 quando nao houver token', () => {
    const { autenticarUsuario } =
      jest.requireActual<typeof import('../../middlewares/autenticacao.middleware')>(
        '../../middlewares/autenticacao.middleware'
      )
    const req = { headers: {} } as any
    const { response, status, json } = criarResponse()
    const next = jest.fn()

    autenticarUsuario(req, response, next)

    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ error: 'Token nao informado' })
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 401 quando o token estiver expirado', () => {
    const { autenticarUsuario } =
      jest.requireActual<typeof import('../../middlewares/autenticacao.middleware')>(
        '../../middlewares/autenticacao.middleware'
      )
    const tokenExpirado = jwt.sign(
      {
        login: 'supervisor@agroflow.com',
        cargo: 'supervisor',
        retiro_id: RETIRO_ID,
      },
      JWT_SECRET_TESTE,
      {
        subject: SUPERVISOR_ID,
        expiresIn: '-1s',
      }
    )
    const req = { headers: { authorization: `Bearer ${tokenExpirado}` } } as any
    const { response, status, json } = criarResponse()
    const next = jest.fn()

    autenticarUsuario(req, response, next)

    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ error: 'Token invalido ou expirado' })
    expect(next).not.toHaveBeenCalled()
  })

  it('deve permitir acesso quando o cargo autenticado estiver autorizado', () => {
    const { exigirCargo } = jest.requireActual<typeof import('../../middlewares/cargo.middleware')>(
      '../../middlewares/cargo.middleware'
    )
    const req = { usuario: mockGerente } as any
    const { response } = criarResponse()
    const next = jest.fn()

    exigirCargo('gerente')(req, response, next)

    expect(next).toHaveBeenCalled()
  })

  it('deve bloquear acesso quando o cargo autenticado nao estiver autorizado', () => {
    const { exigirCargo } = jest.requireActual<typeof import('../../middlewares/cargo.middleware')>(
      '../../middlewares/cargo.middleware'
    )
    const req = { usuario: mockSupervisor } as any
    const { response, status, json } = criarResponse()
    const next = jest.fn()

    exigirCargo('gerente')(req, response, next)

    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Acesso negado: cargo insuficiente' })
    expect(next).not.toHaveBeenCalled()
  })
})
