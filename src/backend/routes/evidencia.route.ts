import { Router } from 'express'
import { EvidenciaController } from '../controllers/evidencia.controller'
import { autenticarUsuario } from '../middlewares/autenticacao.middleware'
import { exigirCargo } from '../middlewares/cargo.middleware'

const evidenciaRoutes = Router()

evidenciaRoutes.use(autenticarUsuario)

// Listagem geral e busca individual de evidências
evidenciaRoutes.get('/', exigirCargo('supervisor', 'gerente'), EvidenciaController.listar)
evidenciaRoutes.get('/:id', exigirCargo('capataz', 'supervisor', 'gerente'), EvidenciaController.buscarPorId)

// Criação de evidências por tipo
evidenciaRoutes.post('/mensagens', exigirCargo('capataz', 'supervisor'), EvidenciaController.criarMensagem)
evidenciaRoutes.post('/audios', exigirCargo('capataz', 'supervisor'), EvidenciaController.criarAudio)
evidenciaRoutes.post('/fotos', exigirCargo('capataz', 'supervisor'), EvidenciaController.criarFoto)

export default evidenciaRoutes
