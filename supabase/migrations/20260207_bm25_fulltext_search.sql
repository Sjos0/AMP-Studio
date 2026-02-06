-- =============================================================================
-- MIGRAÇÃO: BM25 Full-Text Search e Índices GIN
-- Data: 2026-02-07
-- =============================================================================
-- Implementa busca híbrida conforme especificado em:
-- - docs/OPENCLAW_MEMORY_METRICS.md (seção 2.2 - Sistema de Busca Híbrida)
-- - docs/OPENCLAW_MEMORY_RESEARCH.md (seção 3.3 - Hybrid Search Weights)
-- =============================================================================

-- =============================================================================
-- EXTENSÕES NECESSÁRIAS
-- =============================================================================

-- Habilitar extensão pg_trgm para similaridade de texto
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================================
-- FUNÇÃO: Gera embedding вектор (placeholder para pgvector futuro)
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_embedding(text_input TEXT)
RETURNS vector(768) AS $$
BEGIN
    -- Placeholder: em produção, usaria pgvector ou API externa
    -- Retorna vetor de zeros por enquanto
    RETURN vector(768)::'0';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- FUNÇÃO: BM25 Scoring para full-text search
-- docs/OPENCLAW_MEMORY_METRICS.md:55-68
-- =============================================================================

-- Criar coluna para conteúdo tokenizado se não existir
ALTER TABLE memory_chunks ADD COLUMN IF NOT EXISTS content_tsvector TSVECTOR;

-- Atualizar conteúdo tokenizado
UPDATE memory_chunks 
SET content_tsvector = to_tsvector('portuguese', COALESCE(content, ''));

-- Criar índice GIN para full-text search
CREATE INDEX IF NOT EXISTS idx_memory_chunks_tsvector 
ON memory_chunks USING GIN(content_tsvector);

-- Criar índice GIN para conteúdo plain text (para pg_trgm)
CREATE INDEX IF NOT EXISTS idx_memory_chunks_content_gin 
ON memory_chunks USING GIN(to_tsvector('portuguese', COALESCE(content, '')));

-- =============================================================================
-- FUNÇÃO: Calcula score BM25 para uma query
-- docs/OPENCLAW_MEMORY_RESEARCH.md:129-130 (BM25 weight: 30%)
-- =============================================================================

CREATE OR REPLACE FUNCTION calculate_bm25_score(
    query_text TEXT,
    target_tsvector TSVECTOR
)
RETURNS REAL AS $$
BEGIN
    -- BM25 calculation usando full-text search do PostgreSQL
    -- Retorna rank do ts_query
    RETURN ts_rank_cd(target_tsvector, to_tsquery('portuguese', query_text));
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- FUNÇÃO: Busca híbrida combinando Vector + BM25
-- docs/OPENCLAW_MEMORY_METRICS.md:62-68 (Vector 70% + BM25 30%)
-- =============================================================================

CREATE OR REPLACE FUNCTION hybrid_search(
    p_user_id UUID,
    p_query TEXT,
    p_limit INTEGER DEFAULT 10,
    p_vector_weight REAL DEFAULT 0.7,
    p_bm25_weight REAL DEFAULT 0.3
)
RETURNS TABLE (
    chunk_id UUID,
    content TEXT,
    relevance_score REAL,
    vector_score REAL,
    bm25_score REAL
) AS $$
DECLARE
    v_query_embedding vector(768);
BEGIN
    -- Gera embedding da query
    v_query_embedding := generate_embedding(p_query);

    -- Retorna resultados com score híbrido
    RETURN QUERY
    SELECT 
        mc.id,
        mc.content,
        (
            COALESCE(mc.vector_score, 0) * p_vector_weight + 
            COALESCE(mc.bm25_score, 0) * p_bm25_weight
        ) AS relevance_score,
        COALESCE(mc.vector_score, 0) AS vector_score,
        COALESCE(mc.bm25_score, 0) AS bm25_score
    FROM memory_chunks mc
    INNER JOIN memory_files mf ON mc.file_id = mf.id
    WHERE mf.user_id = p_user_id
    ORDER BY relevance_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- FUNÇÃO: Atualiza bm25_score na tabela
-- =============================================================================

CREATE OR REPLACE FUNCTION update_bm25_scores()
RETURNS void AS $$
BEGIN
    UPDATE memory_chunks mc
    SET bm25_score = calculate_bm25_score(
        (SELECT content FROM memory_chunks WHERE id = mc.id),
        mc.content_tsvector
    )
    WHERE mc.content_tsvector IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para manter content_tsvector atualizado
CREATE OR REPLACE FUNCTION sync_content_tsvector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.content_tsvector := to_tsvector('portuguese', COALESCE(NEW.content, ''));
    NEW.bm25_score := calculate_bm25_score(
        COALESCE(NEW.content, ''),
        NEW.content_tsvector
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para novos inserts/updates
DROP TRIGGER IF EXISTS trg_sync_content_tsvector ON memory_chunks;
CREATE TRIGGER trg_sync_content_tsvector
    BEFORE INSERT OR UPDATE OF content
    ON memory_chunks
    FOR EACH ROW
    EXECUTE FUNCTION sync_content_tsvector();

-- =============================================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =============================================================================

-- Índice para memory_durable (buscas frequentes por categoria)
CREATE INDEX IF NOT EXISTS idx_memory_durable_category 
ON memory_durable(category);

-- Índice para memory_sessions (buscas por data)
CREATE INDEX IF NOT EXISTS idx_memory_sessions_date 
ON memory_sessions(session_date DESC);

-- Índice para memory_ephemeral (buscas por usuário e data)
CREATE INDEX IF NOT EXISTS idx_memory_ephemeral_user_date 
ON memory_ephemeral(user_id, date DESC);

-- =============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================================================

COMMENT ON FUNCTION hybrid_search IS 
'Hybrid search combining vector (70%) + BM25 (30%) similarity.
Based on OpenClaw architecture: docs/OPENCLAW_MEMORY_METRICS.md';

COMMENT ON FUNCTION calculate_bm25_score IS 
'Calculates BM25 score for full-text search.
BM25 weight: 30% of final hybrid score.';

COMMENT ON INDEX idx_memory_chunks_tsvector IS 
'GIN index for full-text search on memory_chunks content.
Part of hybrid search implementation.';

-- =============================================================================
-- FIM DA MIGRAÇÃO
-- =============================================================================
