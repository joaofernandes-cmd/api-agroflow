import {
  AbrirTicketInput,
  EvidenciaInput,
  TicketRepository,
} from '../repositories/ticket.repository'

export class EvidenciaObrigatoriaError extends Error {
  constructor() {
    super('Ticket rejeitado: ao menos uma evidência descritiva é obrigatória')
    this.name = 'EvidenciaObrigatoriaError'
  }
}

export class TicketService {
  constructor(private repository: TicketRepository) {}

  async abrir(data: AbrirTicketInput) {
    this.validarEvidencia(data.evidencias ?? [])
    return this.repository.save(data)
  }

  private validarEvidencia(evidencias: EvidenciaInput[]) {
    // RN08: mensagem >= 10 caracteres OU áudio >= 3 segundos.
    const temEvidenciaValida = evidencias.some((ev) => {
      if (ev.tipo === 'mensagem') {
        return typeof ev.conteudo === 'string' && ev.conteudo.length >= 10
      }
      if (ev.tipo === 'audio') {
        return (
          typeof ev.duracao_segundos === 'number' && ev.duracao_segundos >= 3
        )
      }
      return false
    })

    if (!temEvidenciaValida) {
      throw new EvidenciaObrigatoriaError()
    }
  }
}
