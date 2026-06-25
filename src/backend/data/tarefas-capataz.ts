// Fonte única das tarefas: alimenta a home e o detalhe do capataz, o preview
// de delegação e a tela de Revisão do supervisor, e o relatório de tarefas

import { capatazDoRetiro } from './referencia'

export type Prioridade = 'alta' | 'media' | 'baixa'
export type StatusTarefa = 'pendente' | 'concluida'
export type TipoEvidencia = 'foto' | 'audio' | 'texto'

export interface TarefaBase {
  titulo: string
  retiro: string
  supervisor: string // quem delegou (cria a tarefa)
  prioridade: Prioridade
  status: StatusTarefa
  prazo: string
  categoria: string
  data: string
  criadaEm: string // data/hora de criação (ISO), usada para ordenar a lista
  descricao: string
  // Preenchidos quando o capataz concluiu a tarefa e ela aguarda revisão:
  enviado?: string // tempo relativo desde o envio (ex.: "há 1h")
  evidencia?: TipoEvidencia // tipo da evidência anexada pelo capataz
  evidenciaTexto?: string // texto da evidência quando evidencia === 'texto'
}

export interface TarefaExibicao extends TarefaBase {
  id: number // posição na lista (1-based), usada nos links e na persistência
  nivel: string // rótulo do selo (Alta/Média/Baixa/Concluída)
  classe: string // classe css do selo
  cor: string // cor da barra do card
  autor: string // "Criada por Supervisor X"
  statusRotulo: string // Pendente/Concluída
  capataz: string // capataz responsável (derivado do retiro)
}

const TAREFAS: TarefaBase[] = [
  // Pendentes (o capataz ainda vai fazer)
  {
    titulo: 'Inspeção das cercas',
    retiro: 'Aroeira',
    supervisor: 'Luiz',
    prioridade: 'alta',
    status: 'pendente',
    prazo: 'Amanhã 08:00',
    categoria: 'Manutenção',
    data: '16/06/2026 às 08:00',
    criadaEm: '2026-06-15T14:00:00',
    descricao:
      'Percorrer as cercas do retiro e verificar se há partes danificadas. Registrar o que precisar de conserto e abrir ticket de infraestrutura.',
  },
  {
    titulo: 'Conferência do gado',
    retiro: 'CMB',
    supervisor: 'Luiz',
    prioridade: 'media',
    status: 'pendente',
    prazo: 'Hoje 14:00',
    categoria: 'Manejo',
    data: '15/06/2026 às 14:00',
    criadaEm: '2026-06-16T08:30:00',
    descricao:
      'Conferir a quantidade de cabeças de gado do retiro e comparar com o registro. Anotar qualquer diferença.',
  },
  {
    titulo: 'Vistoria do bebedouro',
    retiro: 'Bodoquena',
    supervisor: 'Luiz',
    prioridade: 'baixa',
    status: 'pendente',
    prazo: 'Sexta 10:00',
    categoria: 'Manutenção',
    data: '19/06/2026 às 10:00',
    criadaEm: '2026-06-14T09:00:00',
    descricao:
      'Verificar o funcionamento dos bebedouros do retiro e registrar qualquer vazamento ou falta de água.',
  },

  // Concluídas pelo capataz, aguardando revisão do supervisor
  {
    titulo: 'Conferência do rebanho',
    retiro: 'Aroeira',
    supervisor: 'Luiz',
    prioridade: 'media',
    status: 'concluida',
    prazo: 'Concluída hoje',
    categoria: 'Manejo',
    data: '17/06/2026',
    criadaEm: '2026-06-17T07:30:00',
    descricao: 'Conferir a quantidade de cabeças do retiro e comparar com o registro.',
    enviado: 'há 1h',
    evidencia: 'foto',
  },
  {
    titulo: 'Inspeção de cercas',
    retiro: 'CMB',
    supervisor: 'Luiz',
    prioridade: 'alta',
    status: 'concluida',
    prazo: 'Concluída hoje',
    categoria: 'Manutenção',
    data: '17/06/2026',
    criadaEm: '2026-06-17T07:20:00',
    descricao: 'Percorrer as cercas do retiro e registrar os trechos danificados.',
    enviado: 'há 1h',
    evidencia: 'texto',
    evidenciaTexto: 'Lado leste com 3 estacas soltas. Precisa de reparo.',
  },
  {
    titulo: 'Movimentação de animais',
    retiro: 'Puga',
    supervisor: 'Luiz',
    prioridade: 'media',
    status: 'concluida',
    prazo: 'Concluída ontem',
    categoria: 'Movimentação',
    data: '16/06/2026',
    criadaEm: '2026-06-16T09:00:00',
    descricao: 'Mover o lote do pasto 2 para o curral de manejo e registrar origem e destino.',
    enviado: 'há 1 dia',
    evidencia: 'audio',
  },
  {
    titulo: 'Alimentação suplementar',
    retiro: 'Caieira',
    supervisor: 'Luiz',
    prioridade: 'media',
    status: 'concluida',
    prazo: 'Concluída ontem',
    categoria: 'Nutrição',
    data: '16/06/2026',
    criadaEm: '2026-06-16T08:00:00',
    descricao: 'Fornecer a ração suplementar ao gado conforme a orientação.',
    enviado: 'há 1 dia',
    evidencia: 'foto',
  },
  {
    titulo: 'Inspeção sanitária',
    retiro: 'Aroeira',
    supervisor: 'Luiz',
    prioridade: 'baixa',
    status: 'concluida',
    prazo: 'Concluída há 2 dias',
    categoria: 'Sanidade',
    data: '15/06/2026',
    criadaEm: '2026-06-15T10:00:00',
    descricao: 'Inspecionar a saúde dos animais e registrar sinais de doença.',
    enviado: 'há 2 dias',
    evidencia: 'texto',
    evidenciaTexto: 'Nenhum sinal de doença identificado.',
  },
  {
    titulo: 'Contagem geral',
    retiro: 'Cristo',
    supervisor: 'Luiz',
    prioridade: 'media',
    status: 'concluida',
    prazo: 'Concluída há 3 dias',
    categoria: 'Manejo',
    data: '14/06/2026',
    criadaEm: '2026-06-14T11:00:00',
    descricao: 'Contar todas as cabeças do retiro e anotar o total.',
    enviado: 'há 3 dias',
    evidencia: 'audio',
  },
]

const ROTULO_PRIORIDADE: Record<Prioridade, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

const COR_PRIORIDADE: Record<Prioridade, string> = {
  alta: 'var(--alerta)',
  media: '#f0ad00',
  baixa: 'var(--sucesso)',
}

function decorar(t: TarefaBase, id: number): TarefaExibicao {
  const concluida = t.status === 'concluida'
  return {
    ...t,
    id,
    nivel: concluida ? 'Concluída' : ROTULO_PRIORIDADE[t.prioridade],
    classe: concluida ? 'concluida' : t.prioridade,
    cor: concluida ? 'var(--primaria)' : COR_PRIORIDADE[t.prioridade],
    autor: `Criada por Supervisor ${t.supervisor}`,
    statusRotulo: concluida ? 'Concluída' : 'Pendente',
    capataz: capatazDoRetiro(t.retiro),
  }
}

// Lista pronta para exibição (com selo, cor, autor e capataz já calculados)
export const tarefasCapataz: TarefaExibicao[] = TAREFAS.map((t, i) => decorar(t, i + 1))

// Mesma lista, ordenada da mais recente para a mais antiga
export const tarefasCapatazRecentes: TarefaExibicao[] = tarefasCapataz
  .slice()
  .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))

// Tarefas concluídas pelo capataz, aguardando revisão do supervisor
export const tarefasRevisao: TarefaExibicao[] = tarefasCapataz.filter(
  (t) => t.status === 'concluida'
)

// Remove uma tarefa da lista de "Pendentes de revisão" (ex.: quando o
// supervisor valida); mutação in-place para refletir na tela e no contador
export function removerTarefaRevisao(id: number): boolean {
  const indice = tarefasRevisao.findIndex((t) => t.id === id)
  if (indice === -1) return false
  tarefasRevisao.splice(indice, 1)
  return true
}

// Seleciona a tarefa pelo id da query (?id=N, 1-based), com fallback para a
// primeira quando o id está ausente ou é inválido
export function buscarTarefaCapataz(id: unknown): TarefaExibicao {
  const indice = Number.parseInt(String(id), 10)
  if (Number.isNaN(indice) || indice < 1 || indice > tarefasCapataz.length) {
    return tarefasCapataz[0]
  }
  return tarefasCapataz[indice - 1]
}
