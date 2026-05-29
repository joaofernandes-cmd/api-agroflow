import 'express'
import { UsuarioAutenticado } from '../../middlewares/auth.middleware'

declare module 'express-serve-static-core' {
  interface Request {
    usuario?: UsuarioAutenticado
  }
}
