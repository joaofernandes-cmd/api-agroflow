import { UUID } from './uuid'

export type TipoEvidencia = 'foto' | 'audio' | 'mensagem'

export interface Evidencia {
  id: UUID
  usuario_id: UUID
  tipo: TipoEvidencia
  data_criacao: Date
}

export interface EvidenciaInput {
  id?: UUID
  usuario_id: UUID
  tipo: TipoEvidencia
  data_criacao?: Date
}
