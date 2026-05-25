export type TarefaPrioridade = 'alta' | 'media' | 'baixa'

export type TarefaStatus = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'

export interface Tarefa {
  id: string
  retiro_id: string
  criada_por: string
  atribuida_a: string
  descricao: string
  categoria: string
  prioridade: TarefaPrioridade
  data: Date
  status: TarefaStatus
}

export interface TarefaInput {
  retiro_id: string
  criada_por: string
  atribuida_a: string
  descricao: string
  categoria: string
  prioridade: TarefaPrioridade
  data: Date
  status: TarefaStatus
}
