import {
  Movimentacao,
  MovimentacaoInput,
  MovimentacaoTipo,
  MovimentacaoStatus,
  MovimentacaoEvidenciaInput,
} from '../models/movimentacao.model'
import { MovimentacaoRepository } from '../repositories/movimentacao.repository'
import { EvidenciaService } from './evidencia.service'
import { EvidenciaMovimentacaoRepository } from '../repositories/evidencia-movimentacao.repository'
import { UUID } from '../models/uuid'

export const MovimentacaoService = {
  // RN01: valida os campos obrigatórios antes de persistir.
  validarCamposObrigatorios(dados: MovimentacaoInput): void {
    if (!dados.capataz_id) {
      throw new Error('Campo "capataz_id" é obrigatório')
    }

    if (!dados.estagio_vida) {
      throw new Error('Campo "estagio_vida" é obrigatório')
    }

    if (dados.tipo === 'compra') {
      this.validarDestino(dados.destino)
      this.validarQuantidade(dados.quantidade)
    }

    if (dados.tipo === 'venda') {
      this.validarOrigem(dados.origem)
      this.validarQuantidade(dados.quantidade)
    }

    if (dados.tipo === 'transferencia') {
      this.validarOrigem(dados.origem)
      this.validarDestino(dados.destino)
      this.validarQuantidade(dados.quantidade)
    }

    if (dados.tipo === 'nascimento') {
      this.validarOrigem(dados.origem)
      this.validarQuantidade(dados.quantidade)
    }

    if (dados.tipo === 'morte') {
      this.validarOrigem(dados.origem)

      if (!dados.causa_obito) {
        throw new Error('Campo "causa_obito" é obrigatório para movimentações do tipo "morte"')
      }
    }
  },

  validarOrigem(origem: MovimentacaoInput['origem']): void {
    if (!origem) {
      throw new Error('Campo "origem" é obrigatório')
    }
  },

  validarDestino(destino: MovimentacaoInput['destino']): void {
    if (!destino) {
      throw new Error('Campo "destino" é obrigatório')
    }
  },

  validarQuantidade(quantidade: MovimentacaoInput['quantidade']): void {
    if (!quantidade || quantidade <= 0) {
      throw new Error('Campo "quantidade" é obrigatório e deve ser maior que zero')
    }
  },

  validarEvidencia(dados?: MovimentacaoEvidenciaInput): void {
    if (!dados) {
      return
    }

    if (dados.tipo === 'mensagem') {
      EvidenciaService.validarEvidenciaDescritiva('mensagem', { conteudo: dados.conteudo })
      return
    }

    if (dados.tipo === 'audio') {
      if (!dados.urlArquivo) {
        throw new Error('Campo "urlArquivo" é obrigatório para evidências de áudio')
      }

      EvidenciaService.validarEvidenciaDescritiva('audio', { duracao: dados.duracao })
      return
    }

    if (dados.tipo === 'foto') {
      if (!dados.urlArquivo) {
        throw new Error('Campo "urlArquivo" é obrigatório para evidências de foto')
      }

      if (dados.latitude === undefined || dados.longitude === undefined) {
        throw new Error('Foto rejeitada: georreferenciamento inválido ou ausente. A imagem deve ter coordenadas GPS nos metadados EXIF')
      }

      EvidenciaService.validarGeorreferenciamento(dados.latitude, dados.longitude)
    }
  },

  async criarEvidenciaAssociada(movimentacaoId: UUID, capatazId: UUID, evidencia?: MovimentacaoEvidenciaInput): Promise<void> {
    if (!evidencia) {
      return
    }

    if (evidencia.tipo === 'mensagem') {
      const criada = await EvidenciaService.criarMensagem(capatazId as any, evidencia.conteudo ?? '')
      await EvidenciaMovimentacaoRepository.criar({
        evidencia_id: criada.evidencia.id,
        movimentacao_id: movimentacaoId,
      })
      return
    }

    if (evidencia.tipo === 'audio') {
      const criada = await EvidenciaService.criarAudio(
        capatazId as any,
        evidencia.urlArquivo ?? '',
        Number(evidencia.duracao)
      )
      await EvidenciaMovimentacaoRepository.criar({
        evidencia_id: criada.evidencia.id,
        movimentacao_id: movimentacaoId,
      })
      return
    }

    if (evidencia.tipo === 'foto') {
      const criada = await EvidenciaService.criarFoto(
        capatazId as any,
        evidencia.urlArquivo ?? '',
        Number(evidencia.latitude),
        Number(evidencia.longitude)
      )
      await EvidenciaMovimentacaoRepository.criar({
        evidencia_id: criada.evidencia.id,
        movimentacao_id: movimentacaoId,
      })
    }
  },

  // RN03: cria movimentação no modo offline ou online.
  // O valor de sincronizado segue o dado recebido, mas padrão continua false.
  async criar(dados: Omit<MovimentacaoInput, 'data_criacao' | 'status' | 'validado_por'>): Promise<Movimentacao> {
    this.validarCamposObrigatorios(dados as MovimentacaoInput)
    this.validarEvidencia(dados.evidencia)

    const movimentacao = await MovimentacaoRepository.criar({
      ...dados,
      status: 'pendente',
      sincronizado: dados.sincronizado ?? false,
      validado_por: null,
    } as MovimentacaoInput)

    await this.criarEvidenciaAssociada(movimentacao.id, dados.capataz_id, dados.evidencia)

    return movimentacao
  },

  // Recebe uma movimentação que veio do fluxo de sincronização.
  // Nesse caso o registro já chega pronto e deve ser gravado como sincronizado.
  async sincronizarRecebida(dados: Omit<MovimentacaoInput, 'data_criacao' | 'status' | 'validado_por' | 'sincronizado'>): Promise<Movimentacao> {
    this.validarCamposObrigatorios({
      ...dados,
      status: 'pendente',
      sincronizado: true,
      validado_por: null,
    } as MovimentacaoInput)
    this.validarEvidencia(dados.evidencia)

    const movimentacao = await MovimentacaoRepository.criar({
      ...dados,
      status: 'pendente',
      sincronizado: true,
      validado_por: null,
    } as MovimentacaoInput)

    await this.criarEvidenciaAssociada(movimentacao.id, dados.capataz_id, dados.evidencia)

    return movimentacao
  },

  // RN09: filtra por retiro, tipo, status e periodo.
  // O período é aplicado sobre data_criacao para refletir a janela do registro.
  async filtrar(
    retiroId: UUID,
    tipos?: MovimentacaoTipo[],
    status?: MovimentacaoStatus[],
    dataInicio?: Date,
    dataFim?: Date
  ): Promise<Movimentacao[]> {
    const todasMovimentacoes = await MovimentacaoRepository.buscarTodos()

    return todasMovimentacoes.filter(m => {
      if (m.retiro_id !== retiroId) {
        return false
      }

      if (tipos && tipos.length > 0 && !tipos.includes(m.tipo)) {
        return false
      }

      if (status && status.length > 0 && !status.includes(m.status)) {
        return false
      }

      const dataCriacao = new Date(m.data_criacao)

      if (dataInicio && dataCriacao < dataInicio) {
        return false
      }

      if (dataFim && dataCriacao > dataFim) {
        return false
      }

      return true
    })
  },

  // RN07: relatório usa apenas dados sincronizados e validados.
  async buscarParaRelatorio(retiroId?: UUID): Promise<Movimentacao[]> {
    const movimentacoes = await MovimentacaoRepository.buscarTodos()

    return movimentacoes.filter(m => {
      if (!m.sincronizado) {
        return false
      }

      if (m.status !== 'validado') {
        return false
      }

      if (retiroId && m.retiro_id !== retiroId) {
        return false
      }

      return true
    })
  },

  // RN10: dashboard tambem opera apenas com registros validados e sincronizados.
  async buscarParaDashboard(retiroId?: UUID): Promise<Movimentacao[]> {
    const movimentacoes = await MovimentacaoRepository.buscarTodos()

    return movimentacoes.filter(m => {
      if (!m.sincronizado) {
        return false
      }

      if (m.status !== 'validado') {
        return false
      }

      if (retiroId && m.retiro_id !== retiroId) {
        return false
      }

      return true
    })
  },

  // RN03: sincroniza um registro pendente marcando-o como enviado.
  async sincronizar(movimentacaoId: UUID): Promise<Movimentacao | null> {
    const movimentacao = await MovimentacaoRepository.buscarPorId(movimentacaoId)

    if (!movimentacao) {
      return null
    }

    return MovimentacaoRepository.atualizar(movimentacaoId, {
      sincronizado: true,
    })
  },

  async buscarPorId(id: UUID): Promise<Movimentacao | null> {
    return MovimentacaoRepository.buscarPorId(id)
  },

  async listarTodas(): Promise<Movimentacao[]> {
    return MovimentacaoRepository.buscarTodos()
  },

  async listarPendentes(retiroId?: UUID): Promise<Movimentacao[]> {
    const movimentacoes = await MovimentacaoRepository.buscarTodos()

    return movimentacoes.filter(m => {
      if (m.status !== 'pendente') {
        return false
      }

      if (retiroId && m.retiro_id !== retiroId) {
        return false
      }

      return true
    })
  },

  async contarPorTipo(retiroId?: UUID): Promise<Record<MovimentacaoTipo, number>> {
    const movimentacoes = await this.buscarParaDashboard(retiroId)

    const contagem: Record<MovimentacaoTipo, number> = {
      nascimento: 0,
      morte: 0,
      transferencia: 0,
      compra: 0,
      venda: 0,
      outros: 0,
    }

    movimentacoes.forEach(m => {
      contagem[m.tipo]++
    })

    return contagem
  },

  async atualizar(id: UUID, dados: Partial<MovimentacaoInput>): Promise<Movimentacao | null> {
    // Quando algum campo estrutural muda, os detalhes da movimentação também precisam ser refeitos.
    if (
      dados.tipo ||
      dados.origem !== undefined ||
      dados.destino !== undefined ||
      dados.quantidade !== undefined ||
      dados.causa_obito !== undefined ||
      dados.estagio_vida
    ) {
      const movimentacaoAtual = await MovimentacaoRepository.buscarPorId(id)
      if (!movimentacaoAtual) {
        return null
      }

      const dadosCompletos = {
        ...movimentacaoAtual,
        ...dados,
      } as MovimentacaoInput

      this.validarCamposObrigatorios(dadosCompletos)
    }

    return MovimentacaoRepository.atualizar(id, dados)
  },

  async remover(id: UUID): Promise<void> {
    await MovimentacaoRepository.remover(id)
  },
}
