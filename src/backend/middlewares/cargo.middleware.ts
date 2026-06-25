import { NextFunction, Request, Response } from 'express'
import { UsuarioCargo } from '../models/usuario.model'

// Recebe os cargos permitidos e devolve um middleware pronto para a rota
export function exigirCargo(...cargosPermitidos: UsuarioCargo[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!cargosPermitidos.includes(req.usuario.cargo)) {
      return res.status(403).json({ error: 'Acesso negado: cargo insuficiente' })
    }

    return next()
  }
}

export function exigirCargoView(...cargosPermitidos: UsuarioCargo[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.redirect('/auth/perfil')
    }

    if (!cargosPermitidos.includes(req.usuario.cargo)) {
      const destinoPorCargo: Record<UsuarioCargo, string> = {
        capataz: '/capataz/home',
        supervisor: '/supervisor/home',
        gerente: '/gerente/home',
      }
      const destino = destinoPorCargo[req.usuario.cargo]
      return res.redirect(destino)
    }

    return next()
  }
}
