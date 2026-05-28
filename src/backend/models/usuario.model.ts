export type UsuarioStatus = 'ativo' | 'inativo'

export type UsuarioCargo = 'capataz' | 'supervisor' | 'gerente'

export interface Usuario {
  id: string
  retiro_id: number
  nome: string
  login: string
  senha_hash: string
  status: UsuarioStatus
  data_criacao: Date
  cargo: UsuarioCargo
}

export interface UsuarioInput {
  retiro_id: number
  nome: string
  login: string
  senha_hash: string
  status: UsuarioStatus
  cargo: UsuarioCargo
}
