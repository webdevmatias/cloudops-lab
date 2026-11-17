import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('../../src/configuracao/bancoDados', () => ({
  verificarConexaoBanco: vi.fn().mockResolvedValue(true),
  poolBanco: {
    query: vi.fn().mockResolvedValue({ rows: [] }),
  },
}));

import { app } from '../../src/app';

describe('Rotas da API (Integração)', () => {
  it('GET /health deve retornar status 200 quando banco estiver conectado', async () => {
    const resposta = await request(app).get('/health');
    expect(resposta.status).toBe(200);
    expect(resposta.body.status).toBe('ok');
    expect(resposta.body.banco).toBe('conectado');
  });

  it('GET /metrics deve retornar métricas do Prometheus', async () => {
    const resposta = await request(app).get('/metrics');
    expect(resposta.status).toBe(200);
    expect(resposta.text).toContain('process_cpu');
  });

  it('GET /clientes deve retornar lista de clientes', async () => {
    const resposta = await request(app).get('/clientes');
    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });
});
