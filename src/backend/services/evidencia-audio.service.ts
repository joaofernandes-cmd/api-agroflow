import { EvidenciaAudioRepository } from '../repositories/evidencia-audio.repository'
import { EvidenciaAudio, EvidenciaAudioInput } from '../models/evidencia-audio.model'

export class EvidenciaAudioService {
  constructor(private repository: EvidenciaAudioRepository) {}

  async listar(): Promise<EvidenciaAudio[]> {
    return this.repository.findAll()
  }

  async buscarPorEvidenciaId(evidenciaId: string): Promise<EvidenciaAudio | null> {
    return this.repository.findByEvidenciaId(evidenciaId)
  }

  async cadastrar(data: EvidenciaAudioInput & { evidencia_id: string }): Promise<EvidenciaAudio> {
    return this.repository.create(data)
  }

  async atualizar(
    evidenciaId: string,
    data: Partial<EvidenciaAudioInput>
  ): Promise<EvidenciaAudio> {
    return this.repository.update(evidenciaId, data)
  }

  async remover(evidenciaId: string): Promise<void> {
    return this.repository.delete(evidenciaId)
  }
}
