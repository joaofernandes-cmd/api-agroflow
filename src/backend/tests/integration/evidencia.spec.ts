import request from 'supertest'
import app from '../../app'
import { EvidenciaService } from '../../services/evidencia.service'
import { TarefaService } from '../../services/tarefa.service'
import { mockEvidencia, mockTarefa } from '../helpers/fixtures'

jest.mock('../../services/evidencia.service', () => ({
  EvidenciaService: {
    listarTodas: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorTarefa: jest.fn(),
    criarMensagem: jest.fn(),
    criarAudio: jest.fn(),
    criarFoto: jest.fn(),
  },
}))

jest.mock('../../services/tarefa.service', () => ({
  TarefaService: {
    buscarPorId: jest.fn(),
  },
}))

const mockedService = EvidenciaService as jest.Mocked<typeof EvidenciaService>
const mockedTarefaService = TarefaService as jest.Mocked<typeof TarefaService>

describe('Evidencias', () => {
  beforeEach(() => {
    mockedService.listarTodas.mockResolvedValue([mockEvidencia as any])
    mockedService.buscarPorId.mockResolvedValue(mockEvidencia as any)
    mockedService.buscarPorTarefa.mockResolvedValue([mockEvidencia as any])
    mockedTarefaService.buscarPorId.mockResolvedValue(mockTarefa as any)
    mockedService.criarMensagem.mockResolvedValue({
      evidencia: mockEvidencia,
      mensagem: { evidencia_id: '00000000-0000-4000-8000-000000000501', conteudo: 'Mensagem descritiva valida' },
    } as any)
    mockedService.criarAudio.mockResolvedValue({
      evidencia: mockEvidencia,
      audio: { evidencia_id: '00000000-0000-4000-8000-000000000501', url_arquivo: 'audio.mp3' },
    } as any)
    mockedService.criarFoto.mockResolvedValue({
      evidencia: mockEvidencia,
      foto: { evidencia_id: '00000000-0000-4000-8000-000000000501', url_arquivo: 'foto.jpg', latitude: -19.9, longitude: -57.6 },
    } as any)
  })

  it('GET /evidencias deve listar evidencias', async () => {
    const response = await request(app).get('/evidencias')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockEvidencia])
  })

  it('GET /evidencias/:id deve buscar evidencias por id', async () => {
    const response = await request(app).get('/evidencias/00000000-0000-4000-8000-000000000501')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockEvidencia)
  })

  it('GET /evidencias/:id deve retornar 404 para evidencia inexistente', async () => {
    mockedService.buscarPorId.mockResolvedValueOnce(null)

    const response = await request(app).get('/evidencias/00000000-0000-4000-8000-999999999999')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Evidência não encontrada' })
  })

  it('GET /evidencias/tarefa/:tarefaId deve buscar evidencias da tarefa', async () => {
    const response = await request(app).get('/evidencias/tarefa/00000000-0000-4000-8000-000000000301')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockEvidencia])
    expect(mockedTarefaService.buscarPorId).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000301')
    expect(mockedService.buscarPorTarefa).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000301')
  })

  it('POST /evidencias/mensagens deve criar evidenca de mensagem', async () => {
    const response = await request(app).post('/evidencias/mensagens').send({
      usuarioId: 'user-003',
      conteudo: 'Mensagem descritiva valida',
    })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      evidencia: mockEvidencia,
      mensagem: { evidencia_id: '00000000-0000-4000-8000-000000000501', conteudo: 'Mensagem descritiva valida' },
    })
  })

  it('POST /evidencias/audios deve criar evidenca de audio', async () => {
    const response = await request(app).post('/evidencias/audios').send({
      usuarioId: 'user-003',
      urlArquivo: 'audio.mp3',
      duracao: 5,
    })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      evidencia: mockEvidencia,
      audio: { evidencia_id: '00000000-0000-4000-8000-000000000501', url_arquivo: 'audio.mp3' },
    })
  })

  it('POST /evidencias/fotos deve criar evidenca de foto', async () => {
    const response = await request(app).post('/evidencias/fotos').send({
      usuarioId: 'user-003',
      urlArquivo: 'foto.jpg',
      latitude: -19.9,
      longitude: -57.6,
    })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      evidencia: mockEvidencia,
      foto: { evidencia_id: '00000000-0000-4000-8000-000000000501', url_arquivo: 'foto.jpg' },
    })
  })

  it('POST /evidencias/audios deve rejeitar duracao invalida', async () => {
    const response = await request(app).post('/evidencias/audios').send({
      usuarioId: 'user-003',
      urlArquivo: 'audio.mp3',
      duracao: 'abc',
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Duração inválida' })
    expect(mockedService.criarAudio).not.toHaveBeenCalled()
  })

  it('POST /evidencias/fotos deve rejeitar payload incompleto', async () => {
    const response = await request(app).post('/evidencias/fotos').send({
      usuarioId: 'user-003',
      urlArquivo: 'foto.jpg',
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: 'Usuário, arquivo, latitude e longitude são obrigatórios',
    })
    expect(mockedService.criarFoto).not.toHaveBeenCalled()
  })

  it('POST /evidencias/fotos deve rejeitar coordenadas invalidas', async () => {
    const response = await request(app).post('/evidencias/fotos').send({
      usuarioId: 'user-003',
      urlArquivo: 'foto.jpg',
      latitude: 'abc',
      longitude: -57.6,
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Latitude ou longitude inválida' })
    expect(mockedService.criarFoto).not.toHaveBeenCalled()
  })

  it('POST /evidencias/fotos deve rejeitar violacao de regra de negocio', async () => {
    mockedService.criarFoto.mockRejectedValueOnce(
      new Error('Foto rejeitada: georreferenciamento inválido')
    )

    const response = await request(app).post('/evidencias/fotos').send({
      usuarioId: 'user-003',
      urlArquivo: 'foto.jpg',
      latitude: 100,
      longitude: -57.6,
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: 'Foto rejeitada: georreferenciamento inválido',
    })
  })
})
