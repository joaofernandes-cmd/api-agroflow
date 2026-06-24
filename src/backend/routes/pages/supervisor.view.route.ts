import { Router } from 'express'
import { OPCOES_RETIRO } from '../../data/referencia'
import { autenticarViewPorCookie } from '../../middlewares/autenticacao.middleware'
import { exigirCargoView } from '../../middlewares/cargo.middleware'
import { MovimentacaoService } from '../../services/movimentacao.service'
import { TarefaService } from '../../services/tarefa.service'
import { TicketService } from '../../services/ticket.service'
import { UsuarioService } from '../../services/usuario.service'
import {
  carregarContexto,
  limparPrefixoCargo,
  nomeRetiro,
  tarefaParaExibicao,
  ticketParaExibicao,
} from '../../utils/apresentacao'
import { carregarRelatorio, movimentacaoParaExibicaoComEvidencia } from './view-data'

const supervisorViewRoutes = Router()

supervisorViewRoutes.use('/supervisor', autenticarViewPorCookie, exigirCargoView('supervisor'))

supervisorViewRoutes.get('/supervisor/home', async (req, res) => {
  const ctx = await carregarContexto(req)
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
  })
})

supervisorViewRoutes.get('/supervisor/delegar', async (req, res) => {
  const ctx = await carregarContexto(req)
  const retiros = await UsuarioService.retirosDoSupervisor(req.usuario!)
  const usuariosRetiro = await UsuarioService.listarPorRetiros(retiros)
  const capatazes = usuariosRetiro
    .filter((u) => u.cargo === 'capataz' && u.status === 'ativo')
    .map((u) => ({ id: u.id, nome: limparPrefixoCargo(u.nome), retiro: nomeRetiro(ctx, u.retiro_id) }))
    .sort((a, b) => a.retiro.localeCompare(b.retiro, 'pt-BR'))
  const pendentes = await TarefaService.listarPorStatus('pendente', retiros)

  res.render('supervisor/delegar', {
    title: 'Delegar tarefa',
    css: 'supervisor',
    usuario: { nome: ctx.nomeUsuario },
    capatazes,
    tarefasAtivas: pendentes.map((t) => tarefaParaExibicao(t, ctx)),
  })
})

supervisorViewRoutes.get('/supervisor/tarefa', async (req, res) => {
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
  })
})

supervisorViewRoutes.get('/supervisor/revisao', async (req, res) => {
  const ctx = await carregarContexto(req)
  const retiros = await UsuarioService.retirosDoSupervisor(req.usuario!)
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
  })
})

supervisorViewRoutes.get('/supervisor/tickets', async (req, res) => {
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
    tickets: pendentes.map((t) => ticketParaExibicao(t, ctx)),
    ticketsValidados: aprovados.map((t) => ticketParaExibicao(t, ctx)),
  })
})

supervisorViewRoutes.get('/supervisor/movimentacoes', async (req, res) => {
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
    movimentacoes: await Promise.all(pendentes.map((m) => movimentacaoParaExibicaoComEvidencia(m, ctx))),
    movimentacoesValidadas: await Promise.all(validadas.map((m) => movimentacaoParaExibicaoComEvidencia(m, ctx))),
  })
})

supervisorViewRoutes.get('/supervisor/relatorios', async (req, res) => {
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

export default supervisorViewRoutes
