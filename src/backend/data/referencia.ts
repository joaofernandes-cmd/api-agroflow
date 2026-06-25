// Dados de referência canônicos, compartilhados por todas as telas do
// supervisor e do capataz

// Lista única de retiros da fazenda
export const RETIROS = ['Aroeira', 'CMB', 'Puga', 'Cristo', 'Caieira', 'Bodoquena'] as const

export type Retiro = (typeof RETIROS)[number]

// Capataz responsável por cada retiro
export const CAPATAZ_POR_RETIRO: Record<Retiro, string> = {
  Aroeira: 'Lucas',
  CMB: 'Alberto',
  Puga: 'Manoel',
  Cristo: 'José Carlos',
  Caieira: 'João Paulo',
  Bodoquena: 'Daniel Carvalho',
}

// Lista única de capatazes, derivada do mapa acima
export const CAPATAZES: string[] = [...new Set(Object.values(CAPATAZ_POR_RETIRO))]

// Nome do capataz responsável por um retiro (com fallback seguro)
export function capatazDoRetiro(retiro: string): string {
  return (CAPATAZ_POR_RETIRO as Record<string, string>)[retiro] ?? 'Capataz'
}

// Slug do retiro usado no <option> do filtro de relatórios
export function slugRetiro(retiro: string): string {
  return retiro
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
}

// Opções de retiro prontas para o filtro do relatório (rótulo + slug)
export const OPCOES_RETIRO = RETIROS.map((r) => ({ rotulo: r, valor: slugRetiro(r) }))

// O roster oficial da fazenda (retiro → capataz) vive no banco, semeado pela
// migração 022-seed-roster-fazenda.sql; não duplicar aqui
