# Regras Globais do Kilo Code

Este arquivo contém diretrizes **core** do assistente de IA Kilo Code. Regras detalhadas estão em arquivos dedicados para otimização de contexto.

## Arquitetura de Regras

```
.kilocode/
├── rules/                    # Arquivos lidos SEMPRE junto com Regras_Globais.md
│   ├── communication.md      # Diretrizes de comunicação
│   ├── best-practices.md     # Boas práticas e guidelines
│   ├── componentization.md   # Princípios de componentização
│   ├── task-workflow.md      # Workflow de tarefas e TODO List
│   └── code-indexing.md      # Sistema de indexação de código (codebase_search)
├── subrules/                 # Arquivos lidos SOB DEMANDA (trigger-based)
│   ├── skill-usage.md        # Uso de skills (trigger: uso de skills)
│   ├── antigravity-kit.md    # Antigravity Kit (trigger: uso de Antigravity Kit)
│   ├── github-sync.md        # GitHub Sync (trigger: 10+ modificações)
│   └── self-compliance.md    # Auto-verificação (trigger: regras aplicáveis)
└── skills/                   # Skills do Kilo Code
```

## Filosofia de Raciocínio

### Pensamento Profundo e Analítico

O assistente deve adotar uma abordagem de **raciocínio lento e deliberado**, especialmente para tarefas complexas:

1. **Decomposição de Problemas**: Decompor a tarefa em componentes menores
2. **Análise de Impacto**: Considerar como mudanças afetam outras partes
3. **Verificação Múltipla**: Validar suposições antes de executar
4. **Pensamento Reverso**: Considerar casos limite e cenários de falha

### Auto-Observação

O assistente deve estar atento a padrões de erro recorrente nas regras e reportá-los ao usuário quando identificados, sugerindo ajustes.

---

## Gestão de Tarefas

**OBRIGATÓRIO**: Seguir fluxo de [`task-workflow.md`](task-workflow.md) para toda tarefa.

### Fluxo de Escaneamento

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Verificar pasta `to-do-list/`                            │
│    ├─ Não existe → Criar pasta + arquivo de planejamento    │
│    ├─ Existe vazia → Criar arquivo de planejamento          │
│    └─ Existe com arquivos → Analisar correlação             │
├─────────────────────────────────────────────────────────────┤
│ 2. Se existe arquivo:                                       │
│    ├─ Correlação com tarefa atual → Continuar existente     │
│    └─ Sem correlação → Criar novo arquivo de planejamento   │
├─────────────────────────────────────────────────────────────┤
│ 3. Arquivo de planejamento = roadmap início ao fim          │
└─────────────────────────────────────────────────────────────┘
```

### Responsabilidade

O assistente deve **proativamente** criar e manter arquivos de planejamento sem que o usuário precise solicitar explicitamente.

---

## Sistema de Subrules (Carregamento Sob Demanda)

**Princípio**: Subrules são carregadas **APENAS** quando seu trigger é ativado.

### Estrutura de Triggers

| Subrule | Trigger | Localização |
|---------|---------|-------------|
| `skill-usage.md` | Uso de qualquer skill | `.kilocode/subrules/skill-usage.md` |
| `antigravity-kit.md` | Uso de Antigravity Kit | `.kilocode/subrules/antigravity-kit.md` |
| `github-sync.md` | 10+ modificações | `.kilocode/subrules/github-sync.md` |
| `self-compliance.md` | Regras aplicáveis | `.kilocode/subrules/self-compliance.md` |

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
