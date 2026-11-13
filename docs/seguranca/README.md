# Segurança e Gerenciamento de Segredos

Este documento descreve a política de segurança, o modelo de proteção e a estratégia de gerenciamento de credenciais e segredos do projeto **CloudOps Lab**.

---

## 1. Princípios de Segurança

1. **Secret Zero no Código:** Nenhuma credencial, senha, token ou chave privada deve ser commitada no Git.
2. **Menor Privilégio (Least Privilege):** Cada serviço, pipeline e usuário deve possuir apenas as permissões estritamente necessárias para sua operação.
3. **Isolamento de Ambientes:** Segredos de desenvolvimento local, homologação e produção devem ser mantidos isolados e com acessos restritos.

---

## 2. Gerenciamento Centralizado de Segredos (Infisical)

Para atender ao requisito de gerenciamento adequado de informações sensíveis, o projeto recomenda e adota o **Infisical** (ou ferramenta equivalente justificada em ADR).

### 2.1. Como Funciona o Fluxo de Segredos

```mermaid
flowchart TD
    subgraph SecretVault [Cofre de Segredos - Infisical]
        Secrets[(Segredos Armazenados Criptografados)]
    end

    subgraph Ambientes
        Dev[Desenvolvedor Local]
        CICD[Pipeline de CI/CD]
        Cloud[Ambiente de Nuvem / Runtime]
    end

    Secrets -->|infisical run -- npm run dev| Dev
    Secrets -->|Injeção no Job| CICD
    Secrets -->|Variáveis de Ambiente / Agente| Cloud
```

### 2.2. Uso do CLI do Infisical

1. **Login no Infisical:**
   ```bash
   infisical login
   ```
2. **Vincular o Projeto:**
   ```bash
   infisical init
   ```
3. **Executar Aplicação Injetando Segredos:**
   ```bash
   infisical run -- <comando-de-execucao>
   ```

---

## 3. Arquivos `.env` e Boas Práticas

- Arquivos `.env` reais estão explicitamente incluídos no `.gitignore`.
- O repositório fornece apenas arquivos de exemplo padronizados (`.env.example`), contendo a lista de variáveis necessárias com explicações e valores fictícios:
  ```env
  # Exemplo de .env.example
  PORT=3000
  DATABASE_URL=postgresql://usuario:senha@localhost:5432/cloudops_db
  SECRET_KEY=exemplo_chave_insegura_apenas_para_dev
  ```

---

## 4. Auditoria e Varredura de Código

- Recomenda-se o uso de ferramentas de varredura de segredos (ex: `gitleaks` ou `trufflehog`) em hooks pré-commit ou no pipeline de CI/CD para bloquear commits acidentais contendo credenciais.

