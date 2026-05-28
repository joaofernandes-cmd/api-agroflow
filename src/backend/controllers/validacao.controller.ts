import { Request, Response } from 'express'
import { ValidacaoService } from '../services/validacao.service'

export const ValidacaoController = {
  // RN06: Verifica se o usuário informado tem permissão para validar registros.
  // A regra do service permite somente cargo "supervisor".
  async podeValidar(req: Request, res: Response) {
    try {
      const { usuario } = req.body

      if (!usuario) {
        return res.status(400).json({ error: 'Campo "usuario" é obrigatório' })
      }

      const podeValidar = ValidacaoService.podeValidar(usuario)

      return res.status(200).json({
        podeValidar,
      })
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao verificar permissão de validação',
      })
    }
  },

  // RN06: Aprova uma movimentação pendente.
  // Apenas supervisor pode executar esta ação.
  async aprovarMovimentacao(req: Request, res: Response) {
    try {
      const movimentacaoId = String(req.params.id)
      const { supervisorId, supervisorCargo } = req.body

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

  // RN06: Rejeita uma movimentação pendente.
  // Apenas supervisor pode executar esta ação.
  async rejeitarMovimentacao(req: Request, res: Response) {
    try {
      const movimentacaoId = String(req.params.id)
      const { supervisorId, supervisorCargo, motivo } = req.body

      if (!supervisorId || !supervisorCargo || !motivo) {
        return res.status(400).json({
          error: 'Campos "supervisorId", "supervisorCargo" e "motivo" são obrigatórios',
        })
      }

      const resultado = await ValidacaoService.rejeitarMovimentacao(
        movimentacaoId,
        String(supervisorId),
        String(supervisorCargo),
        String(motivo)
      )

      return res.status(resultado.sucesso ? 200 : 400).json(resultado)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao rejeitar movimentação',
      })
    }
  },

  // RN06: Aprova uma tarefa pendente.
  // Apenas supervisor pode executar esta ação.
  async aprovarTarefa(req: Request, res: Response) {
    try {
      const tarefaId = String(req.params.id)
      const { supervisorId, supervisorCargo } = req.body

      if (!supervisorId || !supervisorCargo) {
        return res.status(400).json({
          error: 'Campos "supervisorId" e "supervisorCargo" são obrigatórios',
        })
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

  // RN06: Rejeita uma tarefa pendente.
  // Apenas supervisor pode executar esta ação.
  async rejeitarTarefa(req: Request, res: Response) {
    try {
      const tarefaId = String(req.params.id)
      const { supervisorId, supervisorCargo, motivo } = req.body

      if (!supervisorId || !supervisorCargo || !motivo) {
        return res.status(400).json({
          error: 'Campos "supervisorId", "supervisorCargo" e "motivo" são obrigatórios',
        })
      }

      const resultado = await ValidacaoService.rejeitarTarefa(
        tarefaId,
        String(supervisorId),
        String(supervisorCargo),
        String(motivo)
      )

      return res.status(resultado.sucesso ? 200 : 400).json(resultado)
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao rejeitar tarefa',
      })
    }
  },
}
