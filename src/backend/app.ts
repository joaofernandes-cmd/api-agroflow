import express from 'express'
import dashboardRoutes from './routes/dashboard.routes'
import movimentacaoRoutes from './routes/movimentacao.routes'
import relatorioRoutes from './routes/relatorio.routes'

const app = express()

app.use(express.json())

app.get('/health', (_req, res) => {
  return res.status(200).json({ status: 'ok' })
})

app.use('/movimentacoes', movimentacaoRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/relatorios', relatorioRoutes)

export default app
