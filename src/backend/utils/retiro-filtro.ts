import { UUID } from '../models/uuid'

// Decide se um registro pertence ao filtro de retiro pedido:
//   - undefined/null → sem filtro (passa tudo)
//   - um único retiro (UUID) → casa só com aquele retiro
//   - vários retiros (UUID[]) → casa com qualquer um do conjunto (supervisor
//     que cobre mais de um retiro)
export function correspondeRetiro(retiroAlvo: UUID, filtro?: UUID | UUID[]): boolean {
  if (filtro === undefined || filtro === null) {
    return true
  }

  if (Array.isArray(filtro)) {
    return filtro.some((r) => String(r) === String(retiroAlvo))
  }

  return String(filtro) === String(retiroAlvo)
}

export function filtrarPorRetiro<T extends { retiro_id: UUID }>(
  registros: T[],
  filtro?: UUID | UUID[]
): T[] {
  return registros.filter((registro) => correspondeRetiro(registro.retiro_id, filtro))
}
