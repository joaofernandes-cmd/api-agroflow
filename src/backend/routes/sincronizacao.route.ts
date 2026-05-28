import { Router } from 'express'
import { SincronizacaoController } from '../controllers/sincronizacao.controller'

const sincronizacaoRoutes = Router()

// Verifica se existe conexão disponível para sincronizar.
sincronizacaoRoutes.get('/conexao', SincronizacaoController.detectarConexao)

// Executa a sincronização dos dados pendentes.
sincronizacaoRoutes.post('/', SincronizacaoController.sincronizar)

// Consulta status e mensagem amigável da sincronização.
sincronizacaoRoutes.get('/status', SincronizacaoController.obterStatusSincronizacao)
sincronizacaoRoutes.get('/mensagem', SincronizacaoController.obterMensagemSincronizacao)

// Dados sincronizados usados por relatórios e dashboard.
sincronizacaoRoutes.get('/relatorios/movimentacoes', SincronizacaoController.buscarMovimentacoesParaRelatrio)
sincronizacaoRoutes.get('/relatorios/tarefas', SincronizacaoController.buscarTarefasParaRelatrio)
sincronizacaoRoutes.get('/dashboard/tickets', SincronizacaoController.buscarTicketsParaDashboard)

export default sincronizacaoRoutes
