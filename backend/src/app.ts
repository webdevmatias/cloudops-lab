import express from 'express';
import cors from 'cors';
import client from 'prom-client';
import { verificarConexaoBanco } from './configuracao/bancoDados';
import { clienteRotas } from './rotas/cliente.rotas';

const registroMetricas = new client.Registry();
client.collectDefaultMetrics({ register: registroMetricas });

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  const bancoOk = await verificarConexaoBanco();
  const status = bancoOk ? 200 : 503;

  res.status(status).json({
    status: bancoOk ? 'ok' : 'degradado',
    banco: bancoOk ? 'conectado' : 'indisponivel',
    timestamp: new Date().toISOString(),
  });
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', registroMetricas.contentType);
  res.end(await registroMetricas.metrics());
});

app.use('/clientes', clienteRotas);
