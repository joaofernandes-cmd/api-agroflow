import { Request, Response } from 'express'
import { MovimentacaoService } from '../services/movimentacao.service'
import { MovimentacaoStatus, MovimentacaoTipo } from '../models/movimentacao.model'
import { converterUUID } from '../models/uuid'
import { mensagemErroCliente } from '../utils/erro-api'
import { converterUuidDeConsulta, extrairTexto, retiroDaConsulta } from '../utils/parametros-controller'

const TIPOS_MOVIMENTACAO_VALIDOS: MovimentacaoTipo[] = ['nascimento', 'morte', 'transferencia', 'compra', 'venda', 'outros']
const STATUS_MOVIMENTACAO_VALIDOS: MovimentacaoStatus[] = ['pendente', 'validado']
const TIPOS_MOVIMENTACAO_ACEITOS = [...TIPOS_MOVIMENTACAO_VALIDOS, 'outro'] as const

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

function contemValorInvalido<T extends string>(valores: T[] | undefined, permitidos: readonly T[]): boolean {
  return Boolean(valores?.some(valor => !permitidos.includes(valor)))
}

function normalizarTipoMovimentacao(valor: unknown): MovimentacaoTipo | null {
  if (valor === 'outro') {
    return 'outros'
  }

  if (typeof valor === 'string' && TIPOS_MOVIMENTACAO_VALIDOS.includes(valor as MovimentacaoTipo)) {
    return valor as MovimentacaoTipo
  }

  return null
}

function normalizarTiposMovimentacao(valores: string[] | undefined): MovimentacaoTipo[] | undefined {
  if (!valores) {
    return undefined
  }

  return valores.map(valor => normalizarTipoMovimentacao(valor)).filter((valor): valor is MovimentacaoTipo => valor !== null)
}

function capatazNaoEDonoDaMovimentacao(req: Request, capatazId: string): boolean {
  return req.usuario?.cargo === 'capataz' && capatazId !== req.usuario.id
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
        return res.status(400).json({ error: 'Campos obrigatórios não informados' })
      }

      const tipoNormalizado = normalizarTipoMovimentacao(tipo)

      if (!tipoNormalizado) {
        return res.status(400).json({ error: 'Tipo de movimentação inválido' })
      }

      const retiroId = converterUUID(retiro_id)
      const movimentacaoId = id === undefined ? undefined : converterUUID(id)
      const quantidadeNumerica = quantidade === undefined || quantidade === null ? null : converterNumero(quantidade)

      if (retiroId === null || movimentacaoId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      if (quantidadeNumerica === null && quantidade !== undefined && quantidade !== null) {
        return res.status(400).json({ error: 'Quantidade inválida' })
      }

      const movimentacao = await MovimentacaoService.criar({
        id: movimentacaoId,
        retiro_id: retiroId,
        capataz_id,
        tipo: tipoNormalizado,
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
        error: mensagemErroCliente(error, 'Erro ao criar movimentação'),
      })
    }
  },

  // Endpoint usado pelo cliente offline quando o backend recebe a sincronização.
  // O registro chega completo e já deve ser gravado como sincronizado no servidor.
  async sincronizarRecebida(req: Request, res: Response) {
    try {
      const { tipo, tipo_outro, origem, destino, quantidade, causa_obito, estagio_vida, evidencia } = req.body
      const retiro_id = req.usuario?.cargo === 'capataz' ? req.usuario.retiro_id : req.body.retiro_id
      const capataz_id = req.usuario?.cargo === 'capataz' ? req.usuario.id : req.body.capataz_id

      if (!retiro_id || !capataz_id || !tipo || !estagio_vida) {
        return res.status(400).json({ error: 'Campos obrigatórios não informados' })
      }

      const tipoNormalizado = normalizarTipoMovimentacao(tipo)

      if (!tipoNormalizado) {
        return res.status(400).json({ error: 'Tipo de movimentação inválido' })
      }

      const retiroId = converterUUID(retiro_id)
      const quantidadeNumerica = quantidade === undefined || quantidade === null ? null : converterNumero(quantidade)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      if (quantidadeNumerica === null && quantidade !== undefined && quantidade !== null) {
        return res.status(400).json({ error: 'Quantidade inválida' })
      }

      const movimentacao = await MovimentacaoService.sincronizarRecebida({
        retiro_id: retiroId,
        capataz_id,
        tipo: tipoNormalizado,
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
        error: mensagemErroCliente(error, 'Erro ao sincronizar movimentação'),
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
      const id = converterUUID(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const movimentacao = await MovimentacaoService.buscarPorId(id)

      if (!movimentacao) {
        return res.status(404).json({ error: 'Movimentação não encontrada' })
      }

      if (capatazNaoEDonoDaMovimentacao(req, movimentacao.capataz_id)) {
        return res.status(403).json({ error: 'Acesso negado: movimentação de outro capataz' })
      }

      return res.status(200).json(movimentacao)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar movimentação' })
    }
  },

  async filtrar(req: Request, res: Response) {
    try {
      // O WAD documenta os filtros como retiro, tipo, status, dataInicio e dataFim.
      // Mantemos aliases antigos para não quebrar chamadas já existentes.
      const retiro = retiroDaConsulta(req, extrairTexto(req.query.retiro) ?? extrairTexto(req.query.retiroId))
      const tiposBrutos = listaOuFallback<string>(req.query.tipo ?? req.query.tipos)
      const tipos = normalizarTiposMovimentacao(tiposBrutos)
      const statusBruto = req.query.status
      const status = listaOuFallback<MovimentacaoStatus>(statusBruto, undefined) ?? ['pendente']
      const dataInicio = converterData(req.query.dataInicio)
      const dataFim = converterData(req.query.dataFim, true)

      if (!retiro) {
        return res.status(400).json({ error: 'Retiro é obrigatório' })
      }

      const retiroId = converterUUID(retiro)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      if (dataInicio === null) {
        return res.status(400).json({ error: 'dataInicio inválida' })
      }

      if (dataFim === null) {
        return res.status(400).json({ error: 'dataFim inválida' })
      }

      if (contemValorInvalido(tiposBrutos, TIPOS_MOVIMENTACAO_ACEITOS)) {
        return res.status(400).json({ error: 'Tipo de movimentação inválido' })
      }

      if (contemValorInvalido(status, STATUS_MOVIMENTACAO_VALIDOS)) {
        return res.status(400).json({ error: 'Status de movimentação inválido' })
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
      return res.status(500).json({ error: 'Erro ao filtrar movimentações' })
    }
  },

  async buscarParaRelatorio(req: Request, res: Response) {
    try {
      const retiroUuid = converterUuidDeConsulta(req)

      if (retiroUuid === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }
      const movimentacoes = await MovimentacaoService.buscarParaRelatorio(retiroUuid)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar movimentações para relatório' })
    }
  },

  async buscarParaDashboard(req: Request, res: Response) {
    try {
      const retiroUuid = converterUuidDeConsulta(req)

      if (retiroUuid === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const movimentacoes = await MovimentacaoService.buscarParaDashboard(retiroUuid)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar movimentações para dashboard' })
    }
  },

  async sincronizar(req: Request, res: Response) {
    try {
      const id = converterUUID(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const movimentacaoAtual = await MovimentacaoService.buscarPorId(id)

      if (!movimentacaoAtual) {
        return res.status(404).json({ error: 'Movimentação não encontrada' })
      }

      if (capatazNaoEDonoDaMovimentacao(req, movimentacaoAtual.capataz_id)) {
        return res.status(403).json({ error: 'Acesso negado: movimentação de outro capataz' })
      }

      const movimentacao = await MovimentacaoService.sincronizar(id)

      return res.status(200).json(movimentacao)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao sincronizar movimentação' })
    }
  },

  async listarPendentes(req: Request, res: Response) {
    try {
      const retiroUuid = converterUuidDeConsulta(req)

      if (retiroUuid === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const movimentacoes = await MovimentacaoService.listarPendentes(retiroUuid)

      return res.status(200).json(movimentacoes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar movimentações pendentes' })
    }
  },

  async contarPorTipo(req: Request, res: Response) {
    try {
      const retiroUuid = converterUuidDeConsulta(req)

      if (retiroUuid === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const contagem = await MovimentacaoService.contarPorTipo(retiroUuid)

      return res.status(200).json(contagem)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao contar movimentações por tipo' })
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = converterUUID(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const movimentacaoAtual = await MovimentacaoService.buscarPorId(id)

      if (!movimentacaoAtual) {
        return res.status(404).json({ error: 'Movimentação não encontrada' })
      }

      if (capatazNaoEDonoDaMovimentacao(req, movimentacaoAtual.capataz_id)) {
        return res.status(403).json({ error: 'Acesso negado: movimentação de outro capataz' })
      }

      const movimentacao = await MovimentacaoService.atualizar(id, req.body)

      return res.status(200).json(movimentacao)
    } catch (error) {
      return res.status(400).json({
        error: mensagemErroCliente(error, 'Erro ao atualizar movimentação'),
      })
    }
  },

  async remover(req: Request, res: Response) {
    try {
      const id = converterUUID(req.params.id)

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
