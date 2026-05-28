import { Usuario, UsuarioInput, UsuarioCargo } from '../models/usuario.model'
import { UsuarioRepository } from '../repositories/usuario.repository'

export const UsuarioService = {
  // RN05: Autenticação simples com no máximo 3 interações
  // Usuários com baixo letramento digital (ensino fundamental)
  async autenticar(login: string, senha: string): Promise<Usuario | null> {
    const usuario = await UsuarioRepository.findByLogin(login)

    if (!usuario) {
      return null
    }

    // TODO: Validar senha contra senha_hash usando bcrypt ou similar
    // Exemplo: const senhaValida = await bcrypt.compare(senha, usuario.senha_hash)
    // if (!senhaValida) return null

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
    return UsuarioRepository.findById(id)
  },

  // Listar usuários por retiro
  async listarPorRetiro(retiroId: number): Promise<Usuario[]> {
    const usuarios = await UsuarioRepository.findAll()
    return usuarios.filter(u => u.retiro_id === retiroId)
  },

  // Criar novo usuário
  async criar(dados: UsuarioInput): Promise<Usuario> {
    // TODO: Validar campos obrigatórios
    // TODO: Hash da senha usando bcrypt
    // TODO: Validar formato de email (login)
    return UsuarioRepository.create(dados)
  },

  // Atualizar usuário
  async atualizar(id: string, dados: Partial<UsuarioInput>): Promise<Usuario | null> {
    // TODO: Validar que usuário existe antes de atualizar
    return UsuarioRepository.update(id, dados)
  },

  // Validar se usuário está ativo
  estaAtivo(usuario: Usuario): boolean {
    return usuario.status === 'ativo'
  },

  // Listar todos os usuários
  async listarTodos(): Promise<Usuario[]> {
    return UsuarioRepository.findAll()
  },

  // Remover usuário
  async remover(id: string): Promise<void> {
    await UsuarioRepository.delete(id)
  },
}
