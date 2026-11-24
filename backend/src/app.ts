import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { verificarConexaoBanco } from './configuracao/bancoDados';
import { autenticacaoRotas } from './rotas/autenticacao.rotas';
import { clienteRotas } from './rotas/cliente.rotas';
import { autenticarAdmin } from './middlewares/autenticacao.middleware';
import { middlewareLogRequisicao, logger } from './observabilidade/logger';
import { middlewareMetricas, statusBanco } from './observabilidade/metricas';

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
app.use(middlewareLogRequisicao);
app.use(middlewareMetricas);

app.get('/health', async (_req, res) => {
  const bancoOk = await verificarConexaoBanco();
  const status = bancoOk ? 200 : 503;

  statusBanco.set(bancoOk ? 1 : 0);

  res.status(status).json({
    status: bancoOk ? 'ok' : 'degradado',
    banco: bancoOk ? 'conectado' : 'indisponivel',
    timestamp: new Date().toISOString(),
  });
});

app.use('/auth', limitadorAuth, autenticacaoRotas);
app.use('/clientes', autenticarAdmin, clienteRotas);

const tratadorErros: ErrorRequestHandler = (erro, req, res, next) => {
  logger.error('erro_nao_tratado', {
    erro,
    method: req.method,
    route: req.route?.path ? `${req.baseUrl}${req.route.path}` : req.path,
  });

  if (res.headersSent) {
    next(erro);
    return;
  }

  res.status(500).json({ erro: 'Erro interno do servidor' });
};

app.use(tratadorErros);
