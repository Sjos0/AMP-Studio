# Boas Práticas

## Leitura Antes de Edição

**REGRA**: SEMPRE ler arquivo antes de editar.

**Fluxo**: `read_file` → ANÁLISE → `search_and_replace`/`write_to_file`

**Casos**:
- Modificar: `read_file` → `search_and_replace`
- Criar: `read_file` → `write_to_file`
- Múltiplos: `read_file` (todos) → edits

**Penalidade**: QUEBRA DE PROTOCOLO GRAVE se não ler antes.

## Ciclos de Desenvolvimento

### ANTES de qualquer ação significativa:

1. **OBRIGATÓRIO**: Ler TODOS os arquivos relacionados à tarefa
2. **OBRIGATÓRIO**: Verificar convenções do projeto (naming, estrutura, padrões)
3. **OBRIGATÓRIO**: Identificar dependências de runtime e build
4. **OBRIGATÓRIO**: Planejar sequência de ações antes de executar

### DURANTE a implementação:

1. Fazer mudanças incrementais e verificáveis
2. Validar cada passo antes de continuar
3. Documentar decisões técnicas imediatamente
4. **NUNCA** pular etapas - seguir o fluxo planejado

### APÓS completar a tarefa:

1. Rodar linter/verificar erros de build
2. Validar que a solução atende aos requisitos
3. Documentar mudanças realizadas

---

## Análise de Impacto (OBRIGATÓRIO)

**Antes de instalar qualquer biblioteca/external package:**

1. Ler a documentação oficial
2. Verificar dependências necessárias (package.json, imports)
3. Instalar TODAS as dependências ANTES de usar o componente
4. Criar arquivos de suporte (utils, types, config) ANTES de importar
5. Executar build para validar que não há erros de módulo

**Fluxo correto para bibliotecas externas:**
```
1. Ler docs → 2. Identificar deps → 3. Instalar deps → 4. Criar utils → 5. Usar componente → 6. Build
```

**Penalidade**: QUEBRA DE PROTOCOLO se bibliotecas forem usadas sem instalar dependências primeiro.

## Diretrizes por Tipo

**Código**: Seguir padrões, TypeScript explícito, funções pequenas, comentários apenas no "porquê"

**Arquitetura**: Escalar/manutível, composição > herança, baixo acoplamento, documentar decisões

**Debugging**: Reproduzir primeiro, múltiplas hipóteses, validar com testes, documentar causa
