import { poolBanco } from '../configuracao/bancoDados';

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string | null;
  tamanho_preferido: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

export interface DadosCriarCliente {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco?: string | null;
  tamanho_preferido?: string | null;
}

export type DadosAtualizarCliente = Partial<DadosCriarCliente>;

export class ClienteRepositorio {
  async listar(busca?: string): Promise<Cliente[]> {
    if (busca && busca.trim() !== '') {
      const termo = `%${busca.trim()}%`;
      const resultado = await poolBanco.query<Cliente>(
        `SELECT * FROM clientes
         WHERE nome ILIKE $1 OR email ILIKE $1 OR cpf ILIKE $1
         ORDER BY id DESC`,
        [termo]
      );
      return resultado.rows;
    }

    const resultado = await poolBanco.query<Cliente>(
      'SELECT * FROM clientes ORDER BY id DESC'
    );
    return resultado.rows;
  }

  async obterPorId(id: number): Promise<Cliente | null> {
    const resultado = await poolBanco.query<Cliente>(
      'SELECT * FROM clientes WHERE id = $1',
      [id]
    );
    return resultado.rows[0] ?? null;
  }

  async criar(dados: DadosCriarCliente): Promise<Cliente> {
    const resultado = await poolBanco.query<Cliente>(
      `INSERT INTO clientes (nome, email, telefone, cpf, endereco, tamanho_preferido)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        dados.nome,
        dados.email,
        dados.telefone,
        dados.cpf,
        dados.endereco ?? null,
        dados.tamanho_preferido ?? null,
      ]
    );
    return resultado.rows[0];
  }

  async atualizar(id: number, dados: DadosAtualizarCliente): Promise<Cliente | null> {
    const atual = await this.obterPorId(id);
    if (!atual) {
      return null;
    }

    const resultado = await poolBanco.query<Cliente>(
      `UPDATE clientes
       SET nome = $1,
           email = $2,
           telefone = $3,
           cpf = $4,
           endereco = $5,
           tamanho_preferido = $6,
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        dados.nome ?? atual.nome,
        dados.email ?? atual.email,
        dados.telefone ?? atual.telefone,
        dados.cpf ?? atual.cpf,
        dados.endereco !== undefined ? dados.endereco : atual.endereco,
        dados.tamanho_preferido !== undefined
          ? dados.tamanho_preferido
          : atual.tamanho_preferido,
        id,
      ]
    );
    return resultado.rows[0];
  }

  async remover(id: number): Promise<boolean> {
    const resultado = await poolBanco.query(
      'DELETE FROM clientes WHERE id = $1',
      [id]
    );
    return (resultado.rowCount ?? 0) > 0;
  }
}
