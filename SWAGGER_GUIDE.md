# Guia de Uso do Swagger

## 📚 Documentação da API

A documentação interativa da API está disponível através do Swagger UI.

## 🚀 Como Acessar

Após iniciar o servidor, acesse:

```
http://localhost:3000/api-docs
```

(ou a porta configurada na variável `EXPRESS_PORT`)

## 🔐 Autenticação

A maioria dos endpoints requer autenticação via JWT. Para usar:

1. Primeiro, faça login através do endpoint `/api/v1/auth`
2. Copie o `token` retornado na resposta
3. No Swagger UI, clique no botão **"Authorize"** (cadeado no topo)
4. Cole o token no campo `bearerAuth` no formato: `Bearer <seu-token>`
5. Clique em **"Authorize"** e depois em **"Close"**

Agora você pode testar os endpoints protegidos diretamente pelo Swagger!

## 📝 Endpoints Documentados

### Autenticação
- `POST /api/v1/user` - Criar usuário
- `POST /api/v1/auth` - Autenticar (login)
- `POST /api/v1/auth/refresh` - Renovar token
- `GET /api/v1/auth/me` - Obter dados do usuário autenticado

### Produtos
- `GET /api/v1/products` - Listar produtos
- `POST /api/v1/products` - Criar produto
- `POST /api/v1/products/import` - Importar produtos via CSV

### Inventário
- `GET /api/v1/inventories` - Listar todos os inventários
- `GET /api/v1/inventory` - Buscar inventário por ID
- `GET /api/v1/inventory/suggested` - Obter sugestões de produtos
- `GET /api/v1/inventory/product` - Buscar histórico de inventários de um produto
- `POST /api/v1/inventory` - Criar inventário manualmente
- `POST /api/v1/inventory/import` - Criar inventário via CSV
- `DELETE /api/v1/inventory` - Deletar inventário

## 🧪 Testando Endpoints

1. Selecione um endpoint na lista
2. Clique em **"Try it out"**
3. Preencha os parâmetros necessários
4. Clique em **"Execute"**
5. Veja a resposta do servidor

## 📋 Formato de Respostas

Todas as respostas seguem padrões consistentes:
- **200/201**: Sucesso
- **400**: Dados inválidos
- **401**: Não autenticado
- **403**: Sem permissão
- **404**: Recurso não encontrado
- **409**: Conflito (ex: email já cadastrado)
- **500**: Erro interno do servidor

## 🔄 Atualizando a Documentação

A documentação é gerada automaticamente a partir das anotações JSDoc nos arquivos de rotas. Para adicionar ou atualizar documentação:

1. Edite o arquivo de rotas correspondente (`src/modules/*/routes.ts`)
2. Adicione ou atualize os comentários `@swagger` acima de cada rota
3. Reinicie o servidor para ver as mudanças

## 📖 Estrutura das Anotações

As anotações seguem o padrão OpenAPI 3.0. Exemplo:

```typescript
/**
 * @swagger
 * /api/v1/endpoint:
 *   get:
 *     summary: Descrição do endpoint
 *     tags: [Tag]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sucesso
 */
```

