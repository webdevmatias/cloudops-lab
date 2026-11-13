# Regras e Diretrizes de Documentação

Este documento estabelece as normas, padrões e boas práticas para a criação e manutenção da documentação do projeto **CloudOps Lab**.

---

## 1. Princípios Fundamentais

1. **Docs as Code (Documentação como Código):** Toda a documentação reside no repositório Git, é versionada e evolui junto com o código-fonte e a infraestrutura.
2. **Reprodutibilidade:** Qualquer pessoa com acesso ao repositório deve ser capaz de clonar, executar localmente, provisionar a infraestrutura em nuvem, realizar deploy e remover os recursos seguindo estritamente as instruções documentadas.
3. **Justificativa Técnica Mandatória:** Conforme os requisitos do projeto, toda escolha de arquitetura, serviço de nuvem, ferramenta de CI/CD, persistência ou observabilidade deve ser justificada tecnicamente (aspectos de custo, segurança, disponibilidade, facilidade de manutenção e escalabilidade).
4. **Fonte Única da Verdade:** Evite duplicar instruções. Centralize regras comuns e utilize links relativos para referenciar outros documentos.
5. **Sincronia Obrigatória:** Nenhuma alteração de arquitetura, dependência, variável de ambiente, recurso de infraestrutura (Terraform) ou pipeline (CI/CD) deve ser mesclada sem a devida atualização da documentação.

---

## 2. Segurança e Tratamento de Segredos (Regra Zero)

> [!CAUTION]
> **NUNCA** insira chaves de API, senhas, tokens de acesso, certificados privados ou dados sensíveis em arquivos de documentação ou em qualquer parte versionada do repositório.

- **Placeholders obrigatórios:** Em exemplos de comando ou configuração, utilize placeholders explícitos:
  - `<SUA_CHAVE_API>`
  - `<INFISICAL_PROJECT_ID>`
  - `<USUARIO_BANCO>`
  - `seu-dominio-ou-ip`
- **Variáveis de Ambiente:** Documente as variáveis necessárias fornecendo um arquivo `.env.example` sem valores confidenciais e explique cada parâmetro em `docs/seguranca/` ou no `README` do serviço.
- **Gerenciador de Segredos:** Todo fluxo que dependa de credenciais sensíveis deve documentar o processo de recuperação via ferramenta de segredos (ex: Infisical / Secret Manager), sem exibir os segredos em texto puro.

---

## 3. Padrão de Formatação, Idioma e Nomenclatura

### 3.1. Idioma e Nomenclatura no Código e Documentação
- **Regra Geral:** O idioma oficial do repositório para **arquivos, funções, métodos e variáveis** é o **Português do Brasil (pt-BR)**.
  - Exemplo de arquivos: `autenticacao.controller.ts`, `usuario.service.ts`, `banco_dados.py`.
  - Exemplo de funções: `obterUsuarioPorId()`, `validarDadosEntrada()`, `calcularTotal()`.
  - Exemplo de variáveis: `usuarioAtual`, `listaDeProdutos`, `tempoExpiracao`.
- **Exceção Mandatória (Termos Técnicos Convencionados):** Termos, palavras-chave e jargões amplamente consagrados na indústria de tecnologia/DevOps em inglês **não** passam por tradução forçada.
  - Exemplos mantidos em inglês: *deploy, pipeline, healthcheck, build, setup, token, id, payload, request, response, status, middleware, cluster, endpoint, runtime, release, teardown, commit*.
- **Voz:** Preferencialmente imperativa ou impessoal nos tutoriais e passos a passo ("Execute o comando...", "Configura-se a variável...").

### 3.2. Formato e Nomenclatura de Arquivos
- **Formato:** Todos os arquivos de documentação devem ser escritos em **Markdown (`.md`)** compatível com GitHub Flavored Markdown (GFM).
- **Nomenclatura de Arquivos:**
  - Nomes de diretórios e arquivos em minúsculas com hífen: `kebab-case` (ex: `guia-implantacao.md`, `requisitos-sistema.md`, `regras-documentacao.md`).
  - Exceções: Arquivos de índice ou convenção raiz da pasta: `README.md`, `INDEX.md`.

### 3.3. Estrutura de Títulos
- Utilize apenas **um** título principal (`# Nível 1`) por documento.
- Mantenha a hierarquia correta (`## Nível 2`, `### Nível 3`), sem pular níveis (ex: não passar de `#` direto para `###`).

### 3.4. Blocos de Código e Comandos
- Todo bloco de código deve especificar explicitamente a linguagem para *syntax highlighting*:
  ````markdown
  ```bash
  terraform init
  terraform apply
  ```
  ````
- Comandos destrutivos ou irreversíveis (ex: `terraform destroy`, comandos de deleção em banco) devem conter alertas prévios destacando riscos e cuidados.

---

## 4. Padrões de Git: GitFlow e Conventional Commits em pt-BR

### 4.1. Estrutura de Branches (GitFlow)
O versionamento segue o fluxo do **GitFlow**:

| Branch | Finalidade | Padrão de Nomenclatura |
| :--- | :--- | :--- |
| `main` | Código de produção estável e testado. | `main` |
| `develop` | Branch base de integração contínua para novas funcionalidades. | `develop` |
| `feature/*` | Desenvolvimento de novas funcionalidades. Nomes em pt-BR. | `feature/nome-da-funcionalidade` (ex: `feature/autenticacao-jwt`) |
| `release/*` | Estabilização e preparação de uma nova versão para produção. | `release/vX.Y.Z` (ex: `release/v1.0.0`) |
| `hotfix/*` | Correção emergencial aplicada diretamente em produção. Nomes em pt-BR. | `hotfix/nome-da-correcao` (ex: `hotfix/ajuste-timeout-banco`) |

### 4.2. Padrão de Commits (Conventional Commits em pt-BR)
As mensagens de commit devem seguir a convenção de **Conventional Commits** com a descrição redigida obrigatoriamente em **pt-BR**:

**Formato:**
```text
<tipo>(<escopo opcional>): <descrição sucinta em pt-BR>

[corpo opcional explicando o motivo da alteração]
```

**Tipos permitidos:**
- `feat`: Nova funcionalidade implementada.
  - *Exemplo:* `feat(autenticacao): implementa geracao e validacao de token jwt`
- `fix`: Correção de bug ou falha.
  - *Exemplo:* `fix(banco): corrige vazamento de conexao no pool do postgres`
- `docs`: Criação ou atualização de documentação.
  - *Exemplo:* `docs(teardown): detalha procedimento de remocao de recursos`
- `infra`: Alterações de infraestrutura e código Terraform.
  - *Exemplo:* `infra(terraform): provisiona vpc e subnets privadas`
- `ci`: Modificações nos fluxos e arquivos de pipeline (CI/CD).
  - *Exemplo:* `ci(pipeline): adiciona etapa de smoke test automatizado pos-deploy`
- `test`: Inclusão ou ajuste de testes automatizados.
  - *Exemplo:* `test(api): adiciona testes de integracao para rota de usuarios`
- `refactor`: Refatoração de código sem alteração de funcionalidade.
  - *Exemplo:* `refactor(servico): simplifica fluxo de validacao de entrada`
- `perf`: Melhoria no desempenho.
  - *Exemplo:* `perf(consulta): otimiza consulta de listagem com indice`
- `chore`: Tarefas de manutenção, dependências e configurações gerais.
  - *Exemplo:* `chore(deps): atualiza dependencias do backend`

### 4.3. Commits Incrementais e Atômicos
- **Separação por Funcionalidade/Etapa:** Os commits não devem ser monolíticos ("megacommits"). Cada commit deve cobrir apenas uma unidade atômica de trabalho (ex: modelo, serviço, rotas, testes, docs).
- **Narrativa Clara de Fluxo:** O histórico do repositório deve registrar progressivamente o fluxo de implementação, facilitando auditoria, revisões de código e eventuais reversões com `git revert`.

---

## 5. Diagramas e Recursos Visuais

- **Diagrams as Code (Mermaid):** Sempre que possível, utilize blocos `mermaid` para desenhar diagramas de arquitetura, fluxo de CI/CD ou sequência:
  ```mermaid
  flowchart LR
    Cliente --> Frontend
    Frontend --> Backend
    Backend --> BancoDeDados[(PostgreSQL)]
  ```
- **Imagens estáticas:** Quando indispensáveis (ex: prints de dashboards do Grafana, interface de usuário para evidência de funcionamento), armazene-as em `docs/assets/` com nomes descritivos e tamanho otimizado.

---

## 6. Registros de Decisão de Arquitetura (ADRs)

Para cumprir o requisito de **justificativa técnica de todas as escolhas**:
- Toda decisão técnica expressiva (ex: escolha do framework backend/frontend, escolha do banco de dados, provedor cloud, ferramenta de observabilidade e CI/CD) deve gerar um arquivo ADR em `docs/arquitetura/adrs/`.
- Utilize o padrão numérico incremental: `NNN-titulo-da-decisao.md` (ex: `001-escolha-do-banco-de-dados.md`).
- Utilize o template oficial em [`docs/templates/adr-template.md`](file:///home/matias/Documentos/cloudops-lab/docs/templates/adr-template.md).

---

## 7. Documentação Operacional Obrigatória

O repositório deve obrigatoriamente manter atualizados os seguintes guias:

| Guia | Localização | Objetivo |
| :--- | :--- | :--- |
| **Setup Local** | `docs/desenvolvimento/README.md` | Instruções passo a passo para rodar frontend, backend e persistência em ambiente local (ex: via Docker Compose). |
| **Padrões de Código e Git** | `docs/desenvolvimento/padroes-codigo-git.md` | Convenções de nomenclatura pt-BR, GitFlow e Conventional Commits. |
| **Infraestrutura e Provisionamento** | `docs/infraestrutura/README.md` | Como inicializar e aplicar as receitas do Terraform. |
| **CI/CD** | `docs/ci-cd/README.md` | Estrutura dos pipelines, etapas de teste, build, deploy e verificação automática pós-deploy. |
| **Segurança e Segredos** | `docs/seguranca/README.md` | Fluxo de segredos (Infisical/variáveis), políticas de acesso e boas práticas. |
| **Observabilidade** | `docs/observabilidade/README.md` | Como acessar e validar métricas (Prometheus), logs e dashboards (Grafana). |
| **Implanatação (Deploy)** | `docs/operacao/deploy.md` | Guia de implantação da aplicação em ambiente de nuvem. |
| **Remoção de Recursos (Teardown)** | `docs/infraestrutura/teardown.md` | **Mandatório:** Processo seguro para destruir todos os recursos de nuvem provisionados, evitando cobranças residuais. |

---

## 8. Checklist de Validação (Definition of Done)

Antes de considerar uma tarefa ou Pull Request concluído, valide:

- [ ] A nomenclatura de arquivos, funções e variáveis segue o padrão **pt-BR** (exceto termos técnicos universais em inglês)?
- [ ] A branch foi criada a partir do fluxo correto do **GitFlow** (`feature/`, `release/`, `hotfix/`)?
- [ ] Os commits são **atômicos e incrementais**, separados por funcionalidade/camada (sem commits monolíticos)?
- [ ] Os commits seguem **Conventional Commits** com mensagens descritivas em **pt-BR**?
- [ ] A documentação reflete o estado atual do código e da infraestrutura?
- [ ] Todos os comandos listados foram testados e funcionam conforme documentado?
- [ ] Não há senhas, tokens ou dados confidenciais expostos?
- [ ] As novas escolhas técnicas foram justificadas ou registradas em ADR?
- [ ] Os procedimentos de deploy e destruição/teardown continuam íntegros e reproduzíveis?
- [ ] Todos os links internos relativos continuam válidos?

