import { ErroDeAplicacao, tratadorDeErros } from '../../middlewares/erros.middleware'

function criarResponse(headersSent = false) {
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({ json })

  return {
    response: { status, headersSent } as any,
    status,
    json,
  }
}

describe('tratadorDeErros', () => {
  it('deve responder erros da aplicacao com status e detalhes definidos', () => {
    const { response, status, json } = criarResponse()
    const erro = new ErroDeAplicacao('Registro inválido', 422, [{ campo: 'tipo' }])

    tratadorDeErros(erro, {} as any, response, jest.fn())

    expect(status).toHaveBeenCalledWith(422)
    expect(json).toHaveBeenCalledWith({
      error: 'Registro inválido',
      details: [{ campo: 'tipo' }],
    })
  })

  it('deve converter Error comum em resposta 500', () => {
    const { response, status, json } = criarResponse()

    tratadorDeErros(new Error('Falha inesperada'), {} as any, response, jest.fn())

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: 'Falha inesperada' })
  })

  it('deve usar mensagem generica para valores inesperados', () => {
    const { response, status, json } = criarResponse()

    tratadorDeErros('erro sem formato', {} as any, response, jest.fn())

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: 'Erro interno no servidor' })
  })

  it('nao deve enviar nova resposta quando headers ja foram enviados', () => {
    const { response, status, json } = criarResponse(true)

    tratadorDeErros(new Error('Falha'), {} as any, response, jest.fn())

    expect(status).not.toHaveBeenCalled()
    expect(json).not.toHaveBeenCalled()
  })
})
