# Organização da Equipe e Divisão de Tarefas

Este documento descreve a organização do grupo, a metodologia de trabalho colaborativo e a divisão de responsabilidades do projeto **CloudOps Lab** (UFRPE — Projeto Integrador: Desenvolvimento e Implantação em Nuvem).

---

## 1. Integrantes do Grupo

| Integrante | Papel Principal (Owner) | Co-responsabilidades |
| :--- | :--- | :--- |
| **Lucas Matias** | Aplicação (Frontend, Backend & Persistência) e Testes | Pipeline de CI (lint, testes, build Docker) e setup local |
| **Jeane Vitoria** | Infraestrutura AWS com Terraform (VPC, subnets, NAT, Security Groups, 3 EC2, EBS, ECR), Automação e Deploy (CD) | Deploy via SSM, scripts de inicialização, segredos da aplicação no SSM Parameter Store, smoke test, guias de infraestrutura, deploy e *teardown*, ADRs 004 e 005 |
| **Brenno Araujo** | Observabilidade (Prometheus, Grafana, logs) e Segurança | Ambiente AWS oficial, estratégia de segredos (Infisical), HTTPS, ADRs e governança da documentação |

---

## 2. Metodologia de Trabalho: Desenvolvimento Síncrono em Reuniões (Google Meet)

Para garantir que **todos os integrantes participem do desenvolvimento, conheçam a arquitetura completa e compreendam todas as decisões técnicas**, o grupo adota um modelo colaborativo estruturado:

1. **Sessões de *Mob/Pair Prompting* via Google Meet:**
   - O código-fonte, os módulos de infraestrutura e a documentação são construídos de forma síncrona durante reuniões no Google Meet.
   - Os *prompts* são elaborados e refinados em conjunto pelo grupo, com discussão imediata sobre arquitetura, segurança, custo e qualidade antes da aplicação no repositório.
2. **Revisão Coletiva e Nivelamento:**
   - Embora cada integrante lidere tecnicamente uma frente específica (tabela abaixo), todas as entregas passam pela validação do grupo nas reuniões, assegurando domínio compartilhado sobre aplicação, AWS, Terraform, CI/CD, segurança e observabilidade.
3. **Versionamento e Rastreabilidade:**
   - As alterações são registradas no Git seguindo o fluxo **GitFlow** (`main`, `develop`, `feature/*`) e **Conventional Commits em pt-BR**, com commits atômicos e incrementais por funcionalidade.

---

## 3. Matriz Detalhada de Responsabilidades

### 3.1. Lucas Matias — Desenvolvimento da Aplicação, Persistência e Testes
- Implementação da aplicação (**Frontend em Next.js**, **Backend em Express + TypeScript** e modelagem/integração com **PostgreSQL**).
- Criação e validação local dos arquivos de conteinerização (`Dockerfile` de cada serviço e `docker-compose.yml` para desenvolvimento local).
- Implementação dos **testes automatizados** (unitários, de integração e de API).
- Configuração dos estágios de **CI** no GitHub Actions (verificação de código, execução de testes como *quality gate* e build das imagens Docker). A publicação das imagens no ECR acontece no CD, porque o frontend precisa do endereço do backend no build.

### 3.2. Jeane Vitoria — Infraestrutura AWS (Terraform), Automação e Deploy (CD)
- Provisionamento com **Terraform** de toda a infraestrutura AWS: VPC, subnets pública e privada, Internet Gateway, NAT Gateway, Security Groups, 3 instâncias **EC2** com Elastic IPs, volume **EBS** do banco e repositórios **ECR**.
- Automação da configuração das instâncias com **scripts de `user_data`** (instalação do Docker e preparação do disco de dados do banco).
- Gestão dos **segredos da aplicação** no SSM Parameter Store (`criar-segredos.sh`).
- **Deploy automatizado** via SSM no GitHub Actions (`cd.yml`), com **smoke test** pós-deploy.
- Guias de **infraestrutura**, **deploy** e **teardown** ([`teardown.md`](infraestrutura/teardown.md)).
- ADRs **004** (topologia de rede com VPC única) e **005** (acesso administrativo e deploy via SSM).

### 3.3. Brenno Araujo — Observabilidade, Segurança e Ambiente Oficial
- Hospedagem e gestão do **ambiente AWS oficial** no seu Learner Lab (execução do Terraform, segredos da aplicação e credenciais do GitHub).
- Revisão das ADRs **004** e **005**.
- Configuração do gerenciamento de segredos com **Infisical** (aplicação e pipeline CI/CD), integrando ou substituindo o SSM Parameter Store já adotado no deploy, garantindo ausência de credenciais no código e nos logs.
- Implementação da stack de **Observabilidade** (logs estruturados, Prometheus, Grafana, Telegraf/Loki e dashboards), incluindo a proteção do `/metrics`, hoje exposto na porta pública da API.
- Definição sobre **HTTPS** (implementação ou registro do risco em ADR).
- Condução e registro das justificativas técnicas via **ADRs** ([`docs/arquitetura/adrs/`](arquitetura/adrs/README.md)), incluindo as ADRs **001** a **003**, ainda pendentes, e revisão de conformidade da documentação.

---

## 4. Acompanhamento e Fluxo de Entregas

- **Proposta Inicial:** Definida e revisada em conjunto para validação nas aulas de acompanhamento.
- **Execução por *Features*:** Cada frente é desenvolvida em branches `feature/<nome-em-pt-br>` a partir de `develop`, integradas via Pull Request após revisão do grupo.

