import { Controller, type Control } from 'react-hook-form';
import * as z from 'zod';
import { Tooltip } from '@/components/ui/tooltip';
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldDescription,
} from '@/components/ui/field';
import { healthProfileSchema } from '@/lib/healthProfileSchema';

type HealthProfileFormData = z.infer<typeof healthProfileSchema>;

interface Step5Props {
  control: Control<HealthProfileFormData>;
}

export function Step5MedicalInfo({ control }: Step5Props) {
  return (
    <FieldSet>
      <FieldGroup>
        <FieldLegend>
          <h2 className="text-2xl font-semibold">Medical Information</h2>
          <p className="mt-1 text-sm text-gray-600">
            Optional information to help us provide safer recommendations
          </p>
        </FieldLegend>

        <FieldDescription>
          This information is optional but helps us provide more accurate and safe recommendations.
          All data is kept confidential and secure.
        </FieldDescription>

        <Controller
          name="medicalConditions"
          control={control}
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-2">
                <FieldLabel>Medical Conditions (Optional)</FieldLabel>
                <Tooltip content="List any medical conditions that might affect your nutrition needs (e.g., diabetes, hypertension, thyroid issues)." />
              </div>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="List any medical conditions that affect your nutrition needs..."
                {...field}
              />
            </Field>
          )}
        />

        <Controller
          name="medications"
          control={control}
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-2">
                <FieldLabel>Current Medications (Optional)</FieldLabel>
                <Tooltip content="List medications you're taking, as some can interact with certain foods or nutrients." />
              </div>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="List any medications you're currently taking..."
                {...field}
              />
            </Field>
          )}
        />

        <Controller
          name="supplements"
          control={control}
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-2">
                <FieldLabel>Supplements (Optional)</FieldLabel>
                <Tooltip content="List any vitamins, minerals, or other supplements you're currently taking." />
              </div>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="List any supplements you're currently taking..."
                {...field}
              />
            </Field>
          )}
        />

        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm">
          <p className="mb-1 font-medium text-blue-900">Important Note</p>
          <p className="text-blue-800">
            This tool provides general nutrition guidance. Always consult with a healthcare
            professional before making significant dietary changes, especially if you have medical
            conditions or take medications.
          </p>
        </div>
      </FieldGroup>
    </FieldSet>
  );
}
