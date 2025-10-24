import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Utensils, X } from 'lucide-react';
import { InfoCard, ListItemCard } from '@/components/profile';
import { healthProfileApi, type HealthProfile, type PreferenceType } from '@/lib/api';

// Preference type display
const preferenceTypeLabels: Record<string, string> = {
  diet: 'Diet',
  cuisine: 'Cuisine',
  ingredient: 'Ingredient',
  preparation: 'Preparation',
};

// Dietary preference form schema
const preferenceSchema = z.object({
  preference_type: z.string().min(1, 'Please select a preference type'),
  preference_name: z.string().min(1, 'Please enter a preference name'),
  is_strict: z.boolean().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type PreferenceFormData = z.infer<typeof preferenceSchema>;

interface DietaryPreferencesCardProps {
  healthProfile: HealthProfile | null;
  onUpdate: (updatedProfile: HealthProfile) => void;
}

export function DietaryPreferencesCard({ healthProfile, onUpdate }: DietaryPreferencesCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with react-hook-form + zod
  const form = useForm<PreferenceFormData>({
    resolver: zodResolver(preferenceSchema),
    defaultValues: {
      preference_type: 'diet',
      preference_name: '',
      is_strict: false,
      reason: '',
      notes: '',
    },
  });

  // Open dialog and reset form
  const handleOpenDialog = () => {
    form.reset({
      preference_type: 'diet',
      preference_name: '',
      is_strict: false,
      reason: '',
      notes: '',
    });
    setError(null);
    setIsDialogOpen(true);
  };

  // Add new dietary preference
  const onSubmit = async (formData: PreferenceFormData) => {
    try {
      setError(null);

      const data: {
        preference_type: PreferenceType;
        preference_name: string;
        is_strict?: boolean;
        reason?: string;
        notes?: string;
      } = {
        preference_type: formData.preference_type as PreferenceType,
        preference_name: formData.preference_name.trim(),
      };

      if (formData.is_strict) data.is_strict = formData.is_strict;
      if (formData.reason) data.reason = formData.reason;
      if (formData.notes) data.notes = formData.notes;

      await healthProfileApi.addDietaryPreference(data);

      // Reload profile to get updated preferences list
      const response = await healthProfileApi.getProfile();
      onUpdate(response.data);
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error adding dietary preference:', err);
      setError('Failed to add dietary preference. Please try again.');
    }
  };

  // Delete dietary preference
  const handleDeletePreference = async (preferenceId: string) => {
    try {
      await healthProfileApi.deleteDietaryPreference(preferenceId);

      // Reload profile to get updated preferences list
      const response = await healthProfileApi.getProfile();
      onUpdate(response.data);
    } catch (err) {
      console.error('Error deleting dietary preference:', err);
    }
  };

  return (
    <>
      <InfoCard icon={Utensils} title="Dietary Preferences" onEdit={handleOpenDialog}>
        {healthProfile?.dietary_preferences && healthProfile.dietary_preferences.length > 0 ? (
          <div className="space-y-3">
            {healthProfile.dietary_preferences.map((pref) => {
              const details = [];
              if (pref.reason) {
                details.push({ label: 'Reason', value: pref.reason });
              }

              const badges = [
                <span
                  key="type"
                  className="rounded-full bg-green-200 px-3 py-1 text-xs font-medium text-green-800"
                >
                  {preferenceTypeLabels[pref.preference_type] || pref.preference_type}
                </span>,
              ];

              if (pref.is_strict) {
                badges.push(
                  <span
                    key="strict"
                    className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800"
                  >
                    Strict
                  </span>
                );
              }

              return (
                <div key={pref.id} className="group relative">
                  <ListItemCard
                    title={pref.preference_name}
                    badges={badges}
                    details={details}
                    notes={pref.notes}
                    variant="compact"
                  />
                  <button
                    onClick={() => handleDeletePreference(pref.id)}
                    className="absolute top-2 right-2 rounded-full p-1 text-red-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100"
                    title="Delete preference"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-gray-50 p-8 text-center">
            <p className="text-gray-500">No dietary preferences yet</p>
          </div>
        )}
      </InfoCard>

      {/* Add Dietary Preference Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Dietary Preference</DialogTitle>
            <DialogDescription>
              Add a new dietary preference or restriction to your health profile.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FieldGroup>
              {/* Preference Type */}
              <Controller
                name="preference_type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Preference Type <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select preference type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diet">Diet (e.g., Vegetarian, Vegan)</SelectItem>
                        <SelectItem value="cuisine">
                          Cuisine (e.g., Mediterranean, Asian)
                        </SelectItem>
                        <SelectItem value="ingredient">
                          Ingredient (e.g., Organic, Gluten-free)
                        </SelectItem>
                        <SelectItem value="preparation">
                          Preparation (e.g., Raw, Grilled)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              {/* Preference Name */}
              <Controller
                name="preference_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Preference Name <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      type="text"
                      placeholder="e.g., Vegetarian, Gluten-free, Low-sodium"
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              {/* Reason */}
              <Controller
                name="reason"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Reason</FieldLabel>
                    <Input
                      {...field}
                      type="text"
                      placeholder="e.g., Health, Religious, Environmental"
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              {/* Notes */}
              <Controller
                name="notes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Notes</FieldLabel>
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Additional information about this preference"
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              {/* Is Strict */}
              <Controller
                name="is_strict"
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <input
                      id="is_strict"
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="size-4 rounded border-gray-300 text-green-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <label htmlFor="is_strict" className="text-sm font-medium">
                      This is a strict requirement
                    </label>
                  </div>
                )}
              />
            </FieldGroup>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Adding...' : 'Add Preference'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
