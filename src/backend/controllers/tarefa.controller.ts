import { Request, Response } from 'express'
import { TarefaService } from '../services/tarefa.service'
import { TarefaPrioridade, TarefaStatus } from '../models/tarefa.model'
import { Usuario } from '../models/usuario.model'

function extrairTexto(valor: unknown): string | undefined {
  return typeof valor === 'string' ? valor : undefined
}

function converterNumero(valor: unknown): number | null {
  const numero = Number(valor)
  return Number.isNaN(numero) ? null : numero
}

export const TarefaController = {
  async criar(req: Request, res: Response) {
    try {
      const { retiro_id, atribuida_a, descricao, categoria, prioridade, usuarioCriador } = req.body

      if (!retiro_id || !atribuida_a || !descricao || !categoria || !prioridade || !usuarioCriador) {
        return res.status(400).json({ error: 'Campos obrigatorios nao informados' })
      }

      const retiroId = converterNumero(retiro_id)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const tarefa = await TarefaService.criar(
        {
          retiro_id: retiroId,
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
      const id = converterNumero(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

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
      const retiroId = extrairTexto(req.query.retiroId)
      const retiroIdNumerico = retiroId ? converterNumero(retiroId) : undefined

      if (retiroIdNumerico === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const tarefas = await TarefaService.buscarParaDashboard(retiroIdNumerico)

      return res.status(200).json(tarefas)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar tarefas para dashboard' })
    }
  },

  async listarPorStatus(req: Request, res: Response) {
    try {
      const status = String(req.params.status) as TarefaStatus
      const retiroId = extrairTexto(req.query.retiroId)
      const retiroIdNumerico = retiroId ? converterNumero(retiroId) : undefined

      if (retiroIdNumerico === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const tarefas = await TarefaService.listarPorStatus(status, retiroIdNumerico)

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
      const retiroId = extrairTexto(req.query.retiroId)
      const retiroIdNumerico = retiroId ? converterNumero(retiroId) : undefined

      if (retiroIdNumerico === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const tarefas = await TarefaService.listarPorPrioridade(prioridade, retiroIdNumerico)

      return res.status(200).json(tarefas)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tarefas por prioridade' })
    }
  },

  async listarPorCategoria(req: Request, res: Response) {
    try {
      const categoria = String(req.params.categoria)
      const retiroId = extrairTexto(req.query.retiroId)
      const retiroIdNumerico = retiroId ? converterNumero(retiroId) : undefined

      if (retiroIdNumerico === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const tarefas = await TarefaService.listarPorCategoria(categoria, retiroIdNumerico)

      return res.status(200).json(tarefas)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tarefas por categoria' })
    }
  },

  async atualizarStatus(req: Request, res: Response) {
    try {
      const id = converterNumero(req.params.id)
      const { status } = req.body

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

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
      const id = converterNumero(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

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
      const retiroId = extrairTexto(req.query.retiroId)
      const retiroIdNumerico = retiroId ? converterNumero(retiroId) : undefined

      if (retiroIdNumerico === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const contagem = await TarefaService.contarPorStatus(retiroIdNumerico)

      return res.status(200).json(contagem)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao contar tarefas por status' })
    }
  },

  async remover(req: Request, res: Response) {
    try {
      const id = converterNumero(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

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
