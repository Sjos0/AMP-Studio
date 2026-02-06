/**
 * Serviço Principal de Memória
 * Sistema de Memória Persistente - AMP Studio
 * 
 * Implementação baseada no OpenClaw MemoryIndexManager
 * Suporta: indexação, busca híbrida, memórias efêmeras e duráveis
 */

import { supabase } from '@/lib/supabase';
import { chunkMarkdown, Chunk, getChunkingStats } from './chunking';
import { 
  getEmbedding, 
  getEmbeddingsBatch, 
  cosineSimilarity,
} from './embeddings';
import { 
  MEMORY_CONSTANTS,
  UUID,
  MemorySource,
  SearchInput,
  SearchResponse,
  SearchResult,
  MemoryFile,
  MemoryChunk,
  CreateMemoryFileInput,
  CreateMemoryChunkInput,
  IndexResult,
  CreateMemoryDurableInput,
  MemoryDurable,
  CreateMemoryEphemeralInput,
  MemoryEphemeral,
  CreateMemorySessionInput,
  MemorySession,
} from '@/types';
import crypto from 'crypto';

/**
 * Configuração da memória
 */
export interface MemoryConfig {
  vectorWeight: number;      // 0.7 padrão
  bm25Weight: number;        // 0.3 padrão
  maxResults: number;        // 6 padrão
  snippetMaxChars: number;   // 700 padrão
  embeddingProvider: 'gemini' | 'openai' | 'local';
}

const DEFAULT_CONFIG: MemoryConfig = {
  vectorWeight: MEMORY_CONSTANTS.VECTOR_WEIGHT,
  bm25Weight: MEMORY_CONSTANTS.BM25_WEIGHT,
  maxResults: 6,
  snippetMaxChars: MEMORY_CONSTANTS.SNIPPET_MAX_CHARS,
  embeddingProvider: 'gemini',
};

/**
 * Item de arquivo indexado
 */
interface IndexedFile {
  id: UUID;
  path: string;
  source: MemorySource;
  hash: string;
  chunks: Chunk[];
}

/**
 * Gerencia a memória do usuário
 */
export class MemoryService {
  private userId: UUID;
  private config: MemoryConfig;
  private indexedFiles: Map<string, IndexedFile> = new Map();

  constructor(userId: UUID, config: Partial<MemoryConfig> = {}) {
    this.userId = userId;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Indexa um arquivo de memória
   */
  async indexFile(
    path: string,
    content: string,
    source: MemorySource = 'memory'
  ): Promise<IndexResult> {
    const startTime = Date.now();
    const fileHash = await this.hashContent(content);

    // Verifica se arquivo já existe e não mudou
    const existingFile = await this.getFileByPath(path, source);
    if (existingFile && existingFile.fileHash === fileHash) {
      return {
        fileId: existingFile.id,
        chunksCreated: 0,
        chunksUpdated: 0,
        embeddingsGenerated: 0,
        timeMs: Date.now() - startTime,
      };
    }

    // Faz chunking do conteúdo
    const chunks = chunkMarkdown(content);
    const existingChunkHashes = await this.loadChunkHashes(source, path);
    const newChunks = chunks.filter(c => !existingChunkHashes.has(c.hash));

    // Gera embeddings para chunks novos
    let embeddingsGenerated = 0;
    if (newChunks.length > 0) {
      const texts = newChunks.map(c => c.content);
      const embeddings = await getEmbeddingsBatch(texts, this.config.embeddingProvider);
      embeddingsGenerated = embeddings.length;
    }

    // Salva arquivo no banco
    const fileId = await this.upsertFile({
      path,
      source,
      fileHash,
      fileSizeBytes: content.length,
      lineCount: content.split('\n').length,
      chunkCount: chunks.length,
    });

    // Salva chunks no banco
    const chunksCreated = await this.upsertChunks(fileId, chunks, source);

    // Atualiza cache local
    this.indexedFiles.set(`${source}:${path}`, {
      id: fileId,
      path,
      source,
      hash: fileHash,
      chunks,
    });

    return {
      fileId,
      chunksCreated,
      chunksUpdated: chunks.length - chunksCreated,
      embeddingsGenerated,
      timeMs: Date.now() - startTime,
    };
  }

  /**
   * Busca semântica híbrida (Vector + BM25)
   * Usa a função hybrid_search do PostgreSQL
   */
  async search(input: SearchInput): Promise<SearchResponse> {
    const startTime = Date.now();
    const maxResults = input.maxResults || this.config.maxResults;

    // Gera embedding da query
    const queryEmbedding = await getEmbedding(input.query, this.config.embeddingProvider);

    // Busca híbrida via PostgreSQL (70% vector + 30% BM25)
    const { data: hybridResults, error } = await supabase
      .rpc('hybrid_search', {
        query_text: input.query,
        query_embedding: queryEmbedding.embedding,
        match_count: maxResults,
        user_uuid: this.userId,
      });

    if (error) {
      // Fallback para busca vector-only se hybrid_search falhar
      console.warn('[Memory] Hybrid search failed, falling back to vector-only:', error);
      return this.searchFallback(input, queryEmbedding);
    }

    const results: SearchResult[] = (hybridResults || []).map((chunk: any) => ({
      chunkId: chunk.id,
      filePath: chunk.path,
      content: chunk.content.slice(0, this.config.snippetMaxChars),
      startLine: chunk.start_line,
      endLine: chunk.end_line,
      relevanceScore: chunk.combined_score,
      vectorScore: chunk.vector_score,
      bm25Score: chunk.bm25_score,
    }));

    // Log da busca
    await this.logSearch({
      userId: this.userId,
      query: input.query,
      resultsCount: results.length,
      avgRelevanceScore: results.length > 0 
        ? results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length 
        : 0,
      searchType: 'hybrid',
      latencyMs: Date.now() - startTime,
      provider: this.config.embeddingProvider,
    });

    return {
      results,
      provider: this.config.embeddingProvider,
      model: queryEmbedding.model,
      totalResults: results.length,
      latencyMs: Date.now() - startTime,
    };
  }

  /**
   * Fallback para busca vector-only
   */
  private async searchFallback(input: SearchInput, queryEmbedding: { embedding: number[], model: string }): Promise<SearchResponse> {
    const startTime = Date.now();
    const maxResults = input.maxResults || this.config.maxResults;

    // Busca chunks do banco
    const chunks = await this.searchChunks(input.query, maxResults * 4);

    // Calcula similaridade de cosseno
    const scoredChunks = chunks.map(chunk => {
      const vectorScore = chunk.embedding 
        ? cosineSimilarity(queryEmbedding.embedding, chunk.embedding)
        : 0;

      return {
        ...chunk,
        vectorScore,
        relevanceScore: vectorScore * this.config.vectorWeight,
      };
    });

    // Ordena e limita resultados
    scoredChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const results: SearchResult[] = scoredChunks
      .slice(0, maxResults)
      .map(chunk => ({
        chunkId: chunk.id,
        filePath: chunk.path,
        content: chunk.content.slice(0, this.config.snippetMaxChars),
        startLine: chunk.start_line,
        endLine: chunk.end_line,
        relevanceScore: chunk.relevanceScore,
        vectorScore: chunk.vectorScore,
        bm25Score: chunk.bm25_score || undefined,
      }));

    // Log da busca
    await this.logSearch({
      userId: this.userId,
      query: input.query,
      resultsCount: results.length,
      avgRelevanceScore: results.length > 0 
        ? results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length 
        : 0,
      searchType: 'vector_fallback',
      latencyMs: Date.now() - startTime,
      provider: this.config.embeddingProvider,
    });

    return {
      results,
      provider: this.config.embeddingProvider,
      model: queryEmbedding.model,
      totalResults: results.length,
      latencyMs: Date.now() - startTime,
    };
  }

  /**
   * Cria memória durável
   */
  async createDurableMemory(input: CreateMemoryDurableInput): Promise<MemoryDurable> {
    const embedding = await getEmbedding(input.content, this.config.embeddingProvider);

    const { data, error } = await supabase
      .from('memory_durable')
      .insert({
        user_id: this.userId,
        category: input.category,
        title: input.title,
        content: input.content,
        importance_score: input.importanceScore || 0.5,
        embedding: embedding.embedding,
        embedding_model: embedding.model,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapDurableMemory(data);
  }

  /**
   * Cria memória efêmera
   */
  async createEphemeralMemory(input: CreateMemoryEphemeralInput): Promise<MemoryEphemeral> {
    const { data, error } = await supabase
      .from('memory_ephemeral')
      .insert({
        user_id: this.userId,
        date: input.date.toISOString().split('T')[0],
        title: input.title,
        content: input.content,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapEphemeralMemory(data);
  }

  /**
   * Cria memória de sessão
   */
  async createSessionMemory(input: CreateMemorySessionInput): Promise<MemorySession> {
    const embedding = await getEmbedding(input.content, this.config.embeddingProvider);

    const { data, error } = await supabase
      .from('memory_sessions')
      .insert({
        user_id: this.userId,
        session_slug: input.sessionSlug,
        session_date: input.sessionDate.toISOString().split('T')[0],
        title: input.title,
        content: input.content,
        message_count: input.messageCount,
        token_count: input.tokenCount,
        embedding: embedding.embedding,
        embedding_model: embedding.model,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapSessionMemory(data);
  }

  /**
   * Obtém memórias recentes
   */
  async getRecentMemories(): Promise<MemoryEphemeral[]> {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('memory_ephemeral')
      .select('*')
      .eq('user_id', this.userId)
      .in('date', [today, yesterday])
      .order('date', { ascending: false })
      .limit(10);

    if (error) throw error;
    return (data || []).map(this.mapEphemeralMemory);
  }

  // Métodos privados de apoio
  private async upsertFile(input: CreateMemoryFileInput): Promise<UUID> {
    const { data, error } = await supabase
      .from('memory_files')
      .upsert({
        user_id: this.userId,
        path: input.path,
        source: input.source,
        file_hash: input.fileHash,
        file_size_bytes: input.fileSizeBytes,
        line_count: input.lineCount,
        chunk_count: input.chunkCount,
        embedding_model: MEMORY_CONSTANTS.EMBEDDING_MODEL,
        last_indexed_at: new Date().toISOString(),
      }, { onConflict: 'path' })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  private async upsertChunks(fileId: UUID, chunks: Chunk[], source: MemorySource): Promise<number> {
    const existingHashes = await this.loadChunkHashes(source, undefined, fileId);
    const newChunks = chunks.filter(c => !existingHashes.has(c.hash));

    if (newChunks.length === 0) return 0;

    const texts = newChunks.map(c => c.content);
    const embeddings = await getEmbeddingsBatch(texts, this.config.embeddingProvider);

    const records = newChunks.map((chunk, i) => ({
      file_id: fileId,
      chunk_hash: chunk.hash,
      chunk_index: chunk.index,
      start_line: chunk.startLine,
      end_line: chunk.endLine,
      content: chunk.content,
      content_preview: chunk.content.slice(0, 200),
      embedding: embeddings[i].embedding,
      embedding_model: embeddings[i].model,
      source,
    }));

    const { error } = await supabase
      .from('memory_chunks')
      .upsert(records, { onConflict: 'file_id,chunk_hash' });

    if (error) throw error;
    return newChunks.length;
  }

  private async searchChunks(query: string, limit: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('memory_chunks')
      .select(`
        id, file_id, start_line, end_line, content, embedding, bm25_score,
        memory_files(path)
      `)
      .eq('memory_files.user_id', this.userId)
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  private async loadChunkHashes(source: MemorySource, path?: string, fileId?: UUID): Promise<Set<string>> {
    let query = supabase.from('memory_chunks').select('chunk_hash').eq('source', source);
    if (fileId) query = query.eq('file_id', fileId);
    else if (path) query = query.eq('memory_files.path', path);

    const { data, error } = await query;
    if (error) return new Set();
    return new Set((data || []).map(d => d.chunk_hash));
  }

  private async logSearch(log: any): Promise<void> {
    await supabase.from('memory_search_logs').insert(log);
  }

  private async getFileByPath(path: string, source: MemorySource): Promise<MemoryFile | null> {
    const { data, error } = await supabase
      .from('memory_files')
      .select('*')
      .eq('path', path)
      .eq('source', source)
      .eq('user_id', this.userId)
      .single();

    if (error) return null;
    return data;
  }

  private async hashContent(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private mapDurableMemory(data: any): MemoryDurable {
    return {
      id: data.id,
      userId: data.user_id,
      category: data.category,
      title: data.title,
      content: data.content,
      importanceScore: data.importance_score,
      accessCount: data.access_count,
      lastAccessedAt: data.last_accessed_at,
      embeddingModel: data.embedding_model,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapEphemeralMemory(data: any): MemoryEphemeral {
    return {
      id: data.id,
      userId: data.user_id,
      date: new Date(data.date),
      title: data.title,
      content: data.content,
      chunkCount: data.chunk_count,
      embeddingModel: data.embedding_model,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapSessionMemory(data: any): MemorySession {
    return {
      id: data.id,
      userId: data.user_id,
      sessionSlug: data.session_slug,
      sessionDate: new Date(data.session_date),
      title: data.title,
      content: data.content,
      messageCount: data.message_count,
      tokenCount: data.token_count,
      chunkCount: data.chunk_count,
      embeddingModel: data.embedding_model,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

/**
 * Factory para criar instância de MemoryService
 */
export function createMemoryService(userId: UUID): MemoryService {
  return new MemoryService(userId);
}
