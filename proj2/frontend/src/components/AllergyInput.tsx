import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import AllergySeverityWarning from './AllergySeverityWarning';
import type { AllergySeverity, Allergen, UserAllergy } from '@/lib/api';

interface AllergyInputProps {
  allergens: Allergen[];
  allergies: UserAllergy[];
  onAdd: (data: {
    allergen_id: string;
    severity: AllergySeverity;
    diagnosed_date?: string;
    reaction_type?: string;
    notes?: string;
    is_verified: boolean;
  }) => Promise<void>;
  onDelete: (allergyId: string) => Promise<void>;
}

function AllergyInput({ allergens, allergies, onAdd, onDelete }: AllergyInputProps) {
  const [selectedAllergenId, setSelectedAllergenId] = useState('');
  const [severity, setSeverity] = useState<AllergySeverity>('mild');
  const [diagnosedDate, setDiagnosedDate] = useState('');
  const [reactionType, setReactionType] = useState('');
  const [notes, setNotes] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out already added allergens
  const availableAllergens = allergens.filter(
    (allergen) => !allergies.some((allergy) => allergy.allergen_id === allergen.id)
  );

  useEffect(() => {
    if (availableAllergens.length > 0 && !selectedAllergenId) {
      setSelectedAllergenId(availableAllergens[0].id);
    }
  }, [availableAllergens, selectedAllergenId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAllergenId) {
      setError('Please select an allergen');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        allergen_id: selectedAllergenId,
        severity,
        diagnosed_date: diagnosedDate || undefined,
        reaction_type: reactionType || undefined,
        notes: notes || undefined,
        is_verified: isVerified,
      });

      // Reset form
      setDiagnosedDate('');
      setReactionType('');
      setNotes('');
      setIsVerified(false);
      setSeverity('mild');
      setError(null);

      // Select next available allergen
      const remainingAllergens = allergens.filter(
        (allergen) =>
          allergen.id !== selectedAllergenId &&
          !allergies.some((allergy) => allergy.allergen_id === allergen.id)
      );
      if (remainingAllergens.length > 0) {
        setSelectedAllergenId(remainingAllergens[0].id);
      } else {
        setSelectedAllergenId('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add allergy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (allergyId: string) => {
    try {
      await onDelete(allergyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete allergy');
    }
  };

  const getAllergenName = (allergenId: string) => {
    return allergens.find((a) => a.id === allergenId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Existing Allergies */}
      {allergies.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Your Allergies</h3>
          <div className="space-y-2">
            {allergies.map((allergy) => (
              <div
                key={allergy.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {getAllergenName(allergy.allergen_id)}
                    </span>
                    {allergy.is_verified && (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                        Verified
                      </span>
                    )}
                  </div>
                  <AllergySeverityWarning
                    severity={allergy.severity as AllergySeverity}
                    className="w-fit"
                  />
                  {allergy.notes && (
                    <p className="mt-2 text-sm text-gray-600">{allergy.notes}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(allergy.id)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Allergy Form */}
      {availableAllergens.length > 0 ? (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700">Add Allergy</h3>

          <Field>
            <FieldLabel>Allergen *</FieldLabel>
            <select
              value={selectedAllergenId}
              onChange={(e) => setSelectedAllergenId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              required
            >
              {availableAllergens.map((allergen) => (
                <option key={allergen.id} value={allergen.id}>
                  {allergen.name}
                  {allergen.is_major_allergen && ' (Major Allergen)'}
                </option>
              ))}
            </select>
          </Field>

          <Field>
            <FieldLabel>Severity *</FieldLabel>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as AllergySeverity)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              required
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
              <option value="life_threatening">Life Threatening</option>
            </select>
            <div className="mt-2">
              <AllergySeverityWarning severity={severity} />
            </div>
          </Field>

          <Field>
            <FieldLabel>Diagnosed Date</FieldLabel>
            <Input
              type="date"
              value={diagnosedDate}
              onChange={(e) => setDiagnosedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </Field>

          <Field>
            <FieldLabel>Reaction Type</FieldLabel>
            <Input
              type="text"
              value={reactionType}
              onChange={(e) => setReactionType(e.target.value)}
              placeholder="e.g., Hives, Swelling, Anaphylaxis"
              maxLength={50}
            />
          </Field>

          <Field>
            <FieldLabel>Notes</FieldLabel>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional information about this allergy"
              className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              rows={3}
            />
          </Field>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_verified"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
              className="size-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="is_verified" className="text-sm text-gray-700">
              This allergy has been verified by a healthcare professional
            </label>
          </div>

          {error && <FieldError>{error}</FieldError>}

          <Button
            type="submit"
            disabled={isSubmitting || !selectedAllergenId}
            className="w-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Allergy'}
          </Button>
        </form>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600">
          All available allergens have been added
        </div>
      )}
    </div>
  );
}

export default AllergyInput;
