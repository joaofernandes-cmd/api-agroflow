import { EvidenciaTarefaRepository } from '../repositories/evidencia-tarefa.repository'
import { EvidenciaTarefa, EvidenciaTarefaInput } from '../models/evidencia-tarefa.model'

export class EvidenciaTarefaService {
  constructor(private repository: EvidenciaTarefaRepository) {}

  async listar(): Promise<EvidenciaTarefa[]> {
    return this.repository.findAll()
  }

  async buscarPorEvidenciaId(evidenciaId: string): Promise<EvidenciaTarefa[]> {
    return this.repository.findByEvidenciaId(evidenciaId)
  }

  async buscarPorTarefaId(tarefaId: string): Promise<EvidenciaTarefa[]> {
    return this.repository.findByTarefaId(tarefaId)
  }

  async cadastrar(data: EvidenciaTarefaInput): Promise<EvidenciaTarefa> {
    return this.repository.create(data)
  }

  async remover(evidenciaId: string, tarefaId: string): Promise<void> {
    return this.repository.delete(evidenciaId, tarefaId)
  }
}
