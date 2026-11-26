# Executado na EC2 do backend pelo executar-remoto.sh.
# Variáveis recebidas: AWS_REGION, PROJETO, IMAGEM, IP_BANCO, URL_FRONTEND
set -euo pipefail
export HOME=/root
export PATH="$PATH:/snap/bin"

command -v aws > /dev/null || snap install aws-cli --classic

ler_segredo() {
  aws ssm get-parameter --name "/$PROJETO/$1" --with-decryption \
    --query Parameter.Value --output text
}

SENHA_BANCO=$(ler_segredo senha-banco)
export JWT_ACCESS_SECRET=$(ler_segredo jwt-access-secret)
export JWT_REFRESH_SECRET=$(ler_segredo jwt-refresh-secret)
export ADMIN_EMAIL=$(ler_segredo email-admin)
export ADMIN_PASSWORD=$(ler_segredo senha-admin)
export DATABASE_URL="postgresql://cloudops_user:${SENHA_BANCO}@${IP_BANCO}:5432/loja_roupas"

REGISTRO="${IMAGEM%%/*}"
aws ecr get-login-password --region "$AWS_REGION" |
  docker login --username AWS --password-stdin "$REGISTRO" > /dev/null
docker pull --quiet "$IMAGEM"

# Os segredos vão como -e NOME, sem valor: o Docker lê do ambiente e eles não aparecem no comando
docker rm -f backend > /dev/null 2>&1 || true
docker run -d --name backend --restart unless-stopped \
  -p 3001:3001 \
  -p 9464:9464 \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  -e PORT=3001 \
  -e METRICS_PORT=9464 \
  -e LOG_LEVEL=info \
  -e CORS_ORIGIN="$URL_FRONTEND" \
  -e DATABASE_URL \
  -e JWT_ACCESS_SECRET \
  -e JWT_REFRESH_SECRET \
  -e ADMIN_EMAIL \
  -e ADMIN_PASSWORD \
  "$IMAGEM"

docker image prune -f > /dev/null

for _ in $(seq 1 30); do
  if curl -fsS http://localhost:3001/health > /dev/null 2>&1; then
    if curl -fsS http://localhost:9464/metrics > /dev/null 2>&1; then
      echo "Backend respondendo em /health e /metrics"
      exit 0
    fi

    echo "Backend respondeu em /health, mas as metricas nao responderam" >&2
    docker logs --tail 50 backend >&2
    exit 1
  fi
  sleep 2
done

echo "Backend nao respondeu a tempo" >&2
docker logs --tail 50 backend >&2
exit 1
