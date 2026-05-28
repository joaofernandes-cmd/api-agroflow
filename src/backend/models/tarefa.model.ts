export type TarefaPrioridade = 'alta' | 'media' | 'baixa'

export type TarefaStatus = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'

export interface Tarefa {
  id: number
  retiro_id: number
  criada_por: string
  atribuida_a: string
  descricao: string
  categoria: string
  prioridade: TarefaPrioridade
  data_criacao: Date
  status: TarefaStatus
  sincronizado: boolean
}

export interface TarefaInput {
  retiro_id: number
  criada_por: string
  atribuida_a: string
  descricao: string
  categoria: string
  prioridade: TarefaPrioridade
  data_criacao?: Date
  status: TarefaStatus
  sincronizado?: boolean
}
