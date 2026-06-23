import { MovimentacaoService } from '../../services/movimentacao.service'
import { MovimentacaoRepository } from '../../repositories/movimentacao.repository'
import { EvidenciaService } from '../../services/evidencia.service'
import { EvidenciaMovimentacaoRepository } from '../../repositories/evidencia-movimentacao.repository'
import { mockMovimentacao, mockMovimentacaoValidada } from '../helpers/fixtures'

jest.mock('../../repositories/movimentacao.repository', () => ({
  MovimentacaoRepository: {
    criar: jest.fn(),
    buscarPorId: jest.fn(),
    buscarTodos: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
  },
}))

jest.mock('../../services/evidencia.service', () => ({
  EvidenciaService: {
    validarEvidenciaDescritiva: jest.fn(),
    validarGeorreferenciamento: jest.fn(),
    criarMensagem: jest.fn(),
    criarAudio: jest.fn(),
    criarFoto: jest.fn(),
  },
}))

jest.mock('../../repositories/evidencia-movimentacao.repository', () => ({
  EvidenciaMovimentacaoRepository: {
    criar: jest.fn(),
  },
}))

const mockedRepository = MovimentacaoRepository as jest.Mocked<typeof MovimentacaoRepository>
const mockedEvidenciaService = EvidenciaService as jest.Mocked<typeof EvidenciaService>
const mockedVinculoRepo = EvidenciaMovimentacaoRepository as jest.Mocked<typeof EvidenciaMovimentacaoRepository>

const baseMovimentacao = {
  retiro_id: '00000000-0000-4000-8000-000000000001',
  capataz_id: 'user-003',
  estagio_vida: 'BEZERRO 0 A 7 MESES' as const,
}

describe('MovimentacaoService', () => {
  beforeEach(() => {
    mockedRepository.buscarPorId.mockResolvedValue(mockMovimentacao as any)
    mockedRepository.buscarTodos.mockResolvedValue([mockMovimentacao as any, mockMovimentacaoValidada as any])
    mockedRepository.criar.mockResolvedValue(mockMovimentacao as any)
    mockedRepository.atualizar.mockResolvedValue(mockMovimentacaoValidada as any)
    mockedRepository.remover.mockResolvedValue(undefined)
    mockedEvidenciaService.validarEvidenciaDescritiva.mockImplementation(() => undefined)
    mockedEvidenciaService.validarGeorreferenciamento.mockImplementation(() => undefined)
    mockedEvidenciaService.criarMensagem.mockResolvedValue({ evidencia: { id: '00000000-0000-4000-8000-000000000501' }, mensagem: { evidencia_id: '00000000-0000-4000-8000-000000000501', conteudo: 'Mensagem valida de evidencia' } } as any)
    mockedEvidenciaService.criarAudio.mockResolvedValue({ evidencia: { id: '00000000-0000-4000-8000-000000000501' }, audio: { evidencia_id: '00000000-0000-4000-8000-000000000501', url_arquivo: 'audio.mp3' } } as any)
    mockedEvidenciaService.criarFoto.mockResolvedValue({ evidencia: { id: '00000000-0000-4000-8000-000000000501' }, foto: { evidencia_id: '00000000-0000-4000-8000-000000000501', url_arquivo: 'foto.jpg', latitude: -20, longitude: -55 } } as any)
    mockedVinculoRepo.criar.mockResolvedValue({ evidencia_id: '00000000-0000-4000-8000-000000000501', movimentacao_id: '00000000-0000-4000-8000-000000000201' } as any)
  })

  it('validarCamposObrigatorios deve exigir capataz_id', () => {
    expect(() =>
      MovimentacaoService.validarCamposObrigatorios({
        ...baseMovimentacao,
        capataz_id: '' as any,
        tipo: 'nascimento',
        origem: 'Acurizal',
        quantidade: 1,
        status: 'pendente',
        sincronizado: false,
      } as any)
    ).toThrow('Campo "capataz_id" é obrigatório')
  })

  it('validarCamposObrigatorios deve exigir estagio_vida', () => {
    expect(() =>
      MovimentacaoService.validarCamposObrigatorios({
        ...baseMovimentacao,
        estagio_vida: '' as any,
        tipo: 'nascimento',
        origem: 'Acurizal',
        quantidade: 1,
        status: 'pendente',
        sincronizado: false,
      } as any)
    ).toThrow('Campo "estagio_vida" é obrigatório')
  })

  it('validarCamposObrigatorios deve exigir destino para compra', () => {
    expect(() =>
      MovimentacaoService.validarCamposObrigatorios({
        ...baseMovimentacao,
        tipo: 'compra',
        quantidade: 10,
        status: 'pendente',
        sincronizado: false,
      } as any)
    ).toThrow('Campo "destino" é obrigatório')
  })

  it('validarCamposObrigatorios deve exigir origem para venda', () => {
    expect(() =>
      MovimentacaoService.validarCamposObrigatorios({
        ...baseMovimentacao,
        tipo: 'venda',
        quantidade: 10,
        status: 'pendente',
        sincronizado: false,
      } as any)
    ).toThrow('Campo "origem" é obrigatório')
  })

  it('validarCamposObrigatorios deve exigir causa de obito para morte', () => {
    expect(() =>
      MovimentacaoService.validarCamposObrigatorios({
        ...baseMovimentacao,
        tipo: 'morte',
        origem: 'Acurizal',
        status: 'pendente',
        sincronizado: false,
      } as any)
    ).toThrow('Campo "causa_obito" é obrigatório para movimentações do tipo "morte"')
  })

  it('validarQuantidade deve rejeitar zero', () => {
    expect(() => MovimentacaoService.validarQuantidade(0)).toThrow(
      'Campo "quantidade" é obrigatório e deve ser maior que zero'
    )
  })

  it('validarCamposObrigatorios deve rejeitar nascimento com estagio diferente de bezerro ou bezerra', () => {
    expect(() =>
      MovimentacaoService.validarCamposObrigatorios({
        ...baseMovimentacao,
        tipo: 'nascimento',
        origem: 'Acurizal',
        quantidade: 1,
        estagio_vida: 'GARROTE 8 A 12 MESES',
        status: 'pendente',
        sincronizado: false,
      } as any)
    ).toThrow('Campo "estagio_vida" inválido para movimentações do tipo "nascimento"')
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

  it('criar deve registrar evidencia de mensagem quando fornecida', async () => {
    await MovimentacaoService.criar({
      ...baseMovimentacao,
      tipo: 'nascimento',
      origem: 'Acurizal',
      quantidade: 1,
      evidencia: {
        tipo: 'mensagem',
        conteudo: 'Mensagem valida de evidencia',
      },
    })

    expect(mockedEvidenciaService.criarMensagem).toHaveBeenCalled()
    expect(mockedVinculoRepo.criar).toHaveBeenCalledWith({
      evidencia_id: '00000000-0000-4000-8000-000000000501',
      movimentacao_id: '00000000-0000-4000-8000-000000000201',
    })
  })

  it('sincronizarRecebida deve gravar como sincronizada', async () => {
    const movimentacao = await MovimentacaoService.sincronizarRecebida({
      ...baseMovimentacao,
      tipo: 'nascimento',
      origem: 'Acurizal',
      quantidade: 1,
    })

    expect(movimentacao).toEqual(mockMovimentacao)
    expect(mockedRepository.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        sincronizado: true,
        status: 'pendente',
      })
    )
  })

  it('sincronizarRecebida deve registrar evidencia quando fornecida', async () => {
    await MovimentacaoService.sincronizarRecebida({
      ...baseMovimentacao,
      tipo: 'transferencia',
      origem: 'Acurizal',
      destino: 'Aroeira',
      quantidade: 1,
      evidencia: {
        tipo: 'audio',
        urlArquivo: 'audio.mp3',
        duracao: 5,
      },
    })

    expect(mockedEvidenciaService.criarAudio).toHaveBeenCalled()
    expect(mockedVinculoRepo.criar).toHaveBeenCalledWith({
      evidencia_id: '00000000-0000-4000-8000-000000000501',
      movimentacao_id: '00000000-0000-4000-8000-000000000201',
    })
  })

  it('filtrar deve respeitar retiro tipo status e periodo', async () => {
    mockedRepository.buscarTodos.mockResolvedValueOnce([
      mockMovimentacao as any,
      {
        ...mockMovimentacaoValidada,
        id: '00000000-0000-4000-8000-000000000299',
        retiro_id: '00000000-0000-4000-8000-000000000002',
        tipo: 'morte',
        status: 'validado',
        data_criacao: new Date('2026-05-28T10:00:00.000Z'),
      } as any,
    ])

    const filtradas = await MovimentacaoService.filtrar(
      '00000000-0000-4000-8000-000000000001',
      ['nascimento'],
      ['pendente'],
      new Date('2026-05-29T00:00:00.000Z'),
      new Date('2026-05-30T00:00:00.000Z')
    )

    expect(filtradas).toEqual([mockMovimentacao])
  })

  it('buscarParaRelatorio deve retornar apenas sincronizadas e validadas', async () => {
    mockedRepository.buscarTodos.mockResolvedValueOnce([mockMovimentacao as any, mockMovimentacaoValidada as any])

    const relatorio = await MovimentacaoService.buscarParaRelatorio('00000000-0000-4000-8000-000000000001')

    expect(relatorio).toEqual([mockMovimentacaoValidada])
  })

  it('buscarParaDashboard deve retornar apenas sincronizadas e validadas', async () => {
    mockedRepository.buscarTodos.mockResolvedValueOnce([mockMovimentacao as any, mockMovimentacaoValidada as any])

    const dashboard = await MovimentacaoService.buscarParaDashboard('00000000-0000-4000-8000-000000000001')

    expect(dashboard).toEqual([mockMovimentacaoValidada])
  })

  it('sincronizar deve retornar null quando movimentacao nao existe', async () => {
    mockedRepository.buscarPorId.mockResolvedValueOnce(null)

    const resultado = await MovimentacaoService.sincronizar('00000000-0000-4000-8000-000000000999')

    expect(resultado).toBeNull()
  })

  it('sincronizar deve marcar movimentacao como sincronizada', async () => {
    const resultado = await MovimentacaoService.sincronizar('00000000-0000-4000-8000-000000000201')

    expect(resultado).toEqual(mockMovimentacaoValidada)
    expect(mockedRepository.atualizar).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000201', { sincronizado: true })
  })

  it('listarPendentes deve filtrar apenas pendentes do retiro', async () => {
    mockedRepository.buscarTodos.mockResolvedValueOnce([
      mockMovimentacao as any,
      mockMovimentacaoValidada as any,
      { ...mockMovimentacao, id: '00000000-0000-4000-8000-000000000202', retiro_id: '00000000-0000-4000-8000-000000000002' } as any,
    ])

    const pendentes = await MovimentacaoService.listarPendentes('00000000-0000-4000-8000-000000000001')

    expect(pendentes).toEqual([mockMovimentacao])
  })

  it('contarPorTipo deve somar apenas registros aprovados e sincronizados', async () => {
    mockedRepository.buscarTodos.mockResolvedValueOnce([
      mockMovimentacaoValidada as any,
      { ...mockMovimentacaoValidada, id: '00000000-0000-4000-8000-000000000202', tipo: 'morte', retiro_id: '00000000-0000-4000-8000-000000000001' } as any,
      { ...mockMovimentacaoValidada, id: '00000000-0000-4000-8000-000000000203', tipo: 'compra', retiro_id: '00000000-0000-4000-8000-000000000002' } as any,
    ])

    const contagem = await MovimentacaoService.contarPorTipo('00000000-0000-4000-8000-000000000001')

    expect(contagem).toMatchObject({
      nascimento: 1,
      morte: 1,
      transferencia: 0,
      compra: 0,
      venda: 0,
      outros: 0,
    })
  })

  it('atualizar deve retornar null quando movimentacao nao existe', async () => {
    mockedRepository.buscarPorId.mockResolvedValueOnce(null)

    const resultado = await MovimentacaoService.atualizar('00000000-0000-4000-8000-000000000999', { quantidade: 2 })

    expect(resultado).toBeNull()
  })

  it('atualizar deve revalidar quando houver alteracao estrutural', async () => {
    const resultado = await MovimentacaoService.atualizar('00000000-0000-4000-8000-000000000201', {
      tipo: 'nascimento',
      origem: 'Acurizal',
      quantidade: 2,
    })

    expect(resultado).toEqual(mockMovimentacaoValidada)
    expect(mockedRepository.atualizar).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000201', {
      tipo: 'nascimento',
      origem: 'Acurizal',
      quantidade: 2,
    })
  })

  it('atualizar deve delegar quando nao houver alteracao estrutural', async () => {
    const resultado = await MovimentacaoService.atualizar('00000000-0000-4000-8000-000000000201', { sincronizado: true })

    expect(resultado).toEqual(mockMovimentacaoValidada)
    expect(mockedRepository.atualizar).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000201', { sincronizado: true })
  })

  it('remover deve delegar para o repository', async () => {
    await MovimentacaoService.remover('00000000-0000-4000-8000-000000000201')

    expect(mockedRepository.remover).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000201')
  })
})
