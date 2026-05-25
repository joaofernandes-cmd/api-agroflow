export type TipoEvidencia = 'foto' | 'audio' | 'mensagem'

export interface Evidencia {
  id: string
  usuario_id: string
  tipo: TipoEvidencia
  data_criacao: Date
}

export interface EvidenciaInput {
  usuario_id: string
  tipo: TipoEvidencia
  data_criacao?: Date
}
