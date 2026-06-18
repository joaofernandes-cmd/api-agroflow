import { Request, Response } from 'express'
import { EvidenciaService } from '../services/evidencia.service'
import { converterUUID, UUID } from '../models/uuid'

// Lê o tarefa_id (opcional) do corpo da requisição.
// - ausente  → undefined (evidência criada sem vínculo com tarefa)
// - inválido → null (controller responde 400)
// - válido   → o UUID da tarefa
function lerTarefaId(req: Request): UUID | null | undefined {
  const valor = req.body.tarefa_id ?? req.body.tarefaId
  if (valor === undefined || valor === null || valor === '') {
    return undefined
  }
  return converterUUID(valor)
}

function numeroValido(valor: unknown): number | null {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
}

export const EvidenciaController = {
  async listar(req: Request, res: Response) {
    try {
      const evidencias = await EvidenciaService.listarTodas()

      return res.status(200).json(evidencias)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar evidências' })
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = converterUUID(req.params.id)

      if (id === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const evidencia = await EvidenciaService.buscarPorId(id)

      if (!evidencia) {
        return res.status(404).json({ error: 'Evidência não encontrada' })
      }

      return res.status(200).json(evidencia)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar evidência' })
    }
  },

  async buscarPorTarefa(req: Request, res: Response) {
    try {
      const tarefaId = converterUUID(req.params.tarefaId)

      if (tarefaId === null) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const evidencias = await EvidenciaService.buscarPorTarefa(tarefaId)

      return res.status(200).json(evidencias)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar evidências da tarefa' })
    }
  },

  async criarMensagem(req: Request, res: Response) {
    try {
      const { conteudo } = req.body
      const usuarioId = req.usuario?.id ?? req.body.usuarioId
      const tarefaId = lerTarefaId(req)

      if (!usuarioId || !conteudo) {
        return res.status(400).json({ error: 'Usuário e conteúdo são obrigatórios' })
      }

      if (tarefaId === null) {
        return res.status(400).json({ error: 'Tarefa inválida' })
      }

      const resultado = await EvidenciaService.criarMensagem(usuarioId, conteudo, tarefaId)

      return res.status(201).json(resultado)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao criar mensagem',
      })
    }
  },

  async criarAudio(req: Request, res: Response) {
    try {
      const { urlArquivo, duracao } = req.body
      const usuarioId = req.usuario?.id ?? req.body.usuarioId
      const tarefaId = lerTarefaId(req)

      if (!usuarioId || !urlArquivo || duracao === undefined) {
        return res.status(400).json({ error: 'Usuário, arquivo e duração são obrigatórios' })
      }

      if (tarefaId === null) {
        return res.status(400).json({ error: 'Tarefa inválida' })
      }

      const duracaoNumerica = numeroValido(duracao)

      if (duracaoNumerica === null) {
        return res.status(400).json({ error: 'Duração inválida' })
      }

      const resultado = await EvidenciaService.criarAudio(usuarioId, urlArquivo, duracaoNumerica, tarefaId ?? undefined)

      return res.status(201).json(resultado)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao criar áudio',
      })
    }
  },

  async criarFoto(req: Request, res: Response) {
    try {
      const { urlArquivo, latitude, longitude } = req.body
      const usuarioId = req.usuario?.id ?? req.body.usuarioId
      const tarefaId = lerTarefaId(req)

      if (!usuarioId || !urlArquivo || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Usuário, arquivo, latitude e longitude são obrigatórios' })
      }

      if (tarefaId === null) {
        return res.status(400).json({ error: 'Tarefa inválida' })
      }

      const latitudeNumerica = numeroValido(latitude)
      const longitudeNumerica = numeroValido(longitude)

      if (latitudeNumerica === null || longitudeNumerica === null) {
        return res.status(400).json({ error: 'Latitude ou longitude inválida' })
      }

      const resultado = await EvidenciaService.criarFoto(
        usuarioId,
        urlArquivo,
        latitudeNumerica,
        longitudeNumerica,
        tarefaId ?? undefined
      )

      return res.status(201).json(resultado)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao criar foto',
      })
    }
  },
}
