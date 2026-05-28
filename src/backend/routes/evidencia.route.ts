import { Router } from 'express'
import { EvidenciaController } from '../controllers/evidencia.controller'

const evidenciaRoutes = Router()

// Listagem geral e busca individual de evidências
evidenciaRoutes.get('/', EvidenciaController.listar)
evidenciaRoutes.get('/:id', EvidenciaController.buscarPorId)

// Criação de evidências por tipo
evidenciaRoutes.post('/mensagens', EvidenciaController.criarMensagem)
evidenciaRoutes.post('/audios', EvidenciaController.criarAudio)
evidenciaRoutes.post('/fotos', EvidenciaController.criarFoto)

export default evidenciaRoutes
