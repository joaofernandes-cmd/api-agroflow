import { NextFunction, Request, Response } from 'express';
import { UsuarioCargo } from '../models/usuario.model';

export function exigirCargo(...cargosPermitidos: UsuarioCargo[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Primeiro garante que o usuário já passou pelo auth.middleare
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Depois checa se o cargo tem permissão para entrar
    if (!cargosPermitidos.includes(req.usuario.cargo)) {
      return res.status(403).json({ error: 'Acesso negado: cargo insuficiente' });
    }
    
    return next();
  };
}