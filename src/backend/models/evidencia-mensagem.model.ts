import { UUID } from './uuid'

export interface EvidenciaMensagem {
  evidencia_id: UUID
  conteudo: string
}

export interface EvidenciaMensagemInput {
  evidencia_id: UUID
  conteudo: string
}
