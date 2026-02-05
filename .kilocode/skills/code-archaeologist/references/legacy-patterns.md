# Legacy Code Patterns and Modernization Strategies

## Common Legacy Patterns

### 1. Callback Hell
```javascript
// Legacy Pattern
function getUserData(userId, callback) {
  getUser(userId, function(err, user) {
    if (err) return callback(err);
    getOrders(user.id, function(err, orders) {
      if (err) return callback(err);
      getProducts(orders, function(err, products) {
        callback(null, { user, orders, products });
      });
    });
  });
}

// Modern Pattern (Promise)
async function getUserData(userId) {
  const user = await getUser(userId);
  const orders = await getOrders(user.id);
  const products = await getProducts(orders);
  return { user, orders, products };
}

// Modern Pattern (Observable)
function getUserData(userId) {
  return from(getUser(userId)).pipe(
    switchMap(user => from(getOrders(user.id))),
    switchMap(orders => from(getProducts(orders)))
  );
}
```

### 2. Class Components to Functional Components
```jsx
// Legacy Class Component
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true,
      error: null
    };
  }
  
  componentDidMount() {
    this.fetchUser();
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser();
    }
  }
  
  async fetchUser() {
    try {
      const response = await fetch(`/api/users/${this.props.userId}`);
      const user = await response.json();
      this.setState({ user, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }
  
  render() {
    const { user, loading, error } = this.state;
    if (loading) return <Loading />;
    if (error) return <Error error={error} />;
    return <UserCard user={user} />;
  }
}

// Modern Functional Component with Hooks
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);
  
  if (loading) return <Loading />;
  if (error) return <Error error={error} />;
  return <UserCard user={user} />;
}
```

### 3. Global State Abuse
```javascript
// Legacy - Global State
let globalUser = null;
let globalConfig = {};

function setGlobalUser(user) {
  globalUser = user;
}

function getGlobalUser() {
  return globalUser;
}

// Module Pattern with Closure
const userModule = (function() {
  let currentUser = null;
  
  return {
    setUser(user) {
      currentUser = user;
    },
    getUser() {
      return currentUser;
    },
    isAuthenticated() {
      return currentUser !== null;
    }
  };
})();

// Modern Pattern - State Management Library
// Using Redux Toolkit
const userSlice = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    setUser: (state, action) => action.payload,
    clearUser: () => null
  }
});

// Using Zustand
const useUserStore = create(set => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null })
}));
```

### 4. Magic Numbers and Strings
```javascript
// Legacy
if (status === 1) {
  // processing
} else if (status === 2) {
  // completed
} else if (status === 3) {
  // failed
}

// Modern - Constants
const ORDER_STATUS = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

if (status === ORDER_STATUS.PROCESSING) {
  // processing
}

// Modern - TypeScript Enums
enum OrderStatus {
  Processing = 'PROCESSING',
  Completed = 'COMPLETED',
  Failed = 'FAILED'
}

// Modern - TypeScript Literal Types
type OrderStatus = 'processing' | 'completed' | 'failed';
```

### 5. Callback-based APIs to Async/Await
```javascript
// Legacy - Callback-based
function getData(id, callback) {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
}

// Modern - Promise-based
function getData(id) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
}

// Modern - Using util.promisify
const getData = promisify(db.query.bind(db));

// Modern - Async/Await with error handling
async function getUserData(id) {
  try {
    const results = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return results[0];
  } catch (error) {
    logger.error('Failed to fetch user', { id, error });
    throw new UserNotFoundError(id);
  }
}
```

### 6. jQuery to Modern DOM Manipulation
```javascript
// Legacy jQuery
$('.btn-submit').on('click', function(e) {
  e.preventDefault();
  const formData = $(this).closest('form').serialize();
  $.ajax({
    url: '/api/submit',
    method: 'POST',
    data: formData,
    success: function(response) {
      $('.result').html(response);
    },
    error: function(xhr) {
      $('.error').text(xhr.responseJSON.message);
    }
  });
});

// Modern Vanilla JS
document.querySelector('.btn-submit')?.addEventListener('click', async (e) => {
  e.preventDefault();
  const form = e.target.closest('form');
  const formData = new FormData(form);
  
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Submission failed');
    
    const result = await response.text();
    document.querySelector('.result').innerHTML = result;
  } catch (error) {
    document.querySelector('.error').textContent = error.message;
  }
});

// Modern with Form Ref (React)
function SubmitForm() {
  const formRef = useRef();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.text();
    // Update state...
  };
  
  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### 7. Synchronous XHR to Fetch API
```javascript
// Legacy Synchronous XHR
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data', false);  // synchronous!
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send();

if (xhr.status === 200) {
  const data = JSON.parse(xhr.responseText);
  processData(data);
}

// Modern Fetch API
async function fetchData() {
  const response = await fetch('/api/data', {
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'  // for cookies
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  processData(data);
}
```

### 8. Python 2 to Python 3
```python
# Python 2
#!/usr/bin/python
# -*- coding: utf-8 -*-
import sys
import urllib

def get_data(url):
    response = urllib.urlopen(url)
    return response.read()

print get_data("http://example.com")

# Python 3
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import urllib.request

def get_data(url: str) -> bytes:
    with urllib.request.urlopen(url) as response:
        return response.read()

print(get_data("http://example.com").decode('utf-8'))

# Python 3 with type hints
from typing import Optional
import urllib.request
from urllib.error import URLError

def get_data(url: str) -> Optional[str]:
    try:
        with urllib.request.urlopen(url) as response:
            return response.read().decode('utf-8')
    except URLError as e:
        print(f"Error fetching {url}: {e}")
        return None
```

### 9. Legacy AngularJS to Angular
```typescript
// AngularJS (1.x) Controller
angular.module('app').controller('UserController', [
  '$scope', '$http', '$routeParams',
  function($scope, $http, $routeParams) {
    $scope.loading = true;
    $scope.user = null;
    
    $http.get('/api/users/' + $routeParams.id)
      .then(function(response) {
        $scope.user = response.data;
        $scope.loading = false;
      })
      .catch(function(error) {
        $scope.error = error;
        $scope.loading = false;
      });
    
    $scope.save = function() {
      $http.put('/api/users/' + $scope.user.id, $scope.user)
        .then(function() {
          alert('Saved!');
        });
    };
  }
]);

// Modern Angular (16+) Standalone Component
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="error" class="error">{{ error }}</div>
    <div *ngIf="user">
      <h1>{{ user.name }}</h1>
      <button (click)="save()">Save</button>
    </div>
  `
})
class UserComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  
  loading = true;
  error: string | null = null;
  user: User | null = null;
  
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadUser(id!);
  }
  
  private loadUser(id: string) {
    this.http.get<User>(`/api/users/${id}`)
      .subscribe({
        next: (user) => {
          this.user = user;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message;
          this.loading = false;
        }
      });
  }
  
  save() {
    this.http.put(`/api/users/${this.user!.id}`, this.user)
      .subscribe(() => alert('Saved!'));
  }
}
```

### 10. Legacy Error Handling
```javascript
// Legacy - Error handling with callbacks
function legacyAsyncOperation(param, callback) {
  if (!param) {
    callback(new Error('Parameter required'));
    return;
  }
  
  someAsyncCall(param, function(err, result) {
    if (err) {
      callback(err);
      return;
    }
    
    anotherAsyncCall(result, function(err, final) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, final);
    });
  });
}

// Modern - Promise with async/await
async function modernAsyncOperation(param: string): Promise<Result> {
  if (!param) {
    throw new Error('Parameter required');
  }
  
  const result = await someAsyncCall(param);
  const final = await anotherAsyncCall(result);
  return final;
}

// Modern - Result type for better error handling
type Result<T> = 
  | { ok: true; value: T }
  | { ok: false; error: Error };

async function safeAsyncOperation(param: string): Promise<Result<string>> {
  try {
    const result = await someAsyncCall(param);
    return { ok: true, value: result };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}

// Usage
const result = await safeAsyncOperation('test');
if (result.ok) {
  console.log('Success:', result.value);
} else {
  console.error('Failed:', result.error.message);
}
```

## Migration Checklist

1. [ ] Identify all external dependencies
2. [ ] Map data flow and side effects
3. [ ] Create characterization tests (Golden Master)
4. [ ] Set up compatibility layer if needed
5. [ ] Plan incremental migration strategy
6. [ ] Define success criteria
7. [ ] Prepare rollback plan
8. [ ] Document all breaking changes
9. [ ] Update documentation
10. [ ] Train team on new patterns