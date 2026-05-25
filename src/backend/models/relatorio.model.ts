export type TipoRelatorio = 'movimentacao' | 'tarefas' | 'tickets' | 'consolidado'

export interface Relatorio {
  id: string
  gerado_por: string | null
  retiro_id: string | null
  tipo: TipoRelatorio | null
  data_inicio: Date | null
  data_fim: Date | null
  data_gerado: Date | null
  url_arquivo: string
}

export interface RelatorioInput {
  gerado_por?: string | null
  retiro_id?: string | null
  tipo?: TipoRelatorio | null
  data_inicio?: Date | null
  data_fim?: Date | null
  data_gerado?: Date | null
  url_arquivo: string
}
