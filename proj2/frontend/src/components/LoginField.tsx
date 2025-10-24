import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TriangleAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldLegend,
  FieldSet,
  FieldGroup,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Alert, AlertTitle } from './ui/alert';
import { setAuthToken } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

function LoginField() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();

        // Save JWT token
        if (result.access_token) {
          setAuthToken(result.access_token);
        }

        setSuccess(result.message || 'Login successful!');

        if (result.has_completed_wizard) {
          // Redirect to dashboard after 1 second
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
          return;
        }

        // Redirect to health profile wizard after 1 second
        setTimeout(() => {
          navigate('/health-profile');
        }, 1000);
      } else {
        const errorData = await response.json();

        // Handle FastAPI validation error format (always array for 422 errors)
        let errorMessage = 'Login failed. Please try again.';

        if (Array.isArray(errorData.detail)) {
          // Extract error messages from validation error array
          errorMessage = errorData.detail
            .map((err: { msg?: string; message?: string }) => err.msg || err.message)
            .filter(Boolean)
            .join(', ');
        } else if (typeof errorData.detail === 'string') {
          // Fallback for simple string errors
          errorMessage = errorData.detail;
        }

        setError(errorMessage);
      }
    } catch {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldSet>
          <FieldGroup>
            <FieldLegend>
              <h2 className="text-2xl font-semibold">Log In to Eatsential</h2>
            </FieldLegend>

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    type="email"
                    placeholder="e.g. user@example.com"
                    {...field}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    type="password"
                    placeholder="your password"
                    {...field}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>

          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{success}</div>
          )}
          {error && (
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}

          <Field orientation="horizontal">
            <Button
              className="w-full cursor-pointer bg-emerald-500 text-white shadow-md hover:bg-emerald-500/90 disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={isSubmitting}
            >
              Log in
            </Button>
          </Field>
        </FieldSet>
      </form>
      <a href="/signup" className="w-fit text-sm text-gray-600 hover:underline">
        <p className="mt-4">Don&apos;t have an account? Sign up</p>
      </a>
    </div>
  );
}

export default LoginField;
