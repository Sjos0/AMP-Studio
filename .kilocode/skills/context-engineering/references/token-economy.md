# Token Economy Guide

## Overview

Token economy is the practice of optimizing token usage in AI-assisted workflows while maintaining context quality and task effectiveness.

## Token Budget Allocation

### Recommended Distribution

| Context Layer | Tokens | Percentage | Purpose |
|---------------|--------|------------|---------|
| Working | 150 | 7.5% | Current task focus |
| Session | 500 | 25% | Task decomposition |
| Project | 1000 | 50% | Permanent knowledge |
| Reference | 350 | 17.5% | On-demand retrieval |

### Task-Specific Budgets

```typescript
interface TaskBudget {
  taskType: string;
  workingTokens: number;
  sessionTokens: number;
  projectTokens: number;
}

const taskBudgets: TaskBudget[] = [
  { taskType: 'simple_edit', workingTokens: 100, sessionTokens: 200, projectTokens: 500 },
  { taskType: 'feature_create', workingTokens: 200, sessionTokens: 800, projectTokens: 1200 },
  { taskType: 'refactoring', workingTokens: 250, sessionTokens: 1000, projectTokens: 1500 },
  { taskType: 'debugging', workingTokens: 300, sessionTokens: 600, projectTokens: 1000 },
  { taskType: 'architecture', workingTokens: 200, sessionTokens: 1500, projectTokens: 2000 }
];
```

## Compression Strategies

### Strategy 1: Key-Value Compression

Convert verbose text to structured key-value pairs:

```typescript
// Before (50+ tokens):
// "The user authentication module uses JWT tokens with a 24-hour expiry
// and stores refresh tokens in an HTTP-only cookie for security."

// After (20 tokens):
{
  "auth": {
    "token": "JWT",
    "expiry": "24h",
    "refreshStorage": "http-only cookie",
    "purpose": "security"
  }
}
```

### Strategy 2: Pattern Extraction

Extract recurring patterns into reusable templates:

```typescript
interface PatternTemplate {
  pattern: string;
  template: string;
  examples: string[];
}

const patterns: PatternTemplate[] = [
  {
    pattern: "API endpoint pattern",
    template: "{method} {path} → {response}",
    examples: ["GET /users → User[]", "POST /users → User"]
  }
];
```

### Strategy 3: Semantic Summary

Summarize with key semantic points:

```typescript
function summarize(text: string, maxTokens: number): string {
  const keyPoints = extractKeyPoints(text);
  const summary = keyPoints.slice(0, maxTokens / 10).join('. ');
  return summary + (keyPoints.length > maxTokens / 10 ? '...' : '');
}
```

## Caching Strategies

### Hot Path Caching

Cache frequently accessed information:

```typescript
interface CacheEntry<T> {
  data: T;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

class ContextCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number = 100;

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.lastAccessed > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    return entry.data;
  }

  set(key: string, data: T, ttl: number): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }
    this.cache.set(key, {
      data,
      ttl,
      accessCount: 1,
      lastAccessed: Date.now()
    });
  }

  private evictLeastUsed(): void {
    let minAccess = Infinity;
    let evictKey = '';
    for (const [key, entry] of this.cache) {
      if (entry.accessCount < minAccess) {
        minAccess = entry.accessCount;
        evictKey = key;
      }
    }
    this.cache.delete(evictKey);
  }
}
```

### Lazy Loading

Load context only when needed:

```typescript
interface LazyContext {
  key: string;
  load: () => Promise<ContextChunk>;
  loaded: boolean;
  data?: ContextChunk;
}

function createLazyContext(key: string, load: () => Promise<ContextChunk>): LazyContext {
  return {
    key,
    load,
    loaded: false
  };
}

async function getLazyContext(lazy: LazyContext): Promise<ContextChunk> {
  if (!lazy.loaded) {
    lazy.data = await lazy.load();
    lazy.loaded = true;
  }
  return lazy.data!;
}
```

## Pruning Strategies

### Criteria-Based Pruning

```typescript
interface PruningRule {
  name: string;
  criteria: (chunk: ContextChunk) => boolean;
  action: 'archive' | 'delete' | 'summarize';
  priority: number;
}

const pruningRules: PruningRule[] = [
  {
    name: 'age_based',
    criteria: (c) => c.ageInDays > 30,
    action: 'archive',
    priority: 1
  },
  {
    name: 'low_relevance',
    criteria: (c) => c.relevanceScore < 0.2 && c.tokenCost > 50,
    action: 'summarize',
    priority: 2
  },
  {
    name: 'duplicate',
    criteria: (c) => c.isDuplicate,
    action: 'delete',
    priority: 3
  }
];

function applyPruning(chunks: ContextChunk[]): ContextChunk[] {
  for (const rule of pruningRules.sort((a, b) => a.priority - b.priority)) {
    chunks = chunks.map(chunk => {
      if (rule.criteria(chunk)) {
        return applyAction(chunk, rule.action);
      }
      return chunk;
    });
  }
  return chunks;
}
```

## Optimization Checklist

- [ ] **Budget Check**: Total tokens within budget?
- [ ] **Compression**: Is verbose content compressed?
- [ ] **Caching**: Is frequently accessed content cached?
- [ ] **Pruning**: Is obsolete content removed?
- [ ] **Prioritization**: Is most relevant content prioritized?
- [ ] **Retrieval**: Is retrieval efficient?

## Metrics to Track

| Metric | Formula | Target |
|--------|---------|--------|
| Token Efficiency | Useful tokens / Total tokens | > 80% |
| Cache Hit Rate | Cache hits / Total retrievals | > 70% |
| Compression Ratio | Original tokens / Compressed tokens | > 2x |
| Pruning Effectiveness | Removed tokens / Total tokens | > 20% |
