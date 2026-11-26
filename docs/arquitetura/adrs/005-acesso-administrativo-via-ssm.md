# ADR 005: Acesso Administrativo e Deploy via SSM Session Manager

* **Status:** Proposto
* **Data:** 2026-11-22
* **Autores / Decisores:** Jeane Vitoria (proposta); revisão: Brenno Araujo

---

## 1. Contexto e Problema

As três instâncias EC2 (frontend, backend e PostgreSQL) precisam de acesso administrativo para consultar logs, verificar contêineres e executar o deploy automatizado a partir do GitHub Actions.

Restrições:
- A EC2 do PostgreSQL fica em subnet privada, sem IP público ([ADR 004](004-topologia-de-rede-vpc-unica.md)).
- Os endereços IP dos runners do GitHub Actions variam, o que impede liberar SSH apenas para IPs conhecidos.
- No AWS Academy Learner Lab não é possível criar roles IAM. Está disponível o perfil `LabInstanceProfile` e o par de chaves `vockey`.

## 2. Opções Consideradas

### Opção A: SSH com a porta 22 aberta para a internet
* **Prós:**
  - Simples e amplamente documentado, inclusive em workflows do GitHub Actions.
* **Contras:**
  - Porta 22 exposta a varreduras e tentativas de acesso automatizadas.
  - Exige guardar a chave privada nos segredos do pipeline.
  - Não alcança a EC2 do banco sem um ponto intermediário.

### Opção B: SSH restrito a IPs conhecidos, com o backend como ponte (ProxyJump)
* **Prós:**
  - Reduz a exposição da porta 22.
  - Alcança o banco a partir do backend.
* **Contras:**
  - Os IPs dos integrantes mudam e os do GitHub Actions são variáveis, o que inviabiliza o deploy automatizado.

### Opção C: SSM Session Manager
* **Prós:**
  - Nenhuma porta de entrada aberta em nenhuma instância.
  - Nenhuma chave SSH para guardar ou distribuir.
  - Funciona em subnets públicas e privadas.
  - O GitHub Actions pode executar comandos de deploy usando as mesmas credenciais AWS já necessárias para o ECR.
* **Contras:**
  - Depende de o perfil da instância ter permissão de SSM.
  - A instância precisa de saída para a internet (NAT Gateway, no caso do banco).
  - Comandos enviados pelo SSM são assíncronos, o que torna a depuração do deploy menos direta que via SSH.

---

## 3. Decisão Escolhida e Justificativa Técnica

Adota-se a **Opção C**: acesso administrativo e deploy via **SSM Session Manager**, com todas as instâncias usando o `LabInstanceProfile`. Nenhum Security Group libera a porta 22.

A viabilidade foi testada em 2026-11-22: uma EC2 Amazon Linux 2023 com `LabInstanceProfile`, sem par de chaves e sem regras de entrada, conectou-se com sucesso pelo Session Manager.

- **Funcionalidade:** Atende ao acesso administrativo das três instâncias e ao deploy automatizado.
- **Segurança:** Elimina a superfície de ataque da porta 22 e o gerenciamento de chaves privadas. O acesso é controlado pelas credenciais AWS.
- **Escalabilidade & Disponibilidade:** Novas instâncias ficam acessíveis apenas com o perfil de instância, sem ajustes de rede.
- **Manutenção & Complexidade:** Menos segredos no pipeline e nenhuma regra de SSH para manter.
- **Custo:** O Session Manager não tem custo adicional. O NAT Gateway, necessário para o banco, já era requerido para baixar imagens e pacotes.

---

## 4. Consequências

- **Positivas:**
  - Nenhuma instância expõe SSH.
  - O mesmo mecanismo serve para acesso manual e para o deploy automatizado.
- **Negativas / Riscos:**
  - Sem o NAT Gateway, a EC2 do banco perde o acesso pelo SSM. Mitigação: recriar o NAT antes de qualquer manutenção no banco.
  - As credenciais do Learner Lab expiram a cada sessão e precisam ser atualizadas nos segredos do pipeline antes de cada deploy.
  - Em um ambiente de produção real, uma alternativa seria um serviço de contêineres gerenciado (ECS Fargate), que dispensa o acesso às instâncias.
