import sql from '../../database/connection'
import { MovimentacaoRepository } from '../../repositories/movimentacao.repository'
import { TarefaRepository } from '../../repositories/tarefa.repository'
import { TicketRepository } from '../../repositories/ticket.repository'
import { UsuarioRepository } from '../../repositories/usuario.repository'
import {
  mockCapataz,
  mockMovimentacao,
  mockTarefa,
  mockTicket,
  mockSupervisor,
  MOVIMENTACAO_ID,
  TAREFA_ID,
  TICKET_ID,
  SUPERVISOR_ID,
} from '../helpers/fixtures'

const mockedSql = sql as jest.Mock & { begin: jest.Mock }

describe('Repositories com banco mockado', () => {
  beforeEach(() => {
    mockedSql.mockReset()
    mockedSql.begin.mockReset()
  })

  describe('UsuarioRepository', () => {
    it('buscarTodos deve retornar usuarios ordenados pelo banco', async () => {
      mockedSql.mockResolvedValueOnce([mockSupervisor, mockCapataz])

      await expect(UsuarioRepository.buscarTodos()).resolves.toEqual([mockSupervisor, mockCapataz])
      expect(mockedSql).toHaveBeenCalledTimes(1)
    })

    it('buscarPorId deve retornar usuario ou null', async () => {
      mockedSql.mockResolvedValueOnce([mockSupervisor])
      await expect(UsuarioRepository.buscarPorId(SUPERVISOR_ID)).resolves.toEqual(mockSupervisor)

      mockedSql.mockResolvedValueOnce([])
      await expect(UsuarioRepository.buscarPorId('usuario-inexistente')).resolves.toBeNull()
    })

    it('buscarPorLogin deve retornar primeiro usuario encontrado', async () => {
      mockedSql.mockResolvedValueOnce([mockSupervisor])

      await expect(UsuarioRepository.buscarPorLogin(mockSupervisor.login)).resolves.toEqual(mockSupervisor)
    })

    it('criar deve retornar usuario criado', async () => {
      mockedSql.mockResolvedValueOnce([mockSupervisor])

      await expect(
        UsuarioRepository.criar({
          retiro_id: mockSupervisor.retiro_id,
          nome: mockSupervisor.nome,
          identificador: mockSupervisor.identificador,
          login: mockSupervisor.login,
          senha_hash: mockSupervisor.senha_hash,
          status: mockSupervisor.status as any,
          cargo: mockSupervisor.cargo as any,
        })
      ).resolves.toEqual(mockSupervisor)
    })

    it('atualizar deve retornar usuario atualizado ou null', async () => {
      mockedSql.mockResolvedValueOnce([mockSupervisor])
      await expect(UsuarioRepository.atualizar(SUPERVISOR_ID, { nome: 'Supervisor Atualizado' })).resolves.toEqual(mockSupervisor)

      mockedSql.mockResolvedValueOnce([])
      await expect(UsuarioRepository.atualizar(SUPERVISOR_ID, { nome: 'Sem retorno' })).resolves.toBeNull()
    })

    it('remover deve executar delete sem retornar dados', async () => {
      mockedSql.mockResolvedValueOnce([])

      await expect(UsuarioRepository.remover(SUPERVISOR_ID)).resolves.toBeUndefined()
      expect(mockedSql).toHaveBeenCalledTimes(1)
    })
  })

  describe('TarefaRepository', () => {
    it('buscarPorId deve retornar tarefa ou null', async () => {
      mockedSql.mockResolvedValueOnce([mockTarefa])
      await expect(TarefaRepository.buscarPorId(TAREFA_ID)).resolves.toEqual(mockTarefa)

      mockedSql.mockResolvedValueOnce([])
      await expect(TarefaRepository.buscarPorId(TAREFA_ID)).resolves.toBeNull()
    })

    it('criar e atualizar devem retornar o registro do banco', async () => {
      mockedSql.mockResolvedValueOnce([mockTarefa])
      await expect(TarefaRepository.criar(mockTarefa as any)).resolves.toEqual(mockTarefa)

      mockedSql.mockResolvedValueOnce([mockTarefa])
      await expect(TarefaRepository.atualizar(TAREFA_ID, { status: 'concluido' } as any)).resolves.toEqual(mockTarefa)
    })

    it('atualizar deve retornar null quando banco nao retornar linha', async () => {
      mockedSql.mockResolvedValueOnce([])

      await expect(TarefaRepository.atualizar(TAREFA_ID, { status: 'concluido' } as any)).resolves.toBeNull()
    })

    it('remover deve executar delete', async () => {
      mockedSql.mockResolvedValueOnce([])

      await expect(TarefaRepository.remover(TAREFA_ID)).resolves.toBeUndefined()
      expect(mockedSql).toHaveBeenCalledTimes(1)
    })
  })

  describe('TicketRepository', () => {
    it('buscarPorId deve retornar ticket ou null', async () => {
      mockedSql.mockResolvedValueOnce([mockTicket])
      await expect(TicketRepository.buscarPorId(TICKET_ID)).resolves.toEqual(mockTicket)

      mockedSql.mockResolvedValueOnce([])
      await expect(TicketRepository.buscarPorId(TICKET_ID)).resolves.toBeNull()
    })

    it('criar e atualizar devem retornar o registro do banco', async () => {
      mockedSql.mockResolvedValueOnce([mockTicket])
      await expect(TicketRepository.criar(mockTicket as any)).resolves.toEqual(mockTicket)

      mockedSql.mockResolvedValueOnce([mockTicket])
      await expect(TicketRepository.atualizar(TICKET_ID, { prioridade: 'alta' } as any)).resolves.toEqual(mockTicket)
    })

    it('atualizar deve retornar null quando banco nao retornar linha', async () => {
      mockedSql.mockResolvedValueOnce([])

      await expect(TicketRepository.atualizar(TICKET_ID, { prioridade: 'alta' } as any)).resolves.toBeNull()
    })
  })

  describe('MovimentacaoRepository', () => {
    function criarTransaction(resultados: unknown[][] = []) {
      const transaction = jest.fn()
      resultados.forEach(resultado => transaction.mockResolvedValueOnce(resultado))
      transaction.mockResolvedValue([])
      mockedSql.begin.mockImplementation(async callback => callback(transaction))
      return transaction
    }

    it('buscarPorId deve retornar movimentacao ou null', async () => {
      mockedSql.mockResolvedValueOnce([mockMovimentacao])
      await expect(MovimentacaoRepository.buscarPorId(MOVIMENTACAO_ID)).resolves.toEqual(mockMovimentacao)

      mockedSql.mockResolvedValueOnce([])
      await expect(MovimentacaoRepository.buscarPorId(MOVIMENTACAO_ID)).resolves.toBeNull()
    })

    it('criar deve usar transacao e retornar movimentacao criada', async () => {
      const transaction = criarTransaction([[{ id: MOVIMENTACAO_ID }]])
      mockedSql.mockResolvedValueOnce([mockMovimentacao])

      await expect(MovimentacaoRepository.criar(mockMovimentacao as any)).resolves.toEqual(mockMovimentacao)
      expect(mockedSql.begin).toHaveBeenCalledTimes(1)
      expect(transaction).toHaveBeenCalled()
    })

    it('criar deve falhar quando registro criado nao for encontrado depois da transacao', async () => {
      criarTransaction([[{ id: MOVIMENTACAO_ID }]])
      mockedSql.mockResolvedValueOnce([])

      await expect(MovimentacaoRepository.criar(mockMovimentacao as any)).rejects.toThrow(
        'Movimentacao criada, mas nao encontrada'
      )
    })

    it('atualizar deve retornar null quando precisa atualizar detalhes mas registro nao existe', async () => {
      mockedSql.mockResolvedValueOnce([])

      await expect(
        MovimentacaoRepository.atualizar(MOVIMENTACAO_ID, { tipo: 'morte' } as any)
      ).resolves.toBeNull()
      expect(mockedSql.begin).not.toHaveBeenCalled()
    })

    it('atualizar deve usar transacao e retornar registro atualizado', async () => {
      criarTransaction([[{ id: MOVIMENTACAO_ID }]])
      mockedSql.mockResolvedValueOnce([mockMovimentacao])

      await expect(
        MovimentacaoRepository.atualizar(MOVIMENTACAO_ID, { status: 'validado' } as any)
      ).resolves.toEqual(mockMovimentacao)
    })

    it('remover deve apagar detalhes e registro principal em transacao', async () => {
      const transaction = criarTransaction()

      await expect(MovimentacaoRepository.remover(MOVIMENTACAO_ID)).resolves.toBeUndefined()
      expect(mockedSql.begin).toHaveBeenCalledTimes(1)
      expect(transaction).toHaveBeenCalledTimes(6)
    })
  })
})
