# OpenClaw Memory System: Technical Research and Measurable Metrics

## Executive Summary

This document provides a comprehensive analysis of OpenClaw's persistent memory architecture and translates its technical concepts into measurable metrics for the AMP Studio project.

**Key Takeaways:**
- Files are the source of truth: Human-readable, version-controllable memory
- Hybrid retrieval works: BM25 + vector gives better results than either alone
- Cache everything: SHA-256 deduplication prevents redundant embedding costs
- Incremental is better: Delta-based sync scales to large memory stores
- Automate memory management: Pre-compaction flush prevents context loss

---

## 1. OpenClaw Memory Architecture Overview

### 1.1 Core Philosophy

OpenClaw implements a file-based, Markdown-driven memory system with semantic search capabilities. The core philosophy is simple yet powerful:

> **"Treat the LLM context as a cache and treat disk memory as the source of truth."**

This is analogous to virtual memory for cognition:
- RAM (context window) is limited
- Disk (persistent storage) is large
- Paging decides what comes back
- `/compact` command triggers summarization explicitly

### 1.2 Memory Types & Storage Structure

OpenClaw uses a two-tier memory design to balance short-term context with long-term knowledge:

| Memory Type | Location | Purpose | Retention |
|-------------|----------|---------|-----------|
| **Ephemeral** | `memory/YYYY-MM-DD.md` | Daily logs, working notes | Auto-archived after 30 days |
| **Durable** | `memory/*.md` | Curated knowledge, preferences | Permanent until manually deleted |
| **Session** | `sessions/YYYY-MM-DD-.md` | Conversation transcripts | Indexed and searchable |

### 1.3 Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw Memory System                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Markdown  │  │    Vector   │  │  Embedding Providers │  │
│  │   Storage   │  │   Search    │  │  (Local/OpenAI/Gemini) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                   │             │
│         └────────────────┼───────────────────┘             │
│                          ▼                                 │
│              ┌─────────────────────────┐                 │
│              │   MemoryIndexManager     │                 │
│              │  (Singleton + Caching)  │                 │
│              └─────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Core Implementation: MemoryIndexManager

### 2.1 MemoryIndexManager Responsibilities

The central class managing all memory operations is `MemoryIndexManager` (manager.ts:119-232).

**Key responsibilities:**
1. **Singleton pattern with caching**: Prevents duplicate indexes (`INDEX_CACHE`)
2. **Per-agent isolation**: Separate SQLite stores via `agentId`
3. **File watching**: Debounced sync on file changes
4. **Provider fallback chain**: Graceful degradation across embedding providers
5. **Session integration**: Tracks and indexes conversation transcripts

### 2.2 Data Flow

```
User Input → Search Query
     │
     ▼
┌─────────────┐
│ Hybrid      │ ← BM25 (30%) + Vector (70%)
│ Retrieval   │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Context     │ ← Relevant chunks + metadata
│ Builder     │
└─────────────┘
     │
     ▼
┌─────────────┐
│ LLM Prompt  │ ← Context + Query → Response
└─────────────┘
     │
     ▼
┌─────────────┐
│ Memory      │ ← Write durable notes before compacting
│ Persister   │
└─────────────┘
```

---

## 3. Technical Specifications

### 3.1 Chunking Algorithm

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Target Size** | ~400 tokens | Optimal chunk size for retrieval |
| **Overlap** | 80 tokens | Sliding window to maintain context |
| **Method** | Sliding window | Preserves semantic boundaries |

### 3.2 Embedding Configuration

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Model** | Gemini `text-embedding-004` | 768 dimensions |
| **Provider Selection** | Auto-fallback | Local → OpenAI → Gemini |
| **Caching** | SHA-256 deduplication | Prevents redundant API calls |
| **Dimensions** | 768 | Standard for semantic search |

### 3.3 Hybrid Search Weights

| Component | Weight | Rationale |
|-----------|--------|-----------|
| **Vector Similarity** | 70% | Semantic matching |
| **BM25** | 30% | Keyword matching |

### 3.4 Cache Strategy

| Cache Type | Key | TTL |
|------------|-----|-----|
| **Index Cache** | `INDEX_CACHE[agentId]` | Session lifetime |
| **Embedding Cache** | SHA-256(content) | Permanent |
| **Query Cache** | SHA-256(query) | 5 minutes |

---

## 4. Translating to Measurable Metrics

### 4.1 Memory System Metrics

| Metric | Formula | Target | Description |
|--------|---------|--------|-------------|
| **Memory Hit Rate** | `hits / (hits + misses)` | > 85% | Percentage of queries with relevant results |
| **Embedding Cache Hit Rate** | `cached_embeddings / total_embeddings` | > 90% | Redundancy prevention efficiency |
| **Chunk Overlap Coverage** | `overlap_chunks / total_chunks` | > 95% | Context continuity across chunks |
| **Memory Write Latency** | `P95(write_time)` | < 500ms | Time to persist new memory |
| **Memory Search Latency** | `P95(search_time)` | < 200ms | Time to retrieve relevant memories |
| **Context Recall** | `retrieved_tokens / requested_tokens` | > 80% | Information retrieval completeness |

### 4.2 Quality Metrics

| Metric | Formula | Target | Description |
|--------|---------|--------|-------------|
| **Relevance Score** | `avg(human_rating)` | > 4.0/5.0 | Subjective quality rating |
| **Semantic Similarity** | `avg(vector_similarity)` | > 0.75 | Cosine similarity of retrieved chunks |
| **BM25 Score** | `avg(BM25(query, chunks))` | > 10.0 | Keyword matching quality |
| **Hybrid Score** | `0.7 × vector + 0.3 × BM25` | > 0.6 | Combined retrieval quality |

### 4.3 Cost Metrics

| Metric | Formula | Target | Description |
|--------|---------|--------|-------------|
| **Embedding Cost/Query** | `API_calls × cost_per_token` | < $0.001 | Cost efficiency |
| **Memory Storage Cost** | `total_tokens × storage_cost` | Monitor | Track growth |
| **Cache Savings** | `(1 - cached/total) × embedding_cost` | > 80% | Deduplication efficiency |

### 4.4 System Health Metrics

| Metric | Formula | Target | Description |
|--------|---------|--------|-------------|
| **Memory Freshness** | `time_since_last_update` | < 1 hour | Staleness indicator |
| **Index Consistency** | `synced_files / total_files` | = 100% | File-sync accuracy |
| **Agent Isolation** | `cross_agent_accesses / total_accesses` | = 0% | Privacy compliance |

---

## 5. Implementation Recommendations for AMP Studio

### 5.1 Metrics Dashboard

```typescript
// src/lib/memory/metrics.ts

export interface MemoryMetrics {
  // Performance Metrics
  hitRate: number;                    // Memory Hit Rate
  embeddingCacheHitRate: number;      // Embedding Cache Hit Rate
  chunkOverlapCoverage: number;        // Chunk Overlap Coverage
  writeLatencyP95: number;            // Memory Write Latency (ms)
  searchLatencyP95: number;           // Memory Search Latency (ms)
  contextRecall: number;              // Context Recall
  
  // Quality Metrics  
  relevanceScore: number;             // Relevance Score (human-rated)
  semanticSimilarity: number;         // Semantic Similarity
  hybridScore: number;                // Hybrid Retrieval Score
  
  // Cost Metrics
  embeddingCostPerQuery: number;      // Cost efficiency
  cacheSavingsPercent: number;        // Deduplication savings
  
  // Health Metrics
  memoryFreshnessMinutes: number;     // Staleness
  indexConsistencyPercent: number;    // Sync accuracy
  agentIsolationViolations: number;  // Privacy
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

  // Methods to track and update metrics
  async recordSearch(query: string, results: SearchResult[]): Promise<void> {
    // Track hit/miss, latency, relevance
  }

  async recordEmbedding(content: string, cached: boolean): Promise<void> {
    // Track cache hit rate and cost
  }

  async recordWrite(memory: Memory): Promise<void> {
    // Track write latency
  }

  getMetrics(): MemoryMetrics {
    return { ...this.metrics };
  }
}
```

### 5.2 Monitoring Checklist

- [ ] **Real-time Dashboard**: Track hit rates, latency, and costs
- [ ] **Alerting**: Notify on hit rate < 80% or latency > 500ms
- [ ] **A/B Testing**: Compare retrieval strategies
- [ ] **Cost Analysis**: Track embedding API costs
- [ ] **User Feedback**: Collect relevance ratings

### 5.3 Key Performance Indicators (KPIs)

| Priority | KPI | Target | Frequency |
|----------|-----|--------|-----------|
| 🔴 Critical | Memory Hit Rate | > 85% | Daily |
| 🟠 High | Embedding Cache Hit Rate | > 90% | Daily |
| 🟠 High | Search Latency (P95) | < 200ms | Real-time |
| 🟡 Medium | Context Recall | > 80% | Weekly |
| 🟡 Medium | Relevance Score | > 4.0/5.0 | Weekly |
| 🟢 Low | Cache Savings | > 80% | Monthly |

---

## 6. Conclusion

OpenClaw's memory system provides a production-ready blueprint that balances performance, cost, and developer experience. By translating technical concepts into measurable metrics, AMP Studio can:

1. **Monitor system health** with real-time dashboards
2. **Optimize costs** through cache efficiency tracking
3. **Improve quality** with relevance scoring
4. **Scale reliably** with latency and throughput metrics

The key insight is treating memory as a first-class system concern with explicit metrics and monitoring.

---

## References

- [OpenClaw Memory System Deep Dive](https://snowan.gitbook.io/study-notes/ai-blogs/openclaw-memory-system-deep-dive)
- [OpenClaw Systems Analysis](https://binds.ch/blog/openclaw-systems-analysis)
- [DigitalOcean OpenClaw Guide](https://www.digitalocean.com/resources/articles/what-is-openclaw)
- [OpenClaw Architecture Explained (YouTube)](https://www.youtube.com/watch?v=NYK7pGEZy7k)
