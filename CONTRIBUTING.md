# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o projeto **Inventário MN**! Este documento fornece diretrizes para contribuir com o projeto.

---

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Features](#sugerindo-features)

---

## 📜 Código de Conduta

Este projeto adere a um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e colaborativo.

---

## 🚀 Como Contribuir

### 1. Fork o Projeto

```bash
# Clone seu fork
git clone https://github.com/PedroStaRosa/inventario-mn-api.git
cd inventario-mn-api
```

### 2. Crie uma Branch

```bash
# Crie uma branch para sua feature/fix
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-fix
```

### 3. Faça suas Mudanças

- Escreva código limpo e bem documentado
- Siga os padrões de código do projeto
- Adicione testes quando aplicável
- Atualize a documentação se necessário

### 4. Commit suas Mudanças

```bash
git add .
git commit -m "feat: adiciona nova feature"
```

### 5. Push para seu Fork

```bash
git push origin feature/minha-feature
```

### 6. Abra um Pull Request

- Acesse o repositório original no GitHub
- Clique em "New Pull Request"
- Descreva suas mudanças detalhadamente

---

## 🛠️ Configuração do Ambiente

### Requisitos

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
# Edite o .env com suas configurações

# Setup do banco de dados
npx prisma generate
npx prisma migrate dev

# Iniciar servidor
npm run dev
```

---

## 📝 Padrões de Código

### TypeScript

- Use tipos explícitos sempre que possível
- Evite `any`, prefira `unknown` quando necessário
- Use interfaces para objetos complexos

### Organização de Arquivos

```
src/modules/{modulo}/
├── controllers/
├── services/
├── schemas/
├── routes.ts
└── types/
```

### Nomenclatura

- **Arquivos**: PascalCase para classes/componentes (`UserService.ts`)
- **Variáveis**: camelCase (`userId`, `productList`)
- **Constantes**: UPPER_SNAKE_CASE (`JWT_SECRET_KEY`)
- **Tipos/Interfaces**: PascalCase (`UserType`, `ProductInterface`)

### Imports

```typescript
// 1. Bibliotecas externas
import express from "express";
import { z } from "zod";

// 2. Módulos internos
import { prisma } from "../../prisma";
import { isAuthenticated } from "../../middlewares/isAuthenticated";

// 3. Types/Interfaces
import type { UserType } from "./types/userType";
```

---

## 💬 Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/).

### Formato

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta o código)
- `refactor`: Refatoração de código
- `test`: Adição ou modificação de testes
- `chore`: Tarefas de manutenção
- `perf`: Melhoria de performance

### Exemplos

```bash
feat(products): adiciona endpoint de busca por código
fix(auth): corrige validação de token expirado
docs(readme): atualiza instruções de instalação
refactor(inventory): simplifica lógica de cálculo de diferença
test(user): adiciona testes para criação de usuário
```

---

## 🔄 Pull Requests

### Checklist

Antes de enviar um PR, certifique-se de que:

- [ ] O código compila sem erros
- [ ] Não há erros de lint/TypeScript
- [ ] Testes passam (quando aplicável)
- [ ] Documentação foi atualizada
- [ ] Commits seguem o padrão Conventional Commits
- [ ] Branch está atualizada com `main`

### Descrição do PR

Use o template:

```markdown
## Descrição
Breve descrição das mudanças.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. Passo 3

## Screenshots (se aplicável)

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Documentação atualizada
- [ ] Testes adicionados/atualizados
```

---

## 🐛 Reportando Bugs

### Antes de Reportar

- Verifique se o bug já foi reportado nas [Issues](https://github.com/PedroStaRosa/inventario-mn-api/issues)
- Teste com a última versão do código

### Como Reportar

Abra uma issue com:

- **Título claro**: "Bug: Erro ao criar inventário via CSV"
- **Descrição**: O que aconteceu e o que era esperado
- **Passos para reproduzir**: Lista detalhada de passos
- **Ambiente**: SO, Node.js version, PostgreSQL version
- **Logs/Screenshots**: Se aplicável

**Template:**

```markdown
## Descrição do Bug
Breve descrição do problema.

## Passos para Reproduzir
1. Passo 1
2. Passo 2
3. Passo 3

## Comportamento Esperado
O que deveria acontecer.

## Comportamento Atual
O que realmente aconteceu.

## Ambiente
- OS: [Windows/Linux/Mac]
- Node.js: [versão]
- PostgreSQL: [versão]

## Logs/Screenshots
```

---

## 💡 Sugerindo Features

### Antes de Sugerir

- Verifique se a feature já foi sugerida
- Considere se a feature se alinha com o escopo do projeto

### Como Sugerir

Abra uma issue com:

- **Título claro**: "Feature: Adicionar exportação de relatórios em PDF"
- **Problema que resolve**: Qual necessidade a feature atende
- **Solução proposta**: Como você imagina que funcionaria
- **Alternativas**: Outras abordagens consideradas

**Template:**

```markdown
## Descrição da Feature
O que você gostaria de adicionar.

## Problema que Resolve
Qual necessidade ou problema esta feature atende.

## Solução Proposta
Como você imagina que funcionaria.

## Alternativas Consideradas
Outras abordagens que você pensou.

## Informações Adicionais
Screenshots, mockups, exemplos, etc.
```

---

## 🎯 Áreas que Precisam de Ajuda

Contribuições são especialmente bem-vindas em:

- ✅ Testes automatizados (Jest/Vitest)
- ✅ Documentação e exemplos
- ✅ Otimização de performance
- ✅ Correção de bugs
- ✅ Melhorias de UI/UX (se aplicável)
- ✅ Internacionalização (i18n)

---

## 📞 Contato

Se tiver dúvidas sobre como contribuir:

- Abra uma [Discussion](https://github.com/PedroStaRosa/inventario-mn-api/discussions)
- Comente em uma issue existente

---

**Obrigado por contribuir! 🎉**

