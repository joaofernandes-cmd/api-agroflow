import bcrypt from 'bcrypt'
import { Usuario, UsuarioInput, UsuarioCargo } from '../models/usuario.model'
import { UsuarioRepository } from '../repositories/usuario.repository'
import { UUID } from '../models/uuid'

const BCRYPT_SALT_ROUNDS = 12

export const UsuarioService = {
  // RN05: Autenticação simples com no máximo 3 interações
  // Usuários com baixo letramento digital (ensino fundamental)
  async autenticar(login: string, senha: string): Promise<Usuario | null> {
    const usuario = await UsuarioRepository.buscarPorLogin(login)

    if (!usuario) {
      return null
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash)

    if (!senhaValida) {
      return null
    }

    return usuario
  },

  // RN06: Verificar se usuário tem permissão para validar/aprovar registros
  // Apenas Supervisor pode validar movimentações e tarefas
  podeValidar(usuario: Usuario): boolean {
    return usuario.cargo === 'supervisor'
  },

  // RN06: Verificar permissão genérica por cargo
  temPermissao(usuario: Usuario, cargo: UsuarioCargo): boolean {
    return usuario.cargo === cargo
  },

  // Buscar usuário por ID
  async buscarPorId(id: string): Promise<Usuario | null> {
    return UsuarioRepository.buscarPorId(id)
  },

  // Listar usuários por retiro
  async listarPorRetiro(retiroId: UUID): Promise<Usuario[]> {
    const usuarios = await UsuarioRepository.buscarTodos()
    return usuarios.filter(u => u.retiro_id === retiroId)
  },

  // Criar novo usuário
  async criar(dados: UsuarioInput): Promise<Usuario> {
    // Validar campos obrigatórios
    if (!dados.nome || dados.nome.trim().length === 0) {
      throw new Error('Campo "nome" é obrigatório')
    }
    if (!dados.login || dados.login.trim().length === 0) {
      throw new Error('Campo "login" é obrigatório')
    }
    if (!dados.senha_hash || dados.senha_hash.length === 0) {
      throw new Error('Campo "senha_hash" é obrigatório')
    }
    if (!dados.cargo) {
      throw new Error('Campo "cargo" é obrigatório')
    }
    if (!dados.status) {
      throw new Error('Campo "status" é obrigatório')
    }

    // Validar formato de email (login)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(dados.login)) {
      throw new Error('Login deve ser um email válido')
    }

    const senhaHash = await bcrypt.hash(dados.senha_hash, BCRYPT_SALT_ROUNDS)

    return UsuarioRepository.criar({
      ...dados,
      senha_hash: senhaHash,
    })
  },

  // Atualizar usuário
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

  // Validar se usuário está ativo
  estaAtivo(usuario: Usuario): boolean {
    return usuario.status === 'ativo'
  },

  // Listar todos os usuários
  async listarTodos(): Promise<Usuario[]> {
    return UsuarioRepository.buscarTodos()
  },

  // Remover usuário
  async remover(id: string): Promise<void> {
    await UsuarioRepository.remover(id)
  },
}
