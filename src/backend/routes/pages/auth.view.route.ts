import { Router } from 'express'

const authViewRoutes = Router()

authViewRoutes.get('/', (_req, res) => {
  res.redirect('/auth/perfil')
})

authViewRoutes.get('/auth/perfil', (_req, res) => {
  res.render('auth/perfil')
})

authViewRoutes.get('/auth/login', (req, res) => {
  const role = req.query.role === 'gerente' ? 'Gerente' : 'Supervisor'

  res.render('auth/login', {
    title: `${role} — Login`,
    css: 'auth',
    persona: role,
  })
})

export default authViewRoutes
