#!/bin/bash

# Debugger Skill - Legacy Code Analysis Script
# Usage: ./analyze_legacy.sh [target_directory]

set -e

TARGET_DIR="${1:-.}"

echo "🔍 Debugger Skill - Legacy Code Analysis"
echo "=========================================="

# Check for common bug patterns
echo ""
echo "📋 Checking for common bug patterns..."

# Check for console.log/console.error left in code
CONSOLE_LOGS=$(find "$TARGET_DIR" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -exec grep -l "console\.(log|error|warn)" {} \; 2>/dev/null || true)
if [ -n "$CONSOLE_LOGS" ]; then
    echo "⚠️  Found console statements in files:"
    echo "$CONSOLE_LOGS" | head -10
else
    echo "✅ No console statements found"
fi

# Check for TODO comments that might indicate bugs
TODOS=$(find "$TARGET_DIR" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" \) -exec grep -n "TODO\|FIXME\|BUG\|HACK" {} \; 2>/dev/null || true)
if [ -n "$TODOS" ]; then
    echo ""
    echo "📌 Found TODO/FIXME comments:"
    echo "$TODOS" | head -20
else
    echo "✅ No TODO/FIXME comments found"
fi

# Check for potential null/undefined issues
echo ""
echo "🔎 Checking for potential null/undefined issues..."
NULL_CHECKS=$(find "$TARGET_DIR" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -exec grep -n "\!\!" {} \; 2>/dev/null || true)
if [ -n "$NULL_CHECKS" ]; then
    echo "⚠️  Found non-null assertions:"
    echo "$NULL_CHECKS" | head -10
else
    echo "✅ No non-null assertions found"
fi

# Check for async/await without try/catch
echo ""
echo "⚡ Checking for async/await without try/catch..."
ASYNC_AWAIT=$(find "$TARGET_DIR" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -exec grep -n "await" {} \; 2>/dev/null || true)
if [ -n "$ASYNC_AWAIT" ]; then
    echo "📌 Found async/await usage (manual review recommended)"
else
    echo "✅ No async/await usage found"
fi

# Check for error handling patterns
echo ""
echo "🛡️ Checking for error handling..."
ERROR_HANDLING=$(find "$TARGET_DIR" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -exec grep -n "catch\|try {" {} \; 2>/dev/null || true)
if [ -n "$ERROR_HANDLING" ]; then
    ERROR_COUNT=$(echo "$ERROR_HANDLING" | wc -l)
    echo "✅ Found $ERROR_COUNT error handling blocks"
else
    echo "⚠️  No error handling found"
fi

echo ""
echo "=========================================="
echo "Analysis complete!"
