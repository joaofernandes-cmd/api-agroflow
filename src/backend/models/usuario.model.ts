// Importa a conexão do banco de dados
import { pool } from '../database/connection'
// Importa função para gerar UUID (identificador único)
import { randomUUID } from 'crypto'

// Define tipos possíveis para status do usuário (ativo ou inativo)
export type UsuarioStatus = 'ativo' | 'inativo'
// Define tipos possíveis para cargo do usuário
export type UsuarioCargo = 'capataz' | 'supervisor' | 'gerente'

// Interface que representa um usuário completo no banco de dados
export interface Usuario {
  id: string                    // Identificador único
  retiro_id: string             // ID do retiro a qual pertence
  nome: string                  // Nome do usuário
  login: string                 // Login único para acesso
  senha_hash: string            // Senha criptografada
  status: UsuarioStatus         // Status (ativo/inativo)
  data_criacao: Date            // Data e hora de criação
  cargo: UsuarioCargo           // Cargo do usuário (capataz, supervisor, gerente)
}

// Interface para dados de entrada ao criar um usuário (sem id e data_criacao)
export interface UsuarioInput {
  retiro_id: string
  nome: string
  login: string
  senha_hash: string
  status: UsuarioStatus
  cargo: UsuarioCargo
}

// Classe com todos os métodos para gerenciar usuários no banco
export class UsuarioModel {
  // Busca todos os usuários ordenados por nome
  async findAll(): Promise<Usuario[]> {
    // Executa query SELECT no banco
    const result = await pool.query('SELECT * FROM usuario ORDER BY nome')
    // Retorna as linhas como array de Usuario
    return result.rows as Usuario[]
  }

  // Busca um usuário específico pelo ID
  async findById(id: string): Promise<Usuario | null> {
    // Query com parâmetro $1 (substituído por id) para evitar SQL injection
    const result = await pool.query('SELECT * FROM usuario WHERE id = $1', [id])
    // Retorna primeira linha ou null se não encontrar (?? = null coalescing)
    return (result.rows[0] as Usuario) ?? null
  }

  // Busca um usuário pelo login 
  async findByLogin(login: string): Promise<Usuario | null> {
    const result = await pool.query('SELECT * FROM usuario WHERE login = $1', [login])
    return (result.rows[0] as Usuario) ?? null
  }

  // Cria um novo usuário no banco de dados
  async create(data: UsuarioInput): Promise<Usuario> {
    // Gera um UUID único para o novo usuário
    const id = randomUUID()
    // Pega a data e hora atual
    const dataCriacao = new Date()
    // INSERT com 8 parâmetros: id, retiro_id, nome, login, senha_hash, status, data_criacao, cargo
    // RETURNING * retorna os dados inseridos
    const result = await pool.query(
      'INSERT INTO usuario (id, retiro_id, nome, login, senha_hash, status, data_criacao, cargo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [id, data.retiro_id, data.nome, data.login, data.senha_hash, data.status, dataCriacao, data.cargo]
    )
    // Retorna o usuário que foi criado
    return result.rows[0] as Usuario
  }

  // Atualiza um usuário existente (só os campos que foram passados)
  async update(id: string, data: Partial<UsuarioInput>): Promise<Usuario | null> {
    // Arrays para construir a query dinamicamente
    const fields: string[] = []    // Vai armazenar "nome = $1", "status = $2", etc
    const values: any[] = []       // Vai armazenar os valores reais
    let paramCount = 1             // Contador para os parâmetros da query

    // Se nome foi passado, adiciona ele à atualização
    if (data.nome !== undefined) {
      fields.push(`nome = $${paramCount}`)
      values.push(data.nome)
      paramCount++                 // Próximo parâmetro será $2
    }
    // Se status foi passado, adiciona ele
    if (data.status !== undefined) {
      fields.push(`status = $${paramCount}`)
      values.push(data.status)
      paramCount++
    }
    // Se cargo foi passado, adiciona ele
    if (data.cargo !== undefined) {
      fields.push(`cargo = $${paramCount}`)
      values.push(data.cargo)
      paramCount++
    }

    // Se nenhum campo foi atualizado, só retorna o usuário atual
    if (fields.length === 0) return this.findById(id)

    // Adiciona o ID no final do array de valores para o WHERE
    values.push(id)
    // Monta a query: "UPDATE usuario SET nome = $1, status = $2 WHERE id = $3 RETURNING *"
    const query = `UPDATE usuario SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`
    // Executa a query
    const result = await pool.query(query, values)
    // Retorna o usuário atualizado ou null se não encontrou
    return (result.rows[0] as Usuario) ?? null
  }

  // Deleta um usuário do banco de dados
  async delete(id: string): Promise<boolean> {
    // DELETE retorna quantas linhas foram afetadas (rowCount)
    const result = await pool.query('DELETE FROM usuario WHERE id = $1', [id])
    // Retorna true se deletou 1 ou mais linhas, false se não encontrou
    return (result.rowCount ?? 0) > 0
  }
}
