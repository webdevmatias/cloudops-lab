import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

type NivelLog = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SILENT';
type ContextoLog = Record<string, unknown>;

const prioridades: Record<NivelLog, number> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  SILENT: 100,
};

const nivelConfigurado = process.env.LOG_LEVEL?.toUpperCase() as NivelLog | undefined;
const nivelMinimo: NivelLog =
  nivelConfigurado && prioridades[nivelConfigurado] !== undefined
    ? nivelConfigurado
    : process.env.NODE_ENV === 'test'
      ? 'SILENT'
      : 'INFO';

function normalizarContexto(contexto: ContextoLog): ContextoLog {
  const erro = contexto.erro;

  if (erro instanceof Error) {
    return {
      ...contexto,
      erro: {
        nome: erro.name,
        mensagem: erro.message,
        stack: erro.stack,
      },
    };
  }

  return contexto;
}

function emitir(nivel: Exclude<NivelLog, 'SILENT'>, mensagem: string, contexto: ContextoLog = {}): void {
  if (prioridades[nivel] < prioridades[nivelMinimo]) {
    return;
  }

  const entrada = {
    timestamp: new Date().toISOString(),
    level: nivel,
    service: 'backend',
    message: mensagem,
    ...normalizarContexto(contexto),
  };

  process.stdout.write(`${JSON.stringify(entrada)}\n`);
}

export const logger = {
  debug: (mensagem: string, contexto?: ContextoLog) => emitir('DEBUG', mensagem, contexto),
  info: (mensagem: string, contexto?: ContextoLog) => emitir('INFO', mensagem, contexto),
  warn: (mensagem: string, contexto?: ContextoLog) => emitir('WARN', mensagem, contexto),
  error: (mensagem: string, contexto?: ContextoLog) => emitir('ERROR', mensagem, contexto),
};

export function middlewareLogRequisicao(req: Request, res: Response, next: NextFunction): void {
  const inicio = process.hrtime.bigint();
  const requestId = req.header('x-request-id')?.trim() || randomUUID();

  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const duracaoMs = Number(process.hrtime.bigint() - inicio) / 1e6;
    const rota = req.route?.path ? `${req.baseUrl}${req.route.path}` : req.path;
    const contexto = {
      requestId,
      method: req.method,
      route: rota,
      status: res.statusCode,
      duracaoMs: Math.round(duracaoMs * 100) / 100,
    };

    if (res.statusCode >= 500) {
      logger.error('requisicao', contexto);
    } else if (res.statusCode >= 400) {
      logger.warn('requisicao', contexto);
    } else {
      logger.info('requisicao', contexto);
    }
  });

  next();
}
