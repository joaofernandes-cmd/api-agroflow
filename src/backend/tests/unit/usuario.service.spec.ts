import bcrypt from 'bcrypt'
import { UsuarioService } from '../../services/usuario.service'
import { UsuarioRepository } from '../../repositories/usuario.repository'
import { mockGerente, mockSupervisor } from '../helpers/fixtures'

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}))

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
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe('UsuarioService', () => {
  beforeEach(() => {
    mockedBcrypt.compare.mockResolvedValue(true as never)
    mockedBcrypt.hash.mockResolvedValue('bcrypt-hash' as never)
    mockedRepository.buscarPorLogin.mockResolvedValue(mockSupervisor as any)
    mockedRepository.buscarPorId.mockResolvedValue(mockGerente as any)
    mockedRepository.buscarTodos.mockResolvedValue([mockSupervisor as any, mockGerente as any])
    mockedRepository.criar.mockResolvedValue(mockGerente as any)
    mockedRepository.atualizar.mockResolvedValue(mockGerente as any)
    mockedRepository.remover.mockResolvedValue(undefined)
  })

  it('autenticar deve retornar usuario quando senha bate', async () => {
    const usuario = await UsuarioService.autenticar(mockSupervisor.login, 'senha')

    expect(usuario).toEqual(mockSupervisor)
    expect(mockedBcrypt.compare).toHaveBeenCalledWith('senha', mockSupervisor.senha_hash)
  })

  it('autenticar deve retornar null quando senha nao bate', async () => {
    mockedBcrypt.compare.mockResolvedValueOnce(false as never)

    const usuario = await UsuarioService.autenticar(mockSupervisor.login, 'senha-errada')

    expect(usuario).toBeNull()
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

  it('temPermissao deve comparar o cargo informado', () => {
    expect(UsuarioService.temPermissao(mockSupervisor as any, 'supervisor')).toBe(true)
    expect(UsuarioService.temPermissao(mockSupervisor as any, 'gerente')).toBe(false)
  })

  it('estaAtivo deve validar status ativo', () => {
    expect(UsuarioService.estaAtivo(mockSupervisor as any)).toBe(true)
    expect(UsuarioService.estaAtivo({ ...mockSupervisor, status: 'inativo' } as any)).toBe(false)
  })

  it('buscarPorId deve delegar para o repository', async () => {
    const usuario = await UsuarioService.buscarPorId(mockGerente.id)

    expect(usuario).toEqual(mockGerente)
    expect(mockedRepository.buscarPorId).toHaveBeenCalledWith(mockGerente.id)
  })

  it('listarPorRetiro deve filtrar por retiro', async () => {
    const usuarios = await UsuarioService.listarPorRetiro(1)

    expect(usuarios).toEqual([mockSupervisor, mockGerente])
  })

  it('listarTodos deve retornar todos os usuarios', async () => {
    const usuarios = await UsuarioService.listarTodos()

    expect(usuarios).toEqual([mockSupervisor, mockGerente])
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

  it('criar deve rejeitar nome ausente', async () => {
    await expect(
      UsuarioService.criar({
        retiro_id: 1,
        nome: '   ',
        login: 'gerente.novo@agroflow.com',
        senha_hash: 'senha',
        status: 'ativo',
        cargo: 'gerente',
      })
    ).rejects.toThrow('Campo "nome" é obrigatório')
  })

  it('criar deve rejeitar login ausente', async () => {
    await expect(
      UsuarioService.criar({
        retiro_id: 1,
        nome: 'Gerente Novo',
        login: '',
        senha_hash: 'senha',
        status: 'ativo',
        cargo: 'gerente',
      })
    ).rejects.toThrow('Campo "login" é obrigatório')
  })

  it('criar deve aceitar usuario valido', async () => {
    const usuario = await UsuarioService.criar({
      retiro_id: 1,
      nome: 'Gerente Novo',
      login: 'gerente.novo@agroflow.com',
      senha_hash: 'senha',
      status: 'ativo',
      cargo: 'gerente',
    })

    expect(usuario).toEqual(mockGerente)
    expect(mockedRepository.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        login: 'gerente.novo@agroflow.com',
        cargo: 'gerente',
        senha_hash: 'bcrypt-hash',
      })
    )
    expect(mockedBcrypt.hash).toHaveBeenCalledWith('senha', 12)
  })

  it('atualizar deve delegar para o repository', async () => {
    const usuario = await UsuarioService.atualizar(mockGerente.id, { nome: 'Gerente Atualizado' })

    expect(usuario).toEqual(mockGerente)
    expect(mockedRepository.atualizar).toHaveBeenCalledWith(mockGerente.id, { nome: 'Gerente Atualizado' })
  })

  it('atualizar deve gerar hash quando uma nova senha for enviada', async () => {
    const usuario = await UsuarioService.atualizar(mockGerente.id, { senha_hash: 'nova-senha' })

    expect(usuario).toEqual(mockGerente)
    expect(mockedBcrypt.hash).toHaveBeenCalledWith('nova-senha', 12)
    expect(mockedRepository.atualizar).toHaveBeenCalledWith(mockGerente.id, {
      senha_hash: 'bcrypt-hash',
    })
  })

  it('remover deve delegar para o repository', async () => {
    await UsuarioService.remover(mockGerente.id)

    expect(mockedRepository.remover).toHaveBeenCalledWith(mockGerente.id)
  })
})
