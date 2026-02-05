# Web Design Guidelines Reference

This document provides comprehensive guidelines for web design, including accessibility standards, visual hierarchy principles, spacing systems, typography scales, color usage, responsive design patterns, and component design best practices.

## Table of Contents

1. [Accessibility Standards](#accessibility-standards)
2. [Visual Hierarchy](#visual-hierarchy)
3. [Spacing System](#spacing-system)
4. [Typography Scale](#typography-scale)
5. [Color Usage](#color-usage)
6. [Responsive Design](#responsive-design)
7. [Component Design](#component-design)
8. [Design Patterns](#design-patterns)
9. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

All web implementations must meet WCAG 2.1 Level AA standards:

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| Contrast | 4.5:1 for normal text | Use contrast checker tools |
| Contrast (Large) | 3:1 for large text (18pt+) | Ensure readability |
| Focus Indicators | Visible focus states | Never remove outline without replacement |
| Keyboard Navigation | All interactive elements accessible via keyboard | Test with Tab key |
| Screen Readers | Proper ARIA labels and semantic HTML | Use landmarks and labels |

### Semantic HTML Structure

```html
<!-- Good: Proper semantic structure -->
<header role="banner">
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/" aria-current="page">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main role="main">
  <article>
    <h1>Page Title</h1>
    <section>
      <h2>Section Title</h2>
      <p>Content...</p>
    </section>
  </article>
</main>

<footer role="contentinfo">
  <nav aria-label="Footer navigation">
    <!-- Footer links -->
  </nav>
</footer>
```

### ARIA Attributes

| Attribute | Use Case | Example |
|-----------|----------|---------|
| `aria-label` | Label for icon buttons | `<button aria-label="Close modal">×</button>` |
| `aria-describedby` | Associate description | `<input aria-describedby="email-help">` |
| `aria-expanded` | Toggle state | `<button aria-expanded="true">Menu</button>` |
| `aria-hidden` | Hide from accessibility tree | `<span aria-hidden="true">★</span>` |
| `role` | Explicit landmark | `<nav role="navigation">` |

---

## Visual Hierarchy

### F-Pattern and Z-Pattern Layouts

Users typically scan pages in predictable patterns:

**F-Pattern (for text-heavy content):**
```
┌─────────────────────────┐
│ Header                  │ ← Top horizontal
├─────────┬───────────────┤
│ Heading │ Content       │ ← Second horizontal
│         │ Content       │
│         │ Content       │ ← Vertical left
│         │ Content       │
│ Sidebar │ Content       │ ← Bottom horizontal
└─────────────────────────┘
```

**Z-Pattern (for simple layouts):**
```
┌─────────────────────────┐
│ Logo    ████████  Nav   │ ← Top horizontal
├─────────────────────────┤
│                           │
│                           │ ← Diagonal
│                           │
├─────────────────────────┘
│ CTA Button              │ ← Bottom horizontal
└─────────────────────────┘
```

### Hierarchy Principles

| Level | Element | Weight | Purpose |
|-------|---------|--------|---------|
| 1 | H1 / Hero | 32-48px | Primary focus |
| 2 | H2 / Section | 24-32px | Major sections |
| 3 | H3 / Subsection | 18-24px | Subsections |
| 4 | H4 / Detail | 16-18px | Details |
| Body | Paragraph | 16px | Content |

### Visual Weight Distribution

```css
/* Primary emphasis - largest, boldest */
.hero-title {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
}

/* Secondary emphasis */
.section-title {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 600;
  line-height: 1.2;
}

/* Tertiary emphasis */
.subsection-title {
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 600;
}

/* Body text */
.body-text {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
}
```

---

## Spacing System

### Base Unit: 8px Grid

All spacing should be multiples of 8px:

| Token | Value | Use Case |
|-------|-------|----------|
| `--space-1` | 4px | Tight spacing, inline elements |
| `--space-2` | 8px | Default internal padding |
| `--space-3` | 12px | Small components |
| `--space-4` | 16px | Standard spacing |
| `--space-5` | 20px | Card padding |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Large section spacing |
| `--space-10` | 40px | Major divisions |
| `--space-12` | 48px | Hero sections |
| `--space-16` | 64px | Page sections |
| `--space-20` | 80px | Maximum spacing |

### CSS Custom Properties

```css
:root {
  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;

  /* Component spacing */
  --spacing-xs: var(--space-2);
  --spacing-sm: var(--space-3);
  --spacing-md: var(--space-4);
  --spacing-lg: var(--space-6);
  --spacing-xl: var(--space-8);
  --spacing-2xl: var(--space-12);
}
```

### Spacing Examples

```css
/* Card component */
.card {
  padding: var(--space-4);
  gap: var(--space-3);
}

/* Form field */
.form-group {
  margin-bottom: var(--space-4);
}

/* Section */
.section {
  padding: var(--space-8) var(--space-4);
}

/* Page container */
.container {
  padding: 0 var(--space-4);
  max-width: 1200px;
}
```

---

## Typography Scale

### Type Scale Ratio: 1.25 (Major Third)

| Level | Variable | Font Size | Line Height | Use Case |
|-------|----------|-----------|-------------|----------|
| Display | `--text-display` | 4rem (64px) | 1.1 | Hero headlines |
| H1 | `--text-h1` | 3rem (48px) | 1.2 | Page titles |
| H2 | `--text-h2` | 2.25rem (36px) | 1.25 | Section titles |
| H3 | `--text-h3` | 1.75rem (28px) | 1.3 | Subsection titles |
| H4 | `--text-h4` | 1.25rem (20px) | 1.4 | Detail headings |
| Body Large | `--text-body-lg` | 1.125rem (18px) | 1.6 | Lead paragraphs |
| Body | `--text-body` | 1rem (16px) | 1.6 | Standard text |
| Body Small | `--text-body-sm` | 0.875rem (14px) | 1.5 | Captions, labels |
| Caption | `--text-caption` | 0.75rem (12px) | 1.4 | Fine print |

### Typography CSS

```css
:root {
  /* Font families */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Type scale */
  --text-caption: 0.75rem/1.4 var(--font-sans);
  --text-body-sm: 0.875rem/1.5 var(--font-sans);
  --text-body: 1rem/1.6 var(--font-sans);
  --text-body-lg: 1.125rem/1.6 var(--font-sans);
  --text-h4: 1.25rem/1.4 var(--font-sans);
  --text-h3: 1.75rem/1.3 var(--font-sans);
  --text-h2: 2.25rem/1.25 var(--font-sans);
  --text-h1: 3rem/1.2 var(--font-sans);
  --text-display: 4rem/1.1 var(--font-sans);
}
```

### Font Loading

```css
/* Prevent layout shift */
@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('/fonts/Inter.woff2') format('woff2');
  unicode-range: U+0000-00FF;
}
```

---

## Color Usage

### Color Palette Structure

| Role | Variable | Purpose |
|------|----------|---------|
| Primary | `--color-primary-*` | Main brand color |
| Secondary | `--color-secondary-*` | Accent color |
| Neutral | `--color-neutral-*` | Text, backgrounds |
| Semantic | `--color-success`, `--color-error`, `--color-warning` | Feedback colors |

### Color Scale (Neutral)

| Token | Value | Use |
|-------|-------|-----|
| `--neutral-50` | #FAFAFA | Page background |
| `--neutral-100` | #F5F5F5 | Secondary background |
| `--neutral-200` | #E5E5E5 | Borders, dividers |
| `--neutral-300` | #D4D4D4 | Secondary text |
| `--neutral-400` | #A3A3A3 | Icons, disabled |
| `--neutral-500` | #737373 | Placeholder text |
| `--neutral-600` | #525252 | Body text |
| `--neutral-700` | #404040 | Headings |
| `--neutral-800` | #262626 | Primary text |
| `--neutral-900` | #171717 | Maximum contrast |

### Color Variables Template

```css
:root {
  /* Primary palette */
  --color-primary-50: #EBF5FF;
  --color-primary-100: #E1EFFE;
  --color-primary-200: #C3DDFD;
  --color-primary-300: #A4C8FB;
  --color-primary-400: #76A9FA;
  --color-primary-500: #3B82F6;
  --color-primary-600: #2563EB;
  --color-primary-700: #1D4ED8;
  --color-primary-800: #1E40AF;
  --color-primary-900: #1E3A8A;

  /* Semantic colors */
  --color-success-500: #22C55E;
  --color-success-600: #16A34A;
  --color-warning-500: #F59E0B;
  --color-warning-600: #D97706;
  --color-error-500: #EF4444;
  --color-error-600: #DC2626;
  --color-info-500: #3B82F6;
  --color-info-600: #2563EB;

  /* Text colors */
  --text-primary: var(--neutral-900);
  --text-secondary: var(--neutral-600);
  --text-tertiary: var(--neutral-400);
  --text-inverse: var(--neutral-50);

  /* Background colors */
  --bg-primary: var(--neutral-50);
  --bg-secondary: var(--neutral-100);
  --bg-tertiary: var(--neutral-200);
  --bg-inverse: var(--neutral-900);
}
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Variable | Width | Target |
|------------|----------|-------|--------|
| Mobile | `--bp-mobile` | 0-639px | Small screens |
| Tablet | `--bp-tablet` | 640-1023px | Medium screens |
| Desktop | `--bp-desktop` | 1024-1279px | Standard desktop |
| Large | `--bp-large` | 1280-1535px | Large screens |
| XLarge | `--bp-xlarge` | 1536px+ | Extra large |

### CSS Media Queries

```css
/* Mobile-first base styles */

/* Tablet */
@media (min-width: 640px) {
  :root {
    --text-body: 1rem;
    --spacing-md: var(--space-5);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  :root {
    --text-body-lg: 1.125rem;
    --spacing-lg: var(--space-6);
  }
}

/* Large screens */
@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

### Container Queries (Modern Approach)

```css
@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

### Responsive Spacing

```css
.section {
  padding: var(--space-4);
}

@media (min-width: 768px) {
  .section {
    padding: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .section {
    padding: var(--space-8);
  }
}
```

### Fluid Typography

```css
h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.1;
}

h2 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  line-height: 1.2;
}

h3 {
  font-size: clamp(1.25rem, 3vw, 2rem);
  line-height: 1.3;
}
```

---

## Component Design

### Button Component

```tsx
interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Icon to display before text */
  leadingIcon?: React.ReactNode;
  /** Icon to display after text */
  trailingIcon?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leadingIcon,
  trailingIcon,
  onClick,
}) => {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {leadingIcon && <span className="btn__icon">{leadingIcon}</span>}
      <span className="btn__text">{children}</span>
      {trailingIcon && <span className="btn__icon">{trailingIcon}</span>}
    </button>
  );
};
```

### Card Component

```tsx
interface CardProps {
  /** Card title */
  title?: string;
  /** Card subtitle or description */
  subtitle?: string;
  /** Card content */
  children: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Clickable card */
  clickable?: boolean;
  /** Selected state */
  selected?: boolean;
  /** Card elevation */
  elevation?: 'low' | 'medium' | 'high';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  clickable = false,
  selected = false,
  elevation = 'medium',
}) => {
  const className = `card card--elevation-${elevation} ${clickable ? 'card--clickable' : ''} ${selected ? 'card--selected' : ''}`;

  return (
    <article className={className}>
      {(title || subtitle) && (
        <header className="card__header">
          {title && <h3 className="card__title">{title}</h3>}
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </header>
      )}
      <div className="card__body">
        {children}
      </div>
      {footer && (
        <footer className="card__footer">
          {footer}
        </footer>
      )}
    </article>
  );
};
```

### Form Input Component

```tsx
interface InputProps {
  /** Label for the input */
  label: string;
  /** Input placeholder */
  placeholder?: string;
  /** Helper text displayed below input */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number';
  /** Disabled state */
  disabled?: boolean;
  /** Required field indicator */
  required?: boolean;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Input value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  helperText,
  error,
  type = 'text',
  disabled = false,
  required = false,
  icon,
  value,
  onChange,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className={`input-group ${disabled ? 'input-group--disabled' : ''}`}>
      <label htmlFor={id} className="input__label">
        {label}
        {required && <span className="input__required" aria-hidden="true">*</span>}
      </label>
      <div className={`input__wrapper ${error ? 'input__wrapper--error' : ''}`}>
        {icon && <span className="input__icon">{icon}</span>}
        <input
          id={id}
          type={type}
          className="input"
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          aria-invalid={!!error}
        />
      </div>
      {error && (
        <p id={errorId} className="input__error">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="input__helper">
          {helperText}
        </p>
      )}
    </div>
  );
};
```

---

## Design Patterns

### Compound Components Pattern

For components with related parts:

```tsx
interface CardContextValue {
  variant: 'default' | 'bordered' | 'elevated';
  size: 'sm' | 'md' | 'lg';
}

const CardContext = createContext<CardContextValue | null>(null);

interface CardRootProps {
  variant?: 'default' | 'bordered' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const CardRoot: React.FC<CardRootProps> = ({
  variant = 'default',
  size = 'md',
  children,
}) => {
  return (
    <CardContext.Provider value={{ variant, size }}>
      <div className={`card card--${variant} card--${size}`}>
        {children}
      </div>
    </CardContext.Provider>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children }) => {
  return <header className="card__header">{children}</header>;
};

export const CardBody: React.FC<CardBodyProps> = ({ children }) => {
  return <div className="card__body">{children}</div>;
};

export const CardFooter: React.FC<CardFooterProps> = ({ children }) => {
  return <footer className="card__footer">{children}</footer>;
};

// Usage
<CardRoot variant="elevated">
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Actions</CardFooter>
</CardRoot>
```

### Provider Pattern

For global state and theming:

```tsx
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  primaryColor: string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
}) => {
  const [theme, setTheme] = useState(defaultTheme);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, primaryColor: '#3B82F6' }}>
      <div className={`app theme--${theme}`}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### Hook Pattern

For reusable logic:

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

---

## Anti-Patterns to Avoid

### ❌ BAD: Hardcoded Colors

```css
/* Anti-pattern */
.button {
  background-color: #3B82F6;
  color: #FFFFFF;
  border: 1px solid #2563EB;
}

.card {
  background-color: #F5F5F5;
  padding: 20px;
  margin-bottom: 16px;
}
```

### ✅ GOOD: Design Tokens

```css
/* Recommended approach */
:root {
  --color-primary-500: #3B82F6;
  --color-primary-600: #2563EB;
  --color-neutral-50: #FAFAFA;
  --color-neutral-900: #171717;

  --space-4: 16px;
  --space-5: 20px;
}

.button {
  background-color: var(--color-primary-500);
  color: var(--color-neutral-50);
  border: 1px solid var(--color-primary-600);
}

.card {
  background-color: var(--color-neutral-50);
  padding: var(--space-4);
  margin-bottom: var(--space-5);
}
```

### ❌ BAD: Missing Accessibility

```tsx
// Anti-pattern
<button onClick={handleClick}>
  <Icon name="menu" />
</button>

<input type="text" placeholder="Enter email" />
```

### ✅ GOOD: Full Accessibility

```tsx
// Recommended approach
<button
  onClick={handleMenuToggle}
  aria-expanded={isOpen}
  aria-controls="main-menu"
  aria-label={isOpen ? 'Close menu' : 'Open menu'}
>
  <Icon name="menu" aria-hidden="true" />
</button>

<label htmlFor="email" className="sr-only">Email address</label>
<input
  id="email"
  type="email"
  placeholder="name@example.com"
  aria-describedby="email-help"
  required
/>
<p id="email-help" className="helper-text">
  We'll never share your email.
</p>
```

### ❌ BAD: Inconsistent Spacing

```css
/* Anti-pattern */
.card {
  padding: 10px;
  margin-bottom: 15px;
  gap: 18px;
}

.section {
  padding: 25px;
  margin: 30px 0;
}
```

### ✅ GOOD: Consistent Spacing System

```css
/* Recommended approach */
:root {
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
}

.card {
  padding: var(--space-4);
  margin-bottom: var(--space-5);
  gap: var(--space-3);
}

.section {
  padding: var(--space-6);
  margin: var(--space-6) 0;
}
```

### ❌ BAD: Over-Engineering

```tsx
// Anti-pattern: Creating unnecessary abstraction
interface IButtonComponentProps {
  variant: ButtonVariantEnum;
  size: ButtonSizeEnum;
  shape: ButtonShapeEnum;
  state: ButtonStateEnum;
  // 20+ more properties
}

class ButtonFactory implements ButtonFactoryInterface {
  createButton(): IButtonComponent {
    return new ButtonComponent();
  }
}
```

### ✅ GOOD: Pragmatic Simplicity

```tsx
// Recommended: Simple, focused interface
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
}) => {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

---

## Implementation Checklist

- [ ] Use semantic HTML elements
- [ ] Ensure 4.5:1 color contrast ratio
- [ ] Implement visible focus states
- [ ] Support keyboard navigation
- [ ] Add ARIA labels where needed
- [ ] Use design tokens for colors
- [ ] Follow 8px spacing grid
- [ ] Implement responsive breakpoints
- [ ] Use fluid typography
- [ ] Create accessible form inputs
- [ ] Document component props
- [ ] Test across devices
- [ ] Validate with accessibility tools

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Type Scale Generator](https://type-scale.com/)
- [CSS Custom Properties Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
