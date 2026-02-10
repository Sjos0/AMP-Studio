-- =============================================================================
-- MIGRAÇÃO: Sistema de Histórico de Conversas com Realtime
-- Data: 2026-02-09
-- =============================================================================
-- Cria tabela messages para armazenar mensagens individuais
-- Habilita Realtime para sessions e messages
-- =============================================================================

-- =============================================================================
-- FUNÇÃO HELPER: update_updated_at()
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABELA: messages
-- Armazena mensagens individuais de cada conversa/sessão
-- =============================================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- RLS - Row Level Security para messages
-- =============================================================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem gerenciar mensagens de suas próprias sessões
CREATE POLICY "Users manage own session messages" ON messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM sessions 
            WHERE sessions.id = messages.session_id 
            AND sessions.user_id = auth.uid()
        )
    );

-- =============================================================================
-- REALTIME - Habilitar para sessions e messages
-- =============================================================================

-- Adicionar tabelas ao publication do Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- =============================================================================
-- FUNÇÕES HELPER para conversas
-- =============================================================================

-- Função para criar nova sessão com título automático
CREATE OR REPLACE FUNCTION create_conversation(
    p_user_id UUID,
    p_title TEXT DEFAULT 'Nova Conversa'
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    INSERT INTO sessions (user_id, title, last_modified, preview_snippet, data)
    VALUES (p_user_id, p_title, EXTRACT(EPOCH FROM NOW())::BIGINT, '', '{"messages": []}'::jsonb)
    RETURNING id INTO v_session_id;
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para adicionar mensagem a uma sessão
CREATE OR REPLACE FUNCTION add_message(
    p_session_id UUID,
    p_role TEXT,
    p_content TEXT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_message_id UUID;
    v_user_id UUID;
BEGIN
    -- Verificar se a sessão pertence ao usuário
    SELECT user_id INTO v_user_id FROM sessions WHERE id = p_session_id;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Sessão não encontrada';
    END IF;
    
    -- Inserir mensagem
    INSERT INTO messages (session_id, role, content, metadata)
    VALUES (p_session_id, p_role, p_content, p_metadata)
    RETURNING id INTO v_message_id;
    
    -- Atualizar sessão
    UPDATE sessions
    SET 
        last_modified = EXTRACT(EPOCH FROM NOW())::BIGINT,
        preview_snippet = LEFT(p_content, 100),
        data = jsonb_set(
            COALESCE(data, '{"messages": []}'::jsonb),
            '{messages}',
            COALESCE(data->'messages', '[]'::jsonb) || jsonb_build_object(
                'id', v_message_id,
                'role', p_role,
                'content', p_content,
                'created_at', NOW()
            )
        )
    WHERE id = p_session_id;
    
    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar conversas do usuário
CREATE OR REPLACE FUNCTION get_user_conversations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    last_modified BIGINT,
    preview_snippet TEXT,
    message_count BIGINT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
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
        ) as created_at
    FROM sessions s
    WHERE s.user_id = p_user_id
    ORDER BY s.last_modified DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar mensagens de uma conversa
CREATE OR REPLACE FUNCTION get_conversation_messages(
    p_session_id UUID,
    p_user_id UUID
)
RETURNS TABLE (
    id UUID,
    role TEXT,
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Verificar permissão
    IF NOT EXISTS (SELECT 1 FROM sessions WHERE id = p_session_id AND user_id = p_user_id) THEN
        RAISE EXCEPTION 'Acesso negado';
    END IF;
    
    RETURN QUERY
    SELECT 
        m.id,
        m.role,
        m.content,
        m.metadata,
        m.created_at
    FROM messages m
    WHERE m.session_id = p_session_id
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMENTÁRIOS
-- =============================================================================

COMMENT ON TABLE messages IS 'Mensagens individuais de cada conversa/sessão do chat.';
COMMENT ON FUNCTION create_conversation IS 'Cria uma nova conversa/sessão para o usuário.';
COMMENT ON FUNCTION add_message IS 'Adiciona uma mensagem a uma conversa existente.';
COMMENT ON FUNCTION get_user_conversations IS 'Busca todas as conversas do usuário ordenadas por última modificação.';
COMMENT ON FUNCTION get_conversation_messages IS 'Busca todas as mensagens de uma conversa específica.';

-- =============================================================================
-- FIM DA MIGRAÇÃO
-- =============================================================================
