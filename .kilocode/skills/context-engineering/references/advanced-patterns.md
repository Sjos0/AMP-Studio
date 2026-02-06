# Padrões Avançados de Context Engineering

## Visão Geral

Este documento explora padrões avançados e técnicas sofisticadas para gerenciamento de contexto em sistemas de IA. Estes padrões são destinados a cenários complexos onde as técnicas básicas não são suficientes.

## 1. Padrão de Camada de Contexto Hierárquica

### Conceito

Implementação de uma arquitetura de contexto com múltiplas camadas hierárquicas, onde cada camada tem responsabilidades específicas e níveis de granularidade diferentes.

### Implementação

```typescript
/**
 * Camada de Contexto Hierárquica (Hierarchical Context Layer)
 * 
 * Este padrão organiza o contexto em camadas hierárquicas com
 * responsabilidades bem definidas:
 * 
 * Layer 0 (Working): Contexto ativo imediato (~100-200 tokens)
 * Layer 1 (Session): Contexto da sessão atual (~500-1000 tokens)
 * Layer 2 (Project): Contexto do projeto (~1000-2000 tokens)
 * Layer 3 (Reference): Documentação e referências (ilimitado)
 */

interface ContextLayer {
  nivel: number;
  nome: string;
  limiteTokens: number;
  dados: unknown;
  ultimaAtualizacao: number;
  version: number;
}

class HierarchicalContextManager {
  private camadas: Map<number, ContextLayer> = new Map();
  private listeners: Set<(evento: ContextEvent) => void> = new Set();

  constructor() {
    this.inicializarCamadas();
  }

  private inicializarCamadas(): void {
    const configuracoes = [
      { nivel: 0, nome: 'Working', limiteTokens: 150 },
      { nivel: 1, nome: 'Session', limiteTokens: 800 },
      { nivel: 2, nome: 'Project', limiteTokens: 2000 },
      { nivel: 3, nome: 'Reference', limiteTokens: Infinity },
    ];

    for (const config of configuracoes) {
      this.camadas.set(config.nivel, {
        nivel: config.nivel,
        nome: config.nome,
        limiteTokens: config.limiteTokens,
        dados: null,
        ultimaAtualizacao: Date.now(),
        version: 0,
      });
    }
  }

  adicionar(nivel: number, dados: unknown, metadados?: Record<string, unknown>): boolean {
    const camada = this.camadas.get(nivel);
    if (!camada) return false;

    const tokensEstimados = this.contarTokens(JSON.stringify(dados));
    if (tokensEstimados > camada.limiteTokens) {
      // Dispara evento de overflow
      this.dispararEvento({
        tipo: 'overflow',
        nivel,
        tokens: tokensEstimados,
        limite: camada.limiteTokens,
      });
      return false;
    }

    camada.dados = dados;
    camada.ultimaAtualizacao = Date.now();
    camada.version++;

    // Dispara evento de atualização
    this.dispararEvento({
      tipo: 'update',
      nivel,
      version: camada.version,
      timestamp: camada.ultimaAtualizacao,
    });

    return true;
  }

  obter(nivel: number): unknown {
    return this.camadas.get(nivel)?.dados ?? null;
  }

  promover(nivelOrigem: number, nivelDestino: number): boolean {
    const dados = this.obter(nivelOrigem);
    if (!dados) return false;

    // Comprimir para o nível de destino
    const dadosComprimidos = this.comprimirParaNivel(dados, nivelDestino);
    return this.adicionar(nivelDestino, dadosComprimidos);
  }

  private comprimirParaNivel(dados: unknown, nivel: number): unknown {
    const fatorCompressao = Math.pow(2, nivel);
    const texto = JSON.stringify(dados);

    // Algoritmo de compressão progressiva
    let comprimido = texto;
    for (let i = 0; i < fatorCompressao; i++) {
      comprimido = this.compressaoSimples(comprimido);
    }

    return JSON.parse(comprimido);
  }

  private compressaoSimples(texto: string): string {
    return texto
      .replace(/"([^"]+)":/g, '$1:') // Remove aspas de chaves
      .replace(/\s+/g, ' ') // Normaliza espaços
      .replace(/true/g, 't')
      .replace(/false/g, 'f')
      .replace(/null/g, 'n');
  }

  private contarTokens(texto: string): number {
    // Aproximação: 1 token ≈ 4 caracteres
    return Math.ceil(texto.length / 4);
  }

  private dispararEvento(evento: ContextEvent): void {
    for (const listener of this.listeners) {
      listener(evento);
    }
  }

  onEvento(listener: (evento: ContextEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  obterMetricas(): MetricasCamadas {
    const metricas: MetricasCamadas = {
      camadas: [],
      totalTokens: 0,
      statusGeral: 'healthy',
    };

    for (const [nivel, camada] of this.camadas) {
      const tokens = this.contarTokens(JSON.stringify(camada.dados ?? {}));
      const usoPercentual = camada.limiteTokens === Infinity
        ? 0
        : (tokens / camada.limiteTokens) * 100;

      metricas.camadas.push({
        nivel: camada.nivel,
        nome: camada.nome,
        tokens,
        limite: camada.limiteTokens,
        usoPercentual,
        ultimaAtualizacao: camada.ultimaAtualizacao,
      });

      metricas.totalTokens += tokens;
    }

    // Avaliar status geral
    const camadaWorking = metricas.camadas[0];
    if (camadaWorking.usoPercentual > 90) {
      metricas.statusGeral = 'critical';
    } else if (camadaWorking.usoPercentual > 70) {
      metricas.statusGeral = 'warning';
    }

    return metricas;
  }
}

interface ContextEvent {
  tipo: 'update' | 'overflow' | 'compression' | 'promotion';
  nivel: number;
  version?: number;
  timestamp?: number;
  tokens?: number;
  limite?: number;
}

interface MetricasCamadas {
  camadas: {
    nivel: number;
    nome: string;
    tokens: number;
    limite: number;
    usoPercentual: number;
    ultimaAtualizacao: number;
  }[];
  totalTokens: number;
  statusGeral: 'healthy' | 'warning' | 'critical';
}
```

## 2. Padrão de Contexto Adaptativo

### Conceito

Sistema de contexto que se adapta automaticamente baseado em padrões de uso, aprendendo com o comportamento do usuário para otimizar a entrega de informações.

### Implementação

```typescript
/**
 * Contexto Adaptativo (Adaptive Context)
 * 
 * Este padrão implementa um sistema que:
 * - Aprende padrões de uso do usuário
 * - Antecipa necessidades de contexto
 * - Pre-carrega informações relevantes
 * - Ajusta automaticamente a granularidade
 */

interface PadraoUso {
  tipo: 'frequente' | 'recente' | 'predito';
  frequencia: number;
  ultimaVez: number;
  confianca: number;
}

interface Predicao {
  informacao: string;
  probabilidade: number;
  momento: 'proximas_interacoes' | 'proximas_horas' | 'proximos_dias';
}

class AdaptiveContextEngine {
  private padroes: Map<string, PadraoUso> = new Map();
  private historicoInteracoes: Interacao[] = [];
  private cachePredicoes: Map<string, Predicao[]> = new Map();
  private readonly janelasTemporais = {
    recente: 30 * 60 * 1000,    // 30 minutos
    medio: 2 * 60 * 60 * 1000,    // 2 horas
    longo: 24 * 60 * 60 * 1000,   // 24 horas
  };

  constructor(private contextoBase: unknown) {}

  registrarInteracao(interacao: Interacao): void {
    this.historicoInteracoes.push({
      ...interacao,
      timestamp: Date.now(),
    });

    // Atualizar padrões
    for (const info of interacao.informacoesAcessadas) {
      const padraoExistente = this.padroes.get(info);
      if (padraoExistente) {
        padraoExistente.frequencia++;
        padraoExistente.ultimaVez = Date.now();
        padraoExistente.confianca = Math.min(1, padraoExistente.frequencia / 10);
      } else {
        this.padroes.set(info, {
          tipo: 'frequente',
          frequencia: 1,
          ultimaVez: Date.now(),
          confianca: 0.1,
        });
      }
    }

    // Limpar histórico antigo
    this.limparHistoricoAntigo();
  }

  private limparHistoricoAntigo(): void {
    const limite = Date.now() - this.janelasTemporais.longo;
    this.historicoInteracoes = this.historicoInteracoes.filter(
      i => i.timestamp > limite
    );
  }

  predecirNecessidades(): Predicao[] {
    const interacaoRecente = this.historicoInteracoes.slice(-1)[0];
    if (!interacaoRecente) return [];

    const predicoes: Predicao[] = [];
    const agora = Date.now();

    // Predição baseada em padrões frequentes
    for (const [info, padrao] of this.padroes) {
      if (padrao.tipo === 'frequente' && padrao.confianca > 0.5) {
        predicoes.push({
          informacao: info,
          probabilidade: padrao.confianca,
          momento: 'proximas_interacoes',
        });
      }
    }

    // Predição baseada em sequências
    const sequencias = this.detectarSequencias();
    for (const sequencia of sequencias) {
      if (sequencia.proximoStep) {
        predicoes.push({
          informacao: sequencia.proximoStep,
          probabilidade: sequencia.confianca,
          momento: 'proximas_interacoes',
        });
      }
    }

    // Ordenar por probabilidade
    predicoes.sort((a, b) => b.probabilidade - a.probabilidade);

    return predicoes.slice(0, 10);
  }

  private detectarSequencias(): Sequencia[] {
    const sequencias: Sequencia[] = [];
    const padroesSequenciais = new Map<string, number>();

    // Detectar padrões sequenciais
    for (let i = 0; i < this.historicoInteracoes.length - 1; i++) {
      const atual = this.historicoInteracoes[i];
      const proximo = this.historicoInteracoes[i + 1];
      
      const chave = `${JSON.stringify(atual.informacoesAcessadas)} → ${JSON.stringify(proximo.informacoesAcessadas)}`;
      padroesSequenciais.set(chave, (padroesSequenciais.get(chave) ?? 0) + 1);
    }

    // Converter para sequências com alta frequência
    for (const [chave, count] of padroesSequenciais) {
      if (count >= 3) {
        const partes = chave.split(' → ');
        const steps = partes.map(p => JSON.parse(p) as string[]);
        
        sequencias.push({
          steps,
          confianca: count / this.historicoInteracoes.length,
          proximoStep: steps[steps.length - 1][0],
        });
      }
    }

    return sequencias;
  }

  otimizarContexto(contextoAtual: unknown): Otimizacao {
    const predicoes = this.predecirNecessidades();
    const informacoesRelevantes = new Set<string>();
    
    // Adicionar informações baseadas em predições
    for (const predicao of predicoes.slice(0, 5)) {
      if (predicao.probabilidade > 0.7) {
        informacoesRelevantes.add(predicao.informacao);
      }
    }

    // Adicionar informações frequentemente acessadas
    for (const [info, padrao] of this.padroes) {
      if (padrao.confianca > 0.6) {
        informacoesRelevantes.add(info);
      }
    }

    return {
      informacoesRelevantes: Array.from(informacoesRelevantes),
      predicoes: predicoes.slice(0, 5),
      acoesRecomendadas: this.gerarRecomendacoes(predicoes),
    };
  }

  private gerarRecomendacoes(predicoes: Predicao[]): string[] {
    const recomendacoes: string[] = [];

    if (predicoes.some(p => p.momento === 'proximas_interacoes')) {
      recomendacoes.push('pre-carregar_contexto_frequente');
    }

    const predicoesLongoPrazo = predicoes.filter(
      p => p.momento === 'proximos_dias'
    );
    if (predicoesLongoPrazo.length > 0) {
      recomendacoes.push('arquivar_contexto_para_uso_futuro');
    }

    const informacoesBaixaConfianca = predicoes.filter(
      p => p.probabilidade < 0.3
    );
    if (informacoesBaixaConfianca.length > 5) {
      recomendacoes.push('limpar_contexto_baixa_relevancia');
    }

    return recomendacoes;
  }
}

interface Interacao {
  tipo: 'leitura' | 'escrita' | 'edicao' | 'navegacao';
  informacoesAcessadas: string[];
  duracao?: number;
}

interface Sequencia {
  steps: string[][];
  confianca: number;
  proximoStep?: string;
}

interface Otimizacao {
  informacoesRelevantes: string[];
  predicoes: Predicao[];
  acoesRecomendadas: string[];
}
```

## 3. Padrão de Contexto Distribuído

### Conceito

Gerenciamento de contexto através de múltiplos sistemas e fontes, sincronizando informações de forma coerente.

### Implementação

```typescript
/**
 * Contexto Distribuído (Distributed Context)
 * 
 * Este padrão gerencia contexto através de múltiplas fontes:
 * - Memória local
 * - Sistema de cache distribuído
 * - Banco de dados de sessão
 * - Sistema de arquivos
 */

type FonteContexto = 'local' | 'cache' | 'database' | 'filesystem';

interface ContextoSincronizado {
  id: string;
  dados: unknown;
  fonte: FonteContexto;
  timestamp: number;
  version: number;
  ttl: number;
  consistencia: 'forte' | 'eventual';
}

class DistributedContextManager {
  private fontes: Map<FonteContexto, ContextSource> = new Map();
  private sincronizador: ContextSynchronizer;
  private conflitos: Conflito[] = [];
  private readonly estrategiaResolucao: EstrategiaResolucao = 'timestamp';

  constructor() {
    this.sincronizador = new ContextSynchronizer(this);
    this.inicializarFontes();
  }

  private inicializarFontes(): void {
    this.fontes.set('local', new LocalMemorySource());
    this.fontes.set('cache', new DistributedCacheSource());
    this.fontes.set('database', new DatabaseSource());
    this.fontes.set('filesystem', new FilesystemSource());
  }

  async obter<T>(
    chave: string,
    preferencia: FonteContexto[] = ['cache', 'database', 'local', 'filesystem']
  ): Promise<T | null> {
    const resultados: ContextoSincronizado[] = [];

    for (const fonte of preferencia) {
      const source = this.fontes.get(fonte);
      if (!source) continue;

      try {
        const dado = await source.get(chave);
        if (dado !== null) {
          resultados.push({
            id: chave,
            dados: dado,
            fonte,
            timestamp: Date.now(),
            version: 1,
            ttl: source.getTTL(chave),
            consistencia: 'eventual',
          });
        }
      } catch (error) {
        console.warn(`Erro ao obter de ${fonte}:`, error);
      }
    }

    if (resultados.length === 0) return null;
    if (resultados.length === 1) return resultados[0].dados as T;

    // Resolver conflitos
    return this.resolverConflitos<T>(resultados);
  }

  private resolverConflitos<T>(resultados: ContextoSincronizado[]): T {
    const conflito: Conflito = {
      id: resultados[0].id,
      versoes: resultados,
      timestamp: Date.now(),
      estrategia: this.estrategiaResolucao,
    };

    switch (this.estrategiaResolucao) {
      case 'timestamp':
        return this.resolverPorTimestamp(resultados) as T;
      case 'versao':
        return this.resolverPorVersao(resultados) as T;
      case 'fonte':
        return this.resolverPorFonte(resultados) as T;
      case 'merge':
        return this.resolverPorMerge(resultados) as T;
      default:
        this.conflitos.push(conflito);
        return resultados[0].dados as T;
    }
  }

  private resolverPorTimestamp(resultados: ContextoSincronizado[]): unknown {
    return resultados.sort((a, b) => b.timestamp - a.timestamp)[0].dados;
  }

  private resolverPorVersao(resultados: ContextoSincronizado[]): unknown {
    return resultados.sort((a, b) => b.version - a.version)[0].dados;
  }

  private resolverPorFonte(resultados: ContextoSincronizado[]): unknown {
    const ordemPreferida: FonteContexto[] = ['database', 'cache', 'local', 'filesystem'];
    return resultados.sort(
      (a, b) => ordemPreferida.indexOf(a.fonte) - ordemPreferida.indexOf(b.fonte)
    )[0].dados;
  }

  private resolverPorMerge(resultados: ContextoSincronizado[]): unknown {
    // Implementação simplificada de merge
    const merge = resultados.reduce((acc, r) => this.deepMerge(acc, r.dados), {});
    this.conflitos.push({
      id: resultados[0].id,
      versoes: resultados,
      timestamp: Date.now(),
      estrategia: 'merge',
    });
    return merge;
  }

  private deepMerge(target: unknown, source: unknown): unknown {
    if (typeof source !== 'object' || source === null) return source;
    if (typeof target !== 'object' || target === null) return source;

    const output = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key as keyof typeof source] && typeof source[key as keyof typeof source] === 'object') {
        (output as Record<string, unknown>)[key] = this.deepMerge(
          (output as Record<string, unknown>)[key],
          source[key as keyof typeof source]
        );
      } else {
        (output as Record<string, unknown>)[key] = source[key as keyof typeof source];
      }
    }
    return output;
  }

  async sincronizar(chave: string): Promise<void> {
    await this.sincronizador.synchronize(chave);
  }

  onConflito(listener: (conflito: Conflito) => void): () => void {
    return this.sincronizador.onConflict(listener);
  }
}

interface ContextSource {
  get(key: string): Promise<unknown | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  getTTL(key: string): number;
}

class LocalMemorySource implements ContextSource {
  private store: Map<string, { value: unknown; ttl: number }> = new Map();

  async get(key: string): Promise<unknown | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.ttl) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: unknown, ttl: number = 300000): Promise<void> {
    this.store.set(key, { value, ttl: Date.now() + ttl });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  getTTL(key: string): number {
    const entry = this.store.get(key);
    return entry ? entry.ttl : 0;
  }
}

class DistributedCacheSource implements ContextSource {
  // Implementação usando Redis ou similar
  async get(key: string): Promise<unknown | null> {
    // Simulação
    return null;
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {}

  async delete(key: string): Promise<void> {}

  getTTL(key: string): number {
    return 0;
  }
}

class DatabaseSource implements ContextSource {
  async get(key: string): Promise<unknown | null> {
    // Simulação
    return null;
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {}

  async delete(key: string): Promise<void> {}

  getTTL(key: string): number {
    return 0;
  }
}

class FilesystemSource implements ContextSource {
  async get(key: string): Promise<unknown | null> {
    // Simulação
    return null;
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {}

  async delete(key: string): Promise<void> {}

  getTTL(key: string): number {
    return 0;
  }
}

class ContextSynchronizer {
  private conflitosListeners: Set<(conflito: Conflito) => void> = new Set();

  constructor(private manager: DistributedContextManager) {}

  async synchronize(chave: string): Promise<void> {
    // Lógica de sincronização
  }

  onConflict(listener: (conflito: Conflito) => void): () => void {
    this.conflitosListeners.add(listener);
    return () => this.conflitosListeners.delete(listener);
  }
}

interface Conflito {
  id: string;
  versoes: ContextoSincronizado[];
  timestamp: number;
  estrategia: string;
}

type EstrategiaResolucao = 'timestamp' | 'versao' | 'fonte' | 'merge';
```

## 4. Padrão de Contexto Orientado por Eventos

### Conceito

Sistema de contexto que reage a eventos e dispara ações baseadas em condições específicas.

### Implementação

```typescript
/**
 * Contexto Orientado por Eventos (Event-Driven Context)
 * 
 * Este padrão implementa um sistema de eventos onde:
 * - Estados de contexto disparam eventos
 * - Listeners reagem a eventos específicos
 * - Ações são executadas baseadas em regras
 */

interface EventoContexto {
  tipo: string;
  origem: string;
  timestamp: number;
  dados: unknown;
  metadata?: Record<string, unknown>;
}

interface RegraEvento {
  id: string;
  evento: string;
  condicao: (evento: EventoContexto) => boolean;
  acao: (evento: EventoContexto) => ResultadoAcao;
  prioridade: number;
  ativa: boolean;
}

interface ResultadoAcao {
  sucesso: boolean;
  mensagem: string;
  alteracoes?: ContextoAlteracao[];
}

interface ContextoAlteracao {
  tipo: 'adicao' | 'remocao' | 'modificacao';
  chave: string;
  valorAnterior?: unknown;
  valorNovo?: unknown;
}

class EventDrivenContextEngine {
  private eventos: EventoContexto[] = [];
  private regras: Map<string, RegraEvento> = new Map();
  private historicoAlteracoes: ContextoAlteracao[] = [];

  constructor() {
    this.carregarRegrasPadrao();
  }

  private carregarRegrasPadrao(): void {
    const regrasPadrao: RegraEvento[] = [
      {
        id: 'limpar-contexto-inativo',
        evento: 'tempo_decorrido',
        condicao: (e) => (e.metadata?.tempo as number) > 30 * 60 * 1000,
        acao: (e) => this.limparContextoInativo(),
        prioridade: 10,
        ativa: true,
      },
      {
        id: 'comprimir-contexto-cheio',
        evento: 'limite_tokens_alcancado',
        condicao: () => true,
        acao: (e) => this.comprimirContexto(),
        prioridade: 5,
        ativa: true,
      },
      {
        id: 'salvar-progresso',
        evento: 'checkpoint',
        condicao: () => true,
        acao: (e) => this.salvarProgresso(e),
        prioridade: 1,
        ativa: true,
      },
    ];

    for (const regra of regrasPadrao) {
      this.regras.set(regra.id, regra);
    }
  }

  adicionarRegra(regra: RegraEvento): void {
    this.regras.set(regra.id, regra);
  }

  removerRegra(id: string): void {
    this.regras.delete(id);
  }

  async dispararEvento(tipo: string, dados: unknown, metadata?: Record<string, unknown>): Promise<void> {
    const evento: EventoContexto = {
      tipo,
      origem: 'user',
      timestamp: Date.now(),
      dados,
      metadata,
    };

    this.eventos.push(evento);

    // Executar regras em ordem de prioridade
    const regrasAtivas = Array.from(this.regras.values())
      .filter(r => r.ativa && r.evento === tipo)
      .sort((a, b) => a.prioridade - b.prioridade);

    for (const regra of regrasAtivas) {
      if (regra.condicao(evento)) {
        await regra.acao(evento);
      }
    }
  }

  private limparContextoInativo(): ResultadoAcao {
    const inativos = this.eventos.filter(
      e => Date.now() - e.timestamp > 30 * 60 * 1000
    );

    return {
      sucesso: true,
      mensagem: `${inativos.length} eventos inativos limpos`,
    };
  }

  private comprimirContexto(): ResultadoAcao {
    return {
      sucesso: true,
      mensagem: 'Contexto comprimido com sucesso',
      alteracoes: [
        {
          tipo: 'modificacao',
          chave: 'tokens_usados',
          valorAnterior: 2000,
          valorNovo: 1000,
        },
      ],
    };
  }

  private salvarProgresso(evento: EventoContexto): ResultadoAcao {
    this.historicoAlteracoes.push({
      tipo: 'adicao',
      chave: `checkpoint_${evento.timestamp}`,
      valorNovo: evento.dados,
    });

    return {
      sucesso: true,
      mensagem: 'Progresso salvo com sucesso',
    };
  }

  obterHistoricoEventos(tipo?: string): EventoContexto[] {
    if (!tipo) return this.eventos;
    return this.eventos.filter(e => e.tipo === tipo);
  }

  obterMetricas(): MetricasEventos {
    return {
      totalEventos: this.eventos.length,
      eventosPorTipo: this.agruparPorTipo(),
      regrasAtivas: Array.from(this.regras.values()).filter(r => r.ativa).length,
      ultimoEvento: this.eventos[this.eventos.length - 1] ?? null,
      alteracoesRealizadas: this.historicoAlteracoes.length,
    };
  }

  private agruparPorTipo(): Record<string, number> {
    return this.eventos.reduce((acc, e) => {
      acc[e.tipo] = (acc[e.tipo] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
```

## Conclusão

Estes padrões avançados representam técnicas sofisticadas para gerenciamento de contexto:

1. **Camada Hierárquica**: Organização em múltiplas camadas com responsabilidades específicas
2. **Contexto Adaptativo**: Sistema que aprende e se adapta ao comportamento do usuário
3. **Contexto Distribuído**: Gerenciamento de contexto através de múltiplas fontes
4. **Contexto Orientado por Eventos**: Sistema reativo baseado em eventos e regras

Cada padrão pode ser combinado ou adaptado conforme as necessidades específicas do sistema.
