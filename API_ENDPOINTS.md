# Catálogo de Endpoints - Inventário MN

> **Objetivo**: este documento é uma visão consolidada dos endpoints da API, pensada para quem está desenvolvendo o **frontend**.  
> Para detalhes de arquitetura e regras de negócio, consulte `CONTEXTO_PROJETO.md`.

## 📋 Índice

1. [Informações gerais](#informações-gerais)
2. [Autenticação e usuário](#autenticação-e-usuário)
3. [Produtos](#produtos)
4. [Inventários](#inventários)
5. [Padrões de erro](#padrões-de-erro)

---

## ℹ️ Informações gerais

- **Base URL (dev)**: `http://localhost:3000/api/v1`
- **Formato padrão**:
  - Requests: `application/json` (exceto uploads de CSV, que usam `multipart/form-data`).
  - Responses: `application/json`.
- **Autenticação**:
  - Header: `Authorization: Bearer <token>`.
  - Necessária em todos os endpoints protegidos (marcados abaixo).

---

## 👤 Autenticação e usuário

### POST `/auth` — Login

- **Descrição**: autentica um usuário e retorna o token JWT (e dados básicos do usuário).
- **Auth**: **não requer** token.
- **Headers**:
  - `Content-Type: application/json`
- **Body**:

```json
{
  "email": "user@example.com",
  "password": "Senha123"
}
```

- **Respostas**:
  - `200 OK`:

    ```json
    {
      "token": "jwt_token",
      "user": {
        "id": "uuid",
        "name": "string",
        "email": "string"
      }
    }
    ```

  - `401 Unauthorized`: credenciais inválidas.
  - `429 Too Many Requests`: muitas tentativas de login (rate limit).

---

### POST `/user` — Criar usuário

- **Descrição**: cria um novo usuário.
- **Auth**: pública (sem token).
- **Headers**:
  - `Content-Type: application/json`
- **Body**:

```json
{
  "name": "Nome do Usuário",
  "email": "user@example.com",
  "password": "Senha123"
}
```

Regras da senha:

- Mínimo 8 caracteres.
- Deve conter pelo menos:
  - 1 letra maiúscula.
  - 1 letra minúscula.
  - 1 número.

- **Respostas**:
  - `201 Created`:

    ```json
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
    ```

  - `400 Bad Request`: dados inválidos.
  - `409 Conflict`: email já cadastrado.

---

### POST `/auth/refresh` — Renovar token

- **Descrição**: renova o token de acesso usando o usuário autenticado.
- **Auth**: **requer token**.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Body**: vazio.
- **Respostas**:
  - `200 OK`:

    ```json
    {
      "token": "novo_token_jwt",
      "refreshToken": "novo_refresh_token"
    }
    ```

  - `401 Unauthorized`: token inválido ou expirado.

---

### GET `/auth/me` — Usuário atual

- **Descrição**: retorna os dados do usuário autenticado (sem senha).
- **Auth**: **requer token**.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query/Body**: não possui.
- **Respostas**:
  - `200 OK`:

    ```json
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
    ```

  - `401 Unauthorized`: token não fornecido ou inválido.
  - `404 Not Found`: usuário não encontrado.

---

## 📦 Produtos

### GET `/products` — Listar produtos

- **Descrição**: lista todos os produtos do usuário autenticado.
- **Auth**: **requer token**.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query/Body**: não possui.
- **Respostas**:
  - `200 OK`:

    ```json
    {
      "products": [
        {
          "id": "uuid",
          "code": "string",
          "description": "string",
          "unit": "string | null",
          "lastInventory": "datetime | null",
          "createdAt": "datetime",
          "updatedAt": "datetime"
        }
      ],
      "total_products": 1
    }
    ```

  - `401 Unauthorized`: não autenticado.

---

### POST `/products` — Criar produto

- **Descrição**: cria um novo produto.
- **Auth**: **requer token**.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "code": "PROD001",
  "description": "Produto de exemplo"
}
```

- **Respostas**:
  - `201 Created`:

    ```json
    {
      "id": "uuid",
      "code": "PROD001",
      "description": "Produto de exemplo",
      "unit": null,
      "lastInventory": null,
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
    ```

  - `400 Bad Request`: dados inválidos.
  - `401 Unauthorized`: não autenticado.
  - `409 Conflict`: código de produto já existe.

---

### POST `/products/import` — Importar produtos via CSV

- **Descrição**: importa produtos a partir de um arquivo CSV.
- **Auth**: **requer token**.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Body (form-data)**:
  - `file`: arquivo CSV (`type: file`).

Formato esperado do CSV (configuração atual):

- Separador: `;`
- Encoding: `latin1`
- Headers (exemplo): `["Código do Produto", "Descrição do Produto"]`  
  (ver `productCsvConfig` para o padrão exato).

- **Respostas**:
  - `201 Created` (ou `200 OK`, conforme implementação atual):

    ```json
    {
      "message": "Produtos importados com sucesso",
      "imported": 10
    }
    ```

  - `400 Bad Request`: arquivo inválido (tipo errado, headers incorretos, CSV vazio).
  - `401 Unauthorized`: não autenticado.

---

### POST `/products/import/many` — Importar vários produtos via JSON

- **Descrição**: cria vários produtos em uma única chamada utilizando JSON.
- **Auth**: **requer token**.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body** (estrutura inferida do schema `createManyProductsSchema`):

```json
{
  "products": [
    {
      "code": "PROD001",
      "description": "Produto 1"
    },
    {
      "code": "PROD002",
      "description": "Produto 2"
    }
  ]
}
```

- **Respostas (esperado)**:
  - `201 Created`: produtos criados/importados.
  - `400 Bad Request`: payload inválido.
  - `401 Unauthorized`: não autenticado.
  - `409 Conflict`: conflito com códigos já existentes.

> Para o frontend, este endpoint é útil para importação em massa sem CSV, por exemplo, colando dados de uma planilha tratada no próprio app.

---

## 📊 Inventários

### GET `/inventories` — Listar inventários

- **Descrição**: lista todos os inventários do usuário, com seus itens.
- **Auth**: **requer token**.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query/Body**: não possui.
- **Respostas**:
  - `200 OK`:

    ```json
    [
      {
        "id": "uuid",
        "name": "Inventário Janeiro",
        "createdAt": "datetime",
        "inventoryItems": [
          {
            "stockExpected": "decimal",
            "stockCounted": "decimal",
            "difference": "decimal",
            "product": {
              "id": "uuid",
              "code": "string",
              "description": "string"
            }
          }
        ]
      }
    ]
    ```

  - `401 Unauthorized`: não autenticado.

---

### GET `/inventory` — Detalhar inventário por ID

- **Descrição**: retorna um inventário específico com seus itens.
- **Auth**: **requer token**.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query**:

```text
?id=<inventoryId>
```

- **Respostas**:
  - `200 OK`:

    ```json
    {
      "id": "uuid",
      "name": "Inventário Janeiro",
      "createdAt": "datetime",
      "inventoryItems": [
        {
          "stockExpected": "decimal",
          "stockCounted": "decimal",
          "difference": "decimal",
          "product": {
            "id": "uuid",
            "code": "string",
            "description": "string"
          }
        }
      ]
    }
    ```

  - `400 Bad Request`: id não enviado ou inválido.
  - `401 Unauthorized`: não autenticado.
  - `404 Not Found`: inventário não encontrado.

---

### GET `/inventory/suggested` — Produtos sugeridos para inventário

- **Descrição**: retorna produtos que estão há X dias sem inventário (ou nunca inventariados).
- **Auth**: **requer token**.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query**:

```text
?days=<número_obrigatório>&limit=<número_opcional_default_100>
```

Exemplos:

- `GET /inventory/suggested?days=30`
- `GET /inventory/suggested?days=60&limit=50`

- **Respostas**:
  - `200 OK`:

    ```json
    {
      "products": [
        {
          "id": "uuid",
          "code": "string",
          "description": "string",
          "unit": "string | null",
          "lastInventory": "datetime | null",
          "createdAt": "datetime",
          "updatedAt": "datetime"
        }
      ],
      "total": 1
    }
    ```

  - `400 Bad Request`: parâmetro `days` ausente ou inválido.
  - `401 Unauthorized`: não autenticado.

> Ideal para telas de “Inventário sugerido”, com filtros por período.

---

### GET `/inventory/product` — Histórico de inventários por produto

- **Descrição**: retorna o histórico de inventários de um produto.
- **Auth**: **requer token**.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query**:

```text
?id=<productId>
```

- **Respostas**:
  - `200 OK`:

    ```json
    {
      "id": "uuid",
      "code": "string",
      "description": "string",
      "unit": "string | null",
      "lastInventory": "datetime | null",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "userId": "uuid",
      "inventoryItems": [
        {
          "id": "uuid",
          "inventoryId": "uuid",
          "productId": "uuid",
          "unitInput": "string | null",
          "stockExpected": "decimal",
          "stockCounted": "decimal",
          "difference": "decimal",
          "createdAt": "datetime"
        }
      ]
    }
    ```

  - `400 Bad Request`: id do produto não enviado ou inválido.
  - `401 Unauthorized`: não autenticado.
  - `404 Not Found`: produto não encontrado.

---

### POST `/inventory/import` — Criar inventário via CSV

- **Descrição**: cria um novo inventário importando os itens de um arquivo CSV.
- **Auth**: **requer token**.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Body (form-data)**:
  - `file`: arquivo CSV com os itens do inventário.
  - `inventoryName`: nome do inventário (string).

Formato esperado do CSV:

- Separador: `;`
- Encoding: `latin1`
- Headers esperados (exemplo): `["Código do Produto", "Unidade", "Digitado", "Estoque"]`  
  (ver `InventoryCsvConfig.ts` para confirmação).

- **Respostas**:
  - `201 Created` (ou `200 OK`, de acordo com implementação):

    ```json
    {
      "data": {
        "id": "uuid",
        "name": "Inventário Janeiro",
        "createdAt": "datetime",
        "inventoryItems": [
          {
            "stockExpected": "decimal",
            "stockCounted": "decimal",
            "difference": "decimal",
            "product": {
              "id": "uuid",
              "code": "string",
              "description": "string"
            }
          }
        ]
      },
      "total_itens": 10
    }
    ```

  - `400 Bad Request`:
    - Nome de inventário já cadastrado.
    - CSV inválido ou produtos não encontrados.
  - `401 Unauthorized`: não autenticado.

> Endpoint indicado para telas com upload de planilha de contagem física.

---

### POST `/inventory` — Criar inventário manualmente

- **Descrição**: cria um inventário informando a lista de produtos e contagens via JSON.
- **Auth**: **requer token**.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "inventoryName": "Inventário Janeiro",
  "inventoryItens": [
    {
      "productId": "código_ou_id_do_produto",
      "unitInput": "UN",
      "stockExpected": 10,
      "stockCounted": 12
    }
  ]
}
```

- **Respostas**:
  - `201 Created` (ou `200 OK`):

    ```json
    {
      "newInventory": {
        "id": "uuid",
        "name": "Inventário Janeiro",
        "createdAt": "datetime",
        "inventoryItems": [
          {
            "stockExpected": "decimal",
            "stockCounted": "decimal",
            "difference": "decimal",
            "product": {
              "id": "uuid",
              "code": "string",
              "description": "string"
            }
          }
        ]
      }
    }
    ```

  - `400 Bad Request`:
    - Nome de inventário já cadastrado.
    - Produtos não encontrados.
    - Payload inválido.
  - `401 Unauthorized`: não autenticado.

Regra importante:

- `difference = stockCounted - stockExpected` é calculado no backend.
- `lastInventory` dos produtos é atualizado.

---

### DELETE `/inventory` — Deletar inventário

- **Descrição**: remove um inventário e todos os seus itens.
- **Auth**: **requer token**.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query**:

```text
?id=<inventoryId>
```

- **Respostas**:
  - `200 OK`:

    ```json
    {
      "message": "Inventário deletado com sucesso"
    }
    ```

  - `400 Bad Request`: id inválido (via schema).
  - `401 Unauthorized`: não autenticado.
  - `404 Not Found`: inventário não encontrado.

---

## ⚠️ Padrões de erro

Erros seguem um padrão consistente. Exemplos:

### Erro de validação (`400`)

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

### Erro genérico / domínio

Dependendo do caso, o backend retorna:

```json
{
  "error": "Mensagem geral",
  "message": "Descrição detalhada do erro"
}
```

Status comuns:

- `400 Bad Request`: payload inválido ou dados de domínio inconsistentes.
- `401 Unauthorized`: token ausente/inválido, credenciais incorretas.
- `403 Forbidden`: permissão insuficiente (se aplicável).
- `404 Not Found`: recurso não encontrado.
- `409 Conflict`: conflito de dados (duplicidade, etc.).
- `429 Too Many Requests`: limite de requisições/ tentativas excedido.
- `500 Internal Server Error`: erro inesperado.

---

## ✅ Dicas de uso no frontend

- **Centralize o token**: use um interceptor (ex.: Axios) para injetar `Authorization: Bearer <token>` automaticamente.
- **Trate 401 globalmente**: redirecione para login ou tente refresh de token via `/auth/refresh`.
- **Para uploads de CSV**:
  - Use `FormData` e não defina manualmente o header `Content-Type` (o browser fará isso, incluindo o boundary).
- **Para números decimais**:
  - O backend usa `decimal` (string ou número, conforme serialização). Trate-os como `string` se precisar de precisão exata em cálculos de frontend.

Para exemplos adicionais e testes interativos, utilize também o **Swagger UI** em `http://localhost:3000/api-docs`.

