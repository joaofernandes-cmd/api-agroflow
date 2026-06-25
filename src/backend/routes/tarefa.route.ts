import { Router } from 'express'
import { TarefaController } from '../controllers/tarefa.controller'
import { autenticarUsuario } from '../middlewares/autenticacao.middleware'
import { exigirCargo } from '../middlewares/cargo.middleware'

const tarefaRoutes = Router()

tarefaRoutes.use(autenticarUsuario)

// Criação e listagem geral de tarefas
tarefaRoutes.post('/', exigirCargo('supervisor'), TarefaController.criar)
tarefaRoutes.post('/sincronizar', exigirCargo('capataz', 'supervisor'), TarefaController.sincronizarRecebida)
tarefaRoutes.get('/', exigirCargo('supervisor', 'gerente'), TarefaController.listarTodas)

// Consultas específicas usadas por dashboard e filtros
tarefaRoutes.get('/dashboard', exigirCargo('supervisor', 'gerente'), TarefaController.buscarParaDashboard)
tarefaRoutes.get('/status/:status', exigirCargo('supervisor', 'gerente'), TarefaController.listarPorStatus)
tarefaRoutes.get('/usuario/:usuarioId', exigirCargo('capataz', 'supervisor'), TarefaController.listarPorUsuario)
tarefaRoutes.get('/prioridade/:prioridade', exigirCargo('supervisor', 'gerente'), TarefaController.listarPorPrioridade)
tarefaRoutes.get('/categoria/:categoria', exigirCargo('supervisor', 'gerente'), TarefaController.listarPorCategoria)
tarefaRoutes.get('/contagem/status', exigirCargo('supervisor', 'gerente'), TarefaController.contarPorStatus)

// Rotas por ID ficam por último para preservar as rotas específicas acima
tarefaRoutes.get('/:id', exigirCargo('capataz', 'supervisor', 'gerente'), TarefaController.buscarPorId)
tarefaRoutes.patch('/:id', exigirCargo('supervisor'), TarefaController.atualizar)
tarefaRoutes.patch('/:id/status', exigirCargo('capataz', 'supervisor'), TarefaController.atualizarStatus)
tarefaRoutes.delete('/:id', exigirCargo('supervisor'), TarefaController.remover)

export default tarefaRoutes

