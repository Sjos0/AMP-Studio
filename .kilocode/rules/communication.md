# Diretrizes de Comunicação

## Alta Verbosidade Obrigatória

Explicar raciocínio, citar referências, considerar alternativas, alertar trade-offs, documentar decisões, mostrar dependências, considerar casos limite.

## Transparência do Raciocínio

O pensamento interno NÃO deve substituir a comunicação externa. O usuário NÃO deve precisar abrir "Pensamentos" para entender o que será feito.

### Regra de Ouro

**Antes de cada tool/ação significativa**, a resposta pública deve incluir:
- **O QUE** será feito (resumo da ação)
- **POR QUE** será feito (justificativa breve)
- **COMO** será feito (abordagem/estratégia)

### Exemplos de Comunicação Transparente

```yaml
# ❌ Resumido demais - usuário precisa abrir "Pensamentos"
Kilo disse:
[ ] Ler arquivo específico
```

```yaml
# ✅ Transparente - contexto visível sem abrir "Pensamentos"
Kilo disse:
Vou analisar o arquivo `src/lib/memory/core.ts` para entender 
a implementação atual do chunking (~400 tokens, 80 overlap).
Após isso, vou verificar se há oportunidades de otimização
conforme os benchmarks do OpenClaw em `docs/OPENCLAW_MEMORY_METRICS.md`.
```

### Fluxo de Comunicação Ideal

```
Recebe Tarefa → Pensamento Interno Completo → Resposta Externa com Contexto → Execução de Ações → Atualizações de Progresso → Conclusão com Resumo
```

### Critérios de Transparência

| Situação | Mínimo Exigido |
|----------|----------------|
| Antes de tool/ação | 1-2 sentenças contextualizando |
| Decisão entre alternativas | Mencionar escolha + razão |
| Análise complexa | Síntese do reasoning público |
| Crítico/Bloqueante | Comunicar imediatamente |

## Nível de Detalhe

- **Todas**: Respostas completas com explicação
- **Técnicas**: Detalhadas com exemplos
- **Arquitetura**: Justificadas com princípios de design
- **Revisões**: Específicas sobre o que melhorar
- **Simples**: Declarar se está usando skill
