import express from 'express'
import path from 'path'
import evidenciaRoutes from './routes/evidencia.route'
import movimentacaoRoutes from './routes/movimentacao.route'
import relatorioRoutes from './routes/relatorio.route'
import sincronizacaoRoutes from './routes/sincronizacao.route'
import tarefaRoutes from './routes/tarefa.route'
import ticketRoutes from './routes/ticket.route'
import usuarioRoutes from './routes/usuario.route'
import validacaoRoutes from './routes/validacao.route'
import viewRoutes from './routes/view.route'
import { tratadorDeErros, ErroDeAplicacao } from './middlewares/erros.middleware'
import { middlewareDeLog } from './middlewares/log.middleware'

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))

app.use(express.json())

app.use((_req, res, next) => {
  res.locals.supabase = {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    bucket: process.env.SUPABASE_BUCKET || '',
    folder: process.env.SUPABASE_FOLDER || '',
  }
  next()
})

app.use('/css', express.static(path.join(__dirname, '../views/css')))
app.use('/js', express.static(path.join(__dirname, '../views/js')))
app.use('/assets', express.static(path.join(__dirname, '../../assets')))

app.get('/manifest-capataz.json', (_req, res) => {
  res.type('application/manifest+json')
  res.sendFile(path.join(__dirname, 'public/manifest-capataz.json'))
})

app.get('/sw-capataz.js', (_req, res) => {
  res.type('application/javascript')
  res.sendFile(path.join(__dirname, 'public/sw-capataz.js'))
})

app.get('/capataz-pwa.js', (_req, res) => {
  res.type('application/javascript')
  res.sendFile(path.join(__dirname, 'public/capataz-pwa.js'))
})

app.use('/docs', express.static(path.join(__dirname, 'public/docs')))
app.use(middlewareDeLog)

app.get('/health', (_req, res) => {
  return res.status(200).json({ status: 'ok' })
})

app.use(viewRoutes)

app.use('/evidencias', evidenciaRoutes)
app.use('/movimentacoes', movimentacaoRoutes)
app.use('/relatorios', relatorioRoutes)
app.use('/sincronizacao', sincronizacaoRoutes)
app.use('/tarefas', tarefaRoutes)
app.use('/tickets', ticketRoutes)
app.use('/usuarios', usuarioRoutes)
app.use('/validacoes', validacaoRoutes)

app.use((_req, _res, next) => {
  next(new ErroDeAplicacao('Rota não encontrada', 404))
})

app.use(tratadorDeErros)

export default app
