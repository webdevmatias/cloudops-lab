# Organização da Equipe e Divisão de Tarefas

Este documento descreve a organização do grupo, a metodologia de trabalho colaborativo e a divisão de responsabilidades do projeto **CloudOps Lab** (UFRPE — Projeto Integrador: Desenvolvimento e Implantação em Nuvem).

---

## 1. Integrantes do Grupo

| Integrante | Papel Principal (Owner) | Co-responsabilidades |
| :--- | :--- | :--- |
| **Lucas Matias** | Aplicação (Frontend, Backend & Persistência) e Testes | Pipeline de CI (lint, testes, build Docker) e setup local |
| **Jeane Vitoria** | Terraform (IaC), Automação e Deploy (CD) | Pipeline de CD (deploy/verificação pós-deploy), Ansible e guia de *teardown* |
| **Brenno Araujo** | Serviços AWS, Segurança (Infisical) e Observabilidade | Arquitetura em nuvem, ADRs e governança da documentação |

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
- Configuração dos estágios de **CI** no GitHub Actions (verificação de código, execução de testes como *quality gate* e build/publicação de imagens Docker).

### 3.2. Jeane Vitoria — Terraform (IaC), Automação e Deploy (CD)
- Escrita e modularização dos arquivos **Terraform** para provisionamento automatizado e versionamento no Git.
- Configuração de ambiente e automação (Ansible / scripts de inicialização, quando aplicável).
- Integração da etapa de **Deploy Automatizado** e **Smoke Test Pós-Deploy** no GitHub Actions.
- Manutenção e validação do procedimento de destruição de recursos ([`teardown.md`](file:///home/matias/Documentos/cloudops-lab/docs/infraestrutura/teardown.md)).

### 3.3. Brenno Araujo — Serviços AWS, Segurança e Observabilidade
- Subida, configuração e gestão dos serviços na **AWS** (3 instâncias **EC2** dedicadas para Frontend, Backend e PostgreSQL, VPC/Subnets/Security Groups, IAM, ECR e EBS).
- Configuração do gerenciamento de segredos com **Infisical** (aplicação e pipeline CI/CD), garantindo ausência de credenciais no código e nos logs.
- Implementação da stack de **Observabilidade** (exposição de `/metrics`, logs estruturados, Prometheus, Grafana, Telegraf/Loki e dashboards).
- Condução e registro das justificativas técnicas via **ADRs** ([`docs/arquitetura/adrs/`](file:///home/matias/Documentos/cloudops-lab/docs/arquitetura/adrs/README.md)) e revisão de conformidade da documentação.

---

## 4. Acompanhamento e Fluxo de Entregas

- **Proposta Inicial:** Definida e revisada em conjunto para validação nas aulas de acompanhamento.
- **Execução por *Features*:** Cada frente é desenvolvida em branches `feature/<nome-em-pt-br>` a partir de `develop`, integradas via Pull Request após revisão do grupo.

