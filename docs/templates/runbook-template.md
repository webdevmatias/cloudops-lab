# Runbook: [Nome do Procedimento]

* **Versão:** 1.0
* **Última Atualização:** AAAA-MM-DD
* **Objetivo:** [Descrição clara e suscinta do que este procedimento realiza]

---

## 1. Pré-requisitos e Dependências

Ferramentas, acessos, permissões e variáveis necessárias antes de iniciar:
- [ ] Acesso ao terminal com CLI instalada (ex: AWS CLI, Terraform, Docker).
- [ ] Variáveis de ambiente configuradas.
- [ ] Permissões de IAM ou papéis necessários.

---

## 2. Passo a Passo de Execução

Descreva as etapas ordenadas com comandos explícitos:

### Passo 1: [Nome da Etapa]
```bash
# Comando demonstrativo
echo "executando etapa 1"
```

### Passo 2: [Nome da Etapa]
```bash
# Comando demonstrativo
echo "executando etapa 2"
```

---

## 3. Validação e Teste de Sucesso

Como comprovar que o procedimento foi concluído com êxito:
1. Executar comando de verificação:
   ```bash
   curl -I https://exemplo.com/health
   ```
2. Saída esperada: `HTTP/1.1 200 OK`.

---

## 4. Rollback / Procedimento de Recuperação

Em caso de falha durante a execução:
1. Passos para reverter o estado com segurança:
   ```bash
   # Comando de rollback
   ```
2. Contatos ou canais de suporte em caso de contingência.

