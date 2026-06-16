import { Request, Response } from 'express'
import { MovimentacaoService } from '../services/movimentacao.service'
import { MovimentacaoStatus, MovimentacaoTipo } from '../models/movimentacao.model'
import { converterUUID } from '../models/uuid'

function extrairTexto(valor: unknown): string | undefined {
  return typeof valor === 'string' ? valor : undefined
}

function converterNumero(valor: unknown): number | null {
  const numero = Number(valor)
  return Number.isNaN(numero) ? null : numero
}

function extrairLista<T extends string>(valor: unknown): T[] | undefined {
  if (!valor) {
    return undefined
  }

  if (Array.isArray(valor)) {
    return valor.map(String) as T[]
  }

  return String(valor)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean) as T[]
}

function converterData(valor: unknown, fimDoDia = false): Date | null | undefined {
  const texto = extrairTexto(valor)

  if (!texto) {
    return undefined
  }

  const data = new Date(texto)

  if (Number.isNaN(data.getTime())) {
    return null
  }

  // Quando o filtro traz dataFim, o ajuste para o fim do dia evita excluir
  // registros criados em horario posterior dentro da mesma data.
  if (fimDoDia) {
    data.setHours(23, 59, 59, 999)
  }

  return data
}

function listaOuFallback<T extends string>(valor: unknown, fallback?: T[]): T[] | undefined {
  const lista = extrairLista<T>(valor)
  if (lista && lista.length > 0) {
    return lista
  }

  return fallback
}

function retiroDaConsulta(req: Request, valor?: string): string | undefined {
  if (req.usuario?.cargo === 'supervisor' || req.usuario?.cargo === 'capataz') {
    return req.usuario.retiro_id
  }

  return valor
}

export const MovimentacaoController = {
  async criar(req: Request, res: Response) {
    try {
      const {
        id,
        tipo,
        tipo_outro,
        origem,
        destino,
        quantidade,
        sincronizado,
        causa_obito,
        estagio_vida,
        evidencia,
      } = req.body
      const retiro_id = req.usuario?.cargo === 'capataz' ? req.usuario.retiro_id : req.body.retiro_id
      const capataz_id = req.usuario?.cargo === 'capataz' ? req.usuario.id : req.body.capataz_id

      if (!retiro_id || !capataz_id || !tipo || !estagio_vida) {
        return res.status(400).json({ error: 'Campos obrigatorios nao informados' })
      }

      const retiroId = converterUUID(retiro_id)
      const movimentacaoId = id === undefined ? undefined : converterUUID(id)
      const quantidadeNumerica = quantidade === undefined || quantidade === null ? null : converterNumero(quantidade)

      if (retiroId === null || movimentacaoId === null) {
        return res.status(400).json({ error: 'Retiro invalido' })
      }

      if (quantidadeNumerica === null && quantidade !== undefined && quantidade !== null) {
        return res.status(400).json({ error: 'Quantidade invalida' })
      }

      const movimentacao = await MovimentacaoService.criar({
        id: movimentacaoId,
        retiro_id: retiroId,
        capataz_id,
        tipo,
        tipo_outro,
        origem,
        destino,
        quantidade: quantidadeNumerica,
        sincronizado,
        causa_obito,
        estagio_vida,
        evidencia,
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
      const { tipo, tipo_outro, origem, destino, quantidade, causa_obito, estagio_vida, evidencia } = req.body
      const retiro_id = req.usuario?.cargo === 'capataz' ? req.usuario.retiro_id : req.body.retiro_id
      const capataz_id = req.usuario?.cargo === 'capataz' ? req.usuario.id : req.body.capataz_id

      if (!retiro_id || !capataz_id || !tipo || !estagio_vida) {
        return res.status(400).json({ error: 'Campos obrigatorios nao informados' })
      }

      const retiroId = converterUUID(retiro_id)
      const quantidadeNumerica = quantidade === undefined || quantidade === null ? null : converterNumero(quantidade)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro invalido' })
      }

      if (quantidadeNumerica === null && quantidade !== undefined && quantidade !== null) {
        return res.status(400).json({ error: 'Quantidade invalida' })
      }

      const movimentacao = await MovimentacaoService.sincronizarRecebida({
        retiro_id: retiroId,
        capataz_id,
        tipo,
        tipo_outro,
        origem,
        destino,
        quantidade: quantidadeNumerica,
        causa_obito,
        estagio_vida,
        evidencia,
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
      const movimentacoes = req.usuario?.cargo === 'supervisor'
        ? await MovimentacaoService.filtrar(req.usuario.retiro_id)
        : await MovimentacaoService.listarTodas()
      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar movimentacoes' })
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = converterUUID(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID invalido' })
      }

      const movimentacao = await MovimentacaoService.buscarPorId(id)

      if (!movimentacao) {
        return res.status(404).json({ error: 'Movimentacao nao encontrada' })
      }

      if (
        (req.usuario?.cargo === 'supervisor' || req.usuario?.cargo === 'capataz') &&
        movimentacao.retiro_id !== req.usuario.retiro_id
      ) {
        return res.status(403).json({ error: 'Acesso negado: retiro diferente do usuario' })
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
      const retiro = retiroDaConsulta(req, extrairTexto(req.query.retiro) ?? extrairTexto(req.query.retiroId))
      const tipos = listaOuFallback<MovimentacaoTipo>(req.query.tipo ?? req.query.tipos)
      const statusBruto = req.query.status
      const status = listaOuFallback<MovimentacaoStatus>(statusBruto, undefined) ?? ['pendente']
      const dataInicio = converterData(req.query.dataInicio)
      const dataFim = converterData(req.query.dataFim, true)

      if (!retiro) {
        return res.status(400).json({ error: 'Retiro e obrigatorio' })
      }

      const retiroId = converterUUID(retiro)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro invalido' })
      }

      if (dataInicio === null) {
        return res.status(400).json({ error: 'dataInicio invalida' })
      }

      if (dataFim === null) {
        return res.status(400).json({ error: 'dataFim invalida' })
      }

      const movimentacoes = await MovimentacaoService.filtrar(
        retiroId,
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
      const retiroId = retiroDaConsulta(req, extrairTexto(req.query.retiroId))
      const retiroUuid = retiroId ? converterUUID(retiroId) : undefined

      if (retiroUuid === null) {
        return res.status(400).json({ error: 'Retiro invalido' })
      }
      const movimentacoes = await MovimentacaoService.buscarParaRelatorio(retiroUuid)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar movimentacoes para relatorio' })
    }
  },

  async buscarParaDashboard(req: Request, res: Response) {
    try {
      const retiroId = retiroDaConsulta(req, extrairTexto(req.query.retiroId))
      const retiroUuid = retiroId ? converterUUID(retiroId) : undefined

      if (retiroUuid === null) {
        return res.status(400).json({ error: 'Retiro invalido' })
      }

      const movimentacoes = await MovimentacaoService.buscarParaDashboard(retiroUuid)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar movimentacoes para dashboard' })
    }
  },

  async sincronizar(req: Request, res: Response) {
    try {
      const id = converterUUID(req.params.id)

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
      const retiroId = retiroDaConsulta(req, extrairTexto(req.query.retiroId))
      const retiroUuid = retiroId ? converterUUID(retiroId) : undefined

      if (retiroUuid === null) {
        return res.status(400).json({ error: 'Retiro invalido' })
      }

      const movimentacoes = await MovimentacaoService.listarPendentes(retiroUuid)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar movimentacoes pendentes' })
    }
  },

  async contarPorTipo(req: Request, res: Response) {
    try {
      const retiroId = retiroDaConsulta(req, extrairTexto(req.query.retiroId))
      const retiroUuid = retiroId ? converterUUID(retiroId) : undefined

      if (retiroUuid === null) {
        return res.status(400).json({ error: 'Retiro invalido' })
      }

      const contagem = await MovimentacaoService.contarPorTipo(retiroUuid)

      return res.status(200).json(contagem)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao contar movimentacoes por tipo' })
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = converterUUID(req.params.id)

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
      const id = converterUUID(req.params.id)

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
