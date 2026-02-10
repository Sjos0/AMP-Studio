-- =============================================================================
-- MIGRAÇÃO: Função de Busca de Conversas
-- Data: 2026-02-10
-- =============================================================================
-- Cria função RPC search_conversations para buscar conversas por título
-- ou conteúdo das mensagens, com ordenação por relevância.
-- =============================================================================

-- =============================================================================
-- ÍNDICES para otimizar busca full-text
-- =============================================================================

-- Índice trigram para busca ILIKE em sessions.title
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_sessions_title_trgm ON sessions USING gin (title gin_trgm_ops);

-- Índice trigram para busca ILIKE em messages.content
CREATE INDEX IF NOT EXISTS idx_messages_content_trgm ON messages USING gin (content gin_trgm_ops);

-- =============================================================================
-- FUNÇÃO: search_conversations
-- Busca conversas por título ou conteúdo das mensagens
-- =============================================================================

CREATE OR REPLACE FUNCTION search_conversations(
    p_user_id UUID,
    p_query TEXT,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    last_modified BIGINT,
    preview_snippet TEXT,
    message_count BIGINT,
    created_at TIMESTAMPTZ,
    relevance INTEGER
) AS $$
BEGIN
    -- Se query vazia, retorna todas as conversas ordenadas por last_modified
    IF p_query IS NULL OR TRIM(p_query) = '' THEN
        RETURN QUERY
        SELECT 
            s.id,
            s.title,
            s.last_modified,
            s.preview_snippet,
            (SELECT COUNT(*) FROM messages m WHERE m.session_id = s.id) as message_count,
            COALESCE(
                (SELECT MIN(created_at) FROM messages m WHERE m.session_id = s.id),
                NOW()
            ) as created_at,
            0 as relevance
        FROM sessions s
        WHERE s.user_id = p_user_id
        ORDER BY s.last_modified DESC
        LIMIT p_limit;
    ELSE
        -- Busca por título ou conteúdo das mensagens
        RETURN QUERY
        SELECT DISTINCT ON (s.id)
            s.id,
            s.title,
            s.last_modified,
            s.preview_snippet,
            (SELECT COUNT(*) FROM messages m WHERE m.session_id = s.id) as message_count,
            COALESCE(
                (SELECT MIN(created_at) FROM messages m WHERE m.session_id = s.id),
                NOW()
            ) as created_at,
            CASE 
                WHEN s.title ILIKE '%' || p_query || '%' THEN 2
                ELSE 1
            END as relevance
        FROM sessions s
        LEFT JOIN messages m ON m.session_id = s.id
        WHERE s.user_id = p_user_id
        AND (
            s.title ILIKE '%' || p_query || '%'
            OR m.content ILIKE '%' || p_query || '%'
        )
        ORDER BY s.id, relevance DESC
        LIMIT p_limit;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMENTÁRIOS
-- =============================================================================

COMMENT ON FUNCTION search_conversations IS 'Busca conversas do usuário por título ou conteúdo das mensagens. Retorna resultados ordenados por relevância (título match = 2, conteúdo match = 1). Query vazia retorna todas as conversas.';

-- =============================================================================
-- FIM DA MIGRAÇÃO
-- =============================================================================
