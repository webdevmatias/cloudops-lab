# Guia de Implantação (Deploy) em Nuvem

Este guia descreve os passos e requisitos para realizar a implantação da aplicação no ambiente de nuvem, tanto de forma automatizada (via CI/CD) quanto manualmente (em contingência).

---

## 1. Visão Geral do Deploy

A implantação padrão é gerenciada pelo pipeline de CI/CD. No entanto, é fundamental compreender a sequência de eventos e os pré-requisitos para execução ou diagnóstico.

---

## 2. Pré-requisitos para Deploy

1. Infraestrutura provisionada via Terraform (rede, instâncias, clusters ou buckets configurados).
2. Variáveis e segredos de ambiente devidamente configurados no gerenciador de segredos / CI/CD.
3. Imagens de contêiner geradas e disponíveis no container registry.

---

## 3. Fluxo de Implantação Automatizada (CI/CD)

1. Um *commit* é enviado para a branch principal (`main`) ou uma nova tag de versão (`vX.Y.Z`) é criada.
2. O pipeline executa os testes de unidade e integração.
3. Os artefatos e imagens Docker são construídos e enviados ao registry.
4. O job de deploy aplica a nova versão no ambiente de nuvem.
5. O job de verificação pós-deploy executa o teste de saúde (*smoke test*).

---

## 4. Procedimento Manual de Deploy (Contingência)

Caso seja necessário efetuar um deploy manual a partir do terminal:

```bash
# 1. Autenticar no provedor de nuvem e registry
# (substitua pelos comandos específicos do provedor utilizado)

# 2. Build e tag da imagem
docker build -t cloudops-backend:latest ./backend
docker build -t cloudops-frontend:latest ./frontend

# 3. Push para o registry
docker push <REGISTRY_URL>/cloudops-backend:latest
docker push <REGISTRY_URL>/cloudops-frontend:latest

# 4. Atualizar serviço em nuvem
# (exemplo com script de deploy ou atualização de container/instância)
./scripts/deploy.sh
```

---

## 5. Validação Pós-Deploy

Logo após a implantação, execute o script de verificação:
```bash
curl -f https://<DOMINIO_OU_IP>/health || echo "FALHA NO DEPLOY: Endpoint de saúde indisponível"
```

