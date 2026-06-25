import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { Usuario, UsuarioInput, UsuarioCargo } from '../models/usuario.model'
import { UsuarioRepository } from '../repositories/usuario.repository'
import { UUID } from '../models/uuid'
import { AcessoCapatazRepository } from '../repositories/acesso-capataz.repository'
import { SupervisorRetiroRepository } from '../repositories/supervisor-retiro.repository'

const BCRYPT_SALT_ROUNDS = 12

function gerarIdentificadorPadrao(dados: Pick<UsuarioInput, 'cargo' | 'nome'>): string {
  const nomeNormalizado = dados.nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${dados.cargo}-${nomeNormalizado || 'usuario'}`
}

export const UsuarioService = {
  // RN05: Autenticacao simples com no maximo 3 interacoes
  // Usuarios com baixo letramento digital (ensino fundamental)
  async autenticar(login: string, senha: string): Promise<Usuario | null> {
    const usuario = await UsuarioRepository.buscarPorLogin(login)

    if (!usuario || !usuario.senha_hash) {
      return null
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash)

    if (!senhaValida) {
      return null
    }

    return usuario
  },

  async autenticarCapatazPorToken(token: string): Promise<Usuario | null> {
    if (!token || token.trim().length === 0) {
      return null
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(token.trim())
      .digest('hex')

    return AcessoCapatazRepository.buscarCapatazPorTokenHash(tokenHash)
  },

  // RN06: Verificar se usuario tem permissao para validar/aprovar registros
  // Apenas Supervisor pode validar movimentacoes e tarefas
  podeValidar(usuario: Usuario): boolean {
    return usuario.cargo === 'supervisor'
  },

  // RN06: Verificar permissao generica por cargo
  temPermissao(usuario: Usuario, cargo: UsuarioCargo): boolean {
    return usuario.cargo === cargo
  },

  // Buscar usuario por ID
  async buscarPorId(id: string): Promise<Usuario | null> {
    return UsuarioRepository.buscarPorId(id)
  },

  // Listar usuarios por retiro
  async listarPorRetiro(retiroId: UUID): Promise<Usuario[]> {
    const usuarios = await UsuarioRepository.buscarTodos()
    return usuarios.filter(u => u.retiro_id === retiroId)
  },

  // Listar usuarios de um conjunto de retiros (supervisor que cobre varios)
  async listarPorRetiros(retiroIds: UUID[]): Promise<Usuario[]> {
    const conjunto = new Set(retiroIds.map(String))
    const usuarios = await UsuarioRepository.buscarTodos()
    return usuarios.filter(u => conjunto.has(String(u.retiro_id)))
  },

  // Retiros que um supervisor cobre: o retiro sede (usuario.retiro_id) mais os
  // retiros adicionais da tabela supervisor_retiro
  async retirosDoSupervisor(supervisor: { id: UUID; retiro_id: UUID }): Promise<UUID[]> {
    const adicionais = await SupervisorRetiroRepository.buscarRetirosPorSupervisor(supervisor.id)
    const conjunto = new Set<UUID>([supervisor.retiro_id, ...adicionais])
    return [...conjunto]
  },

  // Criar novo usuario
  async criar(dados: UsuarioInput): Promise<Usuario> {
    if (!dados.nome || dados.nome.trim().length === 0) {
      throw new Error('Campo "nome" é obrigatório')
    }
    if (!dados.cargo) {
      throw new Error('Campo "cargo" é obrigatório')
    }
    if (!dados.status) {
      throw new Error('Campo "status" é obrigatório')
    }

    const identificador = dados.identificador?.trim() || gerarIdentificadorPadrao(dados)
    const usaLoginESenha = dados.cargo !== 'capataz'

    if (usaLoginESenha && (!dados.login || dados.login.trim().length === 0)) {
      throw new Error('Campo "login" é obrigatório')
    }
    if (usaLoginESenha && (!dados.senha_hash || dados.senha_hash.length === 0)) {
      throw new Error('Campo "senha_hash" é obrigatório')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (dados.login && !emailRegex.test(dados.login)) {
      throw new Error('Login deve ser um email válido')
    }

    const senhaHash = dados.senha_hash
      ? await bcrypt.hash(dados.senha_hash, BCRYPT_SALT_ROUNDS)
      : null

    return UsuarioRepository.criar({
      ...dados,
      identificador,
      login: dados.login || null,
      senha_hash: senhaHash,
    })
  },

  // Atualizar usuario
  async atualizar(id: string, dados: Partial<UsuarioInput>): Promise<Usuario | null> {
    if (!dados.senha_hash) {
      return UsuarioRepository.atualizar(id, dados)
    }

    const senhaHash = await bcrypt.hash(dados.senha_hash, BCRYPT_SALT_ROUNDS)

    return UsuarioRepository.atualizar(id, {
      ...dados,
      senha_hash: senhaHash,
    })
  },

  // Validar se usuario esta ativo
  estaAtivo(usuario: Usuario): boolean {
    return usuario.status === 'ativo'
  },

  // Listar todos os usuarios
  async listarTodos(): Promise<Usuario[]> {
    return UsuarioRepository.buscarTodos()
  },

  // Remover usuario
  async remover(id: string): Promise<void> {
    await UsuarioRepository.remover(id)
  },
}
