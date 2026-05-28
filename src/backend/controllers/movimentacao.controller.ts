import { Request, Response } from 'express'
import { MovimentacaoService } from '../services/movimentacao.service'
import { MovimentacaoStatus, MovimentacaoTipo } from '../models/movimentacao.model'
import { Usuario } from '../models/usuario.model'

function queryString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function parseNumber(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
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

      if (!retiro_id || !capataz_id || !tipo || !estagio_vida) {
        return res.status(400).json({ error: 'Campos obrigatórios não informados' })
      }

      const retiroId = parseNumber(retiro_id)
      const quantidadeNumber = quantidade === undefined || quantidade === null ? null : parseNumber(quantidade)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      if (quantidadeNumber === null && quantidade !== undefined && quantidade !== null) {
        return res.status(400).json({ error: 'Quantidade inválida' })
      }

      const movimentacao = await MovimentacaoService.criar({
        retiro_id: retiroId,
        capataz_id,
        tipo,
        origem,
        destino,
        quantidade: quantidadeNumber,
        sincronizado,
        causa_obito,
        estagio_vida,
      })

      return res.status(201).json(movimentacao)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao criar movimentação',
      })
    }
  },

  async listarTodas(req: Request, res: Response) {
    try {
      const movimentacoes = await MovimentacaoService.listarTodas()
      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar movimentações' })
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = parseNumber(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const movimentacao = await MovimentacaoService.buscarPorId(id)

      if (!movimentacao) {
        return res.status(404).json({ error: 'Movimentação não encontrada' })
      }

      return res.status(200).json(movimentacao)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar movimentação' })
    }
  },

  async validar(req: Request, res: Response) {
    try {
      const id = parseNumber(req.params.id)
      const { usuario, aprovado } = req.body

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!usuario || typeof aprovado !== 'boolean') {
        return res.status(400).json({ error: 'Usuário e aprovação são obrigatórios' })
      }

      const movimentacao = await MovimentacaoService.validar(id, usuario as Usuario, aprovado)

      if (!movimentacao) {
        return res.status(404).json({ error: 'Movimentação não encontrada' })
      }

      return res.status(200).json(movimentacao)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao validar movimentação',
      })
    }
  },

  async filtrar(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const tipos = queryArray<MovimentacaoTipo>(req.query.tipos)
      const status = queryArray<MovimentacaoStatus>(req.query.status)

      if (!retiroId) {
        return res.status(400).json({ error: 'Retiro é obrigatório' })
      }

      const retiroIdNumber = parseNumber(retiroId)

      if (retiroIdNumber === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const movimentacoes = await MovimentacaoService.filtrar(retiroIdNumber, tipos, status)
      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao filtrar movimentações' })
    }
  },

  async buscarParaRelatorio(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const retiroIdNumber = retiroId ? parseNumber(retiroId) : undefined

      if (retiroIdNumber === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }
      const movimentacoes = await MovimentacaoService.buscarParaRelatorio(retiroIdNumber)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar movimentações para relatório' })
    }
  },

  async buscarParaDashboard(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const retiroIdNumber = retiroId ? parseNumber(retiroId) : undefined

      if (retiroIdNumber === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const movimentacoes = await MovimentacaoService.buscarParaDashboard(retiroIdNumber)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar movimentações para dashboard' })
    }
  },

  async sincronizar(req: Request, res: Response) {
    try {
      const id = parseNumber(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const movimentacao = await MovimentacaoService.sincronizar(id)

      if (!movimentacao) {
        return res.status(404).json({ error: 'Movimentação não encontrada' })
      }

      return res.status(200).json(movimentacao)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao sincronizar movimentação' })
    }
  },

  async listarPendentes(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const retiroIdNumber = retiroId ? parseNumber(retiroId) : undefined

      if (retiroIdNumber === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const movimentacoes = await MovimentacaoService.listarPendentes(retiroIdNumber)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar movimentações pendentes' })
    }
  },

  async contarPorTipo(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const retiroIdNumber = retiroId ? parseNumber(retiroId) : undefined

      if (retiroIdNumber === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const contagem = await MovimentacaoService.contarPorTipo(retiroIdNumber)

      return res.status(200).json(contagem)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao contar movimentações por tipo' })
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = parseNumber(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const movimentacao = await MovimentacaoService.atualizar(id, req.body)

      if (!movimentacao) {
        return res.status(404).json({ error: 'Movimentação não encontrada' })
      }

      return res.status(200).json(movimentacao)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao atualizar movimentação',
      })
    }
  },

  async remover(req: Request, res: Response) {
    try {
      const id = parseNumber(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const movimentacao = await MovimentacaoService.buscarPorId(id)

      if (!movimentacao) {
        return res.status(404).json({ error: 'Movimentação não encontrada' })
      }

      await MovimentacaoService.remover(id)

      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover movimentação' })
    }
  },
}
