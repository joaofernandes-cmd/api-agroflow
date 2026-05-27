import { Router } from 'express'
import { TarefaController } from '../controllers/tarefa.controller'

const tarefaRoutes = Router()

// Criação e listagem geral de tarefas
tarefaRoutes.post('/', TarefaController.criar)
tarefaRoutes.get('/', TarefaController.listarTodas)

// Consultas específicas usadas por dashboard e filtros
tarefaRoutes.get('/dashboard', TarefaController.buscarParaDashboard)
tarefaRoutes.get('/status/:status', TarefaController.listarPorStatus)
tarefaRoutes.get('/usuario/:usuarioId', TarefaController.listarPorUsuario)
tarefaRoutes.get('/prioridade/:prioridade', TarefaController.listarPorPrioridade)
tarefaRoutes.get('/categoria/:categoria', TarefaController.listarPorCategoria)
tarefaRoutes.get('/contagem/status', TarefaController.contarPorStatus)

// Rotas por ID ficam por último para preservar as rotas específicas acima
tarefaRoutes.get('/:id', TarefaController.buscarPorId)
tarefaRoutes.patch('/:id', TarefaController.atualizar)
tarefaRoutes.patch('/:id/status', TarefaController.atualizarStatus)
tarefaRoutes.delete('/:id', TarefaController.remover)

export default tarefaRoutes

