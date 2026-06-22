import sql from '../database/connection'
import { CapatazAutenticado } from '../models/acesso-capataz.model'

export const AcessoCapatazRepository = {
  async buscarCapatazPorTokenHash(tokenHash: string): Promise<CapatazAutenticado | null> {
    const usuarios = await sql<CapatazAutenticado[]>`
      SELECT u.id, u.retiro_id, u.nome, u.identificador, u.login, u.senha_hash, u.status, u.data_criacao, u.cargo
      FROM acesso_capataz ac
      INNER JOIN usuario u ON u.id = ac.usuario_id
      WHERE ac.token_hash = ${tokenHash}
        AND ac.ativo = true
        AND u.status = 'ativo'
        AND u.cargo = 'capataz'
        AND (ac.data_expiracao IS NULL OR ac.data_expiracao > NOW())
      LIMIT 1
    `

    return usuarios[0] ?? null
  },
}
