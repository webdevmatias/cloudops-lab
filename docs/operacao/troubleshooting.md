# Guia de Troubleshooting e Diagnóstico

Este documento reúne procedimentos para identificação e resolução de problemas comuns na aplicação, infraestrutura ou pipelines do projeto **CloudOps Lab**.

---

## 1. Problemas de Conexão com o Banco de Dados

* **Sintoma:** Backend falha na inicialização com mensagens como `Connection refused` ou `Timeout connecting to database`.
* **Causas Prováveis:**
  1. O serviço de banco de dados não está em execução ou ainda está inicializando.
  2. Variável `DATABASE_URL` incorreta ou credenciais inválidas.
  3. Regras de firewall ou Security Groups bloqueando a porta de conexão (ex: 5432 para PostgreSQL).
* **Ações de Diagnóstico:**
  - Verifique os logs do contêiner do banco: `docker logs <container_banco>`.
  - Teste a conectividade de rede a partir da instância da aplicação: `nc -zv <db_host> <db_port>`.

---

## 2. Falhas no Pipeline de CI/CD

* **Sintoma:** O pipeline falha no estágio de teste ou verificação pós-deploy.
* **Causas Prováveis:**
  1. Testes unitários falhando por regressão no código.
  2. Variáveis de ambiente ou secrets ausentes nas configurações do repositório.
  3. Timeout no endpoint de `/health` pós-deploy devido a tempo de aquecimento da aplicação.
* **Ações de Diagnóstico:**
  - Inspecione a aba de logs do pipeline no GitHub Actions / GitLab CI.
  - Reproduza localmente os testes com `npm test` ou comando equivalente.

---

## 3. Problemas no Terraform (IaC)

* **Sintoma:** `terraform apply` falha com erros de permissão ou recursos duplicados.
* **Causas Prováveis:**
  1. Credenciais de nuvem expiradas ou sem permissões de IAM necessárias.
  2. Conflito com recursos criados manualmente no console da nuvem.
* **Ações de Diagnóstico:**
  - Execute `terraform refresh` para sincronizar o arquivo de estado.
  - Verifique o arquivo `terraform.tfstate` e certifique-se de que os nomes de recursos são únicos.

