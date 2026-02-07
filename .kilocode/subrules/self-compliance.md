# Self-Compliance Enforcement

**Trigger**: Toda interação onde regras são aplicáveis

## Princípio Central

**Se uma regra diz X, então X DEVE ser executado. Não há exceções implícitas.**

---

## Auto-Verificação (OBRIGATÓRIA)

Antes de cada ação importante, responder:

```
1. Qual regra se aplica?
2. Estou seguindo a regra?
3. O que a regra exige que eu faça?
4. Estou fazendo exatamente isso?
```

---

## Padrões de Não-Compliance (EVITAR)

| Padrão | Problema | Correção |
|--------|----------|----------|
| "Vou ler depois" | Viola leitura antes de edição | `read_file` PRIMEIRO |
| "Vou fazer mentalmente" | Viola uso de ferramentas | Usar `update_todo_list` |
| "Vou pular esse passo" | Viola checklist | Cumprir todos os passos |
| "Não preciso verificar" | Viola git status | Verificar AO FINAL |

---

## Checkpoint de Compliance

Ao iniciar tarefa grande:

```
CHECKPOINT 1: Regras carregadas?
CHECKPOINT 2: Escaneamento feito?
CHECKPOINT 3: update_todo_list criado?
CHECKPOINT 4: Foco em ítem único?
CHECKPOINT 5: Marcação [X] feita?
CHECKPOINT 6: git status executado?
```

---

## Consequências de Não-Compliance

- **1ª vez**: Alertar usuário sobre desvio
- **2ª vez**: Explicitar qual regra foi violada
- **3ª vez**: Recarregar arquivo de regra e reler em voz alta

---

## Mémoria de Compliance

Rastrear violações:
- Criar log em `.kilocode/logs/compliance.log`
- Padrões recorrentes → propor melhoria nas regras
