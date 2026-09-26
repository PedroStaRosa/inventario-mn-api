# Inventário MN — Documentação da API

## Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Autenticação](#autenticação)
- [Middlewares](#middlewares)
- [Rate Limiting](#rate-limiting)
- [Modelos de Dados](#modelos-de-dados)
- [Fluxo da API](#fluxo-da-api)
- [Endpoints](#endpoints)
  - [Usuários](#usuários)
    - [POST /api/v1/user — Criar usuário](#post-apiv1user--criar-usuário)
    - [POST /api/v1/auth — Login](#post-apiv1auth--login)
    - [POST /api/v1/auth/refresh — Renovar tokens](#post-apiv1authrefresh--renovar-tokens)
    - [POST /api/v1/auth/logout — Encerrar sessão](#post-apiv1authlogout--encerrar-sessão)
    - [GET /api/v1/auth/me — Usuário atual](#get-apiv1authme--usuário-atual)
  - [Produtos](#produtos)
    - [GET /api/v1/products — Listar produtos](#get-apiv1products--listar-produtos)
    - [POST /api/v1/products — Criar produto](#post-apiv1products--criar-produto)
    - [POST /api/v1/products/import/many — Importar em lote (JSON)](#post-apiv1productsimportmany--importar-em-lote-json)
    - [PUT /api/v1/products/updateABCSales — Alternar curva ABC](#put-apiv1productsupdateabcsales--alternar-curva-abc)
  - [Inventários](#inventários)
    - [GET /api/v1/inventories — Listar todos os inventários](#get-apiv1inventories--listar-todos-os-inventários)
    - [GET /api/v1/inventory — Buscar inventário por ID](#get-apiv1inventory--buscar-inventário-por-id)
    - [GET /api/v1/inventory/suggested — Produtos sugeridos para inventário](#get-apiv1inventorysuggested--produtos-sugeridos-para-inventário)
    - [GET /api/v1/inventory/product — Buscar inventários de um produto](#get-apiv1inventoryproduct--buscar-inventários-de-um-produto)
    - [POST /api/v1/inventory — Criar inventário (JSON)](#post-apiv1inventory--criar-inventário-json)
    - [DELETE /api/v1/inventory — Deletar inventário](#delete-apiv1inventory--deletar-inventário)
  - [Dashboard](#dashboard)
    - [GET /api/v1/dashboard — Resumo agregado do sistema](#get-apiv1dashboard--resumo-agregado-do-sistema)
- [Swagger UI](#swagger-ui)
- [Erros Globais](#erros-globais)
- [Regras de domínio](#regras-de-domínio)

---

## Visão Geral

**Inventário MN** é uma API REST para gerenciamento de inventário de produtos. Permite cadastrar produtos, registrar contagens físicas, controlar divergências entre estoque esperado e contado e consultar um resumo agregado para a home.

A API segue uma arquitetura modular por domínio (`user`, `products`, `inventory`, `dashboard`), com autenticação JWT de curta duração e refresh token opaco. Todos os dados de negócio são isolados por usuário.

| Campo         | Valor                            |
|---------------|----------------------------------|
| **Versão**    | 1.0.0                            |
| **Base URL**  | `http://localhost:3000` (padrão) |
| **Prefixo**   | `/api/v1`                        |
| **Protocolo** | HTTP/HTTPS                       |

Toda resposta inclui o cabeçalho `x-request-id`. Se o cliente enviar `X-Request-Id`, esse valor é reaproveitado; caso contrário, a API gera um UUID.

---

## Tecnologias

| Tecnologia         | Versão | Função                                      |
|--------------------|--------|---------------------------------------------|
| Node.js            | —      | Runtime                                     |
| TypeScript         | 5.9    | Linguagem                                   |
| Express            | 5.2    | Framework HTTP                              |
| Prisma ORM         | 7.9    | Acesso ao banco de dados                    |
| PostgreSQL         | —      | Banco de dados relacional                   |
| Zod                | 4.3    | Validação de schemas                        |
| jsonwebtoken       | 9      | Access token JWT (HS256)                    |
| bcryptjs           | 3      | Hashing de senhas (salt 10)                 |
| express-rate-limit | 8      | Rate limiting por IP                        |
| helmet             | 8      | Cabeçalhos de segurança HTTP                |
| cors               | 2.8    | Controle de origens permitidas              |
| pino               | 10     | Logs estruturados                           |
| swagger-jsdoc      | 6      | Geração de spec OpenAPI                     |
| swagger-ui-express | 5      | Interface Swagger UI                        |
| dotenv             | 17     | Carregamento de variáveis de ambiente       |

---

## Variáveis de Ambiente

| Variável                 | Obrigatória | Descrição                                                                 |
|--------------------------|-------------|---------------------------------------------------------------------------|
| `DATABASE_URL`           | Sim         | URL de conexão PostgreSQL                                                 |
| `JWT_SECRET_KEY`         | Sim         | Chave secreta do access token (mínimo 32 caracteres)                      |
| `JWT_EXPIRES_IN`         | Sim         | Expiração do access token em **segundos** (inteiro positivo)              |
| `JWT_REFRESH_EXPIRES_IN` | Sim         | Expiração do refresh token em **segundos** (inteiro positivo)             |
| `ALLOWED_ORIGINS`        | Sim         | Origens permitidas pelo CORS, separadas por vírgula                       |
| `EXPRESS_PORT`           | Não         | Porta do servidor. Padrão: `3000`                                         |
| `NODE_ENV`               | Não         | `development`, `production` ou `test`. Em `production` o Swagger fica off |
| `LOG_LEVEL`              | Não         | `fatal`, `error`, `warn`, `info`, `debug`, `trace` ou `silent`. Padrão: `info` |

**Exemplo:**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/inventario_mn
JWT_SECRET_KEY=minha_chave_super_secreta_com_32_chars
JWT_EXPIRES_IN=900
JWT_REFRESH_EXPIRES_IN=604800
EXPRESS_PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,https://meuapp.com
NODE_ENV=development
LOG_LEVEL=info
```

---

## Autenticação

A API usa dois tokens:

| Token            | Formato                         | Onde enviar                                      | Uso                                      |
|------------------|---------------------------------|--------------------------------------------------|------------------------------------------|
| Access token     | JWT HS256                       | `Authorization: Bearer <token>`                  | Endpoints protegidos                     |
| Refresh token    | Opaco (`base64url`, 32 bytes)   | Body JSON `{ "refreshToken": "..." }`            | Renovar sessão e logout                  |

O refresh token é armazenado apenas como hash SHA-256. Cada renovação **revoga** o refresh atual e emite um novo par (rotação). Reutilizar um refresh já revogado invalida todas as sessões daquele usuário.

**Payload do access token:**

```json
{
  "sub": "uuid-do-usuario",
  "name": "Nome do Usuário",
  "email": "usuario@email.com",
  "iat": 1700000000,
  "exp": 1700000900
}
```

O campo `sub` é o UUID do usuário e alimenta o isolamento de dados (`req.user_id`).

**Login e refresh devolvem o mesmo formato:**

```json
{
  "id": "uuid-do-usuario",
  "name": "Nome do Usuário",
  "email": "usuario@email.com",
  "token": "access-token-jwt",
  "refreshToken": "refresh-token-opaco"
}
```

**Endpoints públicos (sem Bearer):**

- `POST /api/v1/user`
- `POST /api/v1/auth`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api-docs` (somente quando `NODE_ENV` não é `production`)

Todos os demais endpoints exigem access token válido.

Falhas de autenticação do middleware respondem com `{ "message": "..." }`:

| Situação              | Status | Corpo                                              |
|-----------------------|--------|----------------------------------------------------|
| Header ausente        | 401    | `{ "message": "Authorization token is required" }` |
| Token inválido/expirado | 401  | `{ "message": "token invalid" }`                   |

---

## Middlewares

| Middleware                   | Aplicação                                      | Descrição                                                                                          |
|------------------------------|------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `requestContextMiddleware`   | Global                                         | Lê ou gera `X-Request-Id` e devolve o valor em `x-request-id`.                                     |
| `httpAccessLogger`           | Global                                         | Registra método, rota, status e duração. Não loga `/api-docs`.                                     |
| `helmet`                     | Global                                         | Cabeçalhos HTTP de segurança.                                                                      |
| `cors`                       | Global                                         | Origens de `ALLOWED_ORIGINS` (fallback `http://localhost:3000`). Métodos: GET, POST, PUT, DELETE. Headers: `Content-Type`, `Authorization`, `X-Request-Id`. `credentials: true`. |
| `isAuthenticated`            | Endpoints protegidos                           | Valida o JWT e injeta `req.user_id`.                                                               |
| `validateSchema`             | Endpoints com schema Zod                       | Valida `body`, `query` e `params`. Em falha, `400` com `{ "error": "Erro validação", "details": [...] }`. |
| `validateCreateManyProducts` | `POST /api/v1/products/import/many`            | Exige o campo `products` no body.                                                                  |
| Rate limiters                | Ver [Rate Limiting](#rate-limiting)            | Limite por IP.                                                                                     |

---

## Rate Limiting

| Limitador              | Janela    | Limite | Mensagem (HTTP 429)                                              | Rotas                                                                 |
|------------------------|-----------|--------|------------------------------------------------------------------|-----------------------------------------------------------------------|
| `registerLimiter`      | 15 min    | 5      | `Muitas tentativas. Tente novamente em 5 minutos.`               | `POST /api/v1/user`                                                   |
| `loginLimiter`         | 5 min     | 5      | `Muitas tentativas de login. Tente novamente em 5 minutos.`      | `POST /api/v1/auth`                                                   |
| `refreshTokenLimiter`  | 5 min     | 30     | `Muitas tentativas de refresh token. Tente novamente em 5 minutos.` | `POST /api/v1/auth/refresh`                                        |
| `authLimiter`          | 5 min     | 5      | `Muitas tentativas. Tente novamente em 5 minutos.`               | `POST /api/v1/auth/logout`                                            |
| `readLimiter`          | 1 min     | 200    | `Muitas requisições de leitura. Tente novamente em 1 minuto.`    | `GET /auth/me`, `GET /products`, leituras de inventário               |
| `writeLimiter`         | 1 min     | 50     | `Muitas requisições de escrita. Tente novamente em 1 minuto.`    | criação/edição de produtos, `POST` e `DELETE` de inventário           |
| `apiLimiter`           | 5 min     | 100    | `Muitas requisições. Tente novamente em 5 minutos.`              | `POST /api/v1/inventory` (além do `writeLimiter`)                     |

`GET /api/v1/dashboard` não passa por rate limiter próprio.

---

## Modelos de Dados

### User

| Campo       | Tipo        | Descrição                            |
|-------------|-------------|--------------------------------------|
| `id`        | `String`    | UUID                                 |
| `name`      | `String`    | Nome                                 |
| `email`     | `String`    | E-mail único                         |
| `password`  | `String`    | Hash bcrypt (salt 10). Nunca retornado |
| `createdAt` | `DateTime`  | Criação                              |
| `updatedAt` | `DateTime`  | Atualização                          |
| `removedAt` | `DateTime?` | Soft delete. Usuário removido não autentica |

### RefreshToken

| Campo       | Tipo        | Descrição                                      |
|-------------|-------------|------------------------------------------------|
| `id`        | `String`    | UUID                                           |
| `tokenHash` | `String`    | SHA-256 do refresh token (único)               |
| `userId`    | `String`    | Dono da sessão                                 |
| `expiresAt` | `DateTime`  | Expiração (`JWT_REFRESH_EXPIRES_IN`)           |
| `revokedAt` | `DateTime?` | Preenchido no logout, na rotação ou na reutilização |
| `createdAt` | `DateTime`  | Criação                                        |

Ao excluir o usuário, os refresh tokens são removidos em cascata.

### Product

| Campo           | Tipo        | Descrição                                                                 |
|-----------------|-------------|---------------------------------------------------------------------------|
| `id`            | `String`    | UUID                                                                      |
| `code`          | `String`    | Código numérico. Zeros à esquerda são removidos na gravação               |
| `description`   | `String`    | Descrição (trim na gravação)                                              |
| `unit`          | `String?`   | Unidade. Na criação: `UN`, `KG`, `LT`, `SC` ou `PT`                       |
| `lastInventory` | `DateTime?` | Data do último inventário que incluiu o produto                           |
| `isAbcSales`    | `Boolean`   | Marcação de curva ABC de vendas. Padrão `false`. Alternada por endpoint   |
| `createdAt`     | `DateTime`  | Criação                                                                   |
| `updatedAt`     | `DateTime`  | Atualização                                                               |
| `userId`        | `String`    | Dono do produto                                                           |

### Inventory

| Campo       | Tipo       | Descrição                 |
|-------------|------------|---------------------------|
| `id`        | `String`   | UUID                      |
| `name`      | `String`   | Nome único por usuário    |
| `createdAt` | `DateTime` | Criação                   |
| `userId`    | `String`   | Dono do inventário        |

### InventoryItem

| Campo           | Tipo      | Descrição                                              |
|-----------------|-----------|--------------------------------------------------------|
| `id`            | `String`  | UUID                                                   |
| `inventoryId`   | `String`  | Inventário                                             |
| `productId`     | `String`  | UUID interno do produto                                |
| `unitInput`     | `String?` | Unidade informada na contagem. Padrão no banco: `UN`   |
| `stockExpected` | `Decimal` | Estoque esperado (10,2). Serializado como string       |
| `stockCounted`  | `Decimal` | Estoque contado (10,2). Serializado como string        |
| `difference`    | `Decimal` | `stockCounted - stockExpected` (10,2)                  |
| `createdAt`     | `DateTime`| Criação                                                |

O par `(inventoryId, productId)` é único. Excluir um inventário remove os itens em cascata.

---

## Fluxo da API

```
Cadastro
  ↓
POST /api/v1/user
  ↓
Login
  ↓
POST /api/v1/auth → { token, refreshToken }
  ↓
Authorization: Bearer <token> nas rotas protegidas
  ↓
Produtos
  ↓
POST /api/v1/products
POST /api/v1/products/import/many
PUT  /api/v1/products/updateABCSales?id=
  ↓
Inventário
  ↓
GET  /api/v1/inventory/suggested?days=&limit=
POST /api/v1/inventory
  ↓
Consulta
  ↓
GET /api/v1/dashboard
GET /api/v1/inventories
GET /api/v1/inventory?id=
GET /api/v1/inventory/product?id=
  ↓
Manutenção
  ↓
DELETE /api/v1/inventory?id=
  ↓
Sessão
  ↓
POST /api/v1/auth/refresh   → novo par de tokens (body com refreshToken)
POST /api/v1/auth/logout    → revoga o refreshToken
```

---

## Endpoints

---

## Usuários

### POST /api/v1/user — Criar usuário

Cria uma conta. Público.

| Item        | Valor                    |
|-------------|--------------------------|
| **Método**  | `POST`                   |
| **Rota**    | `/api/v1/user`           |
| **Auth**    | Não                      |
| **Limiter** | `registerLimiter`        |

#### Body

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "Senha123"
}
```

| Campo      | Regras                                                                 |
|------------|------------------------------------------------------------------------|
| `name`     | Texto, mínimo 3 caracteres                                             |
| `email`    | E-mail válido                                                          |
| `password` | 8 a 32 caracteres, com ao menos 1 maiúscula, 1 minúscula e 1 número    |

#### Resposta de sucesso — 200 OK

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2026-09-26T18:00:00.000Z"
}
```

#### Erros

| Status | Quando                         | Corpo                                      |
|--------|--------------------------------|--------------------------------------------|
| 400    | Body inválido                  | `{ "error": "Erro validação", "details": [{ "message": "..." }] }` |
| 409    | E-mail já cadastrado           | `{ "error": "Usuário já cadastrado." }`    |
| 429    | Limite de cadastro             | mensagem do `registerLimiter`              |

---

### POST /api/v1/auth — Login

Autentica e emite access token e refresh token. Público. Usuário com `removedAt` preenchido não autentica.

| Item        | Valor             |
|-------------|-------------------|
| **Método**  | `POST`            |
| **Rota**    | `/api/v1/auth`    |
| **Auth**    | Não               |
| **Limiter** | `loginLimiter`    |

#### Body

```json
{
  "email": "joao@example.com",
  "password": "Senha123"
}
```

`password` é obrigatória e tem no máximo 32 caracteres. A complexidade da senha é exigida só no cadastro.

#### Resposta de sucesso — 200 OK

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "João Silva",
  "email": "joao@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "opaque-base64url-token"
}
```

#### Erros

| Status | Quando              | Corpo                                   |
|--------|---------------------|-----------------------------------------|
| 400    | Body inválido       | `{ "error": "Erro validação", "details": [...] }` |
| 401    | Credenciais inválidas | `{ "error": "Credenciais inválidas." }` |
| 429    | Muitas tentativas   | mensagem do `loginLimiter`              |

---

### POST /api/v1/auth/refresh — Renovar tokens

Troca um refresh token válido por um novo access token e um novo refresh token. O refresh enviado é revogado.

Não usa `Authorization`. O access token pode já estar expirado.

| Item        | Valor                    |
|-------------|--------------------------|
| **Método**  | `POST`                   |
| **Rota**    | `/api/v1/auth/refresh`   |
| **Auth**    | Refresh token no body    |
| **Limiter** | `refreshTokenLimiter`    |

#### Body

```json
{
  "refreshToken": "opaque-base64url-token"
}
```

#### Resposta de sucesso — 200 OK

Mesmo formato do login: `id`, `name`, `email`, `token`, `refreshToken`.

Guarde o novo `refreshToken`. O anterior deixa de valer.

#### Erros

| Status | Quando                                              | Corpo                                              |
|--------|-----------------------------------------------------|----------------------------------------------------|
| 400    | `refreshToken` ausente                              | `{ "error": "Erro validação", "details": [...] }`  |
| 401    | Token desconhecido ou já revogado                   | `{ "error": "Refresh token inválido." }`           |
| 401    | Token expirado                                      | `{ "error": "Refresh token expirado." }`           |
| 401    | Usuário removido                                    | `{ "error": "Usuário não encontrado ou removido." }` |
| 429    | Limite de refresh                                   | mensagem do `refreshTokenLimiter`                  |

Reuso de um refresh revogado revoga **todas** as sessões daquele usuário e responde `401` com `Refresh token inválido.`

---

### POST /api/v1/auth/logout — Encerrar sessão

Revoga o refresh token informado. Público e idempotente: token desconhecido ou já revogado também responde sucesso.

| Item        | Valor                 |
|-------------|-----------------------|
| **Método**  | `POST`                |
| **Rota**    | `/api/v1/auth/logout` |
| **Auth**    | Não                   |
| **Limiter** | `authLimiter`         |

#### Body

```json
{
  "refreshToken": "opaque-base64url-token"
}
```

#### Resposta de sucesso — 200 OK

```json
{
  "message": "Sessão encerrada."
}
```

O access token continua válido até expirar. O logout impede apenas a renovação daquele refresh.

#### Erros

| Status | Quando                 | Corpo                                     |
|--------|------------------------|-------------------------------------------|
| 400    | `refreshToken` ausente | `{ "error": "Erro validação", "details": [...] }` |
| 429    | Limite                 | mensagem do `authLimiter`                 |

---

### GET /api/v1/auth/me — Usuário atual

Retorna o usuário do access token, sem senha.

| Item        | Valor              |
|-------------|--------------------|
| **Método**  | `GET`              |
| **Rota**    | `/api/v1/auth/me`  |
| **Auth**    | Bearer             |
| **Limiter** | `readLimiter`      |

#### Resposta de sucesso — 200 OK

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2026-09-26T18:00:00.000Z",
  "updatedAt": "2026-09-26T18:00:00.000Z"
}
```

#### Erros

| Status | Quando                    | Corpo                                      |
|--------|---------------------------|--------------------------------------------|
| 401    | Token ausente ou inválido | `{ "message": "..." }`                     |
| 404    | Usuário removido/inexistente | `{ "error": "Usuário não encontrado." }` |
| 429    | Limite de leitura         | mensagem do `readLimiter`                  |

---

## Produtos

Unidades aceitas na criação: `UN`, `KG`, `LT`, `SC`, `PT`.

O código precisa ser numérico. Na gravação, zeros à esquerda são removidos (`000123` vira `123`). Código não numérico responde `400` com `{ "error": "Código do produto inválido." }`.

### GET /api/v1/products — Listar produtos

Lista os produtos do usuário autenticado.

| Item        | Valor               |
|-------------|---------------------|
| **Método**  | `GET`               |
| **Rota**    | `/api/v1/products`  |
| **Auth**    | Bearer              |
| **Limiter** | `readLimiter`       |

#### Resposta de sucesso — 200 OK

```json
{
  "products": [
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "code": "123",
      "description": "Produto exemplo",
      "unit": "UN",
      "lastInventory": null,
      "isAbcSales": false,
      "createdAt": "2026-09-26T18:00:00.000Z",
      "updatedAt": "2026-09-26T18:00:00.000Z",
      "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    }
  ],
  "total_products": 1
}
```

#### Erros

| Status | Quando            |
|--------|-------------------|
| 401    | Não autenticado   |
| 429    | Limite de leitura |
| 500    | Falha interna     |

---

### POST /api/v1/products — Criar produto

| Item        | Valor               |
|-------------|---------------------|
| **Método**  | `POST`              |
| **Rota**    | `/api/v1/products`  |
| **Auth**    | Bearer              |
| **Limiter** | `writeLimiter`      |

#### Body

```json
{
  "code": "000123",
  "description": "Produto exemplo",
  "unit": "UN"
}
```

`code`, `description` e `unit` são obrigatórios.

#### Resposta de sucesso — 201 Created

O produto gravado, com `code` já sanitizado e `isAbcSales: false`.

#### Erros

| Status | Quando                         | Corpo                                   |
|--------|--------------------------------|-----------------------------------------|
| 400    | Validação ou código inválido   | ver [Erros Globais](#erros-globais)     |
| 401    | Não autenticado                | `{ "message": "..." }`                  |
| 409    | Código já existe para o usuário | `{ "error": "Produto já cadastrado." }` |
| 429    | Limite de escrita              | mensagem do `writeLimiter`              |

---

### POST /api/v1/products/import/many — Importar em lote (JSON)

Cria vários produtos em uma chamada. Códigos que já existem para o usuário entram em `skipped` e não geram conflito. Códigos repetidos **dentro do mesmo envio** abortam a requisição.

| Item        | Valor                              |
|-------------|------------------------------------|
| **Método**  | `POST`                             |
| **Rota**    | `/api/v1/products/import/many`     |
| **Auth**    | Bearer                             |
| **Limiter** | `writeLimiter`                     |

#### Body

```json
{
  "products": [
    {
      "code": "1001",
      "description": "Produto 1",
      "unit": "UN"
    },
    {
      "code": "1002",
      "description": "Produto 2",
      "unit": "KG"
    }
  ]
}
```

O array precisa ter ao menos um item. Cada item segue as mesmas regras do cadastro individual.

#### Resposta de sucesso — 200 OK

```json
{
  "created": [
    { "code": "1001", "description": "Produto 1", "unit": "UN" }
  ],
  "total_created": 1,
  "skipped": [
    { "code": "1002", "description": "Produto 2", "unit": "KG" }
  ],
  "total_skipped": 1,
  "errors": []
}
```

`errors` é preenchido quando a gravação em lote falha no banco. Cada item tem `code`, `description` e `error`.

#### Erros

| Status | Quando                                      | Corpo                                              |
|--------|---------------------------------------------|----------------------------------------------------|
| 400    | `products` ausente, vazio ou inválido       | validação Zod ou `{ "error": "Nenhum produto enviado." }` |
| 400    | Códigos duplicados no payload               | `{ "error": "Há códigos repetidos no envio." }`    |
| 400    | Código não numérico                         | `{ "error": "Código do produto inválido." }`       |
| 401    | Não autenticado                             | `{ "message": "..." }`                             |
| 429    | Limite de escrita                           | mensagem do `writeLimiter`                         |

---

### PUT /api/v1/products/updateABCSales — Alternar curva ABC

Inverte `isAbcSales` do produto (`false` ↔ `true`).

| Item        | Valor                                      |
|-------------|--------------------------------------------|
| **Método**  | `PUT`                                      |
| **Rota**    | `/api/v1/products/updateABCSales`          |
| **Auth**    | Bearer                                     |
| **Limiter** | `writeLimiter`                             |

#### Query

| Parâmetro | Obrigatório | Descrição        |
|-----------|-------------|------------------|
| `id`      | Sim         | UUID do produto  |

Exemplo: `PUT /api/v1/products/updateABCSales?id=<productId>`

Não há body.

#### Resposta de sucesso — 200 OK

```json
{
  "message": "ABC de venda definido com sucesso.",
  "product": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "code": "123",
    "description": "Produto exemplo",
    "isAbcSales": true
  }
}
```

#### Erros

| Status | Quando              | Corpo                                                          |
|--------|---------------------|----------------------------------------------------------------|
| 400    | `id` ausente        | `{ "error": "Id do produto não enviado." }`                    |
| 401    | Não autenticado     | `{ "message": "..." }`                                         |
| 404    | Produto inexistente ou de outro usuário | `{ "error": "Produto não encontrado.", "product": null }` |
| 429    | Limite de escrita   | mensagem do `writeLimiter`                                     |
| 500    | Falha interna       | `{ "error": "Erro interno do servidor", "product": null }`     |

---

## Inventários

No `POST /api/v1/inventory`, o campo `productId` de cada item é o **código do produto** já gravado (sem zeros à esquerda), não o UUID.

`difference` é calculada no servidor: `stockCounted - stockExpected`. A criação também atualiza `lastInventory` dos produtos incluídos.

### GET /api/v1/inventories — Listar todos os inventários

| Item        | Valor                  |
|-------------|------------------------|
| **Método**  | `GET`                  |
| **Rota**    | `/api/v1/inventories`  |
| **Auth**    | Bearer                 |
| **Limiter** | `readLimiter`          |

#### Resposta de sucesso — 200 OK

Array (pode ser vazio):

```json
[
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "name": "Inventário Setembro",
    "createdAt": "2026-09-26T18:00:00.000Z",
    "inventoryItems": [
      {
        "stockExpected": "10.00",
        "stockCounted": "12.00",
        "difference": "2.00",
        "product": {
          "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          "code": "123",
          "description": "Produto exemplo"
        }
      }
    ]
  }
]
```

#### Erros

| Status | Quando            |
|--------|-------------------|
| 401    | Não autenticado   |
| 429    | Limite de leitura |

---

### GET /api/v1/inventory — Buscar inventário por ID

| Item        | Valor               |
|-------------|---------------------|
| **Método**  | `GET`               |
| **Rota**    | `/api/v1/inventory` |
| **Auth**    | Bearer              |
| **Limiter** | `readLimiter`       |

#### Query

| Parâmetro | Obrigatório | Descrição           |
|-----------|-------------|---------------------|
| `id`      | Sim         | UUID do inventário  |

Exemplo: `GET /api/v1/inventory?id=<inventoryId>`

#### Resposta de sucesso — 200 OK

Um objeto no mesmo formato de um item da listagem (id, name, createdAt, inventoryItems).

#### Erros

| Status | Quando                         | Corpo                                      |
|--------|--------------------------------|--------------------------------------------|
| 400    | `id` ausente                   | `{ "error": "Erro validação", "details": [...] }` |
| 401    | Não autenticado                | `{ "message": "..." }`                     |
| 404    | Inventário inexistente ou de outro usuário | `{ "error": "Recurso não encontrado." }` |
| 429    | Limite de leitura              | mensagem do `readLimiter`                  |

---

### GET /api/v1/inventory/suggested — Produtos sugeridos para inventário

Retorna produtos nunca inventariados ou cujo `lastInventory` é anterior a `hoje - days`. A amostra é aleatória entre os que atendem o filtro, limitada por `limit`, ordenada por `createdAt` descendente dentro da página sorteada.

| Item        | Valor                          |
|-------------|-------------------------------|
| **Método**  | `GET`                         |
| **Rota**    | `/api/v1/inventory/suggested` |
| **Auth**    | Bearer                        |
| **Limiter** | `readLimiter`                 |

#### Query

| Parâmetro | Obrigatório | Padrão | Descrição                                      |
|-----------|-------------|--------|------------------------------------------------|
| `days`    | Sim         | —      | Dias sem inventário. `0` é recusado            |
| `limit`   | Não         | `100`  | Quantidade máxima de produtos na resposta      |

Exemplos:

- `GET /api/v1/inventory/suggested?days=30`
- `GET /api/v1/inventory/suggested?days=60&limit=50`

#### Resposta de sucesso — 200 OK

```json
{
  "products": [
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "code": "123",
      "description": "Produto exemplo",
      "unit": "UN",
      "lastInventory": null,
      "isAbcSales": false,
      "createdAt": "2026-09-26T18:00:00.000Z",
      "updatedAt": "2026-09-26T18:00:00.000Z",
      "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    }
  ],
  "total": 1
}
```

`total` é a quantidade de itens **desta resposta**, não o total de produtos elegíveis no banco.

#### Erros

| Status | Quando                         | Corpo                                      |
|--------|--------------------------------|--------------------------------------------|
| 400    | `days` ausente ou inválido     | validação Zod                              |
| 400    | `days` igual a `0`             | `{ "error": "Dias não enviado." }`         |
| 401    | Não autenticado                | `{ "message": "..." }`                     |
| 429    | Limite de leitura              | mensagem do `readLimiter`                  |

---

### GET /api/v1/inventory/product — Buscar inventários de um produto

Devolve o produto e os itens de inventário em que ele aparece (`inventoryItems`).

| Item        | Valor                         |
|-------------|-------------------------------|
| **Método**  | `GET`                         |
| **Rota**    | `/api/v1/inventory/product`   |
| **Auth**    | Bearer                        |
| **Limiter** | `readLimiter`                 |

#### Query

| Parâmetro | Obrigatório | Descrição       |
|-----------|-------------|-----------------|
| `id`      | Sim         | UUID do produto |

Exemplo: `GET /api/v1/inventory/product?id=<productId>`

#### Resposta de sucesso — 200 OK

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "code": "123",
  "description": "Produto exemplo",
  "unit": "UN",
  "lastInventory": "2026-09-20T12:00:00.000Z",
  "isAbcSales": false,
  "createdAt": "2026-09-01T12:00:00.000Z",
  "updatedAt": "2026-09-20T12:00:00.000Z",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "inventoryItems": [
    {
      "id": "d4e5f6a7-b8c9-0123-def0-234567890123",
      "inventoryId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "productId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "unitInput": "UN",
      "stockExpected": "10.00",
      "stockCounted": "12.00",
      "difference": "2.00",
      "createdAt": "2026-09-20T12:00:00.000Z"
    }
  ]
}
```

#### Erros

| Status | Quando                    | Corpo                                      |
|--------|---------------------------|--------------------------------------------|
| 400    | `id` ausente              | `{ "error": "Erro validação", "details": [...] }` |
| 401    | Não autenticado           | `{ "message": "..." }`                     |
| 404    | Produto não encontrado    | `{ "error": "Recurso não encontrado." }`   |
| 429    | Limite de leitura         | mensagem do `readLimiter`                  |

---

### POST /api/v1/inventory — Criar inventário (JSON)

| Item        | Valor                                      |
|-------------|--------------------------------------------|
| **Método**  | `POST`                                     |
| **Rota**    | `/api/v1/inventory`                        |
| **Auth**    | Bearer                                     |
| **Limiter** | `writeLimiter` e `apiLimiter`              |

#### Body

```json
{
  "inventoryName": "Inventário Setembro",
  "inventoryItens": [
    {
      "productId": "123",
      "unitInput": "UN",
      "stockExpected": 10,
      "stockCounted": 12
    }
  ]
}
```

| Campo            | Obrigatório | Descrição                                              |
|------------------|-------------|--------------------------------------------------------|
| `inventoryName`  | Sim         | Nome do inventário. Único por usuário                  |
| `inventoryItens` | Sim         | Ao menos um item                                       |
| `productId`      | Sim         | **Código** do produto do usuário                       |
| `unitInput`      | Não         | Unidade da contagem. Se omitido, grava `null`          |
| `stockExpected`  | Sim         | Número                                                 |
| `stockCounted`   | Sim         | Número                                                 |

#### Resposta de sucesso — 200 OK

```json
{
  "newInventory": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "name": "Inventário Setembro",
    "createdAt": "2026-09-26T18:00:00.000Z",
    "inventoryItems": [
      {
        "stockExpected": "10.00",
        "stockCounted": "12.00",
        "difference": "2.00",
        "product": {
          "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          "code": "123",
          "description": "Produto exemplo"
        }
      }
    ]
  }
}
```

#### Erros

| Status | Quando                                      | Corpo                                                    |
|--------|---------------------------------------------|----------------------------------------------------------|
| 400    | Body inválido                               | `{ "error": "Erro validação", "details": [...] }`        |
| 400    | Nome já cadastrado para o usuário           | `{ "error": "Nome de inventário já cadastrado." }`       |
| 401    | Não autenticado                             | `{ "message": "..." }`                                   |
| 404    | Algum código de produto não existe          | `{ "error": "Um ou mais produtos não foram encontrados." }` |
| 429    | Limite de escrita ou de criação de inventário | mensagem do limiter correspondente                    |

---

### DELETE /api/v1/inventory — Deletar inventário

Remove o inventário e, em cascata, os itens.

| Item        | Valor               |
|-------------|---------------------|
| **Método**  | `DELETE`            |
| **Rota**    | `/api/v1/inventory` |
| **Auth**    | Bearer              |
| **Limiter** | `writeLimiter`      |

#### Query

| Parâmetro | Obrigatório | Descrição          |
|-----------|-------------|--------------------|
| `id`      | Sim         | UUID do inventário |

Exemplo: `DELETE /api/v1/inventory?id=<inventoryId>`

#### Resposta de sucesso — 200 OK

```json
{
  "message": "Inventário Inventário Setembro deletado com sucesso"
}
```

A mensagem inclui o nome gravado do inventário.

#### Erros

| Status | Quando                         | Corpo                                      |
|--------|--------------------------------|--------------------------------------------|
| 400    | `id` ausente                   | `{ "error": "Erro validação", "details": [...] }` |
| 401    | Não autenticado                | `{ "message": "..." }`                     |
| 404    | Inventário inexistente ou de outro usuário | `{ "error": "Recurso não encontrado." }` |
| 429    | Limite de escrita              | mensagem do `writeLimiter`                 |

---

## Dashboard

### GET /api/v1/dashboard — Resumo agregado do sistema

Resumo para a home. A janela é fixa em **30 dias**. Query params enviados são ignorados.

| Item        | Valor                 |
|-------------|-----------------------|
| **Método**  | `GET`                 |
| **Rota**    | `/api/v1/dashboard`   |
| **Auth**    | Bearer                |
| **Limiter** | Nenhum                |

#### Períodos

| Bloco            | Intervalo                                      |
|------------------|------------------------------------------------|
| Período atual    | De 30 dias atrás até agora                     |
| Período anterior | De 60 dias atrás até 30 dias atrás             |

`currentPeriod` e `previousPeriod` somam inventários criados naquele intervalo. `totalDifference` é a soma dos valores absolutos de `difference` dos itens. `latestInventories` traz no máximo 5 inventários do período atual, do mais recente para o mais antigo.

#### Resposta de sucesso — 200 OK

```json
{
  "period": {
    "days": 30,
    "current": {
      "from": "2026-08-27T18:00:00.000Z",
      "to": "2026-09-26T18:00:00.000Z"
    },
    "previous": {
      "from": "2026-07-28T18:00:00.000Z",
      "to": "2026-08-27T18:00:00.000Z"
    }
  },
  "totals": {
    "products": 1250,
    "inventories": 45,
    "inventoriesLastDays": 18,
    "productsNeverInventoried": 42,
    "productsInventoriedLastDays": 80
  },
  "recentlyInventoriedProducts": [
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "code": "123",
      "description": "Produto exemplo",
      "unit": "UN",
      "lastInventory": "2026-09-20T12:00:00.000Z"
    }
  ],
  "currentPeriod": {
    "totalInventories": 18,
    "totalItems": 240,
    "totalDifference": 35.5
  },
  "previousPeriod": {
    "totalInventories": 12,
    "totalItems": 180,
    "totalDifference": 22
  },
  "latestInventories": [
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "name": "Inventário Setembro",
      "createdAt": "2026-09-26T18:00:00.000Z",
      "itemsCount": 120,
      "difference": 15.5
    }
  ]
}
```

#### Campos

| Campo | Descrição |
|-------|-----------|
| `totals.products` | Total de produtos do usuário |
| `totals.inventories` | Total de inventários do usuário |
| `totals.inventoriesLastDays` | Inventários criados nos últimos 30 dias |
| `totals.productsNeverInventoried` | Produtos com `lastInventory` nulo |
| `totals.productsInventoriedLastDays` | Produtos com `lastInventory` nos últimos 30 dias |
| `recentlyInventoriedProducts` | Produtos inventariados nos últimos 30 dias, do mais recente para o mais antigo |
| `latestInventories[].difference` | Soma absoluta das diferenças dos itens daquele inventário |

#### Erros

| Status | Quando          | Corpo                    |
|--------|-----------------|--------------------------|
| 401    | Não autenticado | `{ "message": "..." }`   |

---

## Swagger UI

Disponível apenas quando `NODE_ENV` **não** é `production`:

```
GET /api-docs
```

- URL local: `http://localhost:3000/api-docs`
- Público
- OpenAPI gerada por anotações `@swagger` nas rotas

Para chamar rotas protegidas: faça login, copie `token` e use **Authorize** com `Bearer <token>`.

---

## Erros Globais

Validação Zod:

```json
{
  "error": "Erro validação",
  "details": [
    { "message": "O email é obrigatório" }
  ]
}
```

Body JSON ausente em rota que exige objeto:

```json
{
  "error": "Erro validação",
  "details": [
    {
      "message": "Corpo da requisição é obrigatório. Envie um JSON com o campo(s) obrigatório(s). Verifique na documentação para mais informações."
    }
  ]
}
```

O handler global e `respondWithMappedError` convertem erros de domínio para mensagens fixas. O cliente não recebe stack nem SQL.

| Situação                                      | Status | `error`                                              |
|-----------------------------------------------|--------|------------------------------------------------------|
| Código de produto não numérico                | 400    | `Código do produto inválido.`                        |
| Códigos repetidos no lote                     | 400    | `Há códigos repetidos no envio.`                     |
| Nome de inventário duplicado                  | 400    | `Nome de inventário já cadastrado.`                  |
| Credenciais inválidas                         | 401    | `Credenciais inválidas.`                             |
| Refresh inválido ou reutilizado               | 401    | `Refresh token inválido.`                            |
| Refresh expirado                              | 401    | `Refresh token expirado.`                            |
| Usuário removido na renovação                 | 401    | `Usuário não encontrado ou removido.`                |
| Sem permissão                                 | 403    | `Sem permissão para esta operação.`                  |
| Produto não encontrado (mensagem exata do serviço) | 404 | `Produto não encontrado.`                         |
| Usuário do `/auth/me` inexistente             | 404    | `Usuário não encontrado.`                            |
| Inventário ou outro recurso não encontrado    | 404    | `Recurso não encontrado.`                            |
| Produtos ausentes na criação do inventário    | 404    | `Um ou mais produtos não foram encontrados.`         |
| E-mail já cadastrado                          | 409    | `Usuário já cadastrado.`                             |
| Produto já cadastrado                         | 409    | `Produto já cadastrado.`                             |
| Qualquer outro erro não mapeado               | 500    | `Erro interno do servidor`                           |

Autenticação do Bearer usa a chave `message`, não `error`.

---

## Regras de domínio

- Dados de produtos e inventários são filtrados por `userId` do token.
- Código de produto é numérico e gravado sem zeros à esquerda.
- Unidade na criação de produto: `UN`, `KG`, `LT`, `SC`, `PT`.
- `isAbcSales` começa em `false` e só muda em `PUT /api/v1/products/updateABCSales`.
- Importação em lote ignora códigos já existentes e rejeita duplicatas no mesmo payload.
- Na criação do inventário, `productId` é o código do produto.
- `difference = stockCounted - stockExpected`.
- Criar inventário atualiza `lastInventory` dos produtos contados.
- Excluir inventário remove os itens. Não recalcula `lastInventory` dos produtos.
- Refresh token é opaco, rotacionado a cada renovação e revogado no logout.
- Reutilizar um refresh já revogado encerra todas as sessões daquele usuário.
