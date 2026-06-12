import { SincronizacaoService } from './sincronizacao.service'
import { Movimentacao } from '../models/movimentacao.model'
import { Tarefa } from '../models/tarefa.model'
import { Ticket } from '../models/ticket.model'
import { UUID } from '../models/uuid'
import ExcelJS from 'exceljs'

export type TipoRelatorioExportacao = 'movimentacoes' | 'tarefas' | 'tickets'
export type FormatoRelatorioExportacao = 'xlsx' | 'csv'

type LinhaPlanilha = Record<string, string | number>

function protegerCelula(valor: string | number): string | number {
  if (typeof valor === 'string' && (/^[=+@]/.test(valor) || /^-(?=.)/.test(valor))) {
    return `'${valor}`
  }

  return valor
}

function escaparCsv(valor: string | number): string {
  const texto = String(protegerCelula(valor))
  return `"${texto.replace(/"/g, '""')}"`
}

// RN07: Relatórios com apenas dados sincronizados (sincronizado=true) e validados
export const RelatorioService = {
  // RN07: Buscar dados de movimentações para relatório
  // Apenas registros sincronizados (enviados pro servidor) + validados pelo Supervisor
  async buscarDadosMovimentacoes(
    dataInicio?: Date,
    dataFim?: Date,
    retiroId?: UUID
  ): Promise<Movimentacao[]> {
    // Busca movimentações que já foram sincronizadas e validadas
    let movimentacoes = await SincronizacaoService.buscarMovimentacoesParaRelatrio(retiroId)

    // RN07: Filtra por período se informado (para relatórios semanais/mensais)
    if (dataInicio || dataFim) {
      movimentacoes = movimentacoes.filter(m => {
        const dataMov = new Date(m.data_criacao)

        // Se há data inicial, exclui registros antes dela
        if (dataInicio && dataMov < dataInicio) {
          return false
        }

        // Se há data final, exclui registros depois dela
        if (dataFim && dataMov > dataFim) {
          return false
        }

        return true
      })
    }

    return movimentacoes
  },

  // RN07: Buscar dados de tarefas para relatório
  // Apenas registros sincronizados (enviados pro servidor) + aprovados
  async buscarDadosTarefas(
    dataInicio?: Date,
    dataFim?: Date,
    retiroId?: UUID
  ): Promise<Tarefa[]> {
    // Busca tarefas que já foram sincronizadas e aprovadas
    let tarefas = await SincronizacaoService.buscarTarefasParaRelatrio(retiroId)

    // RN07: Filtra por período se informado
    if (dataInicio || dataFim) {
      tarefas = tarefas.filter(t => {
        const dataTarefa = new Date(t.data_criacao)

        if (dataInicio && dataTarefa < dataInicio) {
          return false
        }

        if (dataFim && dataTarefa > dataFim) {
          return false
        }

        return true
      })
    }

    return tarefas
  },

  // RN07: Formatar dados de movimentações para planilha
  // Converte registros em estrutura pronta para Excel/CSV com colunas padronizadas
  async formatarRelatorioMovimentacoes(
    dataInicio?: Date,
    dataFim?: Date,
    retiroId?: UUID
  ): Promise<LinhaPlanilha[]> {
    // Busca dados sincronizados e validados
    const movimentacoes = await RelatorioService.buscarDadosMovimentacoes(dataInicio, dataFim, retiroId)

    // Mapeia para estrutura de planilha com colunas em português
    return movimentacoes.map(m => ({
      'Data': new Date(m.data_criacao).toLocaleDateString('pt-BR'),
      'Tipo': m.tipo,
      'Retiro': m.retiro_id,
      'Origem': m.origem || '-',
      'Destino': m.destino || '-',
      'Quantidade': m.quantidade ?? '-',
      'Estágio de Vida': m.estagio_vida,
      'Causa do Óbito': m.causa_obito || '-',
    }))
  },

  async formatarRelatorioTarefas(
    dataInicio?: Date,
    dataFim?: Date,
    retiroId?: UUID
  ): Promise<LinhaPlanilha[]> {
    const tarefas = await RelatorioService.buscarDadosTarefas(dataInicio, dataFim, retiroId)

    return tarefas.map(t => ({
      Data: new Date(t.data_criacao).toLocaleDateString('pt-BR'),
      Retiro: t.retiro_id,
      Descricao: t.descricao,
      Categoria: t.categoria,
      Prioridade: t.prioridade,
      Status: t.status,
      'Criada por': t.criada_por,
      'Atribuida a': t.atribuida_a,
    }))
  },

  async buscarDadosTickets(
    dataInicio?: Date,
    dataFim?: Date,
    retiroId?: UUID
  ): Promise<Ticket[]> {
    let tickets = await SincronizacaoService.buscarTicketsParaDashboard(retiroId)

    if (dataInicio || dataFim) {
      tickets = tickets.filter(t => {
        const dataTicket = new Date(t.data_criacao)
        return (!dataInicio || dataTicket >= dataInicio) && (!dataFim || dataTicket <= dataFim)
      })
    }

    return tickets
  },

  async formatarRelatorioTickets(
    dataInicio?: Date,
    dataFim?: Date,
    retiroId?: UUID
  ): Promise<LinhaPlanilha[]> {
    const tickets = await RelatorioService.buscarDadosTickets(dataInicio, dataFim, retiroId)

    return tickets.map(t => ({
      Data: new Date(t.data_criacao).toLocaleDateString('pt-BR'),
      Retiro: t.retiro_id,
      Categoria: t.categoria,
      Localizacao: t.localizacao,
      Descricao: t.descricao,
      Prioridade: t.prioridade,
      Status: t.status,
      'Aberto por': t.aberto_por,
      'Atribuido a': t.atribuido_a ?? '-',
    }))
  },

  async obterLinhasExportacao(
    tipo: TipoRelatorioExportacao,
    dataInicio?: Date,
    dataFim?: Date,
    retiroId?: UUID
  ): Promise<LinhaPlanilha[]> {
    if (tipo === 'tarefas') {
      return RelatorioService.formatarRelatorioTarefas(dataInicio, dataFim, retiroId)
    }

    if (tipo === 'tickets') {
      return RelatorioService.formatarRelatorioTickets(dataInicio, dataFim, retiroId)
    }

    return RelatorioService.formatarRelatorioMovimentacoes(dataInicio, dataFim, retiroId)
  },

  gerarCsv(linhas: LinhaPlanilha[]): Buffer {
    if (linhas.length === 0) {
      return Buffer.from('\uFEFF', 'utf8')
    }

    const colunas = Object.keys(linhas[0])
    const conteudo = [
      colunas.map(escaparCsv).join(';'),
      ...linhas.map(linha => colunas.map(coluna => escaparCsv(linha[coluna] ?? '')).join(';')),
    ].join('\r\n')

    return Buffer.from(`\uFEFF${conteudo}`, 'utf8')
  },

  async gerarXlsx(linhas: LinhaPlanilha[], nomeAba: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'AgroFlow'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet(nomeAba.slice(0, 31))
    const colunas = linhas.length > 0 ? Object.keys(linhas[0]) : ['Sem dados']

    worksheet.columns = colunas.map(cabecalho => ({
      header: cabecalho,
      key: cabecalho,
      width: Math.max(15, Math.min(40, cabecalho.length + 4)),
    }))

    linhas.forEach(linha => {
      worksheet.addRow(
        Object.fromEntries(
          colunas.map(coluna => [coluna, protegerCelula(linha[coluna] ?? '')])
        )
      )
    })

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F5F36' },
    }
    worksheet.views = [{ state: 'frozen', ySplit: 1 }]
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: Math.max(1, worksheet.rowCount), column: colunas.length },
    }

    const arquivo = await workbook.xlsx.writeBuffer()
    return Buffer.from(arquivo)
  },

  async gerarArquivo(
    tipo: TipoRelatorioExportacao,
    formato: FormatoRelatorioExportacao,
    dataInicio?: Date,
    dataFim?: Date,
    retiroId?: UUID
  ): Promise<Buffer> {
    const linhas = await RelatorioService.obterLinhasExportacao(tipo, dataInicio, dataFim, retiroId)

    if (formato === 'csv') {
      return RelatorioService.gerarCsv(linhas)
    }

    return RelatorioService.gerarXlsx(linhas, tipo)
  },

  // RN07: Gerar relatório semanal
  // Exporta movimentações dos últimos 7 dias em formato de planilha
  async gerarRelatorioSemanal(retiroId?: UUID): Promise<LinhaPlanilha[]> {
    const dataFim = new Date()
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - 7)

    return RelatorioService.formatarRelatorioMovimentacoes(dataInicio, dataFim, retiroId)
  },

  // RN07: Gerar relatório mensal
  // Exporta movimentações dos últimos 30 dias em formato de planilha
  async gerarRelatorioMensal(retiroId?: UUID): Promise<LinhaPlanilha[]> {
    const dataFim = new Date()
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - 30)

    return RelatorioService.formatarRelatorioMovimentacoes(dataInicio, dataFim, retiroId)
  },
}
