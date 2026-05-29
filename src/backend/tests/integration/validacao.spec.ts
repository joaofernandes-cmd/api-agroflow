import request from 'supertest'
import app from '../../app'
import { ValidacaoService } from '../../services/validacao.service'
import { mockMovimentacaoValidada, mockSupervisor, mockTarefa, mockTicket } from '../helpers/fixtures'

jest.mock('../../services/validacao.service', () => ({
  ValidacaoService: {
    podeValidar: jest.fn(),
    validarMovimentacao: jest.fn(),
    aprovarTicket: jest.fn(),
    aprovarTarefa: jest.fn(),
  },
}))

const mockedService = ValidacaoService as jest.Mocked<typeof ValidacaoService>

describe('Validacoes', () => {
  beforeEach(() => {
    mockedService.podeValidar.mockReturnValue(true)
    mockedService.validarMovimentacao.mockResolvedValue({
      sucesso: true,
      mensagem: 'Movimentacao validada com sucesso.',
      movimentacao: mockMovimentacaoValidada as any,
    })
    mockedService.aprovarTicket.mockResolvedValue({
      sucesso: true,
      mensagem: 'Ticket aprovado com sucesso.',
      ticket: mockTicket as any,
    })
    mockedService.aprovarTarefa.mockResolvedValue({
      sucesso: true,
      mensagem: 'Tarefa aprovada com sucesso.',
      tarefa: mockTarefa as any,
    })
  })

  it('POST /validacoes/permissao deve confirmar permissao do usuario', async () => {
    const response = await request(app).post('/validacoes/permissao')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ podeValidar: true })
  })

  it('PATCH /validacoes/movimentacoes/:id/validar deve validar movimentacao', async () => {
    const response = await request(app).patch('/validacoes/movimentacoes/1/validar')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      sucesso: true,
      mensagem: 'Movimentacao validada com sucesso.',
    })
    expect(response.body.movimentacao).toMatchObject({
      id: mockMovimentacaoValidada.id,
      status: mockMovimentacaoValidada.status,
    })
  })

  it('PATCH /validacoes/tickets/:id/aprovar deve aprovar ticket', async () => {
    const response = await request(app).patch('/validacoes/tickets/21/aprovar')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      sucesso: true,
      mensagem: 'Ticket aprovado com sucesso.',
    })
  })

  it('PATCH /validacoes/tarefas/:id/aprovar deve aprovar tarefa', async () => {
    const response = await request(app).patch('/validacoes/tarefas/11/aprovar')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      sucesso: true,
      mensagem: 'Tarefa aprovada com sucesso.',
    })
  })
})
