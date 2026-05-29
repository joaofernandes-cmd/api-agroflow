import { Router } from 'express'
import { RelatorioController } from '../controllers/relatorio.controller'
import { autenticarUsuario } from '../middlewares/autenticacao.middleware'
import { exigirCargo } from '../middlewares/cargo.middleware'

const relatorioRoutes = Router()

// Relatórios são área restrita.
relatorioRoutes.use(autenticarUsuario)
// Gerente e supervisor podem consultar esses dados.
relatorioRoutes.use(exigirCargo('gerente', 'supervisor'))

// Dados brutos usados na montagem de relatórios
relatorioRoutes.get('/movimentacoes/dados', RelatorioController.buscarDadosMovimentacoes)
relatorioRoutes.get('/tarefas/dados', RelatorioController.buscarDadosTarefas)

// Relatório de movimentações formatado para exportação em planilha
relatorioRoutes.get('/movimentacoes', RelatorioController.formatarRelatorioMovimentacoes)

// Relatórios prontos por período padrão
relatorioRoutes.get('/semanal', RelatorioController.gerarRelatorioSemanal)
relatorioRoutes.get('/mensal', RelatorioController.gerarRelatorioMensal)

export default relatorioRoutes
