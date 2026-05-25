import { Request, Response } from 'express'
import { RetiroService } from '../services/retiro.service'

export class RetiroController {
  constructor(private service: RetiroService) {}

  listar = async (req: Request, res: Response) => {
    const retiros = await this.service.listar()
    res.json(retiros)
  }

  exibirForm = async (req: Request<{ id: string }>, res: Response) => {
    const retiro = await this.service.buscarPorId(req.params.id)
    if (!retiro) {
      res.status(404).json({ message: 'Retiro não encontrado' })
      return
    }
    res.json(retiro)
  }

  criar = async (req: Request, res: Response) => {
    await this.service.cadastrar(req.body)
    if (req.is('urlencoded')) {
      res.redirect('/retiros')
    } else {
      res.status(201).json({ message: 'Retiro criado com sucesso' })
    }
  }
}
