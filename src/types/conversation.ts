/**
 * Tipos TypeScript para o Sistema de Histórico de Conversas
 * AMP Studio - Sincronização com Supabase Realtime
 */

import type { UUID } from './memory';

// =============================================================================
// Constantes do Sistema de Conversas
// =============================================================================

export const CONVERSATION_CONSTANTS = {
  // Mensagens
  MAX_MESSAGE_LENGTH: 32000,
  MAX_TITLE_LENGTH: 200,
  PREVIEW_LENGTH: 100,
  
  // Paginação
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  
  // Realtime
  REALTIME_CHANNEL: 'conversations',
} as const;

// =============================================================================
// Types Base
// =============================================================================

/**
 * Role de uma mensagem na conversa
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Status de uma conversa
 */
export type ConversationStatus = 'active' | 'archived' | 'deleted';

// =============================================================================
// Tabela: sessions (conversas)
// =============================================================================

/**
 * Sessão/Conversa
 * Representa uma conversa entre usuário e assistente
 */
export interface Conversation {
  id: UUID;
  userId: UUID;
  title: string | null;
  lastModified: number;
  previewSnippet: string | null;
  data: ConversationData | null;
}

/**
 * Dados extras da conversa (armazenados em JSONB)
 */
export interface ConversationData {
  messages?: ConversationMessageSummary[];
  status?: ConversationStatus;
  metadata?: Record<string, unknown>;
}

/**
 * Resumo de mensagem para o campo data
 */
export interface ConversationMessageSummary {
  id: UUID;
  role: MessageRole;
  content: string;
  createdAt: string;
}

/**
 * Conversa com contador de mensagens (resultado de get_user_conversations)
 */
export interface ConversationWithCount extends Conversation {
  messageCount: number;
  createdAt: Date;
}

// =============================================================================
// Tabela: messages
// =============================================================================

/**
 * Mensagem individual de uma conversa
 */
export interface Message {
  id: UUID;
  sessionId: UUID;
  role: MessageRole;
  content: string;
  metadata: MessageMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Metadados de uma mensagem
 */
export interface MessageMetadata {
  model?: string;
  tokens?: number;
  latency?: number;
  [key: string]: unknown;
}

// =============================================================================
// Input Types
// =============================================================================

/**
 * Input para criar uma nova conversa
 */
export interface CreateConversationInput {
  userId: UUID;
  title?: string;
}

/**
 * Input para atualizar uma conversa
 */
export interface UpdateConversationInput {
  title?: string;
  status?: ConversationStatus;
}

/**
 * Input para criar uma nova mensagem
 */
export interface CreateMessageInput {
  sessionId: UUID;
  role: MessageRole;
  content: string;
  metadata?: MessageMetadata;
}

// =============================================================================
// Response Types
// =============================================================================

/**
 * Resposta de criação de conversa
 */
export interface CreateConversationResponse {
  success: boolean;
  conversationId?: UUID;
  error?: string;
}

/**
 * Resposta de adição de mensagem
 */
export interface AddMessageResponse {
  success: boolean;
  messageId?: UUID;
  error?: string;
}

/**
 * Lista de conversas paginada
 */
export interface ConversationsListResponse {
  success: boolean;
  conversations?: ConversationWithCount[];
  total?: number;
  error?: string;
}

/**
 * Mensagens de uma conversa
 */
export interface MessagesResponse {
  success: boolean;
  messages?: Message[];
  error?: string;
}

// =============================================================================
// Realtime Types
// =============================================================================

/**
 * Tipo de evento Realtime
 */
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

/**
 * Payload de evento Realtime para conversas
 */
export interface ConversationRealtimePayload {
  eventType: RealtimeEventType;
  new: Conversation | null;
  old: Conversation | null;
  table: 'sessions';
  schema: 'public';
}

/**
 * Payload de evento Realtime para mensagens
 */
export interface MessageRealtimePayload {
  eventType: RealtimeEventType;
  new: Message | null;
  old: Message | null;
  table: 'messages';
  schema: 'public';
}

// =============================================================================
// Hook Types
// =============================================================================

/**
 * Estado do hook de conversas
 */
export interface UseConversationsState {
  conversations: ConversationWithCount[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  
  // Search State
  searchResults: ConversationWithCount[];
  searchQuery: string;
  isSearching: boolean;
}

/**
 * Ações do hook de conversas
 */
export interface UseConversationsActions {
  // Conversas
  createConversation: (title?: string) => Promise<UUID | null>;
  selectConversation: (conversationId: UUID) => Promise<void>;
  updateConversation: (conversationId: UUID, input: UpdateConversationInput) => Promise<boolean>;
  deleteConversation: (conversationId: UUID) => Promise<boolean>;
  loadConversations: (page?: number) => Promise<void>;
  
  // Mensagens
  sendMessage: (content: string, role?: MessageRole) => Promise<UUID | null>;
  loadMessages: (conversationId: UUID) => Promise<void>;
  
  // Busca
  searchConversations: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  // Realtime
  subscribeToConversation: (conversationId: UUID) => void;
  unsubscribeFromConversation: () => void;
}

/**
 * Retorno do hook useConversations
 */
export type UseConversationsReturn = UseConversationsState & UseConversationsActions;

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Filtros para busca de conversas
 */
export interface ConversationFilters {
  status?: ConversationStatus;
  searchQuery?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Opções de ordenação para conversas
 */
export interface ConversationSortOptions {
  field: 'lastModified' | 'createdAt' | 'title';
  order: 'asc' | 'desc';
}
