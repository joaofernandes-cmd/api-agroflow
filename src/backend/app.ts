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
import { tratadorDeErros, ErroDeAplicacao } from './middlewares/erros.middleware'
import { middlewareDeLog } from './middlewares/log.middleware'

const app = express()

// Habilita leitura de JSON em todas as requests.
app.use(express.json())

// Documentação navegável da WebAPI disponível em /docs
app.use('/docs', express.static(path.join(__dirname, 'public/docs')))

// Registra logs de cada request depois que a resposta termina.
app.use(middlewareDeLog)

// Endpoint simples de saude da aplicacao.
app.get('/health', (_req, res) => {
  return res.status(200).json({ status: 'ok' })
})

app.use('/evidencias', evidenciaRoutes)
app.use('/movimentacoes', movimentacaoRoutes)
app.use('/relatorios', relatorioRoutes)
app.use('/sincronizacao', sincronizacaoRoutes)
app.use('/tarefas', tarefaRoutes)
app.use('/tickets', ticketRoutes)
app.use('/usuarios', usuarioRoutes)
app.use('/validacoes', validacaoRoutes)

// Se nenhuma rota bateu, geramos um erro 404 padronizado.
app.use((_req, _res, next) => {
  next(new ErroDeAplicacao('Rota nao encontrada', 404))
})

// Handler global de erro.
app.use(tratadorDeErros)

export default app
