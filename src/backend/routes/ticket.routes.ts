import { Router } from 'express'
import { TicketController } from '../controllers/ticket.controller'
import { validarPayloadTicket } from '../middlewares/validar-ticket.middleware'
import { TicketRepository } from '../repositories/ticket.repository'
import { TicketService } from '../services/ticket.service'

const repo = new TicketRepository()
const service = new TicketService(repo)
const controller = new TicketController(service)

const router = Router()
router.post('/tickets', validarPayloadTicket, controller.abrir)

export default router
