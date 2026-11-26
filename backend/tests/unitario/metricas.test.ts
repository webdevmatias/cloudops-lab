import { describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  criarServidorMetricas,
  registroMetricas,
  statusBanco,
} from '../../src/observabilidade/metricas';

describe('Metricas Prometheus', () => {
  it('deve expor as metricas da aplicacao', async () => {
    statusBanco.set(1);

    const metricas = await registroMetricas.metrics();

    expect(metricas).toContain('http_requests_total');
    expect(metricas).toContain('http_request_duration_seconds');
    expect(metricas).toContain('app_up');
    expect(metricas).toContain('db_connection_status 1');
  });

  it('deve servir /metrics no servidor interno', async () => {
    const resposta = await request(criarServidorMetricas()).get('/metrics');

    expect(resposta.status).toBe(200);
    expect(resposta.text).toContain('http_requests_total');
  });
});
