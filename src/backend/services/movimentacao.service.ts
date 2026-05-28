import { Movimentacao, MovimentacaoInput, MovimentacaoTipo, MovimentacaoStatus } from '../models/movimentacao.model'
import { MovimentacaoRepository } from '../repositories/movimentacao.repository'
import { Usuario } from '../models/usuario.model'
import { UsuarioService } from './usuario.service'

export const MovimentacaoService = {
  // RN01: Validar campos obrigatórios antes de criar
  validarCamposObrigatorios(dados: MovimentacaoInput): void {
    if (!dados.capataz_id) {
      throw new Error('Campo "capataz_id" é obrigatório')
    }

    if (!dados.origem) {
      throw new Error('Campo "origem" é obrigatório')
    }

    if (!dados.destino) {
      throw new Error('Campo "destino" é obrigatório')
    }

    if (!dados.quantidade || dados.quantidade <= 0) {
      throw new Error('Campo "quantidade" é obrigatório e deve ser maior que zero')
    }

    if (!dados.estagio_vida) {
      throw new Error('Campo "estagio_vida" é obrigatório')
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

  // RN03: Criar movimentação com flag sincronizado = false no modo offline
  // data_criacao é gerada automaticamente pelo sistema (timestamp)
  // Sincronização será disparada automaticamente quando houver conexão
  // Nota: capataz_id é esperado nos dados (deve vir do usuário autenticado para segurança)
  async criar(dados: Omit<MovimentacaoInput, 'data_criacao' | 'status' | 'validado_por'>): Promise<Movimentacao> {
    this.validarCamposObrigatorios(dados as MovimentacaoInput)

    const movimentacao = await MovimentacaoRepository.create({
      ...dados,
      status: 'pendente',
      sincronizado: dados.sincronizado ?? false,
      validado_por: null,
    } as MovimentacaoInput)

    return movimentacao
  },

  // RN06: Apenas Supervisor pode validar/aprovar movimentações
  async validar(id: number, usuario: Usuario, aprovado: boolean): Promise<Movimentacao | null> {
    if (!UsuarioService.podeValidar(usuario)) {
      throw new Error('Apenas Supervisores podem validar movimentações')
    }

    const movimentacao = await MovimentacaoRepository.findById(id)
    if (!movimentacao) {
      return null
    }

    const novoStatus: MovimentacaoStatus = aprovado ? 'aprovado' : 'rejeitado'

    return MovimentacaoRepository.update(id, {
      status: novoStatus,
      validado_por: usuario.id,
      data_validacao: new Date(),
    })
  },

  // RN09: Filtrar movimentações por tipo e status
  // Permite filtro múltiplo para tipo e status, apenas um retiro por vez
  async filtrar(
    retiroId: number,
    tipos?: MovimentacaoTipo[],
    status?: MovimentacaoStatus[]
  ): Promise<Movimentacao[]> {
    const todasMovimentacoes = await MovimentacaoRepository.findAll()

    return todasMovimentacoes.filter(m => {
      // Filtro por retiro (obrigatório)
      if (m.retiro_id !== retiroId) {
        return false
      }

      // Filtro por tipos (opcional)
      if (tipos && tipos.length > 0 && !tipos.includes(m.tipo)) {
        return false
      }

      // Filtro por status (opcional)
      if (status && status.length > 0 && !status.includes(m.status)) {
        return false
      }

      return true
    })
  },

  // RN07: Relatório usa apenas dados sincronizados (sincronizado = true)
  async buscarParaRelatorio(retiroId?: number): Promise<Movimentacao[]> {
    const movimentacoes = await MovimentacaoRepository.findAll()

    return movimentacoes.filter(m => {
      // Apenas dados sincronizados entram no relatório
      if (!m.sincronizado) {
        return false
      }

      // Apenas dados aprovados
      if (m.status !== 'aprovado') {
        return false
      }

      // Filtro opcional por retiro
      if (retiroId && m.retiro_id !== retiroId) {
        return false
      }

      return true
    })
  },

  // RN10: Buscar movimentações para dashboard (apenas aprovadas e sincronizadas)
  async buscarParaDashboard(retiroId?: number): Promise<Movimentacao[]> {
    const movimentacoes = await MovimentacaoRepository.findAll()

    return movimentacoes.filter(m => {
      // Apenas dados sincronizados
      if (!m.sincronizado) {
        return false
      }

      // Apenas dados aprovados
      if (m.status !== 'aprovado') {
        return false
      }

      // Filtro opcional por retiro
      if (retiroId && m.retiro_id !== retiroId) {
        return false
      }

      return true
    })
  },

  // RN03: Sincronizar movimentações offline (flag sincronizado = false)
  async sincronizar(movimentacaoId: number): Promise<Movimentacao | null> {
    const movimentacao = await MovimentacaoRepository.findById(movimentacaoId)

    if (!movimentacao) {
      return null
    }

    // Marcar como sincronizado
    return MovimentacaoRepository.update(movimentacaoId, {
      sincronizado: true,
    })
  },

  // Buscar movimentação por ID
  async buscarPorId(id: number): Promise<Movimentacao | null> {
    return MovimentacaoRepository.findById(id)
  },

  // Listar todas as movimentações
  async listarTodas(): Promise<Movimentacao[]> {
    return MovimentacaoRepository.findAll()
  },

  // Listar movimentações pendentes de validação
  async listarPendentes(retiroId?: number): Promise<Movimentacao[]> {
    const movimentacoes = await MovimentacaoRepository.findAll()

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

  // Contar movimentações por tipo (para dashboard)
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

  // Atualizar movimentação
  async atualizar(id: number, dados: Partial<MovimentacaoInput>): Promise<Movimentacao | null> {
    // Se atualizando campos críticos, revalidar
    if (
      dados.tipo ||
      dados.origem !== undefined ||
      dados.destino !== undefined ||
      dados.quantidade !== undefined ||
      dados.causa_obito !== undefined ||
      dados.estagio_vida
    ) {
      const movimentacaoAtual = await MovimentacaoRepository.findById(id)
      if (!movimentacaoAtual) {
        return null
      }

      const dadosCompletos = {
        ...movimentacaoAtual,
        ...dados,
      } as MovimentacaoInput

      this.validarCamposObrigatorios(dadosCompletos)
    }

    return MovimentacaoRepository.update(id, dados)
  },

  // Remover movimentação
  async remover(id: number): Promise<void> {
    await MovimentacaoRepository.delete(id)
  },
}
