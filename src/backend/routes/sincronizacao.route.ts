import { Router } from 'express'
import { SincronizacaoController } from '../controllers/sincronizacao.controller'
import { autenticarUsuario } from '../middlewares/autenticacao.middleware'
import { exigirCargo } from '../middlewares/cargo.middleware'

const sincronizacaoRoutes = Router()

// Verifica se existe conexão disponível para sincronizar
sincronizacaoRoutes.get('/conexao', SincronizacaoController.detectarConexao)

sincronizacaoRoutes.use(autenticarUsuario)

// Executa a sincronização dos dados pendentes
sincronizacaoRoutes.post('/', exigirCargo('capataz', 'supervisor'), SincronizacaoController.sincronizar)

// Consulta status e mensagem amigável da sincronização
sincronizacaoRoutes.get('/status', exigirCargo('capataz', 'supervisor', 'gerente'), SincronizacaoController.obterStatusSincronizacao)
sincronizacaoRoutes.get('/mensagem', exigirCargo('capataz', 'supervisor', 'gerente'), SincronizacaoController.obterMensagemSincronizacao)

// Dados sincronizados usados por relatórios e dashboard
sincronizacaoRoutes.get('/relatorios/movimentacoes', exigirCargo('supervisor', 'gerente'), SincronizacaoController.buscarMovimentacoesParaRelatrio)
sincronizacaoRoutes.get('/relatorios/tarefas', exigirCargo('supervisor', 'gerente'), SincronizacaoController.buscarTarefasParaRelatrio)
sincronizacaoRoutes.get('/dashboard/tickets', exigirCargo('supervisor', 'gerente'), SincronizacaoController.buscarTicketsParaDashboard)

export default sincronizacaoRoutes
