import { Request, Response } from 'express'
import { COOKIE_TOKEN_AUTENTICACAO, gerarToken } from '../middlewares/autenticacao.middleware'
import { Usuario } from '../models/usuario.model'
import { converterUUID } from '../models/uuid'
import { UsuarioService } from '../services/usuario.service'

function removerSenha(usuario: Usuario) {
  const { senha_hash, ...usuarioSemSenha } = usuario
  return usuarioSemSenha
}

export const UsuarioController = {
  async autenticar(req: Request, res: Response) {
    try {
      const { login, senha } = req.body

      if (!login || !senha) {
        return res.status(400).json({ error: 'Login e senha são obrigatórios' })
      }

      const usuario = await UsuarioService.autenticar(login, senha)

      if (!usuario) {
        return res.status(401).json({ error: 'Login ou senha incorretos' })
      }

      if (!UsuarioService.estaAtivo(usuario)) {
        return res.status(403).json({ error: 'Usuário inativo' })
      }

      if (usuario.cargo === 'capataz') {
        return res.status(403).json({ error: 'Capataz não possui acesso por login' })
      }

      const token = gerarToken(usuario)

      res.cookie(COOKIE_TOKEN_AUTENTICACAO, token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      })

      return res.status(200).json({
        usuario: removerSenha(usuario),
        token,
      })
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao autenticar usuário' })
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie(COOKIE_TOKEN_AUTENTICACAO)
    return res.status(204).send()
  },

  async listarTodos(req: Request, res: Response) {
    try {
      const usuarios = await UsuarioService.listarTodos()
      return res.status(200).json(usuarios.map(removerSenha))
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar usuários' })
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = String(req.params.id)
      const usuario = await UsuarioService.buscarPorId(id)

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      return res.status(200).json(removerSenha(usuario))
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar usuário' })
    }
  },

  async listarPorRetiro(req: Request, res: Response) {
    try {
      const retiroId = converterUUID(req.params.retiroId)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const usuarios = await UsuarioService.listarPorRetiro(retiroId)

      return res.status(200).json(usuarios.map(removerSenha))
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar usuários por retiro' })
    }
  },

  async listarCapatazesPorRetiro(req: Request, res: Response) {
    try {
      const retiroId = converterUUID(req.params.retiroId)

      if (retiroId === null) {
        return res.status(400).json({ error: 'Retiro inválido' })
      }

      const usuarios = await UsuarioService.listarPorRetiro(retiroId)
      const capatazes = usuarios.filter(usuario => usuario.cargo === 'capataz' && usuario.status === 'ativo')

      return res.status(200).json(capatazes.map(removerSenha))
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar capatazes por retiro' })
    }
  },

  async criar(req: Request, res: Response) {
    try {
      const { retiro_id, nome, login, senha_hash, status, cargo } = req.body

      if (!retiro_id || !nome || !login || !senha_hash || !status || !cargo) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(login)) {
        return res.status(400).json({ error: 'Login deve ser um email válido' })
      }

      const usuario = await UsuarioService.criar({
        retiro_id,
        nome,
        login,
        senha_hash,
        status,
        cargo,
      })

      return res.status(201).json(removerSenha(usuario))
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar usuário' })
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = String(req.params.id)
      const usuario = await UsuarioService.atualizar(id, req.body)

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      return res.status(200).json(removerSenha(usuario))
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar usuário' })
    }
  },

  async remover(req: Request, res: Response) {
    try {
      const id = String(req.params.id)
      const usuario = await UsuarioService.buscarPorId(id)

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      await UsuarioService.remover(id)

      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover usuário' })
    }
  },
}
