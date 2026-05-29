import { Request, Response } from 'express'
import { TicketService } from '../services/ticket.service'
import { Usuario } from '../models/usuario.model'
import { TicketCategoria, TicketPrioridade, TicketStatus } from '../models/ticket.model'

function converterNumero(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export const TicketController = {
  async listarTodos(req: Request, res: Response) {
    try {
      const tickets = await TicketService.listarTodos()
      return res.status(200).json(tickets)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tickets' })
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = converterNumero(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const ticket = await TicketService.buscarPorId(id)

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket não encontrado' })
      }

      return res.status(200).json(ticket)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar ticket' })
    }
  },

  async criar(req: Request, res: Response) {
    try {
      const {
        retiro_id,
        categoria,
        localizacao,
        descricao,
        prioridade,
        usuarioAbridorTicket,
        temEvidenciaDescritiva,
      } = req.body

      if (!retiro_id || !categoria || !localizacao || !descricao || !prioridade || !usuarioAbridorTicket) {
        return res.status(400).json({ error: 'Campos obrigatórios não informados' })
      }

      const retiroId = converterNumero(retiro_id)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const ticket = await TicketService.criar(
        {
          retiro_id: retiroId,
          categoria,
          localizacao,
          descricao,
          prioridade,
        },
        usuarioAbridorTicket as Usuario,
        Boolean(temEvidenciaDescritiva)
      )

      return res.status(201).json(ticket)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao criar ticket',
      })
    }
  },

  async listarPorStatus(req: Request, res: Response) {
    try {
      const status = String(req.query.status ?? '')
      const retiroId = req.query.retiroId ? converterNumero(req.query.retiroId) : undefined

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      if (!status) {
        return res.status(400).json({ error: 'Campo "status" é obrigatório' })
      }

      const tickets = await TicketService.listarPorStatus(status as TicketStatus, retiroId)
      return res.status(200).json(tickets)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao listar tickets por status',
      })
    }
  },

  async listarPorPrioridade(req: Request, res: Response) {
    try {
      const prioridade = String(req.query.prioridade ?? '')
      const retiroId = req.query.retiroId ? converterNumero(req.query.retiroId) : undefined

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      if (!prioridade) {
        return res.status(400).json({ error: 'Campo "prioridade" é obrigatório' })
      }

      const tickets = await TicketService.listarPorPrioridade(prioridade as TicketPrioridade, retiroId)
      return res.status(200).json(tickets)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao listar tickets por prioridade',
      })
    }
  },

  async listarPorCategoria(req: Request, res: Response) {
    try {
      const categoria = String(req.query.categoria ?? '')
      const retiroId = req.query.retiroId ? converterNumero(req.query.retiroId) : undefined

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      if (!categoria) {
        return res.status(400).json({ error: 'Campo "categoria" é obrigatório' })
      }

      const tickets = await TicketService.listarPorCategoria(categoria as TicketCategoria, retiroId)
      return res.status(200).json(tickets)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao listar tickets por categoria',
      })
    }
  },

  async listarPendentes(req: Request, res: Response) {
    try {
      const retiroId = req.query.retiroId ? converterNumero(req.query.retiroId) : undefined

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }
      const tickets = await TicketService.listarPendentes(retiroId)
      return res.status(200).json(tickets)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tickets pendentes' })
    }
  },

  async contarPorPrioridade(req: Request, res: Response) {
    try {
      const retiroId = req.query.retiroId ? converterNumero(req.query.retiroId) : undefined

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }
      const contagem = await TicketService.contarPorPrioridade(retiroId)
      return res.status(200).json(contagem)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao contar tickets por prioridade' })
    }
  },

  async atualizarStatus(req: Request, res: Response) {
    try {
      const id = converterNumero(req.params.id)
      const { novoStatus } = req.body

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!novoStatus) {
        return res.status(400).json({ error: 'Campo "novoStatus" é obrigatório' })
      }

      const ticket = await TicketService.atualizarStatus(id, novoStatus as TicketStatus)

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket não encontrado' })
      }

      return res.status(200).json(ticket)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao atualizar status do ticket',
      })
    }
  },

  async alterarPrioridade(req: Request, res: Response) {
    try {
      const id = converterNumero(req.params.id)
      const { novaPrioridade } = req.body

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!novaPrioridade) {
        return res.status(400).json({ error: 'Campo "novaPrioridade" é obrigatório' })
      }

      const ticket = await TicketService.alterarPrioridade(
        id,
        novaPrioridade as TicketPrioridade
      )

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket não encontrado' })
      }

      return res.status(200).json(ticket)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao alterar prioridade do ticket',
      })
    }
  },

  async atribuirA(req: Request, res: Response) {
    try {
      const id = converterNumero(req.params.id)
      const { usuarioId } = req.body

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!usuarioId) {
        return res.status(400).json({ error: 'Campo "usuarioId" é obrigatório' })
      }

      const ticket = await TicketService.atribuirA(id, String(usuarioId))

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket não encontrado' })
      }

      return res.status(200).json(ticket)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao atribuir ticket',
      })
    }
  },
}
