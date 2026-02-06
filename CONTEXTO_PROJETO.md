# Documento de Contexto do Projeto - Inventário MN

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Tecnologias e Versões](#tecnologias-e-versões)
4. [Organização de Pastas](#organização-de-pastas)
5. [Modelagem do Banco de Dados](#modelagem-do-banco-de-dados)
6. [Endpoints](#endpoints)
7. [Validação de Schema](#validação-de-schema)
8. [Middlewares](#middlewares)
9. [Configurações](#configurações)

---

## 🎯 Visão Geral

Sistema de gerenciamento de inventário desenvolvido em Node.js com TypeScript, utilizando Express.js como framework web e Prisma como ORM para comunicação com banco de dados PostgreSQL.

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas com separação de responsabilidades:

```
Rotas → Controller → Service → Banco de Dados (Prisma)
```

### Fluxo de Requisição:

1. **Rotas (Routes)**: Define os endpoints e aplica middlewares necessários
2. **Controller**: Recebe a requisição HTTP, extrai dados e chama o Service
3. **Service**: Contém a lógica de negócio, validações e comunicação com o banco de dados
4. **Prisma Client**: Executa as operações no banco de dados PostgreSQL

### Características da Arquitetura:

- **Separação de Responsabilidades**: Cada camada tem uma responsabilidade específica
- **Reutilização**: Services podem ser reutilizados por diferentes controllers
- **Testabilidade**: Estrutura facilita testes unitários e de integração
- **Manutenibilidade**: Código organizado por módulos de funcionalidade

---

## 💻 Tecnologias e Versões

### Dependências Principais

| Biblioteca | Versão | Uso |
|------------|--------|-----|
| `express` | `^5.2.1` | Framework web para Node.js |
| `@prisma/client` | `^7.2.0` | ORM para acesso ao banco de dados |
| `@prisma/adapter-pg` | `^7.2.0` | Adaptador PostgreSQL para Prisma |
| `prisma` | `^7.2.0` | CLI do Prisma (devDependency) |
| `pg` | `^8.17.2` | Driver PostgreSQL |
| `typescript` | `^5.9.3` | Linguagem de programação (devDependency) |
| `tsx` | `^4.21.0` | Executor TypeScript para desenvolvimento |
| `zod` | `^4.3.5` | Biblioteca de validação de schemas |
| `jsonwebtoken` | `^9.0.3` | Geração e validação de tokens JWT |
| `bcryptjs` | `^3.0.3` | Hash de senhas |
| `multer` | `^2.0.2` | Upload de arquivos |
| `csv-parser` | `^3.2.0` | Parser de arquivos CSV |
| `cors` | `^2.8.5` | Middleware CORS |
| `dotenv` | `^17.2.3` | Gerenciamento de variáveis de ambiente |
| `chardet` | `^2.1.1` | Detecção de encoding de arquivos |
| `express-rate-limit` | `^8.2.1` | Rate limiting para proteção da API |
| `helmet` | `^8.1.0` | Segurança de headers HTTP |
| `swagger-jsdoc` | `^6.2.8` | Geração de documentação OpenAPI |
| `swagger-ui-express` | `^5.0.1` | Interface Swagger UI |

### DevDependencies

| Biblioteca | Versão | Uso |
|------------|--------|-----|
| `@types/express` | `^5.0.6` | Tipos TypeScript para Express |
| `@types/node` | `^25.0.9` | Tipos TypeScript para Node.js |
| `@types/jsonwebtoken` | `^9.0.10` | Tipos TypeScript para JWT |
| `@types/multer` | `^2.0.0` | Tipos TypeScript para Multer |
| `@types/pg` | `^8.16.0` | Tipos TypeScript para PostgreSQL |
| `@types/cors` | `^2.8.19` | Tipos TypeScript para CORS |
| `@types/helmet` | `^0.0.48` | Tipos TypeScript para Helmet |
| `@types/swagger-jsdoc` | `^6.0.4` | Tipos TypeScript para Swagger JSDoc |
| `@types/swagger-ui-express` | `^4.1.8` | Tipos TypeScript para Swagger UI |

---

## 📁 Organização de Pastas

```
Inventario_MN_Project/
├── prisma/
│   ├── migrations/          # Migrações do banco de dados
│   ├── schema.prisma        # Schema do Prisma (modelagem)
│   └── migration_lock.toml
├── src/
│   ├── @types/              # Definições de tipos TypeScript customizados
│   │   └── express/
│   │       └── index.d.ts   # Extensão do tipo Request do Express
│   ├── config/              # Configurações da aplicação
│   │   └── swagger.ts       # Configuração do Swagger/OpenAPI
│   ├── generated/           # Código gerado pelo Prisma
│   │   └── prisma/
│   ├── middlewares/         # Middlewares da aplicação
│   │   ├── isAuthenticated.ts
│   │   ├── rateLimiter.ts
│   │   ├── validateCsvMiddleware.ts
│   │   └── validateSchema.ts
│   ├── modules/             # Módulos da aplicação (por domínio)
│   │   ├── inventory/       # Módulo de Inventário
│   │   │   ├── controllers/
│   │   │   │   ├── CreateInventoryController.ts
│   │   │   │   ├── CreateInventoryByFileController.ts
│   │   │   │   ├── DeleteInventoryController.ts
│   │   │   │   ├── ListAllInventoriesController.ts
│   │   │   │   ├── ListInventaryByIdController.ts
│   │   │   │   ├── SearchProductInventoriesController.ts
│   │   │   │   └── SuggestedInventoryController.ts
│   │   │   ├── services/
│   │   │   │   ├── CreateInventoryService.ts
│   │   │   │   ├── DeleteInventoryService.ts
│   │   │   │   ├── ListAllInventoriesService.ts
│   │   │   │   ├── ListInventoryByIdService.ts
│   │   │   │   ├── SearchProductInventoriesService.ts
│   │   │   │   └── SuggestedInventoryService.ts
│   │   │   ├── schemas/
│   │   │   │   └── inventorySchema.ts
│   │   │   ├── routes.ts
│   │   │   ├── InventoryCsvConfig.ts
│   │   │   └── types/
│   │   │       └── inventoryType.ts
│   │   ├── products/        # Módulo de Produtos
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── schemas/
│   │   │   ├── routes.ts
│   │   │   └── productCsvConfig.ts
│   │   └── user/            # Módulo de Usuários
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── schemas/
│   │       └── routes.ts
│   ├── prisma/
│   │   └── index.ts         # Configuração do Prisma Client
│   ├── utils/               # Utilitários
│   │   ├── compareHash.ts
│   │   ├── createHash.ts
│   │   ├── csvParser.ts
│   │   └── multer.ts
│   ├── app.ts               # Configuração do Express
│   └── server.ts            # Ponto de entrada da aplicação
├── uploads/                 # Diretório temporário para uploads
├── .env                     # Variáveis de ambiente (não versionado)
├── .gitignore              # Arquivos ignorados pelo Git
├── package.json
├── tsconfig.json
├── prisma.config.ts
├── README.md               # Documentação principal
├── CONTEXTO_PROJETO.md     # Documentação técnica detalhada
└── SWAGGER_GUIDE.md        # Guia de uso do Swagger
```

### Estrutura de Módulos

Cada módulo segue o padrão:

```
module/
├── controllers/     # Controladores HTTP
├── services/        # Lógica de negócio
├── schemas/         # Schemas de validação Zod
├── routes.ts        # Definição de rotas
└── [config files]   # Arquivos de configuração específicos
```

---

## 🗄️ Modelagem do Banco de Dados

### Prisma Schema

O banco de dados utiliza **PostgreSQL** e é modelado através do Prisma Schema.

### Modelos

#### 1. User (Usuário)

```prisma
model User {
  id        String    @id @default(uuid())
  name      String
  email     String    @unique
  password  String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @default(now())
  removedAt DateTime?

  inventories Inventory[]
  products    Product[]
}
```

**Campos:**
- `id`: UUID único (chave primária)
- `name`: Nome do usuário
- `email`: Email único
- `password`: Senha hasheada
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização
- `removedAt`: Data de remoção (soft delete)

**Relacionamentos:**
- Um usuário pode ter múltiplos inventários
- Um usuário pode ter múltiplos produtos

#### 2. Product (Produto)

```prisma
model Product {
  id            String    @id @default(uuid())
  code          String
  description   String
  unit          String?
  lastInventory DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @default(now())
  userId        String
  user          User      @relation(fields: [userId], references: [id])

  inventoryItems InventoryItem[]
}
```

**Campos:**
- `id`: UUID único (chave primária)
- `code`: Código do produto
- `description`: Descrição do produto
- `unit`: Unidade de medida (opcional)
- `lastInventory`: Data do último inventário (opcional)
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização
- `userId`: ID do usuário proprietário

**Relacionamentos:**
- Pertence a um usuário (Many-to-One)
- Pode estar em múltiplos itens de inventário

#### 3. Inventory (Inventário)

```prisma
model Inventory {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  inventoryItems InventoryItem[]
}
```

**Campos:**
- `id`: UUID único (chave primária)
- `name`: Nome do inventário
- `createdAt`: Data de criação
- `userId`: ID do usuário proprietário

**Relacionamentos:**
- Pertence a um usuário (Many-to-One)
- Contém múltiplos itens de inventário

#### 4. InventoryItem (Item de Inventário)

```prisma
model InventoryItem {
  id String @id @default(uuid())

  inventoryId String
  productId   String

  unitInput     String? @default("UN")
  stockExpected Decimal @db.Decimal(10, 2)
  stockCounted  Decimal @db.Decimal(10, 2)
  difference    Decimal @db.Decimal(10, 2)

  createdAt DateTime @default(now())

  inventory Inventory @relation(fields: [inventoryId], references: [id], onDelete: Cascade)
  product   Product   @relation(fields: [productId], references: [id])

  @@unique([inventoryId, productId])
}
```

**Campos:**
- `id`: UUID único (chave primária)
- `inventoryId`: ID do inventário
- `productId`: ID do produto
- `unitInput`: Unidade de entrada (padrão: "UN")
- `stockExpected`: Estoque esperado (Decimal 10,2)
- `stockCounted`: Estoque contado (Decimal 10,2)
- `difference`: Diferença entre esperado e contado (Decimal 10,2)
- `createdAt`: Data de criação

**Relacionamentos:**
- Pertence a um inventário (Many-to-One) - com cascade delete
- Pertence a um produto (Many-to-One)

**Constraints:**
- Constraint única: Um produto não pode aparecer duas vezes no mesmo inventário

### Configuração do Prisma

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

O Prisma Client é gerado em `src/generated/prisma` e utiliza o adaptador PostgreSQL.

---

## 🔌 Endpoints

### Base URL
```
/api/v1
```

### Módulo: User (Usuário)

#### POST `/api/v1/user`
Cria um novo usuário.

**Middleware:** `validateSchema(createUserSchema)`

**Body:**
```json
{
  "name": "string (min: 3 caracteres)",
  "email": "string (email válido)",
  "password": "string (min: 8 caracteres, deve conter maiúscula, minúscula e número)"
}
```

**Response:** 200 OK
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "createdAt": "datetime"
}
```

#### POST `/api/v1/auth`
Autentica um usuário e retorna token JWT.

**Middleware:** `validateSchema(authUserSchema)`

**Body:**
```json
{
  "email": "string (email válido)",
  "password": "string"
}
```

**Response:** 200 OK
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

---

### Módulo: Products (Produtos)

#### GET `/api/v1/products`
Lista todos os produtos do usuário autenticado.

**Middleware:** `isAuthenticated`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** 200 OK
```json
[
  {
    "id": "uuid",
    "code": "string",
    "description": "string",
    "unit": "string | null",
    "lastInventory": "datetime | null",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

#### POST `/api/v1/products`
Cria um novo produto.

**Middleware:** `isAuthenticated`, `validateSchema(createProductSchema)`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "code": "string",
  "description": "string"
}
```

**Response:** 200 OK
```json
{
  "id": "uuid",
  "code": "string",
  "description": "string",
  "unit": null,
  "lastInventory": null,
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### POST `/api/v1/products/import`
Importa produtos a partir de um arquivo CSV.

**Middleware:** `isAuthenticated`, `uploadSingle("file")`, `validateCsvMiddleware(productCsvConfig)`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
- `file`: Arquivo CSV

**CSV Format:**
- Separador: `;`
- Encoding: `latin1`
- Headers esperados: `["Código do Produto", "Descrição do Produto"]`

**Response:** 200 OK
```json
{
  "message": "Produtos importados com sucesso",
  "count": number
}
```

---

### Módulo: Inventory (Inventário)

#### GET `/api/v1/inventories`
Lista todos os inventários do usuário autenticado com seus itens completos.

**Middleware:** `isAuthenticated`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** 200 OK
```json
[
  {
    "id": "uuid",
    "name": "string",
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

#### GET `/api/v1/inventory`
Lista um inventário específico por ID com seus itens completos.

**Middleware:** `isAuthenticated`, `validateSchema(idInventorySchema)`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?id=uuid
```

**Response:** 200 OK
```json
{
  "id": "uuid",
  "name": "string",
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

**Erros:**
- `400`: ID não enviado
- `404`: Inventário não encontrado

#### GET `/api/v1/inventory/suggested`
Sugere produtos para inventário baseado em dias sem inventariar.

**Middleware:** `isAuthenticated`, `validateSchema(suggestedInventorySchema)`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?days=number (obrigatório)
&limit=number (opcional, padrão: 100)
```

**Descrição:**
Retorna produtos que não foram inventariados há X dias ou nunca foram inventariados. Os produtos são retornados de forma aleatória dentro do limite especificado.

**Response:** 200 OK
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
  "total": number
}
```

**Erros:**
- `400`: Dias não enviado

#### GET `/api/v1/inventory/product`
Busca todos os inventários de um produto específico pelo ID do produto.

**Middleware:** `isAuthenticated`, `validateSchema(idProductInventorySchema)`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?id=uuid (ID do produto)
```

**Descrição:**
Retorna o produto com todos os seus itens de inventário associados, permitindo visualizar o histórico de inventários de um produto específico.

**Response:** 200 OK
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

**Erros:**
- `400`: ID do produto não enviado
- `404`: Produto não encontrado

#### POST `/api/v1/inventory/import`
Cria um inventário a partir de um arquivo CSV.

**Middleware:** `isAuthenticated`, `apiLimiter`, `uploadSingle("file")`, `validateCsvMiddleware(inventoryCsvConfig)`, `validateSchema(createInventoryByFileSchema)`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
- `file`: Arquivo CSV
- `inventoryName`: Nome do inventário (string)

**CSV Format:**
- Separador: `;`
- Encoding: `latin1`
- Headers esperados: `["Código do Produto", "Unidade", "Digitado", "Estoque"]`

**Response:** 200 OK
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
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
  "total_itens": number
}
```

**Erros:**
- `400`: Nome de inventário já cadastrado
- `400`: Produtos não encontrados no CSV

#### POST `/api/v1/inventory`
Cria um inventário manualmente com lista de produtos.

**Middleware:** `isAuthenticated`, `apiLimiter`, `validateSchema(createInventorySchema)`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "inventoryName": "string",
  "inventoryItens": [
    {
      "productId": "string (código do produto)",
      "unitInput": "string (opcional)",
      "stockExpected": number,
      "stockCounted": number
    }
  ]
}
```

**Response:** 200 OK
```json
{
  "newInventory": {
    "id": "uuid",
    "name": "string",
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

**Erros:**
- `400`: Nome de inventário já cadastrado
- `400`: Produtos não encontrados

**Observações:**
- A diferença (`difference`) é calculada automaticamente como `stockCounted - stockExpected`
- A data do último inventário dos produtos é atualizada automaticamente
- A operação é executada em transação (tudo ou nada)

#### DELETE `/api/v1/inventory`
Deleta um inventário.

**Middleware:** `isAuthenticated`, `validateSchema(idInventorySchema)`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?id=uuid
```

**Response:** 200 OK
```json
{
  "message": "Inventário deletado com sucesso"
}
```

**Observações:**
- Ao deletar um inventário, todos os seus itens são deletados automaticamente (cascade delete)

---

## ✅ Validação de Schema

O projeto utiliza **Zod** (`^4.3.5`) para validação de schemas.

### Middleware de Validação

O middleware `validateSchema` valida automaticamente:
- `req.body`
- `req.query`
- `req.params`

### Schemas Definidos

#### User Schemas

**createUserSchema:**
```typescript
{
  body: {
    name: string (min: 3 caracteres)
    email: string (email válido)
    password: string (min: 8 caracteres, deve conter:
      - pelo menos uma letra maiúscula
      - pelo menos uma letra minúscula
      - pelo menos um número)
  }
}
```

**authUserSchema:**
```typescript
{
  body: {
    email: string (email válido)
    password: string (obrigatório)
  }
}
```

#### Product Schemas

**createProductSchema:**
```typescript
{
  body: {
    code: string (obrigatório)
    description: string (obrigatório)
  }
}
```

#### Inventory Schemas

**createInventoryByFileSchema:**
```typescript
{
  body: {
    inventoryName: string (obrigatório)
  }
}
```

**createInventorySchema:**
```typescript
{
  body: {
    inventoryName: string (obrigatório)
    inventoryItens: array (obrigatório, mínimo 1 item) [
      {
        productId: string (obrigatório, código do produto)
        unitInput: string (opcional)
        stockExpected: number (obrigatório)
        stockCounted: number (obrigatório)
      }
    ]
  }
}
```

**idInventorySchema:**
```typescript
{
  query: {
    id: string (obrigatório, ID do inventário)
  }
}
```

**idProductInventorySchema:**
```typescript
{
  query: {
    id: string (obrigatório, ID do produto)
  }
}
```

**suggestedInventorySchema:**
```typescript
{
  query: {
    days: number (obrigatório, convertido automaticamente)
    limit: number (opcional, padrão: 100, convertido automaticamente)
  }
}
```

### Tratamento de Erros de Validação

Quando a validação falha, retorna:
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

Status Code: `400 Bad Request`

---

## 🛡️ Middlewares

### 1. isAuthenticated

**Arquivo:** `src/middlewares/isAuthenticated.ts`

**Função:** Valida token JWT e adiciona `user_id` ao `req`.

**Uso:**
```typescript
isAuthenticated
```

**Comportamento:**
1. Extrai token do header `Authorization: Bearer <token>`
2. Valida o token usando `JWT_SECRET_KEY`
3. Extrai o `sub` (user_id) do token
4. Adiciona `req.user_id` com o ID do usuário
5. Chama `next()` se válido

**Erros:**
- `401`: Token não fornecido ou inválido

**Extensão do Express:**
```typescript
declare global {
  namespace Express {
    interface Request {
      user_id: string;
    }
  }
}
```

---

### 2. validateSchema

**Arquivo:** `src/middlewares/validateSchema.ts`

**Função:** Valida request body, query e params usando Zod.

**Uso:**
```typescript
validateSchema(schema)
```

**Comportamento:**
1. Valida `req.body`, `req.query` e `req.params` contra o schema
2. Se válido, chama `next()`
3. Se inválido, retorna erro 400 com detalhes

**Erros:**
- `400`: Erro de validação (ZodError)
- `500`: Erro interno do servidor

---

### 3. validateCsvMiddleware

**Arquivo:** `src/middlewares/validateCsvMiddleware.ts`

**Função:** Valida e processa arquivos CSV.

**Uso:**
```typescript
validateCsvMiddleware(csvConfig)
```

**Parâmetros:**
- `csvConfig`: Objeto com `expectedHeaders` e `mapRow`

**Comportamento:**
1. Verifica se arquivo foi enviado
2. Valida tipo MIME (deve conter "csv")
3. Valida headers do CSV
4. Processa CSV e mapeia linhas
5. Adiciona dados processados em `req.body.csvData`
6. Remove arquivo temporário após processamento

**Erros:**
- `400`: Arquivo não enviado, tipo inválido, CSV vazio ou headers inválidos

---

### 4. uploadSingle (Multer)

**Arquivo:** `src/utils/multer.ts`

**Função:** Middleware para upload de arquivos usando Multer.

**Uso:**
```typescript
uploadSingle("file")
```

**Configuração:**
- **Destino:** `uploads/`
- **Tamanho máximo:** 5MB
- **Filtro:** Apenas arquivos CSV

**Comportamento:**
1. Recebe arquivo no campo especificado
2. Valida tipo (CSV)
3. Valida tamanho (máx 5MB)
4. Salva temporariamente em `uploads/`
5. Adiciona arquivo em `req.file`

**Erros:**
- `400`: Arquivo muito grande ou tipo inválido

---

### 5. Error Handler Global

**Arquivo:** `src/app.ts`

**Função:** Trata erros globais da aplicação.

**Comportamento:**
Trata diferentes tipos de erros com status codes apropriados:
- `400`: Erros de validação CSV
- `401`: Erros de credenciais
- `403`: Erros de permissão
- `404`: Recursos não encontrados
- `409`: Recursos já existentes
- `500`: Erros internos do servidor

---

### 6. apiLimiter (Rate Limiter)

**Arquivo:** `src/middlewares/rateLimiter.ts`

**Função:** Limita a taxa de requisições para proteger a API contra abuso.

**Uso:**
```typescript
apiLimiter
```

**Configuração:**
- **Janela de tempo:** 5 minutos
- **Máximo de requisições:** 100 por IP
- **Mensagem de erro:** "Muitas requisições. Tente novamente em 15 minutos."

**Comportamento:**
1. Conta requisições por IP em uma janela de 5 minutos
2. Se exceder 100 requisições, bloqueia temporariamente
3. Retorna status `429 Too Many Requests` quando bloqueado

**Aplicado em:**
- `POST /api/v1/inventory/import`
- `POST /api/v1/inventory`

---

### 7. authLimiter (Rate Limiter para Autenticação)

**Arquivo:** `src/middlewares/rateLimiter.ts`

**Função:** Limita tentativas de autenticação para prevenir ataques de força bruta.

**Uso:**
```typescript
authLimiter
```

**Configuração:**
- **Janela de tempo:** 5 minutos
- **Máximo de tentativas:** 5 por IP
- **Mensagem de erro:** "Muitas tentativas de login. Tente novamente em 15 minutos."

**Comportamento:**
1. Conta tentativas de login por IP em uma janela de 5 minutos
2. Se exceder 5 tentativas, bloqueia temporariamente
3. Retorna status `429 Too Many Requests` quando bloqueado

**Aplicado em:**
- Endpoints de autenticação (quando configurado)

---

### 8. Helmet (Segurança HTTP)

**Biblioteca:** `helmet` (`^8.1.0`)

**Função:** Adiciona headers HTTP de segurança para proteger a aplicação contra vulnerabilidades comuns.

**Headers configurados:**
- `Content-Security-Policy`: Previne XSS
- `X-DNS-Prefetch-Control`: Controla DNS prefetching
- `X-Frame-Options`: Previne clickjacking
- `X-Content-Type-Options`: Previne MIME sniffing
- `Strict-Transport-Security`: Força HTTPS
- `X-Download-Options`: Previne downloads maliciosos
- `X-Permitted-Cross-Domain-Policies`: Controla políticas cross-domain

**Aplicado em:**
- Globalmente em `src/app.ts`

---

## ⚙️ Configurações

### Variáveis de Ambiente

O projeto utiliza `dotenv` para gerenciar variáveis de ambiente. Arquivo `.env` necessário:

```env
# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# JWT
JWT_SECRET_KEY=your_secret_key_here

# Servidor
EXPRESS_PORT=3000
```

### TypeScript Configuration

**Arquivo:** `tsconfig.json`

**Principais configurações:**
- `module`: `nodenext`
- `target`: `esnext`
- `strict`: `true`
- `moduleDetection`: `force`
- `isolatedModules`: `true`
- `skipLibCheck`: `true`

### Scripts NPM

```json
{
  "dev": "tsx watch src/server.ts",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

- `dev`: Inicia servidor em modo desenvolvimento com hot reload
- `test`: Script de testes (a ser configurado)

### Prisma Configuration

**Arquivo:** `prisma.config.ts`

Configuração customizada do Prisma Client com adaptador PostgreSQL.

---

## 📚 Documentação da API (Swagger)

O projeto integra **Swagger UI** para documentação interativa da API.

### Acesso

Após iniciar o servidor, acesse:

```
http://localhost:3000/api-docs
```

(ou a porta configurada em `EXPRESS_PORT`)

### Configuração

**Arquivo:** `src/config/swagger.ts`

**Especificação:** OpenAPI 3.0

**Estrutura:**
```typescript
{
  openapi: "3.0.0",
  info: {
    title: "Inventário MN API",
    version: "1.0.0",
    description: "API para gerenciamento de inventário"
  },
  servers: [
    { url: "http://localhost:3000" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
}
```

### Documentação dos Endpoints

A documentação é gerada automaticamente através de **comentários JSDoc** nos arquivos de rotas (`src/modules/*/routes.ts`).

**Exemplo de anotação:**

```typescript
/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 *       401:
 *         description: Token inválido ou não fornecido
 */
router.get("/products", isAuthenticated, controller.list);
```

### Autenticação no Swagger

1. Faça login através do endpoint `/api/v1/auth`
2. Copie o `token` retornado
3. Clique em **"Authorize"** no topo do Swagger UI
4. Cole o token no campo `bearerAuth` (formato: `Bearer {token}`)
5. Clique em **"Authorize"** e depois **"Close"**
6. Agora você pode testar endpoints protegidos!

### Schemas e Modelos

O Swagger documenta automaticamente:
- Request bodies
- Query parameters
- Path parameters
- Response schemas
- Status codes
- Headers de autenticação

### Benefícios

- ✅ Documentação sempre atualizada
- ✅ Teste de endpoints em tempo real
- ✅ Visualização de schemas de dados
- ✅ Exemplos de requisições e respostas
- ✅ Interface amigável para desenvolvedores

---

## 📝 Observações Importantes

### Autenticação e Segurança
1. **Autenticação JWT**: Todos os endpoints de produtos e inventário requerem autenticação via JWT
2. **Validação de Senha**: Senhas devem ter no mínimo 8 caracteres com maiúscula, minúscula e número
3. **Headers de Segurança**: Helmet configurado para adicionar headers de segurança HTTP
4. **Rate Limiting**: 
   - API geral: 100 requisições por 5 minutos por IP
   - Autenticação: 5 tentativas por 5 minutos por IP
5. **CORS**: Configurado para aceitar requisições de origens autorizadas
6. **SQL Injection**: Protegido através do Prisma ORM com queries parametrizadas

### Upload e Arquivos
7. **Upload de Arquivos**: Arquivos CSV são processados e removidos automaticamente após uso
8. **Encoding CSV**: Os arquivos CSV devem estar em encoding `latin1`
9. **Separador CSV**: Utiliza ponto e vírgula (`;`) como separador
10. **Tamanho máximo**: 5MB por arquivo
11. **Validação de headers**: CSV deve conter headers específicos conforme configuração

### Banco de Dados
12. **Soft Delete**: Usuários possuem campo `removedAt` para soft delete
13. **Cascade Delete**: Ao deletar um inventário, seus itens são deletados automaticamente
14. **Geração de IDs**: Todos os IDs são UUIDs gerados automaticamente
15. **Transações**: A criação de inventários utiliza transações do Prisma para garantir atomicidade (tudo ou nada)

### Regras de Negócio
16. **Atualização Automática**: Ao criar um inventário, a data do último inventário dos produtos é atualizada automaticamente
17. **Cálculo de Diferença**: A diferença entre estoque esperado e contado é calculada automaticamente (`stockCounted - stockExpected`)
18. **Sugestão de Produtos**: O endpoint de sugestão retorna produtos aleatórios que não foram inventariados há X dias ou nunca foram inventariados
19. **Validação de Produtos**: Ao criar inventário, o sistema valida se todos os produtos existem antes de criar os itens
20. **Nome Único**: Não é permitido criar inventários com o mesmo nome para o mesmo usuário
21. **Conversão de Código para ID**: O sistema converte automaticamente códigos de produtos para IDs internos ao criar inventários
22. **Histórico de Inventários**: É possível buscar todos os inventários de um produto específico pelo ID do produto

### Documentação
23. **Swagger UI**: Documentação interativa disponível em `/api-docs`
24. **OpenAPI 3.0**: Especificação completa da API
25. **Testes em tempo real**: Possível testar todos os endpoints através do Swagger

---

## 🔄 Fluxo de Dados Completo

### Exemplo 1: Criar Produto

```
1. Cliente → POST /api/v1/products
   Headers: Authorization: Bearer <token>
   Body: { code: "123", description: "Produto X" }

2. Route → Valida autenticação (isAuthenticated)
   → Valida schema (validateSchema)
   → Chama Controller

3. Controller → Extrai dados do req.body
   → Chama Service

4. Service → Valida regras de negócio
   → Comunica com Prisma Client
   → Cria produto no banco
   → Retorna dados

5. Controller → Recebe dados do Service
   → Retorna resposta HTTP 200

6. Cliente ← Recebe resposta JSON
```

### Exemplo 2: Criar Inventário Manual

```
1. Cliente → POST /api/v1/inventory
   Headers: Authorization: Bearer <token>
   Body: {
     inventoryName: "Inventário Janeiro",
     inventoryItens: [
       { productId: "123", stockExpected: 10, stockCounted: 12 }
     ]
   }

2. Route → Valida autenticação (isAuthenticated)
   → Valida schema (validateSchema)
   → Chama Controller

3. Controller → Extrai dados do req.body
   → Chama Service

4. Service → Inicia transação Prisma
   → Valida se nome já existe
   → Valida se produtos existem
   → Cria inventário
   → Cria itens do inventário
   → Calcula diferenças automaticamente
   → Atualiza lastInventory dos produtos
   → Commit transação
   → Retorna dados completos

5. Controller → Recebe dados do Service
   → Retorna resposta HTTP 200

6. Cliente ← Recebe resposta JSON com inventário completo
```

### Exemplo 3: Sugerir Produtos para Inventário

```
1. Cliente → GET /api/v1/inventory/suggested?days=30&limit=50
   Headers: Authorization: Bearer <token>

2. Route → Valida autenticação (isAuthenticated)
   → Valida schema (validateSchema)
   → Chama Controller

3. Controller → Extrai user_id do token
   → Extrai days e limit da query
   → Chama Service

4. Service → Calcula data limite (hoje - days)
   → Busca produtos sem inventário ou com lastInventory < data limite
   → Seleciona aleatoriamente até o limite
   → Retorna lista de produtos

5. Controller → Recebe dados do Service
   → Retorna resposta HTTP 200 com total

6. Cliente ← Recebe resposta JSON com produtos sugeridos
```

---

## 📚 Recursos Adicionais

### Código Gerado e Configurações
- **Prisma Migrations**: Histórico de migrações em `prisma/migrations/`
- **Generated Code**: Código gerado pelo Prisma em `src/generated/prisma/`
- **Type Definitions**: Tipos customizados em `src/@types/` e tipos de domínio em `src/modules/*/types/`
- **Swagger Config**: Configuração OpenAPI em `src/config/swagger.ts`

### Utilitários
- **Hash**: `createHash.ts` e `compareHash.ts` para bcrypt
- **CSV Parser**: `csvParser.ts` para leitura e validação de CSV
- **Multer**: `multer.ts` para configuração de upload
- **Prisma Client**: `src/prisma/index.ts` para instância única do cliente

### Boas Práticas Implementadas
- **Separação de Responsabilidades**: Arquitetura em camadas (Routes → Controllers → Services → Database)
- **Type Safety**: Tipos TypeScript customizados para cada módulo (ex: `InventoryType`)
- **Validação Centralizada**: Schemas Zod reutilizáveis por módulo
- **Transações Atômicas**: Utilizadas para garantir consistência em operações complexas
- **Error Handling**: Tratamento centralizado de erros com status codes apropriados
- **Code Organization**: Módulos organizados por domínio de negócio
- **Documentation**: Documentação automática via JSDoc + Swagger

### Segurança Implementada
- ✅ Autenticação JWT com refresh token
- ✅ Senhas hasheadas com bcrypt (10 salt rounds)
- ✅ Rate limiting em endpoints críticos
- ✅ Helmet para headers de segurança
- ✅ CORS configurável
- ✅ Validação rigorosa de entrada (Zod)
- ✅ Proteção contra SQL Injection (Prisma)
- ✅ Arquivos temporários removidos após processamento

### Próximos Passos Sugeridos
- [ ] Implementar testes unitários e de integração (Jest/Vitest)
- [ ] Adicionar logs estruturados (Winston/Pino)
- [ ] Implementar paginação em endpoints de listagem
- [ ] Adicionar filtros e ordenação avançada
- [ ] Implementar sistema de permissões/roles
- [ ] Adicionar cache (Redis) para queries frequentes
- [ ] Implementar busca full-text em produtos
- [ ] Adicionar exportação de relatórios (PDF/Excel)
- [ ] Implementar webhooks para notificações
- [ ] Adicionar monitoramento (Sentry/DataDog)

---

## 🔗 Links Úteis

- **Prisma Docs**: https://www.prisma.io/docs
- **Express.js**: https://expressjs.com/
- **Zod**: https://zod.dev/
- **Swagger/OpenAPI**: https://swagger.io/specification/
- **TypeScript**: https://www.typescriptlang.org/docs/

---

**Última atualização:** Fevereiro 2026
**Versão:** 1.0.0

