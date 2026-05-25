import { RetiroRepository } from '../repositories/retiro.repository'

export class RetiroService {
  constructor(private repository: RetiroRepository) {}

  async listar() {
    return this.repository.findAll()
  }

  async cadastrar(data: { nome: string }) {
    return this.repository.save(data)
  }

  async buscarPorId(id: string) {
    return this.repository.findById(id)
  }
}
