import {
  dataObrigatoria,
  numeroObrigatorio,
  textoObrigatorio,
  umaDasOpcoes,
  validarRequisicao,
} from '../../middlewares/validacaoRequisicao.middleware'

function criarResponse() {
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({ json })

  return {
    response: { status } as any,
    status,
    json,
  }
}

describe('validacaoRequisicao.middleware', () => {
  it('validarRequisicao deve seguir para o controller quando payload for valido', async () => {
    const middleware = validarRequisicao(() => ({ valido: true, erros: [] }))
    const { response, status } = criarResponse()
    const next = jest.fn()

    await middleware({ body: {} } as any, response, next)

    expect(next).toHaveBeenCalled()
    expect(status).not.toHaveBeenCalled()
  })

  it('validarRequisicao deve retornar 400 com detalhes quando payload for invalido', async () => {
    const erros = [{ campo: 'descricao', mensagem: 'Descrição obrigatória' }]
    const middleware = validarRequisicao(() => ({ valido: false, erros }))
    const { response, status, json } = criarResponse()

    await middleware({ body: {} } as any, response, jest.fn())

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({
      error: 'Dados inválidos',
      details: erros,
    })
  })

  it('validarRequisicao deve retornar 400 quando o validador lancar erro', async () => {
    const middleware = validarRequisicao(() => {
      throw new Error('Falha ao validar')
    })
    const { response, status, json } = criarResponse()

    await middleware({ body: {} } as any, response, jest.fn())

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: 'Falha ao validar' })
  })

  it('helpers devem validar campos obrigatorios e opcoes permitidas', () => {
    expect(textoObrigatorio('  ', 'nome')).toEqual({
      campo: 'nome',
      mensagem: 'Campo "nome" é obrigatório',
    })
    expect(textoObrigatorio('Aroeira', 'nome')).toBeNull()

    expect(numeroObrigatorio('abc', 'quantidade')).toEqual({
      campo: 'quantidade',
      mensagem: 'Campo "quantidade" deve ser um número válido',
    })
    expect(numeroObrigatorio(3, 'quantidade')).toBeNull()

    expect(dataObrigatoria('data-invalida', 'data')).toEqual({
      campo: 'data',
      mensagem: 'Campo "data" deve ser uma data válida',
    })
    expect(dataObrigatoria('2026-06-23', 'data')).toBeNull()

    expect(umaDasOpcoes('alta', 'prioridade', ['alta', 'media'] as const)).toBeNull()
    expect(umaDasOpcoes('urgente', 'prioridade', ['alta', 'media'] as const)).toEqual({
      campo: 'prioridade',
      mensagem: 'Campo "prioridade" deve ser um dos valores permitidos',
    })
  })
})
