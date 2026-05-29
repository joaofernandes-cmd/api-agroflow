import { Request, Response } from 'express'
import { RelatorioService } from '../services/relatorio.service'

// Converte uma string de query em Date.
// Se o valor vier vazio, retorna undefined.
// Se a data for inválida, retorna null para permitir resposta 400.
function converterDataQuery(value: unknown): Date | undefined | null {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const date = new Date(String(value))

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

function converterNumeroQuery(value: unknown): number | undefined | null {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export const RelatorioController = {
  // RN07: Busca dados de movimentações já sincronizadas e validadas,
  // com filtro opcional por período e retiro.
  async buscarDadosMovimentacoes(req: Request, res: Response) {
    try {
      const dataInicio = converterDataQuery(req.query.dataInicio)
      const dataFim = converterDataQuery(req.query.dataFim)
      const retiroId = converterNumeroQuery(req.query.retiroId)

      if (dataInicio === null || dataFim === null) {
        return res.status(400).json({ error: 'Datas inválidas em dataInicio ou dataFim' })
      }

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const dados = await RelatorioService.buscarDadosMovimentacoes(dataInicio, dataFim, retiroId)

      return res.status(200).json(dados)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar dados de movimentações',
      })
    }
  },

  // RN07: Busca dados de tarefas já sincronizadas e concluídas,
  // com filtro opcional por período e retiro.
  async buscarDadosTarefas(req: Request, res: Response) {
    try {
      const dataInicio = converterDataQuery(req.query.dataInicio)
      const dataFim = converterDataQuery(req.query.dataFim)
      const retiroId = converterNumeroQuery(req.query.retiroId)

      if (dataInicio === null || dataFim === null) {
        return res.status(400).json({ error: 'Datas inválidas em dataInicio ou dataFim' })
      }

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const dados = await RelatorioService.buscarDadosTarefas(dataInicio, dataFim, retiroId)

      return res.status(200).json(dados)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar dados de tarefas',
      })
    }
  },

  // RN07: Formata o relatório de movimentações em um formato pronto para planilha.
  async formatarRelatorioMovimentacoes(req: Request, res: Response) {
    try {
      const dataInicio = converterDataQuery(req.query.dataInicio)
      const dataFim = converterDataQuery(req.query.dataFim)
      const retiroId = converterNumeroQuery(req.query.retiroId)

      if (dataInicio === null || dataFim === null) {
        return res.status(400).json({ error: 'Datas inválidas em dataInicio ou dataFim' })
      }

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const relatorio = await RelatorioService.formatarRelatorioMovimentacoes(dataInicio, dataFim, retiroId)

      return res.status(200).json(relatorio)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao formatar relatório de movimentações',
      })
    }
  },

  // RN07: Gera o relatório semanal usando os últimos 7 dias.
  async gerarRelatorioSemanal(req: Request, res: Response) {
    try {
      const retiroId = converterNumeroQuery(req.query.retiroId)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const relatorio = await RelatorioService.gerarRelatorioSemanal(retiroId)

      return res.status(200).json(relatorio)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao gerar relatório semanal',
      })
    }
  },

  // RN07: Gera o relatório mensal usando os últimos 30 dias.
  async gerarRelatorioMensal(req: Request, res: Response) {
    try {
      const retiroId = converterNumeroQuery(req.query.retiroId)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const relatorio = await RelatorioService.gerarRelatorioMensal(retiroId)

      return res.status(200).json(relatorio)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao gerar relatório mensal',
      })
    }
  },
}
