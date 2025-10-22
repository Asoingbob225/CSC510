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

### Form Component Pattern (Actual Implementation)

```typescript
// Example from SignupField.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const signupSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(20, { message: 'Username must be at most 20 characters' }),
  email: z.email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(48, { message: 'Password must be at most 48 characters' })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      { message: 'Password must contain uppercase, lowercase, number and special character' }
    ),
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupField = () => {
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      // Navigate to verification page
    } catch (error) {
      // Error handling
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields using shadcn/ui components */}
      </form>
    </Form>
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

### Global State (Planned)

```typescript
// Currently using local state only
// AuthContext planned for future implementation
// For now, authentication state is managed per-component

// Example from current implementation:
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

## API Integration

### Service Layer Pattern

```typescript
// Current API pattern (no separate service layer yet)
const API_BASE = '/api';

// Direct fetch calls in components
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

### API Error Handling Pattern

```typescript
// Example from VerifyEmail.tsx
useEffect(() => {
  const verifyEmail = async () => {
    if (!token) {
      setError('Invalid verification link');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/verify-email/${token}`);
      const data = await response.json();

      if (response.ok) {
        setIsVerified(true);
        setMessage(data.message || 'Email verified successfully!');
      } else {
        setError(data.detail || 'Verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  verifyEmail();
}, [token]);
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

### Form Error Display (Actual Implementation)

```typescript
// From SignupField.tsx using shadcn/ui FormMessage
<FormField
  control={form.control}
  name="password"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Password</FormLabel>
      <FormControl>
        <Input type="password" {...field} />
      </FormControl>
      <FormMessage />  {/* Automatically displays field errors */}
    </FormItem>
  )}
/>
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
