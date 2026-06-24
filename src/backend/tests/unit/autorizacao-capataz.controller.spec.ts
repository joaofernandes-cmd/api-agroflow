import { MovimentacaoController } from '../../controllers/movimentacao.controller'
import { TarefaController } from '../../controllers/tarefa.controller'
import { EvidenciaController } from '../../controllers/evidencia.controller'
import { MovimentacaoService } from '../../services/movimentacao.service'
import { TarefaService } from '../../services/tarefa.service'
import { EvidenciaService } from '../../services/evidencia.service'
import { mockCapataz, mockMovimentacao, mockSupervisor, mockTarefa } from '../helpers/fixtures'

jest.mock('../../services/movimentacao.service', () => ({
  MovimentacaoService: {
    buscarPorId: jest.fn(),
    atualizar: jest.fn(),
    sincronizar: jest.fn(),
  },
}))

jest.mock('../../services/tarefa.service', () => ({
  TarefaService: {
    buscarPorId: jest.fn(),
    atualizarStatus: jest.fn(),
  },
}))

jest.mock('../../services/evidencia.service', () => ({
  EvidenciaService: {
    buscarPorTarefa: jest.fn(),
  },
}))

const mockedMovimentacaoService = MovimentacaoService as jest.Mocked<typeof MovimentacaoService>
const mockedTarefaService = TarefaService as jest.Mocked<typeof TarefaService>
const mockedEvidenciaService = EvidenciaService as jest.Mocked<typeof EvidenciaService>

function criarResponse() {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

function criarRequest(usuario: any, params: Record<string, string>, body: Record<string, unknown> = {}) {
  return {
    usuario,
    params,
    body,
    query: {},
  } as any
}

describe('Autorizacao por dono para capataz', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('bloqueia capataz ao concluir tarefa atribuida a outro capataz', async () => {
    mockedTarefaService.buscarPorId.mockResolvedValueOnce({
      ...mockTarefa,
      atribuida_a: '00000000-0000-4000-8000-999999999999',
    } as any)

    const req = criarRequest(mockCapataz, { id: mockTarefa.id }, { status: 'concluido' })
    const res = criarResponse()

    await TarefaController.atualizarStatus(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ error: 'Acesso negado: tarefa de outro capataz' })
    expect(mockedTarefaService.atualizarStatus).not.toHaveBeenCalled()
  })

  it('permite supervisor alterar status de tarefa de qualquer retiro', async () => {
    const tarefaDeOutroRetiro = {
      ...mockTarefa,
      retiro_id: '00000000-0000-4000-8000-999999999998',
      atribuida_a: '00000000-0000-4000-8000-999999999999',
    }

    mockedTarefaService.buscarPorId.mockResolvedValueOnce(tarefaDeOutroRetiro as any)
    mockedTarefaService.atualizarStatus.mockResolvedValueOnce({
      ...tarefaDeOutroRetiro,
      status: 'concluido',
    } as any)

    const req = criarRequest(mockSupervisor, { id: mockTarefa.id }, { status: 'concluido' })
    const res = criarResponse()

    await TarefaController.atualizarStatus(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(mockedTarefaService.atualizarStatus).toHaveBeenCalledWith(mockTarefa.id, 'concluido')
  })

  it('bloqueia capataz ao alterar movimentacao de outro capataz', async () => {
    mockedMovimentacaoService.buscarPorId.mockResolvedValueOnce({
      ...mockMovimentacao,
      capataz_id: '00000000-0000-4000-8000-999999999999',
    } as any)

    const req = criarRequest(mockCapataz, { id: mockMovimentacao.id }, { quantidade: 2 })
    const res = criarResponse()

    await MovimentacaoController.atualizar(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ error: 'Acesso negado: movimentação de outro capataz' })
    expect(mockedMovimentacaoService.atualizar).not.toHaveBeenCalled()
  })

  it('bloqueia capataz ao consultar evidencias de tarefa de outro capataz', async () => {
    mockedTarefaService.buscarPorId.mockResolvedValueOnce({
      ...mockTarefa,
      atribuida_a: '00000000-0000-4000-8000-999999999999',
    } as any)

    const req = criarRequest(mockCapataz, { tarefaId: mockTarefa.id })
    const res = criarResponse()

    await EvidenciaController.buscarPorTarefa(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ error: 'Acesso negado: tarefa de outro capataz' })
    expect(mockedEvidenciaService.buscarPorTarefa).not.toHaveBeenCalled()
  })
})
