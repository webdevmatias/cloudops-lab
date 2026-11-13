# OBJETIVO

Desenvolver e implantar uma aplicação funcional em ambiente de nuvem. O
projeto deverá integrar o desenvolvimento de software, a infraestrutura em nuvem, a
automação de processos, a integração e entrega contínuas (CI/CD), a segurança e a
observabilidade.

# PROPOSTA

Deve ser desenvolvida uma aplicação de sua escolha, identificando um
problema real ou um cenário de uso que justifique sua implementação.
A solução deverá possuir funcionalidades reais e uma arquitetura compatível com o problema proposto,
contemplando os componentes necessários ao seu funcionamento. A aplicação deve possuir interface de usuário (frontend), serviço de
backend e mecanismo de persistência de dados, como um banco de dados relacional ou não
relacional. A solução deverá apresentar funcionalidades efetivas, permitindo demonstrar a
interação entre seus componentes e o armazenamento e recuperação de informações.

Todas as escolhas de arquitetura, os serviços de nuvem e as
ferramentas utilizadas deverão ser tecnicamente justificadas,
considerando aspectos como funcionalidade, segurança, escalabilidade, manutenção e
disponibilidade.

# REQUISITOS TÉCNICOS

## APLICAÇÃO

A aplicação deverá:
- Implementar funcionalidades compatíveis com o problema proposto.
- Possuir uma arquitetura documentada, identificando seus principais componentes e
suas interações.
- Utilizar um mecanismo adequado de persistência.
- Ser executada em ambiente de nuvem e disponibilizar uma forma de demonstrar seu
funcionamento.

## INFRAESTRUTURA COMO CÓDIGO

Deve utilizar Terraform para automatizar o provisionamento dos principais
recursos de infraestrutura utilizados pelo projeto, incluindo os recursos necessários para
execução da aplicação e sua comunicação. Os arquivos de configuração deverão estar
versionados no repositório Git.

## INTEGRAÇÃO E ENTREGA CONTÍNUAS (CI/CD)

O projeto deverá possuir um pipeline automatizado que contemple, no mínimo:
- Verificação do código e execução de testes automatizados.
- Construção e disponibilização dos artefatos necessários à implantação.
- Implantação automatizada da aplicação no ambiente de nuvem.
- Verificação do resultado da implantação, incluindo a realização de uma verificação
automatizada de disponibilidade ou funcionamento da aplicação após o deploy.

## SEGURANÇA E GERENCIAMENTO DE SEGREDOS

O projeto deve demonstrar práticas de segurança compatíveis com a solução, incluindo o
gerenciamento adequado de credenciais, tokens, senhas e demais informações sensíveis.
Ferramentas como Infisical poderão ser utilizadas para gerenciar e disponibilizar segredos.
As credenciais não devem ser armazenadas diretamente no código-fonte ou em arquivos
versionados sem proteção adequada.

## TESTES E QUALIDADE

O projeto deverá contemplar testes automatizados adequados à aplicação, como testes
unitários, de integração ou de API. Os testes deverão estar integrados ao pipeline de CI/CD.

## OBSERVABILIDADE

Devem ser implementados mecanismos de observabilidade que permitam acompanhar o
funcionamento da aplicação implantada em nuvem.
A solução deverá contemplar, no mínimo:
- Métricas: coleta de informações relacionadas ao funcionamento da aplicação, como
quantidade de requisições, disponibilidade ou tempo de resposta.
- Logs: registro de operações relevantes e de ocorrências de erro durante a execução
da aplicação.
- Visualização: disponibilização de uma forma de consultar as métricas e os logs
coletados, por meio de dashboards ou ferramentas equivalentes.
Poderão ser utilizadas ferramentas como Prometheus, Grafana e Telegraf, entre outras
alternativas tecnicamente justificadas.

## DOCUMENTAÇÃO

O repositório deverá conter documentação suficiente para compreender a aplicação, sua
arquitetura, as tecnologias empregadas e os procedimentos necessários para execução,
implantação e remoção dos recursos.
