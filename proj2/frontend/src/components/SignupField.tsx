import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
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

const signupSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(20, { message: 'Username must be at most 20 characters' }),
  email: z.email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(48, { message: 'Password must be at most 48 characters' }),
});

function SignupField() {
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
  });

  // TODO: Implement signup logic with backend
  const onSubmit = (data: z.infer<typeof signupSchema>) => {
    console.log(data);
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
          <Field orientation="horizontal">
            <Button
              className="cursor-pointer bg-emerald-500 text-white shadow-md hover:bg-emerald-500/90"
              type="submit"
            >
              Create Account
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
