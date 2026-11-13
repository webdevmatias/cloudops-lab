# Guia de Desenvolvimento Local

Este documento orienta os desenvolvedores sobre a configuração do ambiente, execução local dos serviços e execução da suíte de testes.

---

## 1. Pré-requisitos do Ambiente

Antes de iniciar, certifique-se de possuir instalado em sua máquina:
- **Git**
- **Docker** e **Docker Compose**
- **Linguagem / Runtime da stack** (ex: Node.js, Python, Go - conforme definido na stack da aplicação)
- **Infisical CLI** (para injeção local de segredos, se aplicável)

---

## 2. Clonagem e Configuração Inicial

```bash
# 1. Clonar o repositório
git clone <URL_DO_REPOSITORIO>
cd cloudops-lab

# 2. Copiar arquivo de variáveis de ambiente
cp .env.example .env
```

---

## 3. Execução com Docker Compose

A forma mais rápida de subir todo o ecossistema (frontend, backend e banco de dados) localmente:

```bash
# Iniciar todos os serviços em background
docker compose up -d

# Visualizar logs em tempo real
docker compose logs -f

# Parar todos os serviços
docker compose down
```

---

## 4. Executando os Serviços Manualmente (Modo Desenvolvimento)

### 4.1. Banco de Dados
```bash
docker compose up -d postgres # ou banco correspondente
```

### 4.2. Backend
```bash
cd backend/
# Instalar dependências
npm install # ou pip install -r requirements.txt
# Executar em modo dev
npm run dev
```

### 4.3. Frontend
```bash
cd frontend/
# Instalar dependências
npm install
# Executar servidor local
npm run dev
```

---

## 5. Padrões de Código, Nomenclatura e Git

Todos os desenvolvedores devem seguir as convenções de código e versionamento:
- **Idioma padrão:** pt-BR para nomes de arquivos, funções, métodos e variáveis (mantendo termos técnicos consagrados em inglês).
- **Fluxo de branches:** GitFlow (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`).
- **Commits:** Conventional Commits com mensagens em pt-BR.

👉 Consulte o guia detalhado com exemplos: [**Padrões de Código e Git (GitFlow & Conventional Commits)**](file:///home/matias/Documentos/cloudops-lab/docs/desenvolvimento/padroes-codigo-git.md).

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

