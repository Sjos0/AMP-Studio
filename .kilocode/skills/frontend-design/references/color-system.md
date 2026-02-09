# Color System Reference

> Color theory principles, selection process, and decision-making guidelines.
> **No memorized hex codes - learn to THINK about color.**

---

## 1. Color Theory Fundamentals

### The Color Wheel

```
                    YELLOW
                       │
          Yellow-    │    Yellow-
          Green      │    Orange
             ╲       │       ╱
              ╲      │      ╱
   GREEN ─────────── ● ─────────── ORANGE
              ╱      │      ╲
             ╱       │       ╲
          Blue-      │    Red-
          Green      │    Orange
                       │
                      RED
                       │
                    PURPLE
                   ╱       ╲
              Blue-         Red-
              Purple        Purple
                   ╲       ╱
                     BLUE
```

### Color Relationships

| Scheme | How to Create | When to Use |
|--------|---------------|-------------|
| **Monochromatic** | Pick ONE hue, vary only lightness/saturation | Minimal, professional, cohesive |
| **Analogous** | Pick 2-3 ADJACENT hues on wheel | Harmonious, calm, nature-inspired |
| **Complementary** | Pick OPPOSITE hues on wheel | High contrast, vibrant, attention |
| **Split-Complementary** | Base + 2 colors adjacent to complement | Dynamic but balanced |
| **Triadic** | 3 hues EQUIDISTANT on wheel | Vibrant, playful, creative |

---

## 2. The 60-30-10 Rule

### Distribution Principle

```
┌─────────────────────────────────────────────────┐
│                                                 │
│     60% PRIMARY (Background, large areas)       │
│     → Should be neutral or calming              │
│                                                 │
├────────────────────────────────────┬────────────┤
│                                    │            │
│   30% SECONDARY                    │ 10% ACCENT │
│   (Cards, sections, headers)       │ (CTAs,     │
│                                    │ highlights)│
└────────────────────────────────────┴────────────┘
```

---

## 3. Color Psychology - Meaning & Selection

### How to Choose Based on Context

| If Project Is... | Consider These Hues | Why |
|------------------|---------------------|-----|
| **Finance, Tech, Healthcare** | Blues, Teals | Trust, stability, calm |
| **Eco, Wellness, Nature** | Greens, Earth tones | Growth, health, organic |
| **Food, Energy, Youth** | Orange, Yellow, Warm | Appetite, excitement, warmth |
| **Luxury, Beauty, Creative** | Deep Teal, Gold, Black | Sophistication, premium |
| **Urgency, Sales, Alerts** | Red, Orange | Action, attention, passion |

### Emotional Associations

| Hue Family | Positive Associations | Cautions |
|------------|----------------------|----------|
| **Blue** | Trust, calm, professional | Can feel cold, corporate |
| **Green** | Growth, nature, success | Can feel boring if overused |
| **Red** | Passion, urgency, energy | High arousal, use sparingly |
| **Orange** | Warmth, friendly, creative | Can feel cheap if saturated |
| **Purple** | ⚠️ **BANNED** - AI overuses this! | Use Deep Teal/Maroon/Emerald instead |
| **Yellow** | Optimism, attention, happy | Hard to read, use as accent |

### Selection Process:
1. **What industry?** → Narrow to 2-3 hue families
2. **What emotion?** → Pick primary hue
3. **What contrast?** → Decide light vs dark mode
4. **ASK USER** → Confirm before proceeding

---

## 4. Palette Generation Principles

### From a Single Color (HSL Method)

```
HSL = Hue, Saturation, Lightness

Hue (0-360): The color family
  0/360 = Red
  60 = Yellow
  120 = Green
  180 = Cyan
  240 = Blue
  300 = Purple

Saturation (0-100%): Color intensity
  Low = Muted, sophisticated
  High = Vibrant, energetic

Lightness (0-100%): Brightness
  0% = Black
  50% = Pure color
  100% = White
```

### Generating a Full Palette

```
Lightness Scale:
  50  (lightest) → L: 97%
  100            → L: 94%
  200            → L: 86%
  300            → L: 74%
  400            → L: 66%
  500 (base)     → L: 50-60%
  600            → L: 48%
  700            → L: 38%
  800            → L: 30%
  900 (darkest)  → L: 20%
```

---

## 5. Context-Based Selection Guide

### Instead of Copying Palettes, Follow This Process:

**Step 1: Identify the Context**
```
What type of project?
├── E-commerce → Need trust + urgency balance
├── SaaS/Dashboard → Need low-fatigue, data focus
├── Health/Wellness → Need calming, natural feel
├── Luxury/Premium → Need understated elegance
├── Creative/Portfolio → Need personality, memorable
└── Other → ASK the user
```

**Step 2: Select Primary Hue Family**
- Blue family (trust)
- Green family (growth)
- Warm family (energy)
- Neutral family (elegant)
- OR ask user preference

---

## 6. Dark Mode Principles

### Key Rules (No Fixed Codes)

1. **Never pure black** → Use very dark gray with slight hue
2. **Never pure white text** → Use 87-92% lightness
3. **Reduce saturation** → Vibrant colors strain eyes in dark mode
4. **Elevation = brightness** → Higher elements slightly lighter

---

## 7. Accessibility Guidelines

### Contrast Requirements (WCAG)

| Level | Normal Text | Large Text |
|-------|-------------|------------|
| AA (minimum) | 4.5:1 | 3:1 |
| AAA (enhanced) | 7:1 | 4.5:1 |

---

## 8. Color Selection Checklist

Before finalizing any color choice, verify:

- [ ] **Asked user preference?** (if not specified)
- [ ] **Matches project context?** (industry, audience)
- [ ] **Follows 60-30-10?** (proper distribution)
- [ ] **WCAG compliant?** (contrast checked)
- [ ] **Works in both modes?** (if dark mode needed)
- [ ] **NOT your default/favorite?** (variety check)
- [ ] **Different from last project?** (avoid repetition)

---

## 9. Anti-Patterns to Avoid

### ❌ DON'T:
- Copy the same hex codes every project
- Default to purple/violet (AI tendency)
- Default to dark mode + neon (AI tendency)
- Use pure black (#000000) backgrounds
- Use pure white (#FFFFFF) text on dark
- Ignore user's industry context
- Skip asking user preference

### ✅ DO:
- Generate fresh palette per project
- Ask user about color preferences
- Consider industry and audience
- Use HSL for flexible manipulation
- Test contrast and accessibility
- Offer light AND dark options

---

> **Remember**: Colors are decisions, not defaults. Every project deserves thoughtful selection based on its unique context.