# ADR 003: Estratégia de Observabilidade com Prometheus, Grafana, Loki e Promtail

* **Status:** Aceito
* **Data:** 2026-11-24
* **Autores / Decisores:** Brenno Araújo

---

## 1. Contexto e Problema

O projeto precisa atender aos requisitos mínimos de observabilidade:

- métricas de quantidade de requisições, disponibilidade e tempo de resposta;
- logs de operações e erros;
- visualização por dashboards ou ferramenta equivalente.

O ambiente é o AWS Academy Learner Lab, com crédito limitado e apenas três instâncias EC2 já provisionadas (frontend, backend e PostgreSQL). Criar uma quarta instância, um novo Security Group ou um novo volume dedicado aumentaria custo.

---

## 2. Opções Consideradas

### Opção A: Dozzle para logs e métricas nativas do Docker
* **Prós:**
  - Muito simples de operar;
  - Interface leve para visualizar logs;
  - Baixo consumo de memória.
* **Contras:**
  - Não oferece métricas de requisição, latência ou dashboards;
  - Não atende sozinho aos três pilares de observabilidade;
  - Pouco aderente ao requisito de monitoramento contínuo.

### Opção B: Amazon CloudWatch
* **Prós:**
  - Serviço gerenciado, integrado à AWS;
  - Alarmes e retenção gerenciados.
* **Contras:**
  - Custo variável por ingestão e retenção;
  - Menor controle sobre dashboards e consultas no contexto didático;
  - Exigiria configurar agentes e permissões adicionais no Learner Lab.

### Opção C: Prometheus + Grafana + Loki + Promtail na EC2 do backend
* **Prós:**
  - Cobre métricas, logs e visualização com ferramentas amplamente usadas no mercado;
  - Prometheus coleta métricas via HTTP e Grafana centraliza dashboards;
  - Loki indexa apenas rótulos e Promtail coleta logs Docker sem alterar a aplicação;
  - Reaproveita a EC2 do backend, sem nova instância, Security Group ou volume;
  - Stack declarada em Docker Compose e versionada no repositório.
* **Contras:**
  - Consome memória da EC2 do backend;
  - O acesso administrativo depende de SSM Port Forwarding;
  - A stack não é altamente disponível, pois compartilha a instância da API.

---

## 3. Decisão Escolhida e Justificativa Técnica

Foi escolhida a **Opção C**: executar Prometheus, Grafana, Loki e Promtail na mesma EC2 do backend, com a seguinte configuração:

- API expõe métricas Prometheus na porta interna `9464`;
- o endpoint público `/metrics` foi removido da porta `3001`;
- Prometheus e Grafana escutam apenas em `127.0.0.1` (`9090` e `3002`);
- Loki escuta apenas na rede interna do Docker (`3100`);
- Promtail lê os logs dos contêineres pelo Docker socket e envia ao Loki;
- acesso ao Grafana e ao Prometheus é feito por **SSM Port Forwarding**, sem abrir portas públicas;
- retenção inicial de 24 horas, adequada ao laboratório e ao crédito disponível;
- a EC2 do backend passa de `t3.micro` para `t3.small` para acomodar a stack.

**Funcionalidade:** atende aos três pilares: métricas (`http_requests_total`, `http_request_duration_seconds`, `app_up`, `db_connection_status`), logs JSON e dashboards no Grafana.

**Segurança:** nenhuma porta administrativa é exposta na internet; o Grafana usa senha forte gerada e armazenada no SSM Parameter Store; o acesso é feito pelo SSM, alinhado à [ADR 005](005-acesso-administrativo-via-ssm.md).

**Escalabilidade e disponibilidade:** suficiente para o volume do projeto. A stack não é altamente disponível porque compartilha a EC2 da API; essa limitação é aceita no contexto acadêmico e pode ser evoluída para serviços gerenciados no futuro.

**Manutenção e complexidade:** a stack é declarativa, versionada e usa imagens oficiais fixadas. O custo operacional é baixo, mas exige monitorar memória da instância.

**Custo:** não cria nova EC2, novo Security Group nem novo EBS. O único acréscimo relevante é o upgrade de `t3.micro` para `t3.small`, compensado pela redução de complexidade e pela ausência de custos de ingestão do CloudWatch.

---

## 4. Consequências

- **Positivas:**
  - Observabilidade completa com baixo custo incremental;
  - Dashboards versionados e reproduzíveis;
  - Métricas internas deixam de ficar expostas na internet;
  - Logs centralizados no Loki com filtros por nível e serviço.
- **Negativas / Riscos:**
  - A stack consome memória da EC2 do backend e pode competir com a API;
  - Se a EC2 do backend falhar, a observabilidade também fica indisponível;
  - O acesso ao Grafana depende do SSM Port Forwarding;
  - O volume de logs é limitado pela rotação do Docker e pela retenção do Loki.
- **Mitigações:**
  - Limites de memória por serviço no Docker Compose;
  - Retenção de 24 horas no Prometheus e no Loki;
  - Rotação de logs Docker (`10 MB`, três arquivos);
  - Procedimento de diagnóstico documentado em [`docs/observabilidade/README.md`](../../observabilidade/README.md).
