# Template: Complete Skill (com Scripts e Assets)

## Descrição
Este é um template completo para criar uma skill com scripts executáveis e assets.

## Quando Usar
Use este template quando a skill requer scripts de automação ou assets como templates e imagens.

## Estrutura
```
skill-name/
├── SKILL.md           # Documentação principal
├── LICENSE.txt        # Licença Apache 2.0
├── README.md         # Documentação adicional (opcional)
├── scripts/          # Scripts executáveis
│   ├── script1.py    # Script Python
│   └── script2.sh    # Script Bash
├── references/       # Documentação de referência
│   └── reference.md  # Arquivos de referência
└── assets/           # Arquivos de output
    ├── template1.txt # Templates
    └── image1.png    # Imagens
```

## Exemplo de SKILL.md
```markdown
---
name: nome-da-skill
description: Descrição clara do que a skill faz e quando usá-la.
---

# Nome da Skill

Esta skill [descrever funcionalidade].

## Scripts Disponíveis

### script1.py
Executa [função do script].

Uso:
```bash
python scripts/script1.py --param valor
```

## Assets Disponíveis

### template1.txt
Template para [uso do template].

## Uso

Quando o usuário [cenário de uso], utilize esta skill para [ação].

## Diretrizes

1. [Primeira diretriz]
2. [Segunda diretriz]
3. [Terceira diretriz]
```
