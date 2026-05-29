import { Movimentacao, MovimentacaoInput, MovimentacaoTipo, MovimentacaoStatus } from '../models/movimentacao.model'
import { MovimentacaoRepository } from '../repositories/movimentacao.repository'

export const MovimentacaoService = {
  // RN01: valida os campos obrigatorios antes de persistir.
  validarCamposObrigatorios(dados: MovimentacaoInput): void {
    if (!dados.capataz_id) {
      throw new Error('Campo "capataz_id" e obrigatorio')
    }

    if (!dados.estagio_vida) {
      throw new Error('Campo "estagio_vida" e obrigatorio')
    }

    if (dados.tipo === 'compra' || dados.tipo === 'venda') {
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
        throw new Error('Campo "causa_obito" e obrigatorio para movimentacoes do tipo "morte"')
      }
    }
  },

  validarOrigem(origem: MovimentacaoInput['origem']): void {
    if (!origem) {
      throw new Error('Campo "origem" e obrigatorio')
    }
  },

  validarDestino(destino: MovimentacaoInput['destino']): void {
    if (!destino) {
      throw new Error('Campo "destino" e obrigatorio')
    }
  },

  validarQuantidade(quantidade: MovimentacaoInput['quantidade']): void {
    if (!quantidade || quantidade <= 0) {
      throw new Error('Campo "quantidade" e obrigatorio e deve ser maior que zero')
    }
  },

  // RN03: cria movimentacao no modo offline ou online.
  // O valor de sincronizado segue o dado recebido, mas padrao continua false.
  async criar(dados: Omit<MovimentacaoInput, 'data_criacao' | 'status' | 'validado_por'>): Promise<Movimentacao> {
    this.validarCamposObrigatorios(dados as MovimentacaoInput)

    const movimentacao = await MovimentacaoRepository.criar({
      ...dados,
      status: 'pendente',
      sincronizado: dados.sincronizado ?? false,
      validado_por: null,
    } as MovimentacaoInput)

    return movimentacao
  },

  // Recebe uma movimentacao que veio do fluxo de sincronizacao.
  // Nesse caso o registro ja chega pronto e deve ser gravado como sincronizado.
  async sincronizarRecebida(dados: Omit<MovimentacaoInput, 'data_criacao' | 'status' | 'validado_por' | 'sincronizado'>): Promise<Movimentacao> {
    this.validarCamposObrigatorios({
      ...dados,
      status: 'pendente',
      sincronizado: true,
      validado_por: null,
    } as MovimentacaoInput)

    return MovimentacaoRepository.criar({
      ...dados,
      status: 'pendente',
      sincronizado: true,
      validado_por: null,
    } as MovimentacaoInput)
  },

  // RN09: filtra por retiro, tipo, status e periodo.
  // O periodo eh aplicado sobre data_criacao para refletir a janela do registro.
  async filtrar(
    retiroId: number,
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

  // RN07: relatorio usa apenas dados sincronizados e validados.
  async buscarParaRelatorio(retiroId?: number): Promise<Movimentacao[]> {
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
  async buscarParaDashboard(retiroId?: number): Promise<Movimentacao[]> {
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
  async sincronizar(movimentacaoId: number): Promise<Movimentacao | null> {
    const movimentacao = await MovimentacaoRepository.buscarPorId(movimentacaoId)

    if (!movimentacao) {
      return null
    }

    return MovimentacaoRepository.atualizar(movimentacaoId, {
      sincronizado: true,
    })
  },

  async buscarPorId(id: number): Promise<Movimentacao | null> {
    return MovimentacaoRepository.buscarPorId(id)
  },

  async listarTodas(): Promise<Movimentacao[]> {
    return MovimentacaoRepository.buscarTodos()
  },

  async listarPendentes(retiroId?: number): Promise<Movimentacao[]> {
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

  async contarPorTipo(retiroId?: number): Promise<Record<MovimentacaoTipo, number>> {
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

  async atualizar(id: number, dados: Partial<MovimentacaoInput>): Promise<Movimentacao | null> {
    // Quando algum campo estrutural muda, os detalhes da movimentacao tambem precisam ser refeitos.
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

  async remover(id: number): Promise<void> {
    await MovimentacaoRepository.remover(id)
  },
}
