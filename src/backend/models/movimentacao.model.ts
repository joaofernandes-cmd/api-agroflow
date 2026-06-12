import { UUID } from './uuid'

export type MovimentacaoTipo = 'nascimento' | 'morte' | 'transferencia' | 'compra' | 'venda' | 'outros'

export type MovimentacaoStatus = 'pendente' | 'validado'

export type RetiroNome =
  | 'Acurizal'
  | 'Aroeira'
  | 'Baia Bonita'
  | 'Bodoquena 1'
  | 'Bonoquena 2'
  | 'BoqueirÃ£o'
  | 'Caieira'
  | 'CMB'
  | 'Confinamento'
  | 'Cristo'
  | 'Morada Nova'
  | 'Morro Azul'
  | 'Puga'
  | 'SÃ£o Miguel'
  | 'Vista Alegre'

export type EstagioVida =
  | 'BEZERRO 0 A 7 MESES'
  | 'GARROTE 8 A 12 MESES'
  | 'NOVILHA 8 A 12 MESES'
  | 'GARROTE 13 A 24 MESES'
  | 'NOVILHA 13 A 24 MESES'
  | 'BOI 25 A 36 MESES'
  | 'NOVILHA 25 A 36 MESES'
  | 'TOURO 25 A 36 MESES'
  | 'VACA ACIMA 36 MESES'
  | 'BOI ACIMA 36 MESES'
  | 'TOURO ACIMA 36 MESES'

export type EvidenciaTipo = 'foto' | 'audio' | 'mensagem'

export interface MovimentacaoEvidenciaInput {
  tipo: EvidenciaTipo
  conteudo?: string
  urlArquivo?: string
  duracao?: number
  latitude?: number
  longitude?: number
}

export interface Movimentacao {
  id: number
  retiro_id: number
  capataz_id: UUID
  validado_por: UUID | null
  tipo: MovimentacaoTipo
  origem: RetiroNome | null
  destino: RetiroNome | null
  quantidade: number | null
  status: MovimentacaoStatus
  sincronizado: boolean
  data_criacao: Date
  data_validacao: Date | null
  causa_obito: string | null
  estagio_vida: EstagioVida
}

export interface MovimentacaoInput {
  retiro_id: number
  capataz_id: UUID
  validado_por: UUID | null
  tipo: MovimentacaoTipo
  origem?: RetiroNome | null
  destino?: RetiroNome | null
  quantidade?: number | null
  status: MovimentacaoStatus
  sincronizado?: boolean
  data_criacao?: Date
  data_validacao?: Date | null
  causa_obito?: string | null
  estagio_vida: EstagioVida
  evidencia?: MovimentacaoEvidenciaInput
}
