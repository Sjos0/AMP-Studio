# Antigravity Kit - Sistema de Expansão de Capacidades

## Visão Geral

O projeto pode ter instalado o **Antigravity Kit** (`@vudovn/ag-kit`), um toolkit modular que expande as capacidades do assistente com:

- **20 Agentes Especialistas** - Personas de IA para diferentes domínios
- **36 Skills Modulares** - Conhecimentos específicos por domínio
- **11 Workflows** - Procedimentos de slash commands
- **Scripts de Validação** - Ferramentas de verificação automatizada

## Estrutura do Antigravity kit

```
.agent/
├── agents/              # 20 agentes especialistas
├── skills/              # 36 skills modulares
├── workflows/           # 11 workflows (slash commands)
├── rules/               # Regras globais
└── scripts/             # Scripts de validação
```

## Princípio de Carregamento Sob Demanda

As skills do Antigravity Kit são **carregadas sob demanda**, não todas de uma vez. Isso significa:

1. **Não carregar tudo automaticamente** - Apenas carregar a skill necessária para a tarefa específica
2. **Interpretar o contexto** - Identificar qual skill é relevante baseado no pedido do usuário
3. **Ser econômico** - Carregar apenas o necessário para evitar sobrecarga de contexto

## Invocação de Skills pelo Usuário

O usuário pode invocar uma skill explicitamente usando o prefixo `@`:

- `@frontend-specialist` - Para tarefas de UI/UX web
- `@backend-specialist` - Para tarefas de API e lógica de negócio
- `@database-architect` - Para tarefas de schema e SQL
- `@mobile-developer` - Para tarefas mobile (iOS, Android, RN)
- `@security-auditor` - Para auditorias de segurança
- `@test-engineer` - Para estratégias de teste
- `@debugger` - Para debugging e troubleshooting
- `@performance-optimizer` - Para otimização de performance
- `@seo-specialist` - Para SEO e visibilidade
- `@code-archaeologist` - Para código legado e refatoração

## Comunicação Transparente

Sempre comunicar ao usuário sobre o que está sendo usado:

1. **Antes de usar uma skill/agent/workflow**:
   - "Vou usar a skill `react-best-practices` para otimizar este componente"
   - "Vou invocar o agente `frontend-specialist` para criar esta UI"
   - "Vou usar o workflow `/create` para scaffolding deste projeto"

2. **Durante a execução**:
   - "Carregando a skill `api-patterns` para estruturar esta API"
   - "Aplicando validação com `checklist.py`"

3. **Após a execução**:
   - "Validação concluída com `verify_all.py` - todos os checks passaram"
   - "Workflow `/debug` identificou a causa raiz"

## Skills Mais Utilizadas por Domínio

| Domínio | Skills Recomendadas |
|---------|---------------------|
| **Web UI/UX** | `react-best-practices`, `frontend-design`, `tailwind-patterns`, `web-design-guidelines` |
| **APIs** | `api-patterns`, `nodejs-best-practices` |
| **Banco de Dados** | `database-design`, `prisma-expert` |
| **Mobile** | `mobile-design` |
| **Testes** | `testing-patterns`, `webapp-testing`, `tdd-workflow` |
| **Segurança** | `vulnerability-scanner`, `red-team-tactics` |
| **Performance** | `performance-profiling`, `react-best-practices` |
| **SEO** | `seo-fundamentals`, `geo-fundamentals` |
| **Arquitetura** | `app-builder`, `architecture`, `plan-writing` |
| **Debugging** | `systematic-debugging` |

## Workflows Disponíveis

Os workflows são invocados com slash commands:

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/brainstorm` | Descoberta socrática | Para explorar requisitos |
| `/create` | Criar novas features | Para implementar do zero |
| `/debug` | Depurar problemas | Para troubleshooting |
| `/deploy` | Fazer deploy | Para deployment |
| `/enhance` | Melhorar código existente | Para refatoração |
| `/orchestrate` | Coordenação multi-agente | Para tarefas complexas |
| `/plan` | Breakdown de tarefas | Para planejamento |
| `/preview` | Visualizar mudanças | Para revisão |
| `/status` | Status do projeto | Para overview |
| `/test` | Rodar testes | Para validação |
| `/ui-ux-pro-max` | Design com 50 estilos | Para UI design |

## Scripts de Validação

| Script | Propósito | Quando Usar |
|--------|-----------|-------------|
| `checklist.py` | Validação core (segurança, lint, types, tests, UX, SEO) | Durante desenvolvimento |
| `verify_all.py` | Verificação completa (Lighthouse, Playwright, Bundle, Mobile, i18n) | Pre-deploy |

## Autonomia do Assistente

O assistente deve usar o Antigravity Kit de forma autônoma:

1. **Identificar oportunidades** - Reconhecer quando uma skill/agent/workflow pode ajudar
2. **Sugerir proativamente** - Propor o uso de ferramentas do kit quando relevante
3. **Carregar sob demanda** - Não sobrecarregar o contexto com skills desnecessárias
4. **Validar sempre** - Usar scripts de validação após modificações importantes
5. **Documentar decisões** - Explicar por que cada skill/agent foi escolhido
