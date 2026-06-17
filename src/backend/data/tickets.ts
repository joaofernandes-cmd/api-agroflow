// Fonte ÚNICA dos tickets de infraestrutura registrados pelos capatazes.
// Alimenta a tela de Tickets do supervisor, o relatório de tickets e o
// contador da home. Editar aqui reflete em todas as telas.

import { capatazDoRetiro } from './referencia'

export type Severidade = 'Alta' | 'Média' | 'Baixa'
export type TipoEvidenciaTicket = 'Foto' | 'Áudio' | 'Texto'

export interface TicketBase {
  id: string // '1', '2'... (usado no data-ticket dos cards/linhas)
  nome: string
  retiro: string
  quando: string
  severidade: Severidade
  evidencia: TipoEvidenciaTicket
  descricao: string
  evidenciaTexto?: string // nota quando a evidência é Texto
}

export interface TicketExibicao extends TicketBase {
  capataz: string // capataz responsável (derivado do retiro)
  sevClasse: string // classe do selo mobile (alta/media/baixa)
  badgeClasse: string // classe do selo desktop (badge--red-soft/yellow/blue)
}

const TICKETS: TicketBase[] = [
  {
    id: '1',
    nome: 'Cerca danificada no pasto',
    retiro: 'Puga',
    quando: 'Hoje, 08:24',
    severidade: 'Alta',
    evidencia: 'Foto',
    descricao: 'Cerca rompida em cerca de 15 metros no pasto leste; risco de fuga do gado.',
  },
  {
    id: '2',
    nome: 'Estoque de ração abaixo do mínimo',
    retiro: 'Bodoquena',
    quando: 'Hoje, 10:45',
    severidade: 'Média',
    evidencia: 'Texto',
    evidenciaTexto: 'Apenas 2 sacos restantes no galpão.',
    descricao: 'Restam 2 sacos de ração; consumo previsto para menos de 1 dia.',
  },
  {
    id: '3',
    nome: "Bomba d'água com falha",
    retiro: 'Cristo',
    quando: 'Amanhã',
    severidade: 'Alta',
    evidencia: 'Áudio',
    descricao: 'Bomba do poço não liga; bebedouros sem reposição de água.',
  },
  {
    id: '4',
    nome: 'Bebedouro com defeito',
    retiro: 'CMB',
    quando: 'em 3 dias',
    severidade: 'Alta',
    evidencia: 'Foto',
    descricao: 'Bebedouro com vazamento na base; água acumulando no entorno.',
  },
  {
    id: '5',
    nome: 'Veículo do retiro sem manutenção',
    retiro: 'Caieira',
    quando: 'há 5 dias',
    severidade: 'Baixa',
    evidencia: 'Texto',
    evidenciaTexto: 'Última revisão há 8 meses; freio com folga.',
    descricao: 'Caminhonete com revisão atrasada; freio com ruído ao frear.',
  },
  {
    id: '6',
    nome: 'Gerador sem combustível',
    retiro: 'Aroeira',
    quando: 'em 4 dias',
    severidade: 'Média',
    evidencia: 'Áudio',
    descricao: 'Gerador parou por falta de diesel; energia intermitente no retiro.',
  },
]

const SEV_CLASSE: Record<Severidade, string> = {
  Alta: 'alta',
  Média: 'media',
  Baixa: 'baixa',
}

const BADGE_CLASSE: Record<Severidade, string> = {
  Alta: 'badge--red-soft',
  Média: 'badge--yellow',
  Baixa: 'badge--blue',
}

function decorar(t: TicketBase): TicketExibicao {
  return {
    ...t,
    capataz: capatazDoRetiro(t.retiro),
    sevClasse: SEV_CLASSE[t.severidade],
    badgeClasse: BADGE_CLASSE[t.severidade],
  }
}

// Tickets pendentes de validação (fonte da tela de Tickets e do relatório).
export const ticketsPendentes: TicketExibicao[] = TICKETS.map(decorar)

// Remove um ticket da lista de pendentes (ex.: quando o supervisor valida).
// Mutação in-place: a lista é fonte única da tela e do contador da home, então
// a remoção reflete em ambos no próximo carregamento. Retorna true se removeu.
export function removerTicketPendente(id: string): boolean {
  const indice = ticketsPendentes.findIndex((t) => t.id === id)
  if (indice === -1) return false
  ticketsPendentes.splice(indice, 1)
  return true
}

// Mapa id → { descricao, evidencia, evidenciaTexto } lido pelo JS da tela ao
// mover um ticket para "Validados".
export const ticketsDadosMap: Record<
  string,
  { descricao: string; evidencia: TipoEvidenciaTicket; evidenciaTexto?: string }
> = Object.fromEntries(
  TICKETS.map((t) => [
    t.id,
    { descricao: t.descricao, evidencia: t.evidencia, evidenciaTexto: t.evidenciaTexto },
  ])
)
