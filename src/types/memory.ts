/**
 * Tipos TypeScript para o Sistema de Memória Persistente AMP Studio
 * Baseado na arquitetura OpenClaw com Supabase + Gemini Embeddings
 */

// =============================================================================
// Constantes do Sistema
// =============================================================================

export const MEMORY_CONSTANTS = {
  // Chunk configuration (equivalente ao OpenClaw)
  TARGET_CHUNK_TOKENS: 400,
  CHUNK_OVERLAP_TOKENS: 80,
  
  // Search weights
  VECTOR_WEIGHT: 0.7,
  BM25_WEIGHT: 0.3,
  
  // Limits
  SNIPPET_MAX_CHARS: 700,
  BATCH_MAX_TOKENS: 8000,
  
  // Embeddings
  EMBEDDING_DIMS: 768, // Gemini text-embedding-004
  EMBEDDING_MODEL: 'text-embedding-004',
  
  // Context
  CONTEXT_WINDOW_LIMIT: 128000,
  COMPACTION_THRESHOLD: 20000,
} as const;

// =============================================================================
// Types Base
// =============================================================================

/**
 * UUID - Identificador único
 */
export type UUID = string;

/**
 * Provider de embedding
 */
export type EmbeddingProvider = 'gemini' | 'openai' | 'local';

/**
 * Fonte de memória
 */
export type MemorySource = 'memory' | 'durable' | 'session';

/**
 * Categoria de memória durável
 */
export type DurableCategory = 'preferences' | 'goals' | 'decisions' | 'facts';

/**
 * Tipo de busca
 */
export type SearchType = 'vector' | 'bm25' | 'hybrid';

// =============================================================================
// Tabela: memory_files
// =============================================================================

/**
 * Arquivo de memória indexado
 */
export interface MemoryFile {
  id: UUID;
  path: string;
  source: MemorySource;
  fileHash: string;
  fileSizeBytes: number;
  lineCount: number;
  chunkCount: number;
  embeddingModel: string;
  lastIndexedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input para criar MemoryFile
 */
export interface CreateMemoryFileInput {
  path: string;
  source: MemorySource;
  fileHash: string;
  fileSizeBytes?: number;
  lineCount?: number;
  chunkCount?: number;
}

// =============================================================================
// Tabela: memory_chunks
// =============================================================================

/**
 * Chunk de conteúdo com embedding
 */
export interface MemoryChunk {
  id: UUID;
  fileId: UUID;
  chunkHash: string;
  chunkIndex: number;
  startLine: number;
  endLine: number;
  content: string;
  contentPreview?: string;
  vectorScore: number;
  bm25Score: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input para criar MemoryChunk
 */
export interface CreateMemoryChunkInput {
  fileId: UUID;
  content: string;
  chunkIndex: number;
  startLine: number;
  endLine: number;
  chunkHash?: string;
}

// =============================================================================
// Tabela: memory_embeddings_cache
// =============================================================================

/**
 * Cache de embedding
 */
export interface MemoryEmbeddingCache {
  id: UUID;
  provider: EmbeddingProvider;
  model: string;
  contentHash: string;
  embedding?: number[]; // 768 dimensões
  dimensions: number;
  tokenCount?: number;
  accessCount: number;
  lastAccessedAt: Date;
  createdAt: Date;
}

/**
 * Input para cache de embedding
 */
export interface EmbeddingCacheInput {
  provider: EmbeddingProvider;
  model: string;
  contentHash: string;
  embedding: number[];
  tokenCount?: number;
}

// =============================================================================
// Tabela: memory_ephemeral
// =============================================================================

/**
 * Memória efêmera - logs diários
 */
export interface MemoryEphemeral {
  id: UUID;
  userId: UUID;
  date: Date;
  title?: string;
  content: string;
  chunkCount: number;
  embeddingModel: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input para criar memória efêmera
 */
export interface CreateMemoryEphemeralInput {
  userId: UUID;
  date: Date;
  title?: string;
  content: string;
}

// =============================================================================
// Tabela: memory_durable
// =============================================================================

/**
 * Memória durável - conhecimento curado
 */
export interface MemoryDurable {
  id: UUID;
  userId: UUID;
  category: DurableCategory;
  title: string;
  content: string;
  importanceScore: number;
  accessCount: number;
  lastAccessedAt?: Date;
  embeddingModel: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input para criar memória durável
 */
export interface CreateMemoryDurableInput {
  userId: UUID;
  category: DurableCategory;
  title: string;
  content: string;
  importanceScore?: number;
}

// =============================================================================
// Tabela: memory_sessions
// =============================================================================

/**
 * Memória de sessão - transcrição de conversa
 */
export interface MemorySession {
  id: UUID;
  userId: UUID;
  sessionSlug: string;
  sessionDate: Date;
  title?: string;
  content: string;
  messageCount: number;
  tokenCount: number;
  chunkCount: number;
  embeddingModel: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input para criar sessão
 */
export interface CreateMemorySessionInput {
  userId: UUID;
  sessionSlug: string;
  sessionDate: Date;
  title?: string;
  content: string;
  messageCount?: number;
  tokenCount?: number;
}

// =============================================================================
// Tabela: memory_search_logs
// =============================================================================

/**
 * Log de busca para analytics
 */
export interface MemorySearchLog {
  id: UUID;
  userId: UUID;
  query: string;
  resultsCount: number;
  avgRelevanceScore: number;
  searchType: SearchType;
  latencyMs: number;
  provider: EmbeddingProvider;
  createdAt: Date;
}

/**
 * Input para criar log de busca
 */
export interface CreateSearchLogInput {
  userId: UUID;
  query: string;
  resultsCount: number;
  avgRelevanceScore?: number;
  searchType?: SearchType;
  latencyMs: number;
  provider?: EmbeddingProvider;
}

// =============================================================================
// Tabela: memory_metrics
// =============================================================================

/**
 * Métricas agregadas do sistema
 *
 * NOTA: Este tipo representa tanto dados persistidos (tabela memory_metrics)
 * quanto métricas calculadas em runtime pelo MemoryMetricsCollector.
 * Propriedades de persistência são opcionais para suportar ambos os casos.
 */
export interface MemoryMetrics {
  // === Propriedades de persistência (opcionais para runtime) ===
  id?: UUID;
  metricDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  
  // === Identificação ===
  userId: UUID;
  
  // === Contadores de chunks/arquivos ===
  totalChunks: number;
  totalFiles: number;
  totalSessions?: number;
  
  // === Contadores adicionais para dashboard ===
  ephemeralLogs: number;
  durableMemories: number;
  sessions: number;
  
  // === Tamanhos em bytes (opcionais - nem sempre disponíveis) ===
  ephemeralSizeBytes?: number;
  durableSizeBytes?: number;
  sessionSizeBytes?: number;
  
  // === Tamanhos em MB para dashboard ===
  ephemeralSizeMB: number;
  durableSizeMB: number;
  sessionSizeMB: number;
  totalSizeMB: number;
  
  // === Cache metrics ===
  cacheHits: number;
  cacheMisses: number;
  /** Taxa de acerto do cache de buscas (0-100) */
  hitRate: number;
  /** Taxa de acerto do cache de embeddings (0-100) */
  cacheHitRate: number;
  /** Taxa de acerto do cache de embeddings - alias para cacheHitRate (0-100) */
  embeddingCacheHitRate: number;
  
  // === Performance ===
  /** Latência de busca P95 em ms */
  searchLatencyP95: number;
  /** Latência de escrita P95 em ms */
  writeLatencyP95: number;
  avgSearchLatencyMs: number;
  avgIndexingTimeMs: number;
  
  // === Qualidade de busca ===
  /** Score de relevância médio (0-5) */
  relevanceScore: number;
  /** Similaridade semântica média (0-1) */
  semanticSimilarity: number;
  /** Cobertura de overlap de chunks (0-100) */
  chunkOverlapCoverage: number;
  /** Score híbrido BM25+vector (0-1) */
  hybridScore: number;
  /** Recall de contexto (0-100) */
  contextRecall: number;
  
  // === Custos ===
  /** Custo de embedding por query em USD */
  embeddingCostPerQuery: number;
  
  // === Saúde do sistema ===
  /** Frescor da memória em minutos */
  memoryFreshnessMinutes: number;
  /** Consistência do índice em percentual */
  indexConsistencyPercent: number;
  /** Economia de cache em percentual */
  cacheSavingsPercent: number;
  /** Violações de isolamento entre agentes */
  agentIsolationViolations: number;
  
  // === Contexto (opcionais - nem sempre disponíveis) ===
  currentTokens?: number;
  contextUtilizationPercent?: number;
}

// =============================================================================
// Tabela: memory_context_state
// =============================================================================

/**
 * Estado do contexto atual
 */
export interface MemoryContextState {
  id: UUID;
  userId: UUID;
  sessionId?: UUID;
  currentTokens: number;
  contextWindowLimit: number;
  compactionThreshold: number;
  lastCompactionAt?: Date;
  memoryFlushCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// Tipos de Busca e Resultados
// =============================================================================

/**
 * Resultado de busca semântica
 */
export interface SearchResult {
  chunkId: UUID;
  filePath?: string;
  content: string;
  startLine: number;
  endLine: number;
  relevanceScore: number;
  vectorScore?: number;
  bm25Score?: number;
}

/**
 * Input para busca
 */
export interface SearchInput {
  query: string;
  userId: UUID;
  maxResults?: number;
  minScore?: number;
  sources?: MemorySource[];
  sessionKey?: string;
}

/**
 * Resposta de busca
 */
export interface SearchResponse {
  results: SearchResult[];
  provider: EmbeddingProvider;
  model: string;
  totalResults: number;
  latencyMs: number;
}

// =============================================================================
// Tipos de Indexação
// =============================================================================

/**
 * Resultado de indexação de arquivo
 */
export interface IndexResult {
  fileId: UUID;
  chunksCreated: number;
  chunksUpdated: number;
  embeddingsGenerated: number;
  timeMs: number;
}

// =============================================================================
// Tipos de Métricas (para dashboard)
// =============================================================================

/**
 * Dashboard de métricas
 */
export interface MemoryDashboard {
  userId: UUID;
  
  // Contadores
  totalChunks: number;
  totalFiles: number;
  ephemeralLogs: number;
  durableMemories: number;
  sessions: number;
  
  // Tamanhos
  ephemeralSizeMB: number;
  durableSizeMB: number;
  sessionSizeMB: number;
  totalSizeMB: number;
  
  // Cache
  cacheHitRate: number;
  cacheHits: number;
  cacheMisses: number;
  
  // Performance
  avgSearchLatencyMs: number;
  avgIndexingTimeMs: number;
  
  // Contexto
  currentTokens: number;
  contextUtilizationPercent: number;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Paginação
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Ordenação
 */
export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  field: string;
  order: SortOrder;
}

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Resposta padrão da API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Erro de validação
 */
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResponse {
  success: boolean;
  errors: ValidationError[];
}
