import 'dotenv/config';
import { app } from './app';
import { validarConfiguracaoObrigatoria } from './configuracao/segredos';
import { AutenticacaoRepositorio } from './repositorios/autenticacao.repositorio';

const porta = Number(process.env.PORT) || 3001;
const authRepo = new AutenticacaoRepositorio();

async function iniciar() {
  validarConfiguracaoObrigatoria();
  await authRepo.garantirAdminInicial(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);

  app.listen(porta, () => {
    console.log(`Servidor backend em execucao na porta ${porta}`);
  });
}

iniciar().catch((erro) => {
  console.error('Falha ao iniciar servidor:', erro);
  process.exit(1);
});
