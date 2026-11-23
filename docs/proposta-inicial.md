# Proposta Inicial do Projeto

Este documento formaliza a proposta inicial do projeto para apresentação e validação nas aulas de acompanhamento da disciplina **Projeto Integrador – Desenvolvimento e Implantação em Nuvem (UFRPE)**.

---

## 1. Identificação do Problema Real / Cenário de Uso

- **Problema identificado:** Lojas de roupas de pequeno e médio porte frequentemente gerenciam o cadastro de seus clientes em planilhas dispersas ou anotações manuais, dificultando a consulta rápida, a atualização de dados de contato e o histórico básico de preferências, além de gerar risco de perda de informações.
- **Público-alvo / Usuários:** Equipe de atendimento, vendedores e gerência de uma loja de roupas.
- **Justificativa da solução em nuvem:** Disponibilizar uma plataforma web centralizada, acessível de qualquer ponto da loja com segurança, com persistência confiável em banco de dados isolado, automação de deploy via contêineres Docker e monitoramento contínuo de disponibilidade na AWS.

---

## 2. Funcionalidades Previstas

- [ ] **Funcionalidade 1:** Cadastro completo de clientes da loja de roupas (nome, e-mail, telefone, CPF/identificador, endereço e preferências de tamanho/estilo).
- [ ] **Funcionalidade 2:** Consulta, busca e listagem paginada de clientes com filtros no painel web.
- [ ] **Funcionalidade 3:** Atualização e remoção de registros de clientes com validação de dados e persistência transacional no PostgreSQL.

---

## 3. Arquitetura Preliminar

- **Frontend:** Aplicação web em **Next.js** empacotada em contêiner **Docker**, executando em uma instância **Amazon EC2** dedicada.
- **Backend:** API REST em **Express com TypeScript** empacotada em contêiner **Docker**, executando em uma instância **Amazon EC2** dedicada, responsável pelas regras de negócio, validações e exposição de métricas.
- **Persistência:** Banco de dados relacional **PostgreSQL** empacotado em contêiner **Docker** (com volume persistente EBS), executando em uma instância **Amazon EC2** dedicada em rede privada/restrita.
- **Nuvem (AWS):** Três instâncias **Amazon EC2** isoladas (uma para cada camada: Frontend, Backend e Banco de Dados), comunicando-se via VPC e Security Groups, com registro de imagens no **Amazon ECR**.

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
> As justificativas técnicas detalhadas (considerando funcionalidade, segurança, escalabilidade, manutenção e disponibilidade) devem ser registradas em [`docs/arquitetura/adrs/`](arquitetura/adrs/README.md).

