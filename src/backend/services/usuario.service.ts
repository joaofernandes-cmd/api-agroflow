import { UsuarioRepository } from '../repositories/usuario.repository'
import { Usuario, UsuarioInput } from '../models/usuario.model'

export class UsuarioService {
  constructor(private repository: UsuarioRepository) {}

  async listar(): Promise<Usuario[]> {
    return this.repository.findAll()
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.repository.findById(id)
  }

  async cadastrar(data: UsuarioInput): Promise<Usuario> {
    return this.repository.create(data)
  }

  async atualizar(id: string, data: Partial<UsuarioInput>): Promise<Usuario> {
    return this.repository.update(id, data)
  }

  async remover(id: string): Promise<void> {
    return this.repository.delete(id)
  }
}
