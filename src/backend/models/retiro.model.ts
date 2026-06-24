import { UUID } from './uuid'

export interface Retiro {
  id: UUID
  nome: string
}

export interface RetiroInput {
  id?: UUID
  nome: string
}
