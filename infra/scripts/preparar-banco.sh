#!/bin/bash
set -euo pipefail

# ---------- Disco de dados do PostgreSQL ----------

# O id do volume vem do Terraform. Dentro da instância, o disco aparece
# com o id sem o hífen (vol-0abc... vira vol0abc...).
DISCO="/dev/disk/by-id/nvme-Amazon_Elastic_Block_Store_${replace(volume_id, "-", "")}"
PASTA="/dados"

# O volume é plugado alguns segundos depois de a instância ligar
for i in $(seq 1 60); do
  [ -e "$DISCO" ] && break
  sleep 5
done
[ -e "$DISCO" ] || { echo "Disco de dados nao encontrado: $DISCO" >&2; exit 1; }

# Formata só se o disco ainda não tiver sistema de arquivos,
# para nunca apagar os dados de um volume que já foi usado
if ! blkid "$DISCO" > /dev/null 2>&1; then
  mkfs.ext4 -L dados-banco "$DISCO"
fi

# Monta pelo rótulo, que não muda entre reinícios
mkdir -p "$PASTA"
grep -q "LABEL=dados-banco" /etc/fstab || echo "LABEL=dados-banco $PASTA ext4 defaults,nofail 0 2" >> /etc/fstab
mount -a
mkdir -p "$PASTA/postgres"

# ---------- Docker ----------

${instalar_docker}
