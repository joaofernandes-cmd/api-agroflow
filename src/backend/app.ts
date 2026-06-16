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
import { autenticarViewPorCookie } from './middlewares/autenticacao.middleware'
import { exigirCargoView } from './middlewares/cargo.middleware'
import { tarefasCapataz, buscarTarefaCapataz } from './data/tarefas-capataz'

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))

// Habilita leitura de JSON em todas as requests.
app.use(express.json())

// Arquivos estáticos (CSS, imagens, etc.)
app.use('/css', express.static(path.join(__dirname, '../views/css')))
app.use('/assets', express.static(path.join(__dirname, '../../assets')))

// Documentação navegável da WebAPI disponível em /docs
app.use('/docs', express.static(path.join(__dirname, 'public/docs')))

// Registra logs de cada request depois que a resposta termina.
app.use(middlewareDeLog)

// Endpoint simples de saude da aplicacao.
app.get('/health', (_req, res) => {
  return res.status(200).json({ status: 'ok' })
})

app.get('/', (_req, res) => {
  res.redirect('/auth/perfil')
})

app.get('/auth/perfil', (_req, res) => {
  res.render('auth/perfil')
})

app.get('/auth/login', (req, res) => {
  const role = req.query.role === 'gerente' ? 'Gerente' : 'Supervisor';
  res.render('auth/login', {
    title: `${role} — Login`,
    css: 'auth',
    persona: role
  });
});

app.get('/capataz', (_req, res) => {
  res.render('capataz/index')
})

app.get('/capataz/home', (_req, res) => {
  res.render('capataz/home', { tarefas: tarefasCapataz.slice(0, 2) })
})

app.get('/capataz/tarefas', (_req, res) => {
  res.render('capataz/tarefas', { tarefas: tarefasCapataz })
})

app.get('/capataz/detalhe-tarefa', (req, res) => {
  res.render('capataz/detalhe-tarefa', { tarefa: buscarTarefaCapataz(req.query.id) })
})

app.get('/capataz/movimentacao', (_req, res) => {
  res.render('capataz/movimentacao')
})

app.get('/capataz/chamado', (_req, res) => {
  res.render('capataz/chamado')
})

app.use('/supervisor', autenticarViewPorCookie, exigirCargoView('supervisor'))

app.get('/supervisor/home', (req, res) => {
  res.render('supervisor/home', {
    title: 'Início',
    css: 'supervisor',
    usuario: { nome: 'Luiz Felipe' } // substituir pelo usuário da sessão
  });
});

app.get('/supervisor/delegar', (req, res) => {
  res.render('supervisor/delegar', {
    title: 'Delegar tarefa',
    css: 'supervisor',
    usuario: { nome: 'Luiz Felipe' }
  });
});

app.get('/supervisor/revisao', (req, res) => {
  res.render('supervisor/revisao', {
    title: 'Revisão de Tarefas',
    css: 'supervisor',
    usuario: { nome: 'Luiz Felipe' }
  });
});

app.get('/supervisor/tickets', (req, res) => {
  res.render('supervisor/tickets', {
    title: 'Tickets de infraestrutura',
    css: 'supervisor',
    usuario: { nome: 'Luiz Felipe' }
  });
});

// Supervisor acessa relatórios
app.get('/supervisor/relatorios', (req, res) => {
  res.render('partials/relatorios', {
    title: 'Relatórios',
    css: ['supervisor', 'relatorios'],
    persona: 'supervisor',
    usuario: { nome: 'Luiz Felipe' }
  })
})

app.use('/gerente', autenticarViewPorCookie, exigirCargoView('gerente'))

app.get('/gerente/home', (req, res) => {
  res.render('gerente/home', {
    title: 'Início',
    css: 'gerente',
    usuario: { nome: 'Marcos Ferreira' }
  });
});

// Gerente acessa os mesmos relatórios - mesma view
app.get('/gerente/relatorios', (req, res) => {
  res.render('partials/relatorios', {
    title: 'Relatórios',
    css: ['gerente', 'relatorios'],
    persona: 'gerente',
    usuario: { nome: 'Marcos Ferreira' }
  });
});

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
