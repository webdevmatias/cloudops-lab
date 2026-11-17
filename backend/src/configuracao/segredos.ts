function obterSegredoObrigatorio(nomeVariavel: string): string {
  const valor = process.env[nomeVariavel];
  if (valor && valor.trim() !== '') {
    return valor;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Variável de ambiente obrigatória não definida: ${nomeVariavel}`);
  }

  // Apenas para desenvolvimento/testes locais quando não definida no .env
  return `dev-${nomeVariavel}-nao-usar-em-producao`;
}

export const SEGREDO_ACCESS = obterSegredoObrigatorio('JWT_ACCESS_SECRET');
export const SEGREDO_REFRESH = obterSegredoObrigatorio('JWT_REFRESH_SECRET');
