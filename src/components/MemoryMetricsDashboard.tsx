'use client';

import { MemoryMetrics } from '@/types';
import { METRIC_TARGETS, MetricAlert } from '@/lib/memory/metrics';

/**
 * Memory Metrics Dashboard
 * Sistema de Memória Persistente - AMP Studio
 * 
 * Implementa interface especificada em:
 * - docs/OPENCLAW_MEMORY_METRICS.md:239-265
 */

interface MemoryMetricsDashboardProps {
  metrics: MemoryMetrics | null;
  alerts: MetricAlert[];
  onRefresh?: () => void;
}

/**
 * Cartão de métrica individual
 */
function MetricCard({ 
  title, 
  value, 
  unit = '', 
  target, 
  status 
}: { 
  title: string;
  value: number;
  unit?: string;
  target?: number;
  status: 'good' | 'warning' | 'critical' | 'unknown';
}) {
  const statusColors = {
    good: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    critical: 'bg-red-50 border-red-200 text-red-800',
    unknown: 'bg-gray-50 border-gray-200 text-gray-800',
  };

  const statusIcons = {
    good: (
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    critical: (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    unknown: (
      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const getStatus = (): 'good' | 'warning' | 'critical' | 'unknown' => {
    if (status !== 'unknown' && target !== undefined) {
      if (title.includes('Latency') || title.includes('Freshness')) {
        return value <= target ? 'good' : value <= target * 1.2 ? 'warning' : 'critical';
      }
      return value >= target ? 'good' : value >= target * 0.8 ? 'warning' : 'critical';
    }
    return status;
  };

  const currentStatus = getStatus();

  return (
    <div className={`p-4 rounded-xl border-2 ${statusColors[currentStatus]} transition-all duration-300`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</span>
        {statusIcons[currentStatus]}
      </div>
      <div className="text-2xl font-bold">
        {typeof value === 'number' ? value.toFixed(1) : value}
        <span className="text-sm font-normal ml-1 opacity-70">{unit}</span>
      </div>
      {target !== undefined && (
        <div className="text-xs mt-2 opacity-60">
          Meta: {target}{unit}
        </div>
      )}
    </div>
  );
}

/**
 * Alerta individual
 */
function AlertItem({ alert }: { alert: MetricAlert }) {
  const severityStyles = {
    critical: 'bg-red-100 border-red-300 text-red-800',
    warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    info: 'bg-blue-100 border-blue-300 text-blue-800',
  };

  return (
    <div className={`p-3 rounded-lg border ${severityStyles[alert.severity]} flex items-center gap-3`}>
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div className="flex-1">
        <p className="font-semibold text-sm">{alert.message}</p>
        <p className="text-xs opacity-70">
          Atual: {alert.actualValue.toFixed(1)} (limite: {alert.threshold})
        </p>
      </div>
    </div>
  );
}

/**
 * Dashboard de métricas de memória
 * Implementação baseada em docs/OPENCLAW_MEMORY_METRICS.md:239-265
 */
export function MemoryMetricsDashboard({ metrics, alerts, onRefresh }: MemoryMetricsDashboardProps) {
  if (!metrics) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-500">Carregando métricas...</span>
        </div>
      </div>
    );
  }

  const hasAlerts = alerts.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Métricas de Memória</h2>
              <p className="text-blue-100 text-xs">Sistema OpenClaw</p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Atualizar métricas"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {hasAlerts && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Alertas ({alerts.length})
          </h3>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <AlertItem key={index} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard
            title="Memory Hit Rate"
            value={metrics.hitRate}
            unit="%"
            target={METRIC_TARGETS.hitRate}
            status={metrics.hitRate >= METRIC_TARGETS.hitRate ? 'good' : 'warning'}
          />
          <MetricCard
            title="Search Latency (P95)"
            value={metrics.searchLatencyP95}
            unit="ms"
            target={METRIC_TARGETS.searchLatencyP95}
            status={metrics.searchLatencyP95 <= METRIC_TARGETS.searchLatencyP95 ? 'good' : 'warning'}
          />
          <MetricCard
            title="Write Latency (P95)"
            value={metrics.writeLatencyP95}
            unit="ms"
            target={METRIC_TARGETS.writeLatencyP95}
            status={metrics.writeLatencyP95 <= METRIC_TARGETS.writeLatencyP95 ? 'good' : 'warning'}
          />
        </div>
      </div>

      {/* Cache & Quality */}
      <div className="px-6 pb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          Cache & Qualidade
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard
            title="Embedding Cache"
            value={metrics.embeddingCacheHitRate}
            unit="%"
            target={METRIC_TARGETS.embeddingCacheHitRate}
            status={metrics.embeddingCacheHitRate >= METRIC_TARGETS.embeddingCacheHitRate ? 'good' : 'warning'}
          />
          <MetricCard
            title="Relevance Score"
            value={metrics.relevanceScore}
            unit="/5.0"
            target={METRIC_TARGETS.relevanceScore * 20}
            status={metrics.relevanceScore >= METRIC_TARGETS.relevanceScore ? 'good' : 'warning'}
          />
          <MetricCard
            title="Semantic Similarity"
            value={metrics.semanticSimilarity}
            unit=""
            target={METRIC_TARGETS.semanticSimilarity}
            status={metrics.semanticSimilarity >= METRIC_TARGETS.semanticSimilarity ? 'good' : 'warning'}
          />
        </div>
      </div>

      {/* System Health */}
      <div className="px-6 pb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Saúde do Sistema
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard
            title="Memory Freshness"
            value={metrics.memoryFreshnessMinutes}
            unit="min"
            target={METRIC_TARGETS.memoryFreshnessMinutes}
            status={metrics.memoryFreshnessMinutes <= METRIC_TARGETS.memoryFreshnessMinutes ? 'good' : 'warning'}
          />
          <MetricCard
            title="Index Consistency"
            value={metrics.indexConsistencyPercent}
            unit="%"
            target={METRIC_TARGETS.indexConsistencyPercent}
            status={metrics.indexConsistencyPercent === METRIC_TARGETS.indexConsistencyPercent ? 'good' : 'critical'}
          />
          <MetricCard
            title="Cache Savings"
            value={metrics.cacheSavingsPercent}
            unit="%"
            target={METRIC_TARGETS.cacheSavings}
            status={metrics.cacheSavingsPercent >= METRIC_TARGETS.cacheSavings ? 'good' : 'warning'}
          />
        </div>
      </div>

      {/* Cache Stats */}
      <div className="px-6 pb-6 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Cache Hits: {metrics.cacheHits}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Cache Misses: {metrics.cacheMisses}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemoryMetricsDashboard;
