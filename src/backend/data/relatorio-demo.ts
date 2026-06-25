// Prévias do relatório (modo demo, sem login) montadas a partir das mesmas
// fontes únicas das telas de Tarefas, Tickets e Movimentações

import { tarefasRevisao } from './tarefas-capataz'
import { ticketsPendentes } from './tickets'
import { movimentacoesPendentes } from './movimentacoes'

export interface LinhaRelatorio {
  celulas: string[] // 4 primeiras colunas
  status: 'Pendente' | 'Validado' // última coluna (selo)
}

export interface ResumoRelatorio {
  total: number
  validados: number
  pendentes: number
  retiros: number
  periodo: string
}

export interface DatasetRelatorio {
  colunas: string[] // 5 cabeçalhos (a última é "Status")
  linhas: LinhaRelatorio[]
  resumo: ResumoRelatorio
}

const ROTULO_PRIORIDADE: Record<string, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

// Data aproximada (texto) a partir do "enviado" relativo, para a coluna Data
const DATA_POR_ENVIADO: Record<string, string> = {
  'há 1h': '17/06/2026',
  'há 3h': '17/06/2026',
  'há 1 dia': '16/06/2026',
  'há 2 dias': '15/06/2026',
  'há 3 dias': '14/06/2026',
}

function resumir(linhas: LinhaRelatorio[], retiros: string[], periodo: string): ResumoRelatorio {
  const validados = linhas.filter((l) => l.status === 'Validado').length
  return {
    total: linhas.length,
    validados,
    pendentes: linhas.length - validados,
    retiros: new Set(retiros).size,
    periodo,
  }
}

// Os itens das páginas estão todos aguardando validação → status Pendente
const tarefas: DatasetRelatorio = (() => {
  const linhas: LinhaRelatorio[] = tarefasRevisao.map((t) => ({
    celulas: [t.data, t.retiro, t.titulo, ROTULO_PRIORIDADE[t.prioridade] ?? t.prioridade],
    status: 'Pendente',
  }))
  return {
    colunas: ['Data', 'Retiro', 'Tarefa', 'Prioridade', 'Status'],
    linhas,
    resumo: resumir(linhas, tarefasRevisao.map((t) => t.retiro), 'Tarefas concluídas'),
  }
})()

const tickets: DatasetRelatorio = (() => {
  const linhas: LinhaRelatorio[] = ticketsPendentes.map((t) => ({
    celulas: [t.quando, t.retiro, t.nome, t.severidade],
    status: 'Pendente',
  }))
  return {
    colunas: ['Quando', 'Retiro', 'Ticket', 'Severidade', 'Status'],
    linhas,
    resumo: resumir(linhas, ticketsPendentes.map((t) => t.retiro), 'Tickets abertos'),
  }
})()

const movimentacoes: DatasetRelatorio = (() => {
  const linhas: LinhaRelatorio[] = movimentacoesPendentes.map((m) => ({
    celulas: [DATA_POR_ENVIADO[m.enviado] ?? '—', m.local, m.tipo, String(m.quantidade)],
    status: 'Pendente',
  }))
  return {
    colunas: ['Data', 'Retiro / Trajeto', 'Tipo', 'Qtd.', 'Status'],
    linhas,
    resumo: resumir(
      linhas,
      movimentacoesPendentes.map((m) => m.retiro ?? m.origem ?? ''),
      'Movimentações registradas'
    ),
  }
})()

// Datasets prontos para injeção como JSON na tela de relatórios
export const relatorioDemo: Record<'tarefas' | 'tickets' | 'movimentacoes', DatasetRelatorio> = {
  tarefas,
  tickets,
  movimentacoes,
}
