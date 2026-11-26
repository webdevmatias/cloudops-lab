const ambienteTeste = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

function obterSegredoObrigatorio(nomeVariavel: string): string {
  const valor = process.env[nomeVariavel];
  if (valor && valor.trim() !== '') {
    return valor;
  }

  if (ambienteTeste) {
    return `test-${nomeVariavel}`;
  }

  throw new Error(
    `Variável de ambiente obrigatória não definida: ${nomeVariavel}. ` +
      'Injete os segredos com o Infisical (ex: infisical run --env=dev -- <comando>).'
  );
}

export const SEGREDO_ACCESS = obterSegredoObrigatorio('JWT_ACCESS_SECRET');
export const SEGREDO_REFRESH = obterSegredoObrigatorio('JWT_REFRESH_SECRET');

/**
 * Valida a configuração obrigatória antes de inicializar o servidor.
 * Em ambiente de teste, aceita valores sintéticos para não exigir Infisical.
 */
export function validarConfiguracaoObrigatoria(): void {
  obterSegredoObrigatorio('DATABASE_URL');

  const temEmailAdmin = Boolean(process.env.ADMIN_EMAIL?.trim());
  const temSenhaAdmin = Boolean(process.env.ADMIN_PASSWORD?.trim());

  if (temEmailAdmin !== temSenhaAdmin) {
    throw new Error('ADMIN_EMAIL e ADMIN_PASSWORD devem ser definidos juntos.');
  }
}
