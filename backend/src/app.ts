import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import client from 'prom-client';
import { verificarConexaoBanco } from './configuracao/bancoDados';
import { autenticacaoRotas } from './rotas/autenticacao.rotas';
import { clienteRotas } from './rotas/cliente.rotas';
import { autenticarAdmin } from './middlewares/autenticacao.middleware';

const registroMetricas = new client.Registry();
client.collectDefaultMetrics({ register: registroMetricas });

const limitadorAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de autenticação. Tente novamente mais tarde.' },
});

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  })
);
app.use(cookieParser());
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

app.use('/auth', limitadorAuth, autenticacaoRotas);
app.use('/clientes', autenticarAdmin, clienteRotas);
