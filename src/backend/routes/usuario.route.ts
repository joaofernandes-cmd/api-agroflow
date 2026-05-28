import { Router } from 'express'
import { UsuarioController } from '../controllers/usuario.controller'

const usuarioRoutes = Router()

// Autenticação do usuário pelo login e senha
usuarioRoutes.post('/login', UsuarioController.autenticar)

// CRUD básico de usuários
usuarioRoutes.post('/', UsuarioController.criar)
usuarioRoutes.get('/', UsuarioController.listarTodos)

// Consulta usuários vinculados a um retiro específico
usuarioRoutes.get('/retiro/:retiroId', UsuarioController.listarPorRetiro)

// Rotas por ID ficam por último para não capturar rotas específicas.
usuarioRoutes.get('/:id', UsuarioController.buscarPorId)
usuarioRoutes.patch('/:id', UsuarioController.atualizar)
usuarioRoutes.delete('/:id', UsuarioController.remover)

export default usuarioRoutes
