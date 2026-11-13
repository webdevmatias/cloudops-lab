# Observabilidade e Telemetria

Este documento define a estratégia, a arquitetura e o funcionamento dos mecanismos de observabilidade da aplicação **CloudOps Lab**.

---

## 1. Pilares da Observabilidade no Projeto

Conforme especificado nos requisitos, a solução contempla três pilares essenciais:

1. **Métricas:** Quantidade de requisições (`requests_total`), tempo de resposta / latência (`request_duration_seconds`), taxas de erro (HTTP 4xx/5xx) e consumo de recursos (CPU/Memória).
2. **Logs Estruturados:** Registro padronizado de eventos e erros em formato JSON contendo *timestamp*, nível (`INFO`, `WARN`, `ERROR`), rota e mensagem.
3. **Visualização Centralizada:** Dashboards interativos via **Grafana** (ou equivalente justificado) para acompanhamento em tempo real.

---

## 2. Arquitetura de Observabilidade

```mermaid
flowchart LR
    App[Aplicação / Backend] -->|Expõe /metrics| Prom[Prometheus / Telegraf]
    App -->|Logs Estruturados (stdout)| LogCollector[Coletor de Logs]
    Prom --> Grafana[Grafana Dashboards]
    LogCollector --> Grafana
    Ops[Operador / Engenheiro] -->|Consulta| Grafana
```

---

## 3. Coleta e Padrão de Métricas

### 3.1. Endpoint de Métricas
A aplicação backend expõe suas métricas em formato compatível com Prometheus no endpoint:
```http
GET /metrics
```

### 3.2. Métricas Principais Monitoradas
- `http_requests_total`: Contador com labels de método (`method`), rota (`path`) e status (`status_code`).
- `http_request_duration_seconds`: Histograma de latência por endpoint.
- `app_up`: Gauge indicando disponibilidade do serviço (1 para UP, 0 para DOWN).
- `db_connection_status`: Status da conexão com o banco de dados.

---

## 4. Padrão de Logs

Todos os logs emitidos pelos serviços devem seguir a saída padrão (`stdout` / `stderr`) em formato JSON estruturado:

```json
{
  "timestamp": "2026-11-12T22:30:00Z",
  "level": "ERROR",
  "service": "backend-api",
  "message": "Falha de conexão com o banco de dados",
  "path": "/api/v1/items",
  "error": "Connection timeout after 5000ms"
}
```

---

## 5. Dashboards no Grafana

- **Painel de Saúde e Disponibilidade:** Exibe status dos serviços e tempo de atividade (*uptime*).
- **Painel de Tráfego e Latência:** Gráficos de requisições por segundo (RPS) e percentis p95/p99 de tempo de resposta.
- **Painel de Erros:** Gráfico de taxas de erro 4xx e 5xx ao longo do tempo.
- **Acesso ao Dashboard:** Instruções de acesso, portas e credenciais iniciais (documentadas via variáveis/segredos).

