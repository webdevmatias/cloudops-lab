import { Pool } from 'pg';

const urlBanco = process.env.DATABASE_URL;

export const poolBanco = new Pool({
  connectionString: urlBanco,
});

/**
 * Verifica a conectividade com o banco de dados PostgreSQL.
 */
export async function verificarConexaoBanco(): Promise<boolean> {
  try {
    await poolBanco.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
