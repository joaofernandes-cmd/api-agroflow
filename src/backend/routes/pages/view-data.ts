import { Request } from 'express'
import { Movimentacao } from '../../models/movimentacao.model'
import { UUID } from '../../models/uuid'
import { EvidenciaService } from '../../services/evidencia.service'
import { MovimentacaoService } from '../../services/movimentacao.service'
import { TarefaService } from '../../services/tarefa.service'
import { TicketService } from '../../services/ticket.service'
import {
  carregarContexto,
  montarRelatorio,
  movimentacaoParaExibicao,
} from '../../utils/apresentacao'

export type ContextoApresentacao = Awaited<ReturnType<typeof carregarContexto>>

export async function carregarRelatorio(req: Request, retiroId?: UUID | UUID[]) {
  const ctx = await carregarContexto(req)
  const [tickets, tarefas, movimentacoes] = await Promise.all([
    TicketService.listarPorStatus('aprovado', retiroId),
    TarefaService.listarPorStatus('aprovado', retiroId),
    MovimentacaoService.buscarParaRelatorio(retiroId),
  ])

  return { ctx, relatorio: montarRelatorio(ctx, tickets, tarefas, movimentacoes) }
}

export async function movimentacaoParaExibicaoComEvidencia(
  movimentacao: Movimentacao,
  ctx: ContextoApresentacao
) {
  const exibicao = movimentacaoParaExibicao(movimentacao, ctx)
  const [evidencia] = await EvidenciaService.buscarPorMovimentacao(movimentacao.id)

  if (!evidencia) {
    return exibicao
  }

  const rotulos = {
    mensagem: 'Texto',
    foto: 'Foto',
    audio: 'Áudio',
  } as const

  return {
    ...exibicao,
    evidencia: rotulos[evidencia.tipo] ?? '',
    evidenciaTexto: evidencia.conteudo ?? '',
    evidenciaUrl: evidencia.url_arquivo ?? '',
  }
}
