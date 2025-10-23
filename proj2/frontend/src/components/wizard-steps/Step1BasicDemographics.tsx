import { Controller, type Control } from 'react-hook-form';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tooltip } from '@/components/ui/tooltip';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { healthProfileSchema } from '@/lib/healthProfileSchema';

type HealthProfileFormData = z.infer<typeof healthProfileSchema>;

interface Step1Props {
  control: Control<HealthProfileFormData>;
}

export function Step1BasicDemographics({ control }: Step1Props) {
  return (
    <FieldSet>
      <FieldGroup>
        <FieldLegend>
          <h2 className="text-2xl font-semibold">Basic Demographics</h2>
          <p className="mt-1 text-sm text-gray-600">
            Tell us about yourself to get personalized recommendations
          </p>
        </FieldLegend>

        <Controller
          name="age"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2">
                <FieldLabel>Age</FieldLabel>
                <Tooltip content="Your age helps us calculate your basal metabolic rate and nutritional needs." />
              </div>
              <Input
                aria-invalid={fieldState.invalid}
                type="number"
                placeholder="e.g., 25"
                min="13"
                max="120"
                {...field}
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <Controller
          name="gender"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2">
                <FieldLabel>Gender</FieldLabel>
                <Tooltip content="Gender affects metabolic rate and nutritional requirements." />
              </div>
              <Select aria-invalid={fieldState.invalid} {...field}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </Select>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="heightFeet"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Height (feet)</FieldLabel>
                <Input
                  aria-invalid={fieldState.invalid}
                  type="number"
                  placeholder="e.g., 5"
                  min="3"
                  max="8"
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            name="heightInches"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Height (inches)</FieldLabel>
                <Input
                  aria-invalid={fieldState.invalid}
                  type="number"
                  placeholder="e.g., 8"
                  min="0"
                  max="11"
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        </div>

        <Controller
          name="weight"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2">
                <FieldLabel>Weight (lbs)</FieldLabel>
                <Tooltip content="Your current weight is used to calculate caloric needs and track progress." />
              </div>
              <Input
                aria-invalid={fieldState.invalid}
                type="number"
                placeholder="e.g., 150"
                min="50"
                max="500"
                {...field}
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <Controller
          name="activityLevel"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2">
                <FieldLabel>Activity Level</FieldLabel>
                <Tooltip content="Your activity level helps us estimate your daily caloric expenditure." />
              </div>
              <Select aria-invalid={fieldState.invalid} {...field}>
                <option value="">Select activity level</option>
                <option value="sedentary">Sedentary (little to no exercise)</option>
                <option value="light">Lightly Active (1-3 days/week)</option>
                <option value="moderate">Moderately Active (3-5 days/week)</option>
                <option value="very">Very Active (6-7 days/week)</option>
                <option value="extreme">Extremely Active (athlete, physical job)</option>
              </Select>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      </FieldGroup>
    </FieldSet>
  );
}
