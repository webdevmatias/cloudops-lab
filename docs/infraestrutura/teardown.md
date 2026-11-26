# Guia de Destruição e Remoção de Recursos (Teardown)

Este documento detalha o procedimento seguro para destruição e remoção completa dos recursos provisionados na nuvem, garantindo a eliminação de cobranças e a limpeza do ambiente.

---

## 1. Importância e Requisitos

Conforme os requisitos do projeto, o repositório deve documentar com precisão os procedimentos necessários para a **remoção dos recursos**.
Isso evita:
- Custos inesperados de nuvem.
- Recursos órfãos (IPs elásticos, volumes de disco desanexados, Load Balancers ociosos).
- Conflitos de nomenclatura em futuros provisionamentos.

---

## 2. Pré-requisitos para Remoção

Antes de executar a destruição:
1. Certifique-se de que os dados relevantes foram exportados (se houver necessidade de backup/evidência).
2. Verifique se você está apontando para o ambiente correto (`workspace` ou conta adequada).
3. Tenha as credenciais do provedor de nuvem carregadas em seu terminal. No AWS Academy Learner Lab, as credenciais expiram a cada sessão: inicie o laboratório e atualize o arquivo `~/.aws/credentials` conforme a [seção 4 do guia de infraestrutura](README.md#4-configuração-das-credenciais-learner-lab).
4. Execute o teardown na mesma máquina que executou o `apply`, pois o state do Terraform é mantido localmente.

---

## 3. Passo a Passo de Destruição

### Passo 1: Navegar até o diretório de infraestrutura
```bash
cd infra/
```

### Passo 2: Executar o Planejamento de Destruição
Analise com atenção a lista de recursos que serão destruídos:
```bash
terraform plan -destroy
```

### Passo 3: Executar a Destruição

> [!CAUTION]
> Este comando remove **todos** os recursos gerenciados pelo Terraform sem pedir confirmação, e a operação não pode ser desfeita. Dados armazenados no PostgreSQL serão perdidos. Execute somente após revisar o plano do passo 2.

Após validar o plano:
```bash
terraform destroy -auto-approve
```

---

## 4. Verificação Pós-Teardown (Checklist de Limpeza)

Após a conclusão do `terraform destroy`, faça uma verificação de garantia no console da nuvem ou via CLI:

- [ ] Nenhuma instância de máquina virtual ou contêiner em execução.
- [ ] Nenhum Load Balancer ativo.
- [ ] Volumes de armazenamento anexados/desanexados eliminados.
- [ ] Endereços IP estáticos/elásticos desalocados.
- [ ] Nenhum repositório `cloudops-lab-*` restante no ECR.
- [ ] Nenhum NAT Gateway com status `Available` (em **VPC → NAT gateways**, ele pode aparecer como `Deleted` por algum tempo).
- [ ] Chaves de acesso temporárias revogadas.

---

## 5. Remoção Parcial: Somente o NAT Gateway

O NAT Gateway e o seu Elastic IP são cobrados por hora mesmo sem uso e continuam ativos após o fim da sessão do Learner Lab. Ao final de um dia de trabalho, é possível removê-los e manter o restante da rede, que não tem custo:

```bash
cd infra/
terraform destroy -target="aws_nat_gateway.principal" -target="aws_eip.nat"
```

O plano exibido deve listar apenas:
- `aws_nat_gateway.principal`
- `aws_eip.nat`
- `aws_route_table.privada` e `aws_route_table_association.privada`, que dependem do NAT

Digite `yes` somente se nenhum outro recurso aparecer na lista. Para recriar o NAT na próxima sessão, execute `terraform plan -out=tfplan` e `terraform apply tfplan` normalmente.

> [!NOTE]
> Sem o NAT, a EC2 do PostgreSQL perde a saída para a internet e o acesso pelo SSM. O banco continua acessível pelo backend.

