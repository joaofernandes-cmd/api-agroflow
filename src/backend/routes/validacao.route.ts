import { Router } from 'express'
import { ValidacaoController } from '../controllers/validacao.controller'
import { autenticarUsuario } from '../middlewares/autenticacao.middleware'
import { exigirCargo } from '../middlewares/cargo.middleware'

const validacaoRoutes = Router()

// Validação só pode ser acessada por usuários autenticados com cargo supervisor.
validacaoRoutes.use(autenticarUsuario)
validacaoRoutes.use(exigirCargo('supervisor'))

// Verifica se um usuário tem permissão para validar registros
validacaoRoutes.post('/permissao', ValidacaoController.podeValidar)

// Validação de movimentações pendentes
validacaoRoutes.patch('/movimentacoes/:id/validar', ValidacaoController.validarMovimentacao)

// Aprovação de tickets e tarefas pendentes
validacaoRoutes.patch('/tickets/:id/aprovar', ValidacaoController.aprovarTicket)
validacaoRoutes.patch('/tarefas/:id/aprovar', ValidacaoController.aprovarTarefa)

export default validacaoRoutes
