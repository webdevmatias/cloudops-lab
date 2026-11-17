import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ClienteServico } from '../servicos/cliente.servico';

export class ClienteControlador {
  constructor(private readonly servico: ClienteServico) {}

  private obterIdValido(req: Request, res: Response): number | null {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ erro: 'ID inválido' });
      return null;
    }
    return id;
  }

  private tratarErro(erro: unknown, res: Response): void {
    if (erro instanceof ZodError) {
      res.status(400).json({ erro: 'Dados inválidos', detalhes: erro.errors });
      return;
    }
    if (typeof erro === 'object' && erro !== null && 'code' in erro && erro.code === '23505') {
      res.status(409).json({ erro: 'Já existe um cliente cadastrado com este e-mail ou CPF.' });
      return;
    }
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }

  listar = async (req: Request, res: Response): Promise<void> => {
    const busca = typeof req.query.busca === 'string' ? req.query.busca : undefined;
    const clientes = await this.servico.listarClientes(busca);
    res.json(clientes);
  };

  obterPorId = async (req: Request, res: Response): Promise<void> => {
    const id = this.obterIdValido(req, res);
    if (id === null) return;

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
      this.tratarErro(erro, res);
    }
  };

  atualizar = async (req: Request, res: Response): Promise<void> => {
    const id = this.obterIdValido(req, res);
    if (id === null) return;

    try {
      const cliente = await this.servico.atualizarCliente(id, req.body);
      if (!cliente) {
        res.status(404).json({ erro: 'Cliente não encontrado' });
        return;
      }
      res.json(cliente);
    } catch (erro) {
      this.tratarErro(erro, res);
    }
  };

  remover = async (req: Request, res: Response): Promise<void> => {
    const id = this.obterIdValido(req, res);
    if (id === null) return;

    const removido = await this.servico.removerCliente(id);
    if (!removido) {
      res.status(404).json({ erro: 'Cliente não encontrado' });
      return;
    }

    res.status(204).send();
  };
}
