'use client';

import { CSSProperties, FormEvent, useEffect, useMemo, useState } from 'react';

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

const estilos: Record<string, CSSProperties> = {
  pagina: {
    minHeight: '100vh',
    padding: '2rem 1.25rem 4rem',
    maxWidth: 1120,
    margin: '0 auto',
  },
  cabecalho: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.75rem',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid #e7e5e4',
  },
  subtitulo: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#b45309',
    margin: '0 0 0.25rem',
  },
  titulo: {
    fontSize: '1.75rem',
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  kpis: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.75rem',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e5e4',
    borderRadius: 12,
    padding: '1rem 1.25rem',
  },
  kpiLabel: {
    fontSize: '0.8rem',
    color: '#78716c',
    margin: '0 0 0.35rem',
  },
  kpiValor: {
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: 0,
    color: '#1c1917',
  },
  gradePrincipal: {
    display: 'grid',
    gridTemplateColumns: 'minmax(300px, 360px) 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e5e4',
    borderRadius: 12,
    padding: '1.5rem',
    boxShadow: '0 1px 2px rgba(28, 25, 23, 0.04)',
  },
  campoGrupo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#44403c',
  },
  input: {
    padding: '0.6rem 0.75rem',
    borderRadius: 8,
    border: '1px solid #d6d3d1',
    fontSize: '0.9rem',
    outline: 'none',
    backgroundColor: '#fafaf9',
    color: '#1c1917',
  },
  botaoPrimario: {
    padding: '0.65rem 1.15rem',
    backgroundColor: '#1c1917',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  botaoSecundario: {
    padding: '0.65rem 1rem',
    backgroundColor: '#f5f5f4',
    color: '#44403c',
    border: '1px solid #d6d3d1',
    borderRadius: 8,
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  badgeTamanho: {
    display: 'inline-block',
    padding: '0.2rem 0.55rem',
    borderRadius: 999,
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
};

function obterIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

export default function PaginaInicial() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState<number | null>(null);

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

  const tamanhoMaisFrequente = useMemo(() => {
    if (clientes.length === 0) return '-';
    const contagem: Record<string, number> = {};
    for (const c of clientes) {
      const tam = c.tamanho_preferido || 'N/I';
      contagem[tam] = (contagem[tam] ?? 0) + 1;
    }
    return Object.entries(contagem).sort((a, b) => b[1] - a[1])[0][0];
  }, [clientes]);

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
    setSalvando(true);
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

      setMensagem(idEdicao ? 'Cliente atualizado com sucesso.' : 'Cliente cadastrado com sucesso.');
      limparFormulario();
      await carregarClientes(busca);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado ao salvar.');
    } finally {
      setSalvando(false);
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
    setConfirmarExclusaoId(null);
  }

  async function removerCliente(id: number) {
    setMensagem(null);
    setErro(null);
    try {
      const resposta = await fetch(`${URL_API}/clientes/${id}`, { method: 'DELETE' });
      if (!resposta.ok) throw new Error('Erro ao remover cliente');
      setConfirmarExclusaoId(null);
      setMensagem('Cliente removido com sucesso.');
      await carregarClientes(busca);
    } catch {
      setErro('Não foi possível remover o cliente.');
    }
  }

  return (
    <main style={estilos.pagina}>
      <header style={estilos.cabecalho}>
        <div>
          <p style={estilos.subtitulo}>Atelier CloudOps • Loja de Roupas</p>
          <h1 style={estilos.titulo}>Gestão de Clientes</h1>
        </div>
        <span style={{ fontSize: '0.85rem', color: '#78716c' }}>
          Cadastro, preferências de tamanho e contato
        </span>
      </header>

      <section style={estilos.kpis}>
        <div style={estilos.kpiCard}>
          <p style={estilos.kpiLabel}>Total de Clientes</p>
          <p style={estilos.kpiValor}>{clientes.length}</p>
        </div>
        <div style={estilos.kpiCard}>
          <p style={estilos.kpiLabel}>Tamanho Mais Procurado</p>
          <p style={estilos.kpiValor}>{tamanhoMaisFrequente}</p>
        </div>
        <div style={estilos.kpiCard}>
          <p style={estilos.kpiLabel}>Último Cadastro</p>
          <p style={{ ...estilos.kpiValor, fontSize: '1.1rem', paddingTop: '0.25rem' }}>
            {clientes[0]?.nome ?? 'Nenhum ainda'}
          </p>
        </div>
      </section>

      {mensagem && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.85rem 1rem',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: 10,
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
          }}
        >
          <span>{mensagem}</span>
          <button
            type="button"
            onClick={() => setMensagem(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {erro && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.85rem 1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: 10,
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
          }}
        >
          <span>{erro}</span>
          <button
            type="button"
            onClick={() => setErro(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={estilos.gradePrincipal}>
        <section style={estilos.card}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
            {idEdicao ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#78716c', margin: '0 0 1.25rem' }}>
            {idEdicao
              ? 'Atualize os dados e clique em salvar.'
              : 'Preencha os dados para registrar na loja.'}
          </p>

          <form onSubmit={aoSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={estilos.campoGrupo}>
              <label style={estilos.label}>Nome completo</label>
              <input
                style={estilos.input}
                placeholder="Ex.: Maria Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div style={estilos.campoGrupo}>
              <label style={estilos.label}>E-mail</label>
              <input
                style={estilos.input}
                type="email"
                placeholder="maria@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={estilos.campoGrupo}>
                <label style={estilos.label}>Telefone</label>
                <input
                  style={estilos.input}
                  placeholder="(81) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />
              </div>
              <div style={estilos.campoGrupo}>
                <label style={estilos.label}>CPF</label>
                <input
                  style={estilos.input}
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={estilos.campoGrupo}>
              <label style={estilos.label}>Endereço</label>
              <input
                style={estilos.input}
                placeholder="Rua, número, bairro"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </div>

            <div style={estilos.campoGrupo}>
              <label style={estilos.label}>Tamanho preferido</label>
              <select
                style={estilos.input}
                value={tamanhoPreferido}
                onChange={(e) => setTamanhoPreferido(e.target.value)}
              >
                <option value="PP">PP</option>
                <option value="P">P</option>
                <option value="M">M</option>
                <option value="G">G</option>
                <option value="GG">GG</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={salvando}
                style={{ ...estilos.botaoPrimario, flex: 1, opacity: salvando ? 0.7 : 1 }}
              >
                {salvando ? 'Salvando...' : idEdicao ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </button>
              {idEdicao && (
                <button type="button" onClick={limparFormulario} style={estilos.botaoSecundario}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={estilos.card}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Clientes Cadastrados
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                carregarClientes(busca);
              }}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              <input
                style={{ ...estilos.input, minWidth: 220 }}
                placeholder="Buscar nome, e-mail ou CPF..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <button type="submit" style={estilos.botaoSecundario}>
                Buscar
              </button>
            </form>
          </div>

          {carregando ? (
            <p style={{ color: '#78716c', padding: '2rem 0', textAlign: 'center' }}>
              Carregando clientes...
            </p>
          ) : clientes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#78716c' }}>
              <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: '#44403c' }}>
                Nenhum cliente encontrado
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                Cadastre o primeiro cliente no formulário ao lado.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #e7e5e4', color: '#78716c', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Cliente</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Contato</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Tamanho</th>
                    <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f5f5f4' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              backgroundColor: '#f5f5f4',
                              color: '#1c1917',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {obterIniciais(c.nome)}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1c1917' }}>{c.nome}</div>
                            <div style={{ fontSize: '0.78rem', color: '#78716c' }}>CPF: {c.cpf}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div>{c.email}</div>
                        <div style={{ fontSize: '0.78rem', color: '#78716c' }}>{c.telefone}</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={estilos.badgeTamanho}>{c.tamanho_preferido ?? '-'}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => iniciarEdicao(c)}
                            style={{ ...estilos.botaoSecundario, padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                          >
                            Editar
                          </button>
                          {confirmarExclusaoId === c.id ? (
                            <button
                              type="button"
                              onClick={() => removerCliente(c.id)}
                              style={{
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.8rem',
                                backgroundColor: '#dc2626',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                            >
                              Confirmar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmarExclusaoId(c.id)}
                              style={{
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.8rem',
                                backgroundColor: 'transparent',
                                color: '#b91c1c',
                                border: '1px solid #fecaca',
                                borderRadius: 6,
                                cursor: 'pointer',
                              }}
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
