# 📦 Inventário MN – API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql&logoColor=white)

**API REST moderna para gerenciamento completo de inventário empresarial**

[Documentação](#-documentação-da-api) • [Instalação](#-instalação) • [Configuração](#-configuração) • [Features](#-features-principais)

</div>

---

## 📖 Sobre o Projeto

API REST robusta desenvolvida em **Node.js** com **TypeScript** para gerenciamento completo de inventário empresarial. Sistema que permite controle detalhado de estoque, inventários periódicos, análise de divergências e sugestões inteligentes de produtos a inventariar.

### 🎯 Problema que Resolve

- **Controle de inventário físico** vs estoque sistêmico
- **Rastreamento temporal** de quando cada produto foi contado
- **Sugestões inteligentes** de produtos prioritários para inventariar
- **Importação em lote** via arquivos CSV
- **Histórico completo** de inventários por produto
- **Análise de divergências** entre estoque esperado e contado

---

## ✨ Features Principais

### 🔐 Autenticação & Segurança
- ✅ Autenticação JWT com refresh token
- ✅ Senhas hasheadas com bcrypt
- ✅ Rate limiting para proteção contra abuso
- ✅ Helmet para segurança de headers HTTP
- ✅ CORS configurável

### 📦 Gestão de Produtos
- ✅ CRUD completo de produtos
- ✅ Importação em massa via CSV
- ✅ Validação robusta de dados (Zod)
- ✅ Rastreamento de último inventário

### 📋 Sistema de Inventário
- ✅ Criação manual ou por importação CSV
- ✅ Cálculo automático de divergências
- ✅ Sugestões inteligentes de produtos (por dias sem inventariar)
- ✅ Histórico completo por produto
- ✅ Soft delete com transações atômicas

### 📊 Documentação Interativa
- ✅ Swagger UI integrado
- ✅ Documentação OpenAPI 3.0
- ✅ Teste de endpoints em tempo real

---

## 🛠️ Tecnologias e Ferramentas

### Core
- **Node.js** 18+ - Runtime JavaScript
- **TypeScript** 5.9 - Tipagem estática
- **Express** 5.2 - Framework web

### Banco de Dados
- **PostgreSQL** - Banco de dados principal
- **Prisma** 7.2 - ORM moderno com type-safety

### Autenticação & Segurança
- **JWT** - Tokens de autenticação
- **bcryptjs** - Hash de senhas
- **Helmet** - Headers de segurança
- **express-rate-limit** - Proteção contra abuso

### Validação & Upload
- **Zod** 4.3 - Validação de schemas
- **Multer** 2.0 - Upload de arquivos
- **csv-parser** - Parse de arquivos CSV
- **chardet** - Detecção de encoding

### Documentação
- **Swagger UI** - Interface interativa
- **swagger-jsdoc** - Geração de docs OpenAPI

---

## 🏗️ Arquitetura

O projeto segue uma **arquitetura em camadas** com clara separação de responsabilidades:

```
┌─────────────┐
│   Routes    │  ← Definição de endpoints e middlewares
└──────┬──────┘
       ↓
┌─────────────┐
│ Controllers │  ← Extração de dados da requisição
└──────┬──────┘
       ↓
┌─────────────┐
│  Services   │  ← Lógica de negócio e validações
└──────┬──────┘
       ↓
┌─────────────┐
│   Prisma    │  ← Comunicação com banco de dados
└─────────────┘
```

### 📂 Estrutura de Pastas

```
Inventario_MN_Project/
├── prisma/
│   ├── schema.prisma        # Modelagem do banco
│   └── migrations/          # Histórico de migrações
├── src/
│   ├── @types/              # Tipos TypeScript customizados
│   ├── config/              # Configurações (Swagger, etc)
│   ├── middlewares/         # Middlewares globais
│   │   ├── isAuthenticated.ts
│   │   ├── rateLimiter.ts
│   │   ├── validateSchema.ts
│   │   └── validateCsvMiddleware.ts
│   ├── modules/             # Módulos de domínio
│   │   ├── user/            # Autenticação e usuários
│   │   ├── products/        # Gestão de produtos
│   │   └── inventory/       # Sistema de inventário
│   ├── utils/               # Funções auxiliares
│   ├── app.ts               # Configuração do Express
│   └── server.ts            # Ponto de entrada
├── uploads/                 # Uploads temporários (gitignored)
└── .env                     # Variáveis de ambiente
```

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **yarn** (gerenciador de pacotes)
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **Git** (para clonar o repositório)

---

## 🚀 Instalação

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/PedroStaRosa/inventario-mn-api.git
cd inventario-mn-api
```

### 2️⃣ Instale as dependências

```bash
npm install
```

### 3️⃣ Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/inventario_mn?schema=public"

# JWT (use uma chave forte em produção)
JWT_SECRET_KEY="sua_chave_secreta_super_segura_aqui"

# Servidor
EXPRESS_PORT=3000
```

> 💡 **Dica:** Use `openssl rand -base64 32` para gerar uma chave JWT segura.

### 4️⃣ Configure o banco de dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Aplicar migrações
npx prisma migrate deploy

# (Opcional) Visualizar banco com Prisma Studio
npx prisma studio
```

### 5️⃣ Inicie o servidor

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Servidor iniciará em http://localhost:3000
```

---

## 📚 Documentação da API

Após iniciar o servidor, acesse a documentação interativa:

**🔗 Swagger UI:** `http://localhost:3000/api-docs`

### Como usar a documentação:

1. **Criar um usuário:** `POST /api/v1/user`
2. **Fazer login:** `POST /api/v1/auth` → copie o `token`
3. **Autorizar no Swagger:** Clique em **"Authorize"** → cole `Bearer {seu-token}`
4. **Testar endpoints protegidos** diretamente na interface!

> 📖 Para mais detalhes, consulte [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)

---

## 📡 Endpoints Principais

### Base URL: `/api/v1`

#### 🔐 Autenticação
```http
POST   /api/v1/user              # Criar usuário
POST   /api/v1/auth              # Login (retorna JWT)
POST   /api/v1/auth/refresh      # Renovar token
```

#### 📦 Produtos
```http
GET    /api/v1/products          # Listar produtos
POST   /api/v1/products          # Criar produto
POST   /api/v1/products/import   # Importar produtos via CSV
```

#### 📋 Inventário
```http
GET    /api/v1/inventories                # Listar todos os inventários
GET    /api/v1/inventory?id={uuid}        # Buscar por ID
GET    /api/v1/inventory/suggested        # Sugestões inteligentes
GET    /api/v1/inventory/product?id={uuid}# Histórico por produto
POST   /api/v1/inventory                  # Criar manualmente
POST   /api/v1/inventory/import           # Importar via CSV
DELETE /api/v1/inventory?id={uuid}        # Deletar inventário
```

> 🔒 Endpoints protegidos requerem header: `Authorization: Bearer {token}`

---

## 🗄️ Modelo de Dados

```prisma
User
├── id (UUID)
├── name
├── email (unique)
├── password (hashed)
└── createdAt

Product
├── id (UUID)
├── code
├── description
├── unit
├── lastInventory
└── userId → User

Inventory
├── id (UUID)
├── name
├── createdAt
└── userId → User

InventoryItem
├── id (UUID)
├── inventoryId → Inventory
├── productId → Product
├── unitInput
├── stockExpected (Decimal)
├── stockCounted (Decimal)
└── difference (Decimal)
```

---

## 🔧 Configuração

### Scripts Disponíveis

```bash
npm run dev          # Inicia em desenvolvimento (hot-reload)
npm test             # Executa testes (a configurar)
```

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET_KEY` | Chave secreta para JWT | `sua_chave_super_secreta` |
| `EXPRESS_PORT` | Porta do servidor | `3000` |

---

## 🛡️ Segurança

- ✅ **JWT Authentication** - Tokens seguros para autenticação
- ✅ **bcrypt** - Hash de senhas com salt
- ✅ **Helmet** - Headers HTTP seguros
- ✅ **Rate Limiting** - Proteção contra abuso (100 req/5min)
- ✅ **CORS** - Configuração de origens permitidas
- ✅ **Validação Zod** - Validação rigorosa de entrada
- ✅ **SQL Injection Protection** - Prisma ORM com queries parametrizadas

---

## 📖 Documentação Adicional

- 📘 [CONTEXTO_PROJETO.md](./CONTEXTO_PROJETO.md) - Documentação técnica completa
- 📗 [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) - Guia de uso da API
- 🗂️ Schemas de validação: `src/modules/*/schemas/`

---

## 🧪 Testes

```bash
npm test
```

> ⚠️ **Em desenvolvimento:** Configuração de testes será adicionada em breve (Jest/Vitest).

---

## 🚀 Deploy

### Recomendações para Produção:

1. **Build TypeScript**
```bash
npx tsc
node dist/server.js
```

2. **Variáveis de Ambiente**
   - Use chaves JWT fortes (32+ caracteres)
   - Configure `DATABASE_URL` para produção
   - Desabilite logs sensíveis

3. **Banco de Dados**
```bash
npx prisma migrate deploy
```

4. **Plataformas Recomendadas**
   - Railway
   - Render
   - Heroku
   - DigitalOcean App Platform

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature
   ```bash
   git checkout -b feature/minha-feature
   ```
3. **Commit** suas mudanças
   ```bash
   git commit -m 'feat: adiciona nova feature'
   ```
4. **Push** para a branch
   ```bash
   git push origin feature/minha-feature
   ```
5. Abra um **Pull Request**

### Padrões de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `refactor:` Refatoração de código
- `test:` Adição de testes

---

## 📝 Licença

Este projeto está sob a licença **ISC**.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ para otimizar processos de inventário empresarial.

---

## 🌟 Mostre seu apoio

Se este projeto foi útil, considere dar uma ⭐ no repositório!


