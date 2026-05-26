export type TipoRelatorio = 'movimentacao' | 'tarefas' | 'tickets' | 'consolidado'

export interface Relatorio {
  id: string
  gerado_por: string
  retiro_id: string
  tipo: TipoRelatorio
  data_inicio: Date
  data_fim: Date
  data_gerado: Date
  url_arquivo: string
}

export interface RelatorioInput {
  gerado_por: string
  retiro_id: string
  tipo: TipoRelatorio
  data_inicio: Date
  data_fim: Date
  data_gerado?: Date
  url_arquivo: string
}
