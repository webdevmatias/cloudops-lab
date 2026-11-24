#!/bin/bash
# Cria os segredos da aplicação no SSM Parameter Store, uma única vez.
# Segredos que já existem não são alterados: a senha do banco é gravada no
# PostgreSQL na primeira inicialização e não pode mudar depois.
#
# Uso: infra/deploy/criar-segredos.sh [email-do-admin]
set -euo pipefail
export MSYS_NO_PATHCONV=1 # evita que o Git Bash no Windows altere caminhos como /cloudops-lab/...

PROJETO="${PROJETO:-cloudops-lab}"
EMAIL_ADMIN="${1:-admin@loja.com}"

existe() {
  aws ssm get-parameter --name "/$PROJETO/$1" > /dev/null 2>&1
}

criar() {
  local nome="$1" tipo="$2" valor="$3"
  if existe "$nome"; then
    echo "Ja existe, mantido: /$PROJETO/$nome"
  else
    aws ssm put-parameter --name "/$PROJETO/$nome" --type "$tipo" --value "$valor" > /dev/null
    echo "Criado: /$PROJETO/$nome"
  fi
}

# Valores aleatórios em hexadecimal, seguros para usar dentro do DATABASE_URL
criar senha-banco       SecureString "$(openssl rand -hex 24)"
criar jwt-access-secret SecureString "$(openssl rand -hex 32)"
criar jwt-refresh-secret SecureString "$(openssl rand -hex 32)"
criar senha-admin       SecureString "$(openssl rand -hex 12)"
criar senha-grafana     SecureString "$(openssl rand -hex 12)"
criar email-admin       String       "$EMAIL_ADMIN"
