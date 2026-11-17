'use client';

import { FormEvent, useEffect, useState } from 'react';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string | null;
  tamanho_preferido: string | null;
}

const URL_API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function PaginaInicial() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [idEdicao, setIdEdicao] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [tamanhoPreferido, setTamanhoPreferido] = useState('M');

  async function carregarClientes(termoBusca = '') {
    setCarregando(true);
    setErro(null);
    try {
      const query = termoBusca ? `?busca=${encodeURIComponent(termoBusca)}` : '';
      const resposta = await fetch(`${URL_API}/clientes${query}`);
      if (!resposta.ok) throw new Error('Falha ao carregar clientes');
      const dados: Cliente[] = await resposta.json();
      setClientes(dados);
    } catch {
      setErro('Não foi possível conectar à API de clientes.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  function limparFormulario() {
    setIdEdicao(null);
    setNome('');
    setEmail('');
    setTelefone('');
    setCpf('');
    setEndereco('');
    setTamanhoPreferido('M');
  }

  async function aoSalvar(evento: FormEvent) {
    evento.preventDefault();
    setMensagem(null);
    setErro(null);

    const payload = {
      nome,
      email,
      telefone,
      cpf,
      endereco: endereco || null,
      tamanho_preferido: tamanhoPreferido || null,
    };

    try {
      const url = idEdicao ? `${URL_API}/clientes/${idEdicao}` : `${URL_API}/clientes`;
      const metodo = idEdicao ? 'PUT' : 'POST';

      const resposta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resposta.ok) {
        const corpoErro = await resposta.json().catch(() => ({}));
        throw new Error(corpoErro.erro ?? 'Erro ao salvar cliente');
      }

      setMensagem(idEdicao ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
      limparFormulario();
      await carregarClientes(busca);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado');
    }
  }

  function iniciarEdicao(cliente: Cliente) {
    setIdEdicao(cliente.id);
    setNome(cliente.nome);
    setEmail(cliente.email);
    setTelefone(cliente.telefone);
    setCpf(cliente.cpf);
    setEndereco(cliente.endereco ?? '');
    setTamanhoPreferido(cliente.tamanho_preferido ?? 'M');
  }

  async function removerCliente(id: number) {
    setMensagem(null);
    setErro(null);
    try {
      const resposta = await fetch(`${URL_API}/clientes/${id}`, { method: 'DELETE' });
      if (!resposta.ok) throw new Error('Erro ao remover cliente');
      setMensagem('Cliente removido com sucesso!');
      await carregarClientes(busca);
    } catch {
      setErro('Não foi possível remover o cliente.');
    }
  }

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
        Loja de Roupas — Cadastro de Clientes
      </h1>
      <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
        Plataforma CloudOps Lab para gerenciamento de clientes.
      </p>

      {mensagem && (
        <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: 6, marginBottom: '1rem' }}>
          {mensagem}
        </div>
      )}
      {erro && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 6, marginBottom: '1rem' }}>
          {erro}
        </div>
      )}

      <section style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', marginTop: 0 }}>
          {idEdicao ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>
        <form onSubmit={aoSalvar} style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <input placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required style={{ padding: '0.5rem' }} />
          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '0.5rem' }} />
          <input placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} required style={{ padding: '0.5rem' }} />
          <input placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} required style={{ padding: '0.5rem' }} />
          <input placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} style={{ padding: '0.5rem' }} />
          <select value={tamanhoPreferido} onChange={(e) => setTamanhoPreferido(e.target.value)} style={{ padding: '0.5rem' }}>
            <option value="PP">Tamanho PP</option>
            <option value="P">Tamanho P</option>
            <option value="M">Tamanho M</option>
            <option value="G">Tamanho G</option>
            <option value="GG">Tamanho GG</option>
          </select>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              {idEdicao ? 'Atualizar' : 'Cadastrar'}
            </button>
            {idEdicao && (
              <button type="button" onClick={limparFormulario} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Clientes Cadastrados</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              placeholder="Buscar por nome, e-mail ou CPF..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ padding: '0.45rem', minWidth: 240 }}
            />
            <button type="button" onClick={() => carregarClientes(busca)} style={{ padding: '0.45rem 0.9rem', cursor: 'pointer' }}>
              Buscar
            </button>
          </div>
        </div>

        {carregando ? (
          <p>Carregando...</p>
        ) : clientes.length === 0 ? (
          <p style={{ color: '#64748b' }}>Nenhum cliente encontrado.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.5rem' }}>Nome</th>
                <th style={{ padding: '0.5rem' }}>E-mail</th>
                <th style={{ padding: '0.5rem' }}>Telefone</th>
                <th style={{ padding: '0.5rem' }}>Tamanho</th>
                <th style={{ padding: '0.5rem' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.5rem' }}>{c.nome}</td>
                  <td style={{ padding: '0.5rem' }}>{c.email}</td>
                  <td style={{ padding: '0.5rem' }}>{c.telefone}</td>
                  <td style={{ padding: '0.5rem' }}>{c.tamanho_preferido ?? '-'}</td>
                  <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={() => iniciarEdicao(c)} style={{ cursor: 'pointer' }}>
                      Editar
                    </button>
                    <button type="button" onClick={() => removerCliente(c.id)} style={{ cursor: 'pointer', color: '#b91c1c' }}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
