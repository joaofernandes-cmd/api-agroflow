import { Request } from 'express'
import { converterUUID, UUID } from '../models/uuid'

export function extrairTexto(valor: unknown): string | undefined {
  return typeof valor === 'string' ? valor : undefined
}

export function extrairTextoQuery(valor: unknown): string | undefined {
  if (Array.isArray(valor)) {
    return extrairTexto(valor[0])
  }

  return extrairTexto(valor)
}

export function retiroDaConsulta(req: Request, valor?: string): string | undefined {
  if (req.usuario?.cargo === 'capataz') {
    return req.usuario.retiro_id
  }

  return valor
}

export function converterUuidOpcional(valor: unknown): UUID | undefined | null {
  const texto = extrairTexto(valor)
  return texto ? converterUUID(texto) : undefined
}

export function converterUuidDeConsulta(req: Request, nome = 'retiroId'): UUID | undefined | null {
  const retiro = retiroDaConsulta(req, extrairTextoQuery(req.query[nome]))
  return retiro ? converterUUID(retiro) : undefined
}
