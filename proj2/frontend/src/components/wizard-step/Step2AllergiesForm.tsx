import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLegend, FieldSet, FieldGroup, FieldLabel } from '@/components/ui/field';
import { getAllergens, type AllergenResponse } from '@/lib/api';

const allergiesSchema = z.object({
  allergies: z.array(
    z.object({
      allergen_id: z.string(),
      severity: z.enum(['mild', 'moderate', 'severe', 'life_threatening']),
      notes: z.string().optional(),
    })
  ),
});

export type AllergiesFormData = z.infer<typeof allergiesSchema>;

interface Step2AllergiesFormProps {
  onSubmit: (data: AllergiesFormData) => void;
  onPrevious: () => void;
  onSkip: () => void;
  isSubmitting: boolean;
}

export function Step2AllergiesForm({
  onSubmit,
  onPrevious,
  onSkip,
  isSubmitting,
}: Step2AllergiesFormProps) {
  const form = useForm<AllergiesFormData>({
    resolver: zodResolver(allergiesSchema),
    defaultValues: {
      allergies: [],
    },
  });

  const { data: allergens = [], isLoading: allergensLoading } = useQuery<AllergenResponse[]>({
    queryKey: ['allergens'],
    queryFn: getAllergens,
  });

  const [selectedAllergen, setSelectedAllergen] = useState('');
  const [allergySeverity, setAllergySeverity] = useState<
    'mild' | 'moderate' | 'severe' | 'life_threatening'
  >('moderate');
  const [allergyNotes, setAllergyNotes] = useState('');

  const addAllergyToList = () => {
    if (!selectedAllergen) return;
    const currentAllergies = form.getValues('allergies');
    form.setValue('allergies', [
      ...currentAllergies,
      {
        allergen_id: selectedAllergen,
        severity: allergySeverity,
        notes: allergyNotes || undefined,
      },
    ]);
    setSelectedAllergen('');
    setAllergySeverity('moderate');
    setAllergyNotes('');
  };

  const removeAllergyFromList = (index: number) => {
    const currentAllergies = form.getValues('allergies');
    form.setValue(
      'allergies',
      currentAllergies.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = (data: AllergiesFormData) => {
    if (data.allergies.length === 0) {
      onSkip();
    } else {
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldSet>
        <FieldGroup>
          <FieldLegend>
            <h2 className="text-2xl font-semibold">Food Allergies (Optional)</h2>
            <p className="mt-2 text-sm text-gray-600">
              Add any food allergies you have. You can skip this step if you don&apos;t have any
              allergies.
            </p>
          </FieldLegend>

          {allergensLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="ml-2 text-gray-600">Loading allergens...</span>
            </div>
          ) : (
            <>
              <div className="rounded-lg border bg-gray-50 p-4">
                <h3 className="mb-4 font-medium">Add an Allergy</h3>
                <div className="space-y-4">
                  <Field>
                    <FieldLabel>Select Allergen</FieldLabel>
                    <select
                      value={selectedAllergen}
                      onChange={(e) => setSelectedAllergen(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">-- Choose an allergen --</option>
                      {allergens.map((allergen) => (
                        <option key={allergen.id} value={allergen.id}>
                          {allergen.name} {allergen.is_major_allergen && '⚠️'} ({allergen.category})
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field>
                    <FieldLabel>Severity</FieldLabel>
                    <select
                      value={allergySeverity}
                      onChange={(e) => setAllergySeverity(e.target.value as typeof allergySeverity)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                      <option value="life_threatening">Life Threatening</option>
                    </select>
                  </Field>

                  <Field>
                    <FieldLabel>Notes (optional)</FieldLabel>
                    <Input
                      type="text"
                      value={allergyNotes}
                      onChange={(e) => setAllergyNotes(e.target.value)}
                      placeholder="e.g., Causes hives, difficulty breathing"
                    />
                  </Field>

                  <Button
                    type="button"
                    onClick={addAllergyToList}
                    disabled={!selectedAllergen}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Add Allergy to List
                  </Button>
                </div>
              </div>

              {form.watch('allergies').length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 font-semibold">
                    Your Allergies ({form.watch('allergies').length})
                  </h3>
                  <ul className="space-y-2">
                    {form.watch('allergies').map((allergy, index) => {
                      const allergenInfo = allergens.find((a) => a.id === allergy.allergen_id);
                      return (
                        <li
                          key={index}
                          className="flex items-center justify-between rounded bg-gray-50 p-3"
                        >
                          <div>
                            <div className="font-medium">{allergenInfo?.name}</div>
                            <div className="text-sm text-gray-600">
                              Severity: <span className="font-medium">{allergy.severity}</span>
                              {allergy.notes && <span> • {allergy.notes}</span>}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeAllergyFromList(index)}
                          >
                            Remove
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          )}
        </FieldGroup>

        <Field orientation="horizontal" className="flex justify-between border-t pt-6">
          <Button type="button" variant="outline" onClick={onPrevious}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onSkip}>
              Skip
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {form.watch('allergies').length > 0 ? 'Next' : 'Skip to Preferences'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </Field>
      </FieldSet>
    </form>
  );
}
