import { MovimentacaoService } from '../../services/movimentacao.service'
import { MovimentacaoRepository } from '../../repositories/movimentacao.repository'
import { mockMovimentacao } from '../helpers/fixtures'

jest.mock('../../repositories/movimentacao.repository', () => ({
  MovimentacaoRepository: {
    criar: jest.fn(),
    buscarPorId: jest.fn(),
    buscarTodos: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
  },
}))

const mockedRepository = MovimentacaoRepository as jest.Mocked<typeof MovimentacaoRepository>

const baseMovimentacao = {
  retiro_id: 1,
  capataz_id: 'user-003',
  estagio_vida: 'BEZERRO 0 A 7 MESES' as const,
}

describe('MovimentacaoService', () => {
  beforeEach(() => {
    mockedRepository.criar.mockResolvedValue(mockMovimentacao as any)
  })

  it('criar deve exigir destino para compra', async () => {
    await expect(
      MovimentacaoService.criar({
        ...baseMovimentacao,
        tipo: 'compra',
        quantidade: 10,
      })
    ).rejects.toThrow('Campo "destino" e obrigatorio')
  })

  it('criar deve exigir origem para venda', async () => {
    await expect(
      MovimentacaoService.criar({
        ...baseMovimentacao,
        tipo: 'venda',
        quantidade: 10,
      })
    ).rejects.toThrow('Campo "origem" e obrigatorio')
  })

  it('criar deve aceitar compra com destino e quantidade', async () => {
    await MovimentacaoService.criar({
      ...baseMovimentacao,
      tipo: 'compra',
      destino: 'Acurizal',
      quantidade: 10,
    })

    expect(mockedRepository.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'compra',
        destino: 'Acurizal',
        quantidade: 10,
        status: 'pendente',
        validado_por: null,
      })
    )
  })

  it('criar deve aceitar venda com origem e quantidade', async () => {
    await MovimentacaoService.criar({
      ...baseMovimentacao,
      tipo: 'venda',
      origem: 'Acurizal',
      quantidade: 10,
    })

    expect(mockedRepository.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'venda',
        origem: 'Acurizal',
        quantidade: 10,
        status: 'pendente',
        validado_por: null,
      })
    )
  })
})
