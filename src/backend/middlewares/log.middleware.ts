import { NextFunction, Request, Response } from 'express'

function formatarDuracaoMs(startedAt: bigint): string {
  const elapsedNs = process.hrtime.bigint() - startedAt
  const elapsedMs = Number(elapsedNs) / 1_000_000
  return `${elapsedMs.toFixed(2)}ms`
}

function obterRotuloDaRota(req: Request): string {
  return req.originalUrl || req.url
}

// Middleware de log de requisição.
// Registra informações úteis para auditoria, suporte e depuração.
export function middlewareDeLog(req: Request, res: Response, next: NextFunction) {
  const startedAt = process.hrtime.bigint()

  res.on('finish', () => {
    const duration = formatarDuracaoMs(startedAt)
    const route = obterRotuloDaRota(req)
    const userId = req.usuario?.id ?? 'anonimo'
    const cargo = req.usuario?.cargo ?? 'sem-cargo'

    console.log(
      `[HTTP] ${req.method} ${route} -> ${res.statusCode} | ${duration} | user=${userId} | cargo=${cargo}`
    )
  })

  return next()
}
