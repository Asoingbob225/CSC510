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

interface AllergiesCardProps {
  healthProfile: HealthProfile | null;
  allergens: Allergen[];
  onUpdate: (updatedProfile: HealthProfile) => void;
}

export function AllergiesCard({ healthProfile, allergens, onUpdate }: AllergiesCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for new allergy
  const [allergenId, setAllergenId] = useState<string>('');
  const [severity, setSeverity] = useState<AllergySeverity>('mild');
  const [reactionType, setReactionType] = useState<string>('');
  const [diagnosedDate, setDiagnosedDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Helper function to get allergen info
  const getAllergenInfo = (allergenId: string) => {
    return allergens.find((a) => a.id === allergenId);
  };

  // Open dialog and reset form
  const handleOpenDialog = () => {
    setAllergenId('');
    setSeverity('mild');
    setReactionType('');
    setDiagnosedDate('');
    setNotes('');
    setIsVerified(false);
    setError(null);
    setIsDialogOpen(true);
  };

  // Add new allergy
  const handleAddAllergy = async () => {
    try {
      if (!allergenId) {
        setError('Please select an allergen');
        return;
      }

      setIsLoading(true);
      setError(null);

      const data: {
        allergen_id: string;
        severity: AllergySeverity;
        diagnosed_date?: string;
        reaction_type?: string;
        notes?: string;
        is_verified?: boolean;
      } = {
        allergen_id: allergenId,
        severity: severity,
      };

      if (reactionType) data.reaction_type = reactionType;
      if (diagnosedDate) data.diagnosed_date = diagnosedDate;
      if (notes) data.notes = notes;
      if (isVerified) data.is_verified = isVerified;

      await healthProfileApi.addAllergy(data);

      // Reload profile to get updated allergies list
      const response = await healthProfileApi.getProfile();
      onUpdate(response.data);
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error adding allergy:', err);
      setError('Failed to add allergy. Please try again.');
    } finally {
      setIsLoading(false);
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

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="allergen" className="text-sm font-medium">
                Allergen <span className="text-red-500">*</span>
              </label>
              <select
                id="allergen"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                value={allergenId}
                onChange={(e) => setAllergenId(e.target.value)}
              >
                <option value="">Select an allergen</option>
                {allergens.map((allergen) => (
                  <option key={allergen.id} value={allergen.id}>
                    {allergen.name} {allergen.category && `(${allergen.category})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="severity" className="text-sm font-medium">
                Severity <span className="text-red-500">*</span>
              </label>
              <select
                id="severity"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AllergySeverity)}
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="life_threatening">Life-threatening</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="reaction_type" className="text-sm font-medium">
                Reaction Type
              </label>
              <input
                id="reaction_type"
                type="text"
                placeholder="e.g., Hives, Swelling, Difficulty breathing"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                value={reactionType}
                onChange={(e) => setReactionType(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="diagnosed_date" className="text-sm font-medium">
                Diagnosed Date
              </label>
              <input
                id="diagnosed_date"
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                value={diagnosedDate}
                onChange={(e) => setDiagnosedDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Additional information about this allergy"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_verified"
                type="checkbox"
                className="size-4 rounded border-gray-300 text-green-500 focus:ring-2 focus:ring-green-500/20"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
              />
              <label htmlFor="is_verified" className="text-sm font-medium">
                Verified by healthcare professional
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={handleAddAllergy}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Allergy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
