# Frontend Patterns

## Component Structure

### Basic Component Template

```typescript
import { FC } from 'react';

interface ComponentNameProps {
  prop1: string;
  prop2?: number;
}

const ComponentName: FC<ComponentNameProps> = ({ prop1, prop2 = 0 }) => {
  // Hooks at the top
  const [state, setState] = useState<string>('');

  // Event handlers
  const handleClick = () => {
    // Logic here
  };

  // Render
  return (
    <div className="component-name">
      {/* JSX here */}
    </div>
  );
};

export default ComponentName;
```

### Form Component Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  field: z.string().min(1, 'Required'),
});

type FormData = z.infer<typeof schema>;

const FormComponent = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // API call
    } catch (error) {
      // Error handling
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

## State Management

### Local State

```typescript
// For component-specific state
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Global State (Context)

```typescript
// contexts/AuthContext.tsx
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

## API Integration

### Service Layer Pattern

```typescript
// services/api.ts
const API_BASE = '/api/v1';

export const api = {
  auth: {
    register: async (data: RegisterData) => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Registration failed');
      return response.json();
    },
  },
};
```

### Custom Hook for API

```typescript
// hooks/useApi.ts
export const useApi = <T>(apiCall: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
```

## Testing Patterns

### Component Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName prop1="test" />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<ComponentName prop1="test" />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('updated text')).toBeInTheDocument();
    });
  });
});
```

## Styling Patterns

### Tailwind Classes

```typescript
// Conditional classes
const buttonClass = cn(
  'px-4 py-2 rounded font-medium transition-colors',
  {
    'bg-blue-500 hover:bg-blue-600 text-white': variant === 'primary',
    'bg-gray-200 hover:bg-gray-300 text-gray-800': variant === 'secondary',
    'opacity-50 cursor-not-allowed': disabled,
  }
);

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## Error Handling

### Error Boundary

```typescript
class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Form Error Display

```typescript
{form.formState.errors.field && (
  <p className="text-red-500 text-sm mt-1">
    {form.formState.errors.field.message}
  </p>
)}
```

## Performance Patterns

### Memoization

```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(props.data);
}, [props.data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
const MemoizedComponent = memo(ExpensiveComponent);
```

### Code Splitting

```typescript
// Lazy load routes
const HealthProfile = lazy(() => import('./pages/HealthProfile'));

// Use with Suspense
<Suspense fallback={<Loading />}>
  <HealthProfile />
</Suspense>
```

## Accessibility

### ARIA Labels

```typescript
<button
  aria-label="Delete allergy"
  aria-describedby="delete-warning"
  onClick={handleDelete}
>
  <TrashIcon />
</button>

<div role="alert" aria-live="polite">
  {error && <p>{error}</p>}
</div>
```

### Keyboard Navigation

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleAction();
  }
};
```

---

**Examples in codebase**:

- `SignupField.tsx` - Form handling
- `Button.tsx` - Component pattern
- `App.tsx` - Routing setup
