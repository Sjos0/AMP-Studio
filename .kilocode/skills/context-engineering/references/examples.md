# Exemplos Práticos de Context Engineering

## Visão Geral

Este documento contém exemplos práticos e cenários reais de aplicação dos princípios de Context Engineering. Cada exemplo demonstra como aplicar as técnicas de gerenciamento de contexto em situações comuns de desenvolvimento.

## Exemplo 1: Organização de Projeto TypeScript

### Cenário

Um projeto de e-commerce em crescimento precisa ser reorganizado para melhorar a manutenibilidade e reduzir o acoplamento entre módulos.

### Análise de Contexto Atual

```typescript
// Contexto antes da refatoração
interface ProjetoEcommerce {
  arquivos: string[];
  dependencias: Record<string, string[]>;
  complexidade: number;
  acoplamento: number;
}

const projeto = {
  arquivos: [
    'src/utils.ts',           // 500 linhas - utilitários misturados
    'src/api.ts',             // 400 linhas - chamadas API misturadas
    'src/components.tsx',      // 800 linhas - componentes misturados
    'src/hooks.ts',            // 300 linhas - hooks misturados
    'src/types.ts',            // 200 linhas - tipos misturados
  ],
  dependencias: {
    'src/utils.ts': ['src/api.ts', 'src/types.ts'],
    'src/api.ts': ['src/types.ts'],
    'src/components.tsx': ['src/utils.ts', 'src/api.ts', 'src/hooks.ts'],
    'src/hooks.ts': ['src/api.ts', 'src/types.ts'],
  },
  complexidade: 85, // Alta
  acoplamento: 78,  // Alto
};
```

### Reorganização por Features

```typescript
// Estrutura após refatoração
interface EstruturaReorganizada {
  features: Feature[];
  shared: SharedResources;
}

interface Feature {
  nome: string;
  componentes: string[];
  hooks: string[];
  servicos: string[];
  tipos: string[];
  dependenciasExternas: string[];
}

const estruturaReorganizada: EstruturaReorganizada = {
  features: [
    {
      nome: 'produtos',
      componentes: ['ProductCard.tsx', 'ProductList.tsx', 'ProductDetail.tsx'],
      hooks: ['useProducts.ts', 'useProductSearch.ts'],
      servicos: ['productService.ts'],
      tipos: ['Product.ts', 'ProductCategory.ts'],
      dependenciasExternas: ['shared/ui', 'shared/hooks'],
    },
    {
      nome: 'carrinho',
      componentes: ['CartItem.tsx', 'CartSummary.tsx'],
      hooks: ['useCart.ts', 'useCartActions.ts'],
      servicos: ['cartService.ts'],
      tipos: ['CartItem.ts', 'Cart.ts'],
      dependenciasExternas: ['shared/ui', 'features/produtos'],
    },
    {
      nome: 'checkout',
      componentes: ['CheckoutForm.tsx', 'PaymentForm.tsx', 'AddressForm.tsx'],
      hooks: ['useCheckout.ts', 'usePayment.ts'],
      servicos: ['checkoutService.ts', 'paymentService.ts'],
      tipos: ['CheckoutData.ts', 'PaymentResult.ts'],
      dependenciasExternas: ['shared/ui', 'features/carrinho'],
    },
  ],
  shared: {
    ui: ['Button.tsx', 'Input.tsx', 'Modal.tsx', 'Spinner.tsx'],
    hooks: ['useAsync.ts', 'useLocalStorage.ts', 'useDebounce.ts'],
    utils: ['formatCurrency.ts', 'validateEmail.ts'],
    types: ['BaseEntity.ts', 'ApiResponse.ts'],
  },
};
```

### Resultado

```typescript
// Métricas após refatoração
interface MetricasRefatoracao {
  complexidade: number;
  acoplamento: number;
  coesao: number;
  tokensEconomizados: number;
}

const metricas: MetricasRefatoracao = {
  complexidade: 45,      // Redução de 47%
  acoplamento: 32,       // Redução de 59%
  coesao: 85,            // Aumento significativo
  tokensEconomizados: 1500, // Em contexto de sessão
};
```

## Exemplo 2: Gerenciamento de Estado Multi-Step

### Cenário

Um processo de onboarding com 5 passos que precisa manter estado entre as etapas e permitir retomadas.

### Implementação do Contexto de Sessão

```typescript
interface PassoOnboarding {
  id: string;
  titulo: string;
  dadosColetados: Record<string, unknown>;
  validado: boolean;
}

interface ContextoOnboarding {
  idSessao: string;
  usuarioId: string;
  progresso: number; // 0-100
  passoAtual: number;
  passos: PassoOnboarding[];
  dadosConsolidados: Record<string, unknown>;
  timestampInicio: number;
  timeout: number;
}

class GerenciadorOnboarding {
  private contexto: ContextoOnboarding;

  constructor(usuarioId: string) {
    this.contexto = {
      idSessao: this.gerarIdSessao(),
      usuarioId,
      progresso: 0,
      passoAtual: 0,
      passos: this.inicializarPassos(),
      dadosConsolidados: {},
      timestampInicio: Date.now(),
      timeout: 30 * 60 * 1000, // 30 minutos
    };
  }

  private inicializarPassos(): PassoOnboarding[] {
    return [
      {
        id: 'informacoes-pessoais',
        titulo: 'Informações Pessoais',
        dadosColetados: {},
        validado: false,
      },
      {
        id: 'preferencias',
        titulo: 'Preferências',
        dadosColetados: {},
        validado: false,
      },
      {
        id: 'configuracao-conta',
        titulo: 'Configuração da Conta',
        dadosColetados: {},
        validado: false,
      },
      {
        id: 'verificacao',
        titulo: 'Verificação de Email',
        dadosColetados: {},
        validado: false,
      },
      {
        id: 'confirmacao',
        titulo: 'Confirmação',
        dadosColetados: {},
        validado: false,
      },
    ];
  }

  avancarPasso(dados: Record<string, unknown>): boolean {
    const passoAtual = this.contexto.passos[this.contexto.passoAtual];
    
    if (this.validarPasso(passoAtual.id, dados)) {
      passoAtual.dadosColetados = dados;
      passoAtual.validado = true;
      
      this.contexto.dadosConsolidados = {
        ...this.contexto.dadosConsolidados,
        ...dados,
      };
      
      if (this.contexto.passoAtual < this.contexto.passos.length - 1) {
        this.contexto.passoAtual++;
        this.atualizarProgresso();
        return true;
      }
    }
    return false;
  }

  private atualizarProgresso(): void {
    const passosValidados = this.contexto.passos.filter(p => p.validado).length;
    this.contexto.progresso = (passosValidados / this.contexto.passos.length) * 100;
  }

  serializarContexto(): string {
    // Comprimir contexto para armazenamento
    return JSON.stringify({
      sid: this.contexto.idSessao,
      uid: this.contexto.usuarioId,
      p: this.contexto.progresso,
      pc: this.contexto.passoAtual,
      dc: this.contexto.dadosConsolidados,
      ts: this.contexto.timestampInicio,
    });
  }
}
```

## Exemplo 3: Sistema de Cache de Contexto

### Cenário

Um dashboard analítico que precisa carregar dados frequentemente acessados rapidamente.

### Implementação do Cache

```typescript
interface CacheEntry<T> {
  dados: T;
  ttl: number;
  hits: number;
  tamanho: number;
  ultimoAcesso: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTtl: number;
  estrategiaEvicao: 'lru' | 'lfu' | 'fifo';
}

class ContextCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private config: CacheConfig;
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.config = {
      maxSize: config.maxSize ?? 100,
      defaultTtl: config.defaultTtl ?? 5 * 60 * 1000, // 5 minutos
      estrategiaEvicao: config.estrategiaEvicao ?? 'lru',
    };
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    if (Date.now() - entry.ultimoAcesso > entry.ttl) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    entry.hits++;
    entry.ultimoAcesso = Date.now();
    this.hitCount++;
    return entry.dados;
  }

  set(key: string, dados: T, ttl?: number): void {
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      dados,
      ttl: ttl ?? this.config.defaultTtl,
      hits: 1,
      tamanho: this.calcularTamanho(dados),
      ultimoAcesso: Date.now(),
    });
  }

  private evict(): void {
    if (this.config.estrategiaEvicao === 'lru') {
      this.evictLRU();
    } else if (this.config.estrategiaEvicao === 'lfu') {
      this.evictLFU();
    } else {
      this.evictFIFO();
    }
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.ultimoAcesso < oldestTime) {
        oldestTime = entry.ultimoAcesso;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private evictLFU(): void {
    let minHitsKey: string | null = null;
    let minHits = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        minHitsKey = key;
      }
    }

    if (minHitsKey) {
      this.cache.delete(minHitsKey);
    }
  }

  private evictFIFO(): void {
    // Primeiro inserido é primeiro removido
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
    }
  }

  private calcularTamanho(dados: T): number {
    return new Blob([JSON.stringify(dados)]).size;
  }

  getMetrics(): CacheMetrics {
    const total = this.hitCount + this.missCount;
    return {
      hitRate: total > 0 ? this.hitCount / total : 0,
      size: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
    };
  }
}

interface CacheMetrics {
  hitRate: number;
  size: number;
  hitCount: number;
  missCount: number;
}
```

## Exemplo 4: Gatilhos de Acionamento Contextual

### Cenário

Um sistema que detecta padrões no contexto e aciona automaticamente certas ações.

### Implementação de Gatilhos

```typescript
interface CondicaoGatilho {
  tipo: 'padrao' | 'threshold' | 'sequencia' | 'temporal';
  avaliador: (contexto: ContextoAtual) => boolean;
  peso: number;
}

interface AcaoGatilho {
  tipo: 'notificacao' | 'transformacao' | 'sugestao' | 'automacao';
  executa: (contexto: ContextoAtual) => ResultadoAcao;
}

interface Gatilho {
  nome: string;
  condicoes: CondicaoGatilho[];
  acao: AcaoGatilho;
  prioridade: number;
  ativo: boolean;
}

class MotorGatilhos {
  private gatilhos: Gatilho[] = [];
  private contexto: ContextoAtual;

  constructor() {
    this.gatilhos = this.inicializarGatilhosPadrao();
  }

  private inicializarGatilhosPadrao(): Gatilho[] {
    return [
      {
        nome: 'alta-complexidade-detectada',
        condicoes: [
          {
            tipo: 'threshold',
            avaliador: (ctx) => ctx.complexidade > 80,
            peso: 1,
          },
        ],
        acao: {
          tipo: 'sugestao',
          executa: (ctx) => ({
            tipo: 'sugestao',
            mensagem: 'Considere refatorar em módulos menores',
            acaoSugerida: 'chunk_context',
          }),
        },
        prioridade: 10,
        ativo: true,
      },
      {
        nome: 'muitos-arquivos-ativos',
        condicoes: [
          {
            tipo: 'threshold',
            avaliador: (ctx) => ctx.arquivosAtivos.length > 10,
            peso: 1,
          },
        ],
        acao: {
          tipo: 'transformacao',
          executa: (ctx) => ({
            tipo: 'agrupamento',
            acao: 'agrupar_arquivos_por_dominio',
          }),
        },
        prioridade: 5,
        ativo: true,
      },
      {
        nome: 'padrao-refatoracao-detectado',
        condicoes: [
          {
            tipo: 'padrao',
            avaliador: (ctx) => /refactor|reorganiz|extract/i.test(ctx.operacao),
            peso: 2,
          },
        ],
        acao: {
          tipo: 'automacao',
          executa: (ctx) => ({
            tipo: 'ativa_skill',
            skill: 'code-archaeologist',
          }),
        },
        prioridade: 8,
        ativo: true,
      },
      {
        nome: 'contexto-token-alto',
        condicoes: [
          {
            tipo: 'threshold',
            avaliador: (ctx) => ctx.usoTokens > 1500,
            peso: 1,
          },
        ],
        acao: {
          tipo: 'transformacao',
          executa: (ctx) => ({
            tipo: 'comprimir',
            metodo: 'summarize_inactive_chunks',
          }),
        },
        prioridade: 7,
        ativo: true,
      },
    ];
  }

  avaliarContexto(contexto: ContextoAtual): ResultadoAcao[] {
    this.contexto = contexto;
    const resultados: ResultadoAcao[] = [];

    for (const gatilho of this.gatilhos) {
      if (!gatilho.ativo) continue;

      const condicoesCumpridas = gatilho.cond(c => c.avicoes.everyaliador(contexto));
      
      if (condicoesCumpridas) {
        const resultado = gatilho.acao.executa(contexto);
        resultado.gatilho = gatilho.nome;
        resultado.prioridade = gatilho.prioridade;
        resultados.push(resultado);
      }
    }

    return resultados.sort((a, b) => (b.prioridade ?? 0) - (a.prioridade ?? 0));
  }
}

interface ContextoAtual {
  complexidade: number;
  arquivosAtivos: string[];
  operacao: string;
  usoTokens: number;
}

interface ResultadoAcao {
  tipo: string;
  mensagem?: string;
  acao?: string;
  gatilho?: string;
  prioridade?: number;
}
```

## Exemplo 5: Economia de Tokens em Sessões Longas

### Cenário

Uma sessão de desenvolvimento que dura várias horas e precisa manter eficiência de tokens.

### Estratégia de Compressão Progressiva

```typescript
interface NivelCompressao {
  nivel: number;
  fator: number;
  descricao: string;
  tokensRetidos: number;
}

interface ChunkContexto {
  id: string;
  tipo: 'ativo' | 'recente' | 'historico' | 'arquivado';
  dados: unknown;
  importancia: number;
  ultimoAcesso: number;
  acessos: number;
}

class CompressorContexto {
  private chunks: Map<string, ChunkContexto> = new Map();
  private readonly niveis: NivelCompressao[] = [
    { nivel: 0, fator: 1, descricao: 'Original', tokensRetidos: 2000 },
    { nivel: 1, fator: 2, descricao: 'Compressão Leve', tokensRetidos: 1000 },
    { nivel: 2, fator: 4, descricao: 'Compressão Média', tokensRetidos: 500 },
    { nivel: 3, fator: 8, descricao: 'Compressão Alta', tokensRetidos: 250 },
    { nivel: 4, fator: 16, descricao: 'Resumo', tokensRetidos: 125 },
  ];

  calcularNivelOtimo(usoTokensAtual: number, limite: number): number {
    const razao = limite / Math.max(usoTokensAtual, 1);
    
    for (let i = this.niveis.length - 1; i >= 0; i--) {
      if (razao >= this.niveis[i].fator) {
        return i;
      }
    }
    return this.niveis.length - 1;
  }

  comprimirChunk(chunkId: string, nivel: number): ChunkContexto | null {
    const chunk = this.chunks.get(chunkId);
    if (!chunk) return null;

    const infoNivel = this.niveis[nivel];
    
    return {
      ...chunk,
      dados: this.aplicarCompressao(chunk.dados, nivel),
      importancia: chunk.importancia * (1 - nivel * 0.15),
    };
  }

  private aplicarCompressao(dados: unknown, nivel: number): unknown {
    if (nivel === 0) return dados;

    const texto = typeof dados === 'string' ? dados : JSON.stringify(dados);
    
    if (nivel >= 4) {
      return this.resumir(texto);
    } else if (nivel >= 3) {
      return this.extrairPontosChave(texto);
    } else if (nivel >= 2) {
      return this.comprimirPorPadroes(texto);
    } else {
      return this.comprimirParcialmente(texto);
    }
  }

  private resumir(texto: string): string {
    // Reduzir a ~10% do original
    const pontos = this.extrairPontosChave(texto);
    return pontos.slice(0, 3).join(' | ');
  }

  private extrairPontosChave(texto: string): string[] {
    // Extrair sentenças importantes
    const sentencas = texto.split(/[.!?]+/).filter(s => s.trim());
    return sentencas.slice(0, 5);
  }

  private comprimirPorPadroes(texto: string): string {
    // Comprimir padrões comuns
    return texto
      .replace(/const\s+/g, 'c ')
      .replace(/function\s+/g, 'f ')
      .replace(/interface\s+/g, 'i ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private comprimirParcialmente(texto: string): string {
    return texto.replace(/\s+/g, ' ').trim();
  }

  reorganizarContexto(usoTokens: number, limite: number): AcaoReorganizacao[] {
    const acoes: AcaoReorganizacao[] = [];
    const nivel = this.calcularNivelOtimo(usoTokens, limite);

    // Marcar chunks inativos para compressão
    for (const [id, chunk] of this.chunks) {
      const tempoInativo = Date.now() - chunk.ultimoAcesso;
      const importancia = chunk.importancia * (1 / (chunk.acessos + 1));

      if (tempoInativo > 30 * 60 * 1000 && chunk.tipo === 'ativo') {
        chunk.tipo = 'recente';
        acoes.push({ tipo: 'reclassificar', chunkId: id, novoTipo: 'recente' });
      }

      if (tempoInativo > 2 * 60 * 60 * 1000 && importancia < 0.5) {
        const comprimido = this.comprimirChunk(id, nivel);
        if (comprimido) {
          this.chunks.set(id, comprimido);
          acoes.push({ tipo: 'comprimir', chunkId: id, nivel });
        }
      }
    }

    return acoes;
  }
}

interface AcaoReorganizacao {
  tipo: 'comprimir' | 'reclassificar' | 'arquivar' | 'remover';
  chunkId: string;
  nivel?: number;
  novoTipo?: string;
}
```

## Conclusão

Estes exemplos demonstram como aplicar Context Engineering em cenários reais:

1. **Organização de Projeto**: Reorganização por features com separação clara de responsabilidades
2. **Gerenciamento de Estado**: Manutenção de estado multi-step com serialização eficiente
3. **Cache de Contexto**: Sistema de cache inteligente com métricas
4. **Gatilhos Contextuais**: Detecção automática de padrões e acionamento de ações
5. **Economia de Tokens**: Compressão progressiva baseada em relevância

Cada exemplo pode ser adaptado e combinado conforme as necessidades específicas do projeto.
