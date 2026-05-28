export type TipoRelatorio = 'movimentacao' | 'tarefas' | 'tickets' | 'consolidado'

export interface Relatorio {
  id: number
  gerado_por: string
  retiro_id: number
  tipo: TipoRelatorio
  data_inicio: Date
  data_fim: Date
  data_gerado: Date
  url_arquivo: string
}

export interface RelatorioInput {
  gerado_por: string
  retiro_id: number
  tipo: TipoRelatorio
  data_inicio: Date
  data_fim: Date
  data_gerado?: Date
  url_arquivo: string
}
