import { UsuarioService } from '../../services/usuario.service'
import { UsuarioRepository } from '../../repositories/usuario.repository'
import { mockGerente, mockSupervisor } from '../helpers/fixtures'

jest.mock('../../repositories/usuario.repository', () => ({
  UsuarioRepository: {
    buscarPorLogin: jest.fn(),
    buscarPorId: jest.fn(),
    buscarTodos: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
  },
}))

const mockedRepository = UsuarioRepository as jest.Mocked<typeof UsuarioRepository>

describe('UsuarioService', () => {
  beforeEach(() => {
    mockedRepository.buscarPorLogin.mockResolvedValue(mockSupervisor as any)
    mockedRepository.buscarPorId.mockResolvedValue(mockGerente as any)
    mockedRepository.buscarTodos.mockResolvedValue([mockSupervisor as any, mockGerente as any])
    mockedRepository.criar.mockResolvedValue(mockGerente as any)
    mockedRepository.atualizar.mockResolvedValue(mockGerente as any)
    mockedRepository.remover.mockResolvedValue(undefined)
  })

  it('autenticar deve retornar usuario quando senha bate', async () => {
    const usuario = await UsuarioService.autenticar(mockSupervisor.login, 'hashed-password')

    expect(usuario).toEqual(mockSupervisor)
  })

  it('autenticar deve retornar null quando login nao existe', async () => {
    mockedRepository.buscarPorLogin.mockResolvedValueOnce(null)

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
