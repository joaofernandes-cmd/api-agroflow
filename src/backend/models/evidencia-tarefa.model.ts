import { UUID } from './uuid'

export interface EvidenciaTarefa {
  evidencia_id: UUID
  tarefa_id: UUID
}

export interface EvidenciaTarefaInput {
  evidencia_id: UUID
  tarefa_id: UUID
}
