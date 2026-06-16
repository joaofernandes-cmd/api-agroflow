import { Request, Response, Router } from 'express'
import { MovimentacaoController } from '../controllers/movimentacao.controller'
import { autenticarUsuario } from '../middlewares/autenticacao.middleware'
import { exigirCargo } from '../middlewares/cargo.middleware'

const movimentacaoRoutes = Router()

movimentacaoRoutes.use(autenticarUsuario)

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
movimentacaoRoutes.post('/', exigirCargo('capataz'), MovimentacaoController.criar)
movimentacaoRoutes.get('/', exigirCargo('supervisor', 'gerente'), listarOuFiltrar)
movimentacaoRoutes.get('/filtrar', exigirCargo('supervisor', 'gerente'), MovimentacaoController.filtrar)

// Recebe movimentacoes sincronizadas vindas do cliente offline.
// Esse endpoint cobre o contrato usado pelo fluxo de sincronizacao.
movimentacaoRoutes.post('/sincronizar', exigirCargo('capataz'), MovimentacaoController.sincronizarRecebida)

// Consulta movimentacoes ainda aguardando validacao.
movimentacaoRoutes.get('/pendentes', exigirCargo('supervisor', 'gerente'), MovimentacaoController.listarPendentes)

// Dados consolidados para dashboard.
movimentacaoRoutes.get('/dashboard', exigirCargo('supervisor', 'gerente'), MovimentacaoController.buscarParaDashboard)
movimentacaoRoutes.get('/contagem/tipo', exigirCargo('supervisor', 'gerente'), MovimentacaoController.contarPorTipo)

// Rotas por ID ficam por ultimo para nao capturar rotas especificas.
movimentacaoRoutes.get('/:id', exigirCargo('supervisor', 'gerente'), MovimentacaoController.buscarPorId)
movimentacaoRoutes.patch('/:id', exigirCargo('capataz', 'supervisor'), MovimentacaoController.atualizar)
movimentacaoRoutes.patch('/:id/sincronizar', exigirCargo('capataz'), MovimentacaoController.sincronizar)
movimentacaoRoutes.delete('/:id', exigirCargo('supervisor'), MovimentacaoController.remover)

export default movimentacaoRoutes
