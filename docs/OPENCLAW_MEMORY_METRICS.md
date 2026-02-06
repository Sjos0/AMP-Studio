# Memória OpenClaw: Guia Técnico para Métricas Mensuráveis

## Resumo Executivo

Este documento traduz a arquitetura de memória do OpenClaw em métricas quantificáveis para o projeto AMP Studio, permitindo monitoramento, otimização e melhoria contínua do sistema de memória persistente.

---

## 1. Arquitetura de Memória OpenClaw

### 1.1 Filosofia Central

O OpenClaw implementa uma filosofia de **"memória virtual para cognição"**:

| Conceito | Analogia | Implementação |
|----------|----------|---------------|
| RAM | Janela de contexto | Context window do LLM |
| Disco | Armazenamento persistente | Arquivos Markdown |
| Paging | Recuperação de memória | Sistema de busca |
| Compaction | Compressão de memória | Summarization |

**Princípio Fundamental**:
> "Trate o contexto LLM como cache e a memória em disco como fonte da verdade."

### 1.2 Tipos de Memória

```
┌─────────────────────────────────────────────────────────────┐
│                    TIPOS DE MEMÓRIA                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Ephemeral  │  │   Durable   │  │      Session        │ │
│  │  (Diário)   │  │  (Curated)  │  │   (Transcrições)    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│       │               │                   │                 │
│       ▼               ▼                   ▼                 │
│  logs/YYYY-MM-DD   MEMORY.md        sessions/YYYY-MM        │
│  contexto diário    fatos/preferências  histórico          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Componentes Técnicos Principais

### 2.1 MemoryIndexManager

**Responsabilidades**:
- Singleton com cache (`INDEX_CACHE`)
- Isolamento por agente (`agentId`)
- File watching com debounce
- Fallback de providers
- Integração de sessões

### 2.2 Sistema de Busca Híbrida

```
┌─────────────────────────────────────────────────────────────┐
│                    BUSCA HÍBRIDA                             │
├─────────────────────────────────────────────────────────────┤
│                                                                │
│   Query ──┬──► BM25 (30%) ──┐                               │
│           │                  │                               │
│           └──► Vector (70%) ─┴──► Merge ──► Results         │
│                                                                │
│   BM25: keywords exatos (IDs, símbolos, termos técnicos)     │
│   Vector: similaridade semântica (significados equivalentes) │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Chunking Algorithm

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| **Target Size** | ~400 tokens | Tamanho ideal para recuperação |
| **Overlap** | 80 tokens | Janela deslizante preserva contexto |
| **Método** | Line-aware | Preserva fronteiras semânticas |

### 2.4 Sistema de Embeddings

| Provider | Prioridade | Latência Típica |
|----------|------------|-----------------|
| **Local (ggml)** | 1ª | ~50 tok/s |
| **OpenAI** | 2ª | ~1000 tok/s |
| **Gemini** | 3ª | ~1000 tok/s |

---

## 3. Tradução para Métricas Mensuráveis

### 3.1 Métricas de Performance

| Métrica | Fórmula | Alvo | Descrição |
|---------|---------|------|-----------|
| **Memory Hit Rate** | `hits / (hits + misses) × 100` | > 85% | % de queries com resultados relevantes |
| **Embedding Cache Hit Rate** | `cached / total × 100` | > 90% | Eficiência de deduplicação |
| **Chunk Overlap Coverage** | `overlapped_chunks / total × 100` | > 95% | Continuidade de contexto |
| **Write Latency (P95)** | `P95(write_time)` | < 500ms | Latência de escrita |
| **Search Latency (P95)** | `P95(search_time)` | < 200ms | Latência de busca |
| **Context Recall** | `retrieved_tokens / requested_tokens × 100` | > 80% | Completude da recuperação |

### 3.2 Métricas de Qualidade

| Métrica | Fórmula | Alvo | Descrição |
|---------|---------|------|-----------|
| **Relevance Score** | `avg(human_rating)` | > 4.0/5.0 | Avaliação subjetiva |
| **Semantic Similarity** | `avg(cosine_similarity)` | > 0.75 | Similaridade de vetores |
| **BM25 Score** | `avg(BM25(query, chunks))` | > 10.0 | Qualidade keyword |
| **Hybrid Score** | `0.7 × vector + 0.3 × BM25` | > 0.6 | Score combinado |

### 3.3 Métricas de Custo

| Métrica | Fórmula | Alvo | Descrição |
|---------|---------|------|-----------|
| **Embedding Cost/Query** | `API_calls × cost_per_token` | < $0.001 | Eficiência de custo |
| **Storage Cost** | `total_tokens × storage_cost` | Monitorar | Crescimento de armazenamento |
| **Cache Savings** | `(1 - cached/total) × embedding_cost` | > 80% | Economia de deduplicação |

### 3.4 Métricas de Saúde do Sistema

| Métrica | Fórmula | Alvo | Descrição |
|---------|---------|------|-----------|
| **Memory Freshness** | `time_since_last_update` | < 1h | Indicador de estalabilidade |
| **Index Consistency** | `synced_files / total × 100` | = 100% | Precisão de sincronização |
| **Agent Isolation** | `cross_agent_accesses / total` | = 0% | Conformidade de privacidade |

---

## 4. Especificações Técnicas para Implementação

### 4.1 Configurações de Chunking

```typescript
// Configuração de chunking baseada em OpenClaw
const CHUNK_CONFIG = {
  targetTokens: 400,      // Tamanho alvo do chunk
  overlapTokens: 80,      // Sobreposição entre chunks
  minTokens: 100,         // Tamanho mínimo
  maxTokens: 600,        // Tamanho máximo
  preserveLineBoundaries: true  // Preservar estrutura semântica
};
```

### 4.2 Pesos de Busca Híbrida

| Componente | Peso | Casos de Uso |
|------------|------|--------------|
| **Vector Similarity** | 0.70 | Meaning-based queries |
| **BM25** | 0.30 | Exact match, IDs, símbolos |

### 4.3 Estratégia de Cache

| Tipo de Cache | Chave | TTL |
|---------------|-------|-----|
| **Index Cache** | `INDEX_CACHE[agentId]` | Sessão |
| **Embedding Cache** | `SHA-256(content)` | Permanente |
| **Query Cache** | `SHA-256(query)` | 5 minutos |

---

## 5. Implementação de Métricas no AMP Studio

### 5.1 Collector de Métricas

```typescript
// src/lib/memory/metrics.ts

export interface MemoryMetrics {
  // Performance
  hitRate: number;
  embeddingCacheHitRate: number;
  chunkOverlapCoverage: number;
  writeLatencyP95: number;
  searchLatencyP95: number;
  contextRecall: number;
  
  // Qualidade
  relevanceScore: number;
  semanticSimilarity: number;
  hybridScore: number;
  
  // Custo
  embeddingCostPerQuery: number;
  cacheSavingsPercent: number;
  
  // Saúde
  memoryFreshnessMinutes: number;
  indexConsistencyPercent: number;
  agentIsolationViolations: number;
}

export class MemoryMetricsCollector {
  private metrics: MemoryMetrics = {
    hitRate: 0,
    embeddingCacheHitRate: 0,
    chunkOverlapCoverage: 0,
    writeLatencyP95: 0,
    searchLatencyP95: 0,
    contextRecall: 0,
    relevanceScore: 0,
    semanticSimilarity: 0,
    hybridScore: 0,
    embeddingCostPerQuery: 0,
    cacheSavingsPercent: 0,
    memoryFreshnessMinutes: 0,
    indexConsistencyPercent: 100,
    agentIsolationViolations: 0
  };

  async recordSearch(query: string, results: SearchResult[]): Promise<void> {
    const start = Date.now();
    // Registrar hit/miss, latência, relevância
    this.metrics.searchLatencyP95 = this.calculateP95(this.searchLatencies);
  }

  async recordEmbedding(content: string, cached: boolean): Promise<void> {
    // Rastrear cache hit rate e custo
    this.metrics.embeddingCacheHitRate = this.calculateCacheHitRate();
  }

  async recordWrite(memory: Memory): Promise<void> {
    // Rastrear latência de escrita
    const start = Date.now();
    await this.persistMemory(memory);
    this.metrics.writeLatencyP95 = this.calculateP95(this.writeLatencies);
  }

  getMetrics(): MemoryMetrics {
    return { ...this.metrics };
  }
}
```

### 5.2 Dashboard de Métricas

```typescript
// src/components/MemoryMetricsDashboard.tsx

export function MemoryMetricsDashboard({ metrics }: { metrics: MemoryMetrics }) {
  return (
    <div className="metrics-grid">
      <MetricCard
        title="Memory Hit Rate"
        value={`${metrics.hitRate.toFixed(1)}%`}
        status={metrics.hitRate > 85 ? 'good' : 'warning'}
      />
      <MetricCard
        title="Search Latency (P95)"
        value={`${metrics.searchLatencyP95}ms`}
        status={metrics.searchLatencyP95 < 200 ? 'good' : 'warning'}
      />
      <MetricCard
        title="Embedding Cache"
        value={`${metrics.embeddingCacheHitRate.toFixed(1)}%`}
        status={metrics.embeddingCacheHitRate > 90 ? 'good' : 'warning'}
      />
      <MetricCard
        title="Context Recall"
        value={`${metrics.contextRecall.toFixed(1)}%`}
        status={metrics.contextRecall > 80 ? 'good' : 'warning'}
      />
    </div>
  );
}
```

---

## 6. KPIs e Monitoramento

### 6.1 Prioridades de Monitoramento

| Prioridade | KPI | Alvo | Frequência |
|------------|-----|------|------------|
| 🔴 Crítico | Memory Hit Rate | > 85% | Diário |
| 🟠 Alto | Embedding Cache Hit Rate | > 90% | Diário |
| 🟠 Alto | Search Latency (P95) | < 200ms | Real-time |
| 🟡 Médio | Context Recall | > 80% | Semanal |
| 🟡 Médio | Relevance Score | > 4.0/5.0 | Semanal |
| 🟢 Baixo | Cache Savings | > 80% | Mensal |

### 6.2 Alertas Configuráveis

```typescript
// src/lib/memory/alerts.ts

export const METRIC_ALERTS = {
  hitRate: {
    threshold: 85,
    operator: '<',
    severity: 'critical',
    message: 'Memory hit rate below 85%'
  },
  searchLatency: {
    threshold: 200,
    operator: '>',
    severity: 'warning',
    message: 'Search latency exceeded 200ms'
  },
  cacheHitRate: {
    threshold: 90,
    operator: '<',
    severity: 'warning',
    message: 'Embedding cache hit rate below 90%'
  }
};
```

---

## 7. Referências

- [Deep Dive: OpenClaw Memory System](https://snowan.gitbook.io/study-notes/ai-blogs/openclaw-memory-system-deep-dive)
- [OpenClaw Systems Analysis](https://binds.ch/blog/openclaw-systems-analysis)
- [OpenClaw Documentation - Memory](https://docs.openclaw.ai/concepts/memory)
- [Vector Search vs BM25](https://dev.to/the_nortern_dev/vector-search-is-not-enough-why-i-added-bm25-hybrid-search-to-my-ai-memory-server-3h3l)
