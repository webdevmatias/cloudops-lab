# ADR 006: Estratégia Híbrida de Segredos (Infisical em Dev/CI e SSM em Produção)

* **Status:** Proposto
* **Data:** 2026-11-23
* **Autores / Decisores:** Brenno Araujo (proposta); revisão: Jeane Vitoria e Lucas Matias

---

## 1. Contexto e Problema

O projeto precisa atender ao requisito de gerenciamento de credenciais sem segredos hardcoded no repositório e sem exposição nos logs, cobrindo três contextos com restrições diferentes:

- **Desenvolvimento local:** os desenvolvedores precisam subir o `docker-compose.yml` sem manter arquivos `.env` reais nem compartilhar credenciais por mensagem.
- **CI:** o pipeline do GitHub Actions precisa validar a integração com o gerenciador de segredos sem armazenar credenciais de longa duração no repositório.
- **Produção AWS:** o deploy roda no AWS Academy Learner Lab, que **não permite criar roles IAM**. As instâncias usam o `LabInstanceProfile`, que já concede acesso ao SSM, e as credenciais da AWS são temporárias, renovadas a cada sessão.

O deploy de produção já foi implementado com **SSM Parameter Store**: os scripts em [`infra/deploy/`](../../../infra/deploy/) leem os segredos da aplicação durante a implantação. O Infisical já está integrado ao desenvolvimento local e ao CI.

---

## 2. Opções Consideradas

### Opção A: Infisical em dev/CI + SSM Parameter Store em produção (híbrida)
* **Prós:**
  - Mantém o deploy atual intacto e de menor risco.
  - Separa claramente os escopos: Infisical para desenvolvimento/CI, SSM para runtime AWS.
  - Usa o `LabInstanceProfile` já disponível, sem depender de roles IAM.
  - Permite evolução futura para uma fonte única sem reescrever o deploy agora.
* **Contras:**
  - Duas ferramentas de segredos para administrar.
  - Os segredos de produção não ficam centralizados no Infisical nesta fase.

### Opção B: Infisical como fonte também em produção, com sincronização para o SSM
* **Prós:**
  - Centraliza a origem dos segredos no Infisical.
  - Mantém o SSM apenas como meio de entrega para as EC2.
* **Contras:**
  - Adiciona uma etapa de sincronização e uma dependência do Infisical no CD.
  - Exige cuidado extra com a senha do banco, que não pode ser alterada após a inicialização do PostgreSQL.
  - Duplica os segredos em repouso (Infisical e SSM).

### Opção C: Infisical direto nas EC2 em runtime
* **Prós:**
  - Fonte única de segredos, com o SSM guardando apenas o bootstrap da Machine Identity.
* **Contras:**
  - Exige instalar e operar o Infisical CLI ou Agent nas instâncias.
  - Aumenta os pontos de falha e a complexidade operacional do projeto acadêmico.

---

## 3. Decisão Escolhida e Justificativa Técnica

Adota-se a **Opção A**: **Infisical** no desenvolvimento local e no CI, e **SSM Parameter Store** na produção AWS. Nenhum script de deploy é alterado nesta fase.

- **Funcionalidade:** atende ao requisito de gestão de segredos nos três contextos, aproveitando o deploy já funcional.
- **Segurança:** os segredos de produção permanecem em `SecureString` no SSM, acessíveis apenas pelo `LabInstanceProfile`; o CI usa OIDC com uma Machine Identity de leitura no Infisical; nenhum valor é commitado ou impresso nos logs.
- **Escalabilidade & Disponibilidade:** o SSM é um serviço gerenciado da AWS, já integrado ao mecanismo de deploy via SSM Run Command. O Infisical cobre o fluxo de desenvolvimento sem impactar o runtime.
- **Manutenção & Complexidade:** a solução é a de menor complexidade e menor risco imediato. A separação de escopos fica explícita na documentação e evita alterar um pipeline de deploy recém-validado.
- **Custo:** não há custo adicional relevante; o SSM Parameter Store é usado dentro dos limites do Learner Lab e o Infisical Cloud atende ao ambiente `dev`.

---

## 4. Consequências

- **Positivas:**
  - O deploy atual continua funcionando sem mudanças.
  - Desenvolvedores não precisam de `.env` real nem de credenciais compartilhadas.
  - O CI valida a integração com o Infisical por OIDC.
  - A estratégia fica registrada e justificada para avaliação do projeto.
- **Negativas / Riscos:**
  - Existem duas ferramentas de segredos, com escopos diferentes. Mitigação: documentação explícita em [`docs/seguranca`](../../seguranca/README.md) e [`docs/operacao/deploy.md`](../../operacao/deploy.md).
  - O CI passa a depender da configuração da Machine Identity e das *Variables* do Infisical. Mitigação: documentar os pré-requisitos e testar o workflow antes do merge.
  - Uma eventual migração para a Opção B exigirá sincronização de segredos e tratamento da senha do banco. Mitigação: a Opção B fica registrada como caminho de evolução, sem bloquear a entrega atual.
