import { EvidenciaMensagemRepository } from '../repositories/evidencia-mensagem.repository'
import { EvidenciaMensagem, EvidenciaMensagemInput } from '../models/evidencia-mensagem.model'

export class EvidenciaMensagemService {
  constructor(private repository: EvidenciaMensagemRepository) {}

  async listar(): Promise<EvidenciaMensagem[]> {
    return this.repository.findAll()
  }

  async buscarPorEvidenciaId(evidenciaId: string): Promise<EvidenciaMensagem | null> {
    return this.repository.findByEvidenciaId(evidenciaId)
  }

  async cadastrar(data: EvidenciaMensagemInput & { evidencia_id: string }): Promise<EvidenciaMensagem> {
    return this.repository.create(data)
  }

  async atualizar(
    evidenciaId: string,
    data: Partial<EvidenciaMensagemInput>
  ): Promise<EvidenciaMensagem> {
    return this.repository.update(evidenciaId, data)
  }

  async remover(evidenciaId: string): Promise<void> {
    return this.repository.delete(evidenciaId)
  }
}
