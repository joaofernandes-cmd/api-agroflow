import { Router } from 'express'
import { RetiroController } from '../controllers/retiro.controller'
import { RetiroService } from '../services/retiro.service'
import { RetiroRepository } from '../repositories/retiro.repository'

const repo = new RetiroRepository()
const service = new RetiroService(repo)
const controller = new RetiroController(service)

const router = Router()
router.get('/retiros', controller.listar)
router.get('/retiros/:id', controller.exibirForm)
router.post('/retiros', controller.criar)

export default router;

