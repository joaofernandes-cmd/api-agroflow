import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UsuarioCargo } from '../models/usuario.model'

export interface UsuarioAutenticado {
  // Id do usuario autenticado no sistema.
  id: string
  // Login usado na autenticacao.
  login: string
  // Cargo carregado do token para liberar ou bloquear rotas.
  cargo: UsuarioCargo
  // Retiro ao qual o usuario pertence.
  retiro_id: number
}

type JwtPayloadUsuario = UsuarioAutenticado & jwt.JwtPayload

const JWT_SECRET = process.env.JWT_SECRET ?? 'troque-este-segredo-em-producao'
const JWT_EXPIRES_IN = '1d'

// Gera o token que sera enviado ao cliente apos o login.
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

// Middleware de autenticacao.
// Verifica se existe token Bearer valido e, se existir, preenche req.usuario.
export function autenticarUsuario(req: Request, res: Response, next: NextFunction) {
  const autorizacao = req.headers.authorization

  // Sem token na cabeca Authorization nao ha autenticacao.
  if (!autorizacao?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token nao informado' })
  }

  const token = autorizacao.slice('Bearer '.length).trim()

  try {
    // Valida e decodifica o JWT usando o segredo do servidor.
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayloadUsuario

    // Confere se os dados essenciais realmente vieram no token.
    if (!payload.sub || !payload.login || !payload.cargo) {
      return res.status(401).json({ error: 'Token invalido' })
    }

    // Anexa o usuario autenticado na request para uso nas proximas camadas.
    req.usuario = {
      id: payload.sub,
      login: payload.login,
      cargo: payload.cargo,
      retiro_id: payload.retiro_id,
    }

    return next()
  } catch {
    // Qualquer falha de verificacao vira erro de autenticacao.
    return res.status(401).json({ error: 'Token invalido ou expirado' })
  }
}
