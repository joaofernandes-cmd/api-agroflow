import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UsuarioCargo } from '../models/usuario.model'
import { UUID } from '../models/uuid'

export interface UsuarioAutenticado {
  // Id do usuario autenticado no sistema.
  id: UUID
  // Login usado na autenticacao.
  login: string
  // Cargo carregado do token para liberar ou bloquear rotas.
  cargo: UsuarioCargo
  // Retiro ao qual o usuario pertence.
  retiro_id: UUID
}

type JwtPayloadUsuario = UsuarioAutenticado & jwt.JwtPayload

function obterJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error('JWT_SECRET nao definida no ambiente')
  }

  return jwtSecret
}

const JWT_SECRET = obterJwtSecret()
const JWT_EXPIRES_IN = '1d'
export const COOKIE_TOKEN_AUTENTICACAO = 'agroflow_token'

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

function montarUsuarioAPartirDoToken(token: string): UsuarioAutenticado {
  const payload = jwt.verify(token, JWT_SECRET) as JwtPayloadUsuario

  if (!payload.sub || !payload.login || !payload.cargo) {
    throw new Error('Token invalido')
  }

  return {
    id: payload.sub,
    login: payload.login,
    cargo: payload.cargo,
    retiro_id: payload.retiro_id,
  }
}

function obterCookie(req: Request, nome: string): string | null {
  const cookies = req.headers.cookie

  if (!cookies) {
    return null
  }

  const cookie = cookies
    .split(';')
    .map(parte => parte.trim())
    .find(parte => parte.startsWith(`${nome}=`))

  if (!cookie) {
    return null
  }

  return decodeURIComponent(cookie.slice(nome.length + 1))
}

// Middleware de autenticacao.
// Verifica se existe token Bearer valido e, se existir, preenche req.usuario.
export function autenticarUsuario(req: Request, res: Response, next: NextFunction) {
  const autorizacao = req.headers.authorization
  const tokenCookie = obterCookie(req, COOKIE_TOKEN_AUTENTICACAO)

  // Sem token na cabeca Authorization nao ha autenticacao.
  if (!autorizacao?.startsWith('Bearer ') && !tokenCookie) {
    return res.status(401).json({ error: 'Token nao informado' })
  }

  const token = autorizacao?.startsWith('Bearer ')
    ? autorizacao.slice('Bearer '.length).trim()
    : tokenCookie

  try {
    // Valida e decodifica o JWT usando o segredo do servidor.
    req.usuario = montarUsuarioAPartirDoToken(String(token))

    return next()
  } catch {
    // Qualquer falha de verificacao vira erro de autenticacao.
    return res.status(401).json({ error: 'Token invalido ou expirado' })
  }
}

export function autenticarViewPorCookie(req: Request, res: Response, next: NextFunction) {
  const token = obterCookie(req, COOKIE_TOKEN_AUTENTICACAO)

  if (!token) {
    return res.redirect('/auth/perfil')
  }

  try {
    req.usuario = montarUsuarioAPartirDoToken(token)
    return next()
  } catch {
    res.clearCookie(COOKIE_TOKEN_AUTENTICACAO)
    return res.redirect('/auth/perfil')
  }
}
