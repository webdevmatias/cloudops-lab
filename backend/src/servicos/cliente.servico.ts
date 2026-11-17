import { z } from 'zod';
import {
  Cliente,
  ClienteRepositorio,
  DadosAtualizarCliente,
  DadosCriarCliente,
} from '../repositorios/cliente.repositorio';

export const esquemaCriarCliente = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(150),
  email: z.string().email('E-mail inválido').max(150),
  telefone: z.string().min(8, 'Telefone inválido').max(20),
  cpf: z.string().min(11, 'CPF inválido').max(14),
  endereco: z.string().max(500).nullable().optional(),
  tamanho_preferido: z.string().max(10).nullable().optional(),
});

export const esquemaAtualizarCliente = esquemaCriarCliente.partial();

export class ClienteServico {
  constructor(private readonly repositorio: ClienteRepositorio) {}

  async listarClientes(busca?: string): Promise<Cliente[]> {
    return this.repositorio.listar(busca);
  }

  async obterClientePorId(id: number): Promise<Cliente | null> {
    return this.repositorio.obterPorId(id);
  }

  async criarCliente(payload: unknown): Promise<Cliente> {
    const dados: DadosCriarCliente = esquemaCriarCliente.parse(payload);
    return this.repositorio.criar(dados);
  }

  async atualizarCliente(id: number, payload: unknown): Promise<Cliente | null> {
    const dados: DadosAtualizarCliente = esquemaAtualizarCliente.parse(payload);
    return this.repositorio.atualizar(id, dados);
  }

  async removerCliente(id: number): Promise<boolean> {
    return this.repositorio.remover(id);
  }
}
