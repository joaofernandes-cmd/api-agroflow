import { NextFunction, Request, Response } from 'express'

// Erro padronizado da aplicação.
// Ele permite definir status HTTP e detalhes extras.
export class ErroDeAplicacao extends Error {
  // Status HTTP que será devolvido ao cliente.
  codigoStatus: number
  // Dados extras opcionais para debug ou resposta mais rica.
  detalhes?: unknown

  constructor(mensagem: string, codigoStatus = 500, detalhes?: unknown) {
    super(mensagem)
    this.name = 'ErroDeAplicacao'
    this.codigoStatus = codigoStatus
    this.detalhes = detalhes
  }
}

// Identifica erros criados pela própria aplicação.
function ehErroDeAplicacao(error: unknown): error is ErroDeAplicacao {
  return error instanceof ErroDeAplicacao
}

// Middleware final da cadeia.
// Transforma qualquer erro em uma resposta HTTP consistente.
export function tratadorDeErros(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Se a resposta já foi iniciada, não tentamos enviar outra.
  if (res.headersSent) {
    return
  }

  // Erros da aplicação respeitam o status definido na classe.
  if (ehErroDeAplicacao(error)) {
    return res.status(error.codigoStatus).json({
      error: error.message,
      ...(error.detalhes !== undefined ? { details: error.detalhes } : {}),
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
