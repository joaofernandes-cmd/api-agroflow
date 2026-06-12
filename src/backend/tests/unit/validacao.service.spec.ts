import { ValidacaoService } from '../../services/validacao.service'
import { MovimentacaoRepository } from '../../repositories/movimentacao.repository'
import { TarefaRepository } from '../../repositories/tarefa.repository'
import { TicketRepository } from '../../repositories/ticket.repository'
import { mockMovimentacao, mockMovimentacaoValidada, mockTarefa, mockTicket, mockSupervisor } from '../helpers/fixtures'

jest.mock('../../repositories/movimentacao.repository', () => ({
  MovimentacaoRepository: {
    buscarPorId: jest.fn(),
    atualizar: jest.fn(),
  },
}))

jest.mock('../../repositories/tarefa.repository', () => ({
  TarefaRepository: {
    buscarPorId: jest.fn(),
    atualizar: jest.fn(),
  },
}))

jest.mock('../../repositories/ticket.repository', () => ({
  TicketRepository: {
    buscarPorId: jest.fn(),
    atualizar: jest.fn(),
  },
}))

const mockedMovRepo = MovimentacaoRepository as jest.Mocked<typeof MovimentacaoRepository>
const mockedTarefaRepo = TarefaRepository as jest.Mocked<typeof TarefaRepository>
const mockedTicketRepo = TicketRepository as jest.Mocked<typeof TicketRepository>

describe('ValidacaoService', () => {
  beforeEach(() => {
    mockedMovRepo.buscarPorId.mockResolvedValue(mockMovimentacao as any)
    mockedMovRepo.atualizar.mockResolvedValue(mockMovimentacaoValidada as any)
    mockedTarefaRepo.buscarPorId.mockResolvedValue(mockTarefa as any)
    mockedTarefaRepo.atualizar.mockResolvedValue({ ...mockTarefa, status: 'aprovado' } as any)
    mockedTicketRepo.buscarPorId.mockResolvedValue(mockTicket as any)
    mockedTicketRepo.atualizar.mockResolvedValue({ ...mockTicket, status: 'aprovado' } as any)
  })

  it('podeValidar deve aceitar apenas supervisor', () => {
    expect(ValidacaoService.podeValidar({ cargo: 'supervisor' })).toBe(true)
    expect(ValidacaoService.podeValidar({ cargo: 'gerente' } as any)).toBe(false)
  })

  it('validarMovimentacao deve bloquear cargo diferente de supervisor', async () => {
    const resultado = await ValidacaoService.validarMovimentacao('00000000-0000-4000-8000-000000000201', mockSupervisor.id, 'gerente')

    expect(resultado).toEqual({
      sucesso: false,
      mensagem: 'Apenas Supervisores podem validar movimentações. Acesso negado.',
    })
  })

  it('validarMovimentacao deve retornar nao encontrada', async () => {
    mockedMovRepo.buscarPorId.mockResolvedValueOnce(null)

    const resultado = await ValidacaoService.validarMovimentacao('00000000-0000-4000-8000-000000000201', mockSupervisor.id, 'supervisor')

    expect(resultado).toEqual({
      sucesso: false,
      mensagem: 'Movimentação não encontrada.',
    })
  })

  it('validarMovimentacao deve bloquear movimentacao ja validada', async () => {
    mockedMovRepo.buscarPorId.mockResolvedValueOnce(mockMovimentacaoValidada as any)

    const resultado = await ValidacaoService.validarMovimentacao('00000000-0000-4000-8000-000000000201', mockSupervisor.id, 'supervisor')

    expect(resultado).toEqual({
      sucesso: false,
      mensagem: 'Movimentação já foi validado. Não pode ser alterada.',
    })
  })

  it('validarMovimentacao deve aprovar movimentacao pendente', async () => {
    const resultado = await ValidacaoService.validarMovimentacao('00000000-0000-4000-8000-000000000201', mockSupervisor.id, 'supervisor')

    expect(resultado.sucesso).toBe(true)
    expect(resultado.mensagem).toBe('Movimentação validada com sucesso.')
  })

  it('aprovarTicket deve bloquear cargo diferente de supervisor', async () => {
    const resultado = await ValidacaoService.aprovarTicket('00000000-0000-4000-8000-000000000401', mockSupervisor.id, 'gerente')

    expect(resultado).toEqual({
      sucesso: false,
      mensagem: 'Apenas Supervisores podem aprovar tickets. Acesso negado.',
    })
  })

  it('aprovarTicket deve retornar ticket nao encontrado', async () => {
    mockedTicketRepo.buscarPorId.mockResolvedValueOnce(null)

    const resultado = await ValidacaoService.aprovarTicket('00000000-0000-4000-8000-000000000401', mockSupervisor.id, 'supervisor')

    expect(resultado).toEqual({
      sucesso: false,
      mensagem: 'Ticket não encontrado.',
    })
  })

  it('aprovarTicket deve bloquear ticket ja aprovado', async () => {
    mockedTicketRepo.buscarPorId.mockResolvedValueOnce({ ...mockTicket, status: 'aprovado' } as any)

    const resultado = await ValidacaoService.aprovarTicket('00000000-0000-4000-8000-000000000401', mockSupervisor.id, 'supervisor')

    expect(resultado).toEqual({
      sucesso: false,
      mensagem: 'Ticket já foi aprovado. Não pode ser alterado.',
    })
  })

  it('aprovarTicket deve aprovar ticket pendente', async () => {
    const resultado = await ValidacaoService.aprovarTicket('00000000-0000-4000-8000-000000000401', mockSupervisor.id, 'supervisor')

    expect(resultado.sucesso).toBe(true)
    expect(resultado.mensagem).toBe('Ticket aprovado com sucesso.')
  })

  it('aprovarTarefa deve bloquear cargo diferente de supervisor', async () => {
    const resultado = await ValidacaoService.aprovarTarefa('00000000-0000-4000-8000-000000000301', mockSupervisor.id, 'gerente')

    expect(resultado).toEqual({
      sucesso: false,
      mensagem: 'Apenas Supervisores podem aprovar tarefas. Acesso negado.',
    })
  })

  it('aprovarTarefa deve retornar tarefa nao encontrada', async () => {
    mockedTarefaRepo.buscarPorId.mockResolvedValueOnce(null)

    const resultado = await ValidacaoService.aprovarTarefa('00000000-0000-4000-8000-000000000301', mockSupervisor.id, 'supervisor')

    expect(resultado).toEqual({
      sucesso: false,
      mensagem: 'Tarefa não encontrada.',
    })
  })

  it('aprovarTarefa deve bloquear tarefa ja aprovada', async () => {
    mockedTarefaRepo.buscarPorId.mockResolvedValueOnce({ ...mockTarefa, status: 'aprovado' } as any)

    const resultado = await ValidacaoService.aprovarTarefa('00000000-0000-4000-8000-000000000301', mockSupervisor.id, 'supervisor')

    expect(resultado).toEqual({
      sucesso: false,
      mensagem: 'Tarefa já foi aprovado. Não pode ser alterada.',
    })
  })

  it('aprovarTarefa deve aprovar tarefa pendente', async () => {
    const resultado = await ValidacaoService.aprovarTarefa('00000000-0000-4000-8000-000000000301', mockSupervisor.id, 'supervisor')

    expect(resultado.sucesso).toBe(true)
    expect(resultado.mensagem).toBe('Tarefa aprovada com sucesso.')
  })
})
