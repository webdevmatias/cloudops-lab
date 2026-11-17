# CloudOps Lab

Plataforma de **cadastro e gestão de clientes de uma loja de roupas**, desenvolvida para o Projeto Integrador (Desenvolvimento e Implantação em Nuvem), integrando desenvolvimento de software, infraestrutura como código (Terraform), CI/CD, segurança e observabilidade na AWS.

---

## Objetivo e Proposta

Desenvolver e implantar uma aplicação funcional em ambiente de nuvem para resolver o controle disperso de clientes em lojas de roupas, oferecendo uma interface web centralizada com persistência relacional, autenticação administrativa com refresh token, automação de infraestrutura e monitoramento contínuo.

Todas as escolhas de arquitetura, serviços de nuvem e ferramentas são justificadas considerando funcionalidade, segurança, escalabilidade, manutenção e disponibilidade.

---

## Stack e Arquitetura

- **Frontend:** Next.js (App Router + TypeScript + Tailwind CSS) em contêiner Docker (EC2 dedicada).
- **Backend:** Express + TypeScript (validação Zod, `helmet`, `express-rate-limit`, métricas Prometheus em `/metrics` e `/health`) em contêiner Docker (EC2 dedicada).
- **Banco de Dados:** PostgreSQL 16 em contêiner Docker com volume persistente (EC2 dedicada).
- **Autenticação:** Painel Admin com JWT (`accessToken` + `refreshToken` revogável em banco via cookie `HttpOnly`).
- **Infraestrutura e Operação:** AWS (3 instâncias EC2, VPC, Security Groups, ECR), Terraform, GitHub Actions, Infisical, Prometheus e Grafana.

---

## Estrutura do Repositório

```text
cloudops-lab/
├── .env.example                    # Modelo de variáveis de ambiente (sem segredos)
├── docker-compose.yml              # Orquestração local (postgres, backend, frontend)
├── .github/workflows/ci.yml        # Pipeline de CI (testes, build e imagens Docker)
│
├── backend/                        # API REST em Express + TypeScript
│   ├── Dockerfile                  # Build multi-stage de produção
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app.ts                  # Configuração Express, Helmet, CORS, Rate Limit e rotas
│   │   ├── servidor.ts             # Inicialização do servidor e seed do admin inicial
│   │   ├── configuracao/           # Conexão PostgreSQL e validação de segredos
│   │   ├── middlewares/            # Autenticação JWT de administrador
│   │   ├── repositorios/           # Acesso a dados (clientes, admin e refresh tokens)
│   │   ├── servicos/               # Regras de negócio e validação Zod
│   │   ├── controladores/          # Handlers HTTP
│   │   └── rotas/                  # Rotas /auth e /clientes
│   └── tests/                      # Testes unitários e de integração (Vitest + Supertest)
│
├── frontend/                       # Interface web em Next.js + Tailwind CSS
│   ├── Dockerfile                  # Build multi-stage standalone
│   ├── package.json
│   ├── next.config.ts
│   └── src/app/                    # Páginas e layout da aplicação
│
├── database/
│   └── init.sql                    # Schema inicial (clientes, usuarios_admin, refresh_tokens)
│
└── docs/                           # Documentação técnica, ADRs e guias operacionais
```

---

## Como Rodar Localmente

1. Copie o arquivo de exemplo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

2. Gere dois segredos JWT e preencha `ADMIN_PASSWORD`, `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET` no `.env`:
   ```bash
   openssl rand -hex 32
   openssl rand -hex 32
   ```

3. Suba todos os serviços com Docker Compose:
   ```bash
   docker compose up --build
   ```

4. Acesse a aplicação:
   - **Frontend (Painel Admin):** `http://localhost:3000`
   - **Backend (Healthcheck):** `http://localhost:3001/health`
   - **Métricas Prometheus:** `http://localhost:3001/metrics`

---

## Requisitos Técnicos do Projeto

- **Aplicação:** Funcionalidades reais com frontend, backend, persistência em PostgreSQL e execução em nuvem.
- **Infraestrutura como Código:** Provisionamento automatizado e versionado com Terraform.
- **CI/CD:** Pipeline automatizado no GitHub Actions cobrindo verificação de código, testes, build de artefatos, deploy e verificação pós-deploy (*smoke test*).
- **Segurança e Segredos:** Gestão de credenciais via Infisical (sem segredos hardcoded no repositório), senhas com hash `bcrypt`, cookies `HttpOnly`, `helmet` e `rate-limit`.
- **Testes e Qualidade:** Testes unitários e de integração integrados ao pipeline de CI.
- **Observabilidade:** Coleta de métricas (`/metrics`), logs estruturados e dashboards com Prometheus e Grafana.
- **Documentação:** Especificações de arquitetura, ADRs, desenvolvimento, deploy e *teardown* centralizadas em [`docs/`](file:///home/lucasmatias/Documentos/cloudops-lab/docs/README.md).

---

## Equipe e Divisão de Responsabilidades

| Integrante | Papel Principal | Co-responsabilidades |
| :--- | :--- | :--- |
| **Lucas Matias** | Aplicação (Frontend, Backend & PostgreSQL) e Testes | Dockerfiles, `docker-compose.yml` e pipeline de CI |
| **Jeane Vitoria** | Terraform (IaC), Automação e Deploy (CD) | Pipeline de CD, smoke test pós-deploy e guia de *teardown* |
| **Brenno Araujo** | Serviços AWS (3 EC2, VPC, ECR, EBS), Segurança (Infisical) e Observabilidade | Arquitetura em nuvem, ADRs e governança da documentação |

Para detalhes completos da divisão de tarefas, consulte [docs/equipe.md](file:///home/lucasmatias/Documentos/cloudops-lab/docs/equipe.md).

---

## Documentação

- [Índice da Documentação](file:///home/lucasmatias/Documentos/cloudops-lab/docs/README.md)
- [Regras e Diretrizes de Documentação](file:///home/lucasmatias/Documentos/cloudops-lab/docs/REGRAS_DOCUMENTACAO.md)
- [Proposta Inicial do Projeto](file:///home/lucasmatias/Documentos/cloudops-lab/docs/proposta-inicial.md)
- [Organização da Equipe e Divisão de Tarefas](file:///home/lucasmatias/Documentos/cloudops-lab/docs/equipe.md)
- [Arquitetura e Decisões Técnicas (ADRs)](file:///home/lucasmatias/Documentos/cloudops-lab/docs/arquitetura/README.md)
- [Desenvolvimento Local](file:///home/lucasmatias/Documentos/cloudops-lab/docs/desenvolvimento/README.md)
- [Infraestrutura como Código (Terraform)](file:///home/lucasmatias/Documentos/cloudops-lab/docs/infraestrutura/README.md)
- [Guia de Destruição / Teardown](file:///home/lucasmatias/Documentos/cloudops-lab/docs/infraestrutura/teardown.md)
- [Pipelines de CI/CD](file:///home/lucasmatias/Documentos/cloudops-lab/docs/ci-cd/README.md)
- [Segurança e Segredos](file:///home/lucasmatias/Documentos/cloudops-lab/docs/seguranca/README.md)
- [Observabilidade](file:///home/lucasmatias/Documentos/cloudops-lab/docs/observabilidade/README.md)
- [Guia de Deploy em Nuvem](file:///home/lucasmatias/Documentos/cloudops-lab/docs/operacao/deploy.md)
