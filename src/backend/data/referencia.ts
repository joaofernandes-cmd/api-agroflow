// Dados de referência canônicos, compartilhados por TODAS as telas do
// supervisor e do capataz. Centralizar aqui garante rastreabilidade: o mesmo
// retiro sempre aparece com o mesmo nome e com o mesmo capataz responsável,
// seja numa tarefa, num ticket, numa movimentação ou no relatório.

// Lista única de retiros da fazenda. É a fonte do filtro de retiros do
// relatório e o conjunto válido usado por tarefas/tickets/movimentações.
export const RETIROS = ['Aroeira', 'CMB', 'Puga', 'Cristo', 'Caieira', 'Bodoquena'] as const

export type Retiro = (typeof RETIROS)[number]

// Cada retiro tem um capataz responsável. Assim o nome do capataz que registrou
// uma tarefa/movimentação fica consistente em toda a aplicação (nunca aparece
// um "Daniel" só numa tela). Daniel Carvalho é o capataz do app de demonstração.
export const CAPATAZ_POR_RETIRO: Record<Retiro, string> = {
  Aroeira: 'Lucas',
  CMB: 'Alberto',
  Puga: 'Manoel',
  Cristo: 'José Carlos',
  Caieira: 'João Paulo',
  Bodoquena: 'Daniel Carvalho',
}

// Lista única de capatazes da fazenda (nomes), derivada do mapa acima.
// É a fonte do <select> de capataz na tela de Delegar.
export const CAPATAZES: string[] = [...new Set(Object.values(CAPATAZ_POR_RETIRO))]

// Nome do capataz responsável por um retiro (com fallback seguro).
export function capatazDoRetiro(retiro: string): string {
  return (CAPATAZ_POR_RETIRO as Record<string, string>)[retiro] ?? 'Capataz'
}

// Valor (slug) do retiro usado no <option> do filtro de relatórios.
export function slugRetiro(retiro: string): string {
  return retiro
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
}

// Opções de retiro prontas para o filtro do relatório (rótulo + slug).
export const OPCOES_RETIRO = RETIROS.map((r) => ({ rotulo: r, valor: slugRetiro(r) }))

// Obs.: o roster oficial da fazenda (retiro → capataz responsável, conforme a
// planilha Plan_Inteli_ProjetoBRPEC) vive no BANCO — semeado pela migração
// 022-seed-roster-fazenda.sql e lido pela tela de Delegar. Não duplicar aqui.
