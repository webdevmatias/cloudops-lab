import 'dotenv/config';
import { app } from './app';
import { validarConfiguracaoObrigatoria } from './configuracao/segredos';
import { AutenticacaoRepositorio } from './repositorios/autenticacao.repositorio';
import { logger } from './observabilidade/logger';
import { aplicacaoAtiva, criarServidorMetricas } from './observabilidade/metricas';

const porta = Number(process.env.PORT) || 3001;
const portaMetricas = Number(process.env.METRICS_PORT) || 9464;
const authRepo = new AutenticacaoRepositorio();

async function iniciar() {
  validarConfiguracaoObrigatoria();
  await authRepo.garantirAdminInicial(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);

  app.listen(porta, () => {
    aplicacaoAtiva.set(1);
    logger.info('servidor_iniciado', { porta });
  });

  const servidorMetricas = criarServidorMetricas().listen(portaMetricas, () => {
    logger.info('servidor_metricas_iniciado', { porta: portaMetricas });
  });

  servidorMetricas.on('error', (erro) => {
    logger.error('falha_ao_iniciar_servidor_metricas', { erro, porta: portaMetricas });
    process.exit(1);
  });
}

function encerrar(sinal: string) {
  aplicacaoAtiva.set(0);
  logger.info('servidor_encerrando', { sinal });
  process.exit(0);
}

process.on('SIGTERM', () => encerrar('SIGTERM'));
process.on('SIGINT', () => encerrar('SIGINT'));

iniciar().catch((erro) => {
  logger.error('falha_ao_iniciar_servidor', { erro });
  process.exit(1);
});
