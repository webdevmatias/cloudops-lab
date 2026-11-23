#!/bin/bash
# Executa um script em uma instância EC2 pelo SSM Run Command e mostra a saída.
# As variáveis passadas como VAR=valor são exportadas antes do script.
# Não passe segredos por aqui: eles ficariam visíveis no histórico do SSM.
#
# Uso: infra/deploy/executar-remoto.sh <id-instancia> <script> [VAR=valor ...]
set -euo pipefail
export MSYS_NO_PATHCONV=1

INSTANCIA="$1"
SCRIPT="$2"
shift 2

# O AWS CLI no Windows devolve fim de linha CRLF; o tr remove o \r
texto() { aws "$@" --output text | tr -d '\r'; }

# Aguarda o agente do SSM ficar online, caso a instância tenha acabado de ligar
STATUS="Offline"
for _ in $(seq 1 60); do
  STATUS=$(texto ssm describe-instance-information \
    --filters "Key=InstanceIds,Values=$INSTANCIA" \
    --query 'InstanceInformationList[0].PingStatus')
  [ "$STATUS" = "Online" ] && break
  sleep 5
done
if [ "$STATUS" != "Online" ]; then
  echo "Agente do SSM offline na instancia $INSTANCIA" >&2
  exit 1
fi

# Junta as variáveis e o script, e envia em base64 para não haver problema com aspas
CONTEUDO=$({
  for par in "$@"; do printf 'export %q\n' "$par"; done
  cat "$SCRIPT"
} | base64 | tr -d '\n')

ID_COMANDO=$(texto ssm send-command \
  --instance-ids "$INSTANCIA" \
  --document-name AWS-RunShellScript \
  --comment "deploy $(basename "$SCRIPT")" \
  --parameters "{\"commands\":[\"echo $CONTEUDO | base64 -d > /tmp/implantar.sh && bash /tmp/implantar.sh\"],\"executionTimeout\":[\"900\"]}" \
  --query Command.CommandId)

echo "Executando $(basename "$SCRIPT") em $INSTANCIA (comando $ID_COMANDO)"

# Acompanha a execução por até 15 minutos
STATUS="Pending"
for _ in $(seq 1 180); do
  STATUS=$(texto ssm get-command-invocation --command-id "$ID_COMANDO" --instance-id "$INSTANCIA" \
    --query Status 2> /dev/null || echo "Pending")
  case "$STATUS" in
    Pending | InProgress | Delayed) sleep 5 ;;
    *) break ;;
  esac
done

texto ssm get-command-invocation --command-id "$ID_COMANDO" --instance-id "$INSTANCIA" \
  --query StandardOutputContent
ERROS=$(texto ssm get-command-invocation --command-id "$ID_COMANDO" --instance-id "$INSTANCIA" \
  --query StandardErrorContent)
[ -n "$ERROS" ] && echo "$ERROS" >&2

echo "Status: $STATUS"
[ "$STATUS" = "Success" ]
