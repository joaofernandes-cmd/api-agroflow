import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UsuarioCargo } from '../models/usuario.model'
import { UUID } from '../models/uuid'

export interface UsuarioAutenticado {
  id: UUID
  identificador: string
  login: string | null
  cargo: UsuarioCargo // carregado do token para liberar ou bloquear rotas
  retiro_id: UUID
}

type JwtPayloadUsuario = UsuarioAutenticado & jwt.JwtPayload

function obterJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error('JWT_SECRET não definida no ambiente')
  }

  return jwtSecret
}

const JWT_SECRET = obterJwtSecret()
const JWT_EXPIRES_IN = '1d'
export const COOKIE_TOKEN_AUTENTICACAO = 'agroflow_token'

// Gera o token que será enviado ao cliente após o login
export function gerarToken(usuario: UsuarioAutenticado): string {
  return jwt.sign(
    {
      login: usuario.login,
      identificador: usuario.identificador,
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

  if (!payload.sub || !payload.cargo || (!payload.identificador && !payload.login)) {
    throw new Error('Token inválido')
  }

  return {
    id: payload.sub,
    identificador: payload.identificador ?? payload.login,
    login: payload.login ?? null,
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

// Verifica se existe token Bearer ou cookie válido e preenche req.usuario
export function autenticarUsuario(req: Request, res: Response, next: NextFunction) {
  const autorizacao = req.headers.authorization
  const tokenCookie = obterCookie(req, COOKIE_TOKEN_AUTENTICACAO)

  if (!autorizacao?.startsWith('Bearer ') && !tokenCookie) {
    return res.status(401).json({ error: 'Token não informado' })
  }

  const token = autorizacao?.startsWith('Bearer ')
    ? autorizacao.slice('Bearer '.length).trim()
    : tokenCookie

  try {
    req.usuario = montarUsuarioAPartirDoToken(String(token))
    return next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
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
