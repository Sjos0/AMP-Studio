/**
 * Hook de Gerenciamento de Conversas
 * AMP Studio - React Hook com Realtime e Auth
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ConversationService } from './service';
import type {
  UUID,
  Conversation,
  ConversationWithCount,
  Message,
  UpdateConversationInput,
  UseConversationsReturn,
  MessageRealtimePayload,
  ConversationRealtimePayload,
} from '@/types';
import type { User } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';

// =============================================================================
// Hook Principal
// =============================================================================

/**
 * Hook para gerenciamento de conversas com sincronização Realtime
 *
 * @param userId - ID do usuário (opcional). Se não fornecido, usa auth do Supabase
 *
 * @example
 * ```tsx
 * // Com userId explícito (ex: MOCK_USER_ID)
 * const { conversations, messages } = useConversations('00000000-0000-0000-0000-000000000000');
 *
 * // Com auth do Supabase
 * const { conversations, messages } = useConversations();
 * ```
 */
export function useConversations(userId?: UUID): UseConversationsReturn {
  // Estados
  const [conversations, setConversations] = useState<ConversationWithCount[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // ID efetivo do usuário (prop ou auth)
  const effectiveUserId = userId || user?.id || null;

  // Refs para subscriptions
  const conversationsChannelRef = useRef<RealtimeChannel | null>(null);
  const messagesChannelRef = useRef<RealtimeChannel | null>(null);
  const serviceRef = useRef<ConversationService | null>(null);

  // ===========================================================================
  // Inicialização
  // ===========================================================================

  useEffect(() => {
    const client = createClient();
    serviceRef.current = new ConversationService(client);

    // Se userId foi fornecido via prop, usar diretamente
    if (userId) {
      loadConversationsInternal(userId);
      subscribeToConversationsInternal(userId);
      return () => {
        unsubscribeAll();
      };
    }

    // Caso contrário, obter usuário do auth
    client.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        setUser(authUser);
        loadConversationsInternal(authUser.id);
        subscribeToConversationsInternal(authUser.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listener para mudanças de auth (apenas se não tiver userId via prop)
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadConversationsInternal(session.user.id);
        subscribeToConversationsInternal(session.user.id);
      } else {
        setUser(null);
        setConversations([]);
        setCurrentConversation(null);
        setMessages([]);
        unsubscribeAll();
      }
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeAll();
    };
  }, [userId]);

  // ===========================================================================
  // Funções Internas
  // ===========================================================================

  const loadConversationsInternal = async (userId: UUID) => {
    if (!serviceRef.current) return;
    
    setIsLoading(true);
    setError(null);

    const result = await serviceRef.current.getConversations(userId);
    setConversations(result);
    setIsLoading(false);
  };

  const subscribeToConversationsInternal = (userId: UUID) => {
    if (!serviceRef.current) return;

    // Cancelar subscription anterior
    if (conversationsChannelRef.current) {
      conversationsChannelRef.current.unsubscribe();
    }

    conversationsChannelRef.current = serviceRef.current.subscribeToConversations(
      userId,
      (payload: unknown) => {
        const event = payload as ConversationRealtimePayload;
        handleConversationChange(event);
      }
    );
  };

  const handleConversationChange = (event: ConversationRealtimePayload) => {
    if (!event.new && !event.old) return;

    switch (event.eventType) {
      case 'INSERT':
        if (event.new) {
          // Recarregar lista para obter messageCount correto
          if (effectiveUserId) {
            loadConversationsInternal(effectiveUserId);
          }
        }
        break;

      case 'UPDATE':
        if (event.new) {
          setConversations(prev =>
            prev.map(c =>
              c.id === event.new!.id
                ? { ...c, ...event.new!, lastModified: event.new!.lastModified }
                : c
            )
          );
          if (currentConversation?.id === event.new.id) {
            setCurrentConversation(event.new);
          }
        }
        break;

      case 'DELETE':
        if (event.old) {
          setConversations(prev => prev.filter(c => c.id !== event.old!.id));
          if (currentConversation?.id === event.old.id) {
            setCurrentConversation(null);
            setMessages([]);
          }
        }
        break;
    }
  };

  const handleNewMessage = (event: MessageRealtimePayload) => {
    if (!event.new) return;

    switch (event.eventType) {
      case 'INSERT':
        setMessages(prev => {
          // Evitar duplicatas
          if (prev.some(m => m.id === event.new!.id)) {
            return prev;
          }
          return [...prev, {
            id: event.new!.id,
            sessionId: event.new!.sessionId,
            role: event.new!.role,
            content: event.new!.content,
            metadata: event.new!.metadata,
            createdAt: event.new!.createdAt,
            updatedAt: event.new!.updatedAt,
          }];
        });
        break;

      case 'DELETE':
        if (event.old) {
          setMessages(prev => prev.filter(m => m.id !== event.old!.id));
        }
        break;
    }
  };

  const unsubscribeAll = () => {
    if (conversationsChannelRef.current) {
      conversationsChannelRef.current.unsubscribe();
      conversationsChannelRef.current = null;
    }
    if (messagesChannelRef.current) {
      messagesChannelRef.current.unsubscribe();
      messagesChannelRef.current = null;
    }
  };

  // ===========================================================================
  // Ações de Conversas
  // ===========================================================================

  const createConversation = useCallback(async (title?: string): Promise<UUID | null> => {
    if (!effectiveUserId || !serviceRef.current) {
      setError('Usuário não autenticado');
      return null;
    }

    setError(null);
    const conversationId = await serviceRef.current.createConversation(effectiveUserId, title);

    if (conversationId) {
      // Selecionar a nova conversa automaticamente
      await selectConversation(conversationId);
    }

    return conversationId;
  }, [effectiveUserId]);

  const selectConversation = useCallback(async (conversationId: UUID): Promise<void> => {
    if (!effectiveUserId || !serviceRef.current) {
      setError('Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Buscar conversa
    const conversation = await serviceRef.current.getConversation(conversationId, effectiveUserId);
    setCurrentConversation(conversation);

    // Carregar mensagens
    const conversationMessages = await serviceRef.current.getMessages(conversationId, effectiveUserId);
    setMessages(conversationMessages);

    // Subscrever a mudanças de mensagens
    if (messagesChannelRef.current) {
      messagesChannelRef.current.unsubscribe();
    }
    messagesChannelRef.current = serviceRef.current.subscribeToMessages(
      conversationId,
      (payload: unknown) => {
        const event = payload as MessageRealtimePayload;
        handleNewMessage(event);
      }
    );

    setIsLoading(false);
  }, [effectiveUserId]);

  const updateConversation = useCallback(async (
    conversationId: UUID,
    input: UpdateConversationInput
  ): Promise<boolean> => {
    if (!effectiveUserId || !serviceRef.current) {
      setError('Usuário não autenticado');
      return false;
    }

    setError(null);
    return serviceRef.current.updateConversation(conversationId, effectiveUserId, input);
  }, [effectiveUserId]);

  const deleteConversation = useCallback(async (conversationId: UUID): Promise<boolean> => {
    if (!effectiveUserId || !serviceRef.current) {
      setError('Usuário não autenticado');
      return false;
    }

    setError(null);
    const success = await serviceRef.current.deleteConversation(conversationId, effectiveUserId);

    if (success && currentConversation?.id === conversationId) {
      setCurrentConversation(null);
      setMessages([]);
    }

    return success;
  }, [effectiveUserId, currentConversation]);

  const loadConversations = useCallback(async (page: number = 0): Promise<void> => {
    if (!effectiveUserId || !serviceRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await serviceRef.current.getConversations(
      effectiveUserId,
      50,
      page * 50
    );
    setConversations(result);
    setIsLoading(false);
  }, [effectiveUserId]);

  // ===========================================================================
  // Ações de Mensagens
  // ===========================================================================

  const sendMessage = useCallback(async (
    content: string,
    role: 'user' | 'assistant' | 'system' = 'user'
  ): Promise<UUID | null> => {
    if (!currentConversation || !serviceRef.current) {
      setError('Nenhuma conversa selecionada');
      return null;
    }

    setError(null);
    return serviceRef.current.addMessage(currentConversation.id, role, content);
  }, [currentConversation]);

  const loadMessages = useCallback(async (conversationId: UUID): Promise<void> => {
    if (!effectiveUserId || !serviceRef.current) {
      return;
    }

    const result = await serviceRef.current.getMessages(conversationId, effectiveUserId);
    setMessages(result);
  }, [effectiveUserId]);

  // ===========================================================================
  // Realtime Actions
  // ===========================================================================

  const subscribeToConversation = useCallback((conversationId: UUID): void => {
    if (!serviceRef.current) return;

    if (messagesChannelRef.current) {
      messagesChannelRef.current.unsubscribe();
    }

    messagesChannelRef.current = serviceRef.current.subscribeToMessages(
      conversationId,
      (payload: unknown) => {
        const event = payload as MessageRealtimePayload;
        handleNewMessage(event);
      }
    );
  }, []);

  const unsubscribeFromConversation = useCallback((): void => {
    if (messagesChannelRef.current) {
      messagesChannelRef.current.unsubscribe();
      messagesChannelRef.current = null;
    }
  }, []);

  // ===========================================================================
  // Return
  // ===========================================================================

  return {
    // State
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,

    // Conversation Actions
    createConversation,
    selectConversation,
    updateConversation,
    deleteConversation,
    loadConversations,

    // Message Actions
    sendMessage,
    loadMessages,

    // Realtime Actions
    subscribeToConversation,
    unsubscribeFromConversation,
  };
}

// =============================================================================
// Hook Auxiliar: useCurrentUserId
// =============================================================================

/**
 * Hook auxiliar para obter o ID do usuário atual
 */
export function useCurrentUserId(): UUID | null {
  const [userId, setUserId] = useState<UUID | null>(null);

  useEffect(() => {
    const client = createClient();
    
    client.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return userId;
}
