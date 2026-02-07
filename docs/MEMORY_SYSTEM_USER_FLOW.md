# Fluxo de Uso: Sistema de Memória AMP Studio

## Perguntas Frequentes

### 1. Como a IA salva uma memória?

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FLUXO DE SALVAMENTO DE MEMÓRIA                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. USUÁRIO CONVERSA COM IA                                          │
│     ┌─────────────────────────────────────────────────────────────┐  │
│     │  Usuário: "Gosto de usar tema escuro em todas as apps"     │  │
│     └─────────────────────────────────────────────────────────────┘  │
│                                    │                                 │
│                                    ▼                                 │
│  2. LLM DETECTA PATTERN DE MEMÓRIA                                  │
│     ┌─────────────────────────────────────────────────────────────┐  │
│     │  Instrução no System Prompt:                               │  │
│     │  - "Prefs detected → save to memory"                       │  │
│     └─────────────────────────────────────────────────────────────┘  │
│                                    │                                 │
│                                    ▼                                 │
│  3. CHAMADA AO MEMORY SERVICE                                        │
│     ┌─────────────────────────────────────────────────────────────┐  │
│     │  await createDurableMemory({                                │  │
│     │    userId: 'uuid-do-usuario',                              │  │
│     │    category: 'preference',  // preference/goal/decision    │  │
│     │    title: 'Tema escuro',                                   │  │
│     │    content: 'Prefiro usar tema escuro em todas as apps'    │  │
│     │  });                                                       │  │
│     └─────────────────────────────────────────────────────────────┘  │
│                                    │                                 │
│                                    ▼                                 │
│  4. PROCESSAMENTO                                                    │
│     ┌─────────────────────────────────────────────────────────────┐  │
│     │  A) Gera embedding (Gemini text-embedding-004)            │  │
│     │  B) Verifica cache (SHA-256 hash)                        │  │
│     │  C) Salva na tabela memory_durable                        │  │
│     │  D) Trigger atualiza índices (BM25 + vector)              │  │
│     └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Sim, o System Prompt precisa instruir a IA** a detectar e salvar memórias. Exemplo:

```system_prompt
## Memória Persistente

O usuário tem um sistema de memória que persiste entre sessões.
Quando você detectar:
- Preferências do usuário (ex: "eu prefiro...")
- Fatos importantes (ex: "meu nome é...")
- Decisões tomadas (ex: "vamos usar React...")

Você DEVE chamar a função saveMemory antes de responder.

Formato JSON:
{"type": "save_memory", "category": "preference|goal|decision|fact", "content": "..."}
```

---

### 2. Como a IA recupera memórias?

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FLUXO DE RECUPERAÇÃO DE MEMÓRIA                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. USUÁRIO FAZ PERGUNTA                                            │
│     ┌─────────────────────────────────────────────────────────────┐  │
│     │  Usuário: "Qual tema eu uso nas minhas apps?"             │  │
│     └─────────────────────────────────────────────────────────────┘  │
│                                    │                                 │
│                                    ▼                                 │
│  2. EMBEDDING DA PERGUNTA                                           │
│     ┌─────────────────────────────────────────────────────────────┐  │
│     │  await getEmbedding("Qual tema eu uso nas minhas apps?")  │  │
│     │  → [0.12, -0.34, 0.78, ...] (768 dimensões)               │  │
│     └─────────────────────────────────────────────────────────────┘  │
│                                    │                                 │
│                                    ▼                                 │
│  3. BUSCA HÍBRIDA (pgvector + BM25)                                  │
│     ┌─────────────────────────────────────────────────────────────┐  │
│     │  hybrid_search(                                             │  │
│     │    query_embedding: embedding,                             │  │
│     │    query_text: "tema apps",                                 │  │
│     │    match_count: 5                                          │  │
│     │  )                                                          │  │
│     └─────────────────────────────────────────────────────────────┘  │
│                                    │                                 │
│                                    ▼                                 │
│  4. RESULTADOS ORDENADOS                                            │
│     ┌─────────────────────────────────────────────────────────────┐  │
│     │  1. "Prefiro usar tema escuro em todas as apps" (score: 0.92)│  │
│     │  2. "Dark mode é melhor para os olhos" (score: 0.67)         │  │
│     │  3. "Nunca uso temas claros" (score: 0.54)                    │  │
│     └─────────────────────────────────────────────────────────────┘  │
│                                    │                                 │
│                                    ▼                                 │
│  5. CONTEXT AUGMENTATION                                            │
│     ┌─────────────────────────────────────────────────────────────┐  │
│     │  Contexto:                                                  │  │
│     │  "[MEMORY] Prefiro usar tema escuro em todas as apps"     │  │
│     └─────────────────────────────────────────────────────────────┘  │
│                                    │                                 │
│                                    ▼                                 │
│  6. RESPOSTA PERSONALIZADA                                          │
│     ┌─────────────────────────────────────────────────────────────┐  │
│     │  "Você mencionou que prefere usar tema escuro em todas     │  │
│     │   as suas aplicações!"                                     │  │
│     └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3. Precisa de System Prompt para recuperar?

**Não necessariamente**, mas é **recomendado**:

```system_prompt
## Recuperação Automática de Memória

Antes de responder perguntas sobre:
- Preferências do usuário → Consulta memória
- Histórias passadas → Consulta memória
- Decisões anteriores → Consulta memória
- Fatos sobre o usuário → Consulta memória

O sistema automaticamente buscará memórias relevantes.
Você receberá contexto adicional marcado com [MEMORY].
```

**Fluxo alternativo** (sem instrução explícita):

```typescript
// No componente Chat, antes de cada resposta:
const memories = await memoryService.search(
  userId,
  lastUserMessage,
  { limit: 5 }
);

// Adiciona ao contexto automaticamente
const context = memories
  .map(m => `[MEMORY] ${m.content}`)
  .join('\n\n');
```

---

### 4. Quando usar cada camada de memória?

```
┌─────────────────────────────────────────────────────────────────────┐
│                      QUANDO USAR CADA CAMADA                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │
│  │   EPHEMERAL     │  │     DURABLE     │  │     SESSION     │       │
│  │   (Diário)      │  │   (Curada)      │  │ (Transcrições)  │       │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘       │
│           │                   │                   │                 │
│           ▼                   ▼                   ▼                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │
│  │ Decisões do dia │  │ Preferências    │  │ Contexto de     │       │
│  │ Anotações temp  │  │ Facts          │  │ conversas       │       │
│  │ Status atual    │  │ Goals          │  │ passadas        │       │
│  │ Logs de trabalho│  │ Decisões       │  │ Histórico       │       │
│  │                 │  │ permanentes     │  │                 │       │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘       │
│           │                   │                   │                 │
│           ▼                   ▼                   ▼                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │
│  │ AUTO-DELETE     │  │ PERMANENTE      │  │ INDEXADO        │       │
│  │ após 30 dias    │  │ até manual      │  │ searchable      │       │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 5. O que acontece quando o contexto está cheio?

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FLUXO DE MEMORY FLUSH                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. DETECÇÃO DE CONTEXTO CHEIO                                       │
│     ┌─────────────────────────────────────────────────────────────┐  │
│     │  current_tokens: 12000 / 16000 limit                       │  │
│     │  compaction_threshold: 80%                                  │  │
│     │  → Necessário liberar contexto                             │  │
│     └─────────────────────────────────────────────────────────────┘  │
│                                    │                                 │
│                                    ▼                                 │
│  2. MEMORY FLUSH AUTOMÁTICO                                         │
│     ┌─────────────────────────────────────────────────────────────┐  │
│     │  await memory_flush(user_id, session_id)                   │  │
│     │                                                              │  │
│     │  Faz:                                                      │  │
│     │  1. Salva transcrição da sessão em memory_sessions          │  │
│     │  2. Indexa todos os chunks da sessão                       │  │
│     │  3. Atualiza memory_context_state                          │  │
│     └─────────────────────────────────────────────────────────────┘  │
│                                    │                                 │
│                                    ▼                                 │
│  3. COMPACTAÇÃO (se necessário)                                      │
│     ┌─────────────────────────────────────────────────────────────┐  │
│     │  await compact_memory(user_id, importance_threshold)       │  │
│     │                                                              │  │
│     │  Moves memórias menos importantes para archive             │  │
│     │  Mantém: high importance_score (> 0.7)                      │  │
│     │  Arquiva: low importance_score (< 0.3)                      │  │
│     └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 6. FAQ: Perguntas Técnicas

#### P: "A IA precisa saber que existe um sistema de memória?"

**R:** Depende da abordagem:

| Abordagem | System Prompt | Descrição |
|-----------|---------------|-----------|
| **Explícita** | Instruída a salvar/consultar | Mais controlável |
| **Transparente** | automática via código | Mais simples |

```typescript
// Abordagem Transparente (Recomendada)
async function chat(userId: UUID, message: string): Promise<string> {
  // 1. Recupera memórias automaticamente
  const memories = await memoryService.search(userId, message);
  
  // 2. Monta contexto com memórias
  const context = buildContext(message, memories);
  
  // 3. Chama LLM
  return llm.complete(context);
}
```

#### P: "Onde fica o embedding da pergunta?"

**R:** Gerado em tempo real:

```typescript
async function search(userId: UUID, query: string) {
  // Sempre gera embedding da query atual
  const queryEmbedding = await getEmbedding(query);
  
  // Busca no banco
  const results = await supabase.rpc('hybrid_search', {
    query_embedding: queryEmbedding,
    query_text: query,
    user_id: userId
  });
  
  return results;
}
```

#### P: "Como funciona a busca híbrida internamente?"

```sql
-- Dentro da função hybrid_search (PostgreSQL)
SELECT 
  chunk_id,
  content,
  -- Score vetorial (70%)
  (1 - (embedding <=> query_embedding)) * 0.7 AS vector_score,
  -- Score BM25 (30%)
  ts_rank_cd(content_tsvector, query_ts) * 0.3 AS bm25_score,
  -- Score combinado
  ((1 - (embedding <=> query_embedding)) * 0.7) + 
  (ts_rank_cd(content_tsvector, query_ts) * 0.3) AS final_score
FROM memory_chunks
WHERE user_id = user_id_param
ORDER BY final_score DESC
LIMIT match_count;
```

#### P: "Citations são obrigatórias?"

**R:** Não, mas recomendadas para debug:

```typescript
async function chatWithCitations(userId: UUID, message: string) {
  const { results, citations } = await memoryService.searchWithCitations(
    userId, 
    message
  );
  
  // Citations permitem rastrear qual memória foi usada
  console.log('Memórias utilizadas:', citations);
  // [{ chunk_id: '...', response_id: '...', cited_at: '...' }]
}
```

---

### 7. Exemplo Completo de Integração

```typescript
// src/lib/memory/useMemory.ts
import { useMemory } from '@/lib/memory';

function AIAssistant() {
  const { 
    search, 
    createDurableMemory, 
    createSessionMemory,
    flushSession 
  } = useMemory(userId);

  // 1. Recebe mensagem do usuário
  async function handleMessage(message: string) {
    
    // 2. Recupera memórias relevantes ANTES de responder
    const relevantMemories = await search(message, { 
      limit: 5,
      minScore: 0.5
    });
    
    // 3. Monta prompt com contexto
    const context = `
      [MEMÓRIAS DO USUÁRIO]
      ${relevantMemories.map(m => `- ${m.content}`).join('\n')}
      
      [CONVERSA ATUAL]
      Usuário: ${message}
    `;
    
    // 4. Chama LLM
    const response = await llm.complete(context);
    
    // 5. Detecta se deve salvar nova memória
    const shouldSave = await detectMemoryPattern(message);
    if (shouldSave) {
      await createDurableMemory({
        category: inferCategory(message),
        title: extractTitle(message),
        content: message
      });
    }
    
    return response;
  }

  // 6. Flush ao final da sessão
  async function endSession() {
    await flushSession(userId, currentSessionId);
  }

  return { handleMessage, endSession };
}
```

---

## Resumo Visual

```
┌─────────────────────────────────────────────────────────────────────┐
│                 ARQUITETURA DE FLUXO COMPLETA                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐  │
│  │  Usuário │────▶│    IA    │────▶│ Memória  │────▶│ Resposta │  │
│  │          │     │          │     │  (DB)    │     │ Personal.│  │
│  └──────────┘     └──────────┘     └──────────┘     └──────────┘  │
│       │                                     ▲                       │
│       │                                     │                       │
│       │           ┌──────────┐     ┌──────────┘                       │
│       │           │ Session  │     │                                  │
│       │           │ Flush    │────▶│                                  │
│       │           └──────────┘     │                                  │
│       │                           │                                  │
│       │           ┌──────────┐     │                                  │
│       │           │Compaction│────▶│                                  │
│       │           └──────────┘     │                                  │
│       │                           │                                  │
│       └───────────────────────────┘                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Referências

- [`src/lib/memory/core.ts`](src/lib/memory/core.ts) - MemoryService principal
- [`src/lib/memory/useMemory.ts`](src/lib/memory/useMemory.ts) - Hook de integração
- [`supabase/migrations/20260208_rag_memory_flush.sql`](supabase/migrations/20260208_rag_memory_flush.sql) - Funções RAG
- [`docs/AMP_STUDIO_VS_OPENCLAW_ANALYSIS.md`](docs/AMP_STUDIO_VS_OPENCLAW_ANALYSIS.md) - Comparação arquitetural
