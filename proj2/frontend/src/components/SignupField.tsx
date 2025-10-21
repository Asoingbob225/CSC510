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

const signupSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(20, { message: 'Username must be at most 20 characters' })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: 'Username can only contain letters, numbers, underscores and hyphens',
    }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(48, { message: 'Password must be at most 48 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: 'Password must contain at least one special character',
    }),
});

function SignupField() {
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message || 'Registration successful! Please check your email.');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();

        // Handle FastAPI validation error format (always array for 422 errors)
        let errorMessage = 'Registration failed. Please try again.';

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
      <form id="signup-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldSet>
          <FieldGroup>
            <FieldLegend>
              <h2 className="text-2xl font-semibold">Sign Up to Eatsential</h2>
            </FieldLegend>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Username</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    type="text"
                    placeholder="your username"
                    {...field}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

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
                    placeholder="strong password"
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
              className="cursor-pointer bg-emerald-500 text-white shadow-md hover:bg-emerald-500/90 disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Field>
        </FieldSet>
      </form>
      <a href="/login" className="w-fit text-sm text-gray-600 hover:underline">
        <p className="mt-4">Already have an account? Log in</p>
      </a>
    </div>
  );
}

export default SignupField;
