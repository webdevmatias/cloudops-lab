# Registros de Decisões de Arquitetura (ADRs)

Este diretório contém os Registros de Decisões de Arquitetura (*Architecture Decision Records*). Cada arquivo documenta uma decisão arquitetural ou tecnológica relevante, fundamentada nos pilares do projeto (funcionalidade, segurança, escalabilidade, manutenção, custo e disponibilidade).

---

## Como criar uma nova ADR

1. Copie o template oficial em [`docs/templates/adr-template.md`](../../templates/adr-template.md).
2. Nomeie o arquivo com numeração sequencial de 3 dígitos e descrição curta em *kebab-case*:
   - Exemplo: `001-escolha-do-framework-backend.md`
   - Exemplo: `002-escolha-do-banco-de-dados.md`
   - Exemplo: `003-provedor-de-nuvem-e-computacao.md`
3. Preencha todos os campos do template, garantindo a justificativa técnica detalhada.

---

## Índice de Decisões

| ID | Data | Título | Status |
| :---: | :---: | :--- | :---: |
| *001* | *Em breve* | *Definição da stack de aplicação e banco de dados* | *Proposto* |
| *002* | *Em breve* | *Escolha do provedor de nuvem e arquitetura de computação* | *Proposto* |
| [003](003-estrategia-de-observabilidade.md) | 2026-11-24 | Estratégia de observabilidade (Prometheus, Grafana, Loki e Promtail) | Aceito |
| [004](004-topologia-de-rede-vpc-unica.md) | 2026-11-22 | Topologia de rede com VPC única | Proposto |
| [005](005-acesso-administrativo-via-ssm.md) | 2026-11-22 | Acesso administrativo e deploy via SSM Session Manager | Proposto |
| [006](006-estrategia-hibrida-de-segredos.md) | 2026-11-23 | Estratégia híbrida de segredos (Infisical em dev/CI e SSM em produção) | Proposto |

