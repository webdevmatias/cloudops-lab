# Proposta Inicial do Projeto

Este documento formaliza a proposta inicial do projeto para apresentação e validação nas aulas de acompanhamento da disciplina **Projeto Integrador – Desenvolvimento e Implantação em Nuvem (UFRPE)**.

---

## 1. Identificação do Problema Real / Cenário de Uso

> *A preencher pelo grupo:* Descrever qual problema real ou cenário prático a aplicação resolve e por que a solução proposta se justifica.

- **Problema identificado:** *A definir*
- **Público-alvo / Usuários:** *A definir*
- **Justificativa da solução em nuvem:** *A definir*

---

## 2. Funcionalidades Previstas

- [ ] **Funcionalidade 1:** *A definir (ex: cadastro/autenticação de usuários)*
- [ ] **Funcionalidade 2:** *A definir (ex: operação principal com persistência e consulta)*
- [ ] **Funcionalidade 3:** *A definir (ex: painel/listagem interativa no frontend)*

---

## 3. Arquitetura Preliminar

- **Frontend:** *A definir* (interface web para interação com o usuário)
- **Backend:** *A definir* (API responsável pelas regras de negócio e exposição de métricas)
- **Persistência:** *A definir* (banco de dados relacional ou não relacional)
- **Nuvem (AWS):** Serviços selecionados para computação, rede, armazenamento e registro de imagens (ex: Amazon EC2, ALB, ECR, EBS/S3).

---

## 4. Tecnologias Selecionadas (Visão Inicial)

| Categoria | Tecnologia Prevista | Justificativa Resumida |
| :--- | :--- | :--- |
| **Provedor de Nuvem** | Amazon Web Services (AWS) | Plataforma obrigatória do projeto integrador, com ampla maturidade de serviços de rede e computação. |
| **IaC** | Terraform | Provisionamento declarativo, reproduzível e versionável no Git. |
| **CI/CD** | GitHub Actions | Integração nativa com o repositório Git para testes, build e deploy automatizado. |
| **Contêineres** | Docker + Amazon ECR | Padronização de ambiente entre desenvolvimento local e nuvem. |
| **Segredos** | Infisical | Centralização e injeção segura de credenciais sem exposição no código ou logs. |
| **Observabilidade** | Prometheus, Grafana, Telegraf / Loki | Coleta de métricas, agregação de logs e visualização em dashboards. |

> [!NOTE]
> As justificativas técnicas detalhadas (considerando funcionalidade, segurança, escalabilidade, manutenção e disponibilidade) devem ser registradas em [`docs/arquitetura/adrs/`](file:///home/matias/Documentos/cloudops-lab/docs/arquitetura/adrs/README.md).

