import sql from '../database/connection' 
import { Usuario, UsuarioInput } from '../models/usuario.model'

// Retorna todos os usuários cadastrados
export const UsuarioRepository = {

  // Ordena usuários por nome
  async findAll(): Promise<Usuario[]> {  
    return sql<Usuario[]>`
      SELECT id, retiro_id, nome, login, senha_hash, status, data_criacao, cargo
      FROM usuario
      ORDER BY nome
    `
  },

  // Busca um usuário pelo seu id e retorna null se não encontrar 
  async findById(id: string): Promise<Usuario | null> {
    const usuario = await sql<Usuario[]>`
      SELECT id, retiro_id, nome, login, senha_hash, status, data_criacao, cargo
      FROM usuario
      WHERE id = ${id} 
      LIMIT 1
    `

    return usuario[0] ?? null
  },

  // Busca um usuário pelo login (nome de usuário)
  async findByLogin(login: string): Promise<Usuario | null> {
    const usuario = await sql<Usuario[]>`
      SELECT id, retiro_id, nome, login, senha_hash, status, data_criacao, cargo
      FROM usuario
      WHERE login = ${login}
      LIMIT 1
    `

    return usuario[0] ?? null
  },

  // Cria um novo usuário no banco de dados
  async create(input: UsuarioInput): Promise<Usuario> {
    const [created] = await sql<Usuario[]>`
      INSERT INTO usuario (retiro_id, nome, login, senha_hash, status, data_criacao, cargo)
      VALUES (
        ${input.retiro_id},
        ${input.nome},
        ${input.login},
        ${input.senha_hash},
        ${input.status},
        ${new Date()},
        ${input.cargo}
      )
      RETURNING id, retiro_id, nome, login, senha_hash, status, data_criacao, cargo
    `

    return created
  },

  // Atualiza os dados de um usuário existente
  // Campos não enviados permanecem com os valores atuais
  async update(id: string, input: Partial<UsuarioInput>): Promise<Usuario | null> {
    const updated = await sql<Usuario[]>`
      UPDATE usuario
      SET
        retiro_id = COALESCE(${input.retiro_id ?? null}, retiro_id),
        nome = COALESCE(${input.nome ?? null}, nome),
        login = COALESCE(${input.login ?? null}, login),
        senha_hash = COALESCE(${input.senha_hash ?? null}, senha_hash),
        status = COALESCE(${input.status ?? null}, status),
        cargo = COALESCE(${input.cargo ?? null}, cargo)
      WHERE id = ${id}
      RETURNING id, retiro_id, nome, login, senha_hash, status, data_criacao, cargo
    `

    return updated[0] ?? null
  },

  // Remove um usuário pelo id
  async delete(id: string): Promise<void> {
    await sql`
      DELETE FROM usuario
      WHERE id = ${id}
    `
  },
}
