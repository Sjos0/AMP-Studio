#!/bin/bash

# Debugger Skill - Debugging Helper Script
# Usage: ./debugging_helper.sh [target_file] [--pattern "search_pattern"]

set -e

TARGET_FILE="${1:-}"
PATTERN="${2:-}"

echo "🔧 Debugger Skill - Debugging Helper"
echo "======================================"

# Function to analyze error patterns in a file
analyze_file() {
    local file="$1"
    
    if [ ! -f "$file" ]; then
        echo "❌ File not found: $file"
        return 1
    fi
    
    echo ""
    echo "📄 Analyzing: $file"
    echo "--------------------------------------"
    
    # Count lines of code
    local lines=$(wc -l < "$file")
    echo "📊 Lines of code: $lines"
    
    # Check for console.error statements (potential error sources)
    local console_errors=$(grep -c "console\.error" "$file" 2>/dev/null || echo "0")
    echo "🔴 Console.error statements: $console_errors"
    
    # Check for throw statements (potential crash sources)
    local throws=$(grep -c "throw " "$file" 2>/dev/null || echo "0")
    echo "⚠️  Throw statements: $throws"
    
    # Check for unhandled promise rejections
    local unhandled=$(grep -c "unhandledrejection\|Uncaught" "$file" 2>/dev/null || echo "0")
    echo "⚡ Unhandled rejection mentions: $unhandled"
    
    # Check for common error patterns
    local null_checks=$(grep -c "\=\s*null" "$file" 2>/dev/null || echo "0")
    echo "🔍 Null assignments: $null_checks"
    
    # Check for try-catch blocks
    local try_catch=$(grep -c "catch\s*(" "$file" 2>/dev/null || echo "0")
    echo "🛡️ Catch blocks: $try_catch"
    
    # Check for error variables
    local error_vars=$(grep -E "err\s*=|error\s*=|e\s*=" "$file" 2>/dev/null | head -5 || true)
    if [ -n "$error_vars" ]; then
        echo ""
        echo "📌 Error variable assignments:"
        echo "$error_vars"
    fi
}

# Function to search for a pattern and show context
search_pattern() {
    local pattern="$1"
    local context="${2:-3}"
    
    if [ -z "$pattern" ]; then
        echo "❌ No pattern specified. Usage: ./debugging_helper.sh --pattern \"search_pattern\""
        return 1
    fi
    
    echo ""
    echo "🔎 Searching for pattern: $pattern"
    echo "======================================"
    
    # Show lines matching the pattern with context
    grep -rn --context="$context" "$pattern" . 2>/dev/null || echo "No matches found"
}

# Main logic
if [ -n "$TARGET_FILE" ] && [ "$TARGET_FILE" != "--pattern" ]; then
    # Analyze specific file
    analyze_file "$TARGET_FILE"
elif [ "$TARGET_FILE" == "--pattern" ] && [ -n "$PATTERN" ]; then
    # Search for a pattern
    search_pattern "$PATTERN"
else
    # Show help
    echo ""
    echo "📖 Usage:"
    echo "  ./debugging_helper.sh <file>           - Analyze a specific file"
    echo "  ./debugging_helper.sh --pattern <pat>  - Search for a pattern"
    echo "  ./debugging_helper.sh                  - Show this help"
    echo ""
    echo "Examples:"
    echo "  ./debugging_helper.sh src/app.js"
    echo "  ./debugging_helper.sh --pattern \"TODO\""
fi

echo ""
echo "======================================"
echo "Debugging analysis complete!"
