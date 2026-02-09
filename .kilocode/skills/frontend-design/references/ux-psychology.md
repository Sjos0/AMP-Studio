# UX Psychology Reference

> Deep dive into UX laws, emotional design, trust building, and behavioral psychology.

---

## 1. Core UX Laws

### Hick's Law

**Principle:** The time to make a decision increases logarithmically with the number of choices.

```
Decision Time = a + b × log₂(n + 1)
Where n = number of choices
```

**Application:**
- Navigation: Max 5-7 top-level items
- Forms: Break into steps (progressive disclosure)
- Options: Default selections when possible
- Filters: Prioritize most-used, hide advanced

**Example:**
```
❌ Bad: 15 menu items in one nav
✅ Good: 5 main categories + "More" 

❌ Bad: 20 form fields at once
✅ Good: 3-step wizard with 5-7 fields each
```

---

### Fitts' Law

**Principle:** Time to reach a target = function of distance and size.

```
MT = a + b × log₂(1 + D/W)
Where D = distance, W = width
```

**Application:**
- CTAs: Make primary buttons larger (min 44px height)
- Touch targets: 44×44px minimum on mobile
- Placement: Important actions near natural cursor position
- Corners: "Magic corners" (infinite edge = easy to hit)

**Button Sizing:**
```css
/* Size by importance */
.btn-primary { height: 48px; padding: 0 24px; }
.btn-secondary { height: 40px; padding: 0 16px; }
.btn-tertiary { height: 36px; padding: 0 12px; }

/* Mobile touch targets */
@media (hover: none) {
  .btn { min-height: 44px; min-width: 44px; }
}
```

---

### Miller's Law

**Principle:** Average person can hold 7±2 chunks in working memory.

**Application:**
- Lists: Group into chunks of 5-7 items
- Navigation: Max 7 menu items
- Content: Break long content with headings
- Phone numbers: 555-123-4567 (chunked)

**Chunking Example:**
```
❌ 5551234567
✅ 555-123-4567

❌ Long paragraph of text without breaks
✅ Short paragraphs
   With bullet points
   And subheadings
```

---

### Von Restorff Effect (Isolation Effect)

**Principle:** An item that stands out is more likely to be remembered.

**Application:**
- CTA buttons: Distinct color from other elements
- Pricing: Highlight recommended plan
- Important info: Visual differentiation
- New features: Badge or callout

**Example:**
```css
/* All buttons gray, primary stands out */
.btn { background: #E5E7EB; }
.btn-primary { background: #3B82F6; }

/* Recommended plan highlighted */
.pricing-card { border: 1px solid #E5E7EB; }
.pricing-card.popular { 
  border: 2px solid #3B82F6;
  box-shadow: var(--shadow-lg);
}
```

---

### Serial Position Effect

**Principle:** Items at the beginning (primacy) and end (recency) of a list are remembered best.

**Application:**
- Navigation: Most important items first and last
- Lists: Key info at top and bottom
- Forms: Most critical fields at start
- CTAs: Repeat at top and bottom of long pages

---

### Jakob's Law

**Principle:** Users spend most of their time on other sites. They prefer your site to work the same way as all the other sites they already know.

**Application:**
- **Patterns:** Use standard placement for search bars and carts.
- **Mental Models:** Leverage familiar icons.
- **Vocabulary:** Use clear, familiar language.
- **Layout:** Keep consistent navigation patterns.
- **Interaction:** Use standard gestures and feedback.
- **Feedback:** Standard colors (Red = Error, Green = Success).

---

## 2. Visual Perception (Gestalt Principles)

### Law of Proximity

**Principle:** Objects that are near tend to be grouped together.

**Application:**
- **Grouping:** Keep labels physically close to input fields.
- **Spacing:** Larger margins between unrelated content blocks.
- **Cards:** Text inside a card should be closer to its image than the border.

---

### Law of Similarity

**Principle:** The human eye tends to perceive similar elements as a complete picture.

**Application:**
- **Consistency:** Consistent colors for all clickable links.
- **Iconography:** All icons in a set should have the same stroke weight.
- **Buttons:** Same shape/size for buttons with the same importance.

---

### Law of Common Region

**Principle:** Elements tend to be perceived into groups if they are sharing an area with a clearly defined boundary.

**Application:**
- **Containerizing:** Use cards to group images and titles.
- **Borders:** Use lines to separate the sidebar from the main feed.
- **Modals:** Use a distinct box to separate pop-ups from the page.

---

## 3. Cognitive Biases & Behavior

### Social Proof

**Principle:** People copy the actions of others in attempting to undertake behavior in a given situation.

**Application:**
- **Validation:** Display "Join 50,000+ others."
- **Reviews:** Star ratings and verified customer testimonials.
- **Logos:** "Trusted by" section showing partner brands.
- **Activity:** "300 people are currently viewing this item."

---

### Scarcity Principle

**Principle:** Humans place a higher value on an object that is scarce.

**Application:**
- **Urgency:** "Only 2 items left in stock."
- **Time:** Ticking countdown timers for sales.
- **Access:** "Invite-only" betas or exclusive tiers.

---

### Loss Aversion

**Principle:** People generally prefer avoiding losses to acquiring equivalent gains.

**Application:**
- **Messaging:** "Don't lose your discount."
- **Trials:** "Your free trial is ending - keep your data now."

---

## 4. Emotional Design (Don Norman)

### Three Levels of Processing

```
┌─────────────────────────────────────────────────────────────┐
│  VISCERAL (Lizard Brain)                                    │
│  ─────────────────────                                      │
│  • Immediate, automatic reaction                            │
│  • First impressions                                        │
│  • Aesthetics: colors, shapes, imagery                      │
├─────────────────────────────────────────────────────────────┤
│  BEHAVIORAL (Functional Brain)                              │
│  ─────────────────────────────                              │
│  • Usability and function                                   │
│  • Pleasure from effective use                              │
│  • Performance, reliability, ease                           │
├─────────────────────────────────────────────────────────────┤
│  REFLECTIVE (Conscious Brain)                               │
│  ─────────────────────────────                              │
│  • Conscious thought and meaning                            │
│  • Personal identity and values                             │
│  • Long-term memory and loyalty                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Trust Building System

### Trust Signal Categories

| Category | Elements | Implementation |
|----------|----------|----------------|
| **Security** | SSL, badges, encryption | Visible padlock, security logos on forms |
| **Social Proof** | Reviews, testimonials, logos | Star ratings, customer photos, brand logos |
| **Transparency** | Policies, pricing, contact | Clear links, no hidden fees, real address |
| **Professional** | Design quality, consistency | No broken elements, consistent branding |

---

## 6. Cognitive Load Management

### Three Types of Cognitive Load

| Type | Definition | Designer's Role |
|------|------------|-----------------|
| **Intrinsic** | Inherent complexity of task | Break into smaller steps |
| **Extraneous** | Load from poor design | Eliminate this! |
| **Germane** | Effort for learning | Support and encourage |

### Reduction Strategies

1. **Simplify (Reduce Extraneous)** - Remove visual noise
2. **Chunk Information** - Group related content
3. **Progressive Disclosure** - Hide complexity until needed
4. **Use Familiar Patterns** - Standard web conventions
5. **Offload Information** - Don't make users remember

---

## 7. Psychology Checklist

### Before Launch

- [ ] **Hick's Law:** No more than 7 choices in navigation
- [ ] **Fitts' Law:** Primary CTAs are large and reachable
- [ ] **Miller's Law:** Content is chunked appropriately
- [ ] **Jakob's Law:** Site follows standard web conventions
- [ ] **Von Restorff:** Primary CTA visually stands out
- [ ] **Trust Signals:** Security badges, reviews visible
- [ ] **Social Proof:** Real user numbers or testimonials
- [ ] **Cognitive Load:** Extraneous visual noise minimized
- [ ] **Emotional Design:** Color palette evokes intended feeling
- [ ] **Accessibility:** Contrast ratio sufficient

---

> **Remember:** UX psychology is about understanding users and designing for their natural behavior patterns.