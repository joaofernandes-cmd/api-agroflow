import sql from '../database/connection'
import { UUID } from '../models/uuid'

// Associação supervisor ↔ retiros. Um supervisor pode cobrir 1 ou vários
// retiros; esta tabela guarda os retiros adicionais além do retiro "sede"
// (usuario.retiro_id).
export const SupervisorRetiroRepository = {
  // Retorna os ids dos retiros que o supervisor cobre (sem o retiro sede, que
  // vive em usuario.retiro_id).
  async buscarRetirosPorSupervisor(supervisorId: UUID): Promise<UUID[]> {
    const linhas = await sql<{ retiro_id: UUID }[]>`
      SELECT retiro_id
      FROM supervisor_retiro
      WHERE supervisor_id = ${supervisorId}
    `
    return linhas.map((l) => l.retiro_id)
  },
}
