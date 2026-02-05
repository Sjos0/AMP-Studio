#!/bin/bash
# Code Archaeologist - Script de Análise de Código Legado
# Uso: ./scripts/analyze_legacy.sh <diretório>

DIRECTORY="${1:-.}"

echo "🏺 Code Archaeologist - Análise de Código Legado"
echo "================================================"
echo "Diretório: $DIRECTORY"
echo ""

# Contagem de arquivos por extensão
echo "📊 Distribuição de Arquivos por Extensão:"
find "$DIRECTORY" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.java" \) 2>/dev/null | sed 's/.*\.//' | sort | uniq -c | sort -rn

echo ""
echo "🔍 Verificações de Padrões Legados:"

# Verificar uso de var (JavaScript)
VAR_COUNT=$(grep -r "^\s*var\s" "$DIRECTORY" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
echo "  - Uso de 'var': $VAR_COUNT"

# Verificar callbacks em vez de Promises/async-await
CALLBACK_COUNT=$(grep -r "\.on\|\.callback\|\.done\s*=" "$DIRECTORY" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
echo "  - Padrões de callback: $CALLBACK_COUNT"

# Verificar console.log残留
LOG_COUNT=$(grep -r "console\.log" "$DIRECTORY" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
echo "  - Console.log残留: $LOG_COUNT"

# Verificar código duplicado (simples)
echo ""
echo "📋 Arquivos com mais de 300 linhas:"
find "$DIRECTORY" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.java" \) -exec wc -l {} \; 2>/dev/null | awk '$1 > 300 {print $2 " (" $1 " linhas)"}'

echo ""
echo "✅ Análise concluída!"
