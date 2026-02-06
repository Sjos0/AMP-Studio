# Princípios de Componentização e Organização de Código

## Filosofia

Componentização prioriza separação de responsabilidades, reutilização e manutenibilidade. Cada componente é uma unidade independente. Código mal organizado custa mais a manter. Single Responsibility Principle: cada arquivo uma responsabilidade clara.

## Regra de Ouro: Um Conceito, Um Arquivo

Cada conceito, funcionalidade, componente ou lógica de negócio em seu próprio arquivo. Aplica-se a:
- **Componentes de Interface**: React/Vue/Angular com estilo, lógica e template
- **Funções e Utilitários**: Módulos temáticos, funções pequenas
- **Hooks Customizados**: Um por arquivo
- **Serviços e Camadas de Dados**: API, repositório, manipulador
- **Tipos e Interfaces**: Por domínio em arquivos dedicados
- **Constantes e Configurações**: Agrupadas tematicamente

## Estrutura de Diretórios

Prefidir estrutura baseada em recursos (feature-based) ou domínio (domain-driven):

```
src/
├── components/    # UI reutilizáveis (PascalCase diretório)
├── features/      # Funcionalidades por domínio
├── hooks/         # Hooks globais
├── services/      # Serviços globais
├── utils/         # Utilitários globais
├── types/         # Tipos globais
├── constants/     # Constantes globais
└── styles/        # Estilos globais
```

## Convenções de Nomenclatura

**Arquivos/Diretórios**:
- PascalCase: Componentes UI (`Button.tsx`)
- camelCase: Utilitários/hooks (`formatDate.ts`)
- kebab-case: Estilos (`button.module.css`)
- PascalCase: Diretórios (`Button/`)

**Funções/Variáveis**:
- camelCase: `getUserData()`, `isLoading`
- Verbos no início: `fetchUsers()`, `validateForm()`
- Booleanos interrogativos: `isValid`, `hasPermission`

**Componentes**:
- Nome = nome do arquivo
- Página: `DashboardPage.tsx`, `SettingsView.tsx`
- Layout: `MainLayout.tsx`

**Tipos**:
- PascalCase: `User`, `AuthState`
- Sem prefixo `I` em TypeScript moderno
- Suffixo quando apropriado: `UserProps`

## Separação de Responsabilidades

**Lógica e Apresentação**:
- Componentes puros via props
- Lógica de negócio em hooks/serviços
- Efeitos colaterais encapsulados

**Estilos**:
- Co-localizados com componentes (CSS Modules)
- Estilos globais mínimos

**Tipos**:
- Próximos aos componentes
- Compartilhados em `types/`

## Reutilização e Composição

**Componentes Reutilizáveis**:
- "Burros" (dumb) via props
- "Inteligentes" (smart) só em pontos de entrada
- Documentados com TypeScript props

**Composição sobre Herança**:
- Preferir composição
- Hooks e HOCs para cross-cutting

## Documentação

- Exports públicos: JSDoc/TypeScript Doc
- Props: Descrições claras
- Decisões de design: Documentadas
- Index: `index.ts` exportando API pública

## Validação

1. Arquivo > 200-300 linhas? Revisar
2. Responsabilidades múltiplas? Decompor
3. Acoplamento forte? Refatorar
4. Código duplicado? Extrair
5. Testável isoladamente?

## Exceções

- Prototipagem rápida
- Arquivos de configuração
- Pequenas aplicações
- Performance crítica
