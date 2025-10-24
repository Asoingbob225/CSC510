import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Loader2 } from 'lucide-react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLegend, FieldSet, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const preferencesSchema = z.object({
  preferences: z.array(
    z.object({
      preference_type: z.enum(['diet', 'cuisine', 'ingredient', 'preparation']),
      preference_name: z.string().min(1, 'Preference name is required'),
      is_strict: z.boolean(),
      notes: z.string().optional(),
    })
  ),
});

export type PreferencesFormData = z.infer<typeof preferencesSchema>;

interface Step3PreferencesFormProps {
  onSubmit: (data: PreferencesFormData) => void;
  onPrevious: () => void;
  onSkip: () => void;
  isSubmitting: boolean;
}

export function Step3PreferencesForm({
  onSubmit,
  onPrevious,
  onSkip,
  isSubmitting,
}: Step3PreferencesFormProps) {
  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferences: [],
    },
  });

  // Temporary state for adding preferences
  const [prefType, setPrefType] = useState<'diet' | 'cuisine' | 'ingredient' | 'preparation'>(
    'diet'
  );
  const [prefName, setPrefName] = useState('');
  const [prefStrict, setPrefStrict] = useState(true);
  const [prefNotes, setPrefNotes] = useState('');

  const addPreferenceToList = () => {
    if (!prefName.trim()) return;
    const currentPrefs = form.getValues('preferences');
    form.setValue('preferences', [
      ...currentPrefs,
      {
        preference_type: prefType,
        preference_name: prefName.trim(),
        is_strict: prefStrict,
        notes: prefNotes || undefined,
      },
    ]);
    // Reset form
    setPrefName('');
    setPrefNotes('');
  };

  const removePreferenceFromList = (index: number) => {
    const currentPrefs = form.getValues('preferences');
    form.setValue(
      'preferences',
      currentPrefs.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = (data: PreferencesFormData) => {
    // If no preferences, skip to dashboard
    if (data.preferences.length === 0) {
      onSkip();
    } else {
      onSubmit(data);
    }
  };

  const preferenceTypeLabels = {
    diet: 'Diet Type (e.g., Vegetarian, Vegan, Keto)',
    cuisine: 'Cuisine Preference (e.g., Italian, Chinese, Mexican)',
    ingredient: 'Ingredient Preference (e.g., Organic, Local, Seasonal)',
    preparation: 'Preparation Method (e.g., Grilled, Steamed, Raw)',
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldSet>
        <FieldGroup>
          <FieldLegend>
            <h2 className="text-2xl font-semibold">Dietary Preferences (Optional)</h2>
            <p className="mt-2 text-sm text-gray-600">
              Add your dietary preferences to personalize your nutrition recommendations. You can
              skip this step if you don&apos;t have specific preferences.
            </p>
          </FieldLegend>

          {/* Add Preference Form */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-4 font-medium">Add a Preference</h3>
            <div className="space-y-4">
              <Field>
                <FieldLabel>Preference Type</FieldLabel>
                <Select
                  value={prefType}
                  onValueChange={(value) => setPrefType(value as typeof prefType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diet">Diet Type</SelectItem>
                    <SelectItem value="cuisine">Cuisine</SelectItem>
                    <SelectItem value="ingredient">Ingredient</SelectItem>
                    <SelectItem value="preparation">Preparation Method</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-gray-500">{preferenceTypeLabels[prefType]}</p>
              </Field>

              <Field>
                <FieldLabel>Preference Name</FieldLabel>
                <Input
                  type="text"
                  value={prefName}
                  onChange={(e) => setPrefName(e.target.value)}
                  placeholder="e.g., Vegetarian, Italian, Organic"
                />
              </Field>

              <Field>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={prefStrict}
                    onChange={(e) => setPrefStrict(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium">
                    Strict preference (must be followed in all recommendations)
                  </span>
                </label>
              </Field>

              <Field>
                <FieldLabel>Notes (optional)</FieldLabel>
                <Input
                  type="text"
                  value={prefNotes}
                  onChange={(e) => setPrefNotes(e.target.value)}
                  placeholder="Additional details about this preference"
                />
              </Field>

              <Button
                type="button"
                onClick={addPreferenceToList}
                disabled={!prefName.trim()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Add Preference to List
              </Button>
            </div>
          </div>

          {/* Display selected preferences */}
          {form.watch('preferences').length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold">
                Your Preferences ({form.watch('preferences').length})
              </h3>
              <ul className="space-y-2">
                {form.watch('preferences').map((pref, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between rounded bg-gray-50 p-3"
                  >
                    <div>
                      <div className="font-medium">
                        {pref.preference_name}
                        {pref.is_strict && (
                          <span className="ml-2 text-sm text-emerald-600">✓ Strict</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Type: <span className="font-medium capitalize">{pref.preference_type}</span>
                        {pref.notes && <span> • {pref.notes}</span>}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removePreferenceFromList(index)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </FieldGroup>

        <Field orientation="horizontal" className="flex justify-between border-t pt-6">
          <Button type="button" variant="outline" onClick={onPrevious}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onSkip}>
              Skip to Dashboard
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>{form.watch('preferences').length > 0 ? 'Complete Setup' : 'Go to Dashboard'}</>
              )}
            </Button>
          </div>
        </Field>
      </FieldSet>
    </form>
  );
}
