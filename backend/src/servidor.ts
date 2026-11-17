import 'dotenv/config';
import { app } from './app';

const porta = Number(process.env.PORT) || 3001;

app.listen(porta, () => {
  console.log(`Servidor backend em execucao na porta ${porta}`);
});
