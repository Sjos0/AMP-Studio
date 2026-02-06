-- =============================================================================
-- MIGRAÇÃO: Sistema de Memória Persistente AMP Studio
-- Baseado na arquitetura OpenClaw (https://github.com/openclaw/openclaw)
-- Adaptado para Supabase com embeddings Gemini text-embedding-004 (768 dims)
-- Data: 2026-02-06
-- =============================================================================

-- =============================================================================
-- EXTENSÕES NECESSÁRIAS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABELA 1: memory_files
-- Rastreia arquivos de memória indexados
-- =============================================================================

CREATE TABLE IF NOT EXISTS memory_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL DEFAULT 'memory',
    file_hash TEXT NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    line_count INTEGER DEFAULT 0,
    chunk_count INTEGER DEFAULT 0,
    embedding_model TEXT DEFAULT 'text-embedding-004',
    last_indexed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_memory_files_source ON memory_files(source);
CREATE INDEX IF NOT EXISTS idx_memory_files_path ON memory_files(path);
CREATE INDEX IF NOT EXISTS idx_memory_files_hash ON memory_files(file_hash);

-- =============================================================================
-- TABELA 2: memory_chunks
-- Armazena chunks de conteúdo com embeddings (~400 tokens, overlap 80)
-- =============================================================================

CREATE TABLE IF NOT EXISTS memory_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES memory_files(id) ON DELETE CASCADE,
    chunk_hash TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    start_line INTEGER NOT NULL,
    end_line INTEGER NOT NULL,
    content TEXT NOT NULL,
    content_preview TEXT,
    vector_score REAL DEFAULT 0,
    bm25_score REAL DEFAULT 0,
    embedding vector(768),
    embedding_model TEXT DEFAULT 'text-embedding-004',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_chunks_file ON memory_chunks(file_id);
CREATE INDEX IF NOT EXISTS idx_memory_chunks_hash ON memory_chunks(chunk_hash);

-- =============================================================================
-- TABELA 3: memory_embeddings_cache
-- Cache de embeddings para evitar re-embedding
-- =============================================================================

CREATE TABLE IF NOT EXISTS memory_embeddings_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    embedding vector(768),
    dimensions INTEGER DEFAULT 768,
    token_count INTEGER,
    access_count INTEGER DEFAULT 1,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, model, content_hash)
);

CREATE INDEX IF NOT EXISTS idx_memory_cache_hash ON memory_embeddings_cache(content_hash);

-- =============================================================================
-- TABELA 4: memory_ephemeral
-- Memória efêmera - logs diários (equivalente memory/YYYY-MM-DD.md)
-- =============================================================================

CREATE TABLE IF NOT EXISTS memory_ephemeral (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    date DATE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    chunk_count INTEGER DEFAULT 0,
    embedding_model TEXT DEFAULT 'text-embedding-004',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_memory_ephemeral_user ON memory_ephemeral(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_ephemeral_date ON memory_ephemeral(date);

-- =============================================================================
-- TABELA 5: memory_durable
-- Memória durável - conhecimento curado
-- =============================================================================

CREATE TABLE IF NOT EXISTS memory_durable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    importance_score REAL DEFAULT 0.5,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    embedding vector(768),
    embedding_model TEXT DEFAULT 'text-embedding-004',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_durable_user ON memory_durable(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_durable_category ON memory_durable(category);

-- =============================================================================
-- TABELA 6: memory_sessions
-- Memória de sessões - transcrições de conversas
-- =============================================================================

CREATE TABLE IF NOT EXISTS memory_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    session_slug TEXT NOT NULL,
    session_date DATE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    message_count INTEGER DEFAULT 0,
    token_count INTEGER DEFAULT 0,
    chunk_count INTEGER DEFAULT 0,
    embedding_model TEXT DEFAULT 'text-embedding-004',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, session_slug)
);

CREATE INDEX IF NOT EXISTS idx_memory_sessions_user ON memory_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_sessions_date ON memory_sessions(session_date);

-- =============================================================================
-- TABELA 7: memory_search_logs
-- Logs de busca para analytics
-- =============================================================================

CREATE TABLE IF NOT EXISTS memory_search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    avg_relevance_score REAL DEFAULT 0,
    search_type TEXT DEFAULT 'hybrid',
    latency_ms INTEGER DEFAULT 0,
    provider TEXT DEFAULT 'gemini',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_search_user ON memory_search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_search_date ON memory_search_logs(created_at);

-- =============================================================================
-- TABELA 8: memory_metrics
-- Métricas agregadas do sistema
-- =============================================================================

CREATE TABLE IF NOT EXISTS memory_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    metric_date DATE NOT NULL,
    total_chunks INTEGER DEFAULT 0,
    total_files INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    ephemeral_size_bytes BIGINT DEFAULT 0,
    durable_size_bytes BIGINT DEFAULT 0,
    session_size_bytes BIGINT DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    avg_search_latency_ms REAL DEFAULT 0,
    avg_indexing_time_ms REAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, metric_date)
);

-- =============================================================================
-- TABELA 9: memory_context_state
-- Estado do contexto atual para cada sessão
-- =============================================================================

CREATE TABLE IF NOT EXISTS memory_context_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    session_id UUID,
    current_tokens INTEGER DEFAULT 0,
    context_window_limit INTEGER DEFAULT 128000,
    compaction_threshold INTEGER DEFAULT 20000,
    last_compaction_at TIMESTAMP WITH TIME ZONE,
    memory_flush_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, session_id)
);

-- =============================================================================
-- FUNÇÕES ÚTEIS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_memory_ephemeral_updated_at
    BEFORE UPDATE ON memory_ephemeral
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_memory_durable_updated_at
    BEFORE UPDATE ON memory_durable
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_memory_sessions_updated_at
    BEFORE UPDATE ON memory_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- RLS - ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE memory_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_embeddings_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_ephemeral ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_durable ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_context_state ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users manage own files" ON memory_files FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own chunks" ON memory_chunks FOR ALL USING (true);
CREATE POLICY "Anyone can read cache" ON memory_embeddings_cache FOR SELECT USING (true);
CREATE POLICY "Users manage own ephemeral" ON memory_ephemeral FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own durable" ON memory_durable FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own sessions" ON memory_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own search logs" ON memory_search_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own metrics" ON memory_metrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own context" ON memory_context_state FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- COMENTÁRIOS
-- =============================================================================

COMMENT ON TABLE memory_files IS 'Rastreia arquivos de memória indexados. Baseado no schema OpenClaw files.';
COMMENT ON TABLE memory_chunks IS 'Armazena chunks de conteúdo com embeddings. Chunk size: ~400 tokens, overlap: 80 tokens.';
COMMENT ON TABLE memory_embeddings_cache IS 'Cache de embeddings para evitar re-embedding. SHA-256 hash-based deduplication.';
COMMENT ON TABLE memory_ephemeral IS 'Memória efêmera - logs diários. Equivalente ao memory/YYYY-MM-DD.md do OpenClaw.';
COMMENT ON TABLE memory_durable IS 'Memória durável - conhecimento curado. Equivalente ao MEMORY.md do OpenClaw.';
COMMENT ON TABLE memory_sessions IS 'Memória de sessões - transcrições de conversas. Equivalente ao sessions/*.md do OpenClaw.';
COMMENT ON TABLE memory_search_logs IS 'Logs de busca para analytics e métricas.';
COMMENT ON TABLE memory_metrics IS 'Métricas agregadas do sistema de memória.';
COMMENT ON TABLE memory_context_state IS 'Estado do contexto atual para cada sessão.';

-- =============================================================================
-- FIM DA MIGRAÇÃO
-- =============================================================================
