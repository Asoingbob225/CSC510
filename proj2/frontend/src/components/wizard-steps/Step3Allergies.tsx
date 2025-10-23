import { useFieldArray, type Control, useFormState } from 'react-hook-form';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Plus, Trash2 } from 'lucide-react';
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

interface Step3Props {
  control: Control<HealthProfileFormData, any>;
}

export function Step3Allergies({ control }: Step3Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'allergies',
  });

  const { errors } = useFormState({ control });

  return (
    <FieldSet>
      <FieldGroup>
        <FieldLegend>
          <h2 className="text-2xl font-semibold">Allergies & Intolerances</h2>
          <p className="text-sm text-gray-600 mt-1">
            Help us keep you safe by listing any food allergies or intolerances
          </p>
        </FieldLegend>

        <FieldDescription>
          Add any food allergies or intolerances. You can add multiple items and specify the
          severity for each.
        </FieldDescription>

        {fields.length === 0 && (
          <div className="text-sm text-gray-500 italic p-4 border border-dashed rounded-md">
            No allergies added yet. Click "Add Allergy" to get started.
          </div>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-md p-4 space-y-4">
            <div className="flex items-start justify-between">
              <h4 className="font-medium">Allergy #{index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <Field data-invalid={!!errors.allergies?.[index]?.allergen}>
              <div className="flex items-center gap-2">
                <FieldLabel>Allergen</FieldLabel>
                <Tooltip content="Enter the name of the food or ingredient you're allergic to (e.g., peanuts, shellfish, milk)." />
              </div>
              <Input
                aria-invalid={!!errors.allergies?.[index]?.allergen}
                placeholder="e.g., Peanuts, Shellfish, Dairy"
                {...control.register(`allergies.${index}.allergen`)}
              />
              <FieldError>{errors.allergies?.[index]?.allergen?.message}</FieldError>
            </Field>

            <Field data-invalid={!!errors.allergies?.[index]?.severity}>
              <div className="flex items-center gap-2">
                <FieldLabel>Severity</FieldLabel>
                <Tooltip content="Select how severe your reaction is to help us prioritize safety warnings." />
              </div>
              <Select
                aria-invalid={!!errors.allergies?.[index]?.severity}
                {...control.register(`allergies.${index}.severity`)}
              >
                <option value="">Select severity</option>
                <option value="mild">Mild (minor discomfort)</option>
                <option value="moderate">Moderate (noticeable symptoms)</option>
                <option value="severe">Severe (significant reaction)</option>
                <option value="life-threatening">Life-threatening (anaphylaxis risk)</option>
              </Select>
              <FieldError>{errors.allergies?.[index]?.severity?.message}</FieldError>
            </Field>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ allergen: '', severity: 'mild' })}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Allergy
        </Button>
      </FieldGroup>
    </FieldSet>
  );
}
