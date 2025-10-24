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
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Heart, X } from 'lucide-react';
import { InfoCard, ListItemCard } from '@/components/profile';
import {
  healthProfileApi,
  type HealthProfile,
  type Allergen,
  type AllergySeverity,
} from '@/lib/api';

// Severity level display
const severityLabels: Record<string, { label: string; color: string }> = {
  mild: { label: 'Mild', color: 'bg-yellow-100 text-yellow-800' },
  moderate: { label: 'Moderate', color: 'bg-orange-100 text-orange-800' },
  severe: { label: 'Severe', color: 'bg-red-100 text-red-800' },
  life_threatening: { label: 'Life-threatening', color: 'bg-red-200 text-red-900' },
};

// Form schema
const allergySchema = z.object({
  allergen_id: z.string().min(1, 'Please select an allergen'),
  severity: z.string().min(1, 'Please select severity'),
  reaction_type: z.string().optional(),
  diagnosed_date: z.string().optional(),
  notes: z.string().optional(),
  is_verified: z.boolean().optional(),
});

type AllergyFormData = z.infer<typeof allergySchema>;

interface AllergiesCardProps {
  healthProfile: HealthProfile | null;
  allergens: Allergen[];
  onUpdate: (updatedProfile: HealthProfile) => void;
}

export function AllergiesCard({ healthProfile, allergens, onUpdate }: AllergiesCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AllergyFormData>({
    resolver: zodResolver(allergySchema),
    defaultValues: {
      allergen_id: '',
      severity: 'mild',
      reaction_type: '',
      diagnosed_date: '',
      notes: '',
      is_verified: false,
    },
  });

  // Helper function to get allergen info
  const getAllergenInfo = (allergenId: string) => {
    return allergens.find((a) => a.id === allergenId);
  };

  // Open dialog and reset form
  const handleOpenDialog = () => {
    form.reset({
      allergen_id: '',
      severity: 'mild',
      reaction_type: '',
      diagnosed_date: '',
      notes: '',
      is_verified: false,
    });
    setError(null);
    setIsDialogOpen(true);
  };

  // Add new allergy
  const onSubmit = async (formData: AllergyFormData) => {
    try {
      setError(null);

      const data: {
        allergen_id: string;
        severity: AllergySeverity;
        diagnosed_date?: string;
        reaction_type?: string;
        notes?: string;
        is_verified?: boolean;
      } = {
        allergen_id: formData.allergen_id,
        severity: formData.severity as AllergySeverity,
      };

      if (formData.reaction_type) data.reaction_type = formData.reaction_type;
      if (formData.diagnosed_date) data.diagnosed_date = formData.diagnosed_date.split('T')[0];
      if (formData.notes) data.notes = formData.notes;
      if (formData.is_verified) data.is_verified = formData.is_verified;

      await healthProfileApi.addAllergy(data);

      // Reload profile to get updated allergies list
      const response = await healthProfileApi.getProfile();
      onUpdate(response.data);
      setIsDialogOpen(false);
      form.reset();
    } catch (err) {
      console.error('Error adding allergy:', err);
      setError('Failed to add allergy. Please try again.');
    }
  };

  // Delete allergy
  const handleDeleteAllergy = async (allergyId: string) => {
    try {
      await healthProfileApi.deleteAllergy(allergyId);

      // Reload profile to get updated allergies list
      const response = await healthProfileApi.getProfile();
      onUpdate(response.data);
    } catch (err) {
      console.error('Error deleting allergy:', err);
    }
  };

  return (
    <>
      <InfoCard
        icon={Heart}
        title="Allergies"
        iconBgColor="bg-red-100"
        iconColor="text-red-600"
        onEdit={handleOpenDialog}
      >
        {healthProfile?.allergies && healthProfile.allergies.length > 0 ? (
          <div className="space-y-3">
            {healthProfile.allergies.map((allergy) => {
              const allergenInfo = getAllergenInfo(allergy.allergen_id);
              const details = [];

              if (allergenInfo?.category) {
                details.push({ label: 'Category', value: allergenInfo.category });
              }
              if (allergy.reaction_type) {
                details.push({ label: 'Reaction Type', value: allergy.reaction_type });
              }
              if (allergy.diagnosed_date) {
                details.push({
                  label: 'Diagnosed Date',
                  value: new Date(allergy.diagnosed_date).toLocaleDateString('en-US'),
                });
              }

              const badges = [
                <span
                  key="severity"
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    severityLabels[allergy.severity]?.color || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {severityLabels[allergy.severity]?.label || allergy.severity}
                </span>,
              ];

              if (allergy.is_verified) {
                badges.push(
                  <span
                    key="verified"
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                  >
                    Verified
                  </span>
                );
              }

              return (
                <div key={allergy.id} className="group relative">
                  <ListItemCard
                    title={allergenInfo?.name || 'Unknown allergen'}
                    badges={badges}
                    details={details}
                    notes={allergy.notes}
                    bgColor="bg-red-50"
                    variant="detailed"
                  />
                  <button
                    onClick={() => handleDeleteAllergy(allergy.id)}
                    className="absolute top-2 right-2 rounded-full p-1 text-red-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100"
                    title="Delete allergy"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-gray-50 p-8 text-center">
            <p className="text-gray-500">No allergies yet</p>
          </div>
        )}
      </InfoCard>

      {/* Add Allergy Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Allergy</DialogTitle>
            <DialogDescription>Add a new food allergy to your health profile.</DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FieldGroup>
              <Controller
                name="allergen_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Allergen <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an allergen" />
                      </SelectTrigger>
                      <SelectContent>
                        {allergens.map((allergen) => (
                          <SelectItem key={allergen.id} value={allergen.id}>
                            {allergen.name} {allergen.category && `(${allergen.category})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name="severity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Severity <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                        <SelectItem value="life_threatening">Life-threatening</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name="reaction_type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Reaction Type</FieldLabel>
                    <Input
                      type="text"
                      placeholder="e.g., Hives, Swelling, Difficulty breathing"
                      {...field}
                      value={field.value || ''}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name="diagnosed_date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Diagnosed Date</FieldLabel>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          {field.value
                            ? new Date(field.value).toLocaleDateString('en-US')
                            : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            field.onChange(date ? date.toISOString() : '');
                            setCalendarOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name="notes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Notes</FieldLabel>
                    <textarea
                      rows={3}
                      placeholder="Additional information about this allergy"
                      className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      {...field}
                      value={field.value || ''}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name="is_verified"
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <input
                      id="is_verified"
                      type="checkbox"
                      className="size-4 rounded border-gray-300 text-green-500 focus:ring-0 focus:ring-offset-0"
                      checked={field.value || false}
                      onChange={field.onChange}
                    />
                    <label htmlFor="is_verified" className="text-sm font-medium">
                      Verified by healthcare professional
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
                {form.formState.isSubmitting ? 'Adding...' : 'Add Allergy'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
