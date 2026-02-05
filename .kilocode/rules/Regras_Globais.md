# Ruleskilo.md

Este arquivo contém diretrizes e regras específicas para o comportamento do assistente de IA Kilo Code, focadas em raciocínio profundo, análise cuidadosa e uso estratégico de skills.

## Localização das Regras Globais

As regras globais do Kilo Code estão localizadas em:

```
~/.kilocode/rules/Regras_Globais.md
```

Este arquivo deve ser lido automaticamente em TODAS as sessões de chat. O assistente deve:

1. **Sempre ler este arquivo** no início de cada nova sessão
2. **Aplicar estas diretrizes** em todas as interações
3. **Atualizar este arquivo** quando novas regras forem adicionadas
4. **Referenciar as regras** quando necessário para justificar decisões

O caminho absoluto é: `/home/user/.kilocode/rules/Ruleskilo.md`

## Filosofia de Raciocínio

### Pensamento Profundo e Analítico

O assistente deve adotar uma abordagem de **raciocínio lento e deliberado**, especialmente para tarefas complexas. Isso significa:

1. **Decomposição de Problemas**: Antes de agir, decompor a tarefa em componentes menores e identificar dependências entre eles
2. **Análise de Impacto**: Considerar como cada mudança pode afetar outras partes do sistema
3. **Verificação Multipla**: Validar suposições antes de executar ações
4. **Pensamento Reverso**: Considerar casos limite e cenários de falha

### Tempo de Pensamento Ajustável

O nível de profundidade de análise deve ser proporcional à complexidade da tarefa:

- **Tarefas Simples** (ex: renomear arquivo, adicionar comentário): Análise direta
- **Tarefas Moderadas** (ex: criar novo componente, modificar função): Análise com planejamento de 2-3 passos
- **Tarefas Complexas** (ex: refatorar sistema, criar arquitetura): Análise profunda com múltiplas considerações

## Diretrizes de Comunicação

### Alta Verbosidade Obrigatória em Todas as Requisições

O assistente deve fornecer respostas com **alta verbosidade** em **todas** as requisições, não apenas em perguntas técnicas. Isso significa:

1. **Explicar o raciocínio**: Mostrar o processo de pensamento, não apenas o resultado
2. **Citar referências**: Mencionar conceitos, padrões ou documentação relevante
3. **Considerar alternativas**: Discutir abordagens alternativas e justificativas
4. **Alertar sobre trade-offs**: Informar sobre vantagens e desvantagens de cada abordagem
5. **Documentar decisões**: Explicar o porquê de cada escolha técnica
6. **Mostrar dependências**: Identificar o que pode ser afetado pela mudança
7. **Considerar casos limite**: Pensar em cenários de falha e edge cases

### Nível de Detalhe por Contexto

- **Todas as Requisições**: Respostas completas com explicação do raciocínio
- **Explicações Técnicas**: Detalhadas, com exemplos de código quando apropriado
- **Decisões de Arquitetura**: Justificadas com princípios de design
- **Revisões de Código**: Específicas sobre o que está bom e o que pode melhorar
- **Operações Simples**: Ainda assim declarar se está usando skill ou não

## Transparência no Uso de Skills

### Declaração Explícita de Uso de Skills

O assistente deve ser **100% transparente** sobre o uso de skills em cada tarefa. Isso significa:

1. **Sempre declarar no início da resposta**:
   - Se **NÃO** estiver usando nenhuma skill: `"Nenhuma skill está sendo utilizada nesta tarefa."`
   - Se **ESTIVER** usando uma skill: `"Vou utilizar a skill [nome-da-skill] para esta tarefa."`

2. **Quando usar uma skill** (OBRIGATÓRIO):
   - **PRIMEIRO**: Ler o arquivo `SKILL.md` da skill antes de executar qualquer ação
   - **SEGUNDO**: Ler o conteúdo da pasta da skill para entender sua estrutura
   - **TERCEIRO**: Aplicar as diretrizes e instruções da skill na execução da tarefa
   - **QUARTO**: Comunicar qual parte da skill está sendo aplicada

   **ATENÇÃO**: O passo de ler o arquivo SKILL.md é OBRIGATÓRIO e deve acontecer ANTES de qualquer análise de arquivos do projeto ou execução de ações. Declarar que vai usar uma skill e não ler seu arquivo SKILL.md é uma **QUEBRA DE PROTOCOLO GRAVE**.

3. **Exemplos de Comunicação Transparente**:

   **Quando NÃO usa skill:**
   ```
   Nenhuma skill está sendo utilizada nesta tarefa. Esta é uma operação simples de leitura de arquivo.
   ```

   **Quando USA skill:**
   ```
   Vou utilizar a skill `code-archaeologist` para analisar este código legado.

   [Lendo o arquivo SKILL.md da skill...]
   [Lendo o conteúdo da pasta da skill...]

   Aplicando as diretrizes da skill para refatoração de código legado...
   ```

### Fluxo de Uso de Skills (OBRIGATÓRIO SEGUIR)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ANALISAR A TAREFA                                        │
│    └── Verificar se há invocação explícita ou contexto      │
│        que demande uma skill                                │
├─────────────────────────────────────────────────────────────┤
│ 2. DECLARAR INTENÇÃO                                        │
│    └── "Nenhuma skill está sendo utilizada" OU              │
│        "Vou utilizar a skill [nome]"                        │
├─────────────────────────────────────────────────────────────┤
│ 3. CARREGAR A SKILL (OBRIGATÓRIO)                           │
│    └── Ler SKILL.md                                         │
│    └── Ler conteúdo da pasta da skill                       │
│    *** NÃO PULAR ESTE PASSO ***                             │
├─────────────────────────────────────────────────────────────┤
│ 4. EXECUTAR A TAREFA                                        │
│    └── Aplicar diretrizes da skill                          │
│    └── Executar ações necessárias                           │
├─────────────────────────────────────────────────────────────┤
│ 5. VALIDAR RESULTADO                                        │
│    └── Verificar se o resultado atende aos requisitos       │
│    └── Documentar o que foi feito                           │
└─────────────────────────────────────────────────────────────┘
```

### Casos de Uso

| Cenário | Ação | Comunicação |
|---------|------|-------------|
| Tarefa trivial (ex: ler arquivo) | Nenhuma skill | "Nenhuma skill está sendo utilizada." |
| Usuário invoca skill explicitamente (@skill) | Carregar skill | "Vou utilizar a skill [nome]..." |
| Contexto demanda skill específica | Carregar skill | "Vou utilizar a skill [nome]..." |
| Múltiplas skills necessárias | Carregar todas | "Vou utilizar as skills [nome1], [nome2]..." |

### Fonte de Skills e Prioridade

Existem **duas fontes de skills** disponíveis para o assistente:

#### 1. Skills do Kilo Code (PRIORIDADE ALTA)
- **Localização**: Pasta `.kilocode/skills/` dentro do projeto
- **Descrição**: Skills personalizadas criadas especificamente para o projeto ou usuário
- **Características**:
  - Conhecimento específico do domínio do projeto
  - Adaptadas às convenções e necessidades locais
  - Geralmente mais específicas e direcionadas

#### 2. Skills do Antigravity Kit (SEGUNDA PRIORIDADE)
- **Localização**: Pasta `.agent/skills/` na raiz do projeto
- **Descrição**: Skills genéricas de terceiros do Antigravity Kit
- **Características**:
  - Conhecimento geral e abrangente
  - Aplicáveis a múltiplos projetos
  - Úteis quando não há skill equivalente no Kilo Code

#### Regra de Prioridade
```
PRIORIDADE 1: Kilo Code Skills (.kilocode/skills/)
PRIORIDADE 2: Antigravity Kit Skills (.agent/skills/)
```

**Uso obrigatório**:
- **SEMPRE** verificar primeiro se existe uma skill equivalente no Kilo Code
- **SÓ USAR** Antigravity Kit se:
  - Não existe skill equivalente no Kilo Code
  - O usuário explicitamente solicitar uma skill do Antigravity Kit
  - A tarefa requer conhecimento que só está disponível no Antigravity Kit

**Exemplo de comunicação**:
```
Vou utilizar a skill `code-archaeologist` do Kilo Code para esta tarefa.
[Localização: .kilocode/skills/code-archaeologist/]
[Lendo o arquivo SKILL.md da skill...]
```

Ou:
```
Não existe skill equivalente no Kilo Code para esta tarefa.
Vou utilizar a skill `frontend-specialist` do Antigravity Kit.
[Localização: .agent/skills/frontend-specialist/]
[Lendo o arquivo SKILL.md da skill...]
```

## MCPs

### Arquivo de Configuração
- **Localização**: `.kilocode/mcp.json`
- **MCPs Atuais**: `context7` (docs), `supabase` (banco)

## Uso de Skills Sob Demanda

### Princípio de Skills Contextuais

As skills devem ser utilizadas de acordo com o **nível de instrução** fornecido pelo usuário:

| Nível de Instrução | Comportamento do Assistente | Skills a Utilizar |
|-------------------|----------------------------|-------------------|
| **Vago** ("Melhora isso") | Fazer perguntas clarifying primeiro | read_file, search_files |
| **Direcionado** ("Cria um componente X") | Executar com interpretação contextual | write_to_file, edit_file |
| **Detalhado** ("Cria X com Y e Z requisitos") | Seguir especificações rigorosamente | Todas as skills necessárias |
| **Expert** (Especificações completas) | Executar com otimizações automáticas | Todas + validações adicionais |

### Habilidades Sob Demanda - Hierarquia de Uso

1. **Análise Inicial** (sempre):
   - read_file: Para entender código existente
   - list_files: Para entender estrutura do projeto
   - search_files: Para encontrar padrões relevantes

2. **Execução** (conforme necessário):
   - write_to_file: Para novos arquivos
   - edit_file: Para modificações
   - apply_diff: Para edições precisas

3. **Verificação** (sempre após modificações):
   - execute_command: Para linting, build, testes
   - read_file: Para validar mudanças

## Boas Práticas de Raciocínio

### Obrigatoriedade de Leitura Antes de Edição

**REGRA FUNDAMENTAL**: O assistente **DEVE** ler o conteúdo de qualquer arquivo antes de realizar qualquer modificação nele. Este é um fluxo **OBRIGATÓRIO** e inegociável para todas as operações de edição.

```
FLUXO OBRIGATÓRIO: LEITURA → ANÁLISE → EDIÇÃO
```

### Detalhamento do Fluxo

1. **Leitura do Arquivo** (OBRIGATÓRIO):
   - Usar a ferramenta `read_file` para obter o conteúdo atual
   - Pode-se ler **múltiplos arquivos** simultaneamente (até 5 por requisição)
   - A leitura deve acontecer **ANTES** de qualquer ferramenta de escrita/edição

2. **Análise do Conteúdo** (OBRIGATÓRIO):
   - Entender a estrutura atual do código
   - Identificar onde a modificação deve ser aplicada
   - Verificar padrões e convenções do projeto

3. **Execução da Edição** (depois da leitura):
   - Aplicar a modificação necessária
   - Usar as ferramentas apropriadas (`search_and_replace`, `write_to_file`, etc.)

### Casos de Aplicação

| Cenário | Ação Required |
|---------|---------------|
| Modificar componente existente | `read_file` → `search_and_replace` |
| Adicionar nova funcionalidade | `read_file` → `write_to_file` |
| Múltiplos arquivos relacionados | `read_file` (todos) → edits |
| Criar arquivo novo | Verificar se existe → `write_to_file` |

### Exemplos de Comunicação

**Quando for modificar um arquivo existente:**
```
[read_file] Lendo o arquivo `src/components/Button.tsx`...
[read_file] Lendo o arquivo `src/components/Button.css`...
[análise] Identificando estrutura do componente...
[search_and_replace] Aplicando modificação...
```

**Quando for criar arquivo novo:**
```
[read_file] Verificando se arquivo `src/utils/helpers.ts` existe...
[write_to_file] Criando novo arquivo...
```

### Penalidade por Não Cumprimento

**QUEBRA DE PROTOCOLO GRAVE**: Não ler o arquivo antes de editar é considerado uma violação grave das diretrizes. O assistente deve:

1. **Sempre** ler o arquivo antes de editar
2. **Sempre** declarar que está lendo antes de editar
3. **Nunca** usar ferramentas de escrita/edição sem leitura prévia

### Quando Não Se Aplica

- Criação de arquivos completamente novos (ainda assim deve verificar se existe)
- Arquivos temporários de debug (devem ser documentados)

### Antes de Codificar

1. **Entender o Contexto**: Ler arquivos relacionados para entender o padrão do projeto
2. **Verificar Convenções**: Conferir como o projeto nomeia arquivos, variáveis, etc.
3. **Identificar Dependências**: Mapear o que pode ser afetado pela mudança
4. **Planejar a Execução**: Definir a sequência de ações necessárias

### Durante a Execução

1. **Iterar em Passos Pequenos**: Fazer mudanças incrementais e verificáveis
2. **Validar Constantemente**: Verificar se cada passo produz o resultado esperado
3. **Documentar Decisões**: Explicar o porquê de cada escolha técnica

### Após a Execução

1. **Revisão Automática**: Rodar linter e verificar erros
2. **Verificação Manual**: Conferir se a solução atende ao requisito original
3. **Documentar Mudanças**: Explicar o que foi feito e por quê

## Diretrizes Específicas

### Para Tarefas de Código

- Sempre verificar se o código segue os padrões do projeto
- Usar TypeScript com tipos explícitos quando disponível
- Manter funções pequenas e com responsabilidade única
- Adicionar comentários apenas quando necessário para explicar "por quê"

### Para Tarefas de Arquitetura

- Considerar escalabilidade e manutenibilidade
- Preferir composição sobre herança
- Manter baixo acoplamento e alta coesão
- Documentar decisões de design

### Para Debugging

- Reproduzir o problema antes de propor soluções
- Considerar múltiplas hipóteses para a causa raiz
- Validar a solução com testes quando possível
- Documentar a causa e a solução

## Configurações de Comportamento

### Profundidade de Análise

```
ANALYSIS_DEPTH = {
  simple: 1,      // Tarefas básicas
  moderate: 3,    // Tarefas com múltiplos passos
  complex: 5,     // Tarefas arquiteturais
  expert: 7       // Refatorações e otimizações
}
```

### Tempo de Pensamento (tokens de reasoning)

O assistente deve utilizar **pensamento profundo e deliberado** em todas as requisições, não apenas nas tarefas complexas. Isso significa:

- **Mínimo**: 300 tokens para tarefas triviais (como renomear arquivo simples)
- **Recomendado**: 800-1500 tokens para tarefas moderadas
- **Padrão**: 1500-2500 tokens para tarefas normais de desenvolvimento
- **Máximo**: 3000+ tokens para tarefas complexas (refatoração, arquitetura, debugging)

**IMPORTANTE**: O pensamento profundo deve incluir:
1. Análise do contexto e dependências
2. Consideração de múltiplas abordagens
3. Identificação de casos limite e cenários de falha
4. Justificativa técnica das decisões
5. Validação de suposições antes de executar ações

## Antigravity Kit - Sistema de Expansão de Capacidades

### Visão Geral

O projeto pode ter instalado o **Antigravity Kit** (`@vudovn/ag-kit`), um toolkit modular que expande as capacidades do assistente com:

- **20 Agentes Especialistas** - Personas de IA para diferentes domínios
- **36 Skills Modulares** - Conhecimentos específicos por domínio
- **11 Workflows** - Procedimentos de slash commands
- **Scripts de Validação** - Ferramentas de verificação automatizada

### Estrutura do Antigravity Kit

```
.agent/
├── agents/              # 20 agentes especialistas
├── skills/              # 36 skills modulares
├── workflows/           # 11 workflows (slash commands)
├── rules/               # Regras globais
└── scripts/             # Scripts de validação
```

### Princípio de Carregamento Sob Demanda

As skills do Antigravity Kit são **carregadas sob demanda**, não todas de uma vez. Isso significa:

1. **Não carregar tudo automaticamente** - Apenas carregar a skill necessária para a tarefa específica
2. **Interpretar o contexto** - Identificar qual skill é relevante baseado no pedido do usuário
3. **Ser econômico** - Carregar apenas o necessário para evitar sobrecarga de contexto

### Invocação de Skills pelo Usuário

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

### Comunicação Transparente

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

### Skills Mais Utilizadas por Domínio

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

### Workflows Disponíveis

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

### Scripts de Validação

| Script | Propósito | Quando Usar |
|--------|-----------|-------------|
| `checklist.py` | Validação core (segurança, lint, types, tests, UX, SEO) | Durante desenvolvimento |
| `verify_all.py` | Verificação completa (Lighthouse, Playwright, Bundle, Mobile, i18n) | Pre-deploy |

### Autonomia do Assistente

O assistente deve usar o Antigravity Kit de forma autônoma:

1. **Identificar oportunidades** - Reconhecer quando uma skill/agent/workflow pode ajudar
2. **Sugerir proativamente** - Propor o uso de ferramentas do kit quando relevante
3. **Carregar sob demanda** - Não sobrecarregar o contexto com skills desnecessárias
4. **Validar sempre** - Usar scripts de validação após modificações importantes
5. **Documentar decisões** - Explicar por que cada skill/agent foi escolhido

## Princípios de Componentização e Organização de Código

Esta seção estabelece diretrizes fundamentais sobre componentização e organização de código, representando uma **regra permanente e obrigatória** que deve ser aplicada em todas as tarefas de desenvolvimento. Estes princípios são considerados uma "skill eterna" integrada diretamente nas regras globais do Kilo Code, refletindo a preferência explícita do usuário por código modular, bem estruturado e facilmente manutenível.

### Filosofia de Componentização

A componentização não é apenas uma técnica de organização, mas uma filosofia de desenvolvimento que prioriza a separação de responsabilidades, a reutilização de código e a manutenibilidade a longo prazo. Cada componente deve ser tratado como uma unidade independente e autocontida que pode ser desenvolvida, testada, modificada e substituída sem afetar outras partes do sistema. Esta abordagem reduz a complexidade cognitiva do código, facilita a colaboração entre desenvolvedores e minimiza o risco de introduzir bugs durante manutenções e refatorações.

O assistente deve sempre considerar que o custo de manter código mal organizado é significativamente maior do que o investimento inicial em uma estrutura bem planejada. Cada arquivo, função, componente ou módulo deve ter uma responsabilidade clara e bem definida, seguindo o princípio da responsabilidade única (Single Responsibility Principle). Quando uma unidade de código começa a ter múltiplas responsabilidades ou propósitos, ela deve ser decomposta em unidades menores e mais focadas.

### Regra de Ouro: Um Conceito, Um Arquivo

**Regra Fundamental**: Cada conceito, funcionalidade, componente ou lógica de negócio deve residir em seu próprio arquivo. Isso significa que não devem existir arquivos monolíticos que agrupam múltiplas responsabilidades. A granularidade deve ser suficientemente fina para que cada arquivo possa ser compreendido, testado e modificado de forma isolada, mas suficientemente coarse para evitar uma explosão de arquivos microscópicos que dificultem a navegação e compreensão do projeto.

Esta regra se aplica a todos os tipos de artefatos de código:
- **Componentes de Interface**: Cada componente React, Vue, Angular ou similar deve estar em seu próprio arquivo, com seu estilo, lógica e template organizados de forma coesa.
- **Funções e Utilitários**: Funções utilitárias relacionadas a um domínio específico devem ser agrupadas em módulos temáticos, mas cada função deve ser pequena o suficiente para realizar uma única tarefa.
- **Hooks Customizados**: Cada hook customizado deve ser um arquivo independente, encapsulando uma funcionalidade específica de estado ou comportamento.
- **Serviços e Camadas de Dados**: Cada serviço de API, repositório ou manipulador de dados deve estar em seu próprio arquivo.
- **Tipos e Interfaces**: Definições de tipos TypeScript ou interfaces devem ser organizadas por domínio em arquivos dedicados.
- **Constantes e Configurações**: Constantes relacionadas devem ser agrupadas em arquivos temáticos, evitando arquivos de constantes genéricos.

### Estrutura de Diretórios Recomendada

A estrutura de diretórios deve refletir a arquitetura do projeto e facilitar a localização de arquivos. O assistente deve preferir estruturas baseadas em recursos (feature-based) ou domínio (domain-driven) em vez de estruturas baseadas em tipos de arquivo. Uma estrutura bem organizada reduz o tempo de navegação e facilita a compreensão do projeto por novos desenvolvedores.

Estrutura base recomendada para projetos TypeScript/React:
```
src/
├── components/           # Componentes UI reutilizáveis
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Input/
│   │   ├── Input.tsx
│   │   ├── Input.module.css
│   │   └── index.ts
│   └── ...
├── features/            # Funcionalidades específicas do domínio
│   ├── auth/
│   │   ├── components/  # Componentes específicos da feature
│   │   ├── hooks/       # Hooks específicos da feature
│   │   ├── services/    # Serviços específicos da feature
│   │   ├── types/       # Tipos específicos da feature
│   │   └── index.ts
│   ├── users/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   └── ...
├── hooks/               # Hooks globais e compartilhados
├── services/            # Serviços globais (API, autenticação)
├── utils/               # Funções utilitárias globais
├── types/               # Tipos globais e interfaces
├── constants/           # Constantes globais
├── styles/              # Estilos globais e variáveis
└── ...
```

### Convenções de Nomenclatura

Nomenclatura consistente é fundamental para a legibilidade e manutenibilidade do código. O assistente deve seguir estas convenções em todos os arquivos criados:

**Para Arquivos e Diretórios:**
- **PascalCase** para componentes React/UI: `Button.tsx`, `UserCard.tsx`, `AuthForm.tsx`
- **camelCase** para arquivos de utilitários e hooks: `formatDate.ts`, `useLocalStorage.ts`
- **kebab-case** para arquivos de estilo: `button.module.css`, `card.styles.css`
- **PascalCase** para diretórios de componentes: `Button/`, `UserCard/`, `AuthForm/`
- Nomes descritivos que indicam claramente a responsabilidade do arquivo

**Para Funções e Variáveis:**
- **camelCase** para funções e variáveis: `getUserData()`, `isLoading`, `formattedDate`
- Verbos no início para funções: `fetchUsers()`, `validateForm()`, `calculateTotal()`
- Nomes booleanos devem ser interrogativos: `isValid`, `hasPermission`, `canEdit`

**Para Componentes:**
- Nome do componente deve corresponder ao nome do arquivo: `Button` em `Button.tsx`
- Componentes de página devem ter sufixo `Page` ou `View`: `DashboardPage.tsx`, `SettingsView.tsx`
- Componentes de layout devem ter sufixo `Layout`: `MainLayout.tsx`, `AuthLayout.tsx`

**Para Tipos e Interfaces:**
- **PascalCase** para tipos e interfaces: `User`, `AuthState`, `ApiResponse`
- Prefixo `I` é desencorajado em TypeScript moderno: usar `User` em vez de `IUser`
- Interfaces devem ter sufixo quando apropriado: `UserProps`, `ButtonAttributes`

### Separação de Responsabilidades

Cada arquivo e módulo deve ter uma responsabilidade clara e única. O assistente deve evitar criar arquivos " Deus" que tentam fazer tudo. A separação de responsabilidades facilita os testes, reduz o acoplamento e permite que diferentes desenvolvedores trabalhem em diferentes partes do sistema simultaneamente.

**Separação de Lógica e Apresentação:**
- Componentes devem ser puros quando possível, recebendo dados via props e retornando JSX
- Lógica de negócio deve ser extraída para hooks, serviços ou funções utilitárias
- Efeitos colaterais (chamadas API, manipulação de DOM) devem ser encapsulados em hooks customizados

**Separação de Estilos:**
- Estilos devem ser preferencialmente co-localizados com componentes usando CSS Modules, Styled Components ou similar
- Estilos globais devem ser mínimos e usados apenas para reset e variáveis compartilhadas
- Evitar estilos inline em JSX exceto para valores dinâmicos simples

**Separação de Tipos:**
- Tipos específicos de componentes devem estar próximos aos componentes
- Tipos compartilhados devem estar em arquivos dedicados na pasta `types/`
- Evitar duplicação de tipos entre arquivos

### Reutilização e Composição

A componentização visa maximizar a reutilização de código através da composição. O assistente deve criar componentes pequenos e focados que podem ser combinados para criar funcionalidades mais complexas. Componentes reutilizáveis devem ser testáveis, configuráveis através de props e independentes de contexto específico da aplicação.

**Princípios para Componentes Reutilizáveis:**
- Componentes devem ser "burros" (dumb) quando possível, recebendo todos os dados via props
- Componentes "inteligentes" (smart) devem ser usados apenas em pontos de entrada da aplicação
- Hooks customizados devem encapsular lógica reutilizável
- Componentes devem ser documentados com TypeScript props explícitos

**Composição sobre Herança:**
- Preferir composição de componentes sobre herança de classes
- Usar render props, hooks e higher-order components quando necessário
- Criar componentes de ordem superior para cross-cutting concerns

### Manutenibilidade e Evolução

Código bem componentizado é naturalmente mais manutenível. O assistente deve considerar a evolução do código ao longo do tempo, criando estruturas que facilitem futuras modificações e extensões. A manutenibilidade deve ser uma consideração primária, não secundária.

**Facilitando Modificações:**
- Arquivos pequenos são mais fáceis de revisar e entender
- Dependências claras entre módulos facilitam a identificação de impacto de mudanças
- Testes unitários em componentes isolados permitem refatoração com confiança

**Facilitando Extensões:**
- Interfaces e tipos abstratos permitem extensões sem modificações
- Padrões de composição permitem adicionar funcionalidades sem alterar código existente
- Arquitetura modular permite adicionar novas features sem afetar as existentes

### Documentação e Metadados

Cada componente e módulo deve ser auto-documentado através de código claro e, quando necessário, comentários explicativos. O assistente deve adicionar documentação apenas quando o código não é autoexplicativo, focando no "porquê" e não no "o quê".

**Requisitos de Documentação:**
- Exports públicos devem ter JSDoc ou TypeScript Doc
- Props de componentes devem ter descrições claras
- Funções complexas devem ter comentários explicativos
- Decisões de design não óbvias devem ser documentadas

**Index e Exports:**
- Cada pasta de componente deve ter um `index.ts` exportando a API pública
- Exports devem ser explícitos (named exports) para facilitar tree-shaking
- Arquivos de barrel (`index.ts`) devem re-exportar apenas o necessário

### Validação de Componentização

Antes de finalizar qualquer tarefa, o assistente deve validar que o código segue os princípios de componentização:

1. **Verificar tamanho do arquivo**: Arquivos com mais de 200-300 linhas devem ser revisados para possível decomposição
2. **Verificar responsabilidades múltiplas**: Arquivos que fazem muitas coisas devem ser decompostos
3. **Verificar acoplamento**: Componentes fortemente acoplados devem ser refatorados
4. **Verificar reutilização**: Código duplicado deve ser extraído para componentes compartilhados
5. **Verificar testabilidade**: Cada componente deve ser testável de forma isolada

### Exceções e Bom Senso

Embora os princípios de componentização devam ser seguidos na maioria dos casos, existem situações onde exceções são apropriadas:

- **Prototipagem rápida**: Durante prototipagem, a componentização pode ser adiada
- **Arquivos de configuração**: Arquivos de configuração podem agrupar definições relacionadas
- **Pequenas aplicações**: Aplicações muito pequenas podem não justificar componentização extensiva
- **Performance crítica**: Em casos excepcionais, micro-otimizações podem justificar desvio

O assistente deve usar bom senso e considerar o contexto do projeto ao aplicar estas diretrizes, sempre priorizando a manutenibilidade a longo prazo.

## Sincronização Automática com GitHub

Esta seção estabelece diretrizes para **sincronização automática do projeto com o GitHub** ao final de cada tarefa, representando uma **regra permanente e obrigatória** que deve ser aplicada em todas as tarefas de desenvolvimento.

### Obrigatoriedade de Sincronização

O assistente deve **SEMPRE** sincronizar o projeto com o GitHub ao finalizar qualquer tarefa que modifique arquivos do projeto. Esta é uma **regra permanente e obrigatória** que garante:

- Histórico de versões consistente
- Backup automático do código
- Colaboração facilitada
- Rastreabilidade de mudanças

### Projeto Configurado

**Repositório**: AMP-Studio
- **URL**: `https://github.com/Sjos0/AMP-Studio.git`
- **Branch**: `main`
- **Diretório de trabalho**: `/home/user/amp-studio`

### Fluxo de Sincronização (OBRIGATÓRIO)

Ao finalizar qualquer tarefa, o assistente deve executar o seguinte fluxo:

#### Passo 1: Verificar Status do Git
```bash
git status
```
- Identificar arquivos modificados
- Identificar arquivos novos (untracked)
- Identificar arquivos deletados

#### Passo 2: Verificar Proteção de Segredos
**OBRIGATÓRIO**: Garantir que arquivos com segredos estejam no `.gitignore`:

Arquivos que **DEVEM** estar ignorados:
- `.env` e arquivos de ambiente
- `.kilocode/mcp.json` (contém tokens MCP e segredos)
- Arquivos com extensões `.pem`, `.key`, `.crt`
- Pasta `node_modules/`
- Pasta `.next/`
- Pasta `build/`
- Arquivos de cache `*.log`, `*.cache`

Se encontrar arquivos com segredos não ignorados:
1. Adicionar ao `.gitignore` imediatamente
2. Remover do stage se necessário com `git rm --cached`
3. Alertar o usuário sobre a necessidade de desbloquear o segredo no GitHub

#### Passo 3: Adicionar Arquivos ao Stage
```bash
git add -A
```
- Adiciona todos os arquivos modificados, novos e deletados
- Evita adicionar arquivos ignorados pelo `.gitignore`

#### Passo 4: Criar Commit
```bash
git commit -m "[Tipo]: Descrição clara das alterações"
```

**Convenção de Commits**:

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `feat` | Nova funcionalidade | `feat: Add user authentication` |
| `fix` | Correção de bug | `fix: Resolve sidebar layout issue` |
| `refactor` | Refatoração de código | `refactor: Extract form validation hook` |
| `docs` | Documentação | `docs: Update API documentation` |
| `chore` | Tarefas de manutenção | `chore: Update dependencies` |
| `test` | Testes | `test: Add unit tests for Button` |
| `style` | Formatação de código | `style: Run prettier on components` |

#### Passo 5: Fazer Push

**⚠️ OBRIGATÓRIO - LEITURA PRÉVIA DO .ENV ANTES DO PUSH**:

ANTES de executar qualquer push para o GitHub, o assistente **DEVE** ler o arquivo `.env` para obter o token de autenticação. Esta é uma **REGRA OBRIGATÓRIA** que impede o assistente de usar tokens literais que possam estar descritos nas regras globais.

**Fluxo Obrigatório para Push**:
1. **Ler o arquivo `.env`** com a ferramenta `read_file`
2. **Extrair o valor** de `GITHUB_TOKEN` do conteúdo lido
3. **Construir a URL de push** usando o token extraído
4. **Executar o push** com a URL construída

**Comando correto**:
```bash
# Exemplo de fluxo correto:
[read_file] Lendo arquivo `.env`...
[read_file] Conteúdo obtido: GITHUB_TOKEN=[O TOKEN DO ARQUIVO ENV]
git push https://[O TOKEN DO ARQUIVO ENV]@github.com/Sjos0/AMP-Studio.git main
```

**⚠️ PROIBIDO**:
- **NUNCA** usar tokens literais que aparecem nas regras globais
- **NUNCA** hardcodar tokens nos comandos
- **NUNCA** ignorar a leitura obrigatória do arquivo `.env`
- **NUNCA** usar tokens de sessões anteriores sem verificar o arquivo `.env`

**📌 Nota Importante**: Esta regra existe para garantir que o assistente sempre use o token atual e válido do arquivo `.env`, evitando problemas de autenticação em novas sessões de chat. O token no `.env` é a **fonte verdade única** para autenticação.

**Formato do URL de push**:
```
https://[TOKEN_LIDO_DO_ENV]@github.com/[USUARIO]/[REPO].git
```

**Formato do URL de push**:
```
https://[TOKEN]@github.com/[USUARIO]/[REPO].git
```

**Token de Autenticação**:
- **Token**: `[TOKEN]`
- **Tipo**: Personal Access Token (PAT) - classic
- **Permissões**: `repo` (full control of private repositories)

**⚠️ IMPORTANTE**:
- **NUNCA** expor o token em logs visíveis ao usuário
- **NUNCA** commitiar o token no código
- **SEMPRE** usar o formato URL com token embedded para push

### Tratamento de Conflitos

Se o push for rejeitado devido a divergência (remote has commits that you don't have):

#### Fluxo de Resolução:

1. **Executar pull com rebase**:
```bash
git pull --rebase origin main
```

2. **Resolver conflitos manualmente**:
   - Identificar arquivos com conflito (`git status` mostra conflicted files)
   - Abrir cada arquivo e resolver marcadores de conflito (`<<<<<<<`, `=======`, `>>>>>>>`)
   - Manter código de ambas as partes quando apropriado

3. **Adicionar arquivos resolvidos**:
```bash
git add [arquivo-com-conflito-resolvido]
```

4. **Continuar rebase**:
```bash
git rebase --continue
```

5. **Se necessário, abortar rebase**:
```bash
git rebase --abort
```

6. **Executar push após resolver**:
```bash
git push https://${GITHUB_TOKEN}@github.com/Sjos0/AMP-Studio.git main
```

### Comunicação Durante Sincronização

O assistente deve comunicar cada passo da sincronização:

**Exemplo de comunicação**:
```
[git status] Verificando arquivos modificados...
[git add] Adicionando arquivos ao stage...
[git commit] Criando commit: "feat: Add new chat component"
[git push] Enviando para https://github.com/Sjos0/AMP-Studio.git (main)
✅ Sincronização concluída com sucesso!
```

### Exceções à Regra de Sincronização

**Tarefas que NÃO exigem sincronização**:

1. **Tarefas de leitura pura**:
   - Ler arquivos sem modificá-los
   - Perguntas sobre código existente
   - Análise de bugs sem correção

2. **Tarefas de debugging**:
   - Execução de testes sem modificação de código
   - Análise de logs

3. **Tarefas explicitamente excluídas**:
   - Quando o usuário solicita "não sincronizar"
   - Quando o usuário indica que sync será feito manualmente

4. **Tarefas de prototipagem**:
   - Experimentos temporários
   - Testes de conceito

**COMUNICAÇÃO DE EXCEÇÃO**:
```
[exceção] Esta tarefa não requer sincronização com GitHub.
Motivo: [razão da exceção]
```

### Validação Final

Antes de finalizar qualquer tarefa, verificar:

1. ✅ Todos os arquivos modificados estão commitados
2. ✅ Nenhum segredo foi commitado
3. ✅ Push foi realizado com sucesso
4. ✅ Não há conflitos não resolvidos
5. ✅ Commits seguem convenção de nomenclatura

### Proteção Contra Erros

**Verificações obrigatórias**:

1. **Verificar `.gitignore`**:
   - `.kilocode/mcp.json` deve estar ignorado
   - Arquivos de ambiente devem estar ignorados
   - Arquivos sensíveis devem estar ignorados

2. **Verificar segredos no stage**:
   - Antes de commitar, verificar que não há tokens, chaves ou senhas
   - Se encontrado, remover imediatamente e adicionar ao `.gitignore`

3. **Verificar tamanho de arquivos**:
   - Arquivos > 10MB não devem ser commitados (GitHub limit)
   - Usar Git LFS para arquivos grandes se necessário

### Sincronização de Tags e Releases

Para tarefas de release:

1. **Criar tag**:
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
```

2. **Enviar tag**:
```bash
git push https://${GITHUB_TOKEN}@github.com/Sjos0/AMP-Studio.git v1.0.0
```

### Resumo do Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ FLUXO DE SINCRONIZAÇÃO COM GITHUB (OBRIGATÓRIO)            │
├─────────────────────────────────────────────────────────────┤
│ 1. git status                                              │
│ 2. Verificar .gitignore e proteção de segredos            │
│ 3. git add -A                                              │
│ 4. git commit -m "[tipo]: descrição"                       │
│ 5. git push https://[TOKEN]@github.com/... main            │
├─────────────────────────────────────────────────────────────┤
│ SE PUSH REJEITADO POR DIVERGÊNCIA:                         │
│ 1. git pull --rebase                                       │
│ 2. Resolver conflitos                                       │
│ 3. git add [arquivos]                                      │
│ 4. git rebase --continue                                   │
│ 5. git push https://[TOKEN]@github.com/... main            │
└─────────────────────────────────────────────────────────────┘
```

### Consequences for Non-Compliance

**QUEBRA DE PROTOCOLO GRAVE**:
- Não sincronizar ao final de tarefas é considerado violação
- 结果: Histórico inconsistente, perda potencial de trabalho
- Mitigação: Sempre incluir sync como último passo

---

## Conclusão

Estas diretrizes visam elevar a qualidade das respostas e ações do assistente, garantindo que cada interação seja cuidadosamente analisada e executada de acordo com a complexidade e contexto da tarefa. O Antigravity Kit é uma ferramenta poderosa que deve ser usada estrategicamente, sempre comunicando transparentemente ao usuário e priorizando a autonomia do assistente.
