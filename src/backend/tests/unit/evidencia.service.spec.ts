import { EvidenciaService } from '../../services/evidencia.service'
import { EvidenciaRepository } from '../../repositories/evidencia.repository'
import { EvidenciaFotoRepository } from '../../repositories/evidencia-foto.repository'
import { EvidenciaAudioRepository } from '../../repositories/evidencia-audio.repository'
import { EvidenciaMensagemRepository } from '../../repositories/evidencia-mensagem.repository'
import { mockEvidencia } from '../helpers/fixtures'

jest.mock('../../repositories/evidencia.repository', () => ({
  EvidenciaRepository: {
    criar: jest.fn(),
    buscarPorId: jest.fn(),
    buscarTodos: jest.fn(),
  },
}))

jest.mock('../../repositories/evidencia-foto.repository', () => ({
  EvidenciaFotoRepository: {
    criar: jest.fn(),
  },
}))

jest.mock('../../repositories/evidencia-audio.repository', () => ({
  EvidenciaAudioRepository: {
    criar: jest.fn(),
  },
}))

jest.mock('../../repositories/evidencia-mensagem.repository', () => ({
  EvidenciaMensagemRepository: {
    criar: jest.fn(),
  },
}))

const mockedEvidenciaRepo = EvidenciaRepository as jest.Mocked<typeof EvidenciaRepository>
const mockedFotoRepo = EvidenciaFotoRepository as jest.Mocked<typeof EvidenciaFotoRepository>
const mockedAudioRepo = EvidenciaAudioRepository as jest.Mocked<typeof EvidenciaAudioRepository>
const mockedMensagemRepo = EvidenciaMensagemRepository as jest.Mocked<typeof EvidenciaMensagemRepository>

describe('EvidenciaService', () => {
  beforeEach(() => {
    mockedEvidenciaRepo.criar.mockResolvedValue(mockEvidencia as any)
    mockedEvidenciaRepo.buscarPorId.mockResolvedValue(mockEvidencia as any)
    mockedEvidenciaRepo.buscarTodos.mockResolvedValue([mockEvidencia as any])
    mockedFotoRepo.criar.mockResolvedValue({
      evidencia_id: mockEvidencia.id,
      url_arquivo: 'foto.jpg',
      latitude: -20,
      longitude: -55,
    } as any)
    mockedAudioRepo.criar.mockResolvedValue({
      evidencia_id: mockEvidencia.id,
      url_arquivo: 'audio.mp3',
    } as any)
    mockedMensagemRepo.criar.mockImplementation(async (input: any) => ({
      evidencia_id: input.evidencia_id,
      conteudo: input.conteudo,
    }))
  })

  it('validarGeorreferenciamento deve aceitar coordenadas validas', () => {
    expect(() => EvidenciaService.validarGeorreferenciamento(-20, -55)).not.toThrow()
  })

  it('validarGeorreferenciamento deve rejeitar latitude invalida', () => {
    expect(() => EvidenciaService.validarGeorreferenciamento(-100, -55)).toThrow(
      'Foto rejeitada: georreferenciamento inválido ou ausente.'
    )
  })

  it('validarGeorreferenciamento deve rejeitar longitude invalida', () => {
    expect(() => EvidenciaService.validarGeorreferenciamento(-20, 200)).toThrow(
      'Foto rejeitada: georreferenciamento inválido ou ausente.'
    )
  })

  it('validarEvidenciaDescritiva deve validar mensagem e audio', () => {
    expect(() => EvidenciaService.validarEvidenciaDescritiva('mensagem', { conteudo: 'Texto com tamanho' })).not.toThrow()
    expect(() => EvidenciaService.validarEvidenciaDescritiva('audio', { duracao: 3 })).not.toThrow()
  })

  it('validarEvidenciaDescritiva deve rejeitar mensagem curta', () => {
    expect(() => EvidenciaService.validarEvidenciaDescritiva('mensagem', { conteudo: 'curta' })).toThrow(
      'Mensagem rejeitada: mínimo 10 caracteres obrigatório'
    )
  })

  it('validarEvidenciaDescritiva deve rejeitar audio curto', () => {
    expect(() => EvidenciaService.validarEvidenciaDescritiva('audio', { duracao: 2 })).toThrow(
      'Áudio rejeitado: mínimo 3 segundos obrigatório'
    )
  })

  it('criarFoto deve rejeitar metadados ausentes', async () => {
    await expect(EvidenciaService.criarFoto('user-003' as any, 'foto.jpg')).rejects.toThrow(
      'Foto rejeitada: georreferenciamento inválido ou ausente. A imagem deve ter coordenadas GPS nos metadados EXIF'
    )
  })

  it('criarFoto deve registrar evidencia e foto', async () => {
    const resultado = await EvidenciaService.criarFoto('user-003' as any, 'foto.jpg', -20, -55)

    expect(resultado).toEqual({
      evidencia: mockEvidencia,
      foto: {
        evidencia_id: mockEvidencia.id,
        url_arquivo: 'foto.jpg',
        latitude: -20,
        longitude: -55,
      },
    })
  })

  it('criarAudio deve rejeitar duracao curta', async () => {
    await expect(EvidenciaService.criarAudio('user-003' as any, 'audio.mp3', 2)).rejects.toThrow(
      'Áudio rejeitado: mínimo 3 segundos obrigatório'
    )
  })

  it('criarAudio deve registrar evidencia e audio', async () => {
    const resultado = await EvidenciaService.criarAudio('user-003' as any, 'audio.mp3', 4)

    expect(resultado).toEqual({
      evidencia: mockEvidencia,
      audio: {
        evidencia_id: mockEvidencia.id,
        url_arquivo: 'audio.mp3',
      },
    })
  })

  it('criarMensagem deve rejeitar conteudo curto', async () => {
    await expect(EvidenciaService.criarMensagem('user-003' as any, 'curta')).rejects.toThrow(
      'Mensagem rejeitada: mínimo 10 caracteres obrigatório'
    )
  })

  it('criarMensagem deve registrar evidencia e mensagem', async () => {
    const resultado = await EvidenciaService.criarMensagem('user-003' as any, 'Mensagem valida de evidencia')

    expect(resultado).toEqual({
      evidencia: mockEvidencia,
      mensagem: {
        evidencia_id: mockEvidencia.id,
        conteudo: 'Mensagem valida de evidencia',
      },
    })
  })

  it('buscarPorId deve delegar para o repository', async () => {
    const evidencia = await EvidenciaService.buscarPorId(31)

    expect(evidencia).toEqual(mockEvidencia)
  })

  it('listarTodas deve delegar para o repository', async () => {
    const evidencias = await EvidenciaService.listarTodas()

    expect(evidencias).toEqual([mockEvidencia])
  })
})
