# Documento de Contexto do Projeto - Inventário MN

## 📋 Índice
1. [Visão geral do sistema](#visão-geral-do-sistema)
2. [Arquitetura da aplicação](#arquitetura-da-aplicação)
3. [Módulos e responsabilidades](#módulos-e-responsabilidades)
4. [Modelagem de domínio](#modelagem-de-domínio)
5. [Como o frontend consome a API](#como-o-frontend-consome-a-api)
6. [Validação, erros e contratos](#validação-erros-e-contratos)
7. [Segurança e autenticação](#segurança-e-autenticação)
8. [Ambiente, build e execução](#ambiente-build-e-execução)
9. [Swagger e documentação complementar](#swagger-e-documentação-complementar)

> **Importante para o frontend**: detalhes de cada rota, payloads e respostas estão centralizados em `API_ENDPOINTS.md`. Este documento foca em **contexto, fluxos e regras de negócio**.

---

## 🎯 Visão geral do sistema

O **Inventário MN** é uma API REST para gerenciamento de inventário físico, focada em:

- **Cadastro de produtos**.
- **Criação de inventários** (manual ou via arquivo CSV).
- **Consulta de inventários e histórico por produto**.
- **Sugestão de produtos** que precisam ser inventariados.

Stack principal:

- **Node.js + TypeScript**.
- **Express 5** como framework HTTP.
- **PostgreSQL + Prisma** como camada de persistência/ORM.
- **Zod** para validação.
- **JWT** para autenticação.

O frontend irá se comunicar exclusivamente via HTTP(s) com essa API, utilizando JSON e, em alguns fluxos, `multipart/form-data` para upload de CSV.

---

## 🏗️ Arquitetura da aplicação

A aplicação segue uma arquitetura em camadas:

```
Rotas (Express) → Controllers → Services → Repositório (Prisma) → Banco de Dados (PostgreSQL)
```

- **Rotas**: definem os endpoints públicos e aplicam middlewares (auth, validação, rate limit, upload).
- **Controllers**: traduzem HTTP ↔ domínio (extraem dados de `req`, chamam services e montam a resposta).
- **Services**: concentram regras de negócio, validações de domínio e orquestram o acesso ao banco via Prisma.
- **Prisma Client**: abstrai o acesso ao PostgreSQL com tipos fortes.

Características:

- **Alto acoplamento com domínio**: módulos por contexto (`user`, `products`, `inventory`).
- **Baixo acoplamento com transporte**: controllers finos, services testáveis.
- **Reutilização**: services podem ser acionados por diferentes endpoints, se necessário.

Para o frontend, o mais importante é entender que:

- A **regra de negócio mora nos services**, então respostas e validações seguem um padrão consistente por módulo.
- **Todos os endpoints relevantes estão sob `/api/v1`**.

---

## 📁 Módulos e responsabilidades

Estrutura principal da pasta `src`:

```text
src/
├── @types/              # Tipos globais (ex.: extensão de Request com user_id)
├── config/              # Configurações (Swagger, etc.)
├── context/             # Contexto de request (AsyncLocalStorage / requestId)
├── generated/           # Código gerado pelo Prisma
├── middlewares/         # Auth, rate limit, validação, CSV, request context, access log
├── modules/
│   ├── user/            # Autenticação e usuário
│   ├── products/        # Produtos
│   ├── inventory/       # Inventários
│   └── dashboard/       # Resumo agregado (KPIs do sistema)
├── prisma/              # Instância do Prisma Client
├── utils/               # Utilitários (hash, CSV, upload, logger)
├── app.ts               # Configuração do Express
└── server.ts            # Bootstrap do servidor
```

### Módulo `user`

- **Responsável por**: cadastro de usuário, login, refresh de token e endpoint `me`.
- **Impacto no frontend**:
  - Fluxo de login.
  - Armazenamento de token JWT (e possivelmente refresh token).
  - Obtenção dos dados do usuário logado.

### Módulo `products`

- **Responsável por**: CRUD de produtos (no momento, listagem e criação) e importação de produtos via CSV.
- **Impacto no frontend**:
  - Listas de produtos para telas de consulta e criação de inventário.
  - Fluxo de upload de CSV de produtos.

### Módulo `inventory`

- **Responsável por**:
  - Listagem de inventários.
  - Detalhe de inventário.
  - Criação de inventário (manual e via CSV).
  - Busca de histórico de inventários por produto.
  - Sugestão de produtos para inventário.
- **Impacto no frontend**:
  - Telas de inventário (lista, detalhe, histórico).
  - Fluxos de upload de CSV de inventário.
  - Telas de sugestão de inventário (filtro por `days`, limite, etc.).

### Módulo `dashboard`

- **Responsável por**: resumo agregado do sistema (totais, métricas do período e listas recentes).
- **Impacto no frontend**:
  - Tela inicial / home com KPIs sem precisar baixar todos os produtos ou inventários.
  - Endpoint único: `GET /api/v1/dashboard`.

---

## 🗄️ Modelagem de domínio

A modelagem é feita com **Prisma** sobre **PostgreSQL**. Os modelos principais são:

### `User`

Representa o usuário autenticado (dono dos recursos).

- **Campos principais**:
  - `id` (UUID)
  - `name`
  - `email` (único)
  - `password` (hash)
  - `createdAt`, `updatedAt`, `removedAt?`
- **Relações**:
  - `inventories`: inventários criados pelo usuário.
  - `products`: produtos cadastrados pelo usuário.

### `Product`

Produto inventariável.

- **Campos principais**:
  - `id` (UUID)
  - `code` (código de produto)
  - `description`
  - `unit?` (unidade de medida)
  - `lastInventory?` (última data que apareceu em um inventário)
  - `createdAt`, `updatedAt`
  - `userId` (dono do produto)
- **Relações**:
  - `inventoryItems`: itens de inventário onde este produto aparece.

### `Inventory`

Representa um inventário (ex.: "Inventário Janeiro 2026").

- **Campos principais**:
  - `id` (UUID)
  - `name`
  - `createdAt`
  - `userId`
- **Relações**:
  - `inventoryItems`: itens que pertencem a este inventário.

### `InventoryItem`

Ligação entre `Inventory` e `Product`, com dados contábeis.

- **Campos principais**:
  - `id` (UUID)
  - `inventoryId`
  - `productId`
  - `unitInput` (padrão `"UN"`)
  - `stockExpected` (Decimal 10,2)
  - `stockCounted` (Decimal 10,2)
  - `difference` (Decimal 10,2) — calculado automaticamente.
  - `createdAt`
- **Regras importantes**:
  - `@@unique([inventoryId, productId])`: um mesmo produto não aparece duas vezes no mesmo inventário.
  - Ao criar inventário, `difference = stockCounted - stockExpected`.
  - `lastInventory` do produto é atualizado automaticamente.

Para o frontend, isso significa que:

- Em listas e detalhes de inventário, sempre haverá:
  - Dados do inventário.
  - Lista de itens, com `stockExpected`, `stockCounted`, `difference` e dados do produto.

---

## 🔌 Como o frontend consome a API

### Base URL e versão

- **Base URL** (ambiente local padrão):

```text
http://localhost:3000/api/v1
```

Em produção, a base URL pode mudar, mas **o prefixo `/api/v1` é parte do contrato**.

### Convenções gerais

- **Formato de requisição**:
  - JSON em `application/json` para a maioria dos endpoints.
  - `multipart/form-data` para upload de CSV.
- **Formato de resposta**:
  - JSON padronizado por módulo (consultar `API_ENDPOINTS.md` para exemplos).
- **Autenticação**:
  - Via header `Authorization: Bearer <token>`.
  - Endpoints públicos: criação de usuário e login.

### Fluxos típicos no frontend

- **Autenticação**:
  1. `POST /api/v1/auth` com `email` e `password`.
  2. Guardar `token` (e, se usado, `refreshToken`) em local storage/secure storage.
  3. Usar `GET /api/v1/auth/me` para popular o estado global do usuário.

- **Produtos**:
  - Listagem para montar tabelas, selects, etc. (`GET /api/v1/products`).
  - Criação rápida via formulário (`POST /api/v1/products`).
  - Importação em massa via CSV (`POST /api/v1/products/import`).

- **Inventários**:
  - Listagem de todos os inventários (`GET /api/v1/inventories`).
  - Detalhe de um inventário específico (`GET /api/v1/inventory?id=...`).
  - Criação de inventário:
    - Manual (`POST /api/v1/inventory`).
    - Por CSV (`POST /api/v1/inventory/import`).
  - Sugestão de produtos para criar inventário (`GET /api/v1/inventory/suggested?days=...`).
  - Histórico de inventários de um produto (`GET /api/v1/inventory/product?id=...`).

- **Dashboard**:
  - Resumo agregado para a home (`GET /api/v1/dashboard`).

Todos esses fluxos estão descritos em detalhe, com payloads de entrada/saída, em `API_ENDPOINTS.md`.

---

## ✅ Validação, erros e contratos

### Validação com Zod

Toda entrada (body, query, params) é validada com **Zod**, via middleware `validateSchema`.

Pontos importantes para o frontend:

- Se o payload estiver inconsistente, o backend retorna **HTTP 400** com corpo semelhante a:

```json
{
  "error": "Erro validação",
  "details": [
    {
      "message": "mensagem de erro específica"
    }
  ]
}
```

- Os schemas por módulo são:
  - `userSchema`: `createUserSchema`, `authUserSchema`.
  - `productSchema`: `createProductSchema`, `createManyProductsSchema`.
  - `inventorySchema`: `createInventorySchema`, `createInventoryByFileSchema`, `idInventorySchema`, `idProductInventorySchema`, `suggestedInventorySchema`.

### Erros mais comuns por tipo de operação

- **Autenticação**:
  - `401 Unauthorized`: token inválido/ausente ou credenciais incorretas.
  - `429 Too Many Requests`: muitas tentativas de login (rate limit).
- **Criação de recursos**:
  - `400 Bad Request`: payload inválido (campos obrigatórios, formato, tipos).
  - `409 Conflict`: recurso já existe (ex.: email já cadastrado, código de produto duplicado, nome de inventário já usado).
- **Busca/listagem**:
  - `404 Not Found`: recurso não encontrado (ex.: inventário inexistente, produto inexistente).

### Contratos detalhados

Os contratos completos (campos, exemplos e status codes) estão descritos em:

- **`API_ENDPOINTS.md`** — focado em consumo via frontend.
- **Swagger UI** — documentação interativa.

---

## 🛡️ Segurança e autenticação

### Autenticação JWT

- Login (`POST /api/v1/auth`) retorna:
  - `token`: JWT.
  - Opcionalmente, `refreshToken`.
- Endpoints protegidos exigem:

```text
Authorization: Bearer <token>
```

No frontend:

- Centralizar a injeção do header (ex.: interceptor Axios).
- Tratar `401` globalmente para redirecionar para login/renovar token.

### Rate limiting

- **`authLimiter`**:
  - Aplica limite de tentativas de login (5 tentativas / 5 minutos).
  - Retorna `429` em caso de abuso.
- **`apiLimiter`**:
  - Aplica limite a operações pesadas (`POST /api/v1/inventory`, `/api/v1/inventory/import`).

O frontend deve:

- Exibir mensagens amigáveis para `429` (ex.: "Muitas tentativas, tente novamente em alguns minutos").

### Outros mecanismos

- **Helmet**: adiciona headers de segurança HTTP.
- **CORS**: configurado para aceitar domínios específicos; em desenvolvimento, geralmente liberado para o frontend local.
- **Prisma**: protege contra SQL Injection.
- **Uploads**:
  - Apenas CSV.
  - Tamanho máximo ~5MB.
  - Arquivos temporários removidos após o processamento.

---

## ⚙️ Ambiente, build e execução

### Variáveis de ambiente

Arquivo `.env` (exemplo simplificado):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
JWT_SECRET_KEY=your_secret_key_here
EXPRESS_PORT=3000
```

### TypeScript e build

Configuração relevante (resumo):

- `module`: `nodenext`
- `target`: `esnext`
- `strict`: `true`
- `isolatedModules`: `true`

Scripts principais em `package.json`:

```json
{
  "dev": "tsx watch src/server.ts"
}
```

- **`dev`**: sobe o servidor HTTP de desenvolvimento.

---

## 📚 Swagger e documentação complementar

- **Swagger UI**:
  - URL padrão em desenvolvimento:

```text
http://localhost:3000/api-docs
```

  - Usa especificação **OpenAPI 3.0**.
  - Documentação gerada a partir de anotações `@swagger` nas rotas.

- **Autenticação no Swagger**:
  1. Fazer login no endpoint `/api/v1/auth`.
  2. Copiar o `token`.
  3. Clicar em **Authorize** e informar `Bearer {token}`.

- **Documentos de apoio**:
  - `SWAGGER_GUIDE.md`: passo a passo mais detalhado de uso do Swagger.
  - `API_ENDPOINTS.md`: catálogo textual dos endpoints, pensado para consumo pelo frontend.

---

**Última atualização:** Março 2026  
**Versão:** 2.0.0

