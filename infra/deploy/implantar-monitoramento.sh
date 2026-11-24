# Executado na EC2 do backend pelo executar-remoto.sh.
# Variáveis recebidas: PROJETO, OBS_B64
#
# A stack usa a própria EC2 do backend para evitar uma quarta instância.
# Prometheus e Grafana escutam apenas em localhost; o acesso é feito por SSM.
set -euo pipefail
export HOME=/root
export PATH="$PATH:/snap/bin"

command -v aws > /dev/null || snap install aws-cli --classic

ler_segredo() {
  aws ssm get-parameter --name "/$PROJETO/$1" --with-decryption \
    --query Parameter.Value --output text
}

mkdir -p /opt/observabilidade
echo "$OBS_B64" | base64 -d | tar -xzf - -C /opt/observabilidade

GRAFANA_ADMIN_PASSWORD=$(ler_segredo senha-grafana)
export GRAFANA_ADMIN_PASSWORD

cd /opt/observabilidade

docker compose up -d --remove-orphans

for _ in $(seq 1 30); do
  if curl -fsS http://localhost:9090/-/healthy > /dev/null 2>&1 &&
    curl -fsS http://localhost:3002/api/health > /dev/null 2>&1; then
    if [ "$(docker inspect -f '{{.State.Running}}' cloudops-loki 2> /dev/null || true)" = "true" ]; then
      echo "Observabilidade respondendo: Prometheus, Grafana e Loki"
      exit 0
    fi
  fi
  sleep 2
done

echo "Observabilidade nao respondeu a tempo" >&2
docker compose ps >&2 || true
docker compose logs --tail 100 >&2 || true
exit 1
