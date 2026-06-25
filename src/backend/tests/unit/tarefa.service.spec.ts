import { TarefaService } from '../../services/tarefa.service'
import { TarefaRepository } from '../../repositories/tarefa.repository'
import { mockSupervisor, mockTarefa } from '../helpers/fixtures'

jest.mock('../../repositories/tarefa.repository', () => ({
  TarefaRepository: {
    criar: jest.fn(),
    buscarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    atualizarStatus: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
  },
}))

const mockedRepository = TarefaRepository as jest.Mocked<typeof TarefaRepository>

describe('TarefaService', () => {
  beforeEach(() => {
    mockedRepository.criar.mockResolvedValue(mockTarefa as any)
    mockedRepository.buscarTodos.mockResolvedValue([mockTarefa as any])
    mockedRepository.buscarPorId.mockResolvedValue(mockTarefa as any)
    mockedRepository.atualizarStatus.mockResolvedValue(mockTarefa as any)
    mockedRepository.atualizar.mockResolvedValue(mockTarefa as any)
    mockedRepository.remover.mockResolvedValue(undefined)
  })

  it('validarCamposObrigatorios deve exigir atribuida_a', () => {
    expect(() =>
      TarefaService.validarCamposObrigatorios({
        ...(mockTarefa as any),
        atribuida_a: '' as any,
      })
    ).toThrow('Campo "atribuida_a" (usuário) é obrigatório')
  })

  it('validarCamposObrigatorios deve exigir prioridade', () => {
    expect(() =>
      TarefaService.validarCamposObrigatorios({
        ...(mockTarefa as any),
        prioridade: '' as any,
      })
    ).toThrow('Campo "prioridade" é obrigatório')
  })

  it('validarCamposObrigatorios deve exigir categoria', () => {
    expect(() =>
      TarefaService.validarCamposObrigatorios({
        ...(mockTarefa as any),
        categoria: '',
      })
    ).toThrow('Campo "categoria" é obrigatório')
  })

  it('validarCamposObrigatorios deve exigir descricao', () => {
    expect(() =>
      TarefaService.validarCamposObrigatorios({
        ...(mockTarefa as any),
        descricao: '   ',
      })
    ).toThrow('Campo "descricao" é obrigatório')
  })

  it('criar deve bloquear usuario nao supervisor', async () => {
    await expect(
      TarefaService.criar(
        {
          retiro_id: '00000000-0000-4000-8000-000000000001',
          atribuida_a: mockSupervisor.id,
          descricao: mockTarefa.descricao,
          categoria: mockTarefa.categoria,
          prioridade: mockTarefa.prioridade,
        } as any,
        { ...mockSupervisor, cargo: 'capataz' } as any
      )
    ).rejects.toThrow('Apenas Supervisores podem criar tarefas')
  })

  it('criar deve aceitar tarefa valida', async () => {
    const tarefa = await TarefaService.criar(
      {
        retiro_id: '00000000-0000-4000-8000-000000000001',
        atribuida_a: mockSupervisor.id,
        descricao: mockTarefa.descricao,
        categoria: mockTarefa.categoria,
        prioridade: mockTarefa.prioridade,
      } as any,
      mockSupervisor as any
    )

    expect(tarefa).toEqual(mockTarefa)
    expect(mockedRepository.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        criada_por: mockSupervisor.id,
        status: 'pendente',
      })
    )
  })

  it('buscarParaDashboard deve retornar apenas tarefas aprovadas', async () => {
    mockedRepository.buscarTodos.mockResolvedValueOnce([
      mockTarefa as any,
      { ...mockTarefa, id: '00000000-0000-4000-8000-000000000302', status: 'aprovado' } as any,
    ])

    const tarefas = await TarefaService.buscarParaDashboard('00000000-0000-4000-8000-000000000001')

    expect(tarefas).toEqual([{ ...mockTarefa, id: '00000000-0000-4000-8000-000000000302', status: 'aprovado' }])
  })

  it('listarPorStatus deve filtrar por status e retiro', async () => {
    mockedRepository.buscarTodos.mockResolvedValueOnce([
      mockTarefa as any,
      { ...mockTarefa, id: '00000000-0000-4000-8000-000000000302', status: 'aprovado', retiro_id: '00000000-0000-4000-8000-000000000002' } as any,
    ])

    const tarefas = await TarefaService.listarPorStatus('pendente', '00000000-0000-4000-8000-000000000001')

    expect(tarefas).toEqual([mockTarefa])
  })

  it('listarPorUsuario deve filtrar por usuario', async () => {
    const tarefas = await TarefaService.listarPorUsuario(mockTarefa.atribuida_a as any)

    expect(tarefas).toEqual([mockTarefa])
  })

  it('listarPorPrioridade deve filtrar por prioridade', async () => {
    const tarefas = await TarefaService.listarPorPrioridade('alta', '00000000-0000-4000-8000-000000000001')

    expect(tarefas).toEqual([mockTarefa])
  })

  it('listarPorCategoria deve filtrar por categoria', async () => {
    const tarefas = await TarefaService.listarPorCategoria(mockTarefa.categoria, '00000000-0000-4000-8000-000000000001')

    expect(tarefas).toEqual([mockTarefa])
  })

  it('buscarPorId deve delegar para o repository', async () => {
    const tarefa = await TarefaService.buscarPorId('00000000-0000-4000-8000-000000000301')

    expect(tarefa).toEqual(mockTarefa)
  })

  it('listarTodas deve delegar para o repository', async () => {
    const tarefas = await TarefaService.listarTodas()

    expect(tarefas).toEqual([mockTarefa])
  })

  it('atualizarStatus deve retornar null quando tarefa nao existe', async () => {
    mockedRepository.buscarPorId.mockResolvedValueOnce(null)

    const tarefa = await TarefaService.atualizarStatus('00000000-0000-4000-8000-000000000999', 'aprovado')

    expect(tarefa).toBeNull()
  })

  it('atualizarStatus deve atualizar tarefa existente', async () => {
    const tarefa = await TarefaService.atualizarStatus('00000000-0000-4000-8000-000000000301', 'aprovado')

    expect(tarefa).toEqual(mockTarefa)
    expect(mockedRepository.atualizar).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000301', expect.objectContaining({ status: 'aprovado' }))
  })

  it('atualizar deve retornar null quando tarefa nao existe', async () => {
    mockedRepository.buscarPorId.mockResolvedValueOnce(null)

    const tarefa = await TarefaService.atualizar('00000000-0000-4000-8000-000000000999', { descricao: 'Nova descricao' })

    expect(tarefa).toBeNull()
  })

  it('atualizar deve revalidar quando houver alteracao estrutural', async () => {
    const tarefa = await TarefaService.atualizar('00000000-0000-4000-8000-000000000301', {
      descricao: 'Descricao atualizada',
      prioridade: 'alta',
      categoria: 'manutencao',
      atribuida_a: mockSupervisor.id,
    })

    expect(tarefa).toEqual(mockTarefa)
  })

  it('contarPorStatus deve contar por status e retiro', async () => {
    mockedRepository.buscarTodos.mockResolvedValueOnce([
      mockTarefa as any,
      { ...mockTarefa, id: '00000000-0000-4000-8000-000000000302', status: 'aprovado', retiro_id: '00000000-0000-4000-8000-000000000001' } as any,
      { ...mockTarefa, id: '00000000-0000-4000-8000-000000000303', status: 'aprovado', retiro_id: '00000000-0000-4000-8000-000000000002' } as any,
    ])

    const contagem = await TarefaService.contarPorStatus('00000000-0000-4000-8000-000000000001')

    expect(contagem).toEqual({ pendente: 1, concluido: 0, aprovado: 1 })
  })

  it('remover deve delegar para o repository', async () => {
    await TarefaService.remover('00000000-0000-4000-8000-000000000301')

    expect(mockedRepository.remover).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000301')
  })
})
