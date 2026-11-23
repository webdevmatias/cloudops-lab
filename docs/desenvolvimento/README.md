# Guia de Desenvolvimento Local

Este documento orienta os desenvolvedores sobre a configuração do ambiente, execução local dos serviços e execução da suíte de testes.

---

## 1. Pré-requisitos do Ambiente

Antes de iniciar, certifique-se de possuir instalado em sua máquina:
- **Git**
- **Docker** e **Docker Compose**
- **Node.js** (versão LTS recomendada, para desenvolvimento local do Frontend em Next.js e Backend em Express + TypeScript)
- **Infisical CLI** (obrigatório para injeção local dos segredos de desenvolvimento)

---

## 2. Clonagem e Configuração Inicial

```bash
# 1. Clonar o repositório
git clone <URL_DO_REPOSITORIO>
cd cloudops-lab

# 2. Autenticar no Infisical e vincular o projeto (gera .infisical.json)
infisical login
infisical init
```

> O `.env.example` é apenas referência. Não crie um `.env` real: no desenvolvimento local os segredos são injetados pelo Infisical. Em produção AWS, eles ficam no SSM Parameter Store ([ADR 006](../arquitetura/adrs/006-estrategia-hibrida-de-segredos.md)).

---

## 3. Execução com Docker Compose

A forma mais rápida de subir todo o ecossistema (frontend, backend e banco de dados) localmente:

```bash
# Iniciar todos os serviços em background com segredos do Infisical
infisical run --env=dev -- docker compose up -d

# Visualizar logs em tempo real
docker compose logs -f

# Parar todos os serviços
docker compose down
```

---

## 4. Executando os Serviços Manualmente (Modo Desenvolvimento)

### 4.1. Banco de Dados (PostgreSQL)
```bash
infisical run --env=dev -- docker compose up -d postgres
```

### 4.2. Backend (Express + TypeScript)
```bash
# Instalar dependências
npm --prefix backend install
# Executar em modo dev com segredos injetados
infisical run --env=dev -- npm --prefix backend run dev
```

### 4.3. Frontend (Next.js)
```bash
# Instalar dependências
npm --prefix frontend install
# Executar servidor local
infisical run --env=dev -- npm --prefix frontend run dev
```

> Para rodar o backend manualmente fora do Docker, o `DATABASE_URL` do Infisical deve apontar para `localhost:5432`. No Docker Compose, a URL é montada automaticamente com o host `postgres`.

---

## 5. Padrões de Código, Nomenclatura e Git

Todos os desenvolvedores devem seguir as convenções de código e versionamento:
- **Idioma padrão:** pt-BR para nomes de arquivos, funções, métodos e variáveis (mantendo termos técnicos consagrados em inglês).
- **Fluxo de branches:** GitFlow (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`).
- **Commits:** Conventional Commits com mensagens em pt-BR.

👉 Consulte o guia detalhado com exemplos: [**Padrões de Código e Git (GitFlow & Conventional Commits)**](padroes-codigo-git.md).

---

## 6. Testes Automatizados

Conforme o requisito de qualidade e testes do projeto, execute os testes antes de abrir qualquer Pull Request:

```bash
# Executar linter
npm run lint

# Executar testes unitários
npm run test:unit

# Executar testes de integração
npm run test:integration
```

