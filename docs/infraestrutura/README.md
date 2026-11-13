# Infraestrutura como Código (Terraform)

Este documento descreve a estrutura de infraestrutura em nuvem do projeto **CloudOps Lab**, provisionada e gerenciada via **Terraform**.

---

## 1. Visão Geral da Infraestrutura

A infraestrutura é declarada em código (IaC) e mantida sob controle de versão. Ela engloba:
- **Rede:** Subnets, tabelas de roteamento, regras de firewall / Security Groups e gateways.
- **Computação:** Máquinas virtuais, contêineres ou serviços gerenciados onde a aplicação (frontend/backend) executa.
- **Persistência:** Instância ou serviço de banco de dados e volumes de armazenamento persistente.
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

