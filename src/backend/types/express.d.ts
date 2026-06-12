import type { UsuarioCargo } from '../models/usuario.model'
import type { UUID } from '../models/uuid'

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: UUID
        login: string
        cargo: UsuarioCargo
        retiro_id: UUID
      }
    }
  }
}

export {}
