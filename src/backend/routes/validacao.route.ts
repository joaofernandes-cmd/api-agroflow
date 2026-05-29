import { Router } from 'express'
import { ValidacaoController } from '../controllers/validacao.controller'
import { autenticarUsuario } from '../middlewares/auth.middleware'
import { exigirCargo } from '../middlewares/role.middleware'

const validacaoRoutes = Router()

// Tela de validação: só entra quem estiver autenticado.
validacaoRoutes.use(autenticarUsuario)
// E, dentro dela, apenas supervisor pode aprovar/validar.
validacaoRoutes.use(exigirCargo('supervisor'))

// Verifica se um usuário tem permissão para validar registros
validacaoRoutes.post('/permissao', ValidacaoController.podeValidar)

// Validação de movimentações pendentes
validacaoRoutes.patch('/movimentacoes/:id/validar', ValidacaoController.validarMovimentacao)

// Aprovação de tickets e tarefas pendentes
validacaoRoutes.patch('/tickets/:id/aprovar', ValidacaoController.aprovarTicket)
validacaoRoutes.patch('/tarefas/:id/aprovar', ValidacaoController.aprovarTarefa)

export default validacaoRoutes
