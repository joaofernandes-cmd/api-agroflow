import { Request, Response, Router } from 'express'
import { MovimentacaoController } from '../controllers/movimentacao.controller'

const movimentacaoRoutes = Router()

// Mantem a listagem geral separada do filtro para ficar mais fiel ao WAD.
// A rota /filtrar representa o contrato documentado para o Supervisor.
function listarOuFiltrar(req: Request, res: Response) {
  const temAlgumFiltro =
    req.query.retiro ||
    req.query.retiroId ||
    req.query.tipo ||
    req.query.tipos ||
    req.query.status ||
    req.query.dataInicio ||
    req.query.dataFim

  if (temAlgumFiltro) {
    return MovimentacaoController.filtrar(req, res)
  }

  return MovimentacaoController.listarTodas(req, res)
}

// Criacao e listagem de movimentacoes do rebanho.
movimentacaoRoutes.post('/', MovimentacaoController.criar)
movimentacaoRoutes.get('/', listarOuFiltrar)
movimentacaoRoutes.get('/filtrar', MovimentacaoController.filtrar)

// Recebe movimentacoes sincronizadas vindas do cliente offline.
// Esse endpoint cobre o contrato usado pelo fluxo de sincronizacao.
movimentacaoRoutes.post('/sincronizar', MovimentacaoController.sincronizarRecebida)

// Consulta movimentacoes ainda aguardando validacao.
movimentacaoRoutes.get('/pendentes', MovimentacaoController.listarPendentes)

// Dados consolidados para dashboard.
movimentacaoRoutes.get('/dashboard', MovimentacaoController.buscarParaDashboard)
movimentacaoRoutes.get('/contagem/tipo', MovimentacaoController.contarPorTipo)

// Rotas por ID ficam por ultimo para nao capturar rotas especificas.
movimentacaoRoutes.get('/:id', MovimentacaoController.buscarPorId)
movimentacaoRoutes.patch('/:id', MovimentacaoController.atualizar)
movimentacaoRoutes.patch('/:id/sincronizar', MovimentacaoController.sincronizar)
movimentacaoRoutes.delete('/:id', MovimentacaoController.remover)

export default movimentacaoRoutes
