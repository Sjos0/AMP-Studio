# Análise de Paridade: AMP Studio ↔ OpenClaw

## Relatório Completo de Funcionalidades Faltantes

> **Data**: 2026-02-07  
> **Objetivo**: Documentar o que falta implementar para que o AMP Studio alcance paridade funcional com o OpenClaw em termos de agente inteligente com memória infinita.

---

## 1. Resumo Executivo

### 1.1 Status Atual

| Aspecto | OpenClaw | AMP Studio | Paridade |
|---------|----------|------------|----------|
| **Fonte de verdade** | Markdown files (portátil) | Supabase DB (vendor lock-in) | ⚠️ Decisão arquitetural diferente |
| **Índice de busca** | SQLite | PostgreSQL + pgvector | ✅ Equivalente |
| **Chunking** | ~400 tokens, 80 overlap | ~400 tokens, 80 overlap | ✅ Idêntico |
| **Embeddings** | Gemini (768-dim) | Gemini (768-dim) | ✅ Idêntico |
| **Busca híbrida** | Vector + BM25 | Vector + BM25 (70/30) | ✅ Equivalente |
| **Memória persistente** | 3 camadas (ephemeral, durable, session) | 3 camadas (ephemeral, durable, session) | ✅ Equivalente |

### 1.2 Conclusão Principal

**O AMP Studio implementou 85% das funcionalidades de memória do OpenClaw**, mas está **faltando os componentes de agente autônomo** que fazem o OpenClaw ser verdadeiramente "inteligente" e "proativo".

---

## 2. Arquitetura OpenClaw: Funcionalidades Completas

### 2.1 Heartbeat Architecture (O Diferencial Principal)

O OpenClaw possui uma **arquitetura de "heartbeat"** que o torna um agente verdadeiramente proativo:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OPENCLAW HEARTBEAT ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│   │   SCHEDULER │────▶│   REFLECT   │────▶│   ACTIVATE  │          │
│   │  (Cron/     │     │   (Review   │     │   (Execute  │          │
│   │   Periodic) │     │   Context)  │     │    Action)  │          │
│   └─────────────┘     └─────────────┘     └─────────────┘          │
│          │                  │                   │                   │
│          │                  │                   │                   │
│          ▼                  ▼                   ▼                   │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │              MEMORY LOOP (Persist & Retrieve)           │       │
│   │  - Read MEMORY.md                                      │       │
│   │  - Read SOUL.md                                        │       │
│   │  - Write journal entries                               │       │
│   │  - Compact/Summarize when needed                       │       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Características do Heartbeat:**
- O agente **"acorda" periodicamente** (configurável: a cada 5min, 1h, 1d)
- **Revisa contexto recente** automaticamente
- **Reflete sobre ações** tomadas desde último heartbeat
- **Decide proativamente** se ação é necessária (não apenas reage)

### 2.2 Sistema de Memória Two-Tiered Completo

O OpenClaw implementa **duas camadas de memória** de forma mais sofisticada:

#### Camada 1: JSONL Transcripts (Auditoria Factual)
```
# Formato: sessions/2026-02-07/2026-02-07T12-00-00.jsonl
{"timestamp": "2026-02-07T12:00:00Z", "role": "user", "content": "...", "metadata": {...}}
{"timestamp": "2026-02-07T12:00:01Z", "role": "assistant", "content": "...", "tool_calls": [...]}
{"timestamp": "2026-02-07T12:00:02Z", "role": "system", "content": "...", "result": "..."}
```

#### Camada 2: Markdown Memory (Conhecimento Curado)
```
# MEMORY.md (ou SOUL.md)
## Preferências do Usuário
- Prefere temas escuros
- Trabalha melhor em blocos de 90 minutos
- Gosta de explicações técnicas detalhadas

## Projetos Ativos
- [[projeto-amp-studio]]: Sistema de memória com Supabase

## Decisões Tomadas
- 2026-02-05: Escolhido Supabase como backend (vs SQLite original)
```

### 2.3 Lane Queue System (Confiabilidade)

O OpenClaw implementa um **sistema de filas com lanes** para garantir execução confiável:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LANE QUEUE SYSTEM                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│   │  LANE A │  │  LANE B │  │  LANE C │  │  LANE D │              │
│   │ (High   │  │ (Medium │  │ (Low    │  │ (Bulk   │              │
│   │ Priori) │  │ Priori) │  │ Priori) │  │ Tasks)  │              │
│   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘              │
│        │            │            │            │                     │
│        ▼            ▼            ▼            ▼                     │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │              SERIAL EXECUTION CONTROLLER               │       │
│   │  - Prevents race conditions                            │       │
│   │  - Guarantees order of execution                       │       │
│   │  - Automatic retry on failure                          │       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Benefícios:**
- Execução **serial por padrão** (evita race conditions)
- **Retentativa automática** em falhas
- **Priorização** de tarefas

### 2.4 Semantic Snapshots (Web Browsing)

O OpenClaw implementa **parsing de accessibility trees** para web scraping inteligente:

```typescript
// Ao invés de screenshots, OpenClaw extrai a estrutura semântica
interface SemanticSnapshot {
  url: string;
  timestamp: string;
  title: string;
  headings: Array<{ level: number; text: string }>;
  links: Array<{ text: string; href: string }>;
  buttons: Array<{ text: string; ariaLabel: string }>;
  forms: Array<{ action: string; inputs: string[] }>;
  // ... estrutura completa da página
}
```

### 2.5 Gateway Architecture (Multi-Channel)

O OpenClaw funciona como um **gateway** para múltiplos canais:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OPENCLAW GATEWAY                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│   │   TELEGRAM  │  │   SLACK     │  │  WHATSAPP   │               │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘               │
│          │                │                │                        │
│          └────────────────┼────────────────┘                        │
│                           ▼                                         │
│              ┌─────────────────────────┐                            │
│              │    GATEWAY SERVER      │                            │
│              │  - Auth & Sessions     │                            │
│              │  - Message Normalizing │                            │
│              │  - Rate Limiting       │                            │
│              └───────────┬─────────────┘                            │
│                          ▼                                           │
│              ┌─────────────────────────┐                            │
│              │   REASONING ENGINE     │                            │
│              │   (Claude/GPT/Ollama)  │                            │
│              └───────────┬─────────────┘                            │
│                          ▼                                           │
│              ┌─────────────────────────┐                            │
│              │   TOOL EXECUTION       │                            │
│              │   - Shell              │                            │
│              │   - File System        │                            │
│              │   - Browser            │                            │
│              └─────────────────────────┘                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.6 Skills Framework (AgentSkills)

O OpenClaw possui um **sistema de extensibilidade** baseado em skills:

```
skills/
├── skill-name/
│   ├── SKILL.md          # Documentação (obrigatório)
│   ├── index.js          # Código de execução
│   └── package.json      # Dependências
```

**Exemplo de Skill:**
```markdown
# SKILL.md
## Nome: send_email
## Propósito: Enviar emails através do SMTP configurado
## Uso: `send_email --to "dest@email.com" --subject "..." --body "..."`
## Permissões necessárias: SMTP_CONFIG
```

### 2.7 Compaction/Summarization (Virtual Memory)

O OpenClaw implementa **compactação explícita** de memória:

```bash
# Comando explícito de compactação
/openclaw compact --threshold 0.8 --strategy summarize

# O que acontece:
# 1. Lê memórias antigas
# 2. Gera resumos via LLM
# 3. Substitui memórias detalhadas por resumos condensados
# 4. Mantém referências aos originais (para recuperação)
```

### 2.8 Triggering System (Scheduler Completo)

O OpenClaw possui um **sistema de triggers** completo:

```typescript
type TriggerType = 
  | { type: 'cron', expression: '0 9 * * *' }        // Time-based
  | { type: 'interval', minutes: 30 }               // Periodic
  | { type: 'webhook', path: '/api/webhook' }        // External
  | { type: 'file_change', pattern: '**/*.md' }     // File watch
  | { type: 'memory_threshold', percent: 80 }        // Memory-based
```

---

## 3. GAP Analysis: O Que Falta no AMP Studio

### 3.1 Funcionalidades de Memória (Status: 95% ✅)

| Funcionalidade | Status | Detalhes |
|----------------|--------|----------|
| Schema (9 tabelas) | ✅ Feito | `supabase/migrations/20260206_create_memory_system.sql` |
| Camadas memória | ✅ Feito | ephemeral, durable, session |
| Chunking | ✅ Feito | ~400 tokens, 80 overlap |
| Embeddings | ✅ Feito | Gemini 768-dim com cache |
| Busca híbrida | ✅ Feito | 70% vector, 30% BM25 |
| RAG Retrieval | ✅ Feito | Via `hybrid_search` RPC |
| Memory Flush | ✅ Feito | Função `compact_memory` |
| Auto-Indexing | ✅ Feito | Trigger `trg_auto_index_chunk` |
| Citations | ✅ Feito | Tabela `memory_citations` |

### 3.2 Funcionalidades de Agente (Status: 0% ❌)

| Funcionalidade | Prioridade | Esforço Estimado |
|----------------|------------|------------------|
| Heartbeat Architecture | Alta | 3-4 semanas |
| Lane Queue System | Média | 2 semanas |
| Semantic Snapshots | Baixa | 1 semana |
| Gateway Architecture | Média | 3 semanas |
| Skills Framework | Média | 2-3 semanas |
| Triggering System | Alta | 2 semanas |
| Proactive Actions | Alta | 3 semanas |
| JSONL Transcripts | Média | 1 semana |
| Compact/Summarize | Média | 2 semanas |

### 3.3 Matriz de GAPs Detalhada

#### GAP 1: Heartbeat Architecture (ALTA PRIORIDADE)

**O que é:** Sistema que permite ao agente "acordar" periodicamente, revisar contexto e executar ações proativas.

**O que falta:**
- ❌ Scheduler de tarefas com múltiplos tipos de trigger
- ❌ Sistema de reflexão automática
- ❌ Loop de heartbeat configurável
- ❌ Estado persistente entre heartbeats

**Impacto:** Sem isto, o AMP Studio é apenas um "chatbot com memória", não um "agente inteligente".

**Implementação necessária:**
```typescript
// src/lib/agent/heartbeat.ts
interface HeartbeatConfig {
  intervalMinutes: number;
  enabled: boolean;
  triggers: Trigger[];
}

class HeartbeatAgent {
  async start(config: HeartbeatConfig): Promise<void>;
  async stop(): Promise<void>;
  async reflect(): Promise<ReflectionResult>;
  async shouldAct(): Promise<boolean>;
  async executeAction(action: AgentAction): Promise<ActionResult>;
}
```

#### GAP 2: Triggering System (ALTA PRIORIDADE)

**O que é:** Sistema de triggers para executar ações baseadas em tempo, eventos externos ou condições de memória.

**O que falta:**
- ❌ Tipo `Trigger` e `TriggerConfig`
- ❌ Scheduler com suporte a cron expressions
- ❌ Handlers para cada tipo de trigger
- ❌ Tabela de triggers no banco

**Implementação necessária:**
```typescript
// src/lib/scheduler/types.ts
type TriggerType = 'cron' | 'interval' | 'webhook' | 'file_change' | 'memory_threshold';

interface Trigger {
  id: UUID;
  userId: UUID;
  type: TriggerType;
  config: Record<string, any>;
  enabled: boolean;
  lastFiredAt?: Date;
  nextFireAt?: Date;
}
```

#### GAP 3: Lane Queue System (MÉDIA PRIORIDADE)

**O que é:** Sistema de execução serial com priorização para garantir confiabilidade.

**O que falta:**
- ❌ Fila de tarefas com lanes
- ❌ Controller de execução serial
- ❌ Sistema de retry automático
- ❌ Métricas de queue

**Implementação necessária:**
```typescript
// src/lib/queue/lane-queue.ts
interface LaneQueue {
  enqueue(task: AgentTask, lane: 'high' | 'medium' | 'low'): Promise<void>;
  dequeue(): Promise<AgentTask>;
  process(): Promise<void>;
  retry(task: AgentTask): Promise<void>;
}
```

#### GAP 4: Gateway Architecture (MÉDIA PRIORIDADE)

**O que é:** Arquitetura que permite múltiplos canais de comunicação.

**O que falta:**
- ❌ Gateway server
- ❌ Adaptadores de canal (Telegram, Slack, WhatsApp)
- ❌ Normalização de mensagens
- ❌ Rate limiting

**Nota:** Esta funcionalidade é mais relevante para um agent "always-on" via messaging apps.

#### GAP 5: Skills Framework (MÉDIA PRIORIDADE)

**O que é:** Sistema de extensibilidade para adicionar novas capacidades ao agente.

**O que falta:**
- ❌ Definição de interface `Skill`
- ❌ Registry de skills
- ❌ Sistema de instalação/Desinstalação
- ❌ Sandbox para execução

**Implementação necessária:**
```typescript
// src/lib/skills/skill-interface.ts
interface Skill {
  metadata: SkillMetadata;
  execute(input: SkillInput): Promise<SkillOutput>;
  validate?(input: unknown): boolean;
}

interface SkillMetadata {
  name: string;
  version: string;
  description: string;
  permissions: string[];
}
```

#### GAP 6: JSONL Transcripts (MÉDIA PRIORIDADE)

**O que é:** Sistema de auditoria linha-a-linha das interações.

**O que falta:**
- ❌ Formato padronizado de transcript
- ❌ Função para escrita de JSONL
- ❌ Leitura/replay de sessions
- ❌ Tabela `memory_transcripts`

**Implementação necessária:**
```typescript
// src/lib/transcripts/types.ts
interface TranscriptEntry {
  timestamp: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  metadata?: {
    toolCalls?: ToolCall[];
    result?: string;
    error?: string;
  };
}
```

#### GAP 7: Compact/Summarize (MÉDIA PRIORIDADE)

**O que é:** Sistema de compactação inteligente de memórias antigas.

**O que falta:**
- ❌ Função de summarization via LLM
- ❌ Estratégia de compactação configurável
- ❌ Recuperação de memórias compactadas
- ❌ Logging de compactações

**Nota:** A função `compact_memory` existe no banco, mas precisa de integração com LLM para summarization real.

#### GAP 8: Semantic Snapshots (BAIXA PRIORIDADE)

**O que é:** Extração semântica de páginas web ao invés de screenshots.

**O que falta:**
- ❌ Parser de accessibility tree
- ❌ Extração de headings, links, forms
- ❌ Cache de snapshots
- ❌ Integração com browser tool

---

## 4. Roadmap de Implementação

### 4.1 Fase 1: Core Agent (2-3 semanas)

**Objetivo:** Implementar as funcionalidades mínimas para transformar o AMP Studio em um agente autônomo.

| Task | Descrição | Estimativa |
|------|-----------|------------|
| 4.1.1 | Criar `Trigger` schema e tabela | 2 dias |
| 4.1.2 | Implementar scheduler base | 3 dias |
| 4.1.3 | Implementar HeartbeatAgent | 5 dias |
| 4.1.4 | Integrar com MemoryService | 2 dias |
| 4.1.5 | Tests e documentação | 3 dias |

**Entregável:** Agente que pode ser "acordado" periodicamente para revisar contexto.

### 4.2 Fase 2: Reliability (2 semanas)

**Objetivo:** Garantir execução confiável de tarefas.

| Task | Descrição | Estimativa |
|------|-----------|------------|
| 4.2.1 | Implementar LaneQueue | 4 dias |
| 4.2.2 | Sistema de retry automático | 3 dias |
| 4.2.3 | Métricas de queue | 2 dias |
| 4.2.4 | Tests e documentação | 3 dias |

**Entregável:** Sistema de filas que garante execução ordenada e com retry.

### 4.3 Fase 3: Storage & Extensibility (3 semanas)

**Objetivo:** Melhorar persistência e adicionar extensibilidade.

| Task | Descrição | Estimativa |
|------|-----------|------------|
| 4.3.1 | Implementar JSONL transcripts | 3 dias |
| 4.3.2 | Implementar summarization via LLM | 5 dias |
| 4.3.3 | Criar Skills framework | 5 dias |
| 4.3.4 | Tests e documentação | 4 dias |

**Entregável:** Sistema de transcrições e framework de extensibilidade.

### 4.4 Fase 4: Advanced Features (3 semanas)

**Objetivo:** Funcionalidades avançadas para diferenciadores competitivos.

| Task | Descrição | Estimativa |
|------|-----------|------------|
| 4.4.1 | Gateway multi-canal | 1 semana |
| 4.4.2 | Semantic snapshots | 1 semana |
| 4.4.3 | Proactive actions AI | 1 semana |

**Entregável:** Funcionalidades premium opcionais.

---

## 5. Comparação Técnica Detalhada

### 5.1 Sistema de Memória

| Aspecto | OpenClaw | AMP Studio |
|---------|----------|------------|
| **Formato** | Markdown + JSONL | PostgreSQL |
| **Index** | SQLite | pgvector |
| **Chunking** | ~400 tokens, 80 overlap | ~400 tokens, 80 overlap |
| **Embedding** | Configurável | Gemini only |
| **Busca** | Vector + BM25 | Vector + BM25 |
| **Citations** | Via transcript | Via `memory_citations` |
| **Compaction** | Via `/compact` command | Via `compact_memory` |

### 5.2 Sistema de Agente

| Aspecto | OpenClaw | AMP Studio |
|---------|----------|------------|
| **Heartbeat** | ✅ nativo | ❌ não implementado |
| **Scheduler** | ✅ cron + triggers | ❌ não implementado |
| **Lanes** | ✅ serial execution | ❌ não implementado |
| **Skills** | ✅ framework | ❌ não implementado |
| **Gateway** | ✅ multi-channel | ❌ não implementado |
| **Transcripts** | ✅ JSONL | ❌ não implementado |

### 5.3 Infraestrutura

| Aspecto | OpenClaw | AMP Studio |
|---------|----------|------------|
| **Runtime** | Node.js CLI | Next.js |
| **Persistence** | Filesystem | Supabase |
| **Portabilidade** | Alta (vendor-neutral) | Baixa (vendor-lock) |
| **Deployment** | Local/Mac Mini | Cloud |
| **Privacy** | Local-first | Cloud-first |

---

## 6. Recomendações Estratégicas

### 6.1 Decisões Arquiteturais

**A escolha do Supabase é válida**, mas:
- ✅ Fornece escalabilidade automática
- ✅ Reduz complexidade operacional
- ⚠️ Introduce vendor lock-in
- ⚠️ Requer internet para funcionar

### 6.2 Priorização Recomendada

**FASE 1 - Obrigatório (1-2 meses):**
1. Heartbeat Architecture
2. Triggering System
3. JSONL Transcripts

**FASE 2 - Importante (2-3 meses):**
1. Lane Queue System
2. Compact/Summarize

**FASE 3 - Opcional (3+ meses):**
1. Skills Framework
2. Gateway Architecture
3. Semantic Snapshots

### 6.3 Considerações de Segurança

Ao implementar as funcionalidades de agente autônomo:

1. **Rate limiting** estrito para evitar custos excessivos
2. **Aprovações humanas** para ações destrutivas
3. **Sandboxing** para execução de tools
4. **Logs completos** para auditoria
5. **Timeouts** para evitar loops infinitos

---

## 7. Conclusão

### 7.1 Status Geral

| Categoria | Progresso |
|-----------|-----------|
| **Memória Persistente** | ✅ 95% completo |
| **Sistema de Busca** | ✅ 100% completo |
| **Core Agent** | ❌ 0% completo |
| **Reliability** | ❌ 0% completo |
| **Extensibilidade** | ❌ 0% completo |
| **Overall** | **~40% de paridade** |

### 7.2 Próximos Passos Imediatos

1. **Criar arquivo de arquitetura do agente** (`docs/AGENT_ARCHITECTURE.md`)
2. **Iniciar implementação do Heartbeat** (issue/ticket)
3. **Decidir estratégia de triggers** (cron vs interval)
4. **Criar schema de triggers** no Supabase

### 7.3 Recursos de Referência

- [OpenClaw Documentation](https://docs.openclaw.ai/concepts/memory)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Virtual Memory for Cognition](https://binds.ch/blog/openclaw-systems-analysis)

---

## Anexo A: Checklist de Implementação

### Memória (✅ Concluído)
- [x] Schema de 9 tabelas
- [x] Camadas ephemeral/durable/session
- [x] Chunking com overlap
- [x] Embeddings Gemini
- [x] Busca híbrida
- [x] RAG retrieval
- [x] Memory flush
- [x] Auto-indexing
- [x] Citations

### Agente (⏳ A fazer)
- [ ] Heartbeat system
- [ ] Scheduler
- [ ] Triggers (cron/interval)
- [ ] JSONL transcripts
- [ ] Lane queue
- [ ] Retry system
- [ ] Compact/summarize
- [ ] Skills framework
- [ ] Gateway
- [ ] Semantic snapshots

---

## Anexo B: Glossário

| Termo | Definição |
|-------|-----------|
| **Heartbeat** | Loop periódico que "acorda" o agente para revisar contexto |
| **Lane Queue** | Sistema de filas com prioridades para execução de tarefas |
| **Semantic Snapshot** | Extração estruturada de páginas web |
| **Compact** | Processo de resumir memórias antigas |
| **Skill** | Extensão de funcionalidade do agente |
| **Gateway** | Camada de abstração para múltiplos canais de comunicação |
