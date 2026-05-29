import { NextFunction, Request, Response } from 'express'

// Estrutura padrao de um erro de validacao.
export type ErroDeValidacao = {
  campo: string
  mensagem: string
}

// Resultado esperado de qualquer validacao.
export type ResultadoDeValidacao = {
  valido: boolean
  erros: ErroDeValidacao[]
}

// Assinatura da funcao que valida uma request.
export type ValidadorDeRequisicao = (req: Request) => ResultadoDeValidacao | Promise<ResultadoDeValidacao>

// Factory de middleware.
// Recebe uma funcao de validacao e devolve um middleware Express pronto para uso.
export function validarRequisicao(validador: ValidadorDeRequisicao) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Executa a validacao especifica da rota.
      const resultado = await validador(req)

      // Se a validacao falhar, interrompe aqui e responde 400.
      if (!resultado.valido) {
        return res.status(400).json({
          error: 'Dados invalidos',
          details: resultado.erros,
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
export function textoObrigatorio(
  valor: unknown,
  campo: string,
  mensagem = `Campo "${campo}" e obrigatorio`
): ErroDeValidacao | null {
  if (typeof valor !== 'string' || valor.trim().length === 0) {
    return { campo, mensagem }
  }

  return null
}

// Helper para campos numericos obrigatorios.
export function numeroObrigatorio(
  valor: unknown,
  campo: string,
  mensagem = `Campo "${campo}" deve ser um numero valido`
): ErroDeValidacao | null {
  const numero = Number(valor)

  if (valor === undefined || valor === null || valor === '' || Number.isNaN(numero)) {
    return { campo, mensagem }
  }

  return null
}

// Helper para campos de data.
export function dataObrigatoria(
  valor: unknown,
  campo: string,
  mensagem = `Campo "${campo}" deve ser uma data valida`
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

// Helper para validar valores dentro de uma lista permitida.
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
