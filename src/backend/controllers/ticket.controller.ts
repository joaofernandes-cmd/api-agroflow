import { Request, Response } from 'express'
import {
  EvidenciaObrigatoriaError,
  TicketService,
} from '../services/ticket.service'

export class TicketController {
  constructor(private service: TicketService) {}

  abrir = async (req: Request, res: Response) => {
    try {
      const ticket = await this.service.abrir(req.body)
      res.status(201).json(ticket)
    } catch (err) {
      if (err instanceof EvidenciaObrigatoriaError) {
        res.status(422).json({ message: err.message })
        return
      }
      throw err
    }
  }
}
