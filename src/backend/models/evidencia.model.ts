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

// Evidência já "achatada" com o detalhe de cada tipo (foto/áudio/mensagem),
// usada para devolver ao supervisor tudo que precisa numa consulta só
export interface EvidenciaDetalhada {
  id: UUID
  usuario_id: UUID
  tipo: TipoEvidencia
  data_criacao: Date
  url_arquivo: string | null
  latitude: number | null
  longitude: number | null
  conteudo: string | null
}
