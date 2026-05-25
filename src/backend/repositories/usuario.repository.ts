import sql from '../database/connection' 
import { Usuario, UsuarioInput } from '../models/usuario.model'

// Retorna todos os usuários cadastrados.
export const UsuarioRepository = {

  // Ordena usuários por nome
  async findAll(): Promise<Usuario[]> {  
    return sql<Usuario[]>`
      SELECT id, retiro_id, nome, login, senha_hash, status, data_criacao, cargo
      FROM usuario
      ORDER BY nome
    `
  },

  // Busca um usuário pelo seu id.
  // Retorna null se não encontrar.
  async findById(id: string): Promise<Usuario | null> {
    const usuario = await sql<Usuario[]>`
      SELECT id, retiro_id, nome, login, senha_hash, status, data_criacao, cargo
      FROM usuario
      WHERE id = ${id} 
      LIMIT 1
    `

    return usuario[0] ?? null
  },

  // Busca um usuário pelo login (nome de usuário).
  async findByLogin(login: string): Promise<Usuario | null> {
    const usuario = await sql<Usuario[]>`
      SELECT id, retiro_id, nome, login, senha_hash, status, data_criacao, cargo
      FROM usuario
      WHERE login = ${login}
      LIMIT 1
    `

    return usuario[0] ?? null
  },

  // Cria um novo usuário no banco de dados.
  async create(data: UsuarioInput): Promise<Usuario> {
    const [created] = await sql<Usuario[]>`
      INSERT INTO usuario (retiro_id, nome, login, senha_hash, status, cargo)
      VALUES (
        ${data.retiro_id},
        ${data.nome},
        ${data.login},
        ${data.senha_hash},
        ${data.status},
        ${data.cargo}
      )
      RETURNING id, retiro_id, nome, login, senha_hash, status, data_criacao, cargo
    `

    return created
  },

  // Atualiza os dados de um usuário existente.
  // Campos não enviados permanecem com os valores atuais.
  async update(id: string, data: Partial<UsuarioInput>): Promise<Usuario | null> {
    const updated = await sql<Usuario[]>`
      UPDATE usuario
      SET
        retiro_id = COALESCE(${data.retiro_id ?? null}, retiro_id),
        nome = COALESCE(${data.nome ?? null}, nome),
        login = COALESCE(${data.login ?? null}, login),
        senha_hash = COALESCE(${data.senha_hash ?? null}, senha_hash),
        status = COALESCE(${data.status ?? null}, status),
        cargo = COALESCE(${data.cargo ?? null}, cargo)
      WHERE id = ${id}
      RETURNING id, retiro_id, nome, login, senha_hash, status, data_criacao, cargo
    `

    return updated[0] ?? null
  },

  // Remove um usuário pelo id.  
  async delete(id: string): Promise<void> {
    await sql`
      DELETE FROM usuario
      WHERE id = ${id}
    `
  },
}
