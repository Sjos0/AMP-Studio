# Arquitetura de Memória Persistente - OpenClaw

## Visão Geral

Este documento descreve a arquitetura de memória persistente inspirada no **OpenClaw**, adaptada para o **AMP Studio** com Supabase como backend.

A filosofia central do OpenClaw é simples e poderosa:
> **"Trate o contexto LLM como um cache e a memória em disco como a verdade fonte."**

---

## Princípios Fundamentais

### 1. File-First Philosophy
- Markdown como fonte de verdade
- Legível por humanos
- Versionável com Git
- Sem vendor lock-in

### 2. Externalized Memory
- Memória fora do contexto da janela de contexto
- Persistência automática
- Recuperação inteligente

### 3. Virtual Memory for Cognition
- RAM = contexto limitado (cache)
- Disk = memória ilimitada (persistente)
- Paging = o que volta para o contexto

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    AMP Studio App                           │
├─────────────────────────────────────────────────────────────┤
│                     React Components                        │
│              (Chat, Sidebar, InputArea)                     │
├─────────────────────────────────────────────────────────────┤
│                      Hooks Layer                            │
│                   useMemory(), useSimpleMemory()             │
├─────────────────────────────────────────────────────────────┤
│                    Memory Service                           │
│     MemoryService - Orquestrador Principal                  │
├───────────────┬─────────────────┬───────────────────────────┤
│   Chunking    │   Embeddings    │      Search              │
│   (chunking)  │  (embeddings)   │     (hybrid search)      │
├───────────────┴─────────────────┴───────────────────────────┤
│                  Supabase Backend                            │
│         PostgreSQL + pgvector (futuro)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Camadas de Memória

### 1. Memória Efêmera (Daily Logs)
**Tabela**: `memory_ephemeral`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| user_id | UUID | Usuário dono |
| date | DATE | Data do log |
| title | TEXT | Título opcional |
| content | TEXT | Conteúdo markdown |
| chunk_count | INTEGER | Nº de chunks indexados |

**Uso**: Contexto do dia-a-dia, decisões recentes, status atual.

### 2. Memória Durável (Curated Knowledge)
**Tabela**: `memory_durable`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| user_id | UUID | Usuário dono |
| category | TEXT | preference/goal/decision/fact |
| title | TEXT | Título da memória |
| content | TEXT | Conteúdo curado |
| importance_score | REAL | 0-1, relevância |
| access_count | INTEGER | Nº de acessos |
| embedding | VECTOR(768) | Embedding Gemini |

**Uso**: Preferências do usuário, fatos importantes, decisões duradouras.

### 3. Memória de Sessão (Transcripts)
**Tabela**: `memory_sessions`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| user_id | UUID | Usuário dono |
| session_slug | TEXT | Slug gerado pelo LLM |
| session_date | DATE | Data da sessão |
| title | TEXT | Título opcional |
| content | TEXT | Transcrição completa |
| message_count | INTEGER | Nº de mensagens |
| token_count | INTEGER | Estimativa de tokens |

**Uso**: Histórico de conversas, contexto de sessões passadas.

---

## Sistema de Indexação

### Algoritmo de Chunking

Baseado no OpenClaw com sliding window:

```
┌────────────────────────────────────────────────────────────┐
│                 Original Content                            │
│  Linha 1: # Título                                        │
│  Linha 2: Conteúdo...                                    │
│  Linha 100: Informação importante...                      │
│  Linha 200: Mais conteúdo...                              │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                    Chunk 1 (0-350 chars)                  │
│  start_line: 1, end_line: 45                              │
│  hash: sha256(...)                                        │
└────────────────────────────────────────────────────────────┘
                            │ Overlap ~80 tokens
                            ▼
┌────────────────────────────────────────────────────────────┐
│                    Chunk 2 (0-350 chars)                  │
│  start_line: 30, end_line: 80                             │
│  hash: sha256(...)                                        │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                    Chunk 3 (0-350 chars)                  │
│  start_line: 65, end_line: 120                            │
│  hash: sha256(...)                                        │
└────────────────────────────────────────────────────────────┘
```

**Configuração**:
- Target: ~400 tokens (1600 chars)
- Overlap: ~80 tokens (320 chars)
- Line-aware: preserva números de linha

### Armazenamento de Chunks
**Tabela**: `memory_chunks`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador |
| file_id | UUID | Referência ao arquivo |
| chunk_hash | TEXT | SHA-256 do conteúdo |
| chunk_index | INTEGER | Posição no arquivo |
| start_line | INTEGER | Linha inicial |
| end_line | INTEGER | Linha final |
| content | TEXT | Conteúdo do chunk |
| embedding | VECTOR(768) | Vetor semântico |
| vector_score | REAL | Score da busca vetorial |
| bm25_score | REAL | Score FTS (futuro) |

---

## Sistema de Embeddings

### Provedores Suportados

| Provedor | Modelo | Dimensões | Custo |
|----------|--------|------------|-------|
| Gemini | text-embedding-004 | 768 | Grátis |
| OpenAI | text-embedding-3-small | 1536 | $0.00002/1K |
| Local | ggml-org/embeddinggemma | 300M | Offline |

### Estratégia de Cache

```
┌─────────────────────────────────────────────────────────────┐
│                    Embedding Request                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              1. Check Local Cache (Memory)                   │
│                  hash: sha256(text)                         │
└─────────────────────────────────────────────────────────────┘
                            │
              HIT ──────────┴────────── MISS
                │                           │
                ▼                           ▼
┌─────────────────────────┐   ┌─────────────────────────────┐
│  Return Cached Vector   │   │  2. Check Supabase Cache    │
└─────────────────────────┘   └─────────────────────────────┘
                                        │
                          HIT ──────────┴────────── MISS
                            │                           │
                            ▼                           ▼
                  ┌─────────────────┐   ┌─────────────────────────┐
                  │ Return Cached   │   │  3. Call Embedding API  │
                  └─────────────────┘   └─────────────────────────┘
                                                    │
                                                    ▼
                                          ┌─────────────────┐
                                          │ Save to Caches  │
                                          │ (Local + Remote)│
                                          └─────────────────┘
```

---

## Busca Híbrida (BM25 + Vector)

### Por que híbrida?

| Tipo | Pontos Fortes | Pontos Fracos |
|------|---------------|---------------|
| **Vector** | Semântica, "significa o mesmo" | Fraco com IDs, símbolos exatos |
| **BM25** | Exact matches, palavras-chave | Fraco com paráfrases |

### Implementação

```typescript
// Pesos padrão (configurável)
const VECTOR_WEIGHT = 0.7;  // 70% semântico
const BM25_WEIGHT = 0.3;    // 30% textual

// Merge de resultados
finalScore = vectorWeight * vectorScore + textWeight * textScore;
```

### Fluxo de Busca

```
1. Gera embedding da query (Gemini)
2. Busca top-K chunks por similaridade vetorial
3. Busca top-K chunks por BM25 (FTS5)
4. Union por chunk_id
5. Calcula score ponderado
6. Retorna top-N snippets
```

---

## Integração com React

### Hook Principal

```typescript
import { useMemory } from '@/lib/memory';

function ChatComponent({ userId }: { userId: UUID }) {
  const { 
    isLoading, 
    error, 
    search, 
    createDurableMemory,
    recentMemories 
  } = useMemory(userId);

  // Buscar memórias relevantes
  const results = await search("minhas preferências de UI");

  // Salvar nova memória
  await createDurableMemory({
    userId,
    category: 'preference',
    title: 'Tema escuro',
    content: 'Prefiro usar tema escuro em todas as aplicações'
  });
}
```

---

## Configuração de Variáveis de Ambiente

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Gemini (Embeddings)
GEMINI_API_KEY=xxx

# OpenAI (Opcional)
OPENAI_API_KEY=xxx
```

---

## Próximos Passos

1. **pgvector**: Habilitar extensão vector no Supabase para buscas vetoriais nativas
2. **RAG Retrieval**: Implementar retrieve automático antes de respostas LLM
3. **Memory Flush**: Auto-save antes de compaction de contexto
4. **Session Indexing**: Indexação automática de transcrições
5. **Citations**: Incluir referências às memórias nas respostas

---

## Referências

- [OpenClaw Memory Documentation](https://docs.openclaw.ai/concepts/memory)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Mem0 OpenClaw Integration](https://docs.mem0.ai/integrations/openclaw)
