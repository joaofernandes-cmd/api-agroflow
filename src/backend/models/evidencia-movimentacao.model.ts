import { UUID } from './uuid'

export interface EvidenciaMovimentacao {
  evidencia_id: UUID
  movimentacao_id: UUID
}

export interface EvidenciaMovimentacaoInput {
  evidencia_id: UUID
  movimentacao_id: UUID
}
