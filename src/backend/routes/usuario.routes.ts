import { Router } from 'express'
import { UsuarioController } from '../controllers/usuario.controller'

const usuarioRoutes = Router()

usuarioRoutes.post('/login', UsuarioController.autenticar)
usuarioRoutes.post('/', UsuarioController.criar)
usuarioRoutes.get('/', UsuarioController.listarTodos)
usuarioRoutes.get('/retiro/:retiroId', UsuarioController.listarPorRetiro)
usuarioRoutes.get('/:id', UsuarioController.buscarPorId)
usuarioRoutes.patch('/:id', UsuarioController.atualizar)
usuarioRoutes.delete('/:id', UsuarioController.remover)

export default usuarioRoutes
