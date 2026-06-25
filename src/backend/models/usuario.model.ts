import { UUID } from './uuid'

export type UsuarioStatus = 'ativo' | 'inativo'

export type UsuarioCargo = 'capataz' | 'supervisor' | 'gerente'

export interface Usuario {
  id: UUID
  retiro_id: UUID
  nome: string
  identificador: string
  login: string | null
  senha_hash: string | null
  status: UsuarioStatus
  data_criacao: Date
  cargo: UsuarioCargo
}

export interface UsuarioInput {
  retiro_id: UUID
  nome: string
  identificador?: string
  login?: string | null
  senha_hash?: string | null
  status: UsuarioStatus
  cargo: UsuarioCargo
}
