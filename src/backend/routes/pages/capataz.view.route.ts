import { Router } from 'express'
import { UsuarioController } from '../../controllers/usuario.controller'
import { autenticarViewPorCookie } from '../../middlewares/autenticacao.middleware'
import { exigirCargoView } from '../../middlewares/cargo.middleware'
import { TarefaService } from '../../services/tarefa.service'
import { carregarContexto, tarefaParaExibicao } from '../../utils/apresentacao'

const capatazViewRoutes = Router()

capatazViewRoutes.get('/capataz', (_req, res) => {
  res.render('capataz/index')
})

capatazViewRoutes.get('/capataz/acesso/:token', UsuarioController.autenticarCapatazPorToken)

capatazViewRoutes.get('/capataz/acesso-invalido', (_req, res) => {
  res.render('capataz/acesso-invalido')
})

capatazViewRoutes.use('/capataz', autenticarViewPorCookie, exigirCargoView('capataz'))

capatazViewRoutes.get('/capataz/home', async (req, res) => {
  const ctx = await carregarContexto(req)
  res.render('capataz/home', { usuario: { nome: ctx.nomeUsuario } })
})

capatazViewRoutes.get('/capataz/tarefas', async (req, res) => {
  const ctx = await carregarContexto(req)
  const tarefas = await TarefaService.listarPorUsuario(req.usuario!.id)
  const ordenadas = tarefas
    .slice()
    .sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime())

  res.render('capataz/tarefas', { tarefas: ordenadas.map((t) => tarefaParaExibicao(t, ctx)) })
})

capatazViewRoutes.get('/capataz/detalhe-tarefa', async (req, res) => {
  const id = typeof req.query.id === 'string' ? req.query.id : ''
  const tarefa = id ? await TarefaService.buscarPorId(id) : null

  if (!tarefa || tarefa.atribuida_a !== req.usuario!.id) {
    return res.redirect('/capataz/tarefas')
  }

  const ctx = await carregarContexto(req)
  res.render('capataz/detalhe-tarefa', {
    tarefa: tarefaParaExibicao(tarefa, ctx),
    capatazId: req.usuario!.id,
  })
})

capatazViewRoutes.get('/capataz/movimentacao', (_req, res) => {
  res.render('capataz/movimentacao')
})

capatazViewRoutes.get('/capataz/ticket', (_req, res) => {
  res.render('capataz/ticket')
})

export default capatazViewRoutes
