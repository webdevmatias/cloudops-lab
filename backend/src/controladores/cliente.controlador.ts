import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ClienteServico } from '../servicos/cliente.servico';

export class ClienteControlador {
  constructor(private readonly servico: ClienteServico) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    const busca = typeof req.query.busca === 'string' ? req.query.busca : undefined;
    const clientes = await this.servico.listarClientes(busca);
    res.json(clientes);
  };

  obterPorId = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ erro: 'ID inválido' });
      return;
    }

    const cliente = await this.servico.obterClientePorId(id);
    if (!cliente) {
      res.status(404).json({ erro: 'Cliente não encontrado' });
      return;
    }

    res.json(cliente);
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    try {
      const cliente = await this.servico.criarCliente(req.body);
      res.status(201).json(cliente);
    } catch (erro) {
      if (erro instanceof ZodError) {
        res.status(400).json({ erro: 'Dados inválidos', detalhes: erro.errors });
        return;
      }
      throw erro;
    }
  };

  atualizar = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ erro: 'ID inválido' });
      return;
    }

    try {
      const cliente = await this.servico.atualizarCliente(id, req.body);
      if (!cliente) {
        res.status(404).json({ erro: 'Cliente não encontrado' });
        return;
      }
      res.json(cliente);
    } catch (erro) {
      if (erro instanceof ZodError) {
        res.status(400).json({ erro: 'Dados inválidos', detalhes: erro.errors });
        return;
      }
      throw erro;
    }
  };

  remover = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ erro: 'ID inválido' });
      return;
    }

    const removido = await this.servico.removerCliente(id);
    if (!removido) {
      res.status(404).json({ erro: 'Cliente não encontrado' });
      return;
    }

    res.status(204).send();
  };
}
