import { NextFunction, Request, Response } from 'express'

export type ValidationError = {
  field: string
  message: string
}

export type ValidationResult = {
  valid: boolean
  errors: ValidationError[]
}

export type RequestValidator = (req: Request) => ValidationResult | Promise<ValidationResult>

// Middleware-factory:
// recebe uma função de validação e devolve um middleware Express pronto para uso.
export function validateRequest(validator: RequestValidator) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await validator(req)

      if (!result.valid) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: result.errors,
        })
      }

      return next()
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Falha na validação da requisição',
      })
    }
  }
}

// Helpers simples para montar validadores específicos por rota.
export function requiredString(
  value: unknown,
  field: string,
  message = `Campo "${field}" é obrigatório`
): ValidationError | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { field, message }
  }

  return null
}

export function requiredNumber(
  value: unknown,
  field: string,
  message = `Campo "${field}" deve ser um número válido`
): ValidationError | null {
  const parsed = Number(value)

  if (value === undefined || value === null || value === '' || Number.isNaN(parsed)) {
    return { field, message }
  }

  return null
}

export function requiredDate(
  value: unknown,
  field: string,
  message = `Campo "${field}" deve ser uma data válida`
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
