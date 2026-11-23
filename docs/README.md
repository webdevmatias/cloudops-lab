# Documentação do Projeto CloudOps Lab

Bem-vindo à central de documentação do projeto **CloudOps Lab**.

Este diretório contém todas as especificações técnicas, diagramas de arquitetura, manuais operacionais, decisões de engenharia e procedimentos para implantação, sustentação e remoção da aplicação em ambiente de nuvem.

---

## 📌 Guia de Governança e Regras

Antes de produzir ou alterar qualquer documentação neste projeto, consulte:
👉 [**Regras e Diretrizes de Documentação**](REGRAS_DOCUMENTACAO.md) — padrões de formatação, regras de segurança de segredos, convenções de código e critérios de aceitação.

---

## 🗺️ Estrutura da Documentação

A documentação está dividida de forma modular nas seguintes áreas:

```text
docs/
├── README.md                     # Índice principal da documentação (este arquivo)
├── REGRAS_DOCUMENTACAO.md        # Diretrizes, padrões e regras mandatórias
├── proposta-inicial.md           # Proposta do projeto, problema real e tecnologias
├── equipe.md                     # Organização do grupo e divisão de tarefas
│
├── arquitetura/                  # Visão geral, diagramas de componentes e fluxos
│   ├── README.md                 # Arquitetura da solução e diagrama sistêmico
│   └── adrs/                     # Registros de Decisões de Arquitetura (ADRs)
│
├── desenvolvimento/              # Instruções para desenvolvedores
│   ├── README.md                 # Guia de ambiente local, dependências e testes
│   └── padroes-codigo-git.md     # Padrões pt-BR, GitFlow e Conventional Commits
│
├── infraestrutura/               # Infraestrutura como Código (Terraform)
│   ├── README.md                 # Módulos, topologia de rede e provisionamento
│   └── teardown.md               # Guia mandatório de destruição e limpeza de recursos
│
├── ci-cd/                        # Pipelines de automação
│   └── README.md                 # Etapas de testes, build, deploy e validação pós-deploy
│
├── seguranca/                    # Gestão de segredos e credenciais
│   └── README.md                 # Estratégia híbrida: Infisical em dev/CI e SSM em produção
│
├── observabilidade/              # Monitoramento e telemetria
│   └── README.md                 # Métricas (Prometheus), logs e dashboards (Grafana)
│
├── operacao/                     # Guias de suporte e operação
│   ├── deploy.md                 # Procedimento de deploy em nuvem
│   └── troubleshooting.md        # Resolução de problemas comuns e diagnósticos
│
└── templates/                    # Modelos padronizados para novos documentos
    ├── adr-template.md           # Template para ADR
    └── runbook-template.md       # Template para procedimentos operacionais
```

---

## 🚀 Navegação Rápida

- [Proposta Inicial do Projeto](proposta-inicial.md)
- [Organização da Equipe e Divisão de Tarefas](equipe.md)
- [Arquitetura do Sistema](arquitetura/README.md)
- [Decisões Técnicas Justificadas (ADRs)](arquitetura/adrs/)
- [Execução em Ambiente Local](desenvolvimento/README.md)
- [Padrões de Código e Git (pt-BR, GitFlow & Conventional Commits)](desenvolvimento/padroes-codigo-git.md)
- [Provisionamento de Infraestrutura (Terraform)](infraestrutura/README.md)
- [Destruição e Remoção de Recursos (Teardown)](infraestrutura/teardown.md)
- [Pipeline de CI/CD e Verificação Automatizada](ci-cd/README.md)
- [Gestão de Segredos e Segurança](seguranca/README.md)
- [Métricas, Logs e Dashboards](observabilidade/README.md)
- [Guia de Deploy](operacao/deploy.md)

