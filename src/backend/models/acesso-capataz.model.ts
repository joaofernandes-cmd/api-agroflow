import { Usuario } from './usuario.model'
import { UUID } from './uuid'

export interface AcessoCapataz {
  id: UUID
  usuario_id: UUID
  token_hash: string
  ativo: boolean
  data_expiracao: Date | null
  data_criacao: Date
}

export type CapatazAutenticado = Usuario
