import { Request, Response, Router } from 'express'
import { MovimentacaoController } from '../controllers/movimentacao.controller'

const movimentacaoRoutes = Router()

// Lista todas as movimentações ou aplica filtros quando retiroId é informado.
function listarOuFiltrar(req: Request, res: Response) {
  if (req.query.retiroId) {
    return MovimentacaoController.filtrar(req, res)
  }

  if (req.query.tipos || req.query.status) {
    return res.status(400).json({ error: 'Retiro é obrigatório para filtrar movimentações' })
  }

  return MovimentacaoController.listarTodas(req, res)
}

// Criação e listagem de movimentações do rebanho.
movimentacaoRoutes.post('/', MovimentacaoController.criar)
movimentacaoRoutes.get('/', listarOuFiltrar)

// Consulta movimentações ainda aguardando validação.
movimentacaoRoutes.get('/pendentes', MovimentacaoController.listarPendentes)

// Dados consolidados para dashboard.
movimentacaoRoutes.get('/dashboard', MovimentacaoController.buscarParaDashboard)
movimentacaoRoutes.get('/contagem/tipo', MovimentacaoController.contarPorTipo)

// Rotas por ID ficam por último para não capturar rotas específicas.
movimentacaoRoutes.get('/:id', MovimentacaoController.buscarPorId)
movimentacaoRoutes.patch('/:id', MovimentacaoController.atualizar)
movimentacaoRoutes.patch('/:id/sincronizar', MovimentacaoController.sincronizar)
movimentacaoRoutes.delete('/:id', MovimentacaoController.remover)

export default movimentacaoRoutes
