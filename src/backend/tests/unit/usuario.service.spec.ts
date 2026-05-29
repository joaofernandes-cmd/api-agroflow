import { UsuarioService } from '../../services/usuario.service'
import { UsuarioRepository } from '../../repositories/usuario.repository'
import { mockGerente, mockSupervisor } from '../helpers/fixtures'

jest.mock('../../repositories/usuario.repository', () => ({
  UsuarioRepository: {
    findByLogin: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockedRepository = UsuarioRepository as jest.Mocked<typeof UsuarioRepository>

describe('UsuarioService', () => {
  beforeEach(() => {
    mockedRepository.findByLogin.mockResolvedValue(mockSupervisor as any)
    mockedRepository.findById.mockResolvedValue(mockGerente as any)
    mockedRepository.findAll.mockResolvedValue([mockSupervisor as any, mockGerente as any])
    mockedRepository.create.mockResolvedValue(mockGerente as any)
    mockedRepository.update.mockResolvedValue(mockGerente as any)
    mockedRepository.delete.mockResolvedValue(undefined)
  })

  it('autenticar deve retornar usuario quando senha bate', async () => {
    const usuario = await UsuarioService.autenticar(mockSupervisor.login, 'hashed-password')

    expect(usuario).toEqual(mockSupervisor)
  })

  it('autenticar deve retornar null quando login nao existe', async () => {
    mockedRepository.findByLogin.mockResolvedValueOnce(null)

    const usuario = await UsuarioService.autenticar('inexistente@agroflow.com', 'senha')

    expect(usuario).toBeNull()
  })

  it('podeValidar deve aceitar apenas supervisor', () => {
    expect(UsuarioService.podeValidar(mockSupervisor as any)).toBe(true)
    expect(UsuarioService.podeValidar(mockGerente as any)).toBe(false)
  })

  it('estaAtivo deve validar status ativo', () => {
    expect(UsuarioService.estaAtivo(mockSupervisor as any)).toBe(true)
    expect(UsuarioService.estaAtivo({ ...mockSupervisor, status: 'inativo' } as any)).toBe(false)
  })

  it('criar deve rejeitar login invalido', async () => {
    await expect(
      UsuarioService.criar({
        retiro_id: 1,
        nome: 'Usuario Sem Email Valido',
        login: 'invalido',
        senha_hash: 'senha',
        status: 'ativo',
        cargo: 'gerente',
      })
    ).rejects.toThrow('Login deve ser um email válido')
  })
})
