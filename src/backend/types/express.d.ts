import type { UsuarioCargo } from '../models/usuario.model'
import type { UUID } from '../models/uuid'

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: UUID
        identificador: string
        login: string | null
        cargo: UsuarioCargo
        retiro_id: UUID
      }
    }
  }
}

export {}
