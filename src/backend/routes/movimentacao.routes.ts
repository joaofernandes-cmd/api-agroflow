import { Request, Response, Router } from 'express'
import { MovimentacaoController } from '../controllers/movimentacao.controller'

const movimentacaoRoutes = Router()

function listarOuFiltrar(req: Request, res: Response) {
  if (req.query.retiroId) {
    return MovimentacaoController.filtrar(req, res)
  }

  if (req.query.tipos || req.query.status) {
    return res.status(400).json({ error: 'Retiro é obrigatório para filtrar movimentações' })
  }

  return MovimentacaoController.listarTodas(req, res)
}

movimentacaoRoutes.post('/', MovimentacaoController.criar)
movimentacaoRoutes.get('/', listarOuFiltrar)
movimentacaoRoutes.get('/pendentes', MovimentacaoController.listarPendentes)
movimentacaoRoutes.get('/:id', MovimentacaoController.buscarPorId)
movimentacaoRoutes.patch('/:id', MovimentacaoController.atualizar)
movimentacaoRoutes.patch('/:id/validacao', MovimentacaoController.validar)
movimentacaoRoutes.patch('/:id/sincronizar', MovimentacaoController.sincronizar)
movimentacaoRoutes.delete('/:id', MovimentacaoController.remover)

export default movimentacaoRoutes
