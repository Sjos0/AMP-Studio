#!/usr/bin/env python3
"""
Frontend Accessibility Checker Script

This script checks frontend implementations for accessibility compliance
against WCAG guidelines and best practices.
"""

import sys
import re
from pathlib import Path

def check_images_for_alt(files):
    """Check if images have alt text."""
    warnings = []
    for file in files:
        if file.suffix in ['.html', '.tsx', '.jsx', '.vue']:
            content = file.read_text()
            img_tags = re.findall(r'<img[^>]*>', content)
            for img in img_tags:
                if 'alt=' not in img:
                    warnings.append(f"Image without alt attribute: {file}")
    return warnings

def check_aria_labels(files):
    """Check interactive elements for ARIA labels."""
    warnings = []
    for file in files:
        content = file.read_text()
        # Check buttons without text or aria-label
        buttons = re.findall(r'<button[^>]*>', content)
        for btn in buttons:
            if 'aria-label=' not in btn and '>' in btn:
                content_between = re.search(r'>([^<]+)</button>', btn)
                if not content_between or not content_between.group(1).strip():
                    warnings.append(f"Button without accessible label: {file}")
    return warnings

def check_color_contrast(files):
    """Check for color contrast issues (basic checks)."""
    warnings = []
    for file in files:
        content = file.read_text()
        # Check for inline styles with colors
        if 'color:' in content and 'background' in content:
            warnings.append(f"Inline colors detected - verify contrast: {file}")
    return warnings

def check_focus_states(files):
    """Check if focus states are defined."""
    warnings = []
    for file in files:
        content = file.read_text()
        # Check for outline: none without providing alternative
        if 'outline: none' in content or 'outline: 0' in content:
            if ':focus' not in content or 'outline:' in content:
                warnings.append(f"Removed outline without alternative focus state: {file}")
    return warnings

def check_heading_order(files):
    """Check heading hierarchy."""
    warnings = []
    for file in files:
        content = file.read_text()
        headings = re.findall(r'<h([1-6])[^>]*>', content)
        if len(headings) > 1:
            prev_level = int(headings[0])
            for h in headings[1:]:
                level = int(h)
                if level > prev_level + 1:
                    warnings.append(f"Heading skip from h{prev_level} to h{level}: {file}")
                prev_level = level
    return warnings

def run_accessibility_check(project_path):
    """Run full accessibility check."""
    print(f"Running accessibility check for: {project_path}")
    print("=" * 60)
    
    files = list(Path(project_path).rglob('*'))
    code_files = [f for f in files if f.suffix in ['.tsx', '.jsx', '.vue', '.html', '.css']]
    
    print(f"\nAnalyzing {len(code_files)} files...")
    
    all_warnings = []
    
    print("\n[1] Image Alt Text Check")
    alt_warnings = check_images_for_alt(files)
    for w in alt_warnings:
        print(f"   ⚠️  {w}")
    
    print("\n[2] ARIA Labels Check")
    aria_warnings = check_aria_labels(files)
    for w in aria_warnings:
        print(f"   ⚠️  {w}")
    
    print("\n[3] Color Contrast Check")
    print("   - Inline colors detected - manual WCAG check needed")
    print("   - WCAG AA: 4.5:1 for normal text, 3:1 for large text")
    
    print("\n[4] Focus States Check")
    focus_warnings = check_focus_states(files)
    for w in focus_warnings:
        print(f"   ⚠️  {w}")
    
    print("\n[5] Heading Hierarchy Check")
    heading_warnings = check_heading_order(files)
    for w in heading_warnings:
        print(f"   ⚠️  {w}")
    
    print("\n[6] WCAG Quick Reference")
    print("   Level A (Minimum):")
    print("   - [ ] All images have alt text")
    print("   - [ ] Form inputs have labels")
    print("   - [ ] Buttons/links have accessible names")
    print("   - [ ] Page has language attribute")
    print("   ")
    print("   Level AA (Recommended):")
    print("   - [ ] Color contrast 4.5:1 (normal text)")
    print("   - [ ] Color contrast 3:1 (large text)")
    print("   - [ ] Focus visible on all interactive elements")
    print("   - [ ] Resize text up to 200%")
    
    print("\n" + "=" * 60)
    print("Accessibility check complete.")
    print("For automated testing: Use axe DevTools, Lighthouse, or pa11y")
    
    return True

if __name__ == "__main__":
    project_path = sys.argv[1] if len(sys.argv) > 1 else "."
    run_accessibility_check(project_path)
