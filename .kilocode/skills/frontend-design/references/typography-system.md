# Typography System Reference

> Typography principles and decision-making - learn to think, not memorize.
> **No fixed font names or sizes - understand the system.**

---

## 1. Modular Scale Principles

### What is a Modular Scale?

```
A mathematical relationship between font sizes:
├── Pick a BASE size (usually body text)
├── Pick a RATIO (multiplier)
└── Generate all sizes using: base × ratio^n
```

### Common Ratios and When to Use

| Ratio | Value | Feeling | Best For |
|-------|-------|---------|----------|
| Minor Second | 1.067 | Very subtle | Dense UI, small screens |
| Major Second | 1.125 | Subtle | Compact interfaces |
| Minor Third | 1.2 | Comfortable | Mobile apps, cards |
| Major Third | 1.25 | Balanced | General web (most common) |
| Perfect Fourth | 1.333 | Noticeable | Editorial, blogs |
| Perfect Fifth | 1.5 | Dramatic | Headlines, marketing |
| Golden Ratio | 1.618 | Maximum impact | Hero sections, display |

### Generate Your Scale

```
Given: base = YOUR_BASE_SIZE, ratio = YOUR_RATIO

Scale:
├── xs:  base ÷ ratio²
├── sm:  base ÷ ratio
├── base: YOUR_BASE_SIZE
├── lg:  base × ratio
├── xl:  base × ratio²
├── 2xl: base × ratio³
├── 3xl: base × ratio⁴
└── ... continue as needed
```

---

## 2. Font Pairing Principles

### What Makes Fonts Work Together

```
Contrast + Harmony:
├── Different ENOUGH to create hierarchy
├── Similar ENOUGH to feel cohesive
└── Usually: serif + sans, or display + neutral
```

### Pairing Strategies

| Strategy | How | Result |
|----------|-----|--------|
| **Contrast** | Serif heading + Sans body | Classic, editorial feel |
| **Same Family** | One variable font, different weights | Cohesive, modern |
| **Same Designer** | Fonts by same foundry | Often harmonious proportions |
| **Era Match** | Fonts from same time period | Historical consistency |

---

## 3. Line Height Principles

### The Relationship

```
Line height depends on:
├── Font size (larger text = less line height needed)
├── Line length (longer lines = more line height)
├── Font design (some fonts need more space)
└── Content type (headings vs body)
```

### Guidelines by Context

| Content Type | Line Height Range | Why |
|--------------|-------------------|-----|
| **Headings** | 1.1 - 1.3 | Short lines, want compact |
| **Body text** | 1.4 - 1.6 | Comfortable reading |
| **Long-form** | 1.6 - 1.8 | Maximum readability |
| **UI elements** | 1.2 - 1.4 | Space efficiency |

---

## 4. Line Length Principles

### Optimal Reading Width

```
The sweet spot: 45-75 characters per line
├── < 45: Too choppy, breaks flow
├── 45-75: Comfortable reading
├── > 75: Eye tracking strain
```

### How to Measure

```css
/* Character-based (recommended) */
max-width: 65ch; /* ch = width of "0" character */

/* This adapts to font size automatically */
```

---

## 5. Responsive Typography Principles

### Fluid Typography (clamp)

```css
/* Syntax: clamp(MIN, PREFERRED, MAX) */
font-size: clamp(
  MINIMUM_SIZE,
  FLUID_CALCULATION,
  MAXIMUM_SIZE
);
```

---

## 6. Weight and Emphasis Principles

### Semantic Weight Usage

| Weight Range | Name | Use For |
|--------------|------|---------|
| 300-400 | Light/Normal | Body text, paragraphs |
| 500 | Medium | Subtle emphasis |
| 600 | Semibold | Subheadings, labels |
| 700 | Bold | Headings, strong emphasis |
| 800-900 | Heavy/Black | Display, hero text |

---

## 7. Letter Spacing (Tracking)

### Principles

```
Large text (headings): tighter tracking
Small text (body): normal or slightly wider
ALL CAPS: always wider tracking (+5% to +10%)
```

---

## 8. Hierarchy Principles

### Visual Hierarchy Through Type

```
Ways to create hierarchy:
├── SIZE (most obvious)
├── WEIGHT (bold stands out)
├── COLOR (contrast levels)
├── SPACING (margins separate sections)
└── POSITION (top = important)
```

---

## 9. Typography Selection Checklist

Before finalizing typography:

- [ ] **Asked user for font preferences?**
- [ ] **Considered brand/context?**
- [ ] **Selected appropriate scale ratio?**
- [ ] **Limited to 2-3 font families?**
- [ ] **Tested readability at all sizes?**
- [ ] **Checked line length (45-75ch)?**
- [ ] **Verified contrast for accessibility?**

### Anti-Patterns

- ❌ Same fonts every project
- ❌ Too many font families
- ❌ Ignoring readability for style
- ❌ Fixed sizes without responsiveness

---

> **Remember**: Typography is about communication clarity.