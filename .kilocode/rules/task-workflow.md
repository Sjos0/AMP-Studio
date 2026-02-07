# Workflow de Tarefas

## 1. Escaneamento Inicial (OBRIGATÓRIO)

Quando usuário inicia **qualquer** tarefa/problema/ajuste:
1. Ler pasta `to-do-list/` → verificar TODOS arquivos
2. Comparar mentalmente: tarefa existente corresponde ao problema?
   - **SIM**: Continuar tarefa existente → terminar → deletar arquivo
   - **NÃO**: Criar novo arquivo `to-do-list/[timestamp]-task.md`

**REGRA GLOBAL**: TODO list é obrigatório para **todas** as tarefas, independente da complexidade (simples, moderada ou complexa).

## 2. TODO List Obrigatória

**REGRA**: Toda tarefa/início com `update_todo_list`.

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

```bash
git status
```

- **≥10 modificações** (total no workspace, independente da tarefa): Ler `.kilocode/subrules/github-sync.md` → sincronizar
- **<10 modificações**: Reportar `Modificações acumuladas: {count}/10`

**⚠️ REGRA GLOBAL**: O threshold de 10 modificações considera TODOS os arquivos modificados no workspace, não apenas os da tarefa atual.

## 6. Checklist

1. [ ] Escaneou pasta `to-do-list/` no início
2. [ ] `update_todo_list` usada para nova tarefa
3. [ ] Focou em um ítem por vez
4. [ ] Quebrou ítens complexos em sub-ítens
5. [ ] Marcou [X] no arquivo to-do-list ao concluir cada ítem
6. [ ] Triggers de condensação respeitados
7. [ ] git status verificado (último)
8. [ ] Ação baseada no count
