import sql from '../../database/connection'
import { MovimentacaoRepository } from '../../repositories/movimentacao.repository'
import { TarefaRepository } from '../../repositories/tarefa.repository'
import { TicketRepository } from '../../repositories/ticket.repository'
import { UsuarioRepository } from '../../repositories/usuario.repository'
import { EvidenciaRepository } from '../../repositories/evidencia.repository'
import { EvidenciaAudioRepository } from '../../repositories/evidencia-audio.repository'
import { EvidenciaFotoRepository } from '../../repositories/evidencia-foto.repository'
import { EvidenciaMensagemRepository } from '../../repositories/evidencia-mensagem.repository'
import { EvidenciaMovimentacaoRepository } from '../../repositories/evidencia-movimentacao.repository'
import { EvidenciaTarefaRepository } from '../../repositories/evidencia-tarefa.repository'
import { EvidenciaTicketRepository } from '../../repositories/evidencia-ticket.repository'
import {
  mockCapataz,
  mockEvidencia,
  mockMovimentacao,
  mockTarefa,
  mockTicket,
  mockSupervisor,
  EVIDENCIA_ID,
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

  describe('EvidenciaRepository', () => {
    it('buscarPorId deve retornar evidencia ou null', async () => {
      mockedSql.mockResolvedValueOnce([mockEvidencia])
      await expect(EvidenciaRepository.buscarPorId(EVIDENCIA_ID)).resolves.toEqual(mockEvidencia)

      mockedSql.mockResolvedValueOnce([])
      await expect(EvidenciaRepository.buscarPorId(EVIDENCIA_ID)).resolves.toBeNull()
    })

    it('criar e atualizar devem retornar evidencia persistida', async () => {
      mockedSql.mockResolvedValueOnce([mockEvidencia])
      await expect(EvidenciaRepository.criar(mockEvidencia as any)).resolves.toEqual(mockEvidencia)

      mockedSql.mockResolvedValueOnce([mockEvidencia])
      await expect(EvidenciaRepository.atualizar(EVIDENCIA_ID, { tipo: 'foto' } as any)).resolves.toEqual(mockEvidencia)
    })

    it('atualizar deve retornar null e remover deve executar delete', async () => {
      mockedSql.mockResolvedValueOnce([])
      await expect(EvidenciaRepository.atualizar(EVIDENCIA_ID, { tipo: 'audio' } as any)).resolves.toBeNull()

      mockedSql.mockResolvedValueOnce([])
      await expect(EvidenciaRepository.remover(EVIDENCIA_ID)).resolves.toBeUndefined()
    })
  })

  describe('Repositories de tipos de evidencia', () => {
    it('foto deve buscar, criar, atualizar e remover registro', async () => {
      const foto = {
        evidencia_id: EVIDENCIA_ID,
        url_arquivo: 'https://storage.test/foto.jpg',
        latitude: -20.1,
        longitude: -54.2,
      }

      mockedSql.mockResolvedValueOnce([foto])
      await expect(EvidenciaFotoRepository.buscarPorId(EVIDENCIA_ID)).resolves.toEqual(foto)

      mockedSql.mockResolvedValueOnce([])
      await expect(EvidenciaFotoRepository.buscarPorId(EVIDENCIA_ID)).resolves.toBeNull()

      mockedSql.mockResolvedValueOnce([foto])
      await expect(EvidenciaFotoRepository.criar(foto)).resolves.toEqual(foto)

      mockedSql.mockResolvedValueOnce([foto])
      await expect(EvidenciaFotoRepository.atualizar(EVIDENCIA_ID, { latitude: -20.2 })).resolves.toEqual(foto)

      mockedSql.mockResolvedValueOnce([])
      await expect(EvidenciaFotoRepository.remover(EVIDENCIA_ID)).resolves.toBeUndefined()
    })

    it('audio deve buscar, criar, atualizar e remover registro', async () => {
      const audio = {
        evidencia_id: EVIDENCIA_ID,
        url_arquivo: 'https://storage.test/audio.webm',
      }

      mockedSql.mockResolvedValueOnce([audio])
      await expect(EvidenciaAudioRepository.buscarPorId(EVIDENCIA_ID)).resolves.toEqual(audio)

      mockedSql.mockResolvedValueOnce([])
      await expect(EvidenciaAudioRepository.buscarPorId(EVIDENCIA_ID)).resolves.toBeNull()

      mockedSql.mockResolvedValueOnce([audio])
      await expect(EvidenciaAudioRepository.criar(audio)).resolves.toEqual(audio)

      mockedSql.mockResolvedValueOnce([audio])
      await expect(EvidenciaAudioRepository.atualizar(EVIDENCIA_ID, { url_arquivo: audio.url_arquivo })).resolves.toEqual(audio)

      mockedSql.mockResolvedValueOnce([])
      await expect(EvidenciaAudioRepository.remover(EVIDENCIA_ID)).resolves.toBeUndefined()
    })

    it('mensagem deve buscar, criar, atualizar e remover registro', async () => {
      const mensagem = {
        evidencia_id: EVIDENCIA_ID,
        conteudo: 'Registro observado em campo.',
      }

      mockedSql.mockResolvedValueOnce([mensagem])
      await expect(EvidenciaMensagemRepository.buscarPorId(EVIDENCIA_ID)).resolves.toEqual(mensagem)

      mockedSql.mockResolvedValueOnce([])
      await expect(EvidenciaMensagemRepository.buscarPorId(EVIDENCIA_ID)).resolves.toBeNull()

      mockedSql.mockResolvedValueOnce([mensagem])
      await expect(EvidenciaMensagemRepository.criar(mensagem)).resolves.toEqual(mensagem)

      mockedSql.mockResolvedValueOnce([mensagem])
      await expect(EvidenciaMensagemRepository.atualizar(EVIDENCIA_ID, { conteudo: mensagem.conteudo })).resolves.toEqual(mensagem)

      mockedSql.mockResolvedValueOnce([])
      await expect(EvidenciaMensagemRepository.remover(EVIDENCIA_ID)).resolves.toBeUndefined()
    })
  })

  describe('Repositories de vinculos de evidencia', () => {
    it('movimentacao deve buscar, criar e listar evidencias detalhadas', async () => {
      const vinculo = { evidencia_id: EVIDENCIA_ID, movimentacao_id: MOVIMENTACAO_ID }
      const detalhe = { ...mockEvidencia, url_arquivo: 'https://storage.test/foto.jpg' }

      mockedSql.mockResolvedValueOnce([vinculo])
      await expect(EvidenciaMovimentacaoRepository.buscarPorId(EVIDENCIA_ID, MOVIMENTACAO_ID)).resolves.toEqual(vinculo)

      mockedSql.mockResolvedValueOnce([])
      await expect(EvidenciaMovimentacaoRepository.buscarPorId(EVIDENCIA_ID, MOVIMENTACAO_ID)).resolves.toBeNull()

      mockedSql.mockResolvedValueOnce([vinculo])
      await expect(EvidenciaMovimentacaoRepository.criar(vinculo)).resolves.toEqual(vinculo)

      mockedSql.mockResolvedValueOnce([detalhe])
      await expect(EvidenciaMovimentacaoRepository.buscarEvidenciasDaMovimentacao(MOVIMENTACAO_ID)).resolves.toEqual([detalhe])
    })

    it('tarefa deve buscar, criar e listar evidencias detalhadas', async () => {
      const vinculo = { evidencia_id: EVIDENCIA_ID, tarefa_id: TAREFA_ID }
      const detalhe = { ...mockEvidencia, conteudo: 'Tarefa concluida.' }

      mockedSql.mockResolvedValueOnce([vinculo])
      await expect(EvidenciaTarefaRepository.buscarPorId(EVIDENCIA_ID, TAREFA_ID)).resolves.toEqual(vinculo)

      mockedSql.mockResolvedValueOnce([])
      await expect(EvidenciaTarefaRepository.buscarPorId(EVIDENCIA_ID, TAREFA_ID)).resolves.toBeNull()

      mockedSql.mockResolvedValueOnce([vinculo])
      await expect(EvidenciaTarefaRepository.criar(vinculo)).resolves.toEqual(vinculo)

      mockedSql.mockResolvedValueOnce([detalhe])
      await expect(EvidenciaTarefaRepository.buscarEvidenciasDaTarefa(TAREFA_ID)).resolves.toEqual([detalhe])
    })

    it('ticket deve buscar e criar vinculo', async () => {
      const vinculo = { evidencia_id: EVIDENCIA_ID, ticket_id: TICKET_ID }

      mockedSql.mockResolvedValueOnce([vinculo])
      await expect(EvidenciaTicketRepository.buscarPorId(EVIDENCIA_ID, TICKET_ID)).resolves.toEqual(vinculo)

      mockedSql.mockResolvedValueOnce([])
      await expect(EvidenciaTicketRepository.buscarPorId(EVIDENCIA_ID, TICKET_ID)).resolves.toBeNull()

      mockedSql.mockResolvedValueOnce([vinculo])
      await expect(EvidenciaTicketRepository.criar(vinculo)).resolves.toEqual(vinculo)
    })
  })
})
