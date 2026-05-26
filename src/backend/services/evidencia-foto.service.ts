import { EvidenciaFotoRepository } from '../repositories/evidencia-foto.repository'
import { EvidenciaFoto, EvidenciaFotoInput } from '../models/evidencia-foto.model'

export class EvidenciaFotoService {
  constructor(private repository: EvidenciaFotoRepository) {}

  async listar(): Promise<EvidenciaFoto[]> {
    return this.repository.findAll()
  }

  async buscarPorEvidenciaId(evidenciaId: string): Promise<EvidenciaFoto | null> {
    return this.repository.findByEvidenciaId(evidenciaId)
  }

  async cadastrar(data: EvidenciaFotoInput & { evidencia_id: string }): Promise<EvidenciaFoto> {
    return this.repository.create(data)
  }

  async atualizar(
    evidenciaId: string,
    data: Partial<EvidenciaFotoInput>
  ): Promise<EvidenciaFoto> {
    return this.repository.update(evidenciaId, data)
  }

  async remover(evidenciaId: string): Promise<void> {
    return this.repository.delete(evidenciaId)
  }
}
