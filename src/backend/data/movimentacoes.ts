// Fonte única das movimentações de rebanho registradas pelos capatazes;
// alimenta a tela de Movimentações, o relatório e o contador da home

import { capatazDoRetiro } from './referencia'

export type TipoMovimentacao = 'Nascimento' | 'Morte' | 'Transferência' | 'Compra' | 'Venda'
export type TipoEvidenciaMov = 'Foto' | 'Áudio' | 'Texto'

export interface MovimentacaoBase {
  id: string // 'm1', 'm2'... (usado no data-mov-id)
  tipo: TipoMovimentacao
  retiro?: string // retiro único (Nascimento/Morte/Compra/Venda)
  origem?: string // origem (Transferência)
  destino?: string // destino (Transferência)
  quantidade: number
  estagio: string
  evidencia: TipoEvidenciaMov
  evidenciaTexto?: string
  causaObito?: string // só para Morte
  enviado: string // tempo relativo desde o envio
}

export interface MovimentacaoExibicao extends MovimentacaoBase {
  capataz: string // capataz responsável (derivado do retiro/origem)
  local: string // "Retiro" ou "Origem → Destino"
  quantidadeRotulo: string // "N animal(is)"
  badgeClasse: string // classe do selo do tipo
  detalhes: string // texto da linha "Detalhes" (desktop e seção Validadas)
}

const MOVIMENTACOES: MovimentacaoBase[] = [
  {
    id: 'm1',
    tipo: 'Nascimento',
    retiro: 'Aroeira',
    quantidade: 3,
    estagio: 'Bezerro 0 a 7 meses',
    evidencia: 'Foto',
    enviado: 'há 1h',
  },
  {
    id: 'm2',
    tipo: 'Transferência',
    origem: 'Puga',
    destino: 'CMB',
    quantidade: 40,
    estagio: 'Boi 25 a 36 meses',
    evidencia: 'Áudio',
    enviado: 'há 3h',
  },
  {
    id: 'm3',
    tipo: 'Morte',
    retiro: 'Cristo',
    quantidade: 1,
    estagio: 'Vaca acima de 36 meses',
    causaObito: 'Doença',
    evidencia: 'Texto',
    evidenciaTexto: 'Animal encontrado sem vida no pasto leste; sinais de doença.',
    enviado: 'há 1 dia',
  },
  {
    id: 'm4',
    tipo: 'Compra',
    retiro: 'Bodoquena',
    quantidade: 25,
    estagio: 'Garrote 13 a 24 meses',
    evidencia: 'Foto',
    enviado: 'há 1 dia',
  },
  {
    id: 'm5',
    tipo: 'Venda',
    retiro: 'Caieira',
    quantidade: 18,
    estagio: 'Boi acima de 36 meses',
    evidencia: 'Texto',
    evidenciaTexto: 'Lote vendido para o frigorífico regional; nota emitida.',
    enviado: 'há 2 dias',
  },
  {
    id: 'm6',
    tipo: 'Transferência',
    origem: 'Aroeira',
    destino: 'Bodoquena',
    quantidade: 60,
    estagio: 'Novilha 13 a 24 meses',
    evidencia: 'Áudio',
    enviado: 'há 3 dias',
  },
]

const BADGE_CLASSE: Record<TipoMovimentacao, string> = {
  Nascimento: 'badge--green',
  Transferência: 'badge--blue',
  Morte: 'badge--red-soft',
  Compra: 'badge--green',
  Venda: 'badge--yellow',
}

function montarDetalhes(m: MovimentacaoBase): string {
  const partes: string[] = []
  if (m.tipo === 'Transferência') {
    partes.push(`Origem: ${m.origem}`, `Destino: ${m.destino}`)
  }
  partes.push(`Estágio: ${m.estagio}`)
  if (m.causaObito) partes.push(`Causa do óbito: ${m.causaObito}`)
  partes.push(`Enviado ${m.enviado}.`)
  return partes.join(' · ')
}

function decorar(m: MovimentacaoBase): MovimentacaoExibicao {
  const local = m.tipo === 'Transferência' ? `${m.origem} → ${m.destino}` : (m.retiro ?? '')
  const retiroBase = m.retiro ?? m.origem ?? ''
  return {
    ...m,
    capataz: capatazDoRetiro(retiroBase),
    local,
    quantidadeRotulo: `${m.quantidade} ${m.quantidade === 1 ? 'animal' : 'animais'}`,
    badgeClasse: BADGE_CLASSE[m.tipo],
    detalhes: montarDetalhes(m),
  }
}

// Movimentações pendentes de validação (fonte da tela e do relatório)
export const movimentacoesPendentes: MovimentacaoExibicao[] = MOVIMENTACOES.map(decorar)

// Remove uma movimentação da lista de pendentes (ex.: quando o supervisor
// valida); mutação in-place para refletir na tela e no contador da home
export function removerMovimentacaoPendente(id: string): boolean {
  const indice = movimentacoesPendentes.findIndex((m) => m.id === id)
  if (indice === -1) return false
  movimentacoesPendentes.splice(indice, 1)
  return true
}

// Mapa id → { detalhes, evidencia, evidenciaTexto } lido pelo JS da tela ao
// mover uma movimentação para "Validadas"
export const movimentacoesDadosMap: Record<
  string,
  { detalhes: string; evidencia: TipoEvidenciaMov; evidenciaTexto?: string }
> = Object.fromEntries(
  movimentacoesPendentes.map((m) => [
    m.id,
    { detalhes: m.detalhes, evidencia: m.evidencia, evidenciaTexto: m.evidenciaTexto },
  ])
)
