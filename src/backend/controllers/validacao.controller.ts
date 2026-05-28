import { Request, Response } from 'express'
import { ValidacaoService } from '../services/validacao.service'

function parseNumber(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export const ValidacaoController = {
  async podeValidar(req: Request, res: Response) {
    try {
      const { usuario } = req.body

      if (!usuario) {
        return res.status(400).json({ error: 'Campo "usuario" é obrigatório' })
      }

      const podeValidar = ValidacaoService.podeValidar(usuario)

      return res.status(200).json({ podeValidar })
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao verificar permissão de validação',
      })
    }
  },

  // RN06: Aprova uma movimentação pendente — apenas supervisor
  async aprovarMovimentacao(req: Request, res: Response) {
    try {
      const movimentacaoId = parseNumber(req.params.id)
      const { supervisorId, supervisorCargo } = req.body

      if (movimentacaoId === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!supervisorId || !supervisorCargo) {
        return res.status(400).json({
          error: 'Campos "supervisorId" e "supervisorCargo" são obrigatórios',
        })
      }

      const resultado = await ValidacaoService.aprovarMovimentacao(
        movimentacaoId,
        String(supervisorId),
        String(supervisorCargo)
      )

      return res.status(resultado.sucesso ? 200 : 400).json(resultado)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao aprovar movimentação',
      })
    }
  },

  // RN06: Rejeita uma movimentação pendente — apenas supervisor
  async rejeitarMovimentacao(req: Request, res: Response) {
    try {
      const movimentacaoId = parseNumber(req.params.id)
      const { supervisorId, supervisorCargo } = req.body

      if (movimentacaoId === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!supervisorId || !supervisorCargo) {
        return res.status(400).json({
          error: 'Campos "supervisorId" e "supervisorCargo" são obrigatórios',
        })
      }

      const resultado = await ValidacaoService.rejeitarMovimentacao(
        movimentacaoId,
        String(supervisorId),
        String(supervisorCargo)
      )

      return res.status(resultado.sucesso ? 200 : 400).json(resultado)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao rejeitar movimentação',
      })
    }
  },

  // RN06: Aprova um ticket pendente — apenas supervisor
  async aprovarTicket(req: Request, res: Response) {
    try {
      const ticketId = parseNumber(req.params.id)
      const { supervisorId, supervisorCargo } = req.body

      if (ticketId === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!supervisorId || !supervisorCargo) {
        return res.status(400).json({ error: 'Campos "supervisorId" e "supervisorCargo" são obrigatórios' })
      }

      const resultado = await ValidacaoService.aprovarTicket(
        ticketId,
        String(supervisorId),
        String(supervisorCargo)
      )

      return res.status(resultado.sucesso ? 200 : 400).json(resultado)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao aprovar ticket',
      })
    }
  },

  // RN06: Aprova uma tarefa pendente — apenas supervisor
  async aprovarTarefa(req: Request, res: Response) {
    try {
      const tarefaId = parseNumber(req.params.id)
      const { supervisorId, supervisorCargo } = req.body

      if (tarefaId === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!supervisorId || !supervisorCargo) {
        return res.status(400).json({ error: 'Campos "supervisorId" e "supervisorCargo" são obrigatórios' })
      }

      const resultado = await ValidacaoService.aprovarTarefa(
        tarefaId,
        String(supervisorId),
        String(supervisorCargo)
      )

      return res.status(resultado.sucesso ? 200 : 400).json(resultado)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao aprovar tarefa',
      })
    }
  },
}
