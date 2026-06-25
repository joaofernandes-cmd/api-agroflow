import { UUID } from './uuid'

export interface EvidenciaFoto {
  evidencia_id: UUID
  url_arquivo: string
  latitude: number
  longitude: number
}

export interface EvidenciaFotoInput {
  evidencia_id: UUID
  url_arquivo: string
  latitude: number
  longitude: number
}
