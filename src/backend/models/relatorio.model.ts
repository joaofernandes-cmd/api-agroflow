import { UUID } from './uuid'

export type TipoRelatorio = 'movimentacao' | 'tarefas' | 'tickets' | 'consolidado'

export interface Relatorio {
  id: UUID
  gerado_por: UUID
  retiro_id: UUID
  tipo: TipoRelatorio
  data_inicio: Date
  data_fim: Date
  data_gerado: Date
  url_arquivo: string
}

export interface RelatorioInput {
  id?: UUID
  gerado_por: UUID
  retiro_id: UUID
  tipo: TipoRelatorio
  data_inicio: Date
  data_fim: Date
  data_gerado?: Date
  url_arquivo: string
}
