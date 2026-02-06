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

### Antes
1. Ler arquivos relacionados
2. Verificar convenções do projeto
3. Identificar dependências
4. Planejar sequência de ações

### Durante
1. Mudanças incrementais e verificáveis
2. Validar constantemente cada passo
3. Documentar decisões técnicas

### Após
1. Rodar linter/verificar erros
2. Validar que atende requisitos
3. Documentar mudanças realizadas

## Diretrizes por Tipo

**Código**: Seguir padrões, TypeScript explícito, funções pequenas, comentários apenas no "porquê"

**Arquitetura**: Escalar/manutível, composição > herança, baixo acoplamento, documentar decisões

**Debugging**: Reproduzir primeiro, múltiplas hipóteses, validar com testes, documentar causa

## Tempo de Pensamento

| Complexidade | Tokens |
|--------------|--------|
| Simples | 300 |
| Moderado | 800-1500 |
| Padrão | 1500-2500 |
| Complexo | 3000+ |

**Incluir**: Análise de contexto, múltiplas abordagens, casos limite, justificativas, validação de suposições.
