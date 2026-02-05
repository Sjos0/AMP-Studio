# Creativity Techniques Reference

This document provides detailed techniques and patterns for creative problem-solving in software development.

## Table of Contents

1. [Creative Thinking Techniques](#creative-thinking-techniques)
2. [Design Patterns for Creative Solutions](#design-patterns-for-creative-solutions)
3. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
4. [Evaluation Criteria](#evaluation-criteria)

---

## Creative Thinking Techniques

### 1. SCAMPER Method

A checklist for generating creative alternatives:

| Letter | Question | Application |
|--------|----------|-------------|
| **S** | Substitute? | What can be replaced? |
| **C** | Combine? | What can be merged? |
| **A** | Adapt? | What can be adjusted? |
| **M** | Modify? | What can be changed? |
| **P** | Put to other use? | New applications? |
| **E** | Eliminate? | What can be removed? |
| **R** | Reverse? | What can be inverted? |

### 2. Analogical Thinking

Draw parallels from other domains:

```
Problem Domain          →  Solution Domain
─────────────────────────────────────────
Event handling          →  Pub/Sub pattern
State machines         →  Switch statements
File systems           →  Hash maps
Biological systems     →  Neural networks
```

### 3. First Principles Thinking

Break down to fundamental truths:

```
Complex Problem
       │
       ▼
┌──────────────────┐
│ Decompose        │→ What are we really trying to do?
│ into parts      │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Question         │→ Can we eliminate the unnecessary?
│ assumptions      │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Rebuild          │→ How would we solve this from scratch?
│ from scratch    │
└──────────────────┘
```

### 4. Lateral Thinking

Unconventional approaches:

- **Reformulate the problem**: "How might we..." instead of "How to..."
- **Challenge constraints**: What if we removed X?
- **Invert the problem**: Instead of A, do B
- **Random entry**: Start from an unexpected point

---

## Design Patterns for Creative Solutions

### 1. Strategy Pattern

Replace conditionals with behavior:

```typescript
// Before: Complex conditionals
function calculateDiscount(order: Order): number {
    if (order.customer.isPremium) {
        return order.total * 0.15;
    } else if (order.customer.isRegular) {
        return order.total * 0.10;
    } else if (order.total > 1000) {
        return order.total * 0.05;
    }
    return 0;
}

// After: Strategy pattern
interface DiscountStrategy {
    calculate(order: Order): number;
}

class PremiumDiscount implements DiscountStrategy {
    calculate(order: Order): number {
        return order.total * 0.15;
    }
}

class RegularDiscount implements DiscountStrategy {
    calculate(order: Order): number {
        return order.total * 0.10;
    }
}
```

### 2. Builder Pattern

Create complex objects step by step:

```typescript
class QueryBuilder {
    private conditions: string[] = [];
    private sorts: Sort[] = [];
    
    where(condition: string): this {
        this.conditions.push(condition);
        return this;
    }
    
    orderBy(field: string, direction: 'asc' | 'desc'): this {
        this.sorts.push({ field, direction });
        return this;
    }
    
    build(): string {
        // Build query string
    }
}
```

### 3. Factory Pattern

Delegate object creation:

```typescript
interface Notification {
    send(message: string): void;
}

class NotificationFactory {
    static createNotification(type: 'email' | 'sms' | 'push'): Notification {
        switch (type) {
            case 'email': return new EmailNotification();
            case 'sms': return new SMSNotification();
            case 'push': return new PushNotification();
            default: throw new Error('Unknown type');
        }
    }
}
```

### 4. Chain of Responsibility

Process requests through a chain:

```typescript
abstract class Handler {
    private next?: Handler;
    
    setNext(handler: Handler): Handler {
        this.next = handler;
        return handler;
    }
    
    handle(request: Request): Response | null {
        if (this.next) {
            return this.next.handle(request);
        }
        return null;
    }
}
```

---

## Anti-Patterns to Avoid

### 1. Premature Abstraction

```typescript
// ❌ BAD: Abstract for the sake of being abstract
interface IEntityFactoryFactory<T extends IEntity> {
    createFactory(): IFactory<T>;
}

// ✅ GOOD: Abstract when patterns emerge
class UserFactory {
    create(): User {
        return new User();
    }
}
```

### 2. Over-Engineering

```typescript
// ❌ BAD: Complex for simple task
async function getUserData(userId: string): Promise<Result<UserData>> {
    const pipeline = new DataProcessingPipeline<...>();
    return pipeline.execute(userId);
}

// ✅ GOOD: Simple and direct
async function getUserData(userId: string): Promise<UserData> {
    const user = await db.findUser(userId);
    return { ...user, fullName: `${user.firstName} ${user.lastName}` };
}
```

### 3. Feature Bloat

```typescript
// ❌ BAD: Over-engineered
class UltraMegaSuperFactoryBuilder {
    private instance: UltraMegaSuperFactoryBuilder;
    private config: ComplexConfigType;
    private middleware: MiddlewareChain[];
    private plugins: PluginSystem;
    private observers: Subject<any>[];
}

// ✅ GOOD: Focused and simple
class Factory<T> {
    create(): T {
        return new T();
    }
}
```

---

## Evaluation Criteria

When evaluating creative solutions, consider:

### 1. Clarity
- Is the code easy to understand?
- Are names descriptive?
- Is the structure logical?

### 2. Maintainability
- Can changes be made easily?
- Is the code testable?
- Are dependencies clear?

### 3. Efficiency
- Does the solution perform well?
- Are resources used appropriately?
- Is there unnecessary complexity?

### 4. Innovation
- Does it solve the problem elegantly?
- Are there novel approaches?
- Does it simplify complex logic?

### 5. Extensibility
- Can new features be added easily?
- Is the code adaptable?
- Are there clear extension points?

---

## Creative Prompts

When stuck, ask yourself:

1. What would this look like in a different language paradigm?
2. How would a beginner solve this?
3. How would an expert solve this?
4. What's the simplest possible solution?
5. What's the most elegant solution?
6. How can I make this self-documenting?
7. What can I remove entirely?
8. How can I compose instead of nest?
9. What's the core abstraction?
10. What patterns emerge?
