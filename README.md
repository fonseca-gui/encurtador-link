# LinkFácil — Encurtador de Links

Aplicação web para encurtar URLs, redirecionar usuários
e consultar estatísticas básicas de acesso.

## Tecnologias

- Node.js
- Express
- SQLite
- HTML, CSS e JavaScript
- Git e GitHub

## Funcionalidades

- Criação de links curtos
- Redirecionamento HTTP
- Persistência de dados em SQLite
- Contabilização de acessos
- API REST para criação e consulta de links

## Como executar localmente

1. Instale o Node.js LTS.
2. Clone este repositório.
3. Execute `npm install`.
4. Crie o arquivo `.env` com as configurações necessárias.
5. Execute `npm run dev`.
6. Acesse http://localhost:3000.

## Endpoints

- `POST /api/links`: cria um link curto.
- `GET /api/links/:code`: consulta um link.
- `GET /:code`: redireciona para a URL original.

## Aprendizados

Projeto desenvolvido para praticar desenvolvimento
backend, APIs REST, banco de dados SQL, validação
de entradas e controle de versão.
