#!/bin/bash
# Verifica, de fora da AWS, se a aplicação implantada responde.
# Uso: infra/deploy/smoke-test.sh <url_api> <url_frontend>
set -euo pipefail

URL_API="$1"
URL_FRONTEND="$2"

# O /health do backend só responde 200 quando consegue falar com o banco
echo "Testando $URL_API/health"
for tentativa in $(seq 1 24); do
  if RESPOSTA=$(curl -fsS --max-time 5 "$URL_API/health"); then
    echo "$RESPOSTA"
    break
  fi
  if [ "$tentativa" -eq 24 ]; then
    echo "Falha: o backend nao respondeu 200 em /health" >&2
    exit 1
  fi
  sleep 5
done

echo "Testando $URL_FRONTEND"
# O código HTTP vai na última linha da saída. Não usa -o /dev/null, que falha
# no Git Bash do Windows quando MSYS_NO_PATHCONV está definido
if ! CODIGO=$(curl -sS -w '\n%{http_code}' --max-time 10 "$URL_FRONTEND" | tail -n 1); then
  echo "Falha: o frontend nao respondeu" >&2
  exit 1
fi
if [ "$CODIGO" != "200" ]; then
  echo "Falha: o frontend respondeu HTTP $CODIGO" >&2
  exit 1
fi
echo "Frontend respondeu HTTP 200"

echo "Smoke test aprovado"
