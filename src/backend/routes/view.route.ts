import { Router } from 'express'
import authViewRoutes from './pages/auth.view.route'
import capatazViewRoutes from './pages/capataz.view.route'
import gerenteViewRoutes from './pages/gerente.view.route'
import supervisorViewRoutes from './pages/supervisor.view.route'

const viewRoutes = Router()

viewRoutes.use(authViewRoutes)
viewRoutes.use(capatazViewRoutes)
viewRoutes.use(supervisorViewRoutes)
viewRoutes.use(gerenteViewRoutes)

export default viewRoutes
