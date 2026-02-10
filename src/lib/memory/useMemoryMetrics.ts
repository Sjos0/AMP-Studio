/**
 * Hook para Métricas de Memória
 * Sistema de Memória Persistente - AMP Studio
 *
 * Fornece acesso às métricas do sistema de memória
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { MemoryMetricsCollector } from './metrics';
import { MemoryMetrics, UUID, SearchResult } from '@/types';

/**
 * Hook para acesso às métricas de memória
 */
export function useMemoryMetrics(userId: UUID | null) {
  const [metrics, setMetrics] = useState<MemoryMetrics | null>(null);
  const [alerts, setAlerts] = useState<{ metric: string; message: string; severity: string }[]>([]);
  
  // Usar ref para manter o collector por userId
  const collectorRef = useRef<MemoryMetricsCollector | null>(null);

  const getCollector = useCallback(() => {
    if (!userId) return null;
    
    // Criar novo collector se userId mudou ou não existe
    if (!collectorRef.current) {
      collectorRef.current = new MemoryMetricsCollector(userId);
    }
    return collectorRef.current;
  }, [userId]);

  const refreshMetrics = useCallback(async () => {
    const collector = getCollector();
    if (!collector) {
      setMetrics(null);
      setAlerts([]);
      return;
    }
    
    const newMetrics = await collector.getMetrics();
    const newAlerts = await collector.checkAlerts();
    
    setMetrics(newMetrics);
    setAlerts(newAlerts.map(a => ({
      metric: a.metric,
      message: a.message,
      severity: a.severity,
    })));
  }, [getCollector]);

  const recordSearch = useCallback(async (query: string, results: SearchResult[], latencyMs: number) => {
    const collector = getCollector();
    if (!collector) return;
    
    await collector.recordSearch(query, results, latencyMs);
    await refreshMetrics();
  }, [getCollector, refreshMetrics]);

  const recordEmbedding = useCallback(async (cached: boolean) => {
    const collector = getCollector();
    if (!collector) return;
    
    await collector.recordEmbedding(cached);
    await refreshMetrics();
  }, [getCollector, refreshMetrics]);

  const recordWrite = useCallback(async (latencyMs: number) => {
    const collector = getCollector();
    if (!collector) return;
    
    await collector.recordWrite(latencyMs);
    await refreshMetrics();
  }, [getCollector, refreshMetrics]);

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
