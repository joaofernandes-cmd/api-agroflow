import { UUID } from './uuid'

export type TarefaPrioridade = 'alta' | 'media' | 'baixa'

// Ciclo: pendente (delegada) → concluido (capataz concluiu, aguardando supervisor)
// → aprovado (supervisor validou; exibido como "Validada" na interface).
export type TarefaStatus = 'pendente' | 'concluido' | 'aprovado'

export interface Tarefa {
  id: UUID
  retiro_id: UUID
  criada_por: UUID
  atribuida_a: UUID
  descricao: string
  categoria: string
  prioridade: TarefaPrioridade
  data_criacao: Date
  status: TarefaStatus
  aprovado_por: UUID | null
  sincronizado: boolean
}

export interface TarefaInput {
  id?: UUID
  retiro_id: UUID
  criada_por: UUID
  atribuida_a: UUID
  descricao: string
  categoria: string
  prioridade: TarefaPrioridade
  data_criacao?: Date
  status: TarefaStatus
  aprovado_por?: UUID | null
  sincronizado?: boolean
}
