/**
 * Hook para Métricas de Memória
 * Sistema de Memória Persistente - AMP Studio
 * 
 * Fornece acesso às métricas do sistema de memória
 */

'use client';

import { useState, useCallback } from 'react';
import { MemoryMetrics, MemoryMetricsCollector } from './metrics';
import { UUID } from '@/types';

// Singleton collector para métricas
let metricsCollector: MemoryMetricsCollector | null = null;

function getCollector(): MemoryMetricsCollector {
  if (!metricsCollector) {
    metricsCollector = new MemoryMetricsCollector();
  }
  return metricsCollector;
}

/**
 * Hook para acesso às métricas de memória
 */
export function useMemoryMetrics(userId: UUID | null) {
  const [metrics, setMetrics] = useState<MemoryMetrics | null>(null);
  const [alerts, setAlerts] = useState<{ type: string; message: string }[]>([]);

  const refreshMetrics = useCallback(async () => {
    if (!userId) return;
    
    const collector = getCollector();
    const newMetrics = collector.getMetrics();
    const newAlerts = collector.checkAlerts(newMetrics);
    
    setMetrics(newMetrics);
    setAlerts(newAlerts);
  }, [userId]);

  const recordSearch = useCallback(async (query: string, resultsCount: number, latencyMs: number) => {
    const collector = getCollector();
    await collector.recordSearch(query, resultsCount, latencyMs);
    await refreshMetrics();
  }, [refreshMetrics]);

  const recordEmbedding = useCallback(async (content: string, cached: boolean) => {
    const collector = getCollector();
    await collector.recordEmbedding(content, cached);
    await refreshMetrics();
  }, [refreshMetrics]);

  const recordWrite = useCallback(async (type: 'ephemeral' | 'durable' | 'session') => {
    const collector = getCollector();
    await collector.recordWrite(type);
    await refreshMetrics();
  }, [refreshMetrics]);

  return {
    metrics,
    alerts,
    refreshMetrics,
    recordSearch,
    recordEmbedding,
    recordWrite,
  };
}

/**
 * Hook simplificado para métricas (apenas leitura)
 */
export function useSimpleMemoryMetrics(userId: UUID | null) {
  const { metrics, alerts, refreshMetrics } = useMemoryMetrics(userId);

  return {
    metrics,
    alerts,
    refreshMetrics,
  };
}
