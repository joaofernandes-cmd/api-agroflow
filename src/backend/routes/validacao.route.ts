import { Router } from 'express'
import { ValidacaoController } from '../controllers/validacao.controller'

const validacaoRoutes = Router()

// Verifica se um usuário tem permissão para validar registros
validacaoRoutes.post('/permissao', ValidacaoController.podeValidar)

// Aprovação e rejeição de movimentações pendentes
validacaoRoutes.patch('/movimentacoes/:id/aprovar', ValidacaoController.aprovarMovimentacao)
validacaoRoutes.patch('/movimentacoes/:id/rejeitar', ValidacaoController.rejeitarMovimentacao)

// Aprovação e rejeição de tarefas pendentes
validacaoRoutes.patch('/tarefas/:id/aprovar', ValidacaoController.aprovarTarefa)
validacaoRoutes.patch('/tarefas/:id/rejeitar', ValidacaoController.rejeitarTarefa)

export default validacaoRoutes
