# Executado na EC2 do banco pelo executar-remoto.sh.
# Variáveis recebidas: AWS_REGION, PROJETO, INIT_SQL_B64
set -euo pipefail
export HOME=/root
export PATH="$PATH:/snap/bin"

command -v aws > /dev/null || snap install aws-cli --classic

ler_segredo() {
  aws ssm get-parameter --name "/$PROJETO/$1" --with-decryption \
    --query Parameter.Value --output text
}

SENHA_BANCO=$(ler_segredo senha-banco)

# Script de criação das tabelas, executado só quando a pasta de dados está vazia
mkdir -p /dados/init
echo "$INIT_SQL_B64" | base64 -d > /dados/init/init.sql

docker rm -f postgres > /dev/null 2>&1 || true
docker run -d --name postgres --restart unless-stopped \
  -p 5432:5432 \
  -e POSTGRES_USER=cloudops_user \
  -e POSTGRES_DB=loja_roupas \
  -e POSTGRES_PASSWORD="$SENHA_BANCO" \
  -v /dados/postgres:/var/lib/postgresql/data \
  -v /dados/init/init.sql:/docker-entrypoint-initdb.d/init.sql:ro \
  postgres:16-alpine

for _ in $(seq 1 30); do
  if docker exec postgres pg_isready -U cloudops_user -d loja_roupas > /dev/null 2>&1; then
    echo "PostgreSQL pronto"
    exit 0
  fi
  sleep 2
done

echo "PostgreSQL nao ficou pronto a tempo" >&2
docker logs --tail 50 postgres >&2
exit 1
