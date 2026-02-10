# Workflow de Tarefas

## 1. Escaneamento Inicial (OBRIGATÓRIO)

Quando usuário inicia **qualquer** tarefa/problema/ajuste:

1. **Verificar pasta `to-do-list/`**:
   - Se **não existe**: Criar pasta + criar arquivo `to-do-list/[timestamp]-task.md`
   - Se **existe mas vazia**: Criar arquivo `to-do-list/[timestamp]-task.md`
   - Se **existe com arquivos**: Passar para passo 2

2. Comparar mentalmente: tarefa existente corresponde ao problema?
   - **SIM**: Continuar tarefa existente → terminar → deletar arquivo
   - **NÃO**: Criar novo arquivo `to-do-list/[timestamp]-task.md`

**REGRA GLOBAL**: TODO list é obrigatório para **todas** as tarefas, independente da complexidade (simples, moderada ou complexa).

## 2. TODO List Obrigatória

**Fluxo**:
- Arquivo `to-do-list/*.md`: Persistência de longo prazo (criado no escaneamento)
- Ferramenta `update_todo_list`: Gerenciamento durante a tarefa (quebrar ítens, marcar progresso)

**São complementares, não concorrentes.**

```
[ ] Passo 1: Ação inicial
[ ] Passo 2: Ação secundária
[ ] Passo N: ...
[ ] Passo FINAL: git status
```

## 3. Foco em Ítem Único

Ao pegar ítem N:
- Focar **APENAS** nele
- Usar `update_todo_list` para quebrar em sub-ítens menores/mensuráveis
- Concluir sub-ítens → marcar [X] no arquivo to-do-list → próximo

## 4. Condensação de Contexto (~70%)

**Trigger**: Usuário digita `/` (só isso)

**MEMORIZAR**:
1. Houve condensação → contexto resumido → detalhes perdidos
2. **OBRIGATÓRIO**: Reler arquivo `to-do-list/` atual → continuar procedimento

## 5. Git Status (ÚLTIMO PASSO)

### Passo Obrigatório

Execute `git status` e **SIGA O FLUXO DE DECISÃO** abaixo:

### Fluxo de Decisão Obrigatório

```
┌─────────────────────────────────────────────────────────────┐
│ EXECUTAR: git status                                        │
├─────────────────────────────────────────────────────────────┤
│ CONTAR: modified + untracked + deleted = TOTAL              │
├─────────────────────────────────────────────────────────────┤
│ DECISÃO:                                                    │
│                                                             │
│ IF TOTAL ≥ 10:                                              │
│   → NÃO CONCLUIR A TAREFA AINDA                            │
│   → PENSAR: "Threshold atingido! O que devo fazer?"        │
│   → LEMBRAR: "Preciso ler .kilocode/subrules/github-sync.md"│
│   → EXECUTAR: read_file(".kilocode/subrules/github-sync.md")│
│   → SEGUIR: Instruções do arquivo para sincronizar         │
│                                                             │
│ IF TOTAL < 10:                                              │
│   → REPORTAR: "Modificações acumuladas: {TOTAL}/10"        │
│   → CONCLUIR: Usar attempt_completion                       │
└─────────────────────────────────────────────────────────────┘
```

### ⚠️ NÃO FAÇA ISSO

```yaml
# ❌ ERRADO - Reportar e parar sem ação
"Git status verificado. Modificações: 12/10"
[conclui tarefa sem sincronizar]
```

### ✅ FAÇA ISSO

```yaml
# ✅ CORRETO - Pensar, lembrar, agir
"Git status: 12 modificações detectadas.
Threshold de 10 atingido!
Devo ler o arquivo de subrule para saber como proceder..."
[executa read_file(".kilocode/subrules/github-sync.md")]
[segue instruções do arquivo]
```

### Regra Global

O threshold de 10 modificações considera **TODOS** os arquivos modificados no workspace (modified + untracked + deleted), não apenas os da tarefa atual.

## 6. Template do Arquivo To-Do List

Quando criar arquivo `to-do-list/[timestamp]-task.md`, usar esta estrutura:

```markdown
# [Título da Tarefa]

## Descrição
[Breve descrição do objetivo da tarefa]

## Roadmap
[ ] Passo 1: [Ação inicial específica]
[ ] Passo 2: [Ação secundária]
[ ] Passo N: [Demais ações]
[ ] Passo FINAL: git status

## Notas
- [Decisões técnicas, dependências, considerações]
- [Casos limite identificados]
- [Referências a arquivos/documentação]

## Progresso
- Iniciado: [timestamp]
- Concluído: [timestamp quando finalizar]
```

### Exemplo Prático

```markdown
# Implementar Sistema de Autenticação

## Descrição
Adicionar autenticação OAuth com Google usando Supabase Auth.

## Roadmap
[ ] Ler documentação Supabase Auth
[ ] Configurar projeto no Google Cloud Console
[ ] Criar tabela de perfis no Supabase
[ ] Implementar componente de login
[ ] Adicionar middleware de proteção de rotas
[ ] Testar fluxo completo
[ ] Passo FINAL: git status

## Notas
- Usar pkce flow para segurança
- Armazenar token em httpOnly cookie
- Verificar rate limiting do Google OAuth

## Progresso
- Iniciado: 2026-02-10T10:00:00Z
- Concluído: [pendente]
```

---

## 7. Checklist

1. [ ] Escaneou pasta `to-do-list/` no início
2. [ ] `update_todo_list` usada para nova tarefa
3. [ ] Focou em um ítem por vez
4. [ ] Quebrou ítens complexos em sub-ítens
5. [ ] Marcou [X] no arquivo to-do-list ao concluir cada ítem
6. [ ] Triggers de condensação respeitados
7. [ ] git status verificado (último)
8. [ ] Ação baseada no count
