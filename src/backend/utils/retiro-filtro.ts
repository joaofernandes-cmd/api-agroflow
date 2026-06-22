import { UUID } from '../models/uuid'

// Decide se um registro pertence ao filtro de retiro pedido. O filtro pode ser:
//   - undefined/null → sem filtro (passa tudo)
//   - um único retiro (UUID) → casa só com aquele retiro
//   - vários retiros (UUID[]) → casa com qualquer um do conjunto
// O caso de lista cobre o supervisor que cobre mais de um retiro.
export function correspondeRetiro(retiroAlvo: UUID, filtro?: UUID | UUID[]): boolean {
  if (filtro === undefined || filtro === null) {
    return true
  }

  if (Array.isArray(filtro)) {
    return filtro.some((r) => String(r) === String(retiroAlvo))
  }

  return String(filtro) === String(retiroAlvo)
}
