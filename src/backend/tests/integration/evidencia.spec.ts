import request from 'supertest'
import app from '../../app'
import { EvidenciaService } from '../../services/evidencia.service'
import { mockEvidencia } from '../helpers/fixtures'

jest.mock('../../services/evidencia.service', () => ({
  EvidenciaService: {
    listarTodas: jest.fn(),
    buscarPorId: jest.fn(),
    criarMensagem: jest.fn(),
    criarAudio: jest.fn(),
    criarFoto: jest.fn(),
  },
}))

const mockedService = EvidenciaService as jest.Mocked<typeof EvidenciaService>

describe('Evidencias', () => {
  beforeEach(() => {
    mockedService.listarTodas.mockResolvedValue([mockEvidencia as any])
    mockedService.buscarPorId.mockResolvedValue(mockEvidencia as any)
    mockedService.criarMensagem.mockResolvedValue({
      evidencia: mockEvidencia,
      mensagem: { evidencia_id: 31, conteudo: 'Mensagem descritiva valida' },
    } as any)
    mockedService.criarAudio.mockResolvedValue({
      evidencia: mockEvidencia,
      audio: { evidencia_id: 31, url_arquivo: 'audio.mp3' },
    } as any)
    mockedService.criarFoto.mockResolvedValue({
      evidencia: mockEvidencia,
      foto: { evidencia_id: 31, url_arquivo: 'foto.jpg', latitude: -19.9, longitude: -57.6 },
    } as any)
  })

  it('GET /evidencias deve listar evidencias', async () => {
    const response = await request(app).get('/evidencias')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([mockEvidencia])
  })

  it('GET /evidencias/:id deve buscar evidencias por id', async () => {
    const response = await request(app).get('/evidencias/31')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockEvidencia)
  })

  it('POST /evidencias/mensagens deve criar evidenca de mensagem', async () => {
    const response = await request(app).post('/evidencias/mensagens').send({
      usuarioId: 'user-003',
      conteudo: 'Mensagem descritiva valida',
    })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      evidencia: mockEvidencia,
      mensagem: { evidencia_id: 31, conteudo: 'Mensagem descritiva valida' },
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
      audio: { evidencia_id: 31, url_arquivo: 'audio.mp3' },
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
      foto: { evidencia_id: 31, url_arquivo: 'foto.jpg' },
    })
  })
})
