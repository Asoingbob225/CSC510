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
import { User, Activity, Ruler, Weight, TrendingUp } from 'lucide-react';
import { InfoCard, InfoCapsule } from '@/components/profile';
import { healthProfileApi, type HealthProfile, type ActivityLevel } from '@/lib/api';

// Activity level display mapping
const activityLevelLabels: Record<string, string> = {
  sedentary: 'Sedentary',
  light: 'Light activity',
  moderate: 'Moderate activity',
  active: 'Active',
  very_active: 'Very active',
};

// Form schema
const basicInfoSchema = z.object({
  height_cm: z.string().optional(),
  weight_kg: z.string().optional(),
  activity_level: z.string().optional(),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface BasicInfoCardProps {
  healthProfile: HealthProfile | null;
  onUpdate: (updatedProfile: HealthProfile) => void;
}

export function BasicInfoCard({ healthProfile, onUpdate }: BasicInfoCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      height_cm: healthProfile?.height_cm?.toString() || '',
      weight_kg: healthProfile?.weight_kg?.toString() || '',
      activity_level: healthProfile?.activity_level || '',
    },
  });

  // Calculate BMI
  const calculateBMI = () => {
    if (healthProfile?.height_cm && healthProfile?.weight_kg) {
      const heightInMeters = healthProfile.height_cm / 100;
      const bmi = healthProfile.weight_kg / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  // Open dialog and populate form
  const handleOpenDialog = () => {
    form.reset({
      height_cm: healthProfile?.height_cm?.toString() || '',
      weight_kg: healthProfile?.weight_kg?.toString() || '',
      activity_level: healthProfile?.activity_level || '',
    });
    setError(null);
    setIsDialogOpen(true);
  };

  // Save changes
  const onSubmit = async (formData: BasicInfoFormData) => {
    try {
      setError(null);

      const data: {
        height_cm?: number;
        weight_kg?: number;
        activity_level?: ActivityLevel;
      } = {};

      if (formData.height_cm) {
        const height = parseFloat(formData.height_cm);
        if (!isNaN(height) && height > 0) data.height_cm = height;
      }
      if (formData.weight_kg) {
        const weight = parseFloat(formData.weight_kg);
        if (!isNaN(weight) && weight > 0) data.weight_kg = weight;
      }
      if (formData.activity_level) data.activity_level = formData.activity_level as ActivityLevel;

      let response;
      if (healthProfile) {
        // Update existing profile
        response = await healthProfileApi.updateProfile(data);
      } else {
        // Create new profile
        response = await healthProfileApi.createProfile(data);
      }

      onUpdate(response.data);
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error saving basic info:', err);
      setError('Failed to save basic information. Please try again.');
    }
  };

  const bmi = calculateBMI();

  return (
    <>
      <InfoCard
        icon={User}
        title="Basic Information"
        className="row-span-full h-full max-w-96"
        onEdit={handleOpenDialog}
      >
        <div className="flex flex-wrap gap-3">
          <InfoCapsule
            icon={<Ruler className="size-4" />}
            label="Height"
            value={healthProfile?.height_cm ? `${healthProfile.height_cm} cm` : 'Not set'}
            variant="primary"
          />
          <InfoCapsule
            icon={<Weight className="size-4" />}
            label="Weight"
            value={healthProfile?.weight_kg ? `${healthProfile.weight_kg} kg` : 'Not set'}
            variant="primary"
          />
          {bmi && (
            <InfoCapsule
              icon={<TrendingUp className="size-4" />}
              label="BMI"
              value={bmi.toString()}
              variant="accent"
            />
          )}
          <InfoCapsule
            icon={<Activity className="size-4" />}
            label="Activity Level"
            value={
              healthProfile?.activity_level
                ? activityLevelLabels[healthProfile.activity_level] || healthProfile.activity_level
                : 'Not set'
            }
            variant="default"
          />
        </div>
      </InfoCard>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Basic Information</DialogTitle>
            <DialogDescription>Update your height, weight, and activity level.</DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="height_cm"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Height (cm)</FieldLabel>
                      <Input
                        type="number"
                        placeholder="170"
                        min="0"
                        step="0.1"
                        {...field}
                        value={field.value || ''}
                        aria-invalid={fieldState.invalid}
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
                      <FieldLabel>Weight (kg)</FieldLabel>
                      <Input
                        type="number"
                        placeholder="70"
                        min="0"
                        step="0.1"
                        {...field}
                        value={field.value || ''}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="activity_level"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Activity Level</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light activity</SelectItem>
                        <SelectItem value="moderate">Moderate activity</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="very_active">Very active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
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
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
