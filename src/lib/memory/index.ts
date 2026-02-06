/**
 * Memory Module - Sistema de Memória Persistente
 * AMP Studio - Implementação baseada no OpenClaw
 */

// Re-export do serviço principal
export { MemoryService, createMemoryService } from './core';

// Re-export do chunking
export { 
  chunkMarkdown, 
  chunkSimpleText,
  generateChunkHash,
  filterNewChunks,
  getChunkingStats,
  type Chunk,
  type ChunkingConfig,
  type ChunkingStats,
} from './chunking';

// Re-export do embeddings
export { 
  getEmbedding,
  getEmbeddingsBatch,
  cosineSimilarity,
  loadEmbeddingCache,
  saveEmbeddingToCache,
  clearLocalCache,
  getLocalCacheStats,
  type EmbeddingResult,
} from './embeddings';

// Re-export do hook
export { useMemory, useSimpleMemory } from './useMemory';
