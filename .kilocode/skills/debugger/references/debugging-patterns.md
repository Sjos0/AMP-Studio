# Debugging Patterns and Techniques

## 1. Systematic Debugging Framework

### Step 1: Reproduce the Issue
```
┌─────────────────────────────────────────┐
│     SISTEMATIC DEBUGGING WORKFLOW       │
├─────────────────────────────────────────┤
│ 1. REPRODUCE                          │
│    └── Create minimal test case        │
│    └── Document exact steps            │
│    └── Note environment details        │
├─────────────────────────────────────────┤
│ 2. ISOLATE                            │
│    └── Narrow down the scope           │
│    └── Identify affected components    │
│    └── Find the exact failure point    │
├─────────────────────────────────────────┤
│ 3. HYPOTHESIZE                         │
│    └── Generate possible causes        │
│    └── Rank by probability             │
│    └── Design verification tests        │
├─────────────────────────────────────────┤
│ 4. VERIFY                             │
│    └── Test each hypothesis            │
│    └── Eliminate false leads           │
│    └── Confirm root cause              │
├─────────────────────────────────────────┤
│ 5. FIX                                │
│    └── Implement solution              │
│    └── Add regression tests            │
│    └── Verify fix works                │
├─────────────────────────────────────────┤
│ 6. DOCUMENT                           │
│    └── Record root cause               │
│    └── Document the fix                │
│    └── Add preventive measures         │
└─────────────────────────────────────────┘
```

## 2. Error Categories and Approaches

### Category A: Syntax/Compilation Errors
| Error Type | Symptoms | Solution |
|------------|----------|----------|
| TypeScript type mismatch | Build failure, red squiggles | Fix types, add type annotations |
| Missing imports | "Cannot find module" | Add import statement |
| Linting errors | ESLint warnings | Fix lint violations |
| Missing dependencies | Build errors | Install required packages |

### Category B: Runtime Errors
| Error Type | Symptoms | Solution |
|------------|----------|----------|
| NullReference | "Cannot read property of null" | Add null checks |
| TypeError | "X is not a function" | Verify function exists |
| RangeError | "Maximum call stack exceeded" | Check for infinite loops |
| MemoryError | "Out of memory" | Optimize data structures |

### Category C: Logic Errors
| Error Type | Symptoms | Solution |
|------------|----------|----------|
| Wrong calculation | Incorrect math results | Verify formulas |
| Incorrect condition | Wrong branch executed | Check condition logic |
| State mutation | Unexpected side effects | Use immutable patterns |
| Race condition | Intermittent failures | Add synchronization |

### Category D: Performance Issues
| Error Type | Symptoms | Solution |
|------------|----------|----------|
| Slow query | High database latency | Add indexes |
| Memory leak | Increasing memory usage | Clean up references |
| N+1 queries | Multiple DB calls | Batch queries |
| Large bundle | Slow page load | Code splitting |

## 3. Debugging Techniques by Context

### Frontend Debugging

#### React Component Debugging
```typescript
// Debug hook - Add to any component
function useDebugLog<T>(componentName: string, props: T) {
  useEffect(() => {
    console.log(`[${componentName}] Mounted with props:`, props);
    return () => {
      console.log(`[${componentName}] Unmounted`);
    };
  }, [props]);
}

// Usage in component
function UserCard({ user }: UserCardProps) {
  useDebugLog('UserCard', { userId: user?.id, name: user?.name });
  
  // Component logic
  return <div>{user?.name}</div>;
}
```

#### State Debugging with Redux DevTools
```typescript
// Redux store with DevTools
const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__?.() ?? composeEnhancers()
);

// Action logging middleware
const logger = store => next => action => {
  console.group(action.type);
  console.log('Previous state:', store.getState());
  const result = next(action);
  console.log('Next state:', store.getState());
  console.groupEnd();
  return result;
};
```

### Backend Debugging

#### API Debugging
```bash
# cURL commands for API testing
curl -X GET "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -v  # verbose mode

# Test with authentication
curl -X GET "http://localhost:3000/api/protected" \
  -H "Authorization: Bearer $TOKEN"

# Test POST with body
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'
```

#### Database Query Debugging
```sql
-- Enable query logging
SET log_statement = 'all';

-- Analyze query execution plan
EXPLAIN ANALYZE
SELECT * FROM users
WHERE email LIKE '%@example.com%';

-- Check for missing indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public';
```

### Network Debugging

#### Chrome DevTools Network Tab
```
┌─────────────────────────────────────────────┐
│  NETWORK REQUEST FLOW                       │
├─────────────────────────────────────────────┤
│  1. Request Queued                          │
│     └── Browser queues request              │
│     └── Check cache                          │
├─────────────────────────────────────────────┤
│  2. Request Started                          │
│     └── DNS resolution                       │
│     └── TCP connection                       │
│     └── TLS handshake                        │
├─────────────────────────────────────────────┤
│  3. Request Sent                            │
│     └── HTTP request transmitted            │
│     └── Request headers visible             │
│     └── Request body visible                │
├─────────────────────────────────────────────┤
│  4. Waiting for Response                     │
│     └── TTFB (Time to First Byte)          │
│     └── Server processing time              │
├─────────────────────────────────────────────┤
│  5. Content Downloaded                       │
│     └── Response body received              │
│     └── Response time measured              │
├─────────────────────────────────────────────┤
│  6. Response Parsed                          │
│     └── HTML parsed                          │
│     └── Resources loaded                     │
└─────────────────────────────────────────────┘
```

## 4. Common Error Patterns and Solutions

### Pattern: "Cannot read property 'X' of undefined"
```typescript
// ❌ Before (unsafe)
const userName = user.profile.name;

// ✅ After (safe)
const userName = user?.profile?.name;

// ✅ Alternative with default
const userName = (user?.profile?.name) ?? 'Anonymous';

// ✅ Function with optional chaining
const getUserName = (user: User | null) => user?.profile?.name;
```

### Pattern: "Maximum call stack size exceeded"
```typescript
// ❌ Before (infinite recursion)
function factorial(n: number): number {
  return n * factorial(n - 1);  // No base case!
}

// ✅ After (with base case)
function factorial(n: number): number {
  if (n <= 1) return 1;  // Base case
  return n * factorial(n - 1);
}

// ✅ Iterative (avoids stack overflow for large n)
function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
```

### Pattern: Memory Leak
```typescript
// ❌ Before (memory leak)
function useDataFetcher() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const result = await api.getData();
      setData(result);
    };
    
    fetchData();
    // Missing cleanup - subscription persists!
  }, []);
  
  return data;
}

// ✅ After (with cleanup)
function useDataFetcher() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const result = await api.getData();
      if (isMounted) setData(result);
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  return data;
}

// ✅ Alternative with AbortController
function useDataFetcher() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchData = async () => {
      try {
        const result = await api.getData({ 
          signal: abortController.signal 
        });
        if (!abortController.signal.aborted) {
          setData(result);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Fetch error:', error);
        }
      }
    };
    
    fetchData();
    
    return () => {
      abortController.abort();
    };
  }, []);
  
  return data;
}
```

### Pattern: Race Condition
```typescript
// ❌ Before (race condition)
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Both requests can complete out of order
    fetch(`/api/users/${userId}`).then(setUser);
  }, [userId]);
  
  // If userId changes from 1 to 2:
  // - Request for user 1 starts
  // - Request for user 2 starts
  // - Request for user 2 completes first
  // - Request for user 1 completes SECOND (overwrites user 2!)
}

// ✅ After (with AbortController)
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: abortController.signal
        });
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      }
    };
    
    fetchUser();
    
    return () => {
      abortController.abort();
    };
  }, [userId]);
  
  return user ? <UserCard user={user} /> : <Loading />;
}

// ✅ Alternative with useRef to ignore stale
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const latestUserId = useRef(userId);
  
  useEffect(() => {
    latestUserId.current = userId;
    
    const fetchUser = async () => {
      const currentId = latestUserId.current;
      const response = await fetch(`/api/users/${currentId}`);
      const userData = await response.json();
      
      // Only update if still relevant
      if (latestUserId.current === currentId) {
        setUser(userData);
      }
    };
    
    fetchUser();
  }, [userId]);
}
```

## 5. Debugging Tools Reference

### Browser DevTools
| Tab | Use Case | Key Shortcuts |
|-----|----------|---------------|
| Elements | DOM inspection | Cmd+Shift+C |
| Console | JS execution | Cmd+Option+J |
| Sources | Breakpoint debugging | Cmd+Option+S |
| Network | Request/response analysis | Cmd+Option+E |
| Performance | Performance profiling | Cmd+Shift+E |
| Application | Storage inspection | Cmd+Option+S |

### VSCode Debugger
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Next.js",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Tests",
      "program": "${workspaceFolder}/node_modules/jest/bin/jest.js",
      "args": ["--runInBand"],
      "env": {
        "NODE_ENV": "test"
      }
    }
  ]
}
```

### Logging Best Practices
```typescript
// Structured logging with context
interface LogContext {
  userId?: string;
  requestId?: string;
  component?: string;
  action?: string;
}

function createLogger(context: LogContext) {
  return {
    info: (message: string, data?: object) => {
      console.log(JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        ...context,
        message,
        ...data
      }));
    },
    error: (message: string, error: Error) => {
      console.error(JSON.stringify({
        level: 'error',
        timestamp: new Date().toISOString(),
        ...context,
        message,
        error: error.message,
        stack: error.stack
      }));
    }
  };
}

// Usage
const logger = createLogger({ 
  component: 'UserService',
  userId: user.id 
});

logger.info('User created', { email: user.email });
```

## 6. Debugging Checklist

### Pre-Debugging
- [ ] Can you reproduce the issue consistently?
- [ ] Do you have clear steps to reproduce?
- [ ] What is the expected behavior?
- [ ] What is the actual behavior?
- [ ] What environment are you using?

### During Debugging
- [ ] Have you isolated the failing component?
- [ ] Have you checked the console for errors?
- [ ] Have you checked network requests?
- [ ] Have you added logging?
- [ ] Have you used breakpoints?
- [ ] What changed recently?

### After Finding the Bug
- [ ] Do you understand the root cause?
- [ ] Is there a minimal fix?
- [ ] Have you tested the fix?
- [ ] Have you added regression tests?
- [ ] Have you documented the issue?

## 7. Debugging Templates

### Issue Report Template
```markdown
## Summary
Brief description of the issue

## Steps to Reproduce
1. Navigate to [URL]
2. Click on [Button]
3. Observe [Behavior]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.2.3]

## Screenshots/Logs
[Attach relevant screenshots or logs]

## Additional Context
[Any other relevant information]
```

### Debugging Log Template
```typescript
interface DebugLog {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  component: string;
  action: string;
  state?: object;
  input?: object;
  output?: object;
  error?: {
    message: string;
    stack?: string;
  };
}

// Usage
logDebug({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  component: 'OrderService',
  action: 'processOrder',
  state: { orderId, status },
  input: { orderData }
});