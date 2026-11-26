# Infraestrutura como Código (Terraform)

Este documento descreve a infraestrutura em nuvem do projeto **CloudOps Lab**, provisionada e gerenciada via **Terraform** no diretório [`infra/`](../../infra/).

---

## 1. Visão Geral

A infraestrutura é declarada em código (IaC) e versionada no Git. O ambiente de nuvem utilizado é o **AWS Academy Learner Lab**, na região `us-east-1`.

| Camada | Recursos | Situação |
| :--- | :--- | :--- |
| **Rede** | VPC, subnet pública, subnet privada, Internet Gateway e tabelas de rotas | Implementado |
| **Saída da subnet privada** | Elastic IP e NAT Gateway | Implementado |
| **Segurança** | Security Groups do frontend, backend e banco de dados | Implementado |
| **Computação** | 3 instâncias EC2 com Docker (frontend, backend e PostgreSQL) e Elastic IPs do frontend e do backend | Implementado |
| **Observabilidade** | Prometheus, Grafana, Loki e Promtail na EC2 do backend | Implementado |
| **Saídas** | URLs, IP privado do banco e ids das instâncias (`terraform output`) | Implementado |
| **Aplicação nas instâncias** | Contêineres do frontend, backend e PostgreSQL em execução | Pendente (deploy) |
| **Registro de imagens** | Repositórios ECR do frontend e do backend | Implementado |
| **Persistência** | Volume EBS da EC2 do PostgreSQL | Implementado |

Decisões relacionadas:
- Topologia de rede: [ADR 004](../arquitetura/adrs/004-topologia-de-rede-vpc-unica.md).
- Acesso administrativo e deploy via SSM, sem SSH: [ADR 005](../arquitetura/adrs/005-acesso-administrativo-via-ssm.md).

---

## 2. Topologia de Rede

```mermaid
flowchart TB
    Internet((Internet))

    subgraph VPC ["VPC cloudops-lab-vpc (10.0.0.0/16)"]
        IGW[Internet Gateway<br/>cloudops-lab-igw]

        subgraph Publica ["Subnet pública (10.0.1.0/24) - us-east-1a"]
            Front[EC2 Frontend]
            subgraph EC2Back [EC2 Backend]
                Back[API]
                Obs[Prometheus + Grafana<br/>Loki + Promtail]
            end
            NAT[NAT Gateway<br/>cloudops-lab-nat]
        end

        subgraph Privada ["Subnet privada (10.0.2.0/24) - us-east-1a"]
            DB[(EC2 PostgreSQL)]
        end
    end

    Internet <-->|TCP 3000 e 3001| IGW
    IGW <--> Front
    IGW <--> Back
    Back -->|TCP 5432| DB
    Back -->|:9464/metrics| Obs
    Ops[Operador] -.->|SSM Port Forwarding| Obs
    DB -.->|somente saída| NAT
    NAT -.-> IGW
```

> [!NOTE]
> As instâncias EC2 já são criadas pelo Terraform, com Docker instalado, mas a aplicação ainda não é implantada nelas. Até o deploy existir, as portas 3000 e 3001 recusam conexões.

### 2.1. Recursos de Rede Provisionados

| Recurso Terraform | Nome (tag `Name`) | Configuração |
| :--- | :--- | :--- |
| `aws_vpc.principal` | `cloudops-lab-vpc` | CIDR `10.0.0.0/16`, DNS hostnames habilitado |
| `aws_subnet.publica` | `cloudops-lab-subnet-publica` | CIDR `10.0.1.0/24`, `us-east-1a`, IP público automático |
| `aws_subnet.privada` | `cloudops-lab-subnet-privada` | CIDR `10.0.2.0/24`, `us-east-1a`, sem IP público |
| `aws_internet_gateway.principal` | `cloudops-lab-igw` | Anexado à VPC |
| `aws_route_table.publica` | `cloudops-lab-rt-publica` | Rota `0.0.0.0/0` para o Internet Gateway |
| `aws_route_table_association.publica` | - | Associa a subnet pública à tabela de rotas pública |
| `aws_eip.nat` | `cloudops-lab-eip-nat` | IP público fixo usado pelo NAT Gateway |
| `aws_nat_gateway.principal` | `cloudops-lab-nat` | Fica na subnet pública e usa o Elastic IP |
| `aws_route_table.privada` | `cloudops-lab-rt-privada` | Rota `0.0.0.0/0` para o NAT Gateway |
| `aws_route_table_association.privada` | - | Associa a subnet privada à tabela de rotas privada |

### 2.2. Tabelas de Rotas

**Tabela pública** (`cloudops-lab-rt-publica`), associada à subnet pública:

| Destino | Alvo |
| :--- | :--- |
| `10.0.0.0/16` | `local` |
| `0.0.0.0/0` | Internet Gateway |

**Tabela privada** (`cloudops-lab-rt-privada`), associada à subnet privada:

| Destino | Alvo |
| :--- | :--- |
| `10.0.0.0/16` | `local` |
| `0.0.0.0/0` | NAT Gateway |

O NAT Gateway fica na subnet **pública**, pois precisa da rota para o Internet Gateway. Ele permite que a EC2 do PostgreSQL inicie conexões de saída (download de imagens e pacotes e registro no SSM), mas não aceita conexões iniciadas pela internet.

> [!WARNING]
> O NAT Gateway e o Elastic IP têm custo por hora e, no Learner Lab, **continuam ativos após o fim da sessão**. Destrua-os ao final de cada dia de trabalho, conforme a [remoção parcial do NAT](teardown.md#5-remoção-parcial-somente-o-nat-gateway).

### 2.3. Security Groups

Definidos em [`infra/seguranca.tf`](../../infra/seguranca.tf). As regras usam os recursos `aws_vpc_security_group_ingress_rule` e `aws_vpc_security_group_egress_rule`, separados do grupo.

| Security Group | Entrada | Origem | Motivo |
| :--- | :--- | :--- | :--- |
| `cloudops-lab-sg-frontend` | TCP 3000 | `0.0.0.0/0` | Acesso dos usuários ao Next.js |
| `cloudops-lab-sg-backend` | TCP 3001 | `0.0.0.0/0` | O navegador chama a API diretamente (`NEXT_PUBLIC_API_URL`) |
| `cloudops-lab-sg-banco` | TCP 5432 | `cloudops-lab-sg-backend` | Somente o backend acessa o PostgreSQL |

- **Saída:** os três grupos liberam todo o tráfego de saída (`0.0.0.0/0`), necessário para baixar imagens, pacotes e para o agente do SSM. O Terraform não cria a regra de saída padrão da AWS, por isso ela é declarada explicitamente.
- **Sem porta 22:** nenhuma instância aceita SSH. O acesso administrativo e o deploy são feitos pelo SSM Session Manager ([ADR 005](../arquitetura/adrs/005-acesso-administrativo-via-ssm.md)).
- **Observabilidade:** a porta `9464` (métricas) não é aberta no Security Group. Prometheus (`9090`) e Grafana (`3002`) escutam somente em `127.0.0.1` na EC2 do backend; o acesso é feito por SSM Port Forwarding.
- **Descrições:** as descrições dos grupos e das regras não aceitam acentos. Alterar a descrição de um grupo faz o Terraform destruí-lo e recriá-lo.

### 2.4. Instâncias EC2

Definidas em [`infra/instancias.tf`](../../infra/instancias.tf). As três usam Ubuntu 24.04 (a imagem mais recente da Canonical, obtida pelo `data "aws_ami" "ubuntu"`), o perfil `LabInstanceProfile` e Docker. O frontend e o banco usam `t3.micro`; o backend usa `t3.small` para acomodar também a stack de observabilidade.

| Recurso Terraform | Nome (tag `Name`) | Tipo | Subnet | Security Group | IP público |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `aws_instance.frontend` | `cloudops-lab-frontend` | `t3.micro` | Pública | `cloudops-lab-sg-frontend` | Elastic IP `aws_eip.frontend` |
| `aws_instance.backend` | `cloudops-lab-backend` | `t3.small` | Pública | `cloudops-lab-sg-backend` | Elastic IP `aws_eip.backend` |
| `aws_instance.banco` | `cloudops-lab-banco` | `t3.micro` | Privada | `cloudops-lab-sg-banco` | Nenhum |

**Instalação do Docker (`user_data`):** na primeira inicialização, o frontend e o backend executam o script [`infra/scripts/instalar-docker.sh`](../../infra/scripts/instalar-docker.sh), que instala o Docker e o Docker Compose. O banco executa o [`infra/scripts/preparar-banco.sh`](../../infra/scripts/preparar-banco.sh), que prepara o disco de dados (seção 2.5) e, em seguida, instala o Docker. A EC2 do banco baixa os pacotes pelo NAT Gateway.

> [!IMPORTANT]
> - O `user_data` roda **apenas na criação** da instância. No frontend e no backend, alterações no script não afetam instâncias que já existem. No banco, `user_data_replace_on_change = true` faz o Terraform **recriar** a instância quando o script muda, o que é seguro porque os dados ficam no volume separado.
> - O script precisa ter final de linha LF. O arquivo [`.gitattributes`](../../.gitattributes) força isso para todos os arquivos `.sh`. Com CRLF, o script falha na instância sem nenhum erro no `terraform apply`.

**Elastic IPs:** o Learner Lab para as instâncias ao fim de cada sessão, e o IP público automático muda a cada reinício. Os Elastic IPs mantêm fixos os endereços do frontend e do backend. O endereço do backend é usado pelo frontend no `NEXT_PUBLIC_API_URL`. Após um `terraform destroy` completo, um novo `apply` cria IPs diferentes.

**Verificação:** a instalação pode ser conferida acessando a instância pelo SSM Session Manager (em **EC2 → Instâncias → Conectar → SSM Session Manager**) e executando:

```bash
docker --version
curl -I https://www.google.com   # na EC2 do banco, confirma a saída pelo NAT
```

### 2.5. Disco de Dados do PostgreSQL

Os dados do PostgreSQL ficam em um volume EBS separado do disco principal da instância. Assim, se a EC2 do banco for recriada, o volume é plugado na nova instância e os dados são mantidos.

| Recurso Terraform | Nome (tag `Name`) | Configuração |
| :--- | :--- | :--- |
| `aws_ebs_volume.dados_banco` | `cloudops-lab-dados-banco` | 10 GB, `gp3`, criptografado, na mesma zona da subnet privada |
| `aws_volume_attachment.dados_banco` | - | Pluga o volume na EC2 do banco como `/dev/sdf`. Desliga a instância antes de desplugar, para não corromper os dados |

O script [`preparar-banco.sh`](../../infra/scripts/preparar-banco.sh) recebe o id do volume do Terraform, por meio da função `templatefile()`, e executa:

1. Aguarda o volume aparecer na instância, por até 5 minutos. Ele é identificado pelo id em `/dev/disk/by-id/`, pois o nome `/dev/sdf` aparece como `/dev/nvme1n1` em instâncias `t3`.
2. Formata o volume em `ext4` com o rótulo `dados-banco` **somente se ele ainda não tiver sistema de arquivos**. Um volume com dados nunca é formatado.
3. Monta o volume em `/dados`, registrando-o no `/etc/fstab` pelo rótulo, com `nofail`, para montar novamente a cada reinício.
4. Cria a pasta `/dados/postgres`, onde o PostgreSQL grava os dados.

**Verificação**, pelo SSM Session Manager na EC2 do banco:

```bash
df -h /dados                  # deve mostrar um disco de cerca de 10 GB
grep dados /etc/fstab
```

Em caso de falha, o log do `user_data` fica em `/var/log/cloud-init-output.log`.

> [!WARNING]
> O `terraform destroy` completo **apaga o volume e todos os dados do banco**. Antes do teardown, exporte os dados que precisarem ser mantidos.

### 2.6. Repositórios de Imagens (ECR)

Definidos em [`infra/ecr.tf`](../../infra/ecr.tf). A CI envia as imagens para esses repositórios e o deploy as baixa nas instâncias. O PostgreSQL usa a imagem oficial do Docker Hub e não tem repositório próprio.

| Recurso Terraform | Repositório | Configuração |
| :--- | :--- | :--- |
| `aws_ecr_repository.frontend` | `cloudops-lab-frontend` | Tags mutáveis, varredura de vulnerabilidades a cada push, `force_delete` |
| `aws_ecr_repository.backend` | `cloudops-lab-backend` | Tags mutáveis, varredura de vulnerabilidades a cada push, `force_delete` |

- **Tags mutáveis** permitem reenviar a mesma tag (por exemplo, `latest`) a cada nova versão.
- **`force_delete`** permite que o `terraform destroy` apague os repositórios mesmo com imagens dentro. Sem ele, o teardown falha.
- As URLs dos repositórios ficam no output `repositorios_ecr`.

### 2.7. Tags

Todos os recursos recebem automaticamente as tags abaixo, definidas em `default_tags` no provider:

| Tag | Valor |
| :--- | :--- |
| `Projeto` | Valor da variável `projeto` |
| `GerenciadoPor` | `terraform` |

### 2.8. Stack de Observabilidade

A stack fica em [`infra/observabilidade/`](../../infra/observabilidade/) e é enviada à EC2 do backend pelo deploy:

| Serviço | Imagem | Função |
| :--- | :--- | :--- |
| Prometheus | `prom/prometheus` | Coleta `http://host.docker.internal:9464/metrics` |
| Grafana | `grafana/grafana` | Dashboards e consultas ao Loki |
| Loki | `grafana/loki` | Armazenamento de logs por 24h |
| Promtail | `grafana/promtail` | Coleta logs Docker e envia ao Loki |

- Prometheus e Grafana escutam apenas em `127.0.0.1`; o Loki fica na rede interna do Compose.
- O acesso é feito por SSM Port Forwarding, conforme o [guia de observabilidade](../observabilidade/README.md#5-acesso-em-produção-ssm-port-forwarding).
- A stack é declarada em Docker Compose, com limites de memória e volumes nomeados.
- O único recurso Terraform alterado é o tipo da EC2 do backend (`t3.small`); não há nova instância, Security Group ou volume.

---

## 3. Pré-requisitos

- **Terraform CLI** `>= 1.5.0`
- **AWS CLI v2**
- Acesso ao **AWS Academy Learner Lab** da disciplina

No Windows, as duas ferramentas podem ser instaladas com o `winget`:

```powershell
winget install Hashicorp.Terraform
winget install Amazon.AWSCLI
```

Após a instalação, feche e abra novamente o terminal (ou o editor) para que o `PATH` seja atualizado.

---

## 4. Configuração das Credenciais (Learner Lab)

O Terraform lê as credenciais da AWS a partir dos arquivos de configuração do AWS CLI, localizados **fora do repositório**.

> [!CAUTION]
> Nunca copie as credenciais para arquivos dentro do repositório, para a documentação ou para mensagens. Os valores abaixo são placeholders.

1. Inicie o Learner Lab (**Start Lab**) e aguarde o indicador **AWS** ficar verde.
2. Clique em **AWS Details** e, ao lado de **AWS CLI**, clique em **Show**.
3. Copie o bloco exibido para o arquivo `~/.aws/credentials` (no Windows: `C:\Users\<USUARIO>\.aws\credentials`, sem extensão):

   ```ini
   [default]
   aws_access_key_id=<AWS_ACCESS_KEY_ID>
   aws_secret_access_key=<AWS_SECRET_ACCESS_KEY>
   aws_session_token=<AWS_SESSION_TOKEN>
   ```

4. Crie o arquivo `~/.aws/config` com a região (apenas uma vez):

   ```ini
   [default]
   region = us-east-1
   ```

5. Valide o acesso:

   ```bash
   aws sts get-caller-identity
   ```

   O campo `Arn` deve conter `voclabs`.

> [!IMPORTANT]
> As credenciais do Learner Lab são temporárias e mudam a cada sessão. Erros como `ExpiredToken` ou `InvalidClientTokenId` indicam que é preciso repetir os passos 1 a 3.

### 4.1. Restrições do Learner Lab

- Não é possível criar roles ou usuários IAM. Para instâncias EC2, utiliza-se o perfil existente `LabInstanceProfile`.
- O `LabInstanceProfile` permite o acesso pelo SSM Session Manager (testado em 2026-11-22). Por isso o par de chaves SSH `vockey` não é utilizado.
- O crédito do laboratório é limitado. Recursos com custo por hora (EC2, NAT Gateway, Elastic IP) devem ser destruídos após o uso.
- Ao fim de cada sessão, o Learner Lab **para** as instâncias EC2, mas o NAT Gateway e os Elastic IPs continuam ativos e cobrando.
- Quando a sessão termina, as credenciais antigas passam a ser bloqueadas pela política `voc-cancel-cred`. Erros de `UnauthorizedOperation` que citam essa política indicam que é preciso renovar as credenciais.

---

## 5. Estrutura de Diretórios

```text
infra/
├── terraform.tf         # Versão mínima do Terraform e do provider AWS
├── variables.tf         # Variáveis de entrada
├── main.tf              # Provider, rede e NAT Gateway
├── seguranca.tf         # Security Groups e regras
├── instancias.tf        # Instâncias EC2, Elastic IPs e disco de dados do banco
├── ecr.tf               # Repositórios de imagens
├── outputs.tf           # Valores exibidos após o apply
├── observabilidade/     # Stack Prometheus, Grafana, Loki e Promtail
├── deploy/              # Scripts de deploy executados via SSM
├── scripts/
│   ├── instalar-docker.sh  # user_data do frontend e do backend: instala Docker e Docker Compose
│   └── preparar-banco.sh   # user_data do banco: prepara o disco de dados e instala o Docker
└── .terraform.lock.hcl  # Versões travadas dos providers (versionado)
```

Arquivos gerados localmente e **não versionados** (ignorados pelo `.gitignore`): `.terraform/`, `terraform.tfstate`, `terraform.tfstate.backup`, `tfplan` e `*.tfvars`.

---

## 6. Variáveis

| Variável | Descrição | Padrão |
| :--- | :--- | :--- |
| `regiao` | Região AWS onde os recursos são criados. | `us-east-1` |
| `projeto` | Nome do projeto, usado como prefixo nos nomes e nas tags dos recursos. | `cloudops-lab` |

---

## 7. Ciclo de Vida e Comandos

Todos os comandos são executados dentro de `infra/`:

```bash
cd infra/
```

### 7.1. Inicialização
Baixa o provider AWS na versão travada pelo `.terraform.lock.hcl`:
```bash
terraform init
```

### 7.2. Formatação e Validação
Padroniza a formatação e verifica a sintaxe, sem acessar a AWS:
```bash
terraform fmt
terraform validate
```

### 7.3. Planejamento
Consulta a AWS e exibe o que será criado, alterado ou destruído, sem aplicar nada:
```bash
terraform plan -out=tfplan
```

Antes de aplicar, confira o resumo `Plan: X to add, Y to change, Z to destroy`. Um `destroy` inesperado indica problema.

### 7.4. Aplicação
Aplica exatamente o plano revisado:
```bash
terraform apply tfplan
```

### 7.5. Saídas (Outputs)
Ao final de cada `apply`, o Terraform exibe os valores definidos em [`infra/outputs.tf`](../../infra/outputs.tf). Para consultá-los a qualquer momento:
```bash
terraform output
```

| Output | Conteúdo | Uso |
| :--- | :--- | :--- |
| `url_frontend` | `http://<IP_FRONTEND>:3000` | Acesso ao site |
| `url_api` | `http://<IP_BACKEND>:3001` | `NEXT_PUBLIC_API_URL` no build do frontend |
| `ip_privado_banco` | IP do PostgreSQL na subnet privada | `DATABASE_URL` do backend |
| `ids_instancias` | Mapa com os ids das três instâncias | Acesso e deploy via SSM |
| `repositorios_ecr` | Mapa com as URLs dos repositórios do frontend e do backend | Envio das imagens pela CI e download pelo deploy |

Para obter um único valor sem aspas, por exemplo em scripts:
```bash
terraform output -raw url_api
```

### 7.6. State
O state (`terraform.tfstate`) é mantido **localmente** na máquina de quem executa o `apply`. Por isso, apenas uma pessoa deve aplicar e destruir o ambiente por vez, e os outputs só podem ser consultados nessa máquina. A adoção de backend remoto (S3) está em aberto.

---

## 8. Destruição e Remoção de Recursos (Teardown)

> [!WARNING]
> Para evitar consumo do crédito do Learner Lab e manter o ambiente limpo após testes e avaliações, é **obrigatório** seguir o procedimento de remoção:
> 👉 [**Guia de Destruição de Recursos (Teardown)**](teardown.md)
