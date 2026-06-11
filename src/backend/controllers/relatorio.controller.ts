import { Request, Response } from 'express'
import { RelatorioService } from '../services/relatorio.service'

// Converte uma string de query em Date.
// Se o valor vier vazio, retorna undefined.
// Se a data for inválida, retorna null para permitir resposta 400.
function converterDataQuery(valor: unknown): Date | undefined | null {
  if (valor === undefined || valor === null || valor === '') {
    return undefined
  }

  const data = new Date(String(valor))

  if (Number.isNaN(data.getTime())) {
    return null
  }

  return data
}

function converterNumeroQuery(valor: unknown): number | undefined | null {
  if (valor === undefined || valor === null || valor === '') {
    return undefined
  }

  const numero = Number(valor)
  return Number.isNaN(numero) ? null : numero
}

export const RelatorioController = {
  // - Views -

  // Renderiza a tela de relatórios para o Supervisor
  renderRelatoriosSupervisor(req: Request, res: Response) {
    res.render('partials/relatorios', {
      title: 'Relatórios',
      css: ['supervisor', 'relatorios'],
      persona: 'supervisor',
      usuario: (req as any).usuario ?? { nome: 'Luiz Felipe' },
    })
  },

  // Renderiza a tela de relatórios para o Gerente
  renderRelatoriosGerente(req: Request, res: Response) {
    res.render('partials/relatorios', {
      title: 'Relatórios',
      css: ['gerente', 'relatorios'],
      persona: 'gerente',
      usuario: (req as any).usuario ?? { nome: 'Marcos Ferreira' },
    })
  },

  // - API -

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