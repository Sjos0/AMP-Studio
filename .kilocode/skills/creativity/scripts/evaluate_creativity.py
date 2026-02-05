#!/usr/bin/env python3
"""
Script to evaluate and enhance creativity in code generation.

This script analyzes code patterns and suggests creative alternatives
to improve code quality and innovation.
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional


def analyze_code_patterns(file_path: Path) -> Dict[str, List[str]]:
    """
    Analyze code file for common patterns that could be more creative.
    
    Args:
        file_path: Path to the code file
        
    Returns:
        Dictionary with pattern types and their occurrences
    """
    patterns = {
        "if_else_chains": [],
        "deep_nesting": [],
        "repetitive_code": [],
        "missing_abstractions": [],
    }
    
    content = file_path.read_text()
    lines = content.split('\n')
    
    # Check for long if-else chains
    if_count = 0
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('if ') or stripped.startswith('} else if'):
            if_count += 1
        elif stripped == '}' and if_count > 0:
            if_count = 0
            if if_count > 5:
                patterns["if_else_chains"].append(f"Line {lines.index(line) + 1}: Long if-else chain detected")
    
    # Check for deep nesting (more than 3 levels)
    indent_level = 0
    max_indent = 0
    for i, line in enumerate(lines):
        if line.strip() and not line.strip().startswith('//') and not line.strip().startswith('#'):
            current_indent = len(line) - len(line.lstrip())
            if current_indent > max_indent:
                max_indent = current_indent
    
    # Check for repetitive patterns
    line_counts = {}
    for i, line in enumerate(lines):
        stripped = line.strip()
        if len(stripped) > 20 and not stripped.startswith('//') and not stripped.startswith('/*'):
            if stripped in line_counts:
                patterns["repetitive_code"].append(f"Similar line at {i+1}: {stripped[:50]}...")
            else:
                line_counts[stripped] = i
    
    return patterns


def suggest_creative_alternatives(patterns: Dict[str, List[str]]) -> List[str]:
    """
    Generate creative suggestions based on analyzed patterns.
    
    Args:
        patterns: Dictionary of pattern types and occurrences
        
    Returns:
        List of creative suggestions
    """
    suggestions = []
    
    if patterns["if_else_chains"]:
        suggestions.append("Consider using a strategy pattern or lookup table instead of long if-else chains")
        suggestions.append("Use polymorphism to replace conditional logic with object behavior")
    
    if patterns["deep_nesting"]:
        suggestions.append("Apply the 'Early Return' pattern to reduce nesting")
        suggestions.append("Extract nested logic into separate functions")
        suggestions.append("Use the 'Guard Clauses' pattern for validation")
    
    if patterns["repetitive_code"]:
        suggestions.append("Extract repeated logic into reusable functions or utilities")
        suggestions.append("Consider creating a domain-specific language (DSL) for repeated operations")
        suggestions.append("Use higher-order functions for common operations")
    
    if patterns["missing_abstractions"]:
        suggestions.append("Look for opportunities to create interfaces or abstract classes")
        suggestions.append("Consider using the 'Extract Method' refactoring pattern")
        suggestions.append("Apply the 'Composite Pattern' for tree-like structures")
    
    # Add creative thinking prompts
    suggestions.extend([
        "What if this code could be expressed more elegantly?",
        "How would this problem be solved in a functional programming style?",
        "What design patterns could simplify this logic?",
        "How could this code be more self-documenting?",
        "What if we could remove this code entirely through abstraction?",
    ])
    
    return suggestions


def generate_creative_prompt(context: str) -> str:
    """
    Generate a creative prompt to enhance code.
    
    Args:
        context: The code context to analyze
        
    Returns:
        Enhanced creative prompt
    """
    return f"""
# Creative Code Enhancement Prompt

## Context
{context}

## Creative Thinking Questions

1. **Simplicity**: How can this code be made simpler?
   - What if we removed half the code?

2. **Abstraction**: What could be abstracted?
   - What patterns emerge from this code?

3. **Composition**: How can we compose instead of inherit?
   - What small, focused functions can we create?

4. **Expressiveness**: How can we make the code more readable?
   - What naming would make this self-documenting?

5. **Innovation**: What novel approaches could work?
   - What if we approached this from a completely different angle?

## Output Format

Please provide:
1. Analysis of current code patterns
2. Creative alternatives (at least 3)
3. Benefits of each approach
4. Recommended implementation with explanation
"""


def main():
    parser = argparse.ArgumentParser(
        description="Evaluate and enhance creativity in code generation"
    )
    parser.add_argument(
        "file",
        nargs="?",
        help="Code file to analyze (optional, will use stdin if not provided)"
    )
    parser.add_argument(
        "--output", "-o",
        choices=["json", "text"],
        default="text",
        help="Output format (default: text)"
    )
    parser.add_argument(
        "--prompt", "-p",
        action="store_true",
        help="Generate a creative prompt instead of analyzing"
    )
    
    args = parser.parse_args()
    
    if args.prompt:
        context = sys.stdin.read() if not args.file else Path(args.file).read_text()
        prompt = generate_creative_prompt(context)
        print(prompt)
        return
    
    if args.file:
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"Error: File not found: {file_path}", file=sys.stderr)
            sys.exit(1)
        
        patterns = analyze_code_patterns(file_path)
        suggestions = suggest_creative_alternatives(patterns)
        
        if args.output == "json":
            result = {
                "file": str(file_path),
                "patterns": patterns,
                "suggestions": suggestions
            }
            print(json.dumps(result, indent=2))
        else:
            print(f"Analyzing: {file_path}")
            print("\nPatterns Found:")
            for pattern_type, occurrences in patterns.items():
                if occurrences:
                    print(f"\n  {pattern_type}:")
                    for occ in occurrences:
                        print(f"    - {occ}")
            
            print("\nCreative Suggestions:")
            for i, suggestion in enumerate(suggestions, 1):
                print(f"\n  {i}. {suggestion}")
    else:
        # Read from stdin
        context = sys.stdin.read()
        patterns = {
            "if_else_chains": [],
            "deep_nesting": [],
            "repetitive_code": [],
            "missing_abstractions": [],
        }
        suggestions = suggest_creative_alternatives(patterns)
        
        print("Creative Suggestions for Your Code:")
        for i, suggestion in enumerate(suggestions, 1):
            print(f"\n  {i}. {suggestion}")


if __name__ == "__main__":
    main()
