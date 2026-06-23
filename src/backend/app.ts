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
import { OPCOES_RETIRO } from './data/referencia'
import { UsuarioController } from './controllers/usuario.controller'
import { TicketService } from './services/ticket.service'
import { MovimentacaoService } from './services/movimentacao.service'
import { TarefaService } from './services/tarefa.service'
import { UsuarioService } from './services/usuario.service'
import { EvidenciaService } from './services/evidencia.service'
import {
  carregarContexto,
  nomeRetiro,
  ticketParaExibicao,
  movimentacaoParaExibicao,
  tarefaParaExibicao,
  montarRelatorio,
  limparPrefixoCargo,
} from './utils/apresentacao'
import { UUID } from './models/uuid'
import { Movimentacao } from './models/movimentacao.model'

async function movimentacaoParaExibicaoComEvidencia(movimentacao: Movimentacao, ctx: Awaited<ReturnType<typeof carregarContexto>>) {
  const exibicao = movimentacaoParaExibicao(movimentacao, ctx)
  const evidencias = await EvidenciaService.buscarPorMovimentacao(movimentacao.id)
  const evidencia = evidencias[0]

  if (!evidencia) {
    return exibicao
  }

  const rotulos = {
    mensagem: 'Texto',
    foto: 'Foto',
    audio: 'Áudio',
  } as const

  exibicao.evidencia = rotulos[evidencia.tipo] ?? ''
  exibicao.evidenciaTexto = evidencia.conteudo ?? ''
  exibicao.evidenciaUrl = evidencia.url_arquivo ?? ''

  return exibicao
}

// Monta os datasets do relatório a partir dos registros já validados/aprovados
// do banco. retiroId = retiro do supervisor; undefined = todos (gerente).
async function carregarRelatorio(req: express.Request, retiroId?: UUID | UUID[]) {
  const ctx = await carregarContexto(req)
  const [tickets, tarefas, movimentacoes] = await Promise.all([
    TicketService.listarPorStatus('aprovado', retiroId),
    TarefaService.listarPorStatus('aprovado', retiroId),
    MovimentacaoService.buscarParaRelatorio(retiroId),
  ])
  return { ctx, relatorio: montarRelatorio(ctx, tickets, tarefas, movimentacoes) }
}

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

app.get('/capataz/home', async (req, res) => {
  const ctx = await carregarContexto(req)
  res.render('capataz/home', { usuario: { nome: ctx.nomeUsuario } })
})

app.get('/capataz/tarefas', async (req, res) => {
  const ctx = await carregarContexto(req)
  // Tarefas atribuídas a ESTE capataz (do banco). A delegação do supervisor
  // grava com atribuida_a = id do capataz, então aparece aqui.
  const tarefas = await TarefaService.listarPorUsuario(req.usuario!.id)
  const ordenadas = tarefas
    .slice()
    .sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime())
  res.render('capataz/tarefas', { tarefas: ordenadas.map((t) => tarefaParaExibicao(t, ctx)) })
})

app.get('/capataz/detalhe-tarefa', async (req, res) => {
  const id = typeof req.query.id === 'string' ? req.query.id : ''
  const tarefa = id ? await TarefaService.buscarPorId(id) : null
  // Capataz só acessa a própria tarefa.
  if (!tarefa || tarefa.atribuida_a !== req.usuario!.id) {
    return res.redirect('/capataz/tarefas')
  }
  const ctx = await carregarContexto(req)
  res.render('capataz/detalhe-tarefa', {
    tarefa: tarefaParaExibicao(tarefa, ctx),
    // Id real do capataz logado (cookie). Usado só para nomear a pasta do upload
    // de evidências no Supabase — o vínculo no banco usa req.usuario (servidor).
    capatazId: req.usuario!.id,
  })
})

app.get('/capataz/movimentacao', (_req, res) => {
  res.render('capataz/movimentacao')
})

app.get('/capataz/ticket', (_req, res) => {
  res.render('capataz/ticket')
})

app.use('/supervisor', autenticarViewPorCookie, exigirCargoView('supervisor'))

app.get('/supervisor/home', async (req, res) => {
  const ctx = await carregarContexto(req)
  // Contadores reais do BANCO, filtrados pelos retiros que o supervisor cobre —
  // batem com o que cada tela de lista mostra (tarefas a validar, tickets/
  // movimentações pendentes).
  const retiros = await UsuarioService.retirosDoSupervisor(req.usuario!)
  const [aValidar, ticketsPend, movPend] = await Promise.all([
    TarefaService.listarPorStatus('concluido', retiros),
    TicketService.listarPorStatus('pendente', retiros),
    MovimentacaoService.listarPendentes(retiros),
  ])

  res.render('supervisor/home', {
    title: 'Início',
    css: 'supervisor',
    usuario: { nome: ctx.nomeUsuario },
    contadores: {
      tarefas: aValidar.length,
      tickets: ticketsPend.length,
      movimentacoes: movPend.length,
    },
  });
});

app.get('/supervisor/delegar', async (req, res) => {
  const ctx = await carregarContexto(req)
  // Um supervisor pode cobrir 1 ou vários retiros; pega todos os que ele cobre.
  const retiros = await UsuarioService.retirosDoSupervisor(req.usuario!)
  // Capatazes REAIS dos retiros do supervisor (value = UUID), para a delegação
  // gravar direto em atribuida_a e a tarefa chegar ao capataz certo. Cada um é
  // rotulado com o SEU retiro, formando o par "Retiro — Capataz".
  const usuariosRetiro = await UsuarioService.listarPorRetiros(retiros)
  const capatazes = usuariosRetiro
    .filter((u) => u.cargo === 'capataz' && u.status === 'ativo')
    .map((u) => ({ id: u.id, nome: limparPrefixoCargo(u.nome), retiro: nomeRetiro(ctx, u.retiro_id) }))
    .sort((a, b) => a.retiro.localeCompare(b.retiro, 'pt-BR'))
  // "Tarefas ativas" = tarefas já delegadas ainda pendentes (do banco), em
  // qualquer retiro coberto pelo supervisor.
  const pendentes = await TarefaService.listarPorStatus('pendente', retiros)

  res.render('supervisor/delegar', {
    title: 'Delegar tarefa',
    css: 'supervisor',
    usuario: { nome: ctx.nomeUsuario },
    capatazes,
    tarefasAtivas: pendentes.map((t) => tarefaParaExibicao(t, ctx)),
  });
});

// Preview read-only de uma tarefa delegada. Acessada ao clicar numa tarefa.
app.get('/supervisor/tarefa', async (req, res) => {
  const id = typeof req.query.id === 'string' ? req.query.id : ''
  const tarefa = id ? await TarefaService.buscarPorId(id) : null
  if (!tarefa) {
    return res.redirect('/supervisor/revisao')
  }
  const ctx = await carregarContexto(req)
  res.render('supervisor/tarefa', {
    title: 'Tarefa delegada',
    css: 'supervisor',
    usuario: { nome: ctx.nomeUsuario },
    tarefa: tarefaParaExibicao(tarefa, ctx),
  });
});

app.get('/supervisor/revisao', async (req, res) => {
  const ctx = await carregarContexto(req)
  const retiros = await UsuarioService.retirosDoSupervisor(req.usuario!)
  // Mesmo fluxo das telas de Tickets/Movimentações: tudo do BANCO (fonte única),
  // server-side. Não realizadas = delegadas que o capataz ainda não fez;
  // Realizadas = concluídas pelo capataz aguardando validação; Validadas = já
  // aprovadas pelo supervisor (entram no relatório).
  const [naoRealizadas, realizadas, validadas] = await Promise.all([
    TarefaService.listarPorStatus('pendente', retiros),
    TarefaService.listarPorStatus('concluido', retiros),
    TarefaService.listarPorStatus('aprovado', retiros),
  ])

  res.render('supervisor/revisao', {
    title: 'Revisão de Tarefas',
    css: 'supervisor',
    usuario: { nome: ctx.nomeUsuario },
    tarefasNaoRealizadas: naoRealizadas.map((t) => tarefaParaExibicao(t, ctx)),
    tarefas: realizadas.map((t) => tarefaParaExibicao(t, ctx)),
    tarefasValidadas: validadas.map((t) => tarefaParaExibicao(t, ctx)),
  });
});

app.get('/supervisor/tickets', async (req, res) => {
  const ctx = await carregarContexto(req)
  const retiros = await UsuarioService.retirosDoSupervisor(req.usuario!)
  const [pendentes, aprovados] = await Promise.all([
    TicketService.listarPorStatus('pendente', retiros),
    TicketService.listarPorStatus('aprovado', retiros),
  ])

  res.render('supervisor/tickets', {
    title: 'Tickets de infraestrutura',
    css: 'supervisor',
    usuario: { nome: ctx.nomeUsuario },
    // Pendentes de validação e já validados — ambos do BANCO (fonte única).
    tickets: pendentes.map((t) => ticketParaExibicao(t, ctx)),
    ticketsValidados: aprovados.map((t) => ticketParaExibicao(t, ctx)),
  });
});

// Movimentações do rebanho que o capataz registrou e o supervisor valida.
app.get('/supervisor/movimentacoes', async (req, res) => {
  const ctx = await carregarContexto(req)
  const retiros = await UsuarioService.retirosDoSupervisor(req.usuario!)
  const [pendentes, validadas] = await Promise.all([
    MovimentacaoService.listarPendentes(retiros),
    MovimentacaoService.filtrar(retiros, undefined, ['validado']),
  ])

  res.render('supervisor/movimentacoes', {
    title: 'Movimentações',
    css: 'supervisor',
    usuario: { nome: ctx.nomeUsuario },
    // Pendentes de validação e já validadas — ambas do BANCO (fonte única).
    movimentacoes: await Promise.all(pendentes.map((m) => movimentacaoParaExibicaoComEvidencia(m, ctx))),
    movimentacoesValidadas: await Promise.all(validadas.map((m) => movimentacaoParaExibicaoComEvidencia(m, ctx))),
  });
});

// Supervisor acessa relatórios (dados reais do retiro, do banco).
app.get('/supervisor/relatorios', async (req, res) => {
  const retiros = await UsuarioService.retirosDoSupervisor(req.usuario!)
  const { ctx, relatorio } = await carregarRelatorio(req, retiros)
  res.render('partials/relatorios', {
    title: 'Relatórios',
    css: ['supervisor', 'relatorios'],
    persona: 'supervisor',
    usuario: { nome: ctx.nomeUsuario },
    retiros: OPCOES_RETIRO,
    relatorioDemo: relatorio,
  })
})

app.use('/gerente', autenticarViewPorCookie, exigirCargoView('gerente'))

app.get('/gerente/home', async (req, res) => {
  const ctx = await carregarContexto(req)
  // Visão da fazenda inteira (sem filtro de retiro), tudo do BANCO.
  const [ticketsPend, ticketsAprov, tarefasPend, tarefasConcl, tarefasAprov, movValid, movPend] =
    await Promise.all([
      TicketService.listarPorStatus('pendente'),
      TicketService.listarPorStatus('aprovado'),
      TarefaService.listarPorStatus('pendente'),
      TarefaService.listarPorStatus('concluido'),
      TarefaService.listarPorStatus('aprovado'),
      MovimentacaoService.buscarParaRelatorio(),
      MovimentacaoService.listarPendentes(),
    ])

  const validados = ticketsAprov.length + tarefasAprov.length + movValid.length
  const pendentes = ticketsPend.length + tarefasPend.length + tarefasConcl.length + movPend.length
  const retirosComDados = new Set(
    [...ticketsAprov, ...tarefasAprov].map((x) => String(x.retiro_id))
      .concat(movValid.map((m) => String(m.retiro_id)))
  )

  // "Concluídas pelo capataz": tarefas que o capataz concluiu e aguardam o
  // supervisor (status 'concluido').
  const concluidas = tarefasConcl.map((t) => tarefaParaExibicao(t, ctx))

  // "Atividades recentes": itens já validados/aprovados, mais recentes no topo.
  const recentes = [
    ...ticketsAprov.map((t) => {
      const e = ticketParaExibicao(t, ctx)
      return { nome: `${e.nome} — ${e.retiro}`, tag: 'Ticket', tagClasse: 'ticket', meta: `Capataz ${e.capataz} • ${e.quando}`, ts: new Date(t.data_realizado ?? t.data_criacao).getTime() }
    }),
    ...tarefasAprov.map((t) => {
      const e = tarefaParaExibicao(t, ctx)
      return { nome: `${e.titulo} — ${e.retiro}`, tag: 'Tarefa', tagClasse: 'tarefa', meta: `Capataz ${e.capataz} • ${e.enviado}`, ts: new Date(t.data_criacao).getTime() }
    }),
    ...movValid.map((m) => {
      const e = movimentacaoParaExibicao(m, ctx)
      return { nome: `${e.tipo} — ${e.local}`, tag: 'Operação em campo', tagClasse: 'operacao', meta: `Capataz ${e.capataz} • ${e.enviado}`, ts: new Date(m.data_validacao ?? m.data_criacao).getTime() }
    }),
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5)

  res.render('gerente/home', {
    title: 'Início',
    css: 'gerente',
    usuario: { nome: ctx.nomeUsuario },
    kpis: {
      tickets: ticketsPend.length,
      tarefas: tarefasPend.length,
      movimentacoes: movValid.length,
    },
    resumo: { validados, pendentes, retiros: retirosComDados.size },
    concluidas,
    recentes,
  });
});

// Gerente acessa os mesmos relatórios - mesma view (todos os retiros).
app.get('/gerente/relatorios', async (req, res) => {
  const { ctx, relatorio } = await carregarRelatorio(req)
  res.render('partials/relatorios', {
    title: 'Relatórios',
    css: ['gerente', 'relatorios'],
    persona: 'gerente',
    usuario: { nome: ctx.nomeUsuario },
    retiros: OPCOES_RETIRO,
    relatorioDemo: relatorio,
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
  next(new ErroDeAplicacao('Rota não encontrada', 404))
})

// Handler global de erro.
app.use(tratadorDeErros)

export default app
