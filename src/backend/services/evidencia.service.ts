import { EvidenciaRepository } from '../repositories/evidencia.repository'
import { Evidencia, EvidenciaInput } from '../models/evidencia.model'

export class EvidenciaService {
  constructor(private repository: EvidenciaRepository) {}

  async listar(): Promise<Evidencia[]> {
    return this.repository.findAll()
  }

  async buscarPorId(id: string): Promise<Evidencia | null> {
    return this.repository.findById(id)
  }

  async cadastrar(data: EvidenciaInput): Promise<Evidencia> {
    return this.repository.create(data)
  }

  async atualizar(
    id: string,
    data: Partial<EvidenciaInput>
  ): Promise<Evidencia> {
    return this.repository.update(id, data)
  }

  async remover(id: string): Promise<void> {
    return this.repository.delete(id)
  }
}
