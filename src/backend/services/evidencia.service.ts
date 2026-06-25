import { Evidencia, EvidenciaDetalhada, EvidenciaInput, TipoEvidencia } from '../models/evidencia.model'
import { UUID } from '../models/uuid'
import { EvidenciaFoto, EvidenciaFotoInput } from '../models/evidencia-foto.model'
import { EvidenciaAudio, EvidenciaAudioInput } from '../models/evidencia-audio.model'
import { EvidenciaMensagem, EvidenciaMensagemInput } from '../models/evidencia-mensagem.model'
import { EvidenciaRepository } from '../repositories/evidencia.repository'
import { EvidenciaFotoRepository } from '../repositories/evidencia-foto.repository'
import { EvidenciaAudioRepository } from '../repositories/evidencia-audio.repository'
import { EvidenciaMensagemRepository } from '../repositories/evidencia-mensagem.repository'
import { EvidenciaTarefaRepository } from '../repositories/evidencia-tarefa.repository'
import { EvidenciaMovimentacaoRepository } from '../repositories/evidencia-movimentacao.repository'

export const EvidenciaService = {
  // RN04: Validar georreferenciamento de foto (latitude e longitude obrigatórias e válidas)
  // Latitude: -90 (sul) a +90 (norte)
  // Longitude: -180 (oeste) a +180 (leste)
  validarGeorreferenciamento(latitude: number, longitude: number): void {
    // Valida intervalo de latitude (polo sul = -90, polo norte = +90)
    if (latitude < -90 || latitude > 90) {
      throw new Error('Foto rejeitada: georreferenciamento inválido ou ausente.')
    }

    // Valida intervalo de longitude (oeste = -180, leste = +180)
    if (longitude < -180 || longitude > 180) {
      throw new Error('Foto rejeitada: georreferenciamento inválido ou ausente.')
    }
  },

  // RN08: Validar que evidência descritiva existe e atende requisitos mínimos
  // Mensagem: mínimo 10 caracteres
  // Áudio: mínimo 3 segundos (validado durante upload)
  validarEvidenciaDescritiva(tipo: TipoEvidencia, dados: any): void {
    if (tipo === 'mensagem') {
      // Rejeita mensagens vazias ou com menos de 10 caracteres
      if (!dados.conteudo || dados.conteudo.trim().length < 10) {
        throw new Error('Mensagem rejeitada: mínimo 10 caracteres obrigatório')
      }
    }
    if (tipo === 'audio') {
      // Rejeita áudios com menos de 3 segundos (duracao em segundos)
      if (!dados.duracao || dados.duracao < 3) {
        throw new Error('Áudio rejeitado: mínimo 3 segundos obrigatório')
      }
    }
  },

  // RN04: Criar evidência de foto + validar georreferenciamento dos metadados EXIF
  // Sistema automaticamente extrai latitude/longitude dos metadados da imagem (não é input do usuário)
  // Se georreferenciamento está ausente ou inválido, rejeita a foto
  async criarFoto(
    usuarioId: UUID,
    urlArquivo: string,
    latitude?: number,
    longitude?: number,
    tarefaId?: UUID
  ): Promise<{ evidencia: Evidencia; foto: EvidenciaFoto }> {
    // RN04: Se georreferenciamento foi extraído dos metadados, valida se está dentro dos intervalos válidos
    if (latitude === undefined || longitude === undefined) {
      throw new Error('Foto rejeitada: georreferenciamento inválido ou ausente. A imagem deve ter coordenadas GPS nos metadados EXIF')
    }

    // Valida que latitude e longitude extraídas dos metadados estão corretas
    EvidenciaService.validarGeorreferenciamento(latitude, longitude)

    // Cria registro base de evidência (tabela: evidencia)
    const evidencia = await EvidenciaRepository.criar({
      usuario_id: usuarioId,
      tipo: 'foto',
      data_criacao: new Date(),
    })

    // Cria registro específico de foto com georreferenciamento extraído dos metadados
    const foto = await EvidenciaFotoRepository.criar({
      evidencia_id: evidencia.id,
      url_arquivo: urlArquivo,
      latitude,
      longitude,
    })

    // Liga a evidência à tarefa, se informada (para o supervisor revisar depois)
    if (tarefaId) {
      await EvidenciaTarefaRepository.criar({ evidencia_id: evidencia.id, tarefa_id: tarefaId })
    }

    return { evidencia, foto }
  },

  // Criar evidência de áudio
  // RN08: Áudio deve ter mínimo 3 segundos
  async criarAudio(usuarioId: UUID, urlArquivo: string, duracao: number, tarefaId?: UUID): Promise<{ evidencia: Evidencia; audio: EvidenciaAudio }> {
    EvidenciaService.validarEvidenciaDescritiva('audio', { duracao })

    // Cria registro base de evidência (tabela: evidencia)
    const evidencia = await EvidenciaRepository.criar({
      usuario_id: usuarioId,
      tipo: 'audio',
      data_criacao: new Date(),
    })

    // Cria registro específico de áudio (tabela: evidencia_audio)
    const audio = await EvidenciaAudioRepository.criar({
      evidencia_id: evidencia.id,
      url_arquivo: urlArquivo,
    })

    if (tarefaId) {
      await EvidenciaTarefaRepository.criar({ evidencia_id: evidencia.id, tarefa_id: tarefaId })
    }

    return { evidencia, audio }
  },

  // RN08: Criar evidência de mensagem + validar mínimo 10 caracteres
  async criarMensagem(usuarioId: UUID, conteudo: string, tarefaId?: UUID): Promise<{ evidencia: Evidencia; mensagem: EvidenciaMensagem }> {
    // RN08: Valida que mensagem atende requisitos mínimos (10 caracteres)
    EvidenciaService.validarEvidenciaDescritiva('mensagem', { conteudo })

    // Cria registro base de evidência (tabela: evidencia)
    const evidencia = await EvidenciaRepository.criar({
      usuario_id: usuarioId,
      tipo: 'mensagem',
      data_criacao: new Date(),
    })

    // Cria registro específico de mensagem (tabela: evidencia_mensagem)
    const mensagem = await EvidenciaMensagemRepository.criar({
      evidencia_id: evidencia.id,
      conteudo: conteudo.trim(),
    })

    if (tarefaId) {
      await EvidenciaTarefaRepository.criar({ evidencia_id: evidencia.id, tarefa_id: tarefaId })
    }

    return { evidencia, mensagem }
  },

  // Buscar evidência base por ID
  async buscarPorId(id: UUID): Promise<Evidencia | null> {
    // Retorna a evidência ou null se não encontrar
    return EvidenciaRepository.buscarPorId(id)
  },

  // Listar todas as evidências (base)
  async listarTodas(): Promise<Evidencia[]> {
    // Retorna todas as evidências registradas
    return EvidenciaRepository.buscarTodos()
  },

  // Listar as evidências de uma tarefa, já com o detalhe de cada tipo,
  // para o supervisor revisar (foto/áudio com url_arquivo, mensagem com conteudo)
  async buscarPorTarefa(tarefaId: UUID): Promise<EvidenciaDetalhada[]> {
    return EvidenciaTarefaRepository.buscarEvidenciasDaTarefa(tarefaId)
  },

  async buscarPorMovimentacao(movimentacaoId: UUID): Promise<EvidenciaDetalhada[]> {
    return EvidenciaMovimentacaoRepository.buscarEvidenciasDaMovimentacao(movimentacaoId)
  },
}
