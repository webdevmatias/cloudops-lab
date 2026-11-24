# CloudOps Lab

Plataforma de **cadastro e gestão de clientes de uma loja de roupas**, desenvolvida para o Projeto Integrador (Desenvolvimento e Implantação em Nuvem), integrando desenvolvimento de software, infraestrutura como código (Terraform), CI/CD, segurança e observabilidade na AWS.

---

## Objetivo e Proposta

Desenvolver e implantar uma aplicação funcional em ambiente de nuvem para resolver o controle disperso de clientes em lojas de roupas, oferecendo uma interface web centralizada com persistência relacional, autenticação administrativa com refresh token, automação de infraestrutura e monitoramento contínuo.

Todas as escolhas de arquitetura, serviços de nuvem e ferramentas são justificadas considerando funcionalidade, segurança, escalabilidade, manutenção e disponibilidade.

---

## Stack e Arquitetura

- **Frontend:** Next.js (App Router + TypeScript + Tailwind CSS) em contêiner Docker (EC2 dedicada).
- **Backend:** Express + TypeScript (validação Zod, `helmet`, `express-rate-limit`, logs JSON, métricas Prometheus na porta interna `9464` e `/health`) em contêiner Docker (EC2 dedicada).
- **Banco de Dados:** PostgreSQL 16 em contêiner Docker com volume persistente (EC2 dedicada).
- **Autenticação:** Painel Admin com JWT (`accessToken` + `refreshToken` revogável em banco via cookie `HttpOnly`).
- **Infraestrutura e Operação:** AWS (3 instâncias EC2, VPC, Security Groups, ECR), Terraform, GitHub Actions e Infisical.
- **Observabilidade:** Prometheus, Grafana, Loki e Promtail na EC2 do backend, com acesso administrativo por SSM.

---

## Estrutura do Repositório

```text
cloudops-lab/
├── .env.example                    # Modelo de variáveis de ambiente (sem segredos)
├── docker-compose.yml              # Orquestração local (postgres, backend, frontend)
├── .github/workflows/ci.yml        # Pipeline de CI (testes, build e imagens Docker)
├── .github/workflows/cd.yml        # Pipeline de CD (build no ECR e deploy na AWS)
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
│   │   ├── observabilidade/        # Métricas Prometheus e logs JSON
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
├── infra/observabilidade/          # Prometheus, Grafana, Loki e Promtail
│
└── docs/                           # Documentação técnica, ADRs e guias operacionais
```

---

## Como Rodar Localmente

Os segredos de desenvolvimento são gerenciados no **Infisical** e injetados em tempo de execução. O arquivo `.env.example` serve apenas como referência das variáveis esperadas — não crie um `.env` real com credenciais. Em produção AWS, os segredos ficam no **SSM Parameter Store**, conforme o [ADR 006](docs/arquitetura/adrs/006-estrategia-hibrida-de-segredos.md).

1. Instale o **Infisical CLI** (ex: `winget install Infisical.Infisical` no Windows) e autentique-se:
   ```bash
   infisical login
   ```

2. Vincule o diretório ao projeto do Infisical (gera o `.infisical.json`, que pode ser versionado pois não contém segredos):
   ```bash
   infisical init
   ```

3. Suba todos os serviços injetando os segredos do ambiente `dev`:
   ```bash
   infisical run --env=dev -- docker compose up --build
   ```

4. Para rodar backend/frontend manualmente em modo dev:
   ```bash
   infisical run --env=dev -- npm --prefix backend run dev
   infisical run --env=dev -- npm --prefix frontend run dev
   ```

5. Opcional: suba a stack de observabilidade local:
   ```bash
   GRAFANA_ADMIN_PASSWORD=admin docker compose -f infra/observabilidade/docker-compose.yml up -d
   ```

6. Acesse a aplicação:
   - **Frontend (Painel Admin):** `http://localhost:3000`
   - **Backend (Healthcheck):** `http://localhost:3001/health`
   - **Métricas Prometheus (interna):** `http://localhost:9464/metrics`
   - **Grafana local (opcional):** `http://localhost:3002`, se a stack de `infra/observabilidade/` estiver ativa; em produção o acesso é por SSM, conforme o [guia de observabilidade](docs/observabilidade/README.md).

---

## Requisitos Técnicos do Projeto

- **Aplicação:** Funcionalidades reais com frontend, backend, persistência em PostgreSQL e execução em nuvem.
- **Infraestrutura como Código:** Provisionamento automatizado e versionado com Terraform.
- **CI/CD:** Pipeline automatizado no GitHub Actions cobrindo verificação de código, testes, build de artefatos, deploy e verificação pós-deploy (*smoke test*).
- **Segurança e Segredos:** Gestão de credenciais com **Infisical** em desenvolvimento/CI e **SSM Parameter Store** em produção (sem segredos hardcoded no repositório), senhas com hash `bcrypt`, cookies `HttpOnly`, `helmet` e `rate-limit`.
- **Testes e Qualidade:** Testes unitários e de integração integrados ao pipeline de CI.
- **Observabilidade:** Coleta de métricas na porta interna `9464`, logs JSON no Loki e dashboards no Grafana, com acesso por SSM.
- **Documentação:** Especificações de arquitetura, ADRs, desenvolvimento, deploy e *teardown* centralizadas em [`docs/`](docs/README.md).

---

## Equipe e Divisão de Responsabilidades

| Integrante | Papel Principal | Co-responsabilidades |
| :--- | :--- | :--- |
| **Lucas Matias** | Aplicação (Frontend, Backend & PostgreSQL) e Testes | Dockerfiles, `docker-compose.yml` e pipeline de CI |
| **Jeane Vitoria** | Infraestrutura AWS com Terraform (VPC, subnets, NAT, Security Groups, 3 EC2, EBS, ECR), Automação e Deploy (CD) | Deploy via SSM, segredos da aplicação no SSM Parameter Store, smoke test, guias de infraestrutura, deploy e *teardown*, ADRs 004 e 005 |
| **Brenno Araujo** | Observabilidade (Prometheus, Grafana, logs) e Segurança | Ambiente AWS oficial, estratégia de segredos (Infisical), HTTPS, ADRs e governança da documentação |

Para detalhes completos da divisão de tarefas, consulte [docs/equipe.md](docs/equipe.md).

---

## Documentação

- [Índice da Documentação](docs/README.md)
- [Regras e Diretrizes de Documentação](docs/REGRAS_DOCUMENTACAO.md)
- [Proposta Inicial do Projeto](docs/proposta-inicial.md)
- [Organização da Equipe e Divisão de Tarefas](docs/equipe.md)
- [Arquitetura e Decisões Técnicas (ADRs)](docs/arquitetura/README.md)
- [Desenvolvimento Local](docs/desenvolvimento/README.md)
- [Infraestrutura como Código (Terraform)](docs/infraestrutura/README.md)
- [Guia de Destruição / Teardown](docs/infraestrutura/teardown.md)
- [Pipelines de CI/CD](docs/ci-cd/README.md)
- [Segurança e Segredos](docs/seguranca/README.md)
- [Observabilidade](docs/observabilidade/README.md)
- [Guia de Deploy em Nuvem](docs/operacao/deploy.md)
