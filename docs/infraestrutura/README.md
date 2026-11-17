# Infraestrutura como Código (Terraform)

Este documento descreve a estrutura de infraestrutura em nuvem do projeto **CloudOps Lab**, provisionada e gerenciada via **Terraform**.

---

## 1. Visão Geral da Infraestrutura

A infraestrutura é declarada em código (IaC) e mantida sob controle de versão. Ela engloba:
- **Rede:** VPC, subnets, tabelas de roteamento, gateways e Security Groups restringindo o acesso entre camadas (ex.: PostgreSQL acessível apenas pela EC2 do Backend).
- **Computação:** Três instâncias **Amazon EC2** dedicadas executando **Docker** — uma para o **Frontend (Next.js)**, uma para o **Backend (Express + TypeScript)** e uma para o **Banco de Dados (PostgreSQL)**.
- **Persistência:** Volumes EBS anexados à EC2 de banco de dados para persistência durável dos dados do PostgreSQL.
- **Observabilidade:** Componentes para coleta e visualização de métricas/logs (Prometheus, Grafana, Telegraf).

---

## 2. Pré-requisitos

Para interagir com o código do Terraform, certifique-se de ter instalado:
- **Terraform CLI** (versão recomendada: `>= 1.5.0`)
- **CLI do Provedor Cloud** configurada com credenciais válidas (sem commitar chaves no repositório).
- Acesso ao gerenciador de segredos (caso variáveis sensíveis sejam injetadas).

---

## 3. Estrutura de Diretórios Recomendada

```text
infra/
├── main.tf             # Orquestração principal de recursos e providers
├── variables.tf        # Declaração das variáveis configuráveis
├── outputs.tf          # Saídas úteis (ex: IPs públicos, endpoints, DNS)
├── versions.tf         # Versões mínimas do Terraform e providers
├── terraform.tfvars.example # Exemplo de valores de variáveis (sem segredos)
└── modules/            # Módulos reutilizáveis (rede, computação, banco)
```

---

## 4. Ciclo de Vida e Comandos

### 4.1. Inicialização
Prepara o diretório de trabalho e baixa os provedores necessários:
```bash
terraform init
```

### 4.2. Planejamento (Dry Run)
Gera o plano de execução e exibe o que será criado/alterado/destruído:
```bash
terraform plan -out=tfplan
```

### 4.3. Aplicação
Aplica as mudanças na nuvem:
```bash
terraform apply tfplan
```

---

## 5. Destruição e Remoção de Recursos (Teardown)

> [!WARNING]
> Para evitar custos indesejados e manter o ambiente limpo após testes e avaliações, é **obrigatório** seguir o procedimento de remoção:
> 👉 [**Guia de Destruição de Recursos (Teardown)**](file:///home/matias/Documentos/cloudops-lab/docs/infraestrutura/teardown.md)

