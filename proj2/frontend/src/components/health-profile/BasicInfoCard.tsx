import { useState } from 'react';
import { Button } from '@/components/ui/button';
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

interface BasicInfoCardProps {
  healthProfile: HealthProfile | null;
  onUpdate: (updatedProfile: HealthProfile) => void;
}

export function BasicInfoCard({ healthProfile, onUpdate }: BasicInfoCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [activityLevel, setActivityLevel] = useState<string>('');

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
    setHeight(healthProfile?.height_cm?.toString() || '');
    setWeight(healthProfile?.weight_kg?.toString() || '');
    setActivityLevel(healthProfile?.activity_level || '');
    setError(null);
    setIsDialogOpen(true);
  };

  // Save changes
  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data: {
        height_cm?: number;
        weight_kg?: number;
        activity_level?: ActivityLevel;
      } = {};

      if (height) data.height_cm = parseFloat(height);
      if (weight) data.weight_kg = parseFloat(weight);
      if (activityLevel) data.activity_level = activityLevel as ActivityLevel;

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
    } finally {
      setIsLoading(false);
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

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="height" className="text-sm font-medium">
                  Height (cm)
                </label>
                <input
                  id="height"
                  type="number"
                  placeholder="170"
                  min="0"
                  step="0.1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="weight" className="text-sm font-medium">
                  Weight (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  placeholder="70"
                  min="0"
                  step="0.1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="activity" className="text-sm font-medium">
                Activity Level
              </label>
              <select
                id="activity"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
              >
                <option value="">Select activity level</option>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light activity</option>
                <option value="moderate">Moderate activity</option>
                <option value="active">Active</option>
                <option value="very_active">Very active</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
