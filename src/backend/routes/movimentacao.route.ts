import { Request, Response, Router } from 'express'
import { MovimentacaoController } from '../controllers/movimentacao.controller'
import { autenticarUsuario } from '../middlewares/autenticacao.middleware'
import { exigirCargo } from '../middlewares/cargo.middleware'

const movimentacaoRoutes = Router()

movimentacaoRoutes.use(autenticarUsuario)

// Mantém a listagem geral separada do filtro para ficar mais fiel ao WAD;
// a rota /filtrar é o contrato documentado para o Supervisor
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

// Criação e listagem de movimentações do rebanho
movimentacaoRoutes.post('/', exigirCargo('capataz'), MovimentacaoController.criar)
movimentacaoRoutes.get('/', exigirCargo('supervisor', 'gerente'), listarOuFiltrar)
movimentacaoRoutes.get('/filtrar', exigirCargo('supervisor', 'gerente'), MovimentacaoController.filtrar)

// Recebe movimentações sincronizadas vindas do cliente offline
movimentacaoRoutes.post('/sincronizar', exigirCargo('capataz'), MovimentacaoController.sincronizarRecebida)

// Consulta movimentações ainda aguardando validação
movimentacaoRoutes.get('/pendentes', exigirCargo('supervisor', 'gerente'), MovimentacaoController.listarPendentes)

// Dados consolidados para dashboard
movimentacaoRoutes.get('/dashboard', exigirCargo('supervisor', 'gerente'), MovimentacaoController.buscarParaDashboard)
movimentacaoRoutes.get('/contagem/tipo', exigirCargo('supervisor', 'gerente'), MovimentacaoController.contarPorTipo)

// Rotas por ID ficam por último para não capturar rotas específicas
movimentacaoRoutes.get('/:id', exigirCargo('supervisor', 'gerente'), MovimentacaoController.buscarPorId)
movimentacaoRoutes.patch('/:id', exigirCargo('capataz', 'supervisor'), MovimentacaoController.atualizar)
movimentacaoRoutes.patch('/:id/sincronizar', exigirCargo('capataz'), MovimentacaoController.sincronizar)
movimentacaoRoutes.delete('/:id', exigirCargo('supervisor'), MovimentacaoController.remover)

export default movimentacaoRoutes
