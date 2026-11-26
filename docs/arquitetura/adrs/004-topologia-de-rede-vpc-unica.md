# ADR 004: Topologia de Rede com VPC Única

* **Status:** Proposto
* **Data:** 2026-11-22
* **Autores / Decisores:** Jeane Vitoria (proposta); revisão: Brenno Araujo

---

## 1. Contexto e Problema

A aplicação é composta por três instâncias EC2 com Docker: frontend (Next.js), backend (Express + TypeScript) e PostgreSQL. É preciso definir a topologia de rede na AWS considerando que:

- O frontend e o backend precisam ser acessíveis pela internet. Sem Application Load Balancer, o navegador chama a API do backend diretamente.
- O PostgreSQL **não** pode ser acessível pela internet.
- O ambiente é o AWS Academy Learner Lab, com crédito limitado e restrições de IAM.
- A infraestrutura é provisionada via Terraform e precisa ser simples de criar e destruir.

## 2. Opções Consideradas

### Opção A: VPC única com subnet pública e subnet privada
* **Prós:**
  - Menor quantidade de recursos para declarar, manter e destruir.
  - O isolamento do banco é garantido por três camadas: subnet sem rota para o Internet Gateway, instância sem IP público e Security Group que aceita a porta 5432 somente a partir do Security Group do backend.
  - Comunicação entre backend e banco pela rota `local`, sem configuração adicional.
* **Contras:**
  - Isolamento entre aplicação e dados depende de rotas e Security Groups, e não de fronteira de rede separada.

### Opção B: Duas VPCs (aplicação e dados) conectadas por VPC Peering
* **Prós:**
  - Isolamento mais forte entre as camadas de aplicação e de dados.
* **Contras:**
  - Exige VPC Peering, rotas nas duas VPCs e CIDRs sem sobreposição.
  - A VPC de dados também precisa de saída para a internet (NAT Gateway ou VPC endpoints) para baixar imagens e pacotes.
  - Mais recursos no Terraform, no teardown e na documentação, sem ganho prático de segurança para o escopo do projeto.

### Opção C: Application Load Balancer na frente do frontend e do backend
* **Prós:**
  - Ponto de entrada único, health checks e possibilidade de várias instâncias.
* **Contras:**
  - Exige subnets públicas em duas zonas de disponibilidade, listeners e target groups.
  - Custo por hora adicional, relevante diante do crédito limitado do Learner Lab.
  - O projeto usa uma instância por camada, então o balanceamento não traz benefício.

---

## 3. Decisão Escolhida e Justificativa Técnica

Adota-se a **Opção A**: uma VPC (`10.0.0.0/16`) em uma zona de disponibilidade (`us-east-1a`), com:

- **Subnet pública** (`10.0.1.0/24`) para as EC2 do frontend e do backend, com rota `0.0.0.0/0` para o Internet Gateway.
- **Subnet privada** (`10.0.2.0/24`) para a EC2 do PostgreSQL, sem rota para o Internet Gateway.
- Sem Application Load Balancer.

- **Funcionalidade:** Atende ao acesso público do frontend e do backend e ao isolamento do banco.
- **Segurança:** O banco não possui IP público nem rota de entrada pela internet. O acesso à porta 5432 será restrito ao Security Group do backend.
- **Escalabilidade & Disponibilidade:** Uma única zona de disponibilidade é suficiente para o escopo acadêmico. A estrutura permite adicionar subnets em outra zona e um ALB no futuro, se necessário.
- **Manutenção & Complexidade:** Menor número de recursos e de pontos de falha no Terraform, facilitando o aprendizado, a revisão e o teardown.
- **Custo:** VPC, subnets, Internet Gateway e tabelas de rotas não têm custo. Evita-se o custo por hora do ALB e de componentes extras de rede.

---

## 4. Consequências

- **Positivas:**
  - Rede simples, reprodutível e de baixo custo.
  - Backend e banco se comunicam pela rota local da VPC.
- **Negativas / Riscos:**
  - Uma única zona de disponibilidade não oferece alta disponibilidade. Aceito para o escopo acadêmico.
  - O backend fica exposto diretamente à internet na sua porta. Mitigação: Security Group liberando apenas a porta da API.
  - A subnet privada ainda precisa de saída para a internet (NAT Gateway) para baixar a imagem do PostgreSQL, o que tem custo por hora. Mitigação: destruir o ambiente após o uso, conforme o [teardown](../../infraestrutura/teardown.md).
