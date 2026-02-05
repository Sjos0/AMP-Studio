#!/usr/bin/env python3
"""
Web Design Guidelines Validator

This script validates web design implementations against established guidelines,
checking for accessibility, responsiveness, visual hierarchy, consistency, and performance.
"""

import json
import re
import sys
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Optional


class Severity(Enum):
    """Severity levels for design issues."""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


@dataclass
class DesignIssue:
    """Represents a design issue found during validation."""
    severity: Severity
    category: str
    message: str
    file: Optional[str] = None
    line: Optional[int] = None
    suggestion: Optional[str] = None


class DesignValidator:
    """Validates web design implementations against guidelines."""
    
    # Color contrast ratios (WCAG 2.1 AA)
    MIN_CONTRAST_RATIO = 4.5
    LARGE_TEXT_CONTRAST_RATIO = 3.0
    
    # Spacing scale (base unit in pixels)
    BASE_UNIT = 8
    
    # Typography scale (multiplier)
    TYPE_SCALE = 1.25
    
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.issues: list[DesignIssue] = []
    
    def validate_file(self, file_path: Path) -> list[DesignIssue]:
        """Validate a single file for design compliance."""
        content = file_path.read_text()
        
        if file_path.suffix == '.css':
            self._validate_css(content, str(file_path))
        elif file_path.suffix in ['.tsx', '.jsx', '.ts', '.js']:
            self._validate_component(content, str(file_path))
        elif file_path.suffix == '.html':
            self._validate_html(content, str(file_path))
        
        return self.issues
    
    def validate_directory(self, directory: Path) -> list[DesignIssue]:
        """Validate all files in a directory for design compliance."""
        for file_path in directory.rglob('*'):
            if file_path.is_file() and self._is_web_file(file_path):
                self.validate_file(file_path)
        
        return self.issues
    
    def _is_web_file(self, path: Path) -> bool:
        """Check if the file is a web-related file."""
        web_extensions = ['.css', '.tsx', '.jsx', '.ts', '.js', '.html', '.scss']
        return path.suffix in web_extensions
    
    def _validate_css(self, content: str, file: str) -> None:
        """Validate CSS code for design compliance."""
        # Check for hardcoded colors (should use design tokens)
        hardcoded_colors = re.findall(r'#[0-9A-Fa-f]{3,6}\b', content)
        if len(hardcoded_colors) > 10:
            self._add_issue(
                Severity.WARNING,
                "Design Tokens",
                f"Found {len(hardcoded_colors)} hardcoded colors. Consider using design tokens.",
                file,
                suggestion="Define colors in a design system and reference them via CSS custom properties."
            )
        
        # Check for magic numbers in spacing
        magic_spacing = re.findall(r':\s*(\d+)px', content)
        problematic_spacing = [s for s in magic_spacing if int(s) % self.BASE_UNIT != 0]
        if problematic_spacing:
            self._add_issue(
                Severity.WARNING,
                "Spacing",
                f"Found {len(problematic_spacing)} spacing values not aligned to {self.BASE_UNIT}px grid.",
                file,
                suggestion=f"Use multiples of {self.BASE_UNIT}px: {self.BASE_UNIT}, {self.BASE_UNIT*2}, {self.BASE_UNIT*3}, etc."
            )
        
        # Check for !important usage
        important_usage = re.findall(r'!important', content)
        if important_usage:
            self._add_issue(
                Severity.ERROR,
                "CSS Best Practices",
                f"Found {len(important_usage)} uses of !important.",
                file,
                suggestion="Avoid !important. Use specific selectors or CSS custom properties instead."
            )
    
    def _validate_component(self, content: str, file: str) -> None:
        """Validate React/TypeScript component for design compliance."""
        # Check for inline styles (should use CSS modules or styled components)
        inline_styles = re.findall(r'style\s*=\s*\{', content)
        if len(inline_styles) > 3:
            self._add_issue(
                Severity.WARNING,
                "Styling",
                f"Found {len(inline_styles)} inline style blocks. Consider using CSS modules or styled components.",
                file,
                suggestion="Move styles to external CSS modules or styled-components for better maintainability."
            )
        
        # Check for hardcoded text (should use i18n or constants)
        if 'text="' in content or "text='" in content:
            self._add_issue(
                Severity.INFO,
                "Internationalization",
                "Found hardcoded text strings.",
                file,
                suggestion="Consider using i18n for translations and text constants."
            )
        
        # Check for accessibility attributes
        aria_patterns = [
            r'aria-label',
            r'aria-describedby',
            r'aria-expanded',
            r'aria-hidden',
            r'role=',
        ]
        has_aria = any(re.search(p, content) for p in aria_patterns)
        has_aria_label = re.search(r'aria-label', content)
        
        if 'button' in content.lower() or 'input' in content.lower():
            if not has_aria_label:
                self._add_issue(
                    Severity.WARNING,
                    "Accessibility",
                    "Interactive elements found without aria-label.",
                    file,
                    suggestion="Add aria-label to buttons and inputs for screen reader accessibility."
                )
    
    def _validate_html(self, content: str, file: str) -> None:
        """Validate HTML code for design compliance."""
        # Check for proper heading hierarchy
        headings = re.findall(r'<h([1-6])[^>]*>', content)
        if headings:
            h_levels = [int(h[0]) for h in headings]
            for i in range(len(h_levels) - 1):
                if h_levels[i + 1] > h_levels[i] + 1:
                    self._add_issue(
                        Severity.WARNING,
                        "Semantic HTML",
                        f"Heading level skipped from h{h_levels[i]} to h{h_levels[i + 1]}.",
                        file,
                        suggestion="Use sequential heading levels (h1 → h2 → h3) for proper document outline."
                    )
        
        # Check for img without alt attribute
        imgs_without_alt = re.findall(r'<img(?![^>]*alt=)[^>]*>', content)
        if imgs_without_alt:
            self._add_issue(
                Severity.ERROR,
                "Accessibility",
                f"Found {len(imgs_without_alt)} images without alt attribute.",
                file,
                suggestion="Add alt attribute to all images for accessibility."
            )
    
    def _add_issue(
        self,
        severity: Severity,
        category: str,
        message: str,
        file: Optional[str] = None,
        line: Optional[int] = None,
        suggestion: Optional[str] = None
    ) -> None:
        """Add a design issue to the results."""
        issue = DesignIssue(
            severity=severity,
            category=category,
            message=message,
            file=file,
            line=line,
            suggestion=suggestion
        )
        self.issues.append(issue)
        
        if self.verbose:
            print(f"[{severity.value.upper()}] {category}: {message}")
            if suggestion:
                print(f"  💡 {suggestion}")
    
    def get_summary(self) -> dict:
        """Get a summary of the validation results."""
        return {
            "total_issues": len(self.issues),
            "by_severity": {
                "error": len([i for i in self.issues if i.severity == Severity.ERROR]),
                "warning": len([i for i in self.issues if i.severity == Severity.WARNING]),
                "info": len([i for i in self.issues if i.severity == Severity.INFO]),
            },
            "by_category": {}
        }


def main():
    """Main entry point for the design validator."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Validate web design implementations against established guidelines."
    )
    parser.add_argument(
        'path',
        nargs='?',
        default='.',
        help='File or directory to validate (default: current directory)'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose output'
    )
    parser.add_argument(
        '--format',
        choices=['text', 'json'],
        default='text',
        help='Output format (default: text)'
    )
    
    args = parser.parse_args()
    
    target = Path(args.path)
    
    if not target.exists():
        print(f"Error: Path '{target}' does not exist.")
        sys.exit(1)
    
    validator = DesignValidator(verbose=args.verbose)
    
    if target.is_file():
        issues = validator.validate_file(target)
    else:
        issues = validator.validate_directory(target)
    
    summary = validator.get_summary()
    
    if args.format == 'json':
        output = {
            "issues": [
                {
                    "severity": i.severity.value,
                    "category": i.category,
                    "message": i.message,
                    "file": i.file,
                    "suggestion": i.suggestion
                }
                for i in issues
            ],
            "summary": summary
        }
        print(json.dumps(output, indent=2))
    else:
        # Text output
        print("=" * 60)
        print("WEB DESIGN GUIDELINES VALIDATION REPORT")
        print("=" * 60)
        print()
        
        if not issues:
            print("✅ No design issues found!")
            sys.exit(0)
        
        print(f"Total issues: {summary['total_issues']}")
        print(f"  ❌ Errors: {summary['by_severity']['error']}")
        print(f"  ⚠️  Warnings: {summary['by_severity']['warning']}")
        print(f"  ℹ️  Info: {summary['by_severity']['info']}")
        print()
        
        # Group by severity
        for severity in [Severity.ERROR, Severity.WARNING, Severity.INFO]:
            severity_issues = [i for i in issues if i.severity == severity]
            if severity_issues:
                symbol = "❌" if severity == Severity.ERROR else ("⚠️" if severity == Severity.WARNING else "ℹ️")
                print(f"{symbol} {severity.value.upper()}S ({len(severity_issues)})")
                print("-" * 40)
                
                for issue in severity_issues:
                    print(f"  [{issue.category}] {issue.message}")
                    if issue.suggestion:
                        print(f"     💡 {issue.suggestion}")
                    if issue.file:
                        print(f"     📁 {issue.file}")
                print()
        
        print("=" * 60)
        print("To fix issues, refer to the web-design-guidelines skill.")
        print("=" * 60)
    
    # Exit with error code if critical issues found
    if summary['by_severity']['error'] > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
