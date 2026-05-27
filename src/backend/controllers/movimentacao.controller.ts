import { Request, Response } from 'express'
import { MovimentacaoService } from '../services/movimentacao.service'
import { MovimentacaoStatus, MovimentacaoTipo } from '../models/movimentacao.model'
import { Usuario } from '../models/usuario.model'

function queryString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function queryArray<T extends string>(value: unknown): T[] | undefined {
  if (!value) {
    return undefined
  }

  if (Array.isArray(value)) {
    return value.map(String) as T[]
  }

  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean) as T[]
}

export const MovimentacaoController = {
  async criar(req: Request, res: Response) {
    try {
      const { retiro_id, capataz_id, tipo, origem, destino, quantidade, sincronizado, causa_obito, estagio_vida } =
        req.body

      if (!retiro_id || !capataz_id || !tipo || !origem || !destino || !quantidade || !estagio_vida) {
        return res.status(400).json({ error: 'Campos obrigatorios nao informados' })
      }

      const movimentacao = await MovimentacaoService.criar({
        retiro_id,
        capataz_id,
        tipo,
        origem,
        destino,
        quantidade,
        sincronizado,
        causa_obito,
        estagio_vida,
      })

      return res.status(201).json(movimentacao)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao criar movimentacao',
      })
    }
  },

  async listarTodas(req: Request, res: Response) {
    try {
      const movimentacoes = await MovimentacaoService.listarTodas()
      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar movimentacoes' })
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = String(req.params.id)
      const movimentacao = await MovimentacaoService.buscarPorId(id)

      if (!movimentacao) {
        return res.status(404).json({ error: 'Movimentacao nao encontrada' })
      }

      return res.status(200).json(movimentacao)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar movimentacao' })
    }
  },

  async validar(req: Request, res: Response) {
    try {
      const id = String(req.params.id)
      const { usuario, aprovado, motivo_rejeicao } = req.body

      if (!usuario || typeof aprovado !== 'boolean') {
        return res.status(400).json({ error: 'Usuario e aprovacao sao obrigatorios' })
      }

      const movimentacao = await MovimentacaoService.validar(id, usuario as Usuario, aprovado, motivo_rejeicao)

      if (!movimentacao) {
        return res.status(404).json({ error: 'Movimentacao nao encontrada' })
      }

      return res.status(200).json(movimentacao)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao validar movimentacao',
      })
    }
  },

  async filtrar(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const tipos = queryArray<MovimentacaoTipo>(req.query.tipos)
      const status = queryArray<MovimentacaoStatus>(req.query.status)

      if (!retiroId) {
        return res.status(400).json({ error: 'Retiro e obrigatorio' })
      }

      const movimentacoes = await MovimentacaoService.filtrar(retiroId, tipos, status)
      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao filtrar movimentacoes' })
    }
  },

  async buscarParaRelatorio(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const movimentacoes = await MovimentacaoService.buscarParaRelatorio(retiroId)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar movimentacoes para relatorio' })
    }
  },

  async buscarParaDashboard(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const movimentacoes = await MovimentacaoService.buscarParaDashboard(retiroId)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar movimentacoes para dashboard' })
    }
  },

  async sincronizar(req: Request, res: Response) {
    try {
      const id = String(req.params.id)
      const movimentacao = await MovimentacaoService.sincronizar(id)

      if (!movimentacao) {
        return res.status(404).json({ error: 'Movimentacao nao encontrada' })
      }

      return res.status(200).json(movimentacao)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao sincronizar movimentacao' })
    }
  },

  async listarPendentes(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const movimentacoes = await MovimentacaoService.listarPendentes(retiroId)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar movimentacoes pendentes' })
    }
  },

  async contarPorTipo(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const contagem = await MovimentacaoService.contarPorTipo(retiroId)

      return res.status(200).json(contagem)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao contar movimentacoes por tipo' })
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = String(req.params.id)
      const movimentacao = await MovimentacaoService.atualizar(id, req.body)

      if (!movimentacao) {
        return res.status(404).json({ error: 'Movimentacao nao encontrada' })
      }

      return res.status(200).json(movimentacao)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao atualizar movimentacao',
      })
    }
  },

  async remover(req: Request, res: Response) {
    try {
      const id = String(req.params.id)
      const movimentacao = await MovimentacaoService.buscarPorId(id)

      if (!movimentacao) {
        return res.status(404).json({ error: 'Movimentacao nao encontrada' })
      }

      await MovimentacaoService.remover(id)

      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover movimentacao' })
    }
  },
}
