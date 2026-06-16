import { Router } from 'express'
import { TicketController } from '../controllers/ticket.controller'
import { autenticarUsuario } from '../middlewares/autenticacao.middleware'
import { exigirCargo } from '../middlewares/cargo.middleware'

const ticketRoutes = Router()

ticketRoutes.use(autenticarUsuario)

// Criação e listagem geral de tickets.
ticketRoutes.post('/', exigirCargo('capataz'), TicketController.criar)
ticketRoutes.post('/sincronizar', exigirCargo('capataz'), TicketController.sincronizarRecebida)
ticketRoutes.get('/', exigirCargo('supervisor', 'gerente'), TicketController.listarTodos)

// Consultas específicas usadas por filtros, dashboard e acompanhamento.
ticketRoutes.get('/pendentes', exigirCargo('supervisor', 'gerente'), TicketController.listarPendentes)
ticketRoutes.get('/status', exigirCargo('supervisor', 'gerente'), TicketController.listarPorStatus)
ticketRoutes.get('/prioridade', exigirCargo('supervisor', 'gerente'), TicketController.listarPorPrioridade)
ticketRoutes.get('/categoria', exigirCargo('supervisor', 'gerente'), TicketController.listarPorCategoria)
ticketRoutes.get('/contagem/prioridade', exigirCargo('supervisor', 'gerente'), TicketController.contarPorPrioridade)

// Rotas por ID ficam por último para não capturar rotas específicas.
ticketRoutes.get('/:id', exigirCargo('capataz', 'supervisor', 'gerente'), TicketController.buscarPorId)
ticketRoutes.patch('/:id/status', exigirCargo('supervisor'), TicketController.atualizarStatus)
ticketRoutes.patch('/:id/prioridade', exigirCargo('supervisor'), TicketController.alterarPrioridade)
ticketRoutes.patch('/:id/atribuicao', exigirCargo('supervisor'), TicketController.atribuirA)

export default ticketRoutes
