import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, Loader2 } from 'lucide-react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldLegend,
  FieldSet,
  FieldGroup,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';

const profileSchema = z.object({
  height_cm: z
    .number()
    .min(50, { message: 'Height must be at least 50cm' })
    .max(300, { message: 'Height must be less than 300cm' }),
  weight_kg: z
    .number()
    .min(20, { message: 'Weight must be at least 20kg' })
    .max(500, { message: 'Weight must be less than 500kg' }),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

interface Step1ProfileFormProps {
  onSubmit: (data: ProfileFormData) => void;
  isSubmitting: boolean;
}

export function Step1ProfileForm({ onSubmit, isSubmitting }: Step1ProfileFormProps) {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      height_cm: 170,
      weight_kg: 70,
      activity_level: 'moderate',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet>
        <FieldGroup>
          <FieldLegend>
            <h2 className="text-2xl font-semibold">Basic Health Information</h2>
            <p className="mt-2 text-sm text-gray-600">
              This information is required to create your health profile.
            </p>
          </FieldLegend>

          <Controller
            name="height_cm"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Height (cm) *</FieldLabel>
                <Input
                  aria-invalid={fieldState.invalid}
                  type="number"
                  step="0.1"
                  placeholder="170"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            name="weight_kg"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Weight (kg) *</FieldLabel>
                <Input
                  aria-invalid={fieldState.invalid}
                  type="number"
                  step="0.1"
                  placeholder="70"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            name="activity_level"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Activity Level *</FieldLabel>
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="light">Light (exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                  <option value="active">Active (exercise 6-7 days/week)</option>
                  <option value="very_active">
                    Very Active (physical job or training twice/day)
                  </option>
                </select>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        </FieldGroup>

        <Field orientation="horizontal" className="border-t pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer bg-emerald-500 text-white shadow-md hover:bg-emerald-500/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </Field>
      </FieldSet>
    </form>
  );
}
