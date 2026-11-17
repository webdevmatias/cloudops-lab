import { CookieOptions, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SEGREDO_ACCESS, SEGREDO_REFRESH } from '../configuracao/segredos';
import { PayloadToken } from '../middlewares/autenticacao.middleware';
import { AutenticacaoRepositorio } from '../repositorios/autenticacao.repositorio';

const repositorio = new AutenticacaoRepositorio();

const OPCOES_COOKIE_REFRESH: CookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/auth',
};

function gerarParTokens(uid: number, email: string) {
  const payload: PayloadToken = { sub: email, uid, papel: 'admin' };
  const accessToken = jwt.sign(payload, SEGREDO_ACCESS, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, SEGREDO_REFRESH, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export const autenticacaoRotas = Router();

autenticacaoRotas.post('/login', async (req, res) => {
  const { email, senha } = req.body as { email?: string; senha?: string };
  if (!email || !senha) {
    res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
    return;
  }

  const usuario = await repositorio.buscarAdminPorEmail(email);
  if (!usuario) {
    res.status(401).json({ erro: 'Credenciais inválidas' });
    return;
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) {
    res.status(401).json({ erro: 'Credenciais inválidas' });
    return;
  }

  const { accessToken, refreshToken } = gerarParTokens(usuario.id, usuario.email);
  await repositorio.salvarRefreshToken(usuario.id, refreshToken);

  res.cookie('refreshToken', refreshToken, OPCOES_COOKIE_REFRESH);
  res.json({ accessToken });
});

autenticacaoRotas.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  if (!refreshToken) {
    res.status(401).json({ erro: 'Refresh token não fornecido' });
    return;
  }

  try {
    const payload = jwt.verify(refreshToken, SEGREDO_REFRESH) as PayloadToken;
    const usuarioId = await repositorio.verificarRefreshTokenValido(refreshToken);

    if (!usuarioId) {
      res.status(401).json({ erro: 'Refresh token revogado ou expirado' });
      return;
    }

    await repositorio.revogarRefreshToken(refreshToken);
    const novosTokens = gerarParTokens(payload.uid, payload.sub);
    await repositorio.salvarRefreshToken(usuarioId, novosTokens.refreshToken);

    res.cookie('refreshToken', novosTokens.refreshToken, OPCOES_COOKIE_REFRESH);
    res.json({ accessToken: novosTokens.accessToken });
  } catch {
    res.status(401).json({ erro: 'Refresh token inválido ou expirado' });
  }
});

autenticacaoRotas.post('/logout', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  if (refreshToken) {
    await repositorio.revogarRefreshToken(refreshToken);
  }
  res.clearCookie('refreshToken', { path: '/auth' });
  res.status(204).send();
});
