import { Request, Response } from 'express'
import { converterUUID } from '../models/uuid'
import { SincronizacaoService } from '../services/sincronizacao.service'

function converterUuidQuery(valor: unknown): string | undefined | null {
  if (valor === undefined || valor === null || valor === '') {
    return undefined
  }

  return converterUUID(valor)
}

export const SincronizacaoController = {
  // RN03: Verifica se há conexão disponível com o servidor.
  async detectarConexao(_req: Request, res: Response) {
    try {
      const temConexao = await SincronizacaoService.detectarConexao()
      return res.status(200).json({ temConexao })
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao detectar conexão',
      })
    }
  },

  // RN03: Sincroniza movimentações, tarefas e tickets pendentes.
  async sincronizar(_req: Request, res: Response) {
    try {
      const resultado = await SincronizacaoService.sincronizar()
      return res.status(resultado.sucesso ? 200 : 400).json(resultado)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao sincronizar dados',
      })
    }
  },

  // RN07: Busca movimentações sincronizadas e validadas para relatórios.
  async buscarMovimentacoesParaRelatrio(req: Request, res: Response) {
    try {
      const retiroId = converterUuidQuery(req.query.retiroId)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const dados = await SincronizacaoService.buscarMovimentacoesParaRelatrio(retiroId)

      return res.status(200).json(dados)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar movimentações para relatório',
      })
    }
  },

  // RN07: Busca tarefas sincronizadas e aprovadas para relatórios.
  async buscarTarefasParaRelatrio(req: Request, res: Response) {
    try {
      const retiroId = converterUuidQuery(req.query.retiroId)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const dados = await SincronizacaoService.buscarTarefasParaRelatrio(retiroId)

      return res.status(200).json(dados)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar tarefas para relatório',
      })
    }
  },

  // RN10: Busca tickets sincronizados e aprovados para o dashboard.
  async buscarTicketsParaDashboard(req: Request, res: Response) {
    try {
      const retiroId = converterUuidQuery(req.query.retiroId)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const dados = await SincronizacaoService.buscarTicketsParaDashboard(retiroId)

      return res.status(200).json(dados)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar tickets para dashboard',
      })
    }
  },

  // RN03/RN10: Retorna o status geral da sincronização.
  async obterStatusSincronizacao(_req: Request, res: Response) {
    try {
      const status = await SincronizacaoService.obterStatusSincronizacao()
      return res.status(200).json(status)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao obter status de sincronização',
      })
    }
  },

  // RN03/RN10: Retorna uma mensagem amigável baseada no status atual da sincronização.
  async obterMensagemSincronizacao(_req: Request, res: Response) {
    try {
      const mensagem = await SincronizacaoService.obterMensagemSincronizacao()
      return res.status(200).json({ mensagem })
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao obter mensagem de sincronização',
      })
    }
  },
}
