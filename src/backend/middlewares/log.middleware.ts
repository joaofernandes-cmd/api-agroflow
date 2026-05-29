import { NextFunction, Request, Response } from 'express'

function formatarDuracaoMs(inicio: bigint): string {
  const duracaoNs = process.hrtime.bigint() - inicio
  const duracaoMs = Number(duracaoNs) / 1_000_000
  return `${duracaoMs.toFixed(2)}ms`
}

function obterRotuloDaRota(req: Request): string {
  return req.originalUrl || req.url
}

// Middleware de log de requisição.
// Registra informações úteis para auditoria, suporte e depuração.
export function middlewareDeLog(req: Request, res: Response, next: NextFunction) {
  const inicio = process.hrtime.bigint()

  res.on('finish', () => {
    const duracao = formatarDuracaoMs(inicio)
    const rota = obterRotuloDaRota(req)
    const usuarioId = req.usuario?.id ?? 'anonimo'
    const cargo = req.usuario?.cargo ?? 'sem-cargo'

    console.log(
      `[HTTP] ${req.method} ${rota} -> ${res.statusCode} | ${duracao} | user=${usuarioId} | cargo=${cargo}`
    )
  })

  return next()
}
