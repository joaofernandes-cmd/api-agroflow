import request from 'supertest'
import app from '../../app'
import { UsuarioController } from '../../controllers/usuario.controller'
import { UsuarioService } from '../../services/usuario.service'
import { mockCapataz, mockGerente, mockSupervisor } from '../helpers/fixtures'

jest.mock('../../services/usuario.service', () => ({
  UsuarioService: {
    autenticar: jest.fn(),
    estaAtivo: jest.fn(),
    listarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorRetiro: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
  },
}))

const mockedService = UsuarioService as jest.Mocked<typeof UsuarioService>

describe('Usuarios', () => {
  beforeEach(() => {
    mockedService.autenticar.mockResolvedValue(mockSupervisor as any)
    mockedService.estaAtivo.mockReturnValue(true)
    mockedService.listarTodos.mockResolvedValue([mockSupervisor as any, mockGerente as any])
    mockedService.buscarPorId.mockResolvedValue(mockGerente as any)
    mockedService.listarPorRetiro.mockResolvedValue([mockSupervisor as any])
    mockedService.criar.mockResolvedValue(mockGerente as any)
    mockedService.atualizar.mockResolvedValue(mockGerente as any)
    mockedService.remover.mockResolvedValue(undefined)
  })

  it('POST /usuarios/login deve autenticar usuario', async () => {
    const response = await request(app).post('/usuarios/login').send({
      login: mockSupervisor.login,
      senha: 'hashed-password',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      usuario: {
        id: mockSupervisor.id,
        nome: mockSupervisor.nome,
        login: mockSupervisor.login,
        status: mockSupervisor.status,
        cargo: mockSupervisor.cargo,
        retiro_id: mockSupervisor.retiro_id,
      },
      token: 'mock-jwt-token',
    })
  })

  it('POST /usuarios/login deve bloquear capataz sem acesso por login', async () => {
    mockedService.autenticar.mockResolvedValueOnce(mockCapataz as any)

    const response = await request(app).post('/usuarios/login').send({
      login: mockCapataz.login,
      senha: 'hashed-password',
    })

    expect(response.status).toBe(403)
  })

  it('RN12 deve bloquear rota administrativa para usuario que nao seja gerente', () => {
    const { exigirCargo } = jest.requireActual('../../middlewares/cargo.middleware')
    const req = { usuario: mockSupervisor } as any
    const json = jest.fn()
    const status = jest.fn().mockReturnValue({ json })
    const res = { status } as any
    const next = jest.fn()

    exigirCargo('gerente')(req, res, next)

    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Acesso negado: cargo insuficiente' })
    expect(next).not.toHaveBeenCalled()
  })

  it('GET /usuarios deve listar usuarios', async () => {
    const response = await request(app).get('/usuarios')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
    expect(response.body[0]).not.toHaveProperty('senha_hash')
  })

  it('GET /usuarios/retiro/:retiroId deve listar por retiro', async () => {
    const response = await request(app).get('/usuarios/retiro/1')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([
      {
        id: mockSupervisor.id,
        nome: mockSupervisor.nome,
        login: mockSupervisor.login,
        status: mockSupervisor.status,
        cargo: mockSupervisor.cargo,
        retiro_id: mockSupervisor.retiro_id,
      },
    ])
  })

  it('GET /usuarios/:id deve buscar usuario por id', async () => {
    const response = await request(app).get('/usuarios/user-002')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: mockGerente.id,
      nome: mockGerente.nome,
      login: mockGerente.login,
    })
  })

  it('POST /usuarios deve criar usuario', async () => {
    const response = await request(app).post('/usuarios').send({
      retiro_id: 1,
      nome: 'Gerente Novo',
      login: 'gerente.novo@agroflow.com',
      senha_hash: 'hashed-password',
      status: 'ativo',
      cargo: 'gerente',
    })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      id: mockGerente.id,
      nome: mockGerente.nome,
      login: mockGerente.login,
    })
  })

  it('POST /usuarios deve rejeitar login que nao seja email', async () => {
    const response = await request(app).post('/usuarios').send({
      retiro_id: 1,
      nome: 'Gerente Novo',
      login: 'login-invalido',
      senha_hash: 'hashed-password',
      status: 'ativo',
      cargo: 'gerente',
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Login deve ser um email válido' })
    expect(mockedService.criar).not.toHaveBeenCalled()
  })

  it('PATCH /usuarios/:id deve atualizar usuario', async () => {
    const response = await request(app).patch('/usuarios/user-002').send({
      nome: 'Gerente Atualizado',
    })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: mockGerente.id,
      nome: mockGerente.nome,
    })
  })

  it('DELETE /usuarios/:id deve remover usuario', async () => {
    const response = await request(app).delete('/usuarios/user-002')

    expect(response.status).toBe(204)
    expect(mockedService.remover).toHaveBeenCalledWith('user-002')
  })
})
