/**
 * Serviço de Embeddings
 * Sistema de Memória Persistente - AMP Studio
 * 
 * Suporta Gemini (padrão), OpenAI e modo local
 * Com cache SHA-256 para evitar re-embeddings
 */

import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { 
  MEMORY_CONSTANTS, 
  EmbeddingProvider, 
  MemoryEmbeddingCache,
  EmbeddingCacheInput 
} from '@/types';

// Configuração da API Gemini
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_EMBEDDING_MODEL = 'text-embedding-004';
const EMBEDDING_DIMS = MEMORY_CONSTANTS.EMBEDDING_DIMS; // 768

/**
 * Resultado de embedding
 */
export interface EmbeddingResult {
  embedding: number[];
  provider: EmbeddingProvider;
  model: string;
  dimensions: number;
  tokens: number;
}

/**
 * Gera embedding para um texto usando Gemini API
 */
async function getGeminiEmbedding(text: string): Promise<EmbeddingResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada');
  }

  // Truncar texto se necessário (Gemini tem limite de tokens)
  const maxChars = 20000; // Aproximadamente 5000 tokens
  const truncatedText = text.length > maxChars ? text.slice(0, maxChars) : text;

  const response = await fetch(
    `${GEMINI_API_URL}/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: {
          parts: [{ text: truncatedText }],
        },
        taskType: 'SEMANTIC_SIMILARITY',
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const values = data.embedding?.values || [];

  return {
    embedding: values,
    provider: 'gemini',
    model: GEMINI_EMBEDDING_MODEL,
    dimensions: values.length,
    tokens: Math.ceil(truncatedText.length / 4),
  };
}

/**
 * Gera embedding para um texto usando OpenAI API
 */
async function getOpenAIEmbedding(text: string): Promise<EmbeddingResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000), // Limite do modelo
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const values = data.data?.[0]?.embedding || [];

  return {
    embedding: values,
    provider: 'openai',
    model: 'text-embedding-3-small',
    dimensions: values.length,
    tokens: data.usage?.total_tokens || Math.ceil(text.length / 4),
  };
}

/**
 * Gera hash do conteúdo para cache
 */
function getContentHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Carrega embedding do cache local (memory)
 */
function getFromLocalCache(
  contentHash: string,
  provider: EmbeddingProvider,
  model: string
): number[] | null {
  // Cache em memória simples (em produção, usar Redis ou similar)
  const cacheKey = `${provider}:${model}:${contentHash}`;
  const cached = localEmbeddingsCache.get(cacheKey);
  
  if (cached) {
    cached.accessCount++;
    cached.lastAccessedAt = new Date();
    return cached.embedding;
  }
  
  return null;
}

/**
 * Salva embedding no cache local (memory)
 */
function saveToLocalCache(
  contentHash: string,
  provider: EmbeddingProvider,
  model: string,
  embedding: number[],
  tokens?: number
): void {
  const cacheKey = `${provider}:${model}:${contentHash}`;
  
  localEmbeddingsCache.set(cacheKey, {
    embedding,
    accessCount: 1,
    lastAccessedAt: new Date(),
    provider,
    model,
  });
}

// Cache em memória para embeddings (para uso durante sessão)
const localEmbeddingsCache = new Map<string, {
  embedding: number[];
  accessCount: number;
  lastAccessedAt: Date;
  provider: EmbeddingProvider;
  model: string;
}>();

/**
 * Carrega cache do Supabase
 */
export async function loadEmbeddingCache(
  contentHashes: string[]
): Promise<Map<string, { embedding: number[]; provider: string; model: string }>> {
  if (!supabase || contentHashes.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('memory_embeddings_cache')
    .select('content_hash, embedding, provider, model, access_count')
    .in('content_hash', contentHashes);

  if (error) {
    console.warn('Erro ao carregar cache de embeddings:', error);
    return new Map();
  }

  const cache = new Map<string, { embedding: number[]; provider: string; model: string }>();
  
  for (const item of data || []) {
    const key = `${item.provider}:${item.model}:${item.content_hash}`;
    cache.set(key, {
      embedding: item.embedding || [],
      provider: item.provider,
      model: item.model,
    });

    // Atualizar cache local
    localEmbeddingsCache.set(key, {
      embedding: item.embedding || [],
      accessCount: item.access_count || 0,
      lastAccessedAt: new Date(),
      provider: item.provider as EmbeddingProvider,
      model: item.model,
    });
  }

  return cache;
}

/**
 * Salva embedding no Supabase cache
 */
export async function saveEmbeddingToCache(
  input: EmbeddingCacheInput
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('memory_embeddings_cache')
    .upsert({
      provider: input.provider,
      model: input.model,
      content_hash: input.contentHash,
      embedding: input.embedding,
      dimensions: input.embedding.length,
      token_count: input.tokenCount,
      access_count: 1,
      last_accessed_at: new Date().toISOString(),
    }, {
      onConflict: 'provider,model,content_hash',
    });

  if (error) {
    console.warn('Erro ao salvar cache de embeddings:', error);
  }
}

/**
 * Gera embedding com cache
 * Tenta cache local → Supabase → API
 */
export async function getEmbedding(
  text: string,
  provider: EmbeddingProvider = 'gemini'
): Promise<EmbeddingResult> {
  const contentHash = getContentHash(text);
  const model = provider === 'gemini' ? GEMINI_EMBEDDING_MODEL : 'text-embedding-3-small';

  // 1. Tenta cache local
  const localResult = getFromLocalCache(contentHash, provider, model);
  if (localResult) {
    return {
      embedding: localResult,
      provider,
      model,
      dimensions: localResult.length,
      tokens: Math.ceil(text.length / 4),
    };
  }

  // 2. Tenta Supabase cache
  if (supabase) {
    const cache = await loadEmbeddingCache([contentHash]);
    const cacheKey = `${provider}:${model}:${contentHash}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      // Atualiza cache local
      saveToLocalCache(contentHash, provider, model, cached.embedding);
      
      return {
        embedding: cached.embedding,
        provider,
        model,
        dimensions: cached.embedding.length,
        tokens: Math.ceil(text.length / 4),
      };
    }
  }

  // 3. Gera novo embedding via API
  let result: EmbeddingResult;
  
  switch (provider) {
    case 'openai':
      result = await getOpenAIEmbedding(text);
      break;
    case 'gemini':
    default:
      result = await getGeminiEmbedding(text);
      break;
  }

  // 4. Salva no cache
  saveToLocalCache(contentHash, provider, model, result.embedding, result.tokens);
  
  await saveEmbeddingToCache({
    provider,
    model,
    contentHash,
    embedding: result.embedding,
    tokenCount: result.tokens,
  });

  return result;
}

/**
 * Gera embeddings para múltiplos textos em batch
 * Mais eficiente para indexação
 */
export async function getEmbeddingsBatch(
  texts: string[],
  provider: EmbeddingProvider = 'gemini'
): Promise<EmbeddingResult[]> {
  // Carrega cache primeiro
  const contentHashes = texts.map(t => getContentHash(t));
  const cache = await loadEmbeddingCache(contentHashes);

  const results: EmbeddingResult[] = [];
  const missingTexts: Array<{ index: number; text: string; hash: string }> = [];

  // Verifica cache
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const hash = contentHashes[i];
    const cacheKey = `${provider}:${(provider === 'gemini' ? GEMINI_EMBEDDING_MODEL : 'text-embedding-3-small')}:${hash}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      results[i] = {
        embedding: cached.embedding,
        provider,
        model: provider === 'gemini' ? GEMINI_EMBEDDING_MODEL : 'text-embedding-3-small',
        dimensions: cached.embedding.length,
        tokens: Math.ceil(text.length / 4),
      };
    } else {
      missingTexts.push({ index: i, text, hash });
    }
  }

  // Gera embeddings para textos não cacheados
  // Em produção, usaria batch API para maior eficiência
  for (const { index, text } of missingTexts) {
    const result = await getEmbedding(text, provider);
    results[index] = result;
  }

  return results;
}

/**
 * Calcula similaridade de cosseno entre dois vetores
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Limpa cache local (útil para testes ou quando modelo muda)
 */
export function clearLocalCache(): void {
  localEmbeddingsCache.clear();
}

/**
 * Estatísticas do cache local
 */
export function getLocalCacheStats(): { size: number; providers: Set<string> } {
  const providers = new Set<string>();
  localEmbeddingsCache.forEach((_, key) => {
    const [provider] = key.split(':');
    providers.add(provider);
  });
  
  return {
    size: localEmbeddingsCache.size,
    providers,
  };
}
