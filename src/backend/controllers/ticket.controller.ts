import { Request, Response } from 'express'
import { TicketService } from '../services/ticket.service'
import { Usuario } from '../models/usuario.model'
import { TicketCategoria, TicketPrioridade, TicketStatus } from '../models/ticket.model'
import { converterUUID } from '../models/uuid'

const STATUS_TICKET_VALIDOS: TicketStatus[] = ['pendente', 'aprovado']
const PRIORIDADES_TICKET_VALIDAS: TicketPrioridade[] = ['alta', 'media', 'baixa']
const CATEGORIAS_TICKET_VALIDAS: TicketCategoria[] = [
  'cerca',
  'hidraulica',
  'eletrica',
  'edificacao',
  'abastecimento_agua',
  'outro',
]

function retiroDaConsulta(req: Request, valor?: string): string | undefined {
  if (req.usuario?.cargo === 'supervisor' || req.usuario?.cargo === 'capataz') {
    return req.usuario.retiro_id
  }

  return valor
}

export const TicketController = {
  async listarTodos(req: Request, res: Response) {
    try {
      const tickets = await TicketService.listarTodos()
      const ticketsFiltrados = req.usuario?.cargo === 'supervisor'
        ? tickets.filter(ticket => ticket.retiro_id === req.usuario?.retiro_id)
        : tickets
      return res.status(200).json(ticketsFiltrados)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tickets' })
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = converterUUID(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const ticket = await TicketService.buscarPorId(id)

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket não encontrado' })
      }

      if (
        (req.usuario?.cargo === 'supervisor' || req.usuario?.cargo === 'capataz') &&
        ticket.retiro_id !== req.usuario.retiro_id
      ) {
        return res.status(403).json({ error: 'Acesso negado: retiro diferente do usuário' })
      }

      return res.status(200).json(ticket)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar ticket' })
    }
  },

  async criar(req: Request, res: Response) {
    try {
      const {
        id,
        categoria,
        categoria_outro,
        localizacao,
        descricao,
        prioridade,
        temEvidenciaDescritiva,
      } = req.body
      const retiro_id = req.usuario?.cargo === 'capataz' ? req.usuario.retiro_id : req.body.retiro_id
      const usuarioAbridorTicket = req.usuario?.cargo === 'capataz' ? req.usuario : req.body.usuarioAbridorTicket

      if (!retiro_id || !categoria || !localizacao || !descricao || !prioridade || !usuarioAbridorTicket) {
        return res.status(400).json({ error: 'Campos obrigatórios não informados' })
      }

      if (!CATEGORIAS_TICKET_VALIDAS.includes(categoria)) {
        return res.status(400).json({ error: 'Categoria inválida' })
      }

      if (!PRIORIDADES_TICKET_VALIDAS.includes(prioridade)) {
        return res.status(400).json({ error: 'Prioridade inválida' })
      }

      const retiroId = converterUUID(retiro_id)
      const ticketId = id === undefined ? undefined : converterUUID(id)

      if (retiroId === null || ticketId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const ticket = await TicketService.criar(
        {
          id: ticketId,
          retiro_id: retiroId,
          categoria,
          categoria_outro,
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

  async sincronizarRecebida(req: Request, res: Response) {
    try {
      if (req.body.status && !STATUS_TICKET_VALIDOS.includes(req.body.status)) {
        return res.status(400).json({ error: 'Status inválido' })
      }

      if (req.body.prioridade && !PRIORIDADES_TICKET_VALIDAS.includes(req.body.prioridade)) {
        return res.status(400).json({ error: 'Prioridade inválida' })
      }

      if (req.body.categoria && !CATEGORIAS_TICKET_VALIDAS.includes(req.body.categoria)) {
        return res.status(400).json({ error: 'Categoria inválida' })
      }

      const ticket = await TicketService.sincronizarRecebida(req.body)
      return res.status(201).json(ticket)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao sincronizar ticket',
      })
    }
  },

  async listarPorStatus(req: Request, res: Response) {
    try {
      const status = String(req.query.status ?? '')
      const retiroConsulta = retiroDaConsulta(req, req.query.retiroId ? String(req.query.retiroId) : undefined)
      const retiroId = retiroConsulta ? converterUUID(retiroConsulta) : undefined

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      if (!status) {
        return res.status(400).json({ error: 'Campo "status" é obrigatório' })
      }

      if (!STATUS_TICKET_VALIDOS.includes(status as TicketStatus)) {
        return res.status(400).json({ error: 'Status inválido' })
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
      const retiroConsulta = retiroDaConsulta(req, req.query.retiroId ? String(req.query.retiroId) : undefined)
      const retiroId = retiroConsulta ? converterUUID(retiroConsulta) : undefined

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      if (!prioridade) {
        return res.status(400).json({ error: 'Campo "prioridade" é obrigatório' })
      }

      if (!PRIORIDADES_TICKET_VALIDAS.includes(prioridade as TicketPrioridade)) {
        return res.status(400).json({ error: 'Prioridade inválida' })
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
      const retiroConsulta = retiroDaConsulta(req, req.query.retiroId ? String(req.query.retiroId) : undefined)
      const retiroId = retiroConsulta ? converterUUID(retiroConsulta) : undefined

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      if (!categoria) {
        return res.status(400).json({ error: 'Campo "categoria" é obrigatório' })
      }

      if (!CATEGORIAS_TICKET_VALIDAS.includes(categoria as TicketCategoria)) {
        return res.status(400).json({ error: 'Categoria inválida' })
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
      const retiroConsulta = retiroDaConsulta(req, req.query.retiroId ? String(req.query.retiroId) : undefined)
      const retiroId = retiroConsulta ? converterUUID(retiroConsulta) : undefined

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
      const retiroConsulta = retiroDaConsulta(req, req.query.retiroId ? String(req.query.retiroId) : undefined)
      const retiroId = retiroConsulta ? converterUUID(retiroConsulta) : undefined

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
      const id = converterUUID(req.params.id)
      const { novoStatus } = req.body

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!novoStatus) {
        return res.status(400).json({ error: 'Campo "novoStatus" é obrigatório' })
      }

      if (!STATUS_TICKET_VALIDOS.includes(novoStatus)) {
        return res.status(400).json({ error: 'Status inválido' })
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
      const id = converterUUID(req.params.id)
      const { novaPrioridade } = req.body

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!novaPrioridade) {
        return res.status(400).json({ error: 'Campo "novaPrioridade" é obrigatório' })
      }

      if (!PRIORIDADES_TICKET_VALIDAS.includes(novaPrioridade)) {
        return res.status(400).json({ error: 'Prioridade inválida' })
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
      const id = converterUUID(req.params.id)
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
