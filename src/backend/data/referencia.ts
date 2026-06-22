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

// Roster oficial da fazenda: cada retiro e o seu capataz responsável, na ordem
// da planilha de referência (Plan_Inteli_ProjetoBRPEC). É a fonte do campo
// combinado "Retiro — Capataz" da tela de Delegar: o supervisor escolhe o
// retiro e o capataz responsável vem junto, sem risco de parear errado.
// Os RETIROS/CAPATAZ_POR_RETIRO acima são o subconjunto de demonstração usado
// pelos dados semente (tarefas/tickets/movimentações) e batem com este roster.
export const PARES_RETIRO_CAPATAZ: { retiro: string; capataz: string }[] = [
  { retiro: 'Acurizal', capataz: 'Rogério' },
  { retiro: 'Aroeira', capataz: 'Lucas' },
  { retiro: 'Baia Bonita', capataz: 'Marcelo' },
  { retiro: 'Bodoquena 1', capataz: 'Fabiano' },
  { retiro: 'Bodoquena 2', capataz: 'Valdineis' },
  { retiro: 'Boqueirão', capataz: 'Daniel' },
  { retiro: 'Caieira', capataz: 'João Paulo' },
  { retiro: 'CMB', capataz: 'Alberto' },
  { retiro: 'Confinamento', capataz: 'Valdineis' },
  { retiro: 'Cristo', capataz: 'José Carlos' },
  { retiro: 'Morada Nova', capataz: 'Valdeci' },
  { retiro: 'Morro Azul', capataz: 'Daniel' },
  { retiro: 'Puga', capataz: 'Manoel' },
  { retiro: 'São Miguel', capataz: 'Wilson' },
  { retiro: 'Vista Alegre', capataz: 'Ariovaldo' },
]
