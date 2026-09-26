# Catálogo de Endpoints - Inventário MN

> **Objetivo**: visão consolidada dos endpoints para quem desenvolve o **frontend**.  
> Regras de domínio, modelos e rate limit estão em `API_DOCUMENTATION.md`.

## 📋 Índice

1. [Informações gerais](#informações-gerais)
2. [Autenticação e usuário](#autenticação-e-usuário)
3. [Produtos](#produtos)
4. [Inventários](#inventários)
5. [Dashboard](#dashboard)
6. [Padrões de erro](#padrões-de-erro)
7. [Dicas de uso no frontend](#dicas-de-uso-no-frontend)

---

## ℹ️ Informações gerais

- **Base URL (dev)**: `http://localhost:3000/api/v1`
- **Formato**: `application/json` na ida e na volta.
- **Autenticação**:
  - Rotas protegidas: `Authorization: Bearer <token>`.
  - `token` é o access token JWT.
  - `refreshToken` é opaco e vai no **body**, nunca no header Bearer.
- **Correlação**: envie `X-Request-Id` se quiser; a API devolve o mesmo valor em `x-request-id`.
- **Swagger**: `http://localhost:3000/api-docs` fora de produção.

Rotas públicas: `POST /user`, `POST /auth`, `POST /auth/refresh`, `POST /auth/logout`.

---

## 👤 Autenticação e usuário

### POST `/user` — Criar usuário

- **Auth**: pública.
- **Body**:

```json
{
  "name": "Nome do Usuário",
  "email": "user@example.com",
  "password": "Senha123"
}
```

Senha: 8 a 32 caracteres, com maiúscula, minúscula e número. Nome com no mínimo 3 caracteres.

- **Respostas**:
  - `200 OK`:

    ```json
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "createdAt": "2026-09-26T18:00:00.000Z"
    }
    ```

  - `400`: validação.
  - `409`: `{ "error": "Usuário já cadastrado." }`
  - `429`: muitas tentativas de cadastro.

---

### POST `/auth` — Login

- **Auth**: pública.
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
      "id": "uuid",
      "name": "string",
      "email": "string",
      "token": "jwt_access_token",
      "refreshToken": "refresh_token_opaco"
    }
    ```

  - `400`: validação.
  - `401`: `{ "error": "Credenciais inválidas." }`
  - `429`: muitas tentativas de login.

Guarde `token` e `refreshToken`. O objeto do usuário vem na raiz, sem aninhar em `user`.

---

### POST `/auth/refresh` — Renovar tokens

- **Auth**: **não** envie Bearer. O access token pode estar expirado.
- **Body**:

```json
{
  "refreshToken": "refresh_token_opaco"
}
```

- **Respostas**:
  - `200 OK`: o mesmo formato do login (`id`, `name`, `email`, `token`, `refreshToken`).
  - `400`: `refreshToken` ausente.
  - `401`:
    - `{ "error": "Refresh token inválido." }` — desconhecido ou já usado.
    - `{ "error": "Refresh token expirado." }`
    - `{ "error": "Usuário não encontrado ou removido." }`
  - `429`: muitas renovações.

Substitua os dois tokens guardados. O refresh anterior foi revogado. Reenviar um refresh já revogado invalida todas as sessões daquele usuário.

---

### POST `/auth/logout` — Encerrar sessão

- **Auth**: pública. Envie o refresh token atual.
- **Body**:

```json
{
  "refreshToken": "refresh_token_opaco"
}
```

- **Respostas**:
  - `200 OK`: `{ "message": "Sessão encerrada." }` — também quando o token já era inválido.
  - `400`: `refreshToken` ausente.
  - `429`: muitas tentativas.

Apague os tokens no cliente. O access token deixa de renovar, mas segue válido até expirar.

---

### GET `/auth/me` — Usuário atual

- **Auth**: Bearer.
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

  - `401`: token ausente (`Authorization token is required`) ou inválido (`token invalid`), na chave `message`.
  - `404`: `{ "error": "Usuário não encontrado." }`

---

## 📦 Produtos

Unidades válidas: `UN`, `KG`, `LT`, `SC`, `PT`.

`code` é numérico. A API grava sem zeros à esquerda (`000123` → `123`).

### GET `/products` — Listar produtos

- **Auth**: Bearer.
- **Respostas**:
  - `200 OK`:

    ```json
    {
      "products": [
        {
          "id": "uuid",
          "code": "123",
          "description": "string",
          "unit": "UN",
          "lastInventory": "datetime | null",
          "isAbcSales": false,
          "createdAt": "datetime",
          "updatedAt": "datetime",
          "userId": "uuid"
        }
      ],
      "total_products": 1
    }
    ```

  - `401`: não autenticado.

---

### POST `/products` — Criar produto

- **Auth**: Bearer.
- **Body**:

```json
{
  "code": "000123",
  "description": "Produto de exemplo",
  "unit": "UN"
}
```

`unit` é obrigatória.

- **Respostas**:
  - `201 Created`: produto criado (`code` já sanitizado, `isAbcSales: false`).
  - `400`: validação ou `{ "error": "Código do produto inválido." }`
  - `401`: não autenticado.
  - `409`: `{ "error": "Produto já cadastrado." }`

---

### POST `/products/import/many` — Importar vários produtos via JSON

- **Auth**: Bearer.
- **Body**:

```json
{
  "products": [
    { "code": "1001", "description": "Produto 1", "unit": "UN" },
    { "code": "1002", "description": "Produto 2", "unit": "KG" }
  ]
}
```

Códigos que já existem são ignorados (`skipped`). Códigos repetidos no mesmo array derrubam a requisição inteira.

- **Respostas**:
  - `200 OK`:

    ```json
    {
      "created": [{ "code": "1001", "description": "Produto 1", "unit": "UN" }],
      "total_created": 1,
      "skipped": [{ "code": "1002", "description": "Produto 2", "unit": "KG" }],
      "total_skipped": 1,
      "errors": []
    }
    ```

  - `400`: payload inválido, `{ "error": "Nenhum produto enviado." }`, `{ "error": "Há códigos repetidos no envio." }` ou código inválido.
  - `401`: não autenticado.

`errors` lista falhas de gravação: `{ "code", "description", "error" }`.

---

### PUT `/products/updateABCSales` — Alternar curva ABC

Inverte `isAbcSales` do produto.

- **Auth**: Bearer.
- **Query**: `?id=<productId>`
- **Body**: vazio.
- **Respostas**:
  - `200 OK`:

    ```json
    {
      "message": "ABC de venda definido com sucesso.",
      "product": {
        "id": "uuid",
        "code": "123",
        "description": "string",
        "isAbcSales": true
      }
    }
    ```

  - `400`: `{ "error": "Id do produto não enviado." }`
  - `401`: não autenticado.
  - `404`: `{ "error": "Produto não encontrado.", "product": null }`

---

## 📊 Inventários

Decimais (`stockExpected`, `stockCounted`, `difference`) chegam como **string** (`"10.00"`).

### GET `/inventories` — Listar inventários

- **Auth**: Bearer.
- **Respostas**:
  - `200 OK`: array. Pode ser `[]`.

    ```json
    [
      {
        "id": "uuid",
        "name": "Inventário Setembro",
        "createdAt": "datetime",
        "inventoryItems": [
          {
            "stockExpected": "10.00",
            "stockCounted": "12.00",
            "difference": "2.00",
            "product": {
              "id": "uuid",
              "code": "123",
              "description": "string"
            }
          }
        ]
      }
    ]
    ```

  - `401`: não autenticado.

---

### GET `/inventory` — Detalhar inventário por ID

- **Auth**: Bearer.
- **Query**: `?id=<inventoryId>`
- **Respostas**:
  - `200 OK`: um objeto no mesmo formato de um item da listagem.
  - `400`: id ausente.
  - `401`: não autenticado.
  - `404`: `{ "error": "Recurso não encontrado." }`

---

### GET `/inventory/suggested` — Produtos sugeridos para inventário

Produtos nunca inventariados ou com último inventário anterior a `days` dias. A amostra é aleatória, no máximo `limit` itens.

- **Auth**: Bearer.
- **Query**: `?days=<número>&limit=<opcional, padrão 100>`
- **Exemplos**:
  - `GET /inventory/suggested?days=30`
  - `GET /inventory/suggested?days=60&limit=50`
- **Respostas**:
  - `200 OK`:

    ```json
    {
      "products": [
        {
          "id": "uuid",
          "code": "123",
          "description": "string",
          "unit": "UN",
          "lastInventory": null,
          "isAbcSales": false,
          "createdAt": "datetime",
          "updatedAt": "datetime",
          "userId": "uuid"
        }
      ],
      "total": 1
    }
    ```

  - `400`: `days` ausente, inválido, ou `0` (`{ "error": "Dias não enviado." }`).
  - `401`: não autenticado.

`total` é o tamanho desta lista, não o total elegível no banco.

---

### GET `/inventory/product` — Histórico de um produto

- **Auth**: Bearer.
- **Query**: `?id=<productId>` (UUID do produto).
- **Respostas**:
  - `200 OK`:

    ```json
    {
      "id": "uuid",
      "code": "123",
      "description": "string",
      "unit": "UN",
      "lastInventory": "datetime | null",
      "isAbcSales": false,
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "userId": "uuid",
      "inventoryItems": [
        {
          "id": "uuid",
          "inventoryId": "uuid",
          "productId": "uuid",
          "unitInput": "UN",
          "stockExpected": "10.00",
          "stockCounted": "12.00",
          "difference": "2.00",
          "createdAt": "datetime"
        }
      ]
    }
    ```

  - `400`: id ausente.
  - `401`: não autenticado.
  - `404`: `{ "error": "Recurso não encontrado." }`

---

### POST `/inventory` — Criar inventário

- **Auth**: Bearer.
- **Body**:

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

`productId` é o **código** do produto (como está salvo), não o UUID. `unitInput` é opcional. `difference` e `lastInventory` são calculados no servidor.

- **Respostas**:
  - `200 OK`:

    ```json
    {
      "newInventory": {
        "id": "uuid",
        "name": "Inventário Setembro",
        "createdAt": "datetime",
        "inventoryItems": [
          {
            "stockExpected": "10.00",
            "stockCounted": "12.00",
            "difference": "2.00",
            "product": {
              "id": "uuid",
              "code": "123",
              "description": "string"
            }
          }
        ]
      }
    }
    ```

  - `400`: payload inválido ou `{ "error": "Nome de inventário já cadastrado." }`
  - `401`: não autenticado.
  - `404`: `{ "error": "Um ou mais produtos não foram encontrados." }`
  - `429`: limite de criação.

O mesmo produto não pode aparecer duas vezes no mesmo inventário.

---

### DELETE `/inventory` — Deletar inventário

Remove o inventário e os itens. Não recalcula `lastInventory` dos produtos.

- **Auth**: Bearer.
- **Query**: `?id=<inventoryId>`
- **Respostas**:
  - `200 OK`:

    ```json
    {
      "message": "Inventário Inventário Setembro deletado com sucesso"
    }
    ```

  - `400`: id ausente.
  - `401`: não autenticado.
  - `404`: `{ "error": "Recurso não encontrado." }`

---

## 📈 Dashboard

### GET `/dashboard` — Resumo agregado

Uma chamada para a home. A janela é **fixa em 30 dias**. Query string é ignorada.

- **Auth**: Bearer.
- **Respostas**:
  - `200 OK`:

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
          "id": "uuid",
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
          "id": "uuid",
          "name": "Inventário Setembro",
          "createdAt": "2026-09-26T18:00:00.000Z",
          "itemsCount": 120,
          "difference": 15.5
        }
      ]
    }
    ```

  - `401`: token ausente ou inválido.

| Campo | Uso na UI |
|-------|-----------|
| `totals` | Cards gerais |
| `currentPeriod` / `previousPeriod` | Comparativo dos últimos 30 dias contra os 30 anteriores. `totalDifference` é a soma dos valores absolutos |
| `latestInventories` | Até 5 inventários do período atual, com quantidade de itens e diferença absoluta |
| `recentlyInventoriedProducts` | Produtos com inventário nos últimos 30 dias |

---

## ⚠️ Padrões de erro

### Validação (`400`)

```json
{
  "error": "Erro validação",
  "details": [{ "message": "mensagem de erro específica" }]
}
```

### Domínio

```json
{
  "error": "Mensagem controlada"
}
```

### Bearer inválido (`401`)

```json
{ "message": "Authorization token is required" }
```

```json
{ "message": "token invalid" }
```

| Status | Quando |
|--------|--------|
| `400` | Payload ou query inválidos, código de produto inválido, nome de inventário duplicado |
| `401` | Credenciais, refresh ou access token |
| `403` | Sem permissão |
| `404` | Recurso não encontrado |
| `409` | Usuário ou produto já cadastrado |
| `429` | Rate limit. O corpo é o texto da mensagem do limitador |
| `500` | `{ "error": "Erro interno do servidor" }` |

Mensagens estáveis para o frontend tratar:

- `Credenciais inválidas.`
- `Refresh token inválido.`
- `Refresh token expirado.`
- `Usuário já cadastrado.`
- `Produto já cadastrado.`
- `Produto não encontrado.`
- `Código do produto inválido.`
- `Há códigos repetidos no envio.`
- `Nome de inventário já cadastrado.`
- `Um ou mais produtos não foram encontrados.`
- `Recurso não encontrado.`

---

## ✅ Dicas de uso no frontend

- Interceptor: injete `Authorization: Bearer <token>` nas rotas protegidas.
- Em `401` com `token invalid`, chame `POST /auth/refresh` com o refresh guardado e repita a requisição. Se o refresh falhar, vá para o login.
- No logout, chame `POST /auth/logout` e só então limpe o armazenamento local.
- Não há upload de CSV. Importação de produtos é `POST /products/import/many`.
- Na criação de inventário, envie o **código** do produto em `productId`.
- Trate decimais de estoque como string para não perder casas.
- `isAbcSales` vem na listagem de produtos e muda só pelo `PUT /products/updateABCSales`.
- A home deve usar `GET /dashboard`. Não calcule esses totais baixando `GET /products` e `GET /inventories`.
