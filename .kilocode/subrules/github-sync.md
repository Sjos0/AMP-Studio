# Subrule: Sincronização com GitHub

**Contexto**: Esta subrule é carregada quando há 10 ou mais modificações no git status.

**Projeto Configurado**:
- **Repositório**: AMP-Studio
- **URL**: `https://github.com/Sjos0/AMP-Studio.git`
- **Branch**: `main`
- **Diretório de trabalho**: `/home/user/amp-studio`

---

## Passo 1: Verificar Status do Git

```bash
git status
```

**O que fazer**:
- Identificar arquivos modificados
- Identificar arquivos novos (untracked)
- Identificar arquivos deletados
- Contar o total de modificações

---

## Passo 2: Verificar Proteção de Segredos

**OBRIGATÓRIO**: Garantir que arquivos com segredos estejam no `.gitignore`:

Arquivos que **DEVEM** estar ignorados:
- `.env` e arquivos de ambiente
- `.kilocode/mcp.json` (contém tokens MCP e segredos)
- Arquivos com extensões `.pem`, `.key`, `.crt`
- Pasta `node_modules/`
- Pasta `.next/`
- Pasta `build/`
- Arquivos de cache `*.log`, `*.cache`

**Se encontrar arquivos com segredos não ignorados**:
1. Adicionar ao `.gitignore` imediatamente
2. Remover do stage se necessário com `git rm --cached`
3. Alertar o usuário sobre a necessidade de desbloquear o segredo no GitHub

---

## Passo 3: Adicionar Arquivos ao Stage

```bash
git add -A
```

**O que faz**:
- Adiciona todos os arquivos modificados, novos e deletados
- Evita adicionar arquivos ignorados pelo `.gitignore`

---

## Passo 4: Criar Commit

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

---

## Passo 5: Fazer Push

**⚠️ OBRIGATÓRIO - LEITURA PRÉVIA DO .ENV ANTES DO PUSH**:

ANTES de executar qualquer push para o GitHub, o assistente **DEVE** ler o arquivo `.env` para obter o token de autenticação.

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

**Token de Autenticação**:
- **Token**: `[TOKEN]`
- **Tipo**: Personal Access Token (PAT) - classic
- **Permissões**: `repo` (full control of private repositories)

**⚠️ IMPORTANTE**:
- **NUNCA** expor o token em logs visíveis ao usuário
- **NUNCA** commitiar o token no código
- **SEMPRE** usar o formato URL com token embedded para push

---

## Tratamento de Conflitos

Se o push for rejeitado devido a divergência (remote has commits that you don't have):

### Fluxo de Resolução:

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

---

## Comunicação Durante Sincronização

O assistente deve comunicar cada passo da sincronização:

**Exemplo de comunicação**:
```
[git status] Verificando arquivos modificados...
[git add] Adicionando arquivos ao stage...
[git commit] Criando commit: "feat: Add new chat component"
[git push] Enviando para https://github.com/Sjos0/AMP-Studio.git (main)
✅ Sincronização concluída com sucesso!
```

---

## Exceções à Regra de Sincronização

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

---

## Validação Final

Antes de finalizar a sincronização, verificar:

1. ✅ Todos os arquivos modificados estão commitados
2. ✅ Nenhum segredo foi commitado
3. ✅ Push foi realizado com sucesso
4. ✅ Não há conflitos não resolvidos
5. ✅ Commits seguem convenção de nomenclatura

---

## Proteção Contra Erros

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

---

## Sincronização de Tags e Releases

Para tarefas de release:

1. **Criar tag**:
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
```

2. **Enviar tag**:
```bash
git push https://${GITHUB_TOKEN}@github.com/Sjos0/AMP-Studio.git v1.0.0
```

---

## Resumo do Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ FLUXO DE SINCRONIZAÇÃO COM GITHUB                          │
├─────────────────────────────────────────────────────────────┤
│ 1. git status                                              │
│ 2. Verificar .gitignore e proteção de segredos            │
│ 3. git add -A                                              │
│ 4. git commit -m "[tipo]: descrição"                       │
│ 5. git push https://[TOKEN]@github.com/... main           │
├─────────────────────────────────────────────────────────────┤
│ SE PUSH REJEITADO POR DIVERGÊNCIA:                         │
│ 1. git pull --rebase                                       │
│ 2. Resolver conflitos                                       │
│ 3. git add [arquivos]                                      │
│ 4. git rebase --continue                                   │
│ 5. git push https://[TOKEN]@github.com/... main           │
└─────────────────────────────────────────────────────────────┘
```
