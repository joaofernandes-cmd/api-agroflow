import { Usuario, UsuarioInput, UsuarioCargo } from '../models/usuario.model'

export class UsuarioService {
  // RN05: Autenticação simples com no máximo 3 interações
  // Usuários com baixo letramento digital (ensino fundamental)
  async autenticar(login: string, senha: string): Promise<Usuario | null> {
    // TODO: Implementar busca do usuário no banco
    // TODO: Validar senha contra senha_hash
    // TODO: Retornar usuário autenticado ou null
    return null
  }

  // RN06: Verificar se usuário tem permissão para validar/aprovar registros
  // Apenas Supervisor pode validar movimentações e tarefas
  podeValidar(usuario: Usuario): boolean {
    return usuario.cargo === 'supervisor'
  }

  // RN06: Verificar permissão genérica por cargo
  temPermissao(usuario: Usuario, cargo: UsuarioCargo): boolean {
    return usuario.cargo === cargo
  }

  // Buscar usuário por ID
  async buscarPorId(id: string): Promise<Usuario | null> {
    // TODO: Implementar busca no banco
    return null
  }

  // Listar usuários por retiro
  async listarPorRetiro(retiroId: string): Promise<Usuario[]> {
    // TODO: Implementar busca de usuários vinculados ao retiro
    return []
  }

  // Criar novo usuário
  async criar(dados: UsuarioInput): Promise<Usuario> {
    // TODO: Implementar validação de dados
    // TODO: Hash da senha
    // TODO: Persistir no banco
    throw new Error('Não implementado')
  }

  // Atualizar usuário
  async atualizar(id: string, dados: Partial<UsuarioInput>): Promise<Usuario> {
    // TODO: Implementar validação de dados
    // TODO: Atualizar apenas campos permitidos
    // TODO: Persistir no banco
    throw new Error('Não implementado')
  }

  // Validar se usuário está ativo
  estaAtivo(usuario: Usuario): boolean {
    return usuario.status === 'ativo'
  }
}
