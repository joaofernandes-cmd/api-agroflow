import { Request, Response } from 'express'
import { EvidenciaService } from '../services/evidencia.service'

function converterNumero(value: unknown): number | null {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
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
            const id = converterNumero(req.params.id)

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
            const { usuarioId, conteudo } = req.body

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
            const { usuarioId, urlArquivo, duracao } = req.body

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
            const { usuarioId, urlArquivo, latitude, longitude } = req.body

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
