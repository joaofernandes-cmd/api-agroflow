import { UUID } from './uuid'

export type TarefaPrioridade = 'alta' | 'media' | 'baixa'

export type TarefaStatus = 'pendente' | 'aprovado'

export interface Tarefa {
  id: number
  retiro_id: number
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
  retiro_id: number
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
