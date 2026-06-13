import { Request, Response } from 'express'
import { converterUUID } from '../models/uuid'
import { ValidacaoService } from '../services/validacao.service'

function statusDoResultado(mensagem: string): number {
  const texto = mensagem.toLowerCase()

  if (texto.includes('não encontrad')) {
    return 404
  }

  if (texto.includes('já foi')) {
    return 409
  }

  return 400
}

export const ValidacaoController = {
  async podeValidar(req: Request, res: Response) {
    try {
      const usuario = req.usuario

      if (!usuario) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const podeValidar = ValidacaoService.podeValidar(usuario)

      return res.status(200).json({ podeValidar })
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao verificar permissão de validação',
      })
    }
  },

  // RN06: Valida uma movimentação pendente — apenas supervisor
  async validarMovimentacao(req: Request, res: Response) {
    try {
      const movimentacaoId = converterUUID(req.params.id)
      const usuario = req.usuario

      if (movimentacaoId === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!usuario) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const resultado = await ValidacaoService.validarMovimentacao(
        movimentacaoId,
        usuario.id,
        usuario.cargo
      )

      return res.status(resultado.sucesso ? 200 : statusDoResultado(resultado.mensagem)).json(resultado)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao validar movimentação',
      })
    }
  },

  // RN06: Aprova um ticket pendente — apenas supervisor
  async aprovarTicket(req: Request, res: Response) {
    try {
      const ticketId = converterUUID(req.params.id)
      const usuario = req.usuario

      if (ticketId === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!usuario) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const resultado = await ValidacaoService.aprovarTicket(
        ticketId,
        usuario.id,
        usuario.cargo
      )

      return res.status(resultado.sucesso ? 200 : statusDoResultado(resultado.mensagem)).json(resultado)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao aprovar ticket',
      })
    }
  },

  // RN06: Aprova uma tarefa pendente — apenas supervisor
  async aprovarTarefa(req: Request, res: Response) {
    try {
      const tarefaId = converterUUID(req.params.id)
      const usuario = req.usuario

      if (tarefaId === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!usuario) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const resultado = await ValidacaoService.aprovarTarefa(
        tarefaId,
        usuario.id,
        usuario.cargo
      )

      return res.status(resultado.sucesso ? 200 : statusDoResultado(resultado.mensagem)).json(resultado)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao aprovar tarefa',
      })
    }
  },
}
