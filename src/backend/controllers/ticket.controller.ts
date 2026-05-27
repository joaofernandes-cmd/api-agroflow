import { Request, Response } from 'express';
import { TicketService } from '../services/ticket.service';
import { Usuario } from '../models/usuario.model';
import { TicketStatus, TicketPrioridade, TicketCategoria } from '../models/ticket.model';

export const TicketController = {
    async listarTodos(req: Request, res: Response) {
        try {
            const tickets = await TicketService.listarTodos();
            return res.status(200).json(tickets);
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao listar tickets' });
        }
    },

    async buscarPorId(req: Request, res: Response) {
        try {
            const id = String(req.params.id);
            const ticket = await TicketService.buscarPorId(id);

            if (!ticket) {
                return res.status(404).json({ error: 'Ticket não encontrado' });
            }

            return res.status(200).json(ticket);
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao buscar ticket' });
        }
    },

    async criar(req: Request, res: Response) {
        try {
            const {
                retiro_id,
                categoria,
                localizacao,
                descricao,
                prioridade,
                usuarioAbridorTicket,
                temEvidenciaDescritiva,
        } = req.body;

        if (!retiro_id || !categoria || !localizacao || !descricao || !prioridade || !usuarioAbridorTicket) {
            return res.status(400).json({ error: 'Campos obrigatórios não informados' });
        }

        const ticket = await TicketService.criar({
            retiro_id,
            categoria,
            localizacao,
            descricao,
            prioridade,
        },
        usuarioAbridorTicket as Usuario,
        Boolean(temEvidenciaDescritiva)
        );

        return res.status(201).json(ticket);
    } catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : 'Erro ao criar ticket' });
    }
    }
}