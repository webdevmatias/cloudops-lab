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
3. Tenha as credenciais do provedor de nuvem carregadas em seu terminal.

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
- [ ] Chaves de acesso temporárias revogadas.

