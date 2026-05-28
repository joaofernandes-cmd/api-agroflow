import { Router } from 'express'
import { RelatorioController } from '../controllers/relatorio.controller'

const relatorioRoutes = Router()

// Dados brutos usados na montagem de relatórios
relatorioRoutes.get('/movimentacoes/dados', RelatorioController.buscarDadosMovimentacoes)
relatorioRoutes.get('/tarefas/dados', RelatorioController.buscarDadosTarefas)

// Relatório de movimentações formatado para exportação em planilha
relatorioRoutes.get('/movimentacoes', RelatorioController.formatarRelatorioMovimentacoes)

// Relatórios prontos por período padrão
relatorioRoutes.get('/semanal', RelatorioController.gerarRelatorioSemanal)
relatorioRoutes.get('/mensal', RelatorioController.gerarRelatorioMensal)

export default relatorioRoutes
