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

interface DietaryPreferencesCardProps {
  healthProfile: HealthProfile | null;
  onUpdate: (updatedProfile: HealthProfile) => void;
}

export function DietaryPreferencesCard({ healthProfile, onUpdate }: DietaryPreferencesCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for new preference
  const [preferenceType, setPreferenceType] = useState<PreferenceType>('diet');
  const [preferenceName, setPreferenceName] = useState<string>('');
  const [isStrict, setIsStrict] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Open dialog and reset form
  const handleOpenDialog = () => {
    setPreferenceType('diet');
    setPreferenceName('');
    setIsStrict(false);
    setReason('');
    setNotes('');
    setError(null);
    setIsDialogOpen(true);
  };

  // Add new dietary preference
  const handleAddPreference = async () => {
    try {
      if (!preferenceName.trim()) {
        setError('Please enter a preference name');
        return;
      }

      setIsLoading(true);
      setError(null);

      const data: {
        preference_type: PreferenceType;
        preference_name: string;
        is_strict?: boolean;
        reason?: string;
        notes?: string;
      } = {
        preference_type: preferenceType,
        preference_name: preferenceName.trim(),
      };

      if (isStrict) data.is_strict = isStrict;
      if (reason) data.reason = reason;
      if (notes) data.notes = notes;

      await healthProfileApi.addDietaryPreference(data);

      // Reload profile to get updated preferences list
      const response = await healthProfileApi.getProfile();
      onUpdate(response.data);
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error adding dietary preference:', err);
      setError('Failed to add dietary preference. Please try again.');
    } finally {
      setIsLoading(false);
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

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="preference_type" className="text-sm font-medium">
                Preference Type <span className="text-red-500">*</span>
              </label>
              <select
                id="preference_type"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                value={preferenceType}
                onChange={(e) => setPreferenceType(e.target.value as PreferenceType)}
              >
                <option value="diet">Diet (e.g., Vegetarian, Vegan)</option>
                <option value="cuisine">Cuisine (e.g., Mediterranean, Asian)</option>
                <option value="ingredient">Ingredient (e.g., Organic, Gluten-free)</option>
                <option value="preparation">Preparation (e.g., Raw, Grilled)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="preference_name" className="text-sm font-medium">
                Preference Name <span className="text-red-500">*</span>
              </label>
              <input
                id="preference_name"
                type="text"
                placeholder="e.g., Vegetarian, Gluten-free, Low-sodium"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                value={preferenceName}
                onChange={(e) => setPreferenceName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason
              </label>
              <input
                id="reason"
                type="text"
                placeholder="e.g., Health, Religious, Environmental"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Additional information about this preference"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_strict"
                type="checkbox"
                className="size-4 rounded border-gray-300 text-green-500 focus:ring-2 focus:ring-green-500/20"
                checked={isStrict}
                onChange={(e) => setIsStrict(e.target.checked)}
              />
              <label htmlFor="is_strict" className="text-sm font-medium">
                This is a strict requirement
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={handleAddPreference}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Preference'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
