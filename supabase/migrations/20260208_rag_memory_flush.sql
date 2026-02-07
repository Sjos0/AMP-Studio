-- =============================================================================
-- MIGRAÇÃO: RAG Retrieval, Memory Flush e Session Auto-Indexing
-- Data: 2026-02-08
-- =============================================================================
-- Completa a implementação OpenClaw com:
-- - retrieve_context_for_llm() - RAG retrieval
-- - memory_flush() - Auto-save antes de compaction
-- - create_session() - Session auto-indexing
-- =============================================================================

-- =============================================================================
-- PARTE 1: Função retrieve_context_for_llm - RAG Retrieval
-- =============================================================================

-- Função para recuperar contexto consolidado para passar ao LLM
CREATE OR REPLACE FUNCTION retrieve_context_for_llm(
    p_user_id UUID,
    p_query TEXT DEFAULT '',
    p_max_tokens INTEGER DEFAULT 4000,
    p_include_ephemeral BOOLEAN DEFAULT true,
    p_include_durable BOOLEAN DEFAULT true,
    p_include_sessions BOOLEAN DEFAULT false,
    p_include_chunks BOOLEAN DEFAULT true
)
RETURNS TEXT AS $$
DECLARE
    v_context TEXT := '';
    v_ephemeral_content TEXT;
    v_durable_content TEXT;
    v_sessions_content TEXT;
    v_chunks_content TEXT;
BEGIN
    -- Coletar memória efêmera (últimos logs)
    IF p_include_ephemeral THEN
        SELECT string_agg(content, E'\n\n---\n') INTO v_ephemeral_content
        FROM (
            SELECT content
            FROM memory_ephemeral
            WHERE user_id = p_user_id
            ORDER BY date DESC, created_at DESC
            LIMIT 10
        ) sub;
        
        IF v_ephemeral_content IS NOT NULL THEN
            v_context := v_context || '# Memória Efêmera (Últimos logs)\n\n' || v_ephemeral_content;
        END IF;
    END IF;
    
    -- Coletar memória durável (preferências e fatos importantes)
    IF p_include_durable THEN
        SELECT string_agg(
            CASE WHEN title IS NOT NULL AND title != '' THEN title || ': ' || content ELSE content END, 
            E'\n\n'
        ) INTO v_durable_content
        FROM (
            SELECT title, content, importance_score, access_count
            FROM memory_durable
            WHERE user_id = p_user_id
            AND category NOT LIKE '%_archived'
            ORDER BY importance_score DESC, access_count DESC
            LIMIT 30
        ) sub;
        
        IF v_durable_content IS NOT NULL THEN
            v_context := v_context || E'\n\n# Memória Durável (Preferências e Fatos)\n\n' || v_durable_content;
        END IF;
    END IF;
    
    -- Coletar chunks relevantes se query fornecida
    IF p_include_chunks AND p_query IS NOT NULL AND p_query != '' THEN
        SELECT string_agg(content, E'\n\n---\n') INTO v_chunks_content
        FROM (
            SELECT c.content, c.vector_score
            FROM memory_chunks c
            INNER JOIN memory_files f ON c.file_id = f.id
            WHERE f.user_id = p_user_id
            AND c.vector_score > 0.3
            ORDER BY c.vector_score DESC
            LIMIT 20
        ) sub;
        
        IF v_chunks_content IS NOT NULL THEN
            v_context := v_context || E'\n\n# Chunks Relevantes\n\n' || v_chunks_content;
        END IF;
    END IF;
    
    -- Coletar sessões recentes
    IF p_include_sessions THEN
        SELECT string_agg(
            CASE WHEN title IS NOT NULL AND title != '' THEN title || ': ' || content ELSE content END,
            E'\n\n---\n'
        ) INTO v_sessions_content
        FROM (
            SELECT title, content
            FROM memory_sessions
            WHERE user_id = p_user_id
            ORDER BY session_date DESC, created_at DESC
            LIMIT 5
        ) sub;
        
        IF v_sessions_content IS NOT NULL THEN
            v_context := v_context || E'\n\n# Sessões Recentes\n\n' || v_sessions_content;
        END IF;
    END IF;
    
    -- Truncar se exceder limite de tokens (aproximação: 4 chars por token)
    IF LENGTH(v_context) > p_max_tokens * 4 THEN
        v_context := LEFT(v_context, p_max_tokens * 4) || E'\n\n[contexto truncado para caber na janela de contexto]';
    END IF;
    
    RETURN v_context;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION retrieve_context_for_llm IS 
'RAG Retrieval: Consolida contexto de todas as camadas de memória para passar ao LLM.
Inclui memória efêmera, durável, chunks relevantes e sessões.';

-- =============================================================================
-- PARTE 2: Memory Flush - Auto-save antes de compaction
-- =============================================================================

CREATE OR REPLACE FUNCTION memory_flush(
    p_user_id UUID,
    p_context_tokens INTEGER,
    p_context_limit INTEGER DEFAULT 128000
)
RETURNS TABLE (
    flushed_memories INTEGER,
    tokens_freed INTEGER,
    ephemeral_id UUID,
    durable_ids UUID[]
) AS $$
DECLARE
    v_ephemeral_id UUID;
    v_durable_ids UUID[];
    v_total_tokens INTEGER;
    v_target_tokens INTEGER;
BEGIN
    -- Calcular tokens alvo para flushing (manter 80% da janela)
    v_target_tokens := LEAST(p_context_limit * 0.8, p_context_tokens);
    v_total_tokens := p_context_tokens;
    
    -- Coletar memórias menos importantes para archival
    -- Ordena por: menos acessadas, mais antigas, menor importância
    SELECT ARRAY_AGG(id) INTO v_durable_ids
    FROM memory_durable
    WHERE user_id = p_user_id
    AND category NOT LIKE '%_archived'
    AND (
        (access_count = 0 AND created_at < NOW() - INTERVAL '30 days')
        OR (access_count < 3 AND created_at < NOW() - INTERVAL '7 days')
    )
    ORDER BY access_count ASC, importance_score ASC, created_at ASC
    LIMIT 20;
    
    -- Criar memória efêmera com resumo do contexto atual
    INSERT INTO memory_ephemeral (user_id, date, title, content)
    VALUES (
        p_user_id, 
        CURRENT_DATE, 
        'Context Flush - ' || NOW()::DATE::TEXT,
        'Auto-salvo antes de compaction. Tokens: ' || p_context_tokens::TEXT || 
        '. Memórias arquivadas: ' || COALESCE(array_length(v_durable_ids, 1), 0)::TEXT
    )
    ON CONFLICT (user_id, date) DO UPDATE 
    SET content = memory_ephemeral.content || E'\n\n---\n' || 
                 NOW()::TEXT || ': Auto-save context before compaction. Tokens: ' || p_context_tokens::TEXT
    RETURNING id INTO v_ephemeral_id;
    
    -- Marcar como arquivadas (soft delete - não deleta, renomeia categoria)
    UPDATE memory_durable
    SET category = category || '_archived',
        updated_at = NOW()
    WHERE id = ANY(v_durable_ids);
    
    RETURN QUERY
    SELECT 
        COALESCE(array_length(v_durable_ids, 1), 0) AS flushed_memories,
        v_total_tokens - v_target_tokens AS tokens_freed,
        v_ephemeral_id AS ephemeral_id,
        v_durable_ids AS durable_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION memory_flush IS 
'Auto-salva contexto antes de compaction.
Cria memória efêmera e arquiva memórias menos importantes.';

-- =============================================================================
-- PARTE 3: Session Auto-Indexing
-- =============================================================================

-- Função para criar sessão com auto-indexing
CREATE OR REPLACE FUNCTION create_session(
    p_user_id UUID,
    p_session_slug TEXT,
    p_title TEXT DEFAULT 'Nova Sessão',
    p_content TEXT DEFAULT ''
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
    v_chunk_count INTEGER;
BEGIN
    -- Inserir sessão
    INSERT INTO memory_sessions (user_id, session_slug, title, content, session_date)
    VALUES (p_user_id, p_session_slug, p_title, p_content, CURRENT_DATE)
    ON CONFLICT (user_id, session_slug) DO UPDATE 
    SET content = memory_sessions.content || E'\n\n---\n' || p_content,
        updated_at = NOW(),
        session_date = CURRENT_DATE
    RETURNING id INTO v_session_id;
    
    -- Calcular métricas
    v_chunk_count := GREATEST(1, LENGTH(p_content) / 400 + 1);
    
    -- Atualizar metadata da sessão
    UPDATE memory_sessions
    SET 
        chunk_count = v_chunk_count,
        message_count = message_count + 1,
        token_count = GREATEST(token_count, LENGTH(p_content) / 4)
    WHERE id = v_session_id;
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-indexar sessões quando conteúdo muda
CREATE OR REPLACE FUNCTION auto_index_session()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.content IS DISTINCT FROM OLD.content THEN
        UPDATE memory_sessions
        SET 
            token_count = LENGTH(NEW.content) / 4,
            chunk_count = GREATEST(1, LENGTH(NEW.content) / 400 + 1),
            updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_index_session ON memory_sessions;
CREATE TRIGGER trigger_auto_index_session
    BEFORE INSERT OR UPDATE OF content ON memory_sessions
    FOR EACH ROW EXECUTE FUNCTION auto_index_session();

COMMENT ON FUNCTION create_session IS 'Cria nova sessão de conversa e indexa automaticamente.';
COMMENT ON FUNCTION auto_index_session IS 'Trigger para auto-indexar sessões quando conteúdo muda.';

-- =============================================================================
-- PARTE 4: Funções de helper para métricas
-- =============================================================================

-- Função para calcular hit rate de memória
CREATE OR REPLACE FUNCTION get_memory_hit_rate(p_user_id UUID)
RETURNS REAL AS $$
DECLARE
    v_hits INTEGER;
    v_total INTEGER;
BEGIN
    SELECT 
        SUM(CASE WHEN results_count > 0 THEN 1 ELSE 0 END)::REAL,
        COUNT(*)::REAL
    INTO v_hits, v_total
    FROM memory_search_logs
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '7 days';
    
    RETURN CASE WHEN v_total > 0 THEN v_hits / v_total ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de memória
CREATE OR REPLACE FUNCTION get_memory_stats(p_user_id UUID)
RETURNS TABLE (
    total_memories BIGINT,
    total_chunks BIGINT,
    total_sessions BIGINT,
    durable_size_bytes BIGINT,
    ephemeral_size_bytes BIGINT,
    cache_hit_rate REAL,
    avg_search_latency_ms REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM memory_durable WHERE user_id = p_user_id)::BIGINT AS total_memories,
        (SELECT COUNT(*) FROM memory_chunks 
         INNER JOIN memory_files ON memory_chunks.file_id = memory_files.id
         WHERE memory_files.user_id = p_user_id)::BIGINT AS total_chunks,
        (SELECT COUNT(*) FROM memory_sessions WHERE user_id = p_user_id)::BIGINT AS total_sessions,
        (SELECT COALESCE(SUM(LENGTH(content)), 0) FROM memory_durable WHERE user_id = p_user_id)::BIGINT AS durable_size_bytes,
        (SELECT COALESCE(SUM(LENGTH(content)), 0) FROM memory_ephemeral WHERE user_id = p_user_id)::BIGINT AS ephemeral_size_bytes,
        get_memory_hit_rate(p_user_id) AS cache_hit_rate,
        (SELECT AVG(latency_ms) FROM memory_search_logs 
         WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '24 hours')::REAL AS avg_search_latency_ms;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_memory_hit_rate IS 'Retorna taxa de acerto de buscas de memória (últimos 7 dias).';
COMMENT ON FUNCTION get_memory_stats IS 'Retorna estatísticas consolidadas de memória do usuário.';

-- =============================================================================
-- FIM DA MIGRAÇÃO
-- =============================================================================
