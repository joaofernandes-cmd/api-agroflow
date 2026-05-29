import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UsuarioCargo } from '../models/usuario.model'

export interface UsuarioAutenticado {
  id: string
  login: string
  cargo: UsuarioCargo
  retiro_id: number
}

type JwtPayloadUsuario = UsuarioAutenticado & jwt.JwtPayload

const JWT_SECRET = process.env.JWT_SECRET ?? 'troque-este-segredo-em-producao'
const JWT_EXPIRES_IN = '1d'

// Emissão do "passaporte" do usuário após o login.
export function gerarToken(usuario: UsuarioAutenticado): string {
  return jwt.sign(
    {
      login: usuario.login,
      cargo: usuario.cargo,
      retiro_id: usuario.retiro_id,
    },
    JWT_SECRET,
    {
      subject: usuario.id,
      expiresIn: JWT_EXPIRES_IN,
    }
  )
}

export function autenticarUsuario(req: Request, res: Response, next: NextFunction) {
  // A porta de entrada: toda rota protegida passa por aqui.
  const authorization = req.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não informado' })
  }

  const token = authorization.slice('Bearer '.length).trim()

  try {
    // Se o token estiver correto, ele vira o usuário autenticado da request.
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayloadUsuario

    if (!payload.sub || !payload.login || !payload.cargo) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    req.usuario = {
      id: payload.sub,
      login: payload.login,
      cargo: payload.cargo,
      retiro_id: payload.retiro_id,
    }

    return next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

export function exigirCargo(...cargosPermitidos: UsuarioCargo[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Depois do login, ainda conferimos se o cargo pode entrar nessa sala.
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!cargosPermitidos.includes(req.usuario.cargo)) {
      return res.status(403).json({ error: 'Sem permissão para acessar este recurso' })
    }

    return next()
  }
}
