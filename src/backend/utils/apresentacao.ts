// Camada de APRESENTAÇÃO: converte os registros crus do banco (com FKs e enums)
// no formato de exibição que as telas EJS consomem (nome do retiro, nome do
// capataz/supervisor, rótulos de prioridade, tempo relativo, etc.).
//
// Antes, esses formatos vinham de mocks em memória (src/backend/data/*). Agora
// o banco é a fonte ÚNICA: o que o capataz cria aparece para o supervisor e no
// relatório porque todos leem do mesmo lugar. Estas funções só formatam.

import { Request } from 'express'
import { RetiroRepository } from '../repositories/retiro.repository'
import { UsuarioService } from '../services/usuario.service'
import { Ticket, TicketCategoria, TicketPrioridade } from '../models/ticket.model'
import { Movimentacao, MovimentacaoTipo } from '../models/movimentacao.model'
import { Tarefa, TarefaPrioridade, TarefaStatus } from '../models/tarefa.model'
import { UUID } from '../models/uuid'

// Mapas id → nome, carregados uma vez por request, para resolver as FKs.
export interface ContextoApresentacao {
  mapaRetiro: Map<string, string>
  mapaUsuario: Map<string, string>
  nomeUsuario: string
  primeiroNomeUsuario: string
}

// Carrega retiros e usuários do banco e monta os mapas de id → nome, além do
// nome do usuário logado (o JWT só guarda id/cargo/retiro, não o nome).
export async function carregarContexto(req: Request): Promise<ContextoApresentacao> {
  const [retiros, usuarios] = await Promise.all([
    RetiroRepository.buscarTodos(),
    UsuarioService.listarTodos(),
  ])

  const mapaRetiro = new Map(retiros.map(r => [String(r.id), r.nome]))
  const mapaUsuario = new Map(usuarios.map(u => [String(u.id), u.nome]))

  const nomeUsuario = mapaUsuario.get(String(req.usuario?.id ?? '')) ?? 'Usuário'
  const primeiroNomeUsuario = nomeUsuario.split(' ')[0]

  return { mapaRetiro, mapaUsuario, nomeUsuario, primeiroNomeUsuario }
}

export function nomeRetiro(ctx: ContextoApresentacao, retiroId: UUID | null): string {
  if (!retiroId) return ''
  return ctx.mapaRetiro.get(String(retiroId)) ?? ''
}

export function nomeUsuarioPorId(ctx: ContextoApresentacao, usuarioId: UUID | null): string {
  if (!usuarioId) return ''
  return ctx.mapaUsuario.get(String(usuarioId)) ?? ''
}

// ── Helpers de tempo ───────────────────────────────────────────────────────

// "há 1h", "há 2 dias", "agora" — usado nas listas para indicar quando o
// capataz registrou/enviou o item.
export function tempoRelativo(data: Date | string | null): string {
  if (!data) return ''
  const quando = new Date(data)
  const segundos = Math.floor((Date.now() - quando.getTime()) / 1000)
  if (Number.isNaN(segundos)) return ''
  if (segundos < 60) return 'agora'
  const minutos = Math.floor(segundos / 60)
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `há ${horas}h`
  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'há 1 dia' : `há ${dias} dias`
}

// "DD/MM/AAAA HH:MM" — usado em "Validado em ...".
export function dataHora(data: Date | string | null): string {
  if (!data) return ''
  const d = new Date(data)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ── Prioridade / severidade ──────────────────────────────────────────────

const PRIORIDADE_LABEL: Record<TicketPrioridade, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

const PRIORIDADE_BADGE: Record<TicketPrioridade, string> = {
  alta: 'badge--red-soft',
  media: 'badge--yellow',
  baixa: 'badge--blue',
}

export function rotuloPrioridade(prioridade: TicketPrioridade): string {
  return PRIORIDADE_LABEL[prioridade] ?? 'Média'
}

export function badgePrioridade(prioridade: TicketPrioridade): string {
  return PRIORIDADE_BADGE[prioridade] ?? 'badge--yellow'
}

// ── Ticket ─────────────────────────────────────────────────────────────────

const CATEGORIA_TICKET_LABEL: Record<TicketCategoria, string> = {
  cerca: 'Cerca',
  hidraulica: 'Hidráulica',
  eletrica: 'Elétrica',
  edificacao: 'Edificação',
  abastecimento_agua: 'Abastecimento de água',
  outro: 'Outro',
}

export interface TicketExibicao {
  id: UUID
  nome: string
  retiro: string
  quando: string
  severidade: string
  sevClasse: string
  badgeClasse: string
  evidencia: string
  evidenciaTexto: string
  descricao: string
  capataz: string
  supervisor: string
  dataValidacao: string
}

// Título amigável do ticket a partir da categoria (o banco não guarda "nome").
function tituloTicket(t: Ticket): string {
  if (t.categoria === 'outro') {
    return t.categoria_outro?.trim() || 'Outro'
  }
  return CATEGORIA_TICKET_LABEL[t.categoria] ?? 'Ticket'
}

export function ticketParaExibicao(t: Ticket, ctx: ContextoApresentacao): TicketExibicao {
  return {
    id: t.id,
    nome: tituloTicket(t),
    retiro: nomeRetiro(ctx, t.retiro_id),
    quando: tempoRelativo(t.data_criacao),
    severidade: rotuloPrioridade(t.prioridade),
    sevClasse: t.prioridade,
    badgeClasse: badgePrioridade(t.prioridade),
    // Evidência do ticket é capturada no registro do capataz; aqui não fazemos
    // join por ser apenas cosmético na lista. Mantemos vazio (a tela mostra "—").
    evidencia: '',
    evidenciaTexto: '',
    descricao: t.descricao,
    capataz: nomeUsuarioPorId(ctx, t.aberto_por),
    supervisor: nomeUsuarioPorId(ctx, t.aprovado_por),
    dataValidacao: t.status === 'aprovado' ? dataHora(t.data_realizado) : '',
  }
}

// ── Movimentação ─────────────────────────────────────────────────────────

const TIPO_MOV_LABEL: Record<MovimentacaoTipo, string> = {
  nascimento: 'Nascimento',
  morte: 'Morte',
  transferencia: 'Transferência',
  compra: 'Compra',
  venda: 'Venda',
  outros: 'Outros',
}

const TIPO_MOV_BADGE: Record<MovimentacaoTipo, string> = {
  nascimento: 'badge--green',
  morte: 'badge--red-soft',
  transferencia: 'badge--blue',
  compra: 'badge--green',
  venda: 'badge--yellow',
  outros: 'badge--blue',
}

export interface MovimentacaoExibicao {
  id: UUID
  tipo: string
  retiro: string
  origem: string
  destino: string
  local: string
  quantidade: number | null
  quantidadeRotulo: string
  estagio: string
  causaObito: string
  evidencia: string
  evidenciaTexto: string
  enviado: string
  badgeClasse: string
  detalhes: string
  capataz: string
  supervisor: string
  dataValidacao: string
}

// "BEZERRO 0 A 7 MESES" → "Bezerro 0 a 7 meses".
function formatarEstagio(estagio: string | null): string {
  if (!estagio) return ''
  const texto = String(estagio).toLowerCase()
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function montarDetalhesMov(m: Movimentacao, estagio: string): string {
  const partes: string[] = []
  if (m.tipo === 'transferencia') {
    if (m.origem) partes.push(`Origem: ${m.origem}`)
    if (m.destino) partes.push(`Destino: ${m.destino}`)
  }
  if (estagio) partes.push(`Estágio: ${estagio}`)
  if (m.causa_obito) partes.push(`Causa do óbito: ${m.causa_obito}`)
  return partes.join(' · ')
}

// ── Tarefa ───────────────────────────────────────────────────────────────

const COR_PRIORIDADE: Record<TarefaPrioridade, string> = {
  alta: 'var(--alerta)',
  media: '#f0ad00',
  baixa: 'var(--sucesso)',
}

export interface TarefaExibicao {
  id: UUID
  titulo: string
  retiro: string
  capataz: string
  supervisor: string
  prioridade: TarefaPrioridade
  status: TarefaStatus
  statusFiltro: 'pendente' | 'concluida'
  statusRotulo: string
  nivel: string
  classe: string
  cor: string
  prazo: string
  categoria: string
  data: string
  descricao: string
  autor: string
  enviado: string
}

export function tarefaParaExibicao(t: Tarefa, ctx: ContextoApresentacao): TarefaExibicao {
  // O título da atividade é guardado em `categoria` (o delegar envia o título
  // ali); `descricao` guarda os detalhes. Ciclo: pendente → concluido → aprovado.
  const concluida = t.status === 'concluido' || t.status === 'aprovado'
  const supervisor = nomeUsuarioPorId(ctx, t.criada_por)
  const dataCurta = t.data_criacao
    ? new Date(t.data_criacao).toLocaleDateString('pt-BR')
    : ''

  let nivel: string
  if (t.status === 'aprovado') nivel = 'Validada'
  else if (t.status === 'concluido') nivel = 'Concluída'
  else nivel = rotuloPrioridade(t.prioridade)

  let statusRotulo: string
  if (t.status === 'aprovado') statusRotulo = 'Validada'
  else if (t.status === 'concluido') statusRotulo = 'Concluída'
  else statusRotulo = 'Pendente'

  return {
    id: t.id,
    titulo: t.categoria,
    retiro: nomeRetiro(ctx, t.retiro_id),
    capataz: nomeUsuarioPorId(ctx, t.atribuida_a),
    supervisor,
    prioridade: t.prioridade,
    status: t.status,
    statusFiltro: t.status === 'pendente' ? 'pendente' : 'concluida',
    statusRotulo,
    nivel,
    classe: concluida ? 'concluida' : t.prioridade,
    cor: concluida ? 'var(--primaria)' : (COR_PRIORIDADE[t.prioridade] ?? '#f0ad00'),
    prazo: dataCurta,
    categoria: t.categoria,
    data: dataCurta,
    descricao: t.descricao,
    autor: `Criada por ${supervisor || 'Supervisor'}`,
    enviado: tempoRelativo(t.data_criacao),
  }
}

export function movimentacaoParaExibicao(m: Movimentacao, ctx: ContextoApresentacao): MovimentacaoExibicao {
  const tipo = TIPO_MOV_LABEL[m.tipo] ?? 'Movimentação'
  const retiro = nomeRetiro(ctx, m.retiro_id)
  const local = m.tipo === 'transferencia'
    ? `${m.origem ?? ''} → ${m.destino ?? ''}`
    : retiro
  const estagio = formatarEstagio(m.estagio_vida)
  const quantidade = m.quantidade ?? null

  return {
    id: m.id,
    tipo,
    retiro,
    origem: m.origem ?? '',
    destino: m.destino ?? '',
    local,
    quantidade,
    quantidadeRotulo: quantidade === null ? '—' : `${quantidade} ${quantidade === 1 ? 'animal' : 'animais'}`,
    estagio,
    causaObito: m.causa_obito ?? '',
    evidencia: '',
    evidenciaTexto: '',
    enviado: tempoRelativo(m.data_criacao),
    badgeClasse: TIPO_MOV_BADGE[m.tipo] ?? 'badge--blue',
    detalhes: montarDetalhesMov(m, estagio),
    capataz: nomeUsuarioPorId(ctx, m.capataz_id),
    supervisor: nomeUsuarioPorId(ctx, m.validado_por),
    dataValidacao: m.status === 'validado' ? dataHora(m.data_validacao) : '',
  }
}

// ── Relatório ──────────────────────────────────────────────────────────────
// Monta os datasets prontos para a tela de relatórios a partir dos registros
// já validados/aprovados do banco (a mesma fonte das telas). Como tudo aqui já
// passou pela validação do supervisor, o status na planilha é sempre "Validado".

export interface LinhaRelatorio {
  celulas: string[]
  status: 'Pendente' | 'Validado'
}

export interface DatasetRelatorio {
  colunas: string[]
  linhas: LinhaRelatorio[]
  resumo: { total: number; validados: number; pendentes: number; retiros: number; periodo: string }
}

function resumirRelatorio(linhas: LinhaRelatorio[], retiros: string[], periodo: string) {
  const validados = linhas.filter((l) => l.status === 'Validado').length
  return {
    total: linhas.length,
    validados,
    pendentes: linhas.length - validados,
    retiros: new Set(retiros.filter(Boolean)).size,
    periodo,
  }
}

export function montarRelatorio(
  ctx: ContextoApresentacao,
  tickets: Ticket[],
  tarefas: Tarefa[],
  movimentacoes: Movimentacao[]
): Record<'tarefas' | 'tickets' | 'movimentacoes', DatasetRelatorio> {
  const linhasTarefas: LinhaRelatorio[] = tarefas.map((t) => {
    const e = tarefaParaExibicao(t, ctx)
    return { celulas: [e.data, e.retiro, e.titulo, rotuloPrioridade(t.prioridade)], status: 'Validado' }
  })
  const linhasTickets: LinhaRelatorio[] = tickets.map((t) => {
    const e = ticketParaExibicao(t, ctx)
    return { celulas: [e.dataValidacao || e.quando, e.retiro, e.nome, e.severidade], status: 'Validado' }
  })
  const linhasMov: LinhaRelatorio[] = movimentacoes.map((m) => {
    const e = movimentacaoParaExibicao(m, ctx)
    return {
      celulas: [e.dataValidacao || '—', e.local, e.tipo, e.quantidade === null ? '—' : String(e.quantidade)],
      status: 'Validado',
    }
  })

  return {
    tarefas: {
      colunas: ['Data', 'Retiro', 'Tarefa', 'Prioridade', 'Status'],
      linhas: linhasTarefas,
      resumo: resumirRelatorio(linhasTarefas, tarefas.map((t) => nomeRetiro(ctx, t.retiro_id)), 'Tarefas validadas'),
    },
    tickets: {
      colunas: ['Quando', 'Retiro', 'Ticket', 'Severidade', 'Status'],
      linhas: linhasTickets,
      resumo: resumirRelatorio(linhasTickets, tickets.map((t) => nomeRetiro(ctx, t.retiro_id)), 'Tickets aprovados'),
    },
    movimentacoes: {
      colunas: ['Data', 'Retiro / Trajeto', 'Tipo', 'Qtd.', 'Status'],
      linhas: linhasMov,
      resumo: resumirRelatorio(linhasMov, movimentacoes.map((m) => nomeRetiro(ctx, m.retiro_id)), 'Movimentações validadas'),
    },
  }
}
