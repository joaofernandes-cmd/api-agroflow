import { Request, Response } from 'express'
import { TarefaService } from '../services/tarefa.service'
import { UsuarioService } from '../services/usuario.service'
import { TarefaPrioridade, TarefaStatus } from '../models/tarefa.model'
import { Usuario } from '../models/usuario.model'
import { converterUUID } from '../models/uuid'
import { mensagemErroCliente } from '../utils/erro-api'
import { converterUuidDeConsulta, extrairTexto, retiroDaConsulta } from '../utils/parametros-controller'

const STATUS_TAREFA_VALIDOS: TarefaStatus[] = ['pendente', 'concluido', 'aprovado']
const PRIORIDADES_TAREFA_VALIDAS: TarefaPrioridade[] = ['alta', 'media', 'baixa']

function capatazNaoEDonoDaTarefa(req: Request, atribuidaA: string): boolean {
  return req.usuario?.cargo === 'capataz' && atribuidaA !== req.usuario.id
}

export const TarefaController = {
  async criar(req: Request, res: Response) {
    try {
      const { id, atribuida_a, descricao, categoria, prioridade } = req.body
      const usuarioCriador = req.usuario?.cargo === 'supervisor' ? req.usuario : req.body.usuarioCriador

      // A tarefa nasce no retiro do CAPATAZ que vai executá-la (atribuida_a).
      // Assim um supervisor que cobre vários retiros delega para qualquer um e a
      // tarefa cai no retiro certo. Fora do fluxo do supervisor (ex.: testes/
      // sincronização) usamos o retiro_id enviado no corpo.
      let retiro_id = req.body.retiro_id
      if (req.usuario?.cargo === 'supervisor') {
        const capataz = atribuida_a ? await UsuarioService.buscarPorId(atribuida_a) : null
        retiro_id = capataz?.retiro_id ?? null
      }

      if (!retiro_id || !atribuida_a || !descricao || !categoria || !prioridade || !usuarioCriador) {
        return res.status(400).json({ error: 'Campos obrigatórios não informados' })
      }

      if (!PRIORIDADES_TAREFA_VALIDAS.includes(prioridade)) {
        return res.status(400).json({ error: 'Prioridade inválida' })
      }

      const retiroId = converterUUID(retiro_id)
      const tarefaId = id === undefined ? undefined : converterUUID(id)

      if (retiroId === null || tarefaId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const tarefa = await TarefaService.criar(
        {
          id: tarefaId,
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
        error: mensagemErroCliente(error, 'Erro ao criar tarefa'),
      })
    }
  },

  async sincronizarRecebida(req: Request, res: Response) {
    try {
      if (req.body.status && !STATUS_TAREFA_VALIDOS.includes(req.body.status)) {
        return res.status(400).json({ error: 'Status inválido' })
      }

      if (req.body.prioridade && !PRIORIDADES_TAREFA_VALIDAS.includes(req.body.prioridade)) {
        return res.status(400).json({ error: 'Prioridade inválida' })
      }

      const tarefa = await TarefaService.sincronizarRecebida(req.body)
      return res.status(201).json(tarefa)
    } catch (error) {
      return res.status(400).json({
        error: mensagemErroCliente(error, 'Erro ao sincronizar tarefa'),
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
      const id = converterUUID(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const tarefa = await TarefaService.buscarPorId(id)

      if (!tarefa) {
        return res.status(404).json({ error: 'Tarefa não encontrada' })
      }

      if (capatazNaoEDonoDaTarefa(req, tarefa.atribuida_a)) {
        return res.status(403).json({ error: 'Acesso negado: tarefa de outro capataz' })
      }

      return res.status(200).json(tarefa)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar tarefa' })
    }
  },

  async buscarParaDashboard(req: Request, res: Response) {
    try {
      const retiroUuid = converterUuidDeConsulta(req)

      if (retiroUuid === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const tarefas = await TarefaService.buscarParaDashboard(retiroUuid)

      return res.status(200).json(tarefas)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar tarefas para dashboard' })
    }
  },

  async listarPorStatus(req: Request, res: Response) {
    try {
      const status = String(req.params.status) as TarefaStatus
      const retiroUuid = converterUuidDeConsulta(req)

      if (retiroUuid === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      if (!STATUS_TAREFA_VALIDOS.includes(status)) {
        return res.status(400).json({ error: 'Status inválido' })
      }

      const tarefas = await TarefaService.listarPorStatus(status, retiroUuid)

      return res.status(200).json(tarefas)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tarefas por status' })
    }
  },

  async listarPorUsuario(req: Request, res: Response) {
    try {
      const usuarioId = String(req.params.usuarioId)

      if (req.usuario?.cargo === 'capataz' && usuarioId !== req.usuario.id) {
        return res.status(403).json({ error: 'Acesso negado: usuário diferente do autenticado' })
      }

      const tarefas = await TarefaService.listarPorUsuario(usuarioId)

      return res.status(200).json(tarefas)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tarefas por usuário' })
    }
  },

  async listarPorPrioridade(req: Request, res: Response) {
    try {
      const prioridade = String(req.params.prioridade) as TarefaPrioridade
      const retiroUuid = converterUuidDeConsulta(req)

      if (retiroUuid === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      if (!PRIORIDADES_TAREFA_VALIDAS.includes(prioridade)) {
        return res.status(400).json({ error: 'Prioridade inválida' })
      }

      const tarefas = await TarefaService.listarPorPrioridade(prioridade, retiroUuid)

      return res.status(200).json(tarefas)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tarefas por prioridade' })
    }
  },

  async listarPorCategoria(req: Request, res: Response) {
    try {
      const categoria = String(req.params.categoria)
      const retiroUuid = converterUuidDeConsulta(req)

      if (retiroUuid === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const tarefas = await TarefaService.listarPorCategoria(categoria, retiroUuid)

      return res.status(200).json(tarefas)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tarefas por categoria' })
    }
  },

  async atualizarStatus(req: Request, res: Response) {
    try {
      const id = converterUUID(req.params.id)
      const { status } = req.body

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' })
      }

      if (!STATUS_TAREFA_VALIDOS.includes(status)) {
        return res.status(400).json({ error: 'Status inválido' })
      }

      const tarefaAtual = await TarefaService.buscarPorId(id)

      if (!tarefaAtual) {
        return res.status(404).json({ error: 'Tarefa não encontrada' })
      }

      if (capatazNaoEDonoDaTarefa(req, tarefaAtual.atribuida_a)) {
        return res.status(403).json({ error: 'Acesso negado: tarefa de outro capataz' })
      }

      const tarefa = await TarefaService.atualizarStatus(id, status)

      return res.status(200).json(tarefa)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar status da tarefa' })
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = converterUUID(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const tarefa = await TarefaService.atualizar(id, req.body)

      if (!tarefa) {
        return res.status(404).json({ error: 'Tarefa não encontrada' })
      }

      return res.status(200).json(tarefa)
    } catch (error) {
      return res.status(400).json({
        error: mensagemErroCliente(error, 'Erro ao atualizar tarefa'),
      })
    }
  },

  async contarPorStatus(req: Request, res: Response) {
    try {
      const retiroUuid = converterUuidDeConsulta(req)

      if (retiroUuid === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const contagem = await TarefaService.contarPorStatus(retiroUuid)

      return res.status(200).json(contagem)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao contar tarefas por status' })
    }
  },

  async remover(req: Request, res: Response) {
    try {
      const id = converterUUID(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const tarefa = await TarefaService.buscarPorId(id)

      if (!tarefa) {
        return res.status(404).json({ error: 'Tarefa não encontrada' })
      }

      await TarefaService.remover(id)

      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover tarefa' })
    }
  },
}
