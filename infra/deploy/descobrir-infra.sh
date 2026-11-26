#!/bin/bash
# Descobre os ids, IPs e o registro ECR pelas tags dos recursos, sem depender
# do state do Terraform. Liga as instâncias que estiverem paradas (o Learner Lab
# para as EC2 ao fim de cada sessão).
#
# Imprime linhas NOME=valor, no formato do $GITHUB_OUTPUT.
# Uso: infra/deploy/descobrir-infra.sh
set -euo pipefail
export MSYS_NO_PATHCONV=1

PROJETO="${PROJETO:-cloudops-lab}"
AWS_REGION="${AWS_REGION:-us-east-1}"

texto() { aws "$@" --output text | tr -d '\r'; }

id_instancia() {
  texto ec2 describe-instances \
    --filters "Name=tag:Name,Values=$PROJETO-$1" "Name=instance-state-name,Values=running,stopped,pending" \
    --query 'Reservations[0].Instances[0].InstanceId'
}

ID_FRONTEND=$(id_instancia frontend)
ID_BACKEND=$(id_instancia backend)
ID_BANCO=$(id_instancia banco)

for id in "$ID_FRONTEND" "$ID_BACKEND" "$ID_BANCO"; do
  if [ "$id" = "None" ]; then
    echo "Instancia nao encontrada. A infraestrutura foi criada com terraform apply?" >&2
    exit 1
  fi
done

# Liga as instâncias paradas e espera ficarem em execução
aws ec2 start-instances --instance-ids "$ID_FRONTEND" "$ID_BACKEND" "$ID_BANCO" > /dev/null
aws ec2 wait instance-running --instance-ids "$ID_FRONTEND" "$ID_BACKEND" "$ID_BANCO"

ip_elastico() {
  texto ec2 describe-addresses --filters "Name=tag:Name,Values=$PROJETO-eip-$1" \
    --query 'Addresses[0].PublicIp'
}

IP_FRONTEND=$(ip_elastico frontend)
IP_BACKEND=$(ip_elastico backend)
IP_BANCO=$(texto ec2 describe-instances --instance-ids "$ID_BANCO" \
  --query 'Reservations[0].Instances[0].PrivateIpAddress')
CONTA=$(texto sts get-caller-identity --query Account)

echo "id_frontend=$ID_FRONTEND"
echo "id_backend=$ID_BACKEND"
echo "id_banco=$ID_BANCO"
echo "ip_banco=$IP_BANCO"
echo "url_frontend=http://$IP_FRONTEND:3000"
echo "url_api=http://$IP_BACKEND:3001"
echo "registro=$CONTA.dkr.ecr.$AWS_REGION.amazonaws.com"
