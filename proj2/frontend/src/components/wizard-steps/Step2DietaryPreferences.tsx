import { Controller, type Control } from 'react-hook-form';
import * as z from 'zod';
import { Select } from '@/components/ui/select';
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

interface Step2Props {
  control: Control<HealthProfileFormData, any>;
}

const DIETARY_PREFERENCES = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'keto', label: 'Ketogenic' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'low-carb', label: 'Low Carb' },
  { value: 'low-fat', label: 'Low Fat' },
  { value: 'gluten-free', label: 'Gluten Free' },
  { value: 'dairy-free', label: 'Dairy Free' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'whole30', label: 'Whole30' },
  { value: 'dash', label: 'DASH Diet' },
  { value: 'none', label: 'No Specific Preference' },
];

export function Step2DietaryPreferences({ control }: Step2Props) {
  return (
    <FieldSet>
      <FieldGroup>
        <FieldLegend>
          <h2 className="text-2xl font-semibold">Dietary Preferences</h2>
          <p className="text-sm text-gray-600 mt-1">
            Select your dietary preferences to get tailored meal recommendations
          </p>
        </FieldLegend>

        <Controller
          name="dietaryPreferences"
          control={control}
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-2">
                <FieldLabel>Dietary Preferences (Optional)</FieldLabel>
                <Tooltip content="Select all dietary patterns that apply to you. This helps us recommend suitable meals." />
              </div>
              <FieldDescription>
                Select multiple options if needed. You can change these later.
              </FieldDescription>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {DIETARY_PREFERENCES.map((pref) => (
                  <label
                    key={pref.value}
                    className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      value={pref.value}
                      checked={field.value?.includes(pref.value)}
                      onChange={(e) => {
                        const currentValue = field.value || [];
                        if (e.target.checked) {
                          field.onChange([...currentValue, pref.value]);
                        } else {
                          field.onChange(currentValue.filter((v) => v !== pref.value));
                        }
                      }}
                      className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm">{pref.label}</span>
                  </label>
                ))}
              </div>
            </Field>
          )}
        />

        <Controller
          name="cookingFrequency"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2">
                <FieldLabel>How often do you cook?</FieldLabel>
                <Tooltip content="This helps us recommend recipes that match your cooking habits." />
              </div>
              <Select aria-invalid={fieldState.invalid} {...field}>
                <option value="">Select frequency</option>
                <option value="daily">Daily</option>
                <option value="several-times-week">Several times a week</option>
                <option value="weekly">Once a week</option>
                <option value="occasionally">Occasionally</option>
                <option value="rarely">Rarely</option>
                <option value="never">Never</option>
              </Select>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      </FieldGroup>
    </FieldSet>
  );
}
