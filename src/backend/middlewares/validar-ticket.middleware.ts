import { NextFunction, Request, Response } from 'express'

const CAMPOS_OBRIGATORIOS = [
  'retiro_id',
  'aberto_por',
  'categoria',
  'localizacao',
  'atribuido_a',
  'descricao',
] as const

export function validarPayloadTicket(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const body = req.body ?? {}
  const faltantes = CAMPOS_OBRIGATORIOS.filter((campo) => !body[campo])

  if (faltantes.length > 0) {
    res.status(400).json({
      message: `Payload inválido: campos obrigatórios faltantes: ${faltantes.join(', ')}`,
    })
    return
  }

  next()
}
