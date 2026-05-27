import { Request, Response } from 'express'
import { TarefaService } from '../services/tarefa.service'
import { TarefaPrioridade, TarefaStatus } from '../models/tarefa.model'
import { Usuario } from '../models/usuario.model'

function queryString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

export const TarefaController = {
  async criar(req: Request, res: Response) {
    try {
      const { retiro_id, atribuida_a, descricao, categoria, prioridade, usuarioCriador } = req.body

      if (!retiro_id || !atribuida_a || !descricao || !categoria || !prioridade || !usuarioCriador) {
        return res.status(400).json({ error: 'Campos obrigatorios nao informados' })
      }

      const tarefa = await TarefaService.criar(
        {
          retiro_id,
          atribuida_a,
          descricao,
          categoria,
          prioridade,
        },
        usuarioCriador as Usuario
      )

      return res.status(201).json(tarefa)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao criar tarefa',
      })
    }
  },

  async listarTodas(req: Request, res: Response) {
    try {
      const tarefas = await TarefaService.listarTodas()
      return res.status(200).json(tarefas)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tarefas' })
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = String(req.params.id)
      const tarefa = await TarefaService.buscarPorId(id)

      if (!tarefa) {
        return res.status(404).json({ error: 'Tarefa nao encontrada' })
      }

      return res.status(200).json(tarefa)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar tarefa' })
    }
  },

  async buscarParaDashboard(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const tarefas = await TarefaService.buscarParaDashboard(retiroId)

      return res.status(200).json(tarefas)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar tarefas para dashboard' })
    }
  },

  async listarPorStatus(req: Request, res: Response) {
    try {
      const status = String(req.params.status) as TarefaStatus
      const retiroId = queryString(req.query.retiroId)
      const tarefas = await TarefaService.listarPorStatus(status, retiroId)

      return res.status(200).json(tarefas)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tarefas por status' })
    }
  },

  async listarPorUsuario(req: Request, res: Response) {
    try {
      const usuarioId = String(req.params.usuarioId)
      const tarefas = await TarefaService.listarPorUsuario(usuarioId)

      return res.status(200).json(tarefas)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tarefas por usuario' })
    }
  },

  async listarPorPrioridade(req: Request, res: Response) {
    try {
      const prioridade = String(req.params.prioridade) as TarefaPrioridade
      const retiroId = queryString(req.query.retiroId)
      const tarefas = await TarefaService.listarPorPrioridade(prioridade, retiroId)

      return res.status(200).json(tarefas)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tarefas por prioridade' })
    }
  },

  async listarPorCategoria(req: Request, res: Response) {
    try {
      const categoria = String(req.params.categoria)
      const retiroId = queryString(req.query.retiroId)
      const tarefas = await TarefaService.listarPorCategoria(categoria, retiroId)

      return res.status(200).json(tarefas)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tarefas por categoria' })
    }
  },

  async atualizarStatus(req: Request, res: Response) {
    try {
      const id = String(req.params.id)
      const { status } = req.body

      if (!status) {
        return res.status(400).json({ error: 'Status e obrigatorio' })
      }

      const tarefa = await TarefaService.atualizarStatus(id, status)

      if (!tarefa) {
        return res.status(404).json({ error: 'Tarefa nao encontrada' })
      }

      return res.status(200).json(tarefa)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar status da tarefa' })
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = String(req.params.id)
      const tarefa = await TarefaService.atualizar(id, req.body)

      if (!tarefa) {
        return res.status(404).json({ error: 'Tarefa nao encontrada' })
      }

      return res.status(200).json(tarefa)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao atualizar tarefa',
      })
    }
  },

  async contarPorStatus(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const contagem = await TarefaService.contarPorStatus(retiroId)

      return res.status(200).json(contagem)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao contar tarefas por status' })
    }
  },

  async remover(req: Request, res: Response) {
    try {
      const id = String(req.params.id)
      const tarefa = await TarefaService.buscarPorId(id)

      if (!tarefa) {
        return res.status(404).json({ error: 'Tarefa nao encontrada' })
      }

      await TarefaService.remover(id)

      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover tarefa' })
    }
  },
}
