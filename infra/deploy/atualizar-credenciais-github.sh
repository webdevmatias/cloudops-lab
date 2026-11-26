#!/bin/bash
# Opcional: atualiza os três segredos AWS do GitHub Actions a partir do
# arquivo ~/.aws/credentials, sem mostrar nenhum valor na tela.
# Requer o GitHub CLI (gh) instalado e com login (gh auth login).
#
# Uso, na raiz do repositório: bash infra/deploy/atualizar-credenciais-github.sh
set -euo pipefail

if ! command -v gh > /dev/null; then
  echo "GitHub CLI nao encontrado. Instale com: winget install GitHub.cli" >&2
  exit 1
fi

if ! gh auth status > /dev/null 2>&1; then
  echo "GitHub CLI sem login. Execute: gh auth login" >&2
  exit 1
fi

# Testa antes de enviar, para não gravar no GitHub credenciais vencidas ou incompletas
if ! IDENTIDADE=$(aws sts get-caller-identity --query Arn --output text 2> /dev/null | tr -d '\r'); then
  echo "Credenciais invalidas ou expiradas em ~/.aws/credentials." >&2
  echo "Copie o bloco atual do Learner Lab (AWS Details > Show) e tente de novo." >&2
  exit 1
fi
echo "Credenciais validas: $IDENTIDADE"

for par in \
  AWS_ACCESS_KEY_ID:aws_access_key_id \
  AWS_SECRET_ACCESS_KEY:aws_secret_access_key \
  AWS_SESSION_TOKEN:aws_session_token; do
  SEGREDO="${par%%:*}"
  CHAVE="${par#*:}"

  VALOR=$(aws configure get "$CHAVE" | tr -d '\r')
  if [ -z "$VALOR" ]; then
    echo "Valor vazio para $CHAVE em ~/.aws/credentials" >&2
    exit 1
  fi

  # O valor vai pela entrada padrão, e não como argumento, para não aparecer em lugar nenhum
  printf '%s' "$VALOR" | gh secret set "$SEGREDO"
  echo "Atualizado: $SEGREDO"
done

echo "Segredos do GitHub atualizados."
