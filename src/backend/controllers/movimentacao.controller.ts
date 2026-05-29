import { Request, Response } from 'express'
import { MovimentacaoService } from '../services/movimentacao.service'
import { MovimentacaoStatus, MovimentacaoTipo } from '../models/movimentacao.model'

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

function parseDate(value: unknown, endOfDay = false): Date | null | undefined {
  const raw = queryString(value)

  if (!raw) {
    return undefined
  }

  const date = new Date(raw)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  // Quando o filtro traz dataFim, o ajuste para o fim do dia evita excluir
  // registros criados em horario posterior dentro da mesma data.
  if (endOfDay) {
    date.setHours(23, 59, 59, 999)
  }

  return date
}

function toArrayOrUndefined<T extends string>(value: unknown, fallback?: T[]): T[] | undefined {
  const parsed = queryArray<T>(value)
  if (parsed && parsed.length > 0) {
    return parsed
  }

  return fallback
}

export const MovimentacaoController = {
  async criar(req: Request, res: Response) {
    try {
      const { retiro_id, capataz_id, tipo, origem, destino, quantidade, sincronizado, causa_obito, estagio_vida } =
        req.body

      if (!retiro_id || !capataz_id || !tipo || !estagio_vida) {
        return res.status(400).json({ error: 'Campos obrigatorios nao informados' })
      }

      const retiroId = parseNumber(retiro_id)
      const quantidadeNumber = quantidade === undefined || quantidade === null ? null : parseNumber(quantidade)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro invalido' })
      }

      if (quantidadeNumber === null && quantidade !== undefined && quantidade !== null) {
        return res.status(400).json({ error: 'Quantidade invalida' })
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
        error: error instanceof Error ? error.message : 'Erro ao criar movimentacao',
      })
    }
  },

  // Endpoint usado pelo cliente offline quando o backend recebe a sincronizacao.
  // O registro chega completo e ja deve ser gravado como sincronizado no servidor.
  async sincronizarRecebida(req: Request, res: Response) {
    try {
      const { retiro_id, capataz_id, tipo, origem, destino, quantidade, causa_obito, estagio_vida } = req.body

      if (!retiro_id || !capataz_id || !tipo || !estagio_vida) {
        return res.status(400).json({ error: 'Campos obrigatorios nao informados' })
      }

      const retiroId = parseNumber(retiro_id)
      const quantidadeNumber = quantidade === undefined || quantidade === null ? null : parseNumber(quantidade)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro invalido' })
      }

      if (quantidadeNumber === null && quantidade !== undefined && quantidade !== null) {
        return res.status(400).json({ error: 'Quantidade invalida' })
      }

      const movimentacao = await MovimentacaoService.sincronizarRecebida({
        retiro_id: retiroId,
        capataz_id,
        tipo,
        origem,
        destino,
        quantidade: quantidadeNumber,
        causa_obito,
        estagio_vida,
      })

      return res.status(201).json(movimentacao)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao sincronizar movimentacao',
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
      const id = parseNumber(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID invalido' })
      }

      const movimentacao = await MovimentacaoService.buscarPorId(id)

      if (!movimentacao) {
        return res.status(404).json({ error: 'Movimentacao nao encontrada' })
      }

      return res.status(200).json(movimentacao)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar movimentacao' })
    }
  },

  async filtrar(req: Request, res: Response) {
    try {
      // O WAD documenta os filtros como retiro, tipo, status, dataInicio e dataFim.
      // Mantemos aliases antigos para nao quebrar chamadas ja existentes.
      const retiro = queryString(req.query.retiro) ?? queryString(req.query.retiroId)
      const tipos = toArrayOrUndefined<MovimentacaoTipo>(req.query.tipo ?? req.query.tipos)
      const statusQuery = req.query.status
      const status = toArrayOrUndefined<MovimentacaoStatus>(statusQuery, undefined) ?? ['pendente']
      const dataInicio = parseDate(req.query.dataInicio)
      const dataFim = parseDate(req.query.dataFim, true)

      if (!retiro) {
        return res.status(400).json({ error: 'Retiro e obrigatorio' })
      }

      const retiroIdNumber = parseNumber(retiro)

      if (retiroIdNumber === null) {
        return res.status(400).json({ error: 'Retiro invalido' })
      }

      if (dataInicio === null) {
        return res.status(400).json({ error: 'dataInicio invalida' })
      }

      if (dataFim === null) {
        return res.status(400).json({ error: 'dataFim invalida' })
      }

      const movimentacoes = await MovimentacaoService.filtrar(
        retiroIdNumber,
        tipos,
        status,
        dataInicio,
        dataFim
      )

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao filtrar movimentacoes' })
    }
  },

  async buscarParaRelatorio(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const retiroIdNumber = retiroId ? parseNumber(retiroId) : undefined

      if (retiroIdNumber === null) {
        return res.status(400).json({ error: 'Retiro invalido' })
      }
      const movimentacoes = await MovimentacaoService.buscarParaRelatorio(retiroIdNumber)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar movimentacoes para relatorio' })
    }
  },

  async buscarParaDashboard(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const retiroIdNumber = retiroId ? parseNumber(retiroId) : undefined

      if (retiroIdNumber === null) {
        return res.status(400).json({ error: 'Retiro invalido' })
      }

      const movimentacoes = await MovimentacaoService.buscarParaDashboard(retiroIdNumber)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar movimentacoes para dashboard' })
    }
  },

  async sincronizar(req: Request, res: Response) {
    try {
      const id = parseNumber(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID invalido' })
      }

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
      const retiroIdNumber = retiroId ? parseNumber(retiroId) : undefined

      if (retiroIdNumber === null) {
        return res.status(400).json({ error: 'Retiro invalido' })
      }

      const movimentacoes = await MovimentacaoService.listarPendentes(retiroIdNumber)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar movimentacoes pendentes' })
    }
  },

  async contarPorTipo(req: Request, res: Response) {
    try {
      const retiroId = queryString(req.query.retiroId)
      const retiroIdNumber = retiroId ? parseNumber(retiroId) : undefined

      if (retiroIdNumber === null) {
        return res.status(400).json({ error: 'Retiro invalido' })
      }

      const contagem = await MovimentacaoService.contarPorTipo(retiroIdNumber)

      return res.status(200).json(contagem)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao contar movimentacoes por tipo' })
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = parseNumber(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID invalido' })
      }

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
      const id = parseNumber(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID invalido' })
      }

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
