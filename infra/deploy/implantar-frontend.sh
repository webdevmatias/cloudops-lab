# Executado na EC2 do frontend pelo executar-remoto.sh.
# Variáveis recebidas: AWS_REGION, IMAGEM
set -euo pipefail
export HOME=/root
export PATH="$PATH:/snap/bin"

command -v aws > /dev/null || snap install aws-cli --classic

REGISTRO="${IMAGEM%%/*}"
aws ecr get-login-password --region "$AWS_REGION" |
  docker login --username AWS --password-stdin "$REGISTRO" > /dev/null
docker pull --quiet "$IMAGEM"

docker rm -f frontend > /dev/null 2>&1 || true
docker run -d --name frontend --restart unless-stopped \
  -p 3000:3000 \
  "$IMAGEM"

docker image prune -f > /dev/null

for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null http://localhost:3000; then
    echo "Frontend respondendo na porta 3000"
    exit 0
  fi
  sleep 2
done

echo "Frontend nao respondeu a tempo" >&2
docker logs --tail 50 frontend >&2
exit 1
