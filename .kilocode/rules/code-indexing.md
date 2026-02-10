# Indexação de Código (Code Indexing)

## Status: ATIVO

O sistema de indexação de código está **ATIVO** neste projeto. Esta funcionalidade transforma a forma como o assistente descobre e navega pelo código.

---

## O que é Code Indexing

O Code Indexing é um sistema de busca semântica que analisa a codebase usando Tree-sitter para identificar blocos semânticos (funções, classes, métodos) e cria representações vetoriais armazenadas em um banco de dados Qdrant para busca rápida de similaridade.

---

## Ferramenta Principal: `codebase_search`

### Quando Usar (OBRIGATÓRIO)

**SUBSTITUI** as ferramentas tradicionais de busca de código nas seguintes situações:

| Situação | Ferramenta Antiga | Ferramenta Nova |
|----------|-------------------|-----------------|
| Encontrar implementações | `search_files` (regex) | `codebase_search` |
| Localizar padrões de código | `grep` / `search_files` | `codebase_search` |
| Descobrir funcionalidades | Ler arquivos manualmente | `codebase_search` |
| Entender arquitetura | Navegar diretórios | `codebase_search` |

### Fluxo de Descoberta de Código

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ANTES de qualquer exploração de código NÃO examinado     │
├─────────────────────────────────────────────────────────────┤
│ 2. Usar codebase_search com query semântica                 │
│    - Descrever o que você procura por SIGNIFICADO           │
│    - NÃO usar palavras-chave literais                       │
│    - Reutilizar a wording exata do usuário quando possível  │
├─────────────────────────────────────────────────────────────┤
│ 3. Analisar resultados retornados                           │
│ 4. Se necessário, ler arquivos específicos com read_file    │
└─────────────────────────────────────────────────────────────┘
```

### Exemplos de Queries Efetivas

```yaml
# ❌ Query ruim - muito literal
query: "function authenticate"

# ✅ Query boa - semântica
query: "lógica de autenticação de usuário e validação de credenciais"
```

```yaml
# ❌ Query ruim - palavras-chave soltas
query: "database connection"

# ✅ Query boa - descreve a intenção
query: "manipulação de conexão com banco de dados e pool de conexões"
```

```yaml
# ❌ Query ruim - sintaxe específica
query: "async function fetch"

# ✅ Query boa - funcionalidade
query: "funções assíncronas de busca de dados e requisições HTTP"
```

---

## Vantagens da Busca Semântica

### 1. Busca por Significado, Não por Sintaxe

Encontre código pelo **que ele faz**, não pela forma como foi escrito:
- "validação de formulário" encontra `validateForm()`, `checkInput()`, `verifyData()`
- "tratamento de erros" encontra `catch`, `try/catch`, `handleError`, `onError`

### 2. Compreensão Aprimorada da Codebase

O assistente consegue entender e interagir melhor com a base de código:
- Descobre dependências implícitas
- Identifica padrões de arquitetura
- Localiza código relacionado mesmo em arquivos diferentes

### 3. Descoberta Entre Projetos

Pesquise em **todos os arquivos** do projeto, não apenas nos que estão abertos:
- Busca global sem necessidade de navegar manualmente
- Encontra código em diretórios não óbvios
- Descobre implementações similares

### 4. Reconhecimento de Padrões

Localize implementações e padrões de código semelhantes:
- "componentes React com estado local"
- "hooks customizados de autenticação"
- "middleware de proteção de rotas"

---

## Diretrizes de Uso

### Regra de Ouro

**CRITICAL**: Para QUALQUER exploração de código que você ainda não examinou nesta conversa, você DEVE usar `codebase_search` PRIMEIRO antes de qualquer outra ferramenta de busca ou exploração de arquivos.

### Quando NÃO Usar

- Arquivos específicos cujo caminho você já conhece exatamente
- Código que você já examinou na conversa atual
- Arquivos de configuração com nomes conhecidos (`package.json`, `tsconfig.json`)

### Parâmetros da Ferramenta

```typescript
interface CodebaseSearchParams {
  query: string;      // Query semântica descrevendo o que você procura
  path?: string;      // Diretório específico (opcional, default: workspace inteiro)
}
```

### Exemplos Práticos de Uso

```yaml
# Encontrar lógica de autenticação
codebase_search:
  query: "User login and password hashing"
  path: "src/auth"
```

```yaml
# Descobrir sistema de memória
codebase_search:
  query: "Memory chunking and embedding storage"
  path: null  # Busca em todo workspace
```

```yaml
# Localizar componentes de UI
codebase_search:
  query: "Button component with loading state"
  path: "src/components"
```

---

## Integração com Outras Regras

### Com `best-practices.md`

Ao seguir a regra "Ler TODOS os arquivos relacionados à tarefa":
1. **PRIMEIRO**: Usar `codebase_search` para descobrir arquivos relacionados
2. **DEPOIS**: Usar `read_file` nos arquivos específicos identificados

### Com `task-workflow.md`

Ao iniciar uma nova tarefa:
1. Usar `codebase_search` para entender o contexto do código existente
2. Identificar dependências e padrões antes de planejar ações

### Com `communication.md`

Ao explicar o que será feito:
1. Mencionar que está usando busca semântica
2. Descrever a query usada e os resultados encontrados

---

## Checklist de Uso

- [ ] Usei `codebase_search` ANTES de `search_files` ou `grep`
- [ ] Minha query é semântica (descreve significado, não sintaxe)
- [ ] Reutilizei a wording do usuário quando aplicável
- [ ] Limitei o escopo com `path` quando apropriado
- [ ] Analisei os resultados antes de ler arquivos específicos

---

## Armazenamento

Os vetores de indexação são armazenados em `globalStorageUri/vector/` e **NÃO** devem ser versionados no Git (já incluído no `.gitignore`).
