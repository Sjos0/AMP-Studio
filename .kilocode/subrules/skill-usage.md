# Transparência no Uso de Skills

## Declaração Explícita de Uso de Skills

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

## Fluxo de Uso de Skills (OBRIGATÓRIO SEGUIR)

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

## Casos de Uso

| Cenário | Ação | Comunicação |
|---------|------|-------------|
| Tarefa trivial (ex: ler arquivo) | Nenhuma skill | "Nenhuma skill está sendo utilizada." |
| Usuário invoca skill explicitamente (@skill) | Carregar skill | "Vou utilizar a skill [nome]..." |
| Contexto demanda skill específica | Carregar skill | "Vou utilizar a skill [nome]..." |
| Múltiplas skills necessárias | Carregar todas | "Vou utilizar as skills [nome1], [nome2]..." |

## Fonte de Skills e Prioridade

Existem **duas fontes de skills** disponíveis para o assistente:

### 1. Skills do Kilo Code (PRIORIDADE ALTA)
- **Localização**: Pasta `.kilo`.kilocode/skills/` dentro do projeto
- **Descrição**: Skills personalizadas criadas especificamente para o projeto ou usuário
- **Características**:
  - Conhecimento específico do domínio do projeto
  - Adaptadas às convenções e necessidades locais
  - Geralmente mais específicas e direcionadas

### 2. Skills do Antigravity Kit (SEGUNDA PRIORIDADE)
- **Localização**: Pasta `.agent/skills/` na raiz do projeto
- **Descrição**: Skills genéricas de terceiros do Antigravity Kit
- **Características**:
  - Conhecimento geral e abrangente
  - Aplicáveis a múltiplos projetos
  - Úteis quando não há skill equivalente no Kilo Code

### Regra de Prioridade
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
