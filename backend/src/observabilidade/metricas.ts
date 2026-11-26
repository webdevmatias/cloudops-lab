import express, { type NextFunction, type Request, type Response } from 'express';
import client from 'prom-client';

export const registroMetricas = new client.Registry();

client.collectDefaultMetrics({ register: registroMetricas });

export const requisicoesTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requisicoes HTTP',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [registroMetricas],
});

export const duracaoRequisicao = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duracao das requisicoes HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registroMetricas],
});

export const requisicoesEmAndamento = new client.Gauge({
  name: 'http_requests_in_flight',
  help: 'Requisicoes HTTP em andamento',
  registers: [registroMetricas],
});

export const aplicacaoAtiva = new client.Gauge({
  name: 'app_up',
  help: 'Indica se a aplicacao esta ativa (1) ou nao (0)',
  registers: [registroMetricas],
});

export const statusBanco = new client.Gauge({
  name: 'db_connection_status',
  help: 'Status da conexao com o banco (1 conectado, 0 indisponivel)',
  registers: [registroMetricas],
});

function normalizarRota(req: Request): string {
  if (!req.route?.path) {
    return 'rota_desconhecida';
  }

  const rota = `${req.baseUrl}${req.route.path}`.replace(/\/+/g, '/').replace(/\/$/, '');
  return rota === '' ? '/' : rota;
}

export function middlewareMetricas(req: Request, res: Response, next: NextFunction): void {
  const inicio = process.hrtime.bigint();
  requisicoesEmAndamento.inc();

  res.on('finish', () => {
    const duracaoSegundos = Number(process.hrtime.bigint() - inicio) / 1e9;
    const labels = {
      method: req.method,
      route: normalizarRota(req),
      status_code: String(res.statusCode),
    };

    requisicoesTotal.inc(labels);
    duracaoRequisicao.observe(labels, duracaoSegundos);
    requisicoesEmAndamento.dec();
  });

  next();
}

export function criarServidorMetricas() {
  const appMetricas = express();
  appMetricas.disable('x-powered-by');

  appMetricas.get('/metrics', async (_req, res) => {
    res.set('Content-Type', registroMetricas.contentType);
    res.end(await registroMetricas.metrics());
  });

  return appMetricas;
}
