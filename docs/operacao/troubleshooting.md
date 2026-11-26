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

---

## 4. Observabilidade (Prometheus, Grafana, Loki e Promtail)

* **Sintoma:** o alvo `backend` aparece como `DOWN` no Prometheus.
* **Causas Prováveis:**
  1. O backend não está rodando ou não publica a porta `9464`.
  2. As métricas não subiram por falta de `METRICS_PORT` ou erro na inicialização.
  3. O Prometheus não alcança `host.docker.internal:9464`.
* **Ações de Diagnóstico:**
  - Na EC2 do backend: `curl -fsS http://localhost:9464/metrics`.
  - Confira `docker logs backend` e `docker compose -f /opt/observabilidade/docker-compose.yml logs prometheus`.
  - Verifique se o backend foi publicado com `-p 9464:9464`.

* **Sintoma:** o Grafana não mostra logs ou o painel fica vazio.
* **Causas Prováveis:**
  1. O Promtail não encontrou o contêiner ou o Docker socket não está acessível.
  2. O log do backend não está em JSON ou o nível não foi extraído.
  3. O Loki não está saudável.
* **Ações de Diagnóstico:**
  - No Grafana, use **Explore → Loki** com `{container=~"backend|cloudops-backend"}`.
  - Confira `docker compose -f /opt/observabilidade/docker-compose.yml logs promtail loki`.
  - Valide os logs do backend com `docker logs --tail 20 backend`.

* **Sintoma:** não é possível abrir o Grafana pelo SSM.
* **Causas Prováveis:**
  1. A sessão do SSM não está ativa ou o plugin do AWS CLI não está instalado.
  2. A instância do backend está parada.
  3. O túnel está apontando para a porta errada.
* **Ações de Diagnóstico:**
  - Confirme a instância `running` e o `id_backend`.
  - Abra o túnel para `3002` e acesse `http://localhost:3002`.
  - Consulte a senha em `/cloudops-lab/senha-grafana` no Parameter Store.

