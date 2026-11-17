import { describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { SEGREDO_ACCESS } from '../../src/configuracao/segredos';

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

  it('GET /clientes deve retornar 401 sem token de acesso', async () => {
    const resposta = await request(app).get('/clientes');
    expect(resposta.status).toBe(401);
  });

  it('GET /clientes deve retornar lista de clientes quando autenticado', async () => {
    const token = jwt.sign({ sub: 'admin@loja.com', uid: 1, papel: 'admin' }, SEGREDO_ACCESS);
    const resposta = await request(app)
      .get('/clientes')
      .set('Authorization', `Bearer ${token}`);
    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });
});
