import { UUID } from './uuid'

export type TipoEvidencia = 'foto' | 'audio' | 'mensagem'

export interface Evidencia {
  id: number
  usuario_id: UUID
  tipo: TipoEvidencia
  data_criacao: Date
}

export interface EvidenciaInput {
  usuario_id: UUID
  tipo: TipoEvidencia
  data_criacao?: Date
}
