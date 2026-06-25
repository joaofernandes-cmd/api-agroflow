import { Request, Response } from 'express'
import {
  FormatoRelatorioExportacao,
  RelatorioService,
  TipoRelatorioExportacao,
} from '../services/relatorio.service'
import { relatorioDemo } from '../data/relatorio-demo'
import { OPCOES_RETIRO } from '../data/referencia'
import { mensagemErroCliente } from '../utils/erro-api'
import { converterUuidOpcional } from '../utils/parametros-controller'

// Converte uma string de query em Date; vazio retorna undefined,
// inválida retorna null para permitir resposta 400
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

function converterTipoExportacao(valor: unknown): TipoRelatorioExportacao | null {
  const tipo = String(valor ?? 'movimentacoes')
  return ['movimentacoes', 'tarefas', 'tickets'].includes(tipo)
    ? tipo as TipoRelatorioExportacao
    : null
}

function converterFormatoExportacao(valor: unknown): FormatoRelatorioExportacao | null {
  const formato = String(valor ?? 'xlsx')
  return ['xlsx', 'csv'].includes(formato)
    ? formato as FormatoRelatorioExportacao
    : null
}

export const RelatorioController = {
  // Views

  // Renderiza a tela de relatórios para o Supervisor
  renderRelatoriosSupervisor(req: Request, res: Response) {
    res.render('partials/relatorios', {
      title: 'Relatórios',
      css: ['supervisor', 'relatorios'],
      persona: 'supervisor',
      usuario: (req as any).usuario ?? { nome: 'Luiz Felipe' },
      retiros: OPCOES_RETIRO,
      relatorioDemo,
    })
  },

  // Renderiza a tela de relatórios para o Gerente
  renderRelatoriosGerente(req: Request, res: Response) {
    res.render('partials/relatorios', {
      title: 'Relatórios',
      css: ['gerente', 'relatorios'],
      persona: 'gerente',
      usuario: (req as any).usuario ?? { nome: 'Marcos Ferreira' },
      retiros: OPCOES_RETIRO,
      relatorioDemo,
    })
  },

  // API

  // RN07: Busca dados de movimentações já sincronizadas e validadas,
  // com filtro opcional por período e retiro
  async buscarDadosMovimentacoes(req: Request, res: Response) {
    try {
      const dataInicio = converterDataQuery(req.query.dataInicio)
      const dataFim = converterDataQuery(req.query.dataFim)
      const retiroId = converterUuidOpcional(req.query.retiroId)

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
        error: mensagemErroCliente(error, 'Erro ao buscar dados de movimentações'),
      })
    }
  },

  // RN07: Busca dados de tarefas já sincronizadas e concluídas,
  // com filtro opcional por período e retiro
  async buscarDadosTarefas(req: Request, res: Response) {
    try {
      const dataInicio = converterDataQuery(req.query.dataInicio)
      const dataFim = converterDataQuery(req.query.dataFim)
      const retiroId = converterUuidOpcional(req.query.retiroId)

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
        error: mensagemErroCliente(error, 'Erro ao buscar dados de tarefas'),
      })
    }
  },

  // RN07: Formata o relatório de movimentações em um formato pronto para planilha
  async formatarRelatorioMovimentacoes(req: Request, res: Response) {
    try {
      const dataInicio = converterDataQuery(req.query.dataInicio)
      const dataFim = converterDataQuery(req.query.dataFim)
      const retiroId = converterUuidOpcional(req.query.retiroId)

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
        error: mensagemErroCliente(error, 'Erro ao formatar relatório de movimentações'),
      })
    }
  },

  async buscarDadosTickets(req: Request, res: Response) {
    try {
      const dataInicio = converterDataQuery(req.query.dataInicio)
      const dataFim = converterDataQuery(req.query.dataFim)
      const retiroId = converterUuidOpcional(req.query.retiroId)

      if (dataInicio === null || dataFim === null) {
        return res.status(400).json({ error: 'Datas inválidas em dataInicio ou dataFim' })
      }

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const dados = await RelatorioService.buscarDadosTickets(dataInicio, dataFim, retiroId)
      return res.status(200).json(dados)
    } catch (error) {
      return res.status(500).json({
        error: mensagemErroCliente(error, 'Erro ao buscar dados de tickets'),
      })
    }
  },

  async exportar(req: Request, res: Response) {
    try {
      const dataInicio = converterDataQuery(req.query.dataInicio)
      const dataFim = converterDataQuery(req.query.dataFim)
      const retiroId = converterUuidOpcional(req.query.retiroId)
      const tipo = converterTipoExportacao(req.query.tipo)
      const formato = converterFormatoExportacao(req.query.formato)

      if (dataInicio === null || dataFim === null) {
        return res.status(400).json({ error: 'Datas inválidas em dataInicio ou dataFim' })
      }

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      if (!tipo || !formato) {
        return res.status(400).json({ error: 'Tipo ou formato de exportação inválido' })
      }

      const arquivo = await RelatorioService.gerarArquivo(
        tipo,
        formato,
        dataInicio,
        dataFim,
        retiroId
      )
      const data = new Date().toISOString().slice(0, 10)
      const nomeArquivo = `relatorio-${tipo}-${data}.${formato}`

      res.setHeader(
        'Content-Type',
        formato === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv; charset=utf-8'
      )
      res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`)

      return res.status(200).send(arquivo)
    } catch (error) {
      return res.status(500).json({
        error: mensagemErroCliente(error, 'Erro ao exportar relatório'),
      })
    }
  },

  // RN07: Gera o relatório semanal usando os últimos 7 dias
  async gerarRelatorioSemanal(req: Request, res: Response) {
    try {
      const retiroId = converterUuidOpcional(req.query.retiroId)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const relatorio = await RelatorioService.gerarRelatorioSemanal(retiroId)

      return res.status(200).json(relatorio)
    } catch (error) {
      return res.status(500).json({
        error: mensagemErroCliente(error, 'Erro ao gerar relatório semanal'),
      })
    }
  },

  // RN07: Gera o relatório mensal usando os últimos 30 dias
  async gerarRelatorioMensal(req: Request, res: Response) {
    try {
      const retiroId = converterUuidOpcional(req.query.retiroId)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const relatorio = await RelatorioService.gerarRelatorioMensal(retiroId)

      return res.status(200).json(relatorio)
    } catch (error) {
      return res.status(500).json({
        error: mensagemErroCliente(error, 'Erro ao gerar relatório mensal'),
      })
    }
  },
}
