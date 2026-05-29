import type { UsuarioCargo } from '../models/usuario.model'

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string
        login: string
        cargo: UsuarioCargo
        retiro_id: number
      }
    }
  }
}

export {}
