# Visual Effects Reference

> Modern CSS effect principles and techniques - learn the concepts, create variations.
> **No fixed values to copy - understand the patterns.**

---

## 1. Glassmorphism Principles

### What Makes Glassmorphism Work

```
Key Properties:
├── Semi-transparent background (not solid)
├── Backdrop blur (frosted glass effect)
├── Subtle border (for definition)
└── Often: light shadow for depth
```

### The Pattern (Customize Values)

```css
.glass {
  background: rgba(R, G, B, OPACITY);
  backdrop-filter: blur(AMOUNT);
  border: 1px solid rgba(255, 255, 255, OPACITY);
}
```

### When to Use Glassmorphism
- ✅ Over colorful/image backgrounds
- ✅ Modals, overlays, cards
- ❌ Text-heavy content (readability issues)

---

## 2. Shadow Hierarchy Principles

### Concept: Shadows Indicate Elevation

```
Higher elevation = larger shadow
├── Level 0: No shadow (flat on surface)
├── Level 1: Subtle shadow (slightly raised)
├── Level 2: Medium shadow (cards, buttons)
├── Level 3: Large shadow (modals, dropdowns)
└── Level 4: Deep shadow (floating elements)
```

### Principles for Natural Shadows

1. **Y-offset larger than X** (light comes from above)
2. **Low opacity** (5-15% for subtle)
3. **Multiple layers** for realism

---

## 3. Gradient Principles

### Types and When to Use

| Type | Pattern | Use Case |
|------|---------|----------|
| **Linear** | Color A → Color B along line | Backgrounds, buttons |
| **Radial** | Center → outward | Spotlights |
| **Conic** | Around center | Pie charts |

---

## 4. Performance Principles

### GPU-Accelerated Properties

```
CHEAP to animate (GPU):
├── transform (translate, scale, rotate)
└── opacity

EXPENSIVE to animate (CPU):
├── width, height
├── box-shadow
└── border-radius
```

---

## 5. Effect Selection Checklist

Before applying any effect:

- [ ] **Does it serve a purpose?**
- [ ] **Is it appropriate for the context?**
- [ ] **Is it accessible?**
- [ ] **Is it performant?**

### Anti-Patterns

- ❌ Glassmorphism on every element
- ❌ Dark + neon as default
- ❌ Static/flat designs with no depth

---

> **Remember**: Effects enhance meaning.