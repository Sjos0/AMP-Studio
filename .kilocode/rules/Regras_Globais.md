# Regras Globais do Kilo Code

Este arquivo contém diretrizes **core** do assistente de IA Kilo Code. Regras detalhadas estão em arquivos dedicados para otimização de contexto.

## Arquitetura de Regras

```
.kilocode/
├── rules/                    # Arquivos lidos SEMPRE junto com Regras_Globais.md
│   ├── communication.md      # Diretrizes de comunicação
│   ├── best-practices.md     # Boas práticas e guidelines
│   ├── componentization.md   # Princípios de componentização
│   └── task-workflow.md      # Workflow de tarefas e TODO List
├── subrules/                 # Arquivos lidos SOB DEMANDA (trigger-based)
│   ├── skill-usage.md        # Uso de skills (trigger: uso de skills)
│   ├── antigravity-kit.md    # Antigravity Kit (trigger: uso de Antigravity Kit)
│   └── github-sync.md        # GitHub Sync (trigger: 10+ modificações)
└── skills/                   # Skills do Kilo Code
```

## Filosofia de Raciocínio

### Pensamento Profundo e Analítico

O assistente deve adotar uma abordagem de **raciocínio lento e deliberado**, especialmente para tarefas complexas:

1. **Decomposição de Problemas**: Decompor a tarefa em componentes menores
2. **Análise de Impacto**: Considerar como mudanças afetam outras partes
3. **Verificação Múltipla**: Validar suposições antes de executar
4. **Pensamento Reverso**: Considerar casos limite e cenários de falha

### Tempo de Pensamento Ajustável

- **Simples**: 300 tokens (tarefas triviais)
- **Moderado**: 800-1500 tokens
- **Padrão**: 1500-2500 tokens
- **Complexo**: 3000+ tokens

---

## Sistema de Subrules (Carregamento Sob Demanda)

**Princípio**: Subrules são carregadas **APENAS** quando seu trigger é ativado.

### Estrutura de Triggers

| Subrule | Trigger | Localização |
|---------|---------|-------------|
| `skill-usage.md` | Uso de qualquer skill | `.kilocode/subrules/skill-usage.md` |
| `antigravity-kit.md` | Uso de Antigravity Kit | `.kilocode/subrules/antigravity-kit.md` |
| `github-sync.md` | 10+ modificações | `.kilocode/subrules/github-sync.md` |

### Fluxo de Carregamento

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Identificar trigger da tarefa                            │
├─────────────────────────────────────────────────────────────┤
│ 2. Ler subrule correspondente (.kilocode/subrules/[nome])  │
├─────────────────────────────────────────────────────────────┤
│ 3. Aplicar diretrizes da subrule                           │
└─────────────────────────────────────────────────────────────┘
```

---

## GitHub Sync Trigger

### Regra de Threshold

**Sincronização é disparada quando houver ≥ 10 modificações**.

### Fluxo de Verificação

1. Ao final de cada tarefa: `git status`
2. Contar modificações (modificados + novos + deletados)
3. Se count ≥ 10:
   - Ler `.kilocode/subrules/github-sync.md`
   - Executar sincronização completa
4. Se count < 10:
   - Reportar: `Modificações acumuladas: {count}/10`

### Quando NÃO Verificar

- Tarefas de leitura pura (perguntas sobre código)
- Tarefas de debugging (análise de logs)
- Quando usuário solicita "não sincronizar"
- Prototipagem experimental

---

## MCPs Configurados

- **Localização**: `.kilocode/mcp.json`
- **MCPs Atuais**:
  - `context7` - Documentação up-to-date
  - `supabase` - Integração com banco Supabase

---

## Conclusão

Esta estrutura otimiza o contexto do assistente:
- **Core rules**: Sempre carregadas (~2k tokens)
- **Sibling files**: Carregados automaticamente (~5k tokens)
- **Subrules**: Carregadas sob demanda (~3k tokens cada)

**Total otimizado**: ~7k tokens base + ~3k tokens sob demanda = ~10k tokens vs ~20k+ original
