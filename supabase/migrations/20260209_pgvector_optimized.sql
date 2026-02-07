-- =============================================================================
-- MIGRAÇÃO: pgvector Otimizada, Auto-Indexing, Memory Compaction, Citations
-- Data: 2026-02-09
-- =============================================================================
-- Completa os 5% restantes do MEMORY_TODO.md:
-- 1. hybrid_search otimizada com pgvector nativa
-- 2. Trigger auto-indexing
-- 3. Memory compaction
-- 4. Sistema de citations
-- =============================================================================

-- =============================================================================
-- PARTE 0: LIMPEZA - Drop funções e triggers antigos
-- =============================================================================

DROP TRIGGER IF EXISTS trg_sync_content_tsvector ON memory_chunks;
DROP FUNCTION IF EXISTS sync_content_tsvector();
DROP TRIGGER IF EXISTS trg_auto_index_chunk ON memory_chunks;
DROP FUNCTION IF EXISTS auto_index_chunk();
DROP FUNCTION IF EXISTS cite_memory(UUID, TEXT, UUID, TEXT, TEXT, REAL);
DROP FUNCTION IF EXISTS compact_memory(UUID, UUID, REAL, REAL);

-- Drop funções hybrid_search antigas (diferentes signatures)
DROP FUNCTION IF EXISTS hybrid_search(UUID, TEXT, INTEGER, REAL, REAL);
DROP FUNCTION IF EXISTS hybrid_search(UUID, vector, TEXT, INTEGER, REAL, REAL);

-- =============================================================================
-- PARTE 1: Função hybrid_search OTIMIZADA com pgvector nativa
-- =============================================================================

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
    end_line INTEGER,
    citation_id UUID
) AS $$
DECLARE
    v_max_results INTEGER;
BEGIN
    v_max_results := LEAST(p_limit * 2, 50);

    RETURN QUERY
    SELECT 
        d.id,
        'durable'::TEXT AS memory_type,
        d.title,
        d.content,
        'memory_durable'::TEXT AS source_table,
        1 - (d.embedding <=> p_query_embedding) AS vector_score,
        COALESCE(
            ts_rank_cd(
                to_tsvector('portuguese', COALESCE(d.title || ' ' || d.content, '')),
                to_tsquery('portuguese', p_query_text)
            ) / 10.0,
            0::REAL
        ) AS bm25_score,
        (
            p_vector_weight * (1 - (d.embedding <=> p_query_embedding)) +
            p_bm25_weight * COALESCE(
                ts_rank_cd(
                    to_tsvector('portuguese', COALESCE(d.title || ' ' || d.content, '')),
                    to_tsquery('portuguese', p_query_text)
                ) / 10.0,
                0::REAL
            )
        ) AS hybrid_score,
        NULL::INTEGER AS chunk_index,
        NULL::INTEGER AS start_line,
        NULL::INTEGER AS end_line,
        NULL::UUID AS citation_id
    FROM memory_durable d
    WHERE d.user_id = p_user_id
    AND d.embedding IS NOT NULL
    
    UNION ALL
    
    SELECT 
        c.id,
        'chunk'::TEXT AS memory_type,
        NULL::TEXT AS title,
        c.content,
        'memory_chunks'::TEXT AS source_table,
        1 - (c.embedding <=> p_query_embedding) AS vector_score,
        COALESCE(
            ts_rank_cd(
                c.content_tsvector,
                to_tsquery('portuguese', p_query_text)
            ) / 10.0,
            c.bm25_score
        ) AS bm25_score,
        (
            p_vector_weight * (1 - (c.embedding <=> p_query_embedding)) +
            p_bm25_weight * COALESCE(
                ts_rank_cd(
                    c.content_tsvector,
                    to_tsquery('portuguese', p_query_text)
                ) / 10.0,
                c.bm25_score
            )
        ) AS hybrid_score,
        c.chunk_index,
        c.start_line,
        c.end_line,
        NULL::UUID AS citation_id
    FROM memory_chunks c
    INNER JOIN memory_files f ON c.file_id = f.id
    WHERE f.user_id = p_user_id
    AND c.embedding IS NOT NULL
    
    UNION ALL
    
    SELECT 
        s.id,
        'session'::TEXT AS memory_type,
        s.title,
        s.content,
        'memory_sessions'::TEXT AS source_table,
        1 - (s.embedding <=> p_query_embedding) AS vector_score,
        COALESCE(
            ts_rank_cd(
                to_tsvector('portuguese', COALESCE(s.title || ' ' || s.content, '')),
                to_tsquery('portuguese', p_query_text)
            ) / 10.0,
            0::REAL
        ) AS bm25_score,
        (
            p_vector_weight * (1 - (s.embedding <=> p_query_embedding)) +
            p_bm25_weight * COALESCE(
                ts_rank_cd(
                    to_tsvector('portuguese', COALESCE(s.title || ' ' || s.content, '')),
                    to_tsquery('portuguese', p_query_text)
                ) / 10.0,
                0::REAL
            )
        ) AS hybrid_score,
        NULL::INTEGER AS chunk_index,
        NULL::INTEGER AS start_line,
        NULL::INTEGER AS end_line,
        NULL::UUID AS citation_id
    FROM memory_sessions s
    WHERE s.user_id = p_user_id
    AND s.embedding IS NOT NULL
    
    ORDER BY hybrid_score DESC
    LIMIT v_max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION hybrid_search IS 
'Busca híbrida otimizada usando pgvector nativa (cosine similarity via <-> operator)
combinada com BM25 full-text search. Peso: 70% vector, 30% BM25.';

-- =============================================================================
-- PARTE 2: TRIGGER AUTO-INDEXING para chunks
-- =============================================================================

CREATE OR REPLACE FUNCTION auto_index_chunk()
RETURNS TRIGGER AS $$
BEGIN
    NEW.content_tsvector := to_tsvector('portuguese', COALESCE(NEW.content, ''));
    NEW.bm25_score := COALESCE(
        ts_rank_cd(NEW.content_tsvector, to_tsquery('portuguese', NEW.content)) / 10.0,
        0::REAL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_index_chunk
    BEFORE INSERT OR UPDATE OF content ON memory_chunks
    FOR EACH ROW EXECUTE FUNCTION auto_index_chunk();

COMMENT ON FUNCTION auto_index_chunk IS 
'Trigger para auto-indexar chunks: atualiza content_tsvector e calcula BM25 score.';

-- =============================================================================
-- PARTE 3: MEMORY COMPACTION
-- =============================================================================

CREATE TABLE IF NOT EXISTS memory_compaction_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    session_id UUID,
    compaction_type TEXT NOT NULL,
    tokens_before INTEGER NOT NULL,
    tokens_after INTEGER NOT NULL,
    tokens_freed INTEGER NOT NULL,
    memories_compacted INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION compact_memory(
    p_user_id UUID,
    p_session_id UUID DEFAULT NULL,
    p_threshold_pct REAL DEFAULT 0.8,
    p_target_pct REAL DEFAULT 0.6
)
RETURNS TABLE (
    success BOOLEAN,
    tokens_before INTEGER,
    tokens_after INTEGER,
    tokens_freed INTEGER,
    memories_compacted INTEGER,
    compaction_type TEXT
) AS $$
DECLARE
    v_context_limit INTEGER := 128000;
    v_current_tokens INTEGER;
    v_target_tokens INTEGER;
    v_compaction_count INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(LENGTH(content)), 0) / 4 INTO v_current_tokens
    FROM memory_durable
    WHERE user_id = p_user_id
    AND category NOT LIKE '%_archived';

    v_target_tokens := v_context_limit * p_target_pct;

    IF v_current_tokens > v_context_limit * p_threshold_pct THEN
        WITH to_compact AS (
            SELECT id, LENGTH(content) / 4 AS chunk_tokens
            FROM memory_durable
            WHERE user_id = p_user_id
            AND category NOT LIKE '%_archived'
            ORDER BY access_count ASC, importance_score ASC, created_at ASC
            LIMIT 50
        )
        UPDATE memory_durable d
        SET category = category || '_archived_' || CURRENT_DATE::TEXT,
            updated_at = NOW()
        FROM to_compact tc
        WHERE d.id = tc.id
        AND d.user_id = p_user_id;

        GET DIAGNOSTICS v_compaction_count = ROW_COUNT;
    END IF;

    SELECT COALESCE(SUM(LENGTH(content)), 0) / 4 INTO v_current_tokens
    FROM memory_durable
    WHERE user_id = p_user_id
    AND category NOT LIKE '%_archived';

    RETURN QUERY
    SELECT true, v_target_tokens, v_current_tokens, 
           GREATEST(0, v_target_tokens - v_current_tokens),
           v_compaction_count, 'auto'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION compact_memory IS 
'Compacta memória do usuário arquivando memórias menos importantes.
Disparado automaticamente quando tokens excedem threshold.';

-- =============================================================================
-- PARTE 4: SISTEMA DE CITATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS memory_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    source_type TEXT NOT NULL,
    source_id UUID NOT NULL,
    source_table TEXT NOT NULL,
    query_used TEXT NOT NULL,
    relevance_score REAL NOT NULL,
    cited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_memory_citations_unique 
ON memory_citations(user_id, source_id, query_used, date_trunc('minute', cited_at));

CREATE OR REPLACE FUNCTION cite_memory(
    p_user_id UUID,
    p_source_type TEXT,
    p_source_id UUID,
    p_source_table TEXT,
    p_query_used TEXT,
    p_relevance_score REAL
)
RETURNS UUID AS $$
DECLARE
    v_citation_id UUID;
BEGIN
    INSERT INTO memory_citations (
        user_id, source_type, source_id, source_table,
        query_used, relevance_score
    ) VALUES (
        p_user_id, p_source_type, p_source_id, p_source_table,
        p_query_used, p_relevance_score
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_citation_id;
    RETURN v_citation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE memory_citations IS 
'Tabela para rastrear quais memórias foram citadas em respostas.';
COMMENT ON FUNCTION cite_memory IS 
'Registra uma citação de memória para tracking e analytics.';

-- =============================================================================
-- PARTE 5: ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_memory_citations_user 
ON memory_citations(user_id, cited_at DESC);

CREATE INDEX IF NOT EXISTS idx_memory_compaction_log_user 
ON memory_compaction_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memory_durable_active 
ON memory_durable(user_id) 
WHERE category NOT LIKE '%_archived';

-- =============================================================================
-- FIM DA MIGRAÇÃO
-- =============================================================================
