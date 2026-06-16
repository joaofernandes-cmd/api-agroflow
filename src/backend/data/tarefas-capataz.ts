// Fonte única das tarefas de exemplo do capataz.
// Usada pela lista (capataz/tarefas), pela home (capataz/home) e pelo
// detalhe (capataz/detalhe-tarefa), para que nunca fiquem incoerentes.

export type Prioridade = 'alta' | 'media' | 'baixa'
export type StatusTarefa = 'pendente' | 'concluida'

export interface TarefaBase {
  titulo: string
  retiro: string
  supervisor: string
  prioridade: Prioridade
  status: StatusTarefa
  prazo: string
  categoria: string
  data: string
  criadaEm: string // data/hora de criação (ISO), usada para ordenar a lista
  descricao: string
}

export interface TarefaExibicao extends TarefaBase {
  id: number // posição na lista (1-based), usada nos links e na persistência
  nivel: string // rótulo do selo (Alta/Média/Baixa/Concluída)
  classe: string // classe css do selo
  cor: string // cor da barra do card
  autor: string // "Criada por Supervisor X"
  statusRotulo: string // Pendente/Concluída
}

const TAREFAS: TarefaBase[] = [
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
      'Percorrer as cercas do retiro e verificar se há partes danificadas. Registrar o que precisar de conserto e abrir chamado de infraestrutura.',
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
    titulo: 'Inspeção sanitária',
    retiro: 'Puga',
    supervisor: 'Luiz',
    prioridade: 'baixa',
    status: 'pendente',
    prazo: 'Sexta 10:00',
    categoria: 'Sanidade',
    data: '19/06/2026 às 10:00',
    criadaEm: '2026-06-14T09:00:00',
    descricao:
      'Inspecionar a saúde dos animais e registrar sinais de doença. Avisar o supervisor se encontrar algo.',
  },
  {
    titulo: 'Alimentação suplementar',
    retiro: 'Cristo',
    supervisor: 'Alberto',
    prioridade: 'media',
    status: 'concluida',
    prazo: 'Há 2 dias',
    categoria: 'Nutrição',
    data: '13/06/2026',
    criadaEm: '2026-06-12T10:00:00',
    descricao:
      'Fornecer a alimentação suplementar ao gado conforme a orientação e registrar a quantidade usada.',
  },
  {
    titulo: 'Movimentação de gado',
    retiro: 'Bodoquena',
    supervisor: 'José',
    prioridade: 'media',
    status: 'concluida',
    prazo: 'Há 3 dias',
    categoria: 'Movimentação',
    data: '12/06/2026',
    criadaEm: '2026-06-11T08:00:00',
    descricao:
      'Movimentar o gado entre os retiros conforme a ordem. Registrar a origem e o destino.',
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
  }
}

// Lista pronta para exibição (com selo, cor e autor já calculados).
export const tarefasCapataz: TarefaExibicao[] = TAREFAS.map((t, i) => decorar(t, i + 1))

// Mesma lista, ordenada da mais recente para a mais antiga (por data de criação).
export const tarefasCapatazRecentes: TarefaExibicao[] = tarefasCapataz
  .slice()
  .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))

// Seleciona a tarefa pelo id da query (?id=N, 1-based). Faz fallback para a
// primeira quando o id está ausente ou é inválido.
export function buscarTarefaCapataz(id: unknown): TarefaExibicao {
  const indice = Number.parseInt(String(id), 10)
  if (Number.isNaN(indice) || indice < 1 || indice > tarefasCapataz.length) {
    return tarefasCapataz[0]
  }
  return tarefasCapataz[indice - 1]
}
