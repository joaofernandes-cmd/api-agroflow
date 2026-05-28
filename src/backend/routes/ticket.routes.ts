import { Router } from 'express'
import { TicketController } from '../controllers/ticket.controller'

const ticketRoutes = Router()

// Criação e listagem geral de tickets.
ticketRoutes.post('/', TicketController.criar)
ticketRoutes.get('/', TicketController.listarTodos)

// Consultas específicas usadas por filtros, dashboard e acompanhamento.
ticketRoutes.get('/abertos', TicketController.listarAbertos)
ticketRoutes.get('/status', TicketController.listarPorStatus)
ticketRoutes.get('/prioridade', TicketController.listarPorPrioridade)
ticketRoutes.get('/categoria', TicketController.listarPorCategoria)
ticketRoutes.get('/contagem/prioridade', TicketController.contarPorPrioridade)

// Rotas por ID ficam por último para não capturar rotas específicas.
ticketRoutes.get('/:id', TicketController.buscarPorId)
ticketRoutes.patch('/:id/status', TicketController.atualizarStatus)
ticketRoutes.patch('/:id/prioridade', TicketController.alterarPrioridade)
ticketRoutes.patch('/:id/atribuicao', TicketController.atribuirA)

export default ticketRoutes
