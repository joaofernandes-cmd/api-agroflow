import { EvidenciaMovimentacaoRepository } from '../repositories/evidencia-movimentacao.repository'
import { EvidenciaMovimentacao, EvidenciaMovimentacaoInput } from '../models/evidencia-movimentacao.model'

export class EvidenciaMovimentacaoService {
  constructor(private repository: EvidenciaMovimentacaoRepository) {}

  async listar(): Promise<EvidenciaMovimentacao[]> {
    return this.repository.findAll()
  }

  async buscarPorEvidenciaId(evidenciaId: string): Promise<EvidenciaMovimentacao[]> {
    return this.repository.findByEvidenciaId(evidenciaId)
  }

  async buscarPorMovimentacaoId(movimentacaoId: string): Promise<EvidenciaMovimentacao[]> {
    return this.repository.findByMovimentacaoId(movimentacaoId)
  }

  async cadastrar(data: EvidenciaMovimentacaoInput): Promise<EvidenciaMovimentacao> {
    return this.repository.create(data)
  }

  async remover(evidenciaId: string, movimentacaoId: string): Promise<void> {
    return this.repository.delete(evidenciaId, movimentacaoId)
  }
}
