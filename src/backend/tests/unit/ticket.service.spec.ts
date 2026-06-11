import { TicketService } from '../../services/ticket.service'
import { TicketRepository } from '../../repositories/ticket.repository'
import { mockCapataz, mockTicket, mockSupervisor } from '../helpers/fixtures'

jest.mock('../../repositories/ticket.repository', () => ({
  TicketRepository: {
    criar: jest.fn(),
    buscarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    atualizar: jest.fn(),
  },
}))

const mockedRepository = TicketRepository as jest.Mocked<typeof TicketRepository>

describe('TicketService', () => {
  beforeEach(() => {
    mockedRepository.criar.mockResolvedValue(mockTicket as any)
    mockedRepository.buscarTodos.mockResolvedValue([mockTicket as any])
    mockedRepository.buscarPorId.mockResolvedValue(mockTicket as any)
    mockedRepository.atualizar.mockResolvedValue(mockTicket as any)
  })

  it('validarCamposObrigatorios deve exigir prioridade', () => {
    expect(() =>
      TicketService.validarCamposObrigatorios({
        ...(mockTicket as any),
        prioridade: '' as any,
      })
    ).toThrow('Campo "prioridade" é obrigatório (alta, média, baixa)')
  })

  it('validarCamposObrigatorios deve exigir categoria', () => {
    expect(() =>
      TicketService.validarCamposObrigatorios({
        ...(mockTicket as any),
        categoria: '' as any,
      })
    ).toThrow('Campo "categoria" é obrigatório')
  })

  it('validarCamposObrigatorios deve exigir localizacao', () => {
    expect(() =>
      TicketService.validarCamposObrigatorios({
        ...(mockTicket as any),
        localizacao: '   ',
      })
    ).toThrow('Campo "localizacao" é obrigatório')
  })

  it('validarCamposObrigatorios deve exigir descricao', () => {
    expect(() =>
      TicketService.validarCamposObrigatorios({
        ...(mockTicket as any),
        descricao: '   ',
      })
    ).toThrow('Campo "descricao" é obrigatório')
  })

  it('criar deve bloquear usuario que nao e capataz', async () => {
    await expect(
      TicketService.criar(
        {
          retiro_id: 1,
          categoria: 'cerca',
          localizacao: mockTicket.localizacao,
          descricao: mockTicket.descricao,
          prioridade: mockTicket.prioridade,
        } as any,
        mockSupervisor as any,
        true
      )
    ).rejects.toThrow('Apenas Capatazes podem criar tickets')
  })

  it('criar deve exigir evidencia descritiva', async () => {
    await expect(
      TicketService.criar(
        {
          retiro_id: 1,
          categoria: 'cerca',
          localizacao: mockTicket.localizacao,
          descricao: mockTicket.descricao,
          prioridade: mockTicket.prioridade,
        } as any,
        mockCapataz as any,
        false
      )
    ).rejects.toThrow('Ticket rejeitado: ao menos uma evidência descritiva é obrigatória')
  })

  it('criar deve aceitar ticket valido', async () => {
    const ticket = await TicketService.criar(
      {
        retiro_id: 1,
        categoria: 'cerca',
        localizacao: mockTicket.localizacao,
        descricao: mockTicket.descricao,
        prioridade: mockTicket.prioridade,
      } as any,
      mockCapataz as any,
      true
    )

    expect(ticket).toEqual(mockTicket)
    expect(mockedRepository.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'pendente',
        atribuido_a: null,
      })
    )
  })

  it('alterarPrioridade deve retornar null quando ticket nao existe', async () => {
    mockedRepository.buscarPorId.mockResolvedValueOnce(null)

    const ticket = await TicketService.alterarPrioridade(999, 'alta')

    expect(ticket).toBeNull()
  })

  it('alterarPrioridade deve rejeitar prioridade invalida', async () => {
    await expect(TicketService.alterarPrioridade(21, 'urgente' as any)).rejects.toThrow(
      'Prioridade inválida. Escolha entre: alta, média, baixa'
    )
  })

  it('alterarPrioridade deve atualizar prioridade', async () => {
    const ticket = await TicketService.alterarPrioridade(21, 'alta')

    expect(ticket).toEqual(mockTicket)
  })

  it('listarPorStatus deve filtrar por status e retiro', async () => {
    mockedRepository.buscarTodos.mockResolvedValueOnce([
      mockTicket as any,
      { ...mockTicket, id: 22, status: 'aprovado', retiro_id: 2 } as any,
    ])

    const tickets = await TicketService.listarPorStatus('pendente', 1)

    expect(tickets).toEqual([mockTicket])
  })

  it('listarPorPrioridade deve filtrar por prioridade', async () => {
    const tickets = await TicketService.listarPorPrioridade('media', 1)

    expect(tickets).toEqual([mockTicket])
  })

  it('listarPorCategoria deve filtrar por categoria', async () => {
    const tickets = await TicketService.listarPorCategoria('cerca', 1)

    expect(tickets).toEqual([mockTicket])
  })

  it('atualizarStatus deve retornar null quando ticket nao existe', async () => {
    mockedRepository.buscarPorId.mockResolvedValueOnce(null)

    const ticket = await TicketService.atualizarStatus(999, 'aprovado')

    expect(ticket).toBeNull()
  })

  it('atualizarStatus deve atualizar status', async () => {
    const ticket = await TicketService.atualizarStatus(21, 'aprovado')

    expect(ticket).toEqual(mockTicket)
    expect(mockedRepository.atualizar).toHaveBeenCalledWith(21, expect.objectContaining({ status: 'aprovado' }))
  })

  it('atribuirA deve retornar null quando ticket nao existe', async () => {
    mockedRepository.buscarPorId.mockResolvedValueOnce(null)

    const ticket = await TicketService.atribuirA(999, mockCapataz.id)

    expect(ticket).toBeNull()
  })

  it('atribuirA deve atribuir ticket ao usuario', async () => {
    const ticket = await TicketService.atribuirA(21, mockCapataz.id)

    expect(ticket).toEqual(mockTicket)
  })

  it('buscarPorId deve delegar para o repository', async () => {
    const ticket = await TicketService.buscarPorId(21)

    expect(ticket).toEqual(mockTicket)
  })

  it('listarTodos deve delegar para o repository', async () => {
    const tickets = await TicketService.listarTodos()

    expect(tickets).toEqual([mockTicket])
  })

  it('listarPendentes deve filtrar tickets pendentes', async () => {
    mockedRepository.buscarTodos.mockResolvedValueOnce([
      mockTicket as any,
      { ...mockTicket, id: 22, status: 'aprovado', retiro_id: 1 } as any,
    ])

    const tickets = await TicketService.listarPendentes(1)

    expect(tickets).toEqual([mockTicket])
  })

  it('contarPorPrioridade deve contar por prioridade e retiro', async () => {
    mockedRepository.buscarTodos.mockResolvedValueOnce([
      mockTicket as any,
      { ...mockTicket, id: 22, prioridade: 'alta', retiro_id: 1 } as any,
      { ...mockTicket, id: 23, prioridade: 'baixa', retiro_id: 2 } as any,
    ])

    const contagem = await TicketService.contarPorPrioridade(1)

    expect(contagem).toEqual({ alta: 1, media: 1, baixa: 0 })
  })
})
