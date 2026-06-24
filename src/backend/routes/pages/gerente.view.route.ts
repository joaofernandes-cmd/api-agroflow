import { Router } from 'express'
import { OPCOES_RETIRO } from '../../data/referencia'
import { autenticarViewPorCookie } from '../../middlewares/autenticacao.middleware'
import { exigirCargoView } from '../../middlewares/cargo.middleware'
import { MovimentacaoService } from '../../services/movimentacao.service'
import { TarefaService } from '../../services/tarefa.service'
import { TicketService } from '../../services/ticket.service'
import {
  carregarContexto,
  movimentacaoParaExibicao,
  tarefaParaExibicao,
  ticketParaExibicao,
} from '../../utils/apresentacao'
import { carregarRelatorio } from './view-data'

const gerenteViewRoutes = Router()

gerenteViewRoutes.use('/gerente', autenticarViewPorCookie, exigirCargoView('gerente'))

gerenteViewRoutes.get('/gerente/home', async (req, res) => {
  const ctx = await carregarContexto(req)
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
  const concluidas = tarefasConcl.map((t) => tarefaParaExibicao(t, ctx))
  const recentes = [
    ...ticketsAprov.map((t) => {
      const e = ticketParaExibicao(t, ctx)
      return {
        nome: `${e.nome} — ${e.retiro}`,
        tag: 'Ticket',
        tagClasse: 'ticket',
        meta: `Capataz ${e.capataz} • ${e.quando}`,
        ts: new Date(t.data_realizado ?? t.data_criacao).getTime(),
      }
    }),
    ...tarefasAprov.map((t) => {
      const e = tarefaParaExibicao(t, ctx)
      return {
        nome: `${e.titulo} — ${e.retiro}`,
        tag: 'Tarefa',
        tagClasse: 'tarefa',
        meta: `Capataz ${e.capataz} • ${e.enviado}`,
        ts: new Date(t.data_criacao).getTime(),
      }
    }),
    ...movValid.map((m) => {
      const e = movimentacaoParaExibicao(m, ctx)
      return {
        nome: `${e.tipo} — ${e.local}`,
        tag: 'Operação em campo',
        tagClasse: 'operacao',
        meta: `Capataz ${e.capataz} • ${e.enviado}`,
        ts: new Date(m.data_validacao ?? m.data_criacao).getTime(),
      }
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
  })
})

gerenteViewRoutes.get('/gerente/relatorios', async (req, res) => {
  const { ctx, relatorio } = await carregarRelatorio(req)

  res.render('partials/relatorios', {
    title: 'Relatórios',
    css: ['gerente', 'relatorios'],
    persona: 'gerente',
    usuario: { nome: ctx.nomeUsuario },
    retiros: OPCOES_RETIRO,
    relatorioDemo: relatorio,
  })
})

export default gerenteViewRoutes
