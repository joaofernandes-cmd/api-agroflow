import { NextFunction, Request, Response } from 'express'

// Erro padronizado da aplicacao.
// Ele permite definir status HTTP e detalhes extras.
export class AppError extends Error {
  // Status HTTP que sera devolvido ao cliente.
  statusCode: number
  // Dados extras opcionais para debug ou resposta mais rica.
  details?: unknown

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.details = details
  }
}

// Identifica erros criados pela propria aplicacao.
function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

// Middleware final da cadeia.
// Transforma qualquer erro em uma resposta HTTP consistente.
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Se a resposta ja foi iniciada, nao tentamos enviar outra.
  if (res.headersSent) {
    return
  }

  // Erros da aplicacao respeitam o status definido na classe.
  if (isAppError(error)) {
    return res.status(error.statusCode).json({
      error: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    })
  }

  // Erros comuns do JavaScript viram 500.
  if (error instanceof Error) {
    return res.status(500).json({
      error: error.message || 'Erro interno no servidor',
    })
  }

  // Fallback para qualquer valor inesperado.
  return res.status(500).json({
    error: 'Erro interno no servidor',
  })
}
