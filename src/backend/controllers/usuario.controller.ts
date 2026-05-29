import { Request, Response } from 'express'
import { gerarToken } from '../middlewares/autenticacao.middleware'
import { Usuario } from '../models/usuario.model'
import { UsuarioService } from '../services/usuario.service';

function removerSenha(usuario: Usuario) {
    // Nunca devolvemos a senha_hash na resposta.
    const { senha_hash, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
}

function converterNumero(value: unknown): number | null {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
}

export const UsuarioController = {
    async autenticar(req: Request, res: Response) {
        try {
            const { login, senha } = req.body;

            if (!login || !senha) {
                return res.status(400).json({ error: 'Login e senha são obrigatórios' })
            }

            const usuario = await UsuarioService.autenticar(login, senha);

            if (!usuario) {
                return res.status(401).json({ error: 'Login ou senha incorretos' });
            }

            // Capataz não entra no fluxo de login: ele usa a aplicação sem sessão.
            if (!UsuarioService.estaAtivo(usuario)) {
                return res.status(403).json({ error: 'Usuário inativo' });
            }

            // Só gerente e supervisor recebem JWT.
            if (usuario.cargo === 'capataz') {
                return res.status(403).json({ error: 'Capataz não possui acesso por login' });
            }

            return res.status(200).json({
                usuario: removerSenha(usuario),
                token: gerarToken(usuario),
            });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao autenticar usuário' });
        }
    },

    async listarTodos(req: Request, res: Response) {
        try {
            const usuarios = await UsuarioService.listarTodos();
            return res.status(200).json(usuarios.map(removerSenha));
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao listar usuários' });
        }
        },

    async buscarPorId(req: Request, res: Response) {
        try {
            const id = String(req.params.id);
            const usuario = await UsuarioService.buscarPorId(id);

            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            return res.status(200).json(removerSenha(usuario));
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao buscar usuário' });
        }
        },

    async listarPorRetiro(req: Request, res: Response) {
        try {
            const retiroId = converterNumero(req.params.retiroId);

            if (retiroId === null) {
                return res.status(400).json({ error: 'Retiro inválido' });
            }
            
            const usuarios = await UsuarioService.listarPorRetiro(retiroId);

            return res.status(200).json(usuarios.map(removerSenha));
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao listar usuários por retiro' });
        }
    },

    async criar(req: Request, res: Response) {
        try {
            const { retiro_id, nome, login, senha_hash, status, cargo } = req.body;

            if (!retiro_id || !nome || !login || !senha_hash || !status || !cargo) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }

            const usuario = await UsuarioService.criar({
                retiro_id,
                nome,
                login,
                senha_hash,
                status,
                cargo
            })

            return res.status(201).json(removerSenha(usuario));
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao criar usuário' });
        }
    },

    async atualizar(req: Request, res: Response) {
        try {
            const id = String(req.params.id);
            const usuario = await UsuarioService.atualizar(id, req.body);

            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            return res.status(200).json(removerSenha(usuario));
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao atualizar usuário' });
        }
    },

    async remover(req: Request, res: Response) {
        try {
            const id = String(req.params.id);
            const usuario = await UsuarioService.buscarPorId(id);

            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            await UsuarioService.remover(id);

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao remover usuário' });
        }
    },

    }
