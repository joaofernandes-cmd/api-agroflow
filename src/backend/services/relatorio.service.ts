import { SincronizacaoService } from './sincronizacao.service'
import { Movimentacao } from '../models/movimentacao.model'
import { Tarefa } from '../models/tarefa.model'
import { UUID } from '../models/uuid'

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
  ): Promise<Array<Record<string, string | number>>> {
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

  // RN07: Gerar relatório semanal
  // Exporta movimentações dos últimos 7 dias em formato de planilha
  async gerarRelatorioSemanal(retiroId?: UUID): Promise<Array<Record<string, string | number>>> {
    const dataFim = new Date()
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - 7)

    return RelatorioService.formatarRelatorioMovimentacoes(dataInicio, dataFim, retiroId)
  },

  // RN07: Gerar relatório mensal
  // Exporta movimentações dos últimos 30 dias em formato de planilha
  async gerarRelatorioMensal(retiroId?: UUID): Promise<Array<Record<string, string | number>>> {
    const dataFim = new Date()
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - 30)

    return RelatorioService.formatarRelatorioMovimentacoes(dataInicio, dataFim, retiroId)
  },
}
