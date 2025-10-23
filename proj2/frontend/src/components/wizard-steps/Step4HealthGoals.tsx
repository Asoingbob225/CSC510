import { Controller, type Control } from 'react-hook-form';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldDescription,
} from '@/components/ui/field';
import { healthProfileSchema } from '@/lib/healthProfileSchema';

type HealthProfileFormData = z.infer<typeof healthProfileSchema>;

interface Step4Props {
  control: Control<HealthProfileFormData, any>;
}

const HEALTH_GOALS = [
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'muscle-gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintain Current Weight' },
  { value: 'improve-energy', label: 'Improve Energy Levels' },
  { value: 'better-sleep', label: 'Better Sleep' },
  { value: 'reduce-inflammation', label: 'Reduce Inflammation' },
  { value: 'improve-digestion', label: 'Improve Digestion' },
  { value: 'heart-health', label: 'Heart Health' },
  { value: 'diabetes-management', label: 'Diabetes Management' },
  { value: 'athletic-performance', label: 'Athletic Performance' },
];

export function Step4HealthGoals({ control }: Step4Props) {
  return (
    <FieldSet>
      <FieldGroup>
        <FieldLegend>
          <h2 className="text-2xl font-semibold">Health Goals</h2>
          <p className="text-sm text-gray-600 mt-1">
            What would you like to achieve with your nutrition plan?
          </p>
        </FieldLegend>

        <Controller
          name="healthGoals"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2">
                <FieldLabel>Select Your Health Goals</FieldLabel>
                <Tooltip content="Choose one or more health goals that are important to you. We'll tailor recommendations accordingly." />
              </div>
              <FieldDescription>Select at least one goal that matters to you.</FieldDescription>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {HEALTH_GOALS.map((goal) => (
                  <label
                    key={goal.value}
                    className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      value={goal.value}
                      checked={field.value?.includes(goal.value)}
                      onChange={(e) => {
                        const currentValue = field.value || [];
                        if (e.target.checked) {
                          field.onChange([...currentValue, goal.value]);
                        } else {
                          field.onChange(currentValue.filter((v) => v !== goal.value));
                        }
                      }}
                      className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm">{goal.label}</span>
                  </label>
                ))}
              </div>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <Controller
          name="targetWeight"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2">
                <FieldLabel>Target Weight (Optional)</FieldLabel>
                <Tooltip content="If your goal involves weight change, enter your target weight in pounds." />
              </div>
              <Input
                aria-invalid={fieldState.invalid}
                type="number"
                placeholder="e.g., 140"
                min="50"
                max="500"
                {...field}
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <Controller
          name="timeframe"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2">
                <FieldLabel>Timeframe (Optional)</FieldLabel>
                <Tooltip content="How long do you plan to work towards your goals? This helps us set realistic expectations." />
              </div>
              <Input
                aria-invalid={fieldState.invalid}
                type="text"
                placeholder="e.g., 3 months, 6 months, 1 year"
                {...field}
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      </FieldGroup>
    </FieldSet>
  );
}
