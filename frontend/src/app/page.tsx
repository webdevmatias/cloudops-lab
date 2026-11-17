'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

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

function obterIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

export default function PaginaInicial() {
  const [autenticado, setAutenticado] = useState(false);
  const [loginEmail, setLoginEmail] = useState('admin@loja.com');
  const [loginSenha, setLoginSenha] = useState('');
  const [entrando, setEntrando] = useState(false);

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

  async function renovarToken(): Promise<string | null> {
    try {
      const resposta = await fetch(`${URL_API}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!resposta.ok) return null;

      const dados = (await resposta.json()) as { accessToken: string };
      localStorage.setItem('accessToken', dados.accessToken);
      return dados.accessToken;
    } catch {
      return null;
    }
  }

  async function requisicaoAutenticada(url: string, opcoes: RequestInit = {}): Promise<Response> {
    let token = localStorage.getItem('accessToken');
    const cabecalhos = new Headers(opcoes.headers);
    if (token) cabecalhos.set('Authorization', `Bearer ${token}`);

    let resposta = await fetch(url, { ...opcoes, headers: cabecalhos });

    if (resposta.status === 401) {
      token = await renovarToken();
      if (!token) {
        sair();
        return resposta;
      }
      cabecalhos.set('Authorization', `Bearer ${token}`);
      resposta = await fetch(url, { ...opcoes, headers: cabecalhos });
    }

    return resposta;
  }

  async function aoEntrar(evento: FormEvent) {
    evento.preventDefault();
    setEntrando(true);
    setErro(null);
    try {
      const resposta = await fetch(`${URL_API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
      });
      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => ({}));
        throw new Error(corpo.erro ?? 'Credenciais inválidas');
      }
      const dados = (await resposta.json()) as { accessToken: string };
      localStorage.setItem('accessToken', dados.accessToken);
      setAutenticado(true);
      setLoginSenha('');
      await carregarClientes();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao autenticar');
    } finally {
      setEntrando(false);
    }
  }

  async function sair() {
    await fetch(`${URL_API}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    localStorage.removeItem('accessToken');
    setAutenticado(false);
    setClientes([]);
  }

  async function carregarClientes(termoBusca = '') {
    setCarregando(true);
    setErro(null);
    try {
      const query = termoBusca ? `?busca=${encodeURIComponent(termoBusca)}` : '';
      const resposta = await requisicaoAutenticada(`${URL_API}/clientes${query}`);
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
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAutenticado(true);
      carregarClientes();
    }
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

      const resposta = await requisicaoAutenticada(url, {
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
      const resposta = await requisicaoAutenticada(`${URL_API}/clientes/${id}`, { method: 'DELETE' });
      if (!resposta.ok) throw new Error('Erro ao remover cliente');
      setConfirmarExclusaoId(null);
      setMensagem('Cliente removido com sucesso.');
      await carregarClientes(busca);
    } catch {
      setErro('Não foi possível remover o cliente.');
    }
  }

  const classeInput =
    'w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200';

  if (!autenticado) {
    return (
      <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5 py-8">
        <section className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5 rounded-xl bg-gradient-to-br from-violet-800 to-purple-600 px-5 py-4 text-white shadow-md">
            <h1 className="text-xl font-bold tracking-tight">Painel Admin</h1>
          </div>

          {erro && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
              {erro}
            </div>
          )}

          <form onSubmit={aoEntrar} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700">E-mail do Administrador</label>
              <input
                className={classeInput}
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700">Senha</label>
              <input
                className={classeInput}
                type="password"
                placeholder="••••••••"
                value={loginSenha}
                onChange={(e) => setLoginSenha(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={entrando}
              className="mt-1 cursor-pointer rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
            >
              {entrando ? 'Entrando...' : 'Entrar no Painel'}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-8 pb-16">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gradient-to-br from-violet-800 to-purple-600 px-6 py-5 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Gestão de Clientes</h1>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Admin</span>
          <button
            type="button"
            onClick={sair}
            className="cursor-pointer rounded-lg border border-white/35 bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25"
          >
            Sair
          </button>
        </div>
      </header>

      <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white px-5 py-4">
          <p className="mb-1 text-xs text-stone-500">Total de Clientes</p>
          <p className="text-2xl font-bold text-stone-900">{clientes.length}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white px-5 py-4">
          <p className="mb-1 text-xs text-stone-500">Tamanho Mais Procurado</p>
          <p className="text-2xl font-bold text-stone-900">{tamanhoMaisFrequente}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white px-5 py-4">
          <p className="mb-1 text-xs text-stone-500">Último Cadastro</p>
          <p className="truncate pt-1 text-lg font-bold text-stone-900">
            {clientes[0]?.nome ?? 'Nenhum ainda'}
          </p>
        </div>
      </section>

      {mensagem && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{mensagem}</span>
          <button type="button" onClick={() => setMensagem(null)} className="cursor-pointer font-bold">
            ✕
          </button>
        </div>
      )}

      {erro && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>{erro}</span>
          <button type="button" onClick={() => setErro(null)} className="cursor-pointer font-bold">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-bold text-stone-900">
            {idEdicao ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <p className="mb-5 text-xs text-stone-500">
            {idEdicao ? 'Atualize os dados e clique em salvar.' : 'Preencha os dados para registrar na loja.'}
          </p>

          <form onSubmit={aoSalvar} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700">Nome completo</label>
              <input
                className={classeInput}
                placeholder="Ex.: Maria Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700">E-mail</label>
              <input
                className={classeInput}
                type="email"
                placeholder="maria@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex min-w-0 flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700">Telefone</label>
                <input
                  className={classeInput}
                  placeholder="(81) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700">CPF</label>
                <input
                  className={classeInput}
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700">Endereço</label>
              <input
                className={classeInput}
                placeholder="Rua, número, bairro"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700">Tamanho preferido</label>
              <select
                className={classeInput}
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

            <div className="mt-2 flex gap-2.5">
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 cursor-pointer rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : idEdicao ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </button>
              {idEdicao && (
                <button
                  type="button"
                  onClick={limparFormulario}
                  className="cursor-pointer rounded-lg border border-stone-300 bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-200"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-stone-900">Clientes Cadastrados</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                carregarClientes(busca);
              }}
              className="flex gap-2"
            >
              <input
                className={`${classeInput} min-w-[220px]`}
                placeholder="Buscar nome, e-mail ou CPF..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <button
                type="submit"
                className="cursor-pointer rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200"
              >
                Buscar
              </button>
            </form>
          </div>

          {carregando ? (
            <p className="py-8 text-center text-sm text-stone-500">Carregando clientes...</p>
          ) : clientes.length === 0 ? (
            <div className="px-4 py-10 text-center text-stone-500">
              <p className="mb-1 font-semibold text-stone-700">Nenhum cliente encontrado</p>
              <p className="text-sm">Cadastre o primeiro cliente no formulário ao lado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wider text-stone-500">
                    <th className="px-2 py-2.5">Cliente</th>
                    <th className="px-2 py-2.5">Contato</th>
                    <th className="px-2 py-2.5">Tamanho</th>
                    <th className="px-2 py-2.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.id} className="border-b border-stone-100">
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-800">
                            {obterIniciais(c.nome)}
                          </span>
                          <div>
                            <div className="font-semibold text-stone-900">{c.nome}</div>
                            <div className="text-xs text-stone-500">CPF: {c.cpf}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div>{c.email}</div>
                        <div className="text-xs text-stone-500">{c.telefone}</div>
                      </td>
                      <td className="px-2 py-3">
                        <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                          {c.tamanho_preferido ?? '-'}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => iniciarEdicao(c)}
                            className="cursor-pointer rounded-md border border-stone-300 bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200"
                          >
                            Editar
                          </button>
                          {confirmarExclusaoId === c.id ? (
                            <button
                              type="button"
                              onClick={() => removerCliente(c.id)}
                              className="cursor-pointer rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                            >
                              Confirmar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmarExclusaoId(c.id)}
                              className="cursor-pointer rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-700 hover:bg-red-50"
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
