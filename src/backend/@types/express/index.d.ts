import 'express'
import { UsuarioAutenticado } from '../../middlewares/autenticacao.middleware'

declare module 'express-serve-static-core' {
  interface Request {
    usuario?: UsuarioAutenticado
  }
}
