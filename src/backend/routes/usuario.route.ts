import { Router } from 'express'
import { UsuarioController } from '../controllers/usuario.controller'
import { autenticarUsuario } from '../middlewares/autenticacao.middleware'
import { exigirCargo } from '../middlewares/cargo.middleware'

const usuarioRoutes = Router()

// Autenticação do usuário pelo login e senha
usuarioRoutes.post('/login', UsuarioController.autenticar)
usuarioRoutes.post('/logout', UsuarioController.logout)

// CRUD básico de usuários; daqui em diante exige login válido
usuarioRoutes.use(autenticarUsuario)
usuarioRoutes.get('/capatazes/retiro/:retiroId', UsuarioController.listarCapatazesPorRetiro)
// E, além disso, só gerente pode mexer nesses cadastros
usuarioRoutes.use(exigirCargo('gerente'))
usuarioRoutes.post('/', UsuarioController.criar)
usuarioRoutes.get('/', UsuarioController.listarTodos)

// Consulta usuários vinculados a um retiro específico
usuarioRoutes.get('/retiro/:retiroId', UsuarioController.listarPorRetiro)

// Rotas por ID ficam por último para não capturar rotas específicas
usuarioRoutes.get('/:id', UsuarioController.buscarPorId)
usuarioRoutes.patch('/:id', UsuarioController.atualizar)
usuarioRoutes.delete('/:id', UsuarioController.remover)

export default usuarioRoutes
