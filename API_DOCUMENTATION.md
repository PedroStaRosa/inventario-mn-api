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
    - [POST /api/v1/auth/refresh — Renovar token](#post-apiv1authrefresh--renovar-token)
    - [GET /api/v1/auth/me — Usuário atual](#get-apiv1authme--usuário-atual)
  - [Produtos](#produtos)
    - [GET /api/v1/products — Listar produtos](#get-apiv1products--listar-produtos)
    - [POST /api/v1/products — Criar produto](#post-apiv1products--criar-produto)
    - [POST /api/v1/products/import — Importar via CSV](#post-apiv1productsimport--importar-via-csv)
    - [POST /api/v1/products/import/many — Importar em lote (JSON)](#post-apiv1productsimportmany--importar-em-lote-json)
  - [Inventários](#inventários)
    - [GET /api/v1/inventories — Listar todos os inventários](#get-apiv1inventories--listar-todos-os-inventários)
    - [GET /api/v1/inventory — Buscar inventário por ID](#get-apiv1inventory--buscar-inventário-por-id)
    - [GET /api/v1/inventory/suggested — Produtos sugeridos para inventário](#get-apiv1inventorysuggested--produtos-sugeridos-para-inventário)
    - [GET /api/v1/inventory/product — Buscar inventários de um produto](#get-apiv1inventoryproduct--buscar-inventários-de-um-produto)
    - [POST /api/v1/inventory — Criar inventário (JSON)](#post-apiv1inventory--criar-inventário-json)
    - [POST /api/v1/inventory/import — Criar inventário via CSV](#post-apiv1inventoryimport--criar-inventário-via-csv)
    - [DELETE /api/v1/inventory — Deletar inventário](#delete-apiv1inventory--deletar-inventário)
  - [Dashboard](#dashboard)
    - [GET /api/v1/dashboard — Resumo agregado do sistema](#get-apiv1dashboard--resumo-agregado-do-sistema)
- [Swagger UI](#swagger-ui)
- [Erros Globais](#erros-globais)
- [Importação via CSV](#importação-via-csv)

---

## Visão Geral

**Inventário MN** é uma API REST para gerenciamento de inventário de produtos. Permite cadastrar produtos, realizar e registrar inventários (contagens físicas de estoque), controlar divergências entre estoque esperado e contado, e importar dados em massa via arquivos CSV.

A API segue uma arquitetura modular por domínio (módulos `user`, `products`, `inventory`), com autenticação JWT e multi-tenancy — todos os dados são isolados por usuário.

| Campo        | Valor                                      |
|--------------|--------------------------------------------|
| **Versão**   | 1.0.0                                      |
| **Base URL** | `http://localhost:3000` (padrão)           |
| **Prefixo**  | `/api/v1`                                  |
| **Protocolo**| HTTP/HTTPS                                 |

---

## Tecnologias

| Tecnologia            | Versão  | Função                           |
|-----------------------|---------|----------------------------------|
| Node.js               | —       | Runtime                          |
| TypeScript            | 5.9     | Linguagem                        |
| Express               | 5.2     | Framework HTTP                   |
| Prisma ORM            | 7.2     | Acesso ao banco de dados         |
| PostgreSQL            | —       | Banco de dados relacional        |
| Zod                   | 4.3     | Validação de schemas             |
| jsonwebtoken          | —       | Geração e verificação de JWT     |
| bcryptjs              | —       | Hashing de senhas (salt 10)      |
| multer                | —       | Upload de arquivos (CSV)         |
| csv-parser            | —       | Parsing de arquivos CSV          |
| express-rate-limit    | —       | Rate limiting por IP             |
| helmet                | —       | Cabeçalhos de segurança HTTP     |
| cors                  | —       | Controle de origens permitidas   |
| swagger-jsdoc         | —       | Geração de spec OpenAPI          |
| swagger-ui-express    | —       | Interface Swagger UI             |
| dotenv                | —       | Carregamento de variáveis de env |

---

## Variáveis de Ambiente

| Variável           | Obrigatória | Descrição                                               |
|--------------------|-------------|--------------------------------------------------------|
| `DATABASE_URL`     | Sim         | URL de conexão PostgreSQL (formato URL)                |
| `JWT_SECRET_KEY`   | Sim         | Chave secreta JWT (mínimo 32 caracteres)               |
| `JWT_EXPIRES_IN`   | Sim         | Tempo de expiração do token em **segundos** (número inteiro) |
| `EXPRESS_PORT`     | Não         | Porta do servidor. Padrão: `3000`                      |
| `ALLOWED_ORIGINS`  | Sim         | Origens permitidas pelo CORS, separadas por vírgula    |

**Exemplo:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/inventario_mn
JWT_SECRET_KEY=minha_chave_super_secreta_com_32_chars
JWT_EXPIRES_IN=86400
EXPRESS_PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,https://meuapp.com
```

---

## Autenticação

A API utiliza **JWT (JSON Web Token)** com algoritmo **HS256**.

O token é gerado no login e deve ser enviado em todos os endpoints protegidos via cabeçalho `Authorization`:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Payload do token:**
```json
{
  "sub": "uuid-do-usuario",
  "name": "Nome do Usuário",
  "email": "usuario@email.com",
  "iat": 1700000000,
  "exp": 1700086400
}
```

> O campo `sub` contém o UUID do usuário, usado internamente para isolamento de dados (multi-tenancy).

**Endpoints públicos (sem autenticação):**
- `POST /api/v1/user`
- `POST /api/v1/auth`
- `GET /api-docs`

**Todos os demais endpoints exigem autenticação.**

---

## Middlewares

| Middleware                   | Aplicação                              | Descrição                                                                                                    |
|------------------------------|----------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `isAuthenticated`            | Todos os endpoints protegidos          | Verifica o token JWT no header `Authorization`. Extrai o `sub` e injeta `req.user_id`. Retorna `401` se ausente ou inválido. |
| `validateSchema`             | Endpoints com validação de body/query  | Valida `body`, `query` e `params` com Zod. Retorna `400` com detalhes de erro se a validação falhar.         |
| `validateCsvMiddleware`      | Endpoints de importação CSV            | Verifica presença do arquivo, valida mimetype CSV, parseia o arquivo e popula `req.body.csvData`.            |
| `validateCreateManyProducts` | `POST /api/v1/products/import/many`    | Verifica se o campo `products` existe no body.                                                               |
| `authLimiter`                | `POST /api/v1/auth`, `POST /api/v1/auth/refresh` | Rate limit: máximo 5 requisições por IP a cada 5 minutos.                                  |
| `apiLimiter`                 | `POST /api/v1/inventory`, `POST /api/v1/inventory/import` | Rate limit: máximo 100 requisições por IP a cada 5 minutos.                    |
| `helmet`                     | Global                                 | Adiciona cabeçalhos HTTP de segurança.                                                                       |
| `cors`                       | Global                                 | Permite apenas origens definidas em `ALLOWED_ORIGINS`. Métodos: GET, POST, PUT, DELETE.                      |

---

## Rate Limiting

| Limitador     | Janela    | Limite | Aplicado em                                                     |
|---------------|-----------|--------|------------------------------------------------------------------|
| `authLimiter` | 5 minutos | 5 req  | `POST /api/v1/auth`, `POST /api/v1/auth/refresh`                |
| `apiLimiter`  | 5 minutos | 100 req| `POST /api/v1/inventory`, `POST /api/v1/inventory/import`       |

Ao exceder o limite, a API retorna HTTP `429` com a mensagem:
- `authLimiter`: `"Muitas tentativas de login. Tente novamente em 15 minutos."`
- `apiLimiter`: `"Muitas requisições. Tente novamente em 15 minutos."`

---

## Modelos de Dados

### User

| Campo       | Tipo       | Descrição                              |
|-------------|------------|----------------------------------------|
| `id`        | `String`   | UUID gerado automaticamente            |
| `name`      | `String`   | Nome do usuário                        |
| `email`     | `String`   | E-mail único                           |
| `password`  | `String`   | Senha hash (bcrypt, salt 10)           |
| `createdAt` | `DateTime` | Data de criação                        |
| `updatedAt` | `DateTime` | Data de atualização                    |
| `removedAt` | `DateTime?`| Data de remoção lógica (soft delete)   |

### Product

| Campo           | Tipo       | Descrição                                        |
|-----------------|------------|--------------------------------------------------|
| `id`            | `String`   | UUID gerado automaticamente                      |
| `code`          | `String`   | Código do produto (sanitizado: zeros à esquerda removidos) |
| `description`   | `String`   | Descrição do produto                             |
| `unit`          | `String?`  | Unidade de medida (opcional)                     |
| `lastInventory` | `DateTime?`| Data do último inventário realizado              |
| `createdAt`     | `DateTime` | Data de criação                                  |
| `updatedAt`     | `DateTime` | Data de atualização                              |
| `userId`        | `String`   | FK do usuário dono do produto                    |

### Inventory

| Campo       | Tipo       | Descrição                        |
|-------------|------------|----------------------------------|
| `id`        | `String`   | UUID gerado automaticamente      |
| `name`      | `String`   | Nome do inventário               |
| `createdAt` | `DateTime` | Data de criação                  |
| `userId`    | `String`   | FK do usuário dono do inventário |

### InventoryItem

| Campo            | Tipo      | Descrição                                                |
|------------------|-----------|----------------------------------------------------------|
| `id`             | `String`  | UUID gerado automaticamente                              |
| `inventoryId`    | `String`  | FK do inventário                                         |
| `productId`      | `String`  | FK do produto (UUID interno)                             |
| `unitInput`      | `String?` | Unidade inserida. Padrão: `"UN"`                         |
| `stockExpected`  | `Decimal` | Estoque esperado (10,2)                                  |
| `stockCounted`   | `Decimal` | Estoque contado (10,2)                                   |
| `difference`     | `Decimal` | Diferença calculada: `stockCounted - stockExpected` (10,2) |
| `createdAt`      | `DateTime`| Data de criação                                          |

> **Constraint:** `(inventoryId, productId)` é único — um produto não pode aparecer duas vezes no mesmo inventário.  
> **Cascade:** Ao deletar um `Inventory`, todos os seus `InventoryItem` são deletados automaticamente.

---

## Fluxo da API

```
Cadastro
  ↓
POST /api/v1/user → Cria conta
  ↓
Login
  ↓
POST /api/v1/auth → Recebe JWT
  ↓
Inclui token em todos os requests
  ↓
Authorization: Bearer <token>
  ↓
Gerenciar Produtos
  ↓
POST /api/v1/products (individual) ou
POST /api/v1/products/import (CSV) ou
POST /api/v1/products/import/many (lote JSON)
  ↓
Realizar Inventário
  ↓
GET /api/v1/inventory/suggested → Obtém sugestões de produtos para contar
  ↓
POST /api/v1/inventory → Registra contagem (JSON) ou
POST /api/v1/inventory/import → Registra contagem (CSV)
  ↓
Consultar Resultados
  ↓
GET /api/v1/dashboard → Resumo (totais + recentes) para a home
GET /api/v1/inventories → Lista todos
GET /api/v1/inventory?id= → Detalhe de um inventário
GET /api/v1/inventory/product?id= → Histórico de inventários de um produto
  ↓
Manutenção
  ↓
DELETE /api/v1/inventory → Deleta inventário (cascade nos itens)
  ↓
Token expirado?
  ↓
POST /api/v1/auth/refresh → Renova JWT (requer token ainda válido)
```

---

## Endpoints

---

## Usuários

---

### POST /api/v1/user — Criar usuário

Cria um novo usuário na plataforma. Endpoint público (sem autenticação).

**Método:** `POST`  
**URL:** `/api/v1/user`  
**Autenticação:** Não  
**Rate Limit:** Não

#### Headers

| Campo          | Obrigatório | Descrição                  |
|----------------|-------------|----------------------------|
| `Content-Type` | Sim         | `application/json`         |

#### Body

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "Senha123"
}
```

#### Parâmetros do Body

| Campo      | Tipo     | Obrigatório | Regras                                                                 |
|------------|----------|-------------|------------------------------------------------------------------------|
| `name`     | `string` | Sim         | Mínimo 3 caracteres                                                    |
| `email`    | `string` | Sim         | Formato de e-mail válido                                               |
| `password` | `string` | Sim         | Mínimo 8 caracteres, ao menos 1 maiúscula, 1 minúscula e 1 número     |

#### Resposta de Sucesso — 200 OK

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "João Silva",
  "email": "joao@email.com",
  "createdAt": "2026-06-26T12:00:00.000Z"
}
```

#### Respostas de Erro

**400 — Validação Zod falhou**
```json
{
  "error": "Erro validação",
  "details": [
    {
      "path": ["body", "password"],
      "message": "A senha deve conter pelo menos uma letra maiúscula"
    }
  ]
}
```

**409 — E-mail já cadastrado**
```json
{
  "error": "User already exists"
}
```

---

### POST /api/v1/auth — Login

Autentica um usuário e retorna um token JWT.

**Método:** `POST`  
**URL:** `/api/v1/auth`  
**Autenticação:** Não  
**Rate Limit:** `authLimiter` (5 req / 5 min por IP)

#### Headers

| Campo          | Obrigatório | Descrição          |
|----------------|-------------|--------------------|
| `Content-Type` | Sim         | `application/json` |

#### Body

```json
{
  "email": "joao@email.com",
  "password": "Senha123"
}
```

#### Parâmetros do Body

| Campo      | Tipo     | Obrigatório | Regras                    |
|------------|----------|-------------|---------------------------|
| `email`    | `string` | Sim         | Formato de e-mail válido  |
| `password` | `string` | Sim         | Mínimo 1 caractere        |

#### Resposta de Sucesso — 200 OK

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "João Silva",
  "email": "joao@email.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Respostas de Erro

**400 — Validação Zod falhou**
```json
{
  "error": "Erro validação",
  "details": [
    {
      "path": ["body", "email"],
      "message": "Precisa ser um email valido"
    }
  ]
}
```

**401 — Credenciais inválidas** *(e-mail não encontrado ou senha incorreta)*
```json
{
  "error": "Credenciais Invalidas."
}
```

**429 — Rate limit excedido**
```
Muitas tentativas de login. Tente novamente em 15 minutos.
```

---

### POST /api/v1/auth/refresh — Renovar token

Gera um novo token JWT para o usuário autenticado. O token atual deve ainda ser válido.

**Método:** `POST`  
**URL:** `/api/v1/auth/refresh`  
**Autenticação:** Sim (Bearer Token)  
**Rate Limit:** `authLimiter` (5 req / 5 min por IP)

#### Headers

| Campo           | Obrigatório | Descrição                    |
|-----------------|-------------|------------------------------|
| `Authorization` | Sim         | `Bearer <token>`             |
| `Content-Type`  | Não         | `application/json` (body vazio) |

#### Body

Não requerido.

#### Resposta de Sucesso — 200 OK

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

#### Respostas de Erro

**401 — Token ausente ou inválido**
```json
{
  "message": "Authorization token is required"
}
```
```json
{
  "message": "token invalid"
}
```

**404 — Usuário não encontrado ou removido**
```json
{
  "error": "Usuário não encontrado ou removido."
}
```

**429 — Rate limit excedido**
```
Muitas tentativas de login. Tente novamente em 15 minutos.
```

---

### GET /api/v1/auth/me — Usuário atual

Retorna os dados do usuário autenticado com base no token JWT.

**Método:** `GET`  
**URL:** `/api/v1/auth/me`  
**Autenticação:** Sim (Bearer Token)  
**Rate Limit:** Não

#### Headers

| Campo           | Obrigatório | Descrição        |
|-----------------|-------------|------------------|
| `Authorization` | Sim         | `Bearer <token>` |

#### Resposta de Sucesso — 200 OK

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "João Silva",
  "email": "joao@email.com",
  "createdAt": "2026-01-21T14:06:26.000Z",
  "updatedAt": "2026-01-21T14:06:26.000Z"
}
```

#### Respostas de Erro

**401 — Token ausente ou inválido**
```json
{
  "message": "Authorization token is required"
}
```
```json
{
  "message": "token invalid"
}
```

**404 — Usuário não encontrado**
```json
{
  "error": "User not found"
}
```

---

## Produtos

> Todos os endpoints de produtos são isolados por usuário. Apenas produtos criados pelo usuário autenticado são retornados ou manipulados.

---

### GET /api/v1/products — Listar produtos

Retorna todos os produtos cadastrados pelo usuário autenticado.

**Método:** `GET`  
**URL:** `/api/v1/products`  
**Autenticação:** Sim (Bearer Token)  
**Rate Limit:** Não

#### Headers

| Campo           | Obrigatório | Descrição        |
|-----------------|-------------|------------------|
| `Authorization` | Sim         | `Bearer <token>` |

#### Resposta de Sucesso — 200 OK

```json
{
  "products": [
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "code": "1001",
      "description": "Caneta Azul BIC",
      "unit": null,
      "lastInventory": "2026-06-20T10:00:00.000Z",
      "createdAt": "2026-01-21T14:06:26.000Z",
      "updatedAt": "2026-01-21T14:06:26.000Z",
      "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    }
  ],
  "total_products": 1
}
```

#### Respostas de Erro

**401 — Token ausente ou inválido**
```json
{
  "message": "Authorization token is required"
}
```

**500 — Erro interno**
```json
{
  "error": "Erro ao listar produtos"
}
```

---

### POST /api/v1/products — Criar produto

Cria um único produto para o usuário autenticado. O código do produto é sanitizado (zeros à esquerda são removidos, apenas caracteres numéricos são mantidos).

**Método:** `POST`  
**URL:** `/api/v1/products`  
**Autenticação:** Sim (Bearer Token)  
**Rate Limit:** Não

#### Headers

| Campo           | Obrigatório | Descrição          |
|-----------------|-------------|--------------------|
| `Authorization` | Sim         | `Bearer <token>`   |
| `Content-Type`  | Sim         | `application/json` |

#### Body

```json
{
  "code": "001001",
  "description": "Caneta Azul BIC"
}
```

#### Parâmetros do Body

| Campo         | Tipo     | Obrigatório | Regras                                      |
|---------------|----------|-------------|---------------------------------------------|
| `code`        | `string` | Sim         | Código do produto (zeros à esquerda serão removidos na sanitização) |
| `description` | `string` | Sim         | Descrição do produto                        |

#### Resposta de Sucesso — 201 Created

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "code": "1001",
  "description": "Caneta Azul BIC",
  "unit": null,
  "lastInventory": null,
  "createdAt": "2026-06-26T12:00:00.000Z",
  "updatedAt": "2026-06-26T12:00:00.000Z",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

#### Respostas de Erro

**400 — Validação falhou ou produto duplicado**
```json
{
  "error": "Erro validação",
  "details": [
    {
      "path": ["body", "code"],
      "message": "code: Codigo do produto obrigatório"
    }
  ]
}
```
```json
{
  "error": "Produto já se encontra cadastrado no banco."
}
```

**401 — Token ausente ou inválido**
```json
{
  "message": "Authorization token is required"
}
```

---

### POST /api/v1/products/import — Importar via CSV

Importa produtos em massa a partir de um arquivo CSV. Produtos com códigos já existentes para o usuário são ignorados (skipped).

**Método:** `POST`  
**URL:** `/api/v1/products/import`  
**Autenticação:** Sim (Bearer Token)  
**Rate Limit:** Não  
**Content-Type:** `multipart/form-data`

#### Headers

| Campo           | Obrigatório | Descrição                  |
|-----------------|-------------|----------------------------|
| `Authorization` | Sim         | `Bearer <token>`           |
| `Content-Type`  | Sim         | `multipart/form-data`      |

#### Form Data

| Campo  | Tipo   | Obrigatório | Descrição                      |
|--------|--------|-------------|--------------------------------|
| `file` | `File` | Sim         | Arquivo CSV com os produtos    |

#### Formato do CSV

- **Separador:** `;` (ponto e vírgula)
- **Encoding:** `latin1`
- **Limite de tamanho:** 5 MB
- **Colunas obrigatórias:**

| Coluna               | Descrição         |
|----------------------|-------------------|
| `Código do Produto`  | Código do produto |
| `Descrição do Produto` | Descrição       |

**Exemplo de CSV:**
```csv
Código do Produto;Descrição do Produto
001001;Caneta Azul BIC
001002;Papel A4 75g
```

#### Resposta de Sucesso — 200 OK

```json
{
  "created": [
    { "code": "1001", "description": "Caneta Azul BIC" },
    { "code": "1002", "description": "Papel A4 75g" }
  ],
  "total_created": 2,
  "skipped": [
    { "code": "2001", "description": "Produto Já Existente" }
  ],
  "total_skipped": 1,
  "errors": []
}
```

#### Respostas de Erro

**400 — Arquivo ausente**
```json
{
  "error": "Nenhum arquivo enviado."
}
```

**400 — Arquivo não é CSV**
```json
{
  "error": "Apenas arquivos CSV são permitidos"
}
```

**401 — Token ausente ou inválido**
```json
{
  "message": "Authorization token is required"
}
```

**500 — Falha na importação**
```json
{
  "error": "Falha ao importar arquivo"
}
```

---

### POST /api/v1/products/import/many — Importar em lote (JSON)

Importa múltiplos produtos via JSON. Sanitiza os códigos, verifica duplicatas no próprio payload e ignora produtos já existentes no banco.

**Método:** `POST`  
**URL:** `/api/v1/products/import/many`  
**Autenticação:** Sim (Bearer Token)  
**Rate Limit:** Não

#### Headers

| Campo           | Obrigatório | Descrição          |
|-----------------|-------------|--------------------|
| `Authorization` | Sim         | `Bearer <token>`   |
| `Content-Type`  | Sim         | `application/json` |

#### Body

```json
{
  "products": [
    { "code": "001001", "description": "Caneta Azul BIC" },
    { "code": "001002", "description": "Papel A4 75g" }
  ]
}
```

#### Parâmetros do Body

| Campo               | Tipo     | Obrigatório | Regras                              |
|---------------------|----------|-------------|-------------------------------------|
| `products`          | `array`  | Sim         | Array de objetos, mínimo 1 item     |
| `products[].code`   | `string` | Sim         | Código do produto                   |
| `products[].description` | `string` | Sim   | Descrição do produto                |

#### Resposta de Sucesso — 200 OK

```json
{
  "created": [
    { "code": "1001", "description": "Caneta Azul BIC" }
  ],
  "total_created": 1,
  "skipped": [
    { "code": "1002", "description": "Produto Já Existente" }
  ],
  "total_skipped": 1,
  "errors": []
}
```

#### Respostas de Erro

**400 — Validação falhou**
```json
{
  "error": "Erro validação",
  "details": [
    {
      "path": ["body", "products"],
      "message": "products: Array de produtos obrigatório"
    }
  ]
}
```

**400 — Códigos duplicados no payload**
```json
{
  "error": "Há códigos repetidos no envio: 1001, 1002"
}
```

**401 — Token ausente ou inválido**
```json
{
  "message": "Authorization token is required"
}
```

**500 — Falha na importação**
```json
{
  "error": "Falha ao importar arquivo"
}
```

---

## Inventários

> Todos os endpoints de inventário são isolados por usuário. Apenas inventários e produtos do usuário autenticado são retornados ou manipulados.

---

### GET /api/v1/inventories — Listar todos os inventários

Retorna todos os inventários do usuário autenticado, incluindo os itens de cada inventário com informações do produto.

**Método:** `GET`  
**URL:** `/api/v1/inventories`  
**Autenticação:** Sim (Bearer Token)  
**Rate Limit:** Não

#### Headers

| Campo           | Obrigatório | Descrição        |
|-----------------|-------------|------------------|
| `Authorization` | Sim         | `Bearer <token>` |

#### Resposta de Sucesso — 200 OK

```json
[
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "name": "Inventário Junho 2026",
    "createdAt": "2026-06-26T12:00:00.000Z",
    "inventoryItems": [
      {
        "stockExpected": "100.00",
        "stockCounted": "95.00",
        "difference": "-5.00",
        "product": {
          "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          "code": "1001",
          "description": "Caneta Azul BIC"
        }
      }
    ]
  }
]
```

#### Respostas de Erro

**401 — Token ausente ou inválido**
```json
{
  "message": "Authorization token is required"
}
```

---

### GET /api/v1/inventory — Buscar inventário por ID

Retorna os detalhes de um inventário específico do usuário, incluindo todos os itens.

**Método:** `GET`  
**URL:** `/api/v1/inventory`  
**Autenticação:** Sim (Bearer Token)  
**Rate Limit:** Não

#### Headers

| Campo           | Obrigatório | Descrição        |
|-----------------|-------------|------------------|
| `Authorization` | Sim         | `Bearer <token>` |

#### Query Params

| Campo | Tipo     | Obrigatório | Descrição            |
|-------|----------|-------------|----------------------|
| `id`  | `string` | Sim         | UUID do inventário   |

**Exemplo:** `GET /api/v1/inventory?id=c3d4e5f6-a7b8-9012-cdef-123456789012`

#### Resposta de Sucesso — 200 OK

```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "name": "Inventário Junho 2026",
  "createdAt": "2026-06-26T12:00:00.000Z",
  "inventoryItems": [
    {
      "stockExpected": "100.00",
      "stockCounted": "95.00",
      "difference": "-5.00",
      "product": {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "code": "1001",
        "description": "Caneta Azul BIC"
      }
    }
  ]
}
```

#### Respostas de Erro

**400 — ID não informado**
```json
{
  "error": "Erro validação",
  "details": [
    {
      "path": ["query", "id"],
      "message": "id: Id do inventario é obrigatório"
    }
  ]
}
```

**401 — Token ausente ou inválido**
```json
{
  "message": "Authorization token is required"
}
```

**404 — Inventário não encontrado**
```json
{
  "error": "Inventário não encontrado"
}
```

---

### GET /api/v1/inventory/suggested — Produtos sugeridos para inventário

Retorna uma lista aleatória de produtos que não foram inventariados nos últimos N dias (ou que nunca foram inventariados). Útil para sugerir quais produtos contar no próximo inventário.

**Método:** `GET`  
**URL:** `/api/v1/inventory/suggested`  
**Autenticação:** Sim (Bearer Token)  
**Rate Limit:** Não

#### Headers

| Campo           | Obrigatório | Descrição        |
|-----------------|-------------|------------------|
| `Authorization` | Sim         | `Bearer <token>` |

#### Query Params

| Campo   | Tipo     | Obrigatório | Padrão | Descrição                                                       |
|---------|----------|-------------|--------|-----------------------------------------------------------------|
| `days`  | `number` | Sim         | —      | Retorna produtos não inventariados há mais de N dias (ou nunca) |
| `limit` | `number` | Não         | `100`  | Quantidade máxima de produtos retornados                        |

**Exemplo:** `GET /api/v1/inventory/suggested?days=30&limit=50`

#### Resposta de Sucesso — 200 OK

```json
{
  "products": [
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "code": "1001",
      "description": "Caneta Azul BIC",
      "unit": null,
      "lastInventory": "2026-05-01T10:00:00.000Z",
      "createdAt": "2026-01-21T14:06:26.000Z",
      "updatedAt": "2026-06-01T10:00:00.000Z",
      "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    }
  ],
  "total": 1
}
```

> **Nota:** A seleção é aleatória (random skip). Múltiplas chamadas com os mesmos parâmetros podem retornar produtos diferentes.

#### Respostas de Erro

**400 — Campo `days` ausente**
```json
{
  "error": "Dias não enviado."
}
```

**400 — Validação Zod falhou**
```json
{
  "error": "Erro validação",
  "details": [
    {
      "path": ["query", "days"],
      "message": "days: Dias de busca é obrigatório"
    }
  ]
}
```

**401 — Token ausente ou inválido**
```json
{
  "message": "Authorization token is required"
}
```

---

### GET /api/v1/inventory/product — Buscar inventários de um produto

Retorna um produto e todo o histórico de itens de inventário em que ele aparece.

**Método:** `GET`  
**URL:** `/api/v1/inventory/product`  
**Autenticação:** Sim (Bearer Token)  
**Rate Limit:** Não

#### Headers

| Campo           | Obrigatório | Descrição        |
|-----------------|-------------|------------------|
| `Authorization` | Sim         | `Bearer <token>` |

#### Query Params

| Campo | Tipo     | Obrigatório | Descrição         |
|-------|----------|-------------|-------------------|
| `id`  | `string` | Sim         | UUID do produto   |

**Exemplo:** `GET /api/v1/inventory/product?id=b2c3d4e5-f6a7-8901-bcde-f12345678901`

#### Resposta de Sucesso — 200 OK

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "code": "1001",
  "description": "Caneta Azul BIC",
  "unit": null,
  "lastInventory": "2026-06-20T10:00:00.000Z",
  "createdAt": "2026-01-21T14:06:26.000Z",
  "updatedAt": "2026-06-20T10:00:00.000Z",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "inventoryItems": [
    {
      "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
      "inventoryId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "productId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "unitInput": "UN",
      "stockExpected": "100.00",
      "stockCounted": "95.00",
      "difference": "-5.00",
      "createdAt": "2026-06-20T10:00:00.000Z"
    }
  ]
}
```

#### Respostas de Erro

**400 — Campos ausentes**
```json
{
  "message": "Erro nos campos enviados, revise os campos productId e token"
}
```

**400 — Validação Zod falhou**
```json
{
  "error": "Erro validação",
  "details": [
    {
      "path": ["query", "id"],
      "message": "id: Id do produto é obrigatório"
    }
  ]
}
```

**401 — Token ausente ou inválido**
```json
{
  "message": "Authorization token is required"
}
```

**404 — Produto não encontrado**
```json
{
  "error": "Produto não encontrado"
}
```

---

### POST /api/v1/inventory — Criar inventário (JSON)

Cria um novo inventário com uma lista de itens contados. O campo `productId` em cada item deve conter o **código do produto** (não o UUID) — a API resolve internamente o código para o ID real.

Após a criação, o campo `lastInventory` de cada produto inventariado é atualizado para a data/hora atual.

**Método:** `POST`  
**URL:** `/api/v1/inventory`  
**Autenticação:** Sim (Bearer Token)  
**Rate Limit:** `apiLimiter` (100 req / 5 min por IP)

#### Headers

| Campo           | Obrigatório | Descrição          |
|-----------------|-------------|--------------------|
| `Authorization` | Sim         | `Bearer <token>`   |
| `Content-Type`  | Sim         | `application/json` |

#### Body

```json
{
  "inventoryName": "Inventário Junho 2026",
  "inventoryItens": [
    {
      "productId": "1001",
      "unitInput": "UN",
      "stockExpected": 100,
      "stockCounted": 95
    },
    {
      "productId": "1002",
      "stockExpected": 50,
      "stockCounted": 50
    }
  ]
}
```

#### Parâmetros do Body

| Campo                              | Tipo      | Obrigatório | Regras                                             |
|------------------------------------|-----------|-------------|----------------------------------------------------|
| `inventoryName`                    | `string`  | Sim         | Nome do inventário (único por usuário)             |
| `inventoryItens`                   | `array`   | Sim         | Mínimo 1 item                                      |
| `inventoryItens[].productId`       | `string`  | Sim         | **Código do produto** (não UUID). Mínimo 1 char    |
| `inventoryItens[].unitInput`       | `string`  | Não         | Unidade de medida                                  |
| `inventoryItens[].stockExpected`   | `number`  | Sim         | Estoque esperado (decimal)                         |
| `inventoryItens[].stockCounted`    | `number`  | Sim         | Estoque contado (decimal)                          |

> A diferença (`stockCounted - stockExpected`) é calculada automaticamente pela API.

#### Resposta de Sucesso — 200 OK

```json
{
  "newInventory": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "name": "Inventário Junho 2026",
    "createdAt": "2026-06-26T12:00:00.000Z",
    "inventoryItems": [
      {
        "stockExpected": "100.00",
        "stockCounted": "95.00",
        "difference": "-5.00",
        "product": {
          "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          "code": "1001",
          "description": "Caneta Azul BIC"
        }
      }
    ]
  }
}
```

#### Respostas de Erro

**400 — Validação falhou**
```json
{
  "error": "Erro validação",
  "details": [
    {
      "path": ["body", "inventoryName"],
      "message": "inventoryName: Nome do inventario é obrigatório"
    }
  ]
}
```

**400 — Nome de inventário duplicado**
```json
{
  "error": "Nome de inventário já se encontra cadastrado no banco."
}
```

**401 — Token ausente ou inválido**
```json
{
  "message": "Authorization token is required"
}
```

**404 — Produtos não encontrados**
```json
{
  "error": "Produtos não encontrados: 9999, 8888"
}
```

**429 — Rate limit excedido**
```
Muitas requisições. Tente novamente em 15 minutos.
```

**500 — Erro interno**
```json
{
  "error": "Erro interno do servidor"
}
```

---

### POST /api/v1/inventory/import — Criar inventário via CSV

Cria um novo inventário importando os itens a partir de um arquivo CSV. O nome do inventário é enviado como campo de formulário junto ao arquivo.

**Método:** `POST`  
**URL:** `/api/v1/inventory/import`  
**Autenticação:** Sim (Bearer Token)  
**Rate Limit:** `apiLimiter` (100 req / 5 min por IP)  
**Content-Type:** `multipart/form-data`

#### Headers

| Campo           | Obrigatório | Descrição             |
|-----------------|-------------|-----------------------|
| `Authorization` | Sim         | `Bearer <token>`      |
| `Content-Type`  | Sim         | `multipart/form-data` |

#### Form Data

| Campo           | Tipo     | Obrigatório | Descrição                      |
|-----------------|----------|-------------|--------------------------------|
| `file`          | `File`   | Sim         | Arquivo CSV com os itens       |
| `inventoryName` | `string` | Sim         | Nome do inventário             |

#### Formato do CSV

- **Separador:** `;` (ponto e vírgula)
- **Encoding:** `latin1`
- **Limite de tamanho:** 5 MB
- **Colunas obrigatórias:**

| Coluna              | Descrição                         |
|---------------------|-----------------------------------|
| `Código do Produto` | Código do produto (campo `productId`) |
| `Unidade`           | Unidade de medida (`unitInput`)   |
| `Digitado`          | Estoque contado (`stockCounted`)  |
| `Estoque`           | Estoque esperado (`stockExpected`) |

**Exemplo de CSV:**
```csv
Código do Produto;Unidade;Digitado;Estoque
1001;UN;95;100
1002;UN;50;50
```

#### Resposta de Sucesso — 200 OK

```json
{
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "name": "Inventário Junho 2026",
    "createdAt": "2026-06-26T12:00:00.000Z",
    "inventoryItems": [
      {
        "stockExpected": "100.00",
        "stockCounted": "95.00",
        "difference": "-5.00",
        "product": {
          "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          "code": "1001",
          "description": "Caneta Azul BIC"
        }
      }
    ]
  },
  "total_itens": 2
}
```

#### Respostas de Erro

**400 — Arquivo ausente**
```json
{
  "error": "Nenhum arquivo enviado."
}
```

**400 — Arquivo não é CSV**
```json
{
  "error": "Apenas arquivos CSV são permitidos"
}
```

**400 — Nome do inventário ausente**
```json
{
  "error": "Erro validação",
  "details": [
    {
      "path": ["body", "inventoryName"],
      "message": "inventoryName: Nome do inventario é obrigatório"
    }
  ]
}
```

**400 — Nome de inventário duplicado**
```json
{
  "error": "Nome de inventário já se encontra cadastrado no banco."
}
```

**401 — Token ausente ou inválido**
```json
{
  "message": "Authorization token is required"
}
```

**404 — Produtos não encontrados**
```json
{
  "error": "Produtos não encontrados: 9999, 8888"
}
```

**429 — Rate limit excedido**
```
Muitas requisições. Tente novamente em 15 minutos.
```

---

### DELETE /api/v1/inventory — Deletar inventário

Remove permanentemente um inventário e todos os seus itens (cascade delete).

**Método:** `DELETE`  
**URL:** `/api/v1/inventory`  
**Autenticação:** Sim (Bearer Token)  
**Rate Limit:** Não

#### Headers

| Campo           | Obrigatório | Descrição        |
|-----------------|-------------|------------------|
| `Authorization` | Sim         | `Bearer <token>` |

#### Query Params

| Campo | Tipo     | Obrigatório | Descrição          |
|-------|----------|-------------|--------------------|
| `id`  | `string` | Sim         | UUID do inventário |

**Exemplo:** `DELETE /api/v1/inventory?id=c3d4e5f6-a7b8-9012-cdef-123456789012`

#### Resposta de Sucesso — 200 OK

```json
{
  "message": "Inventário Inventário Junho 2026 deletado com sucesso"
}
```

#### Respostas de Erro

**400 — ID não informado**
```json
{
  "message": "Id do inventário não enviado."
}
```

**400 — Validação Zod falhou**
```json
{
  "error": "Erro validação",
  "details": [
    {
      "path": ["query", "id"],
      "message": "id: Id do inventario é obrigatório"
    }
  ]
}
```

**401 — Token ausente ou inválido**
```json
{
  "message": "Authorization token is required"
}
```

**404 — Inventário não encontrado**
```json
{
  "error": "Inventario não encontrado"
}
```

---

## Dashboard

### GET /api/v1/dashboard — Resumo agregado do sistema

Retorna totais, métricas do período e listas recentes em uma única resposta. O frontend **não** precisa buscar todos os produtos/inventários para montar a home.

| Item        | Valor                                      |
|-------------|--------------------------------------------|
| **Método**  | `GET`                                      |
| **Rota**    | `/api/v1/dashboard`                        |
| **Auth**    | Bearer JWT obrigatório                     |
| **Content-Type** | — (sem body)                          |

#### Query parameters

| Parâmetro                 | Tipo     | Obrigatório | Default | Descrição                                      |
|---------------------------|----------|-------------|---------|------------------------------------------------|
| `days`                    | `number` | Não         | `30`    | Janela em dias para métricas do período        |
| `recentInventoriesLimit`  | `number` | Não         | `5`     | Quantidade de inventários recentes (máx. 50)   |
| `recentProductsLimit`     | `number` | Não         | `5`     | Quantidade de produtos recentes (máx. 50)      |

**Exemplo:** `GET /api/v1/dashboard?days=30&recentInventoriesLimit=5&recentProductsLimit=5`

#### Resposta `200 OK`

```json
{
  "period": {
    "days": 30,
    "from": "2026-06-23T15:00:00.000Z",
    "to": "2026-07-23T15:00:00.000Z"
  },
  "totals": {
    "products": 1250,
    "inventories": 45,
    "inventoriesLastDays": 18,
    "productsNeverInventoried": 42,
    "productsInventoriedLastDays": 80
  },
  "recentInventories": [
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "name": "Inventário Junho 2026",
      "createdAt": "2026-06-26T12:00:00.000Z",
      "itemsCount": 120
    }
  ],
  "recentlyInventoriedProducts": [
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "code": "ABC-001",
      "description": "Produto exemplo",
      "unit": "UN",
      "lastInventory": "2026-06-26T12:00:00.000Z"
    }
  ]
}
```

#### Campos da resposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `period.days` | `number` | Janela usada no cálculo |
| `period.from` / `period.to` | `string` (ISO) | Intervalo efetivo |
| `totals.products` | `number` | Total de produtos do usuário |
| `totals.inventories` | `number` | Total de inventários do usuário |
| `totals.inventoriesLastDays` | `number` | Inventários criados nos últimos `days` dias |
| `totals.productsNeverInventoried` | `number` | Produtos com `lastInventory = null` |
| `totals.productsInventoriedLastDays` | `number` | Produtos com `lastInventory` nos últimos `days` dias |
| `recentInventories[]` | `array` | Últimos inventários (`itemsCount` via `_count`, sem carregar itens) |
| `recentlyInventoriedProducts[]` | `array` | Produtos ordenados por `lastInventory` desc |

#### Erros

**401 — Não autenticado**
```json
{
  "message": "Authorization token is required"
}
```

**400 — Validação**
```json
{
  "error": "Erro validação",
  "details": [
    { "message": "..." }
  ]
}
```

---

## Swagger UI

A documentação interativa da API está disponível em:

```
GET /api-docs
```

- **URL:** `http://localhost:3000/api-docs`
- **Autenticação:** Público (sem token)
- **Especificação:** OpenAPI 3.0.0
- **Gerada por:** `swagger-jsdoc` com anotações `@swagger` nos arquivos de rotas

Para testar endpoints autenticados via Swagger UI:
1. Execute `POST /api/v1/auth` e copie o `token` retornado
2. Clique em **Authorize** (cadeado) no topo da página
3. Insira: `Bearer <seu_token>`
4. Clique em **Authorize** e feche o modal

---

## Erros Globais

O handler de erros global (`app.ts`) intercepta erros lançados nos controllers e retorna respostas padronizadas:

| Condição                              | Status | Resposta                                              |
|---------------------------------------|--------|-------------------------------------------------------|
| Nome de inventário duplicado          | 400    | `{ "error": "Nome de inventário já se encontra cadastrado no banco." }` |
| Arquivo não é CSV                     | 400    | `{ "error": "Apenas arquivos CSV são permitidos" }`   |
| Credenciais inválidas                 | 401    | `{ "error": "Credenciais Invalidas." }`               |
| Sem permissão (`sem permissão`)       | 403    | `{ "error": "<mensagem>" }`                           |
| Recurso não encontrado (`não encontrado`) | 404 | `{ "error": "<mensagem>" }`                          |
| Recurso já existe                     | 409    | `{ "error": "<mensagem>" }`                           |
| Produtos não encontrados no inventário| 404    | `{ "error": "Produtos não encontrados: <códigos>" }` |
| Qualquer outro erro não tratado       | 500    | `{ "error": "Erro interno do servidor" }`             |

---

## Importação via CSV

### Configurações de Upload

| Parâmetro      | Valor             |
|----------------|-------------------|
| Diretório      | `uploads/`        |
| Tamanho máximo | 5 MB              |
| Extensão       | `.csv`            |
| Separador      | `;`               |
| Encoding       | `latin1`          |

### CSV de Produtos (`POST /api/v1/products/import`)

| Coluna               | Campo no sistema    | Tipo   |
|----------------------|---------------------|--------|
| `Código do Produto`  | `code`              | string |
| `Descrição do Produto` | `description`     | string |

### CSV de Inventário (`POST /api/v1/inventory/import`)

| Coluna              | Campo no sistema | Tipo   |
|---------------------|-----------------|--------|
| `Código do Produto` | `productId`     | string |
| `Unidade`           | `unitInput`     | string |
| `Digitado`          | `stockCounted`  | number |
| `Estoque`           | `stockExpected` | number |

> **Nota sobre encoding:** O parser de CSV detecta automaticamente o encoding do arquivo via `chardet`. O encoding padrão configurado é `latin1`, adequado para arquivos exportados por sistemas legados brasileiros que utilizam caracteres especiais (ç, ã, é etc.).
