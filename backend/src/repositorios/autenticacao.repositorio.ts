import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { poolBanco } from '../configuracao/bancoDados';

export interface UsuarioAdmin {
  id: number;
  email: string;
  senha_hash: string;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class AutenticacaoRepositorio {
  async buscarAdminPorEmail(email: string): Promise<UsuarioAdmin | null> {
    const resultado = await poolBanco.query<UsuarioAdmin>(
      'SELECT id, email, senha_hash FROM usuarios_admin WHERE email = $1',
      [email]
    );
    return resultado.rows[0] ?? null;
  }

  async garantirAdminInicial(email?: string, senha?: string): Promise<void> {
    if (!email || !senha) return;

    const existente = await poolBanco.query('SELECT COUNT(*)::int AS total FROM usuarios_admin');
    if (existente.rows[0].total > 0) return;

    const senhaHash = await bcrypt.hash(senha, 10);
    await poolBanco.query(
      'INSERT INTO usuarios_admin (email, senha_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
      [email, senhaHash]
    );
  }

  async salvarRefreshToken(usuarioId: number, token: string, diasExpiracao = 7): Promise<void> {
    const tokenHash = hashToken(token);
    const expiraEm = new Date(Date.now() + diasExpiracao * 24 * 60 * 60 * 1000);
    await poolBanco.query(
      'INSERT INTO refresh_tokens (usuario_id, token_hash, expira_em) VALUES ($1, $2, $3)',
      [usuarioId, tokenHash, expiraEm]
    );
  }

  async verificarRefreshTokenValido(token: string): Promise<number | null> {
    const tokenHash = hashToken(token);
    const resultado = await poolBanco.query<{ usuario_id: number }>(
      `SELECT usuario_id FROM refresh_tokens
       WHERE token_hash = $1 AND revogado = FALSE AND expira_em > NOW()`,
      [tokenHash]
    );
    return resultado.rows[0]?.usuario_id ?? null;
  }

  async revogarRefreshToken(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    await poolBanco.query(
      'UPDATE refresh_tokens SET revogado = TRUE WHERE token_hash = $1',
      [tokenHash]
    );
  }
}
