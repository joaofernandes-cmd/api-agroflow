import { NextFunction, Request, Response } from 'express'

// Estrutura padrão de um erro de validação
export type ErroDeValidacao = {
  campo: string
  mensagem: string
}

// Resultado esperado de qualquer validação
export type ResultadoDeValidacao = {
  valido: boolean
  erros: ErroDeValidacao[]
}

// Assinatura da função que valida uma request
export type ValidadorDeRequisicao = (req: Request) => ResultadoDeValidacao | Promise<ResultadoDeValidacao>

// Recebe uma função de validação e devolve um middleware Express pronto para uso
export function validarRequisicao(validador: ValidadorDeRequisicao) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resultado = await validador(req)

      if (!resultado.valido) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: resultado.erros,
        })
      }

      return next()
    } catch (error) {
      // Erros inesperados de validação também viram 400
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Falha na validação da requisição',
      })
    }
  }
}

// Helper para campos texto obrigatórios
export function textoObrigatorio(
  valor: unknown,
  campo: string,
  mensagem = `Campo "${campo}" é obrigatório`
): ErroDeValidacao | null {
  if (typeof valor !== 'string' || valor.trim().length === 0) {
    return { campo, mensagem }
  }

  return null
}

// Helper para campos numéricos obrigatórios
export function numeroObrigatorio(
  valor: unknown,
  campo: string,
  mensagem = `Campo "${campo}" deve ser um número válido`
): ErroDeValidacao | null {
  const numero = Number(valor)

  if (valor === undefined || valor === null || valor === '' || Number.isNaN(numero)) {
    return { campo, mensagem }
  }

  return null
}

// Helper para campos de data
export function dataObrigatoria(
  valor: unknown,
  campo: string,
  mensagem = `Campo "${campo}" deve ser uma data válida`
): ErroDeValidacao | null {
  if (valor === undefined || valor === null || valor === '') {
    return { campo, mensagem }
  }

  const data = new Date(String(valor))

  if (Number.isNaN(data.getTime())) {
    return { campo, mensagem }
  }

  return null
}

// Helper para validar valores dentro de uma lista permitida
export function umaDasOpcoes<T extends string>(
  valor: unknown,
  campo: string,
  valoresPermitidos: readonly T[],
  mensagem = `Campo "${campo}" deve ser um dos valores permitidos`
): ErroDeValidacao | null {
  if (typeof valor !== 'string' || !valoresPermitidos.includes(valor as T)) {
    return { campo, mensagem }
  }

  return null
}
