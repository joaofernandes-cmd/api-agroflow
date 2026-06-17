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
import {
  tarefasCapataz,
  tarefasCapatazRecentes,
  tarefasRevisao,
  removerTarefaRevisao,
  buscarTarefaCapataz,
} from './data/tarefas-capataz'
import { ticketsPendentes, ticketsDadosMap, removerTicketPendente } from './data/tickets'
import {
  movimentacoesPendentes,
  movimentacoesDadosMap,
  removerMovimentacaoPendente,
} from './data/movimentacoes'
import { relatorioDemo } from './data/relatorio-demo'
import { OPCOES_RETIRO, RETIROS, CAPATAZES } from './data/referencia'
import { UsuarioController } from './controllers/usuario.controller'

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))

// Habilita leitura de JSON em todas as requests.
app.use(express.json())

// Disponibiliza a config PÚBLICA do Supabase para as views (upload de evidências
// do capataz). A anon key é uma chave pública por design do Supabase. Definida
// via .env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_BUCKET, SUPABASE_FOLDER.
app.use((_req, res, next) => {
  res.locals.supabase = {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    bucket: process.env.SUPABASE_BUCKET || '',
    folder: process.env.SUPABASE_FOLDER || '',
  }
  next()
})

// Arquivos estáticos (CSS, imagens, etc.)
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

app.get('/capataz/acesso/:token', UsuarioController.autenticarCapatazPorToken)

app.use('/capataz', autenticarViewPorCookie, exigirCargoView('capataz'))

app.get('/capataz/home', (_req, res) => {
  res.render('capataz/home', { tarefas: tarefasCapataz.filter((t) => t.status === 'pendente') })
})

app.get('/capataz/tarefas', (_req, res) => {
  res.render('capataz/tarefas', { tarefas: tarefasCapatazRecentes })
})

app.get('/capataz/detalhe-tarefa', (req, res) => {
  res.render('capataz/detalhe-tarefa', { tarefa: buscarTarefaCapataz(req.query.id) })
})

app.get('/capataz/movimentacao', (_req, res) => {
  res.render('capataz/movimentacao')
})

app.get('/capataz/ticket', (_req, res) => {
  res.render('capataz/ticket')
})

app.use('/supervisor', autenticarViewPorCookie, exigirCargoView('supervisor'))

app.get('/supervisor/home', (req, res) => {
  res.render('supervisor/home', {
    title: 'Início',
    css: 'supervisor',
    usuario: { nome: 'Luiz Felipe' }, // substituir pelo usuário da sessão
    // Contadores derivados das MESMAS fontes das telas de lista, para os
    // blocos de "Acesso rápido" baterem com cada página.
    contadores: {
      tarefas: tarefasRevisao.length,
      tickets: ticketsPendentes.length,
      movimentacoes: movimentacoesPendentes.length,
    },
  });
});

app.get('/supervisor/delegar', (req, res) => {
  res.render('supervisor/delegar', {
    title: 'Delegar tarefa',
    css: 'supervisor',
    usuario: { nome: 'Luiz Felipe' },
    // Selects vêm da fonte única de referência: todos os capatazes e todos
    // os retiros da fazenda (o supervisor escolhe um de cada).
    capatazes: CAPATAZES,
    retiros: RETIROS,
    // "Tarefas ativas" = tarefas já delegadas que o capataz ainda não realizou
    // (status 'pendente'). Mesma fonte da home do capataz, para baterem.
    tarefasAtivas: tarefasCapataz.filter((t) => t.status === 'pendente'),
  });
});

// Preview read-only de uma tarefa delegada (com a descrição e tudo que o
// supervisor preencheu ao criar). Acessada ao clicar numa tarefa da home.
app.get('/supervisor/tarefa', (req, res) => {
  res.render('supervisor/tarefa', {
    title: 'Tarefa delegada',
    css: 'supervisor',
    usuario: { nome: 'Luiz Felipe' },
    tarefa: buscarTarefaCapataz(req.query.id)
  });
});

app.get('/supervisor/revisao', (req, res) => {
  res.render('supervisor/revisao', {
    title: 'Revisão de Tarefas',
    css: 'supervisor',
    usuario: { nome: 'Luiz Felipe' },
    // Tarefas delegadas que o capataz ainda NÃO realizou (status 'pendente').
    // Aparecem como "Não realizado" e ainda não podem ser validadas.
    tarefasNaoRealizadas: tarefasCapataz.filter((t) => t.status === 'pendente'),
    // Tarefas que o capataz concluiu e aguardam validação (status 'concluida').
    tarefas: tarefasRevisao
  });
});

app.get('/supervisor/tickets', (req, res) => {
  res.render('supervisor/tickets', {
    title: 'Tickets de infraestrutura',
    css: 'supervisor',
    usuario: { nome: 'Luiz Felipe' },
    tickets: ticketsPendentes,
    ticketsDados: ticketsDadosMap
  });
});

// Movimentações do rebanho que o capataz registrou e o supervisor valida.
app.get('/supervisor/movimentacoes', (req, res) => {
  res.render('supervisor/movimentacoes', {
    title: 'Movimentações',
    css: 'supervisor',
    usuario: { nome: 'Luiz Felipe' },
    movimentacoes: movimentacoesPendentes,
    movimentacoesDados: movimentacoesDadosMap
  });
});

// Validação (demo): ao validar na tela, removemos o item das listas em memória
// — fonte única do badge de cada tela e do contador da home —, para a contagem
// continuar correta depois de recarregar. Devolve o total de pendentes restante.
app.post('/supervisor/tarefas/:id/validar', (req, res) => {
  const ok = removerTarefaRevisao(Number(req.params.id))
  return res.status(ok ? 200 : 404).json({ ok, pendentes: tarefasRevisao.length })
})

app.post('/supervisor/tickets/:id/validar', (req, res) => {
  const ok = removerTicketPendente(String(req.params.id))
  return res.status(ok ? 200 : 404).json({ ok, pendentes: ticketsPendentes.length })
})

app.post('/supervisor/movimentacoes/:id/validar', (req, res) => {
  const ok = removerMovimentacaoPendente(String(req.params.id))
  return res.status(ok ? 200 : 404).json({ ok, pendentes: movimentacoesPendentes.length })
})

// Supervisor acessa relatórios
app.get('/supervisor/relatorios', (req, res) => {
  res.render('partials/relatorios', {
    title: 'Relatórios',
    css: ['supervisor', 'relatorios'],
    persona: 'supervisor',
    usuario: { nome: 'Luiz Felipe' },
    retiros: OPCOES_RETIRO,
    relatorioDemo
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
    usuario: { nome: 'Marcos Ferreira' },
    retiros: OPCOES_RETIRO,
    relatorioDemo
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
