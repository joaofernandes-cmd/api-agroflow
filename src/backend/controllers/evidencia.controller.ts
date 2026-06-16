import { Request, Response } from 'express'
import { EvidenciaService } from '../services/evidencia.service'
import { converterUUID } from '../models/uuid'

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

  async criarMensagem(req: Request, res: Response) {
    try {
      const { conteudo } = req.body
      const usuarioId = req.usuario?.id ?? req.body.usuarioId

      if (!usuarioId || !conteudo) {
        return res.status(400).json({ error: 'Usuário e conteúdo são obrigatórios' })
      }

      const resultado = await EvidenciaService.criarMensagem(usuarioId, conteudo)

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

      if (!usuarioId || !urlArquivo || duracao === undefined) {
        return res.status(400).json({ error: 'Usuário, arquivo e duração são obrigatórios' })
      }

      const resultado = await EvidenciaService.criarAudio(usuarioId, urlArquivo, Number(duracao))

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

      if (!usuarioId || !urlArquivo || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Usuário, arquivo, latitude e longitude são obrigatórios' })
      }

      const resultado = await EvidenciaService.criarFoto(usuarioId, urlArquivo, Number(latitude), Number(longitude))

      return res.status(201).json(resultado)
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao criar foto',
      })
    }
  },
}
