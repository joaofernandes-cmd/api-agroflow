import { NextFunction, Request, Response } from 'express'

// Estrutura padrao de um erro de validacao.
export type ValidationError = {
  field: string
  message: string
}

// Resultado esperado de qualquer validacao.
export type ValidationResult = {
  valid: boolean
  errors: ValidationError[]
}

// Assinatura da funcao que valida uma request.
export type RequestValidator = (req: Request) => ValidationResult | Promise<ValidationResult>

// Factory de middleware.
// Recebe uma funcao de validacao e devolve um middleware Express pronto para uso.
export function validateRequest(validator: RequestValidator) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Executa a validacao especifica da rota.
      const result = await validator(req)

      // Se a validacao falhar, interrompe aqui e responde 400.
      if (!result.valid) {
        return res.status(400).json({
          error: 'Dados invalidos',
          details: result.errors,
        })
      }

      // Se estiver tudo certo, segue para o controller.
      return next()
    } catch (error) {
      // Erros inesperados de validacao tambem viram 400.
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Falha na validacao da requisicao',
      })
    }
  }
}

// Helper para campos texto obrigatorios.
export function requiredString(
  value: unknown,
  field: string,
  message = `Campo "${field}" e obrigatorio`
): ValidationError | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { field, message }
  }

  return null
}

// Helper para campos numericos obrigatorios.
export function requiredNumber(
  value: unknown,
  field: string,
  message = `Campo "${field}" deve ser um numero valido`
): ValidationError | null {
  const parsed = Number(value)

  if (value === undefined || value === null || value === '' || Number.isNaN(parsed)) {
    return { field, message }
  }

  return null
}

// Helper para campos de data.
export function requiredDate(
  value: unknown,
  field: string,
  message = `Campo "${field}" deve ser uma data valida`
): ValidationError | null {
  if (value === undefined || value === null || value === '') {
    return { field, message }
  }

  const date = new Date(String(value))

  if (Number.isNaN(date.getTime())) {
    return { field, message }
  }

  return null
}

// Helper para validar valores dentro de uma lista permitida.
export function oneOf<T extends string>(
  value: unknown,
  field: string,
  allowedValues: readonly T[],
  message = `Campo "${field}" deve ser um dos valores permitidos`
): ValidationError | null {
  if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
    return { field, message }
  }

  return null
}
