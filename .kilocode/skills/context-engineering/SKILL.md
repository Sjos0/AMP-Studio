---
name: context-engineering
description: |
  This skill provides comprehensive expertise in context engineering for AI assistants.
  It should be used when users want to optimize, organize, manage, or analyze how information
  is stored, retrieved, processed, and maintained throughout conversations and projects.
  The skill covers token economy, context caching, dependency management, file organization,
  trigger patterns, and efficient context retrieval strategies.
---

# Context Engineering

This skill transforms the agent into an expert in context engineering, providing
systematic approaches for managing information flow, optimizing token usage, and
maintaining coherent state across complex tasks.

## When to Use This Skill

Use this skill when the user:
- Asks about organizing files, modules, or components
- Requests optimization of context usage or token economy
- Needs strategies for maintaining state across conversations
- Wants to understand dependencies between files or modules
- Asks about triggers, hooks, or event-driven patterns
- Needs guidance on splitting or merging context
- Requests analysis of current project structure
- Asks about caching or memoization strategies
- Wants to improve retrieval of information from context
- Needs help with multi-step task planning and state management

## Core Principles of Context Engineering

### 1. Context Boundaries

Define clear boundaries for different types of information:
- **Project Context**: Permanent knowledge about the project structure and conventions
- **Task Context**: Transient information about the current task
- **Session Context**: Information that persists within a conversation session
- **Working Context**: Active information being processed right now

### 2. Token Economy

Optimize token usage through:
- **Compression**: Summarize verbose information without losing critical details
- **Caching**: Store frequently accessed information for quick retrieval
- **Pruning**: Remove obsolete or redundant context promptly
- **Prioritization**: Keep most relevant information in active context

### 3. Dependency Management

Track and manage dependencies between:
- **Files**: Which files depend on or import from others
- **Modules**: How modules interact and communicate
- **Skills**: Which skills are active or can be triggered
- **State**: What state needs to be maintained across steps

### 4. Retrieval Optimization

Structure context for efficient retrieval:
- **Indexing**: Create mental indexes for quick lookup
- **Tagging**: Tag context segments with keywords
- **Hierarchy**: Organize information in clear hierarchies
- **Summary Layers**: Maintain multiple levels of detail

## Context Organization Strategies

### Strategy 1: Layered Context Model

Maintain context in layers from most to least detailed:

1. **Working Layer** (Active tokens: 100-200)
   - Current task requirements
   - Immediate next action
   - Critical constraints

2. **Session Layer** (Tokens: 500-1000)
   - Task decomposition
   - Completed steps
   - Pending items
   - Key decisions

3. **Project Layer** (Tokens: 1000-2000)
   - Architecture overview
   - Naming conventions
   - Tech stack details
   - Important patterns

4. **Reference Layer** (Tokens: Unlimited)
   - Full documentation
   - API references
   - Configuration details
   - Retrieved as needed

### Strategy 2: Context Chunking

Break information into retrievable chunks:
- **Atomic Units**: Each chunk contains one complete idea
- **Self-Contained**: Chunks can be understood independently
- **Tagged**: Each chunk has metadata for retrieval
- **Versioned**: Track changes to chunks over time

### Strategy 3: Trigger-Action Patterns

Define explicit triggers and corresponding actions:

```
TRIGGER: [Condition or event]
  → ACTION: [Response or context update]
  → NEW_STATE: [Resulting context state]
```

### Strategy 4: Context Handoff

When switching between tasks or domains:
1. **Capture State**: Record current progress
2. **Clear Working**: Reset working context
3. **Load Target**: Load new task context
4. **Verify**: Confirm context is sufficient

## File Organization Patterns

### Pattern 1: Feature-Based Organization

```
src/
├── features/
│   ├── feature-name/
│   │   ├── index.ts          # Public API
│   │   ├── types.ts          # Feature-specific types
│   │   ├── constants.ts      # Feature constants
│   │   ├── hooks/            # Feature hooks
│   │   ├── components/       # Feature components
│   │   └── utils/            # Feature utilities
│   └── ...
├── shared/                   # Shared across features
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── ...
```

### Pattern 2: Domain-Driven Organization

```
src/
├── domains/
│   ├── domain-name/
│   │   ├── models/           # Domain entities
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Data access
│   │   ├── events/          # Domain events
│   │   └── index.ts         # Public API
│   └── ...
├── core/                    # Core application logic
├── infrastructure/          # Technical infrastructure
└── ...
```

### Pattern 3: Layered Organization

```
src/
├── presentation/            # UI and user interaction
│   ├── components/
│   ├── pages/
│   └── hooks/
├── application/            # Use cases and orchestration
│   ├── services/
│   ├── handlers/
│   └── validators/
├── domain/                  # Business logic and rules
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/
│   └── domain-services/
└── infrastructure/          # Technical implementation
    ├── database/
    ├── cache/
    ├── api/
    └── ...
```

## Dependency Analysis Framework

### Step 1: Map Dependencies

```typescript
interface Dependency {
  from: string;      // File or module
  to: string;        // Dependency
  type: 'import' | 'export' | 'call' | 'inherit';
  strength: 'strong' | 'weak';
}

function analyzeDependencies(projectRoot: string): Dependency[] {
  // Traverse project and build dependency graph
}
```

### Step 2: Identify Coupling

- **High Coupling**: Changes in one module require changes in many others
- **Low Coupling**: Modules can change independently
- **Acyclic Dependencies**: No circular dependencies allowed

### Step 3: Optimize Structure

1. Extract shared dependencies
2. Break cyclic dependencies
3. Reduce strong couplings where possible
4. Add abstraction layers where needed

## Token Economy Techniques

### Technique 1: Context Compression

Compress verbose information while preserving meaning:

```typescript
interface CompressionStrategy {
  name: string;
  compress<T>(data: T): CompressedData;
  decompress<T>(data: CompressedData): T;
}

// Examples:
// - Key-Value Compression: { "userId": "u123" }
// - Pattern Extraction: Extract recurring patterns
// - Semantic Summary: Summarize with key points
```

### Technique 2: Intelligent Caching

Cache frequently accessed context:

```typescript
interface CacheStrategy {
  key: string;
  ttl: number;              // Time to live
  priority: number;          // Cache priority
  invalidateOn: string[];    // Invalidation triggers
}
```

### Technique 3: Progressive Loading

Load context progressively as needed:

```typescript
interface ContextLevel {
  level: number;
  content: string[];
  loaded: boolean;
  loadCondition: () => boolean;
}

const contextLevels: ContextLevel[] = [
  { level: 0, content: [...], loaded: true, loadCondition: () => true },
  { level: 1, content: [...], loaded: false, loadCondition: () => needsMore() },
  // ...
];
```

## Trigger and Hook Patterns

### Pattern 1: Event-Driven Triggers

```typescript
interface Trigger {
  event: string;
  condition?: (context: Context) => boolean;
  action: (context: Context) => ContextUpdate;
}

const triggers: Trigger[] = [
  {
    event: 'FILE_CREATED',
    condition: (ctx) => ctx.fileType === 'component',
    action: (ctx) => ({
      type: 'ADD_TO_CONTEXT',
      payload: { componentRegistry: ctx.filePath }
    })
  }
];
```

### Pattern 2: Context-Aware Hooks

```typescript
interface Hook {
  name: string;
  stage: 'before' | 'after' | 'around';
  handler: (context: Context) => Context | Promise<Context>;
}

const hooks: Hook[] = [
  {
    name: 'validateDependencies',
    stage: 'before',
    handler: (ctx) => {
      const deps = ctx.dependencies;
      if (!deps.verified) {
        throw new Error('Dependencies not verified');
      }
      return ctx;
    }
  }
];
```

### Pattern 3: Conditional Activation

```typescript
function shouldActivateSkill(skillName: string, context: Context): boolean {
  const skillTriggers = skillRegistry[skillName].triggers;
  return skillTriggers.some(trigger => 
    context.signals.some(signal => 
      trigger.pattern.test(signal)
    )
  );
}
```

## Context Retrieval Strategies

### Strategy 1: Semantic Search

Use semantic similarity for context retrieval:

```typescript
interface RetrievalQuery {
  query: string;
  contextTypes: string[];
  maxResults: number;
  threshold: number;
}

async function retrieveContext(query: RetrievalQuery): Promise<ContextChunk[]> {
  // Embed query and chunks in same space
  // Return most similar chunks above threshold
}
```

### Strategy 2: Keyword Indexing

Maintain keyword index for exact matching:

```typescript
interface KeywordIndex {
  [keyword: string]: ContextChunk[];
}

function buildKeywordIndex(chunks: ContextChunk[]): KeywordIndex {
  return chunks.reduce((index, chunk) => {
    chunk.keywords.forEach(keyword => {
      index[keyword] = index[keyword] || [];
      index[keyword].push(chunk);
    });
    return index;
  }, {});
}
```

### Strategy 3: Hierarchical Navigation

Navigate context through hierarchy:

```typescript
function navigateContext(hierarchy: ContextHierarchy, path: string[]): ContextChunk {
  let current = hierarchy.root;
  for (const segment of path) {
    if (!current.children[segment]) {
      throw new Error(`Path segment not found: ${segment}`);
    }
    current = current.children[segment];
  }
  return current.content;
}
```

## Multi-Step Task State Management

### State Structure

```typescript
interface TaskState {
  taskId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  steps: TaskStep[];
  currentStep: number;
  artifacts: Record<string, Artifact>;
  decisions: Decision[];
  checkpoints: Checkpoint[];
}

interface TaskStep {
  stepId: string;
  description: string;
  requiredContext: string[];
  expectedOutput: string;
  completed: boolean;
  result?: StepResult;
}
```

### State Transitions

```typescript
function transitionState(
  current: TaskState,
  event: StateEvent
): TaskState {
  switch (event.type) {
    case 'STEP_COMPLETE':
      return {
        ...current,
        currentStep: current.currentStep + 1,
        steps: updateStep(current.steps, event.stepId, { completed: true })
      };
    case 'BLOCKED':
      return { ...current, status: 'blocked' };
    case 'UNBLOCK':
      return { ...current, status: 'in_progress' };
    // ... other transitions
  }
}
```

## Context Audit Checklist

When reviewing or optimizing context:

- [ ] **Relevance**: Is all context relevant to current task?
- [ ] **Currency**: Is context up-to-date?
- [ ] **Completeness**: Are there gaps in context?
- [ ] **Organization**: Is context logically structured?
- [ ] **Retrievability**: Can context be found quickly?
- [ ] **Efficiency**: Is token usage optimized?
- [ ] **Dependencies**: Are dependencies clearly tracked?
- [ ] **Boundaries**: Are context boundaries respected?

## Practical Applications

### Application 1: Project Onboarding

1. Load project overview (Project Layer)
2. Load current task requirements (Session Layer)
3. Load relevant implementation details (Working Layer)
4. Retrieve reference documentation as needed (Reference Layer)

### Application 2: Cross-Module Refactoring

1. Map all affected modules
2. Identify shared dependencies
3. Plan refactoring order (least to most dependent)
4. Update context after each module change
5. Verify no circular dependencies introduced

### Application 3: Debugging Session

1. Load error context (error message, stack trace)
2. Load relevant code sections
3. Trace execution path
4. Identify potential causes
5. Test hypotheses in isolation
6. Document findings in session context

## Context Engineering Metrics

Track these metrics to improve context management:

- **Token Efficiency**: Useful tokens / Total tokens
- **Retrieval Accuracy**: Relevant results / Total retrievals
- **Context Hits**: Retrieved from cache / Total retrievals
- **Dependency Clarity**: Explicit dependencies / Total dependencies
- **Task Completion Rate**: Tasks completed / Tasks started
