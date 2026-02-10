/**
 * Serviço de Histórico de Conversas
 * AMP Studio - Sincronização com Supabase Realtime
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  UUID,
  Conversation,
  ConversationWithCount,
  Message,
  CreateConversationInput,
  UpdateConversationInput,
  CreateMessageInput,
  MessageRole,
  ConversationData,
} from '@/types';
import { CONVERSATION_CONSTANTS } from '@/types';

// =============================================================================
// Database Row Types (mapeamento das tabelas Supabase)
// =============================================================================

interface SessionRow {
  id: string;
  user_id: string;
  title: string | null;
  last_modified: number;
  preview_snippet: string | null;
  data: ConversationData | null;
}

interface MessageRow {
  id: string;
  session_id: string;
  role: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Conversation Service
// =============================================================================

/**
 * Serviço para gerenciamento de conversas com Supabase
 */
export class ConversationService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  // ===========================================================================
  // Conversations CRUD
  // ===========================================================================

  /**
   * Cria uma nova conversa
   */
  async createConversation(userId: UUID, title?: string): Promise<UUID | null> {
    try {
      const { data, error } = await this.client.rpc('create_conversation', {
        p_user_id: userId,
        p_title: title || 'Nova Conversa',
      });

      if (error) {
        console.error('Erro ao criar conversa:', error);
        return null;
      }

      return data as UUID;
    } catch (err) {
      console.error('Exceção ao criar conversa:', err);
      return null;
    }
  }

  /**
   * Busca todas as conversas do usuário
   */
  async getConversations(
    userId: UUID,
    limit: number = CONVERSATION_CONSTANTS.DEFAULT_PAGE_SIZE,
    offset: number = 0
  ): Promise<ConversationWithCount[]> {
    try {
      const { data, error } = await this.client.rpc('get_user_conversations', {
        p_user_id: userId,
        p_limit: Math.min(limit, CONVERSATION_CONSTANTS.MAX_PAGE_SIZE),
        p_offset: offset,
      });

      if (error) {
        console.error('Erro ao buscar conversas:', error);
        return [];
      }

      return (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as UUID,
        userId: userId,
        title: row.title as string | null,
        lastModified: row.last_modified as number,
        previewSnippet: row.preview_snippet as string | null,
        data: null,
        messageCount: row.message_count as number,
        createdAt: row.created_at as Date,
      }));
    } catch (err) {
      console.error('Exceção ao buscar conversas:', err);
      return [];
    }
  }

  /**
   * Busca uma conversa específica
   */
  async getConversation(conversationId: UUID, userId: UUID): Promise<Conversation | null> {
    try {
      const { data, error } = await this.client
        .from('sessions')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.error('Erro ao buscar conversa:', error);
        return null;
      }

      const row = data as SessionRow;
      return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        lastModified: row.last_modified,
        previewSnippet: row.preview_snippet,
        data: row.data,
      };
    } catch (err) {
      console.error('Exceção ao buscar conversa:', err);
      return null;
    }
  }

  /**
   * Atualiza uma conversa
   */
  async updateConversation(
    conversationId: UUID,
    userId: UUID,
    input: UpdateConversationInput
  ): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = {
        last_modified: Math.floor(Date.now() / 1000),
      };

      if (input.title !== undefined) {
        updateData.title = input.title;
      }

      const { error } = await this.client
        .from('sessions')
        .update(updateData)
        .eq('id', conversationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao atualizar conversa:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Exceção ao atualizar conversa:', err);
      return false;
    }
  }

  /**
   * Deleta uma conversa e todas suas mensagens
   */
  async deleteConversation(conversationId: UUID, userId: UUID): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('sessions')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao deletar conversa:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Exceção ao deletar conversa:', err);
      return false;
    }
  }

  // ===========================================================================
  // Messages CRUD
  // ===========================================================================

  /**
   * Adiciona uma mensagem a uma conversa
   */
  async addMessage(
    sessionId: UUID,
    role: MessageRole,
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<UUID | null> {
    try {
      const { data, error } = await this.client.rpc('add_message', {
        p_session_id: sessionId,
        p_role: role,
        p_content: content,
        p_metadata: metadata || {},
      });

      if (error) {
        console.error('Erro ao adicionar mensagem:', error);
        return null;
      }

      return data as UUID;
    } catch (err) {
      console.error('Exceção ao adicionar mensagem:', err);
      return null;
    }
  }

  /**
   * Busca todas as mensagens de uma conversa
   */
  async getMessages(sessionId: UUID, userId: UUID): Promise<Message[]> {
    try {
      const { data, error } = await this.client.rpc('get_conversation_messages', {
        p_session_id: sessionId,
        p_user_id: userId,
      });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        return [];
      }

      return (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as UUID,
        sessionId: sessionId,
        role: row.role as MessageRole,
        content: row.content as string,
        metadata: (row.metadata || {}) as Record<string, unknown>,
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string),
      }));
    } catch (err) {
      console.error('Exceção ao buscar mensagens:', err);
      return [];
    }
  }

  /**
   * Deleta uma mensagem específica
   */
  async deleteMessage(messageId: UUID, sessionId: UUID): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('session_id', sessionId);

      if (error) {
        console.error('Erro ao deletar mensagem:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Exceção ao deletar mensagem:', err);
      return false;
    }
  }

  // ===========================================================================
  // Realtime Subscriptions
  // ===========================================================================

  /**
   * Subscribes to conversation changes (sessions table)
   */
  subscribeToConversations(
    userId: UUID,
    onConversationChange: (payload: unknown) => void
  ) {
    return this.client
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `user_id=eq.${userId}`,
        },
        onConversationChange
      )
      .subscribe();
  }

  /**
   * Subscribes to message changes for a specific conversation
   */
  subscribeToMessages(
    conversationId: UUID,
    onMessageChange: (payload: unknown) => void
  ) {
    return this.client
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${conversationId}`,
        },
        onMessageChange
      )
      .subscribe();
  }

  /**
   * Unsubscribes from a channel
   */
  async unsubscribe(subscription: { unsubscribe: () => void }) {
    try {
      subscription.unsubscribe();
    } catch (err) {
      console.error('Erro ao cancelar subscrição:', err);
    }
  }
}

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Cria uma instância do serviço para uso no cliente (browser)
 */
export function createConversationService(client: SupabaseClient): ConversationService {
  return new ConversationService(client);
}
