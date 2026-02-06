/**
 * Hook React para Sistema de Memória
 * Sistema de Memória Persistente - AMP Studio
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { createMemoryService, MemoryService } from '@/lib/memory';
import { 
  UUID, 
  SearchInput, 
  SearchResponse, 
  MemoryDurable,
  MemoryEphemeral,
  MemorySession,
  CreateMemoryDurableInput,
  CreateMemoryEphemeralInput,
  CreateMemorySessionInput,
  MemoryDashboard,
} from '@/types';

/**
 * Estado do hook useMemory
 */
interface MemoryState {
  isLoading: boolean;
  error: string | null;
  recentMemories: MemoryEphemeral[];
  dashboard: MemoryDashboard | null;
}

/**
 * Hook principal para uso do sistema de memória
 */
export function useMemory(userId: UUID | null) {
  const [state, setState] = useState<MemoryState>({
    isLoading: false,
    error: null,
    recentMemories: [],
    dashboard: null,
  });

  const [memoryService, setMemoryService] = useState<MemoryService | null>(null);

  // Inicializa serviço quando userId muda
  useEffect(() => {
    if (userId) {
      const service = createMemoryService(userId);
      setMemoryService(service);
    } else {
      setMemoryService(null);
    }
  }, [userId]);

  /**
   * Carrega memórias recentes do serviço
   */
  const loadRecentMemories = useCallback(async (service: MemoryService) => {
    try {
      const memories = await service.getRecentMemories();
      setState(prev => ({ ...prev, recentMemories: memories }));
    } catch (error) {
      console.error('Erro ao carregar memórias recentes:', error);
    }
  }, []);

  // Carrega memórias recentes quando o serviço muda
  useEffect(() => {
    if (memoryService && userId) {
      loadRecentMemories(memoryService);
    }
  }, [memoryService, userId, loadRecentMemories]);

  /**
   * Busca semântica na memória
   */
  const search = useCallback(async (query: string, options?: Partial<SearchInput>): Promise<SearchResponse | null> => {
    if (!memoryService || !userId) return null;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const input: SearchInput = {
        query,
        userId,
        maxResults: options?.maxResults,
        minScore: options?.minScore,
        sources: options?.sources,
        sessionKey: options?.sessionKey,
      };

      const response = await memoryService.search(input);
      setState(prev => ({ ...prev, isLoading: false }));
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro na busca';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return null;
    }
  }, [memoryService, userId]);

  /**
   * Cria memória durável
   */
  const createDurableMemory = useCallback(async (
    input: CreateMemoryDurableInput
  ): Promise<MemoryDurable | null> => {
    if (!memoryService) return null;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const memory = await memoryService.createDurableMemory(input);
      setState(prev => ({ ...prev, isLoading: false }));
      return memory;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar memória';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return null;
    }
  }, [memoryService]);

  /**
   * Cria memória efêmera (log diário)
   */
  const createEphemeralMemory = useCallback(async (
    input: CreateMemoryEphemeralInput
  ): Promise<MemoryEphemeral | null> => {
    if (!memoryService) return null;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const memory = await memoryService.createEphemeralMemory(input);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        recentMemories: [memory, ...prev.recentMemories],
      }));
      return memory;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar memória';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return null;
    }
  }, [memoryService]);

  /**
   * Cria memória de sessão
   */
  const createSessionMemory = useCallback(async (
    input: CreateMemorySessionInput
  ): Promise<MemorySession | null> => {
    if (!memoryService) return null;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const memory = await memoryService.createSessionMemory(input);
      setState(prev => ({ ...prev, isLoading: false }));
      return memory;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar sessão';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return null;
    }
  }, [memoryService]);

  /**
   * Limpa erro
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Recarrega memórias recentes
   */
  const refreshMemories = useCallback(async () => {
    if (memoryService) {
      await loadRecentMemories(memoryService);
    }
  }, [memoryService, loadRecentMemories]);

  return {
    ...state,
    search,
    createDurableMemory,
    createEphemeralMemory,
    createSessionMemory,
    clearError,
    refreshMemories,
  };
}

/**
 * Hook simplificado para uso em componentes
 */
export function useSimpleMemory(userId: UUID | null) {
  const {
    isLoading,
    error,
    search,
    recentMemories,
  } = useMemory(userId);

  const searchMemories = useCallback(async (
    query: string
  ): Promise<SearchResponse | null> => {
    return search(query);
  }, [search]);

  return {
    isLoading,
    error,
    search: searchMemories,
    recentMemories,
  };
}
