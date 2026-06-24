import { UUID } from './uuid'

export interface EvidenciaAudio {
  evidencia_id: UUID
  url_arquivo: string
}

export interface EvidenciaAudioInput {
  evidencia_id: UUID
  url_arquivo: string
}
