import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { SEGREDO_ACCESS } from '../configuracao/segredos';

export interface PayloadToken {
  sub: string;
  uid: number;
  papel: 'admin';
}

export function autenticarAdmin(req: Request, res: Response, next: NextFunction): void {
  const cabecalho = req.headers.authorization;
  if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
    res.status(401).json({ erro: 'Token de acesso não fornecido' });
    return;
  }

  const token = cabecalho.slice(7);
  try {
    jwt.verify(token, SEGREDO_ACCESS) as PayloadToken;
    next();
  } catch {
    res.status(401).json({ erro: 'Token de acesso inválido ou expirado' });
  }
}
