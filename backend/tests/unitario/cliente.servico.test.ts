import { describe, expect, it, vi } from 'vitest';
import { ClienteServico } from '../../src/servicos/cliente.servico';
import { ClienteRepositorio } from '../../src/repositorios/cliente.repositorio';

describe('ClienteServico (Unitário)', () => {
  it('deve validar e criar um cliente com dados válidos', async () => {
    const clienteMock = {
      id: 1,
      nome: 'Maria Silva',
      email: 'maria@loja.com',
      telefone: '81999999999',
      cpf: '12345678901',
      endereco: 'Rua das Flores, 100',
      tamanho_preferido: 'M',
      criado_em: new Date(),
      atualizado_em: new Date(),
    };

    const repositorioMock = {
      criar: vi.fn().mockResolvedValue(clienteMock),
    } as unknown as ClienteRepositorio;

    const servico = new ClienteServico(repositorioMock);
    const resultado = await servico.criarCliente({
      nome: 'Maria Silva',
      email: 'maria@loja.com',
      telefone: '81999999999',
      cpf: '12345678901',
      endereco: 'Rua das Flores, 100',
      tamanho_preferido: 'M',
    });

    expect(resultado).toEqual(clienteMock);
    expect(repositorioMock.criar).toHaveBeenCalledOnce();
  });

  it('deve rejeitar criação quando e-mail for inválido', async () => {
    const repositorioMock = {
      criar: vi.fn(),
    } as unknown as ClienteRepositorio;

    const servico = new ClienteServico(repositorioMock);

    await expect(
      servico.criarCliente({
        nome: 'João',
        email: 'email-invalido',
        telefone: '81999999999',
        cpf: '12345678901',
      })
    ).rejects.toThrow();

    expect(repositorioMock.criar).not.toHaveBeenCalled();
  });
});
