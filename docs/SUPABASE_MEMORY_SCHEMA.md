# Documentação do Schema de Memória Persistente - AMP Studio

## Visão Geral

Este documento descreve o schema do banco de dados Supabase para o sistema de memória persistente do AMP Studio, baseado na arquitetura **OpenClaw** e adaptado para uso com embeddings do **Gemini text-embedding-004** (768 dimensões).

### Referências

- [OpenClaw Memory System](https://github.com/openclaw/openclaw)
- [Deep Dive: OpenClaw Memory](https://snowan.gitbook.io/study-notes/ai-blogs/openclaw-memory-system-deep-dive)
- [Gemini Embeddings API](https://ai.google.dev/docs/embeddings)

---

## Projeto Supabase

- **ID**: `mibdbwmmxnhtyrywoarw`
- **Nome**: AMP Studio
- **Região**: sa-east-1 (São Paulo)
- **URL do Banco**: `db.mibdbwmmxnhtyrywoarw.supabase.co`

---

## Estrutura das Tabelas

### 1. `memory_files`

**Propósito**: Rastreia arquivos de memória indexados. Equivalente ao schema `files` do OpenClaw.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK - Identificador único |
| `path` | TEXT | Caminho do arquivo (ex: "memory/2026-02-06.md") |
| `source` | TEXT | Tipo: 'memory', 'durable', 'session' |
| `file_hash` | TEXT | SHA-256 do conteúdo (delta tracking) |
| `file_size_bytes` | BIGINT | Tamanho em bytes |
| `line_count` | INTEGER | Número de linhas |
| `chunk_count` | INTEGER | Quantidade de chunks indexados |
| `embedding_model` | TEXT | Modelo usado (padrão: 'gemini-embedding-001') |
| `last_indexed_at` | TIMESTAMP | Última indexação |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última modificação |

**Índices**:
- `idx_memory_files_source` - Por tipo de fonte
- `idx_memory_files_path` - Por caminho

---

### 2. `memory_chunks`

**Propósito**: Armazena chunks de conteúdo com embeddings. Chunk size: ~400 tokens, overlap: 80 tokens.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK - Identificador único |
| `file_id` | UUID | FK - Referência ao arquivo |
| `chunk_hash` | TEXT | SHA-256 do conteúdo do chunk |
| `chunk_index` | INTEGER | Posição no arquivo |
| `start_line` | INTEGER | Linha inicial |
| `end_line` | INTEGER | Linha final |
| `content` | TEXT | Conteúdo do chunk |
| `content_preview` | TEXT | Primeiros 200 chars |
| `vector_score` | REAL | Similaridade semântica |
| `bm25_score` | REAL | Score BM25 |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última modificação |

**Índices**:
- `idx_memory_chunks_file` - Por arquivo
- `idx_memory_chunks_hash` - Por hash (cache lookup)

---

### 3. `memory_embeddings_cache`

**Propósito**: Cache de embeddings para evitar re-embedding de conteúdo duplicado.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK - Identificador único |
| `provider` | TEXT | 'gemini', 'openai', 'local' |
| `model` | TEXT | Modelo de embedding |
| `content_hash` | TEXT | SHA-256 do conteúdo original |
| `dimensions` | INTEGER | Dimensões (768 para Gemini) |
| `token_count` | INTEGER | Tokens do conteúdo |
| `access_count` | INTEGER | Vezes acessado |
| `last_accessed_at` | TIMESTAMP | Último acesso |
| `created_at` | TIMESTAMP | Data de criação |

**Índice**: `idx_memory_cache_hash` - Lookup rápido por hash

---

### 4. `memory_ephemeral`

**Propósito**: Memória efêmera - logs diários. Equivalente ao `memory/YYYY-MM-DD.md` do OpenClaw.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK - Identificador único |
| `user_id` | UUID | Usuário dono |
| `date` | DATE | Data do log (YYYY-MM-DD) |
| `title` | TEXT | Título opcional |
| `content` | TEXT | Conteúdo do log |
| `chunk_count` | INTEGER | Chunks indexados |
| `embedding_model` | TEXT | Modelo de embedding |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última modificação |

**Constraint**: `UNIQUE(user_id, date)`

---

### 5. `memory_durable`

**Propósito**: Memória durável - conhecimento curado. Equivalente ao `MEMORY.md` do OpenClaw.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK - Identificador único |
| `user_id` | UUID | Usuário dono |
| `category` | TEXT | 'preferences', 'goals', 'decisions', 'facts' |
| `title` | TEXT | Título/tópico |
| `content` | TEXT | Conteúdo da memória |
| `importance_score` | REAL | 0-1: importância |
| `access_count` | INTEGER | Vezes acessada |
| `last_accessed_at` | TIMESTAMP | Último acesso |
| `embedding_model` | TEXT | Modelo de embedding |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última modificação |

**Categorias**: preferences, goals, decisions, facts

---

### 6. `memory_sessions`

**Propósito**: Memória de sessões - transcrições de conversas. Equivalente ao `sessions/*.md` do OpenClaw.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK - Identificador único |
| `user_id` | UUID | Usuário dono |
| `session_slug` | TEXT | Slug (ex: "2026-02-06-memory-research") |
| `session_date` | DATE | Data da sessão |
| `title` | TEXT | Título opcional |
| `content` | TEXT | Transcrição completa |
| `message_count` | INTEGER | Número de mensagens |
| `token_count` | INTEGER | Estimativa de tokens |
| `chunk_count` | INTEGER | Chunks indexados |
| `embedding_model` | TEXT | Modelo de embedding |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última modificação |

**Constraint**: `UNIQUE(user_id, session_slug)`

---

### 7. `memory_search_logs`

**Propósito**: Logs de busca para analytics e métricas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK - Identificador único |
| `user_id` | UUID | Usuário |
| `query` | TEXT | Query executada |
| `results_count` | INTEGER | Resultados retornados |
| `avg_relevance_score` | REAL | Score médio de relevância |
| `search_type` | TEXT | 'vector', 'bm25', 'hybrid' |
| `latency_ms` | INTEGER | Latência em ms |
| `provider` | TEXT | Provider usado |
| `created_at` | TIMESTAMP | Data da busca |

---

### 8. `memory_metrics`

**Propósito**: Métricas agregadas do sistema de memória.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK - Identificador único |
| `user_id` | UUID | Usuário |
| `metric_date` | DATE | Data das métricas |
| `total_chunks` | INTEGER | Total de chunks |
| `total_files` | INTEGER | Total de arquivos |
| `total_sessions` | INTEGER | Total de sessões |
| `ephemeral_size_bytes` | BIGINT | Tamanho memória efêmera |
| `durable_size_bytes` | BIGINT | Tamanho memória durável |
| `session_size_bytes` | BIGINT | Tamanho sessões |
| `cache_hits` | INTEGER | Cache hits |
| `cache_misses` | INTEGER | Cache misses |
| `avg_search_latency_ms` | REAL | Latência média |
| `avg_indexing_time_ms` | REAL | Tempo médio indexação |

**Constraint**: `UNIQUE(user_id, metric_date)`

---

### 9. `memory_context_state`

**Propósito**: Estado do contexto atual para cada sessão.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK - Identificador único |
| `user_id` | UUID | Usuário |
| `session_id` | UUID | Sessão ativa |
| `current_tokens` | INTEGER | Tokens atuais no contexto |
| `context_window_limit` | INTEGER | Limite da janela |
| `compaction_threshold` | INTEGER | Threshold para compactação |
| `last_compaction_at` | TIMESTAMP | Última compactação |
| `memory_flush_count` | INTEGER | Flushes realizados |

---

## Constantes do Sistema

```sql
-- Chunk configuration (equivalente ao OpenClaw)
TARGET_CHUNK_TOKENS = 400;      -- Tamanho alvo por chunk
CHUNK_OVERLAP_TOKENS = 80;       -- Overlap entre chunks
VECTOR_WEIGHT = 0.7;            -- Peso vector search
BM25_WEIGHT = 0.3;              -- Peso BM25
SNIPPET_MAX_CHARS = 700;        -- Tamanho do snippet
BATCH_MAX_TOKENS = 8000;        -- Tokens por batch
EMBEDDING_DIMS = 768;           -- Dimensões Gemini
```

---

## Como Aplicar a Migração

### Via Dashboard Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto "AMP Studio"
3. Vá em **SQL Editor**
4. Copie o conteúdo de `supabase/migrations/20260206_create_memory_system.sql`
5. Execute o SQL

### Via CLI

```bash
supabase db push --project-ref mibdbwmmxnhtyrywoarw
```

---

## Embeddings Gemini

### Modelo Usado

- **Nome**: `text-embedding-004`
- **Dimensões**: 768
- **Provider**: Google Gemini API
- **Documentação**: https://ai.google.dev/docs/embeddings

### Exemplo de Geração

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}
```

---

## Métricas do Sistema

### Performance Típica

| Métrica | Valor Típico |
|---------|--------------|
| Latência de busca | < 100ms |
| Tamanho por 1K chunks | ~5KB (embeddings) |
| Cache hit rate alvo | > 50% |
| Tokens por batch | 8000 |

---

## Segurança (RLS)

Todas as tabelas têm **Row Level Security** habilitado:

- Usuários só acessam suas próprias memórias
- Policies configuradas para SELECT, INSERT, UPDATE, DELETE

---

## Próximos Passos

1. ✅ Criar migração SQL
2. ⏳ Aplicar migração no Supabase
3. ⏳ Configurar variáveis de ambiente
4. ⏳ Implementar serviço de embeddings
5. ⏳ Criar API de busca semântica
6. ⏳ Integrar com frontend

---

*Documento gerado em: 2026-02-06*
*Baseado em: OpenClaw Memory System (commit f99e3dd)*
