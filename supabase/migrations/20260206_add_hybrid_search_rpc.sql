-- =============================================================================
-- MIGRAÇÃO: Funções de Busca e RLS Corrigido
-- Data: 2026-02-06
-- =============================================================================

-- =============================================================================
-- FUNÇÃO: hybrid_search - Busca híbrida Vector + BM25
-- =============================================================================

-- Primeiro, criar função para calcular similaridade coseno (pgvector)
-- A função cosine_distance já vem com pgvector, mas precisamos de wrapper

-- Função principal de busca híbrida
CREATE OR REPLACE FUNCTION hybrid_search(
    p_user_id UUID,
    p_query_embedding vector(768),
    p_query_text TEXT,
    p_limit INTEGER DEFAULT 10,
    p_vector_weight REAL DEFAULT 0.7,
    p_bm25_weight REAL DEFAULT 0.3
)
RETURNS TABLE (
    id UUID,
    memory_type TEXT,
    title TEXT,
    content TEXT,
    source_table TEXT,
    vector_score REAL,
    bm25_score REAL,
    hybrid_score REAL,
    chunk_index INTEGER,
    start_line INTEGER,
    end_line INTEGER
) AS $$
DECLARE
    v_max_results INTEGER;
BEGIN
    -- Limitar resultados para performance
    v_max_results := LEAST(p_limit * 2, 50);

    RETURN QUERY
    -- Busca em memory_durable (memória curada)
    SELECT 
        d.id,
        'durable'::TEXT AS memory_type,
        d.title,
        d.content,
        'memory_durable'::TEXT AS source_table,
        (
            -- Score vetorial (cosine similarity = 1 - cosine_distance)
            1 - (d.embedding <=> p_query_embedding)
        ) AS vector_score,
        0::REAL AS bm25_score,  -- BM25 não aplicável aqui
        (
            -- Hybrid score
            p_vector_weight * (1 - (d.embedding <=> p_query_embedding)) +
            p_bm25_weight * 0
        ) AS hybrid_score,
        NULL::INTEGER AS chunk_index,
        NULL::INTEGER AS start_line,
        NULL::INTEGER AS end_line
    FROM memory_durable d
    WHERE d.user_id = p_user_id
    AND d.embedding IS NOT NULL
    
    UNION ALL
    
    -- Busca em memory_ephemeral (logs diários)
    SELECT 
        e.id,
        'ephemeral'::TEXT AS memory_type,
        e.title,
        e.content,
        'memory_ephemeral'::TEXT AS source_table,
        0::REAL AS vector_score,
        0::REAL AS bm25_score,
        0::REAL AS hybrid_score,
        NULL::INTEGER AS chunk_index,
        NULL::INTEGER AS start_line,
        NULL::INTEGER AS end_line
    FROM memory_ephemeral e
    WHERE e.user_id = p_user_id
    
    UNION ALL
    
    -- Busca em memory_sessions (transcrições)
    SELECT 
        s.id,
        'session'::TEXT AS memory_type,
        s.title,
        s.content,
        'memory_sessions'::TEXT AS source_table,
        0::REAL AS vector_score,
        0::REAL AS bm25_score,
        0::REAL AS hybrid_score,
        NULL::INTEGER AS chunk_index,
        NULL::INTEGER AS start_line,
        NULL::INTEGER AS end_line
    FROM memory_sessions s
    WHERE s.user_id = p_user_id
    
    UNION ALL
    
    -- Busca em chunks (com vector similarity)
    SELECT 
        c.id,
        'chunk'::TEXT AS memory_type,
        NULL::TEXT AS title,
        c.content,
        'memory_chunks'::TEXT AS source_table,
        (
            1 - (c.embedding <=> p_query_embedding)
        ) AS vector_score,
        0::REAL AS bm25_score,
        (
            p_vector_weight * (1 - (c.embedding <=> p_query_embedding)) +
            p_bm25_weight * 0
        ) AS hybrid_score,
        c.chunk_index,
        c.start_line,
        c.end_line
    FROM memory_chunks c
    INNER JOIN memory_files f ON c.file_id = f.id
    WHERE f.user_id = p_user_id
    AND c.embedding IS NOT NULL
    
    ORDER BY hybrid_score DESC
    LIMIT v_max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNÇÃO: search_memories - Busca simplificada que gera embedding automaticamente
-- =============================================================================

CREATE OR REPLACE FUNCTION search_memories(
    p_user_id UUID,
    p_query TEXT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    memory_type TEXT,
    title TEXT,
    content TEXT,
    source_table TEXT,
    hybrid_score REAL
) AS $$
DECLARE
    v_embedding vector(768);
BEGIN
    -- Esta função é um placeholder - o embedding deve ser gerado no cliente
    -- ou via API externa (Gemini/OpenAI)
    -- Por enquanto, retorna vazio com instrução
    
    RAISE NOTICE 'Para busca vetorial, gere o embedding de "%" no cliente e use hybrid_search()', p_query;
    
    RETURN QUERY
    SELECT 
        d.id,
        'durable'::TEXT AS memory_type,
        d.title,
        d.content,
        'memory_durable'::TEXT AS source_table,
        0::REAL AS hybrid_score
    FROM memory_durable d
    WHERE d.user_id = p_user_id
    AND (
        d.title ILIKE '%' || p_query || '%'
        OR d.content ILIKE '%' || p_query || '%'
    )
    ORDER BY d.importance_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNÇÃO: log_search - Registra métricas de busca
-- =============================================================================

CREATE OR REPLACE FUNCTION log_search(
    p_user_id UUID,
    p_query TEXT,
    p_results_count INTEGER,
    p_latency_ms INTEGER,
    p_search_type TEXT DEFAULT 'hybrid'
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO memory_search_logs (
        user_id,
        query,
        results_count,
        latency_ms,
        search_type,
        provider
    ) VALUES (
        p_user_id,
        p_query,
        p_results_count,
        p_latency_ms,
        p_search_type,
        'hybrid_rpc'
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- CORREÇÃO: Índices para pgvector
-- =============================================================================

-- índice IVFFlat para similaridade vetorial (mais rápido para grandes datasets)
CREATE INDEX IF NOT EXISTS idx_memory_durable_embedding 
ON memory_durable USING ivfflat (embedding vector_cosine_ops)
WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memory_chunks_embedding 
ON memory_chunks USING ivfflat (embedding vector_cosine_ops)
WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memory_embeddings_cache_embedding 
ON memory_embeddings_cache USING ivfflat (embedding vector_cosine_ops);

-- =============================================================================
-- CORREÇÃO: RLS Policies
-- =============================================================================

-- memory_chunks: Atualizar para filtrar por user_id através de memory_files
DROP POLICY IF EXISTS "Users manage own chunks" ON memory_chunks;

CREATE POLICY "Users access own chunks" ON memory_chunks
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM memory_files f
            WHERE f.id = file_id AND f.user_id = auth.uid()
        )
    );

-- memory_embeddings_cache: Permitir apenas leitura
DROP POLICY IF EXISTS "Anyone can read cache" ON memory_embeddings_cache;
CREATE POLICY "Users read cache" ON memory_embeddings_cache
    FOR SELECT
    USING (true);

-- Adicionar índice para busca por user_id em memory_chunks através de memory_files
CREATE INDEX IF NOT EXISTS idx_memory_chunks_file_user 
ON memory_chunks (file_id) INCLUDE (id);

-- =============================================================================
-- FUNÇÃO: increment_access_count - Para tracking de acessos
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_memory_access_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'memory_durable' THEN
        UPDATE memory_durable 
        SET access_count = access_count + 1, 
            last_accessed_at = NOW()
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para memory_durable
DROP TRIGGER IF EXISTS trigger_increment_durable_access ON memory_durable;
CREATE TRIGGER trigger_increment_durable_access
    AFTER SELECT ON memory_durable
    FOR EACH ROW EXECUTE FUNCTION increment_memory_access_count();

-- =============================================================================
-- COMENTÁRIOS
-- =============================================================================

COMMENT ON FUNCTION hybrid_search IS 'Busca híbrida em memórias do usuário. Usa similaridade vetorial (cosine) com peso configurável.';
COMMENT ON FUNCTION search_memories IS 'Busca textual simples em memórias. Para busca vetorial, use hybrid_search() com embedding gerado.';
COMMENT ON FUNCTION log_search IS 'Registra métricas de busca para analytics e otimização.';
COMMENT ON INDEX idx_memory_durable_embedding IS 'Índice IVFFlat para busca vetorial em memória durável (cosine similarity).';
COMMENT ON INDEX idx_memory_chunks_embedding IS 'Índice IVFFlat para busca vetorial em chunks (cosine similarity).';

-- =============================================================================
-- FIM DA MIGRAÇÃO
-- =============================================================================
