import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldLabel,
  FieldSet,
  FieldGroup,
  FieldError,
} from '@/components/ui/field';
import { Alert, AlertTitle } from '@/components/ui/alert';
import AllergyInput from '@/components/AllergyInput';
import { TriangleAlert, ArrowLeft } from 'lucide-react';
import {
  healthProfileApi,
  getAuthToken,
  clearAuthToken,
  type HealthProfile,
  type Allergen,
  type ActivityLevel,
  type AllergySeverity,
  type PreferenceType,
} from '@/lib/api';

const healthProfileSchema = z.object({
  height_cm: z
    .number()
    .min(0, 'Height must be positive')
    .max(300, 'Height must be less than 300 cm')
    .optional()
    .or(z.literal('')),
  weight_kg: z
    .number()
    .min(0, 'Weight must be positive')
    .max(500, 'Weight must be less than 500 kg')
    .optional()
    .or(z.literal('')),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
});

type HealthProfileFormData = z.infer<typeof healthProfileSchema>;

function HealthProfile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dietary preferences state
  const [preferenceType, setPreferenceType] = useState<PreferenceType>('diet');
  const [preferenceName, setPreferenceName] = useState('');
  const [isStrict, setIsStrict] = useState(true);
  const [preferenceReason, setPreferenceReason] = useState('');
  const [preferenceNotes, setPreferenceNotes] = useState('');

  const form = useForm<HealthProfileFormData>({
    resolver: zodResolver(healthProfileSchema),
    defaultValues: {
      height_cm: '',
      weight_kg: '',
      activity_level: undefined,
    },
  });

  // Check auth and load data
  useEffect(() => {
    const loadData = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);

        // Load allergens list
        const allergensResponse = await healthProfileApi.listAllergens();
        setAllergens(allergensResponse.data);

        // Try to load existing profile
        try {
          const profileResponse = await healthProfileApi.getProfile();
          setProfile(profileResponse.data);

          // Populate form with existing data
          form.reset({
            height_cm: profileResponse.data.height_cm || '',
            weight_kg: profileResponse.data.weight_kg || '',
            activity_level: profileResponse.data.activity_level as ActivityLevel | undefined,
          });
        } catch (profileError: unknown) {
          // If profile doesn't exist (404), that's ok - user will create one
          if (
            profileError &&
            typeof profileError === 'object' &&
            'response' in profileError &&
            profileError.response &&
            typeof profileError.response === 'object' &&
            'status' in profileError.response &&
            profileError.response.status !== 404
          ) {
            throw profileError;
          }
          // Profile doesn't exist yet
          setProfile(null);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load health profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate, form]);

  const onSubmit = async (data: HealthProfileFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        height_cm: typeof data.height_cm === 'number' ? data.height_cm : undefined,
        weight_kg: typeof data.weight_kg === 'number' ? data.weight_kg : undefined,
        activity_level: data.activity_level,
      };

      if (profile) {
        // Update existing profile
        const response = await healthProfileApi.updateProfile(payload);
        setProfile(response.data);
        setSuccess('Health profile updated successfully!');
      } else {
        // Create new profile
        const response = await healthProfileApi.createProfile(payload);
        setProfile(response.data);
        setSuccess('Health profile created successfully!');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save health profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAllergy = async (data: {
    allergen_id: string;
    severity: AllergySeverity;
    diagnosed_date?: string;
    reaction_type?: string;
    notes?: string;
    is_verified: boolean;
  }) => {
    try {
      // Ensure profile exists before adding allergies
      if (!profile) {
        // Create profile first with current form data
        const formData = form.getValues();
        const payload = {
          height_cm: typeof formData.height_cm === 'number' ? formData.height_cm : undefined,
          weight_kg: typeof formData.weight_kg === 'number' ? formData.weight_kg : undefined,
          activity_level: formData.activity_level,
        };
        const response = await healthProfileApi.createProfile(payload);
        setProfile(response.data);
      }

      const response = await healthProfileApi.addAllergy(data);

      // Update profile with new allergy
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          allergies: [...prev.allergies, response.data],
        };
      });

      setSuccess('Allergy added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (_err) {
      throw new Error('Failed to add allergy');
    }
  };

  const handleDeleteAllergy = async (allergyId: string) => {
    try {
      await healthProfileApi.deleteAllergy(allergyId);

      // Update profile by removing the allergy
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          allergies: prev.allergies.filter((a) => a.id !== allergyId),
        };
      });

      setSuccess('Allergy deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (_err) {
      throw new Error('Failed to delete allergy');
    }
  };

  const handleAddDietaryPreference = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!preferenceName.trim()) {
      setError('Preference name is required');
      return;
    }

    try {
      // Ensure profile exists
      if (!profile) {
        const formData = form.getValues();
        const payload = {
          height_cm: typeof formData.height_cm === 'number' ? formData.height_cm : undefined,
          weight_kg: typeof formData.weight_kg === 'number' ? formData.weight_kg : undefined,
          activity_level: formData.activity_level,
        };
        const response = await healthProfileApi.createProfile(payload);
        setProfile(response.data);
      }

      const response = await healthProfileApi.addDietaryPreference({
        preference_type: preferenceType,
        preference_name: preferenceName,
        is_strict: isStrict,
        reason: preferenceReason || undefined,
        notes: preferenceNotes || undefined,
      });

      // Update profile with new preference
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          dietary_preferences: [...prev.dietary_preferences, response.data],
        };
      });

      // Reset form
      setPreferenceName('');
      setPreferenceReason('');
      setPreferenceNotes('');
      setIsStrict(true);

      setSuccess('Dietary preference added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (_err) {
      setError('Failed to add dietary preference');
    }
  };

  const handleDeleteDietaryPreference = async (preferenceId: string) => {
    try {
      await healthProfileApi.deleteDietaryPreference(preferenceId);

      // Update profile by removing the preference
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          dietary_preferences: prev.dietary_preferences.filter((p) => p.id !== preferenceId),
        };
      });

      setSuccess('Dietary preference deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (_err) {
      setError('Failed to delete dietary preference');
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Health Profile</h1>
          </div>
          <Button
            onClick={handleLogout}
            className="cursor-pointer bg-gray-600 text-white shadow-md hover:bg-gray-700"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Success/Error Messages */}
          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{success}</div>
          )}
          {error && (
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}

          {/* Basic Health Information */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Basic Health Information</h2>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldSet>
                <FieldGroup>
                  <Controller
                    name="height_cm"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Height (cm)</FieldLabel>
                        <Input
                          aria-invalid={fieldState.invalid}
                          type="number"
                          step="0.1"
                          placeholder="e.g., 170.5"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? '' : parseFloat(value));
                          }}
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
                          aria-invalid={fieldState.invalid}
                          type="number"
                          step="0.1"
                          placeholder="e.g., 70.5"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? '' : parseFloat(value));
                          }}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />

                  <Controller
                    name="activity_level"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Activity Level</FieldLabel>
                        <select
                          {...field}
                          value={field.value || ''}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          <option value="">Select activity level</option>
                          <option value="sedentary">Sedentary</option>
                          <option value="light">Light</option>
                          <option value="moderate">Moderate</option>
                          <option value="active">Active</option>
                          <option value="very_active">Very Active</option>
                        </select>
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                </FieldGroup>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cursor-pointer bg-emerald-500 text-white shadow-md hover:bg-emerald-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
                </Button>
              </FieldSet>
            </form>
          </div>

          {/* Allergies Section */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Allergies</h2>
            <AllergyInput
              allergens={allergens}
              allergies={profile?.allergies || []}
              onAdd={handleAddAllergy}
              onDelete={handleDeleteAllergy}
            />
          </div>

          {/* Dietary Preferences Section */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Dietary Preferences</h2>

            {/* Existing Preferences */}
            {profile?.dietary_preferences && profile.dietary_preferences.length > 0 && (
              <div className="mb-6 space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Your Preferences</h3>
                {profile.dietary_preferences.map((pref) => (
                  <div
                    key={pref.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{pref.preference_name}</span>
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                          {pref.preference_type}
                        </span>
                        {pref.is_strict && (
                          <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">
                            Strict
                          </span>
                        )}
                      </div>
                      {pref.reason && (
                        <p className="mt-1 text-sm text-gray-600">Reason: {pref.reason}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteDietaryPreference(pref.id)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <TriangleAlert className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Preference Form */}
            <form
              onSubmit={handleAddDietaryPreference}
              className="space-y-4 rounded-lg border border-gray-200 p-4"
            >
              <h3 className="text-sm font-medium text-gray-700">Add Dietary Preference</h3>

              <Field>
                <FieldLabel>Preference Type</FieldLabel>
                <select
                  value={preferenceType}
                  onChange={(e) => setPreferenceType(e.target.value as PreferenceType)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="diet">Diet</option>
                  <option value="cuisine">Cuisine</option>
                  <option value="ingredient">Ingredient</option>
                  <option value="preparation">Preparation</option>
                </select>
              </Field>

              <Field>
                <FieldLabel>Preference Name *</FieldLabel>
                <Input
                  type="text"
                  value={preferenceName}
                  onChange={(e) => setPreferenceName(e.target.value)}
                  placeholder="e.g., Vegetarian, Italian, No Garlic"
                  maxLength={100}
                  required
                />
              </Field>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_strict"
                  checked={isStrict}
                  onChange={(e) => setIsStrict(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="is_strict" className="text-sm text-gray-700">
                  This is a strict preference (no exceptions)
                </label>
              </div>

              <Field>
                <FieldLabel>Reason</FieldLabel>
                <Input
                  type="text"
                  value={preferenceReason}
                  onChange={(e) => setPreferenceReason(e.target.value)}
                  placeholder="Optional reason for this preference"
                />
              </Field>

              <Field>
                <FieldLabel>Notes</FieldLabel>
                <textarea
                  value={preferenceNotes}
                  onChange={(e) => setPreferenceNotes(e.target.value)}
                  placeholder="Additional notes"
                  className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  rows={3}
                />
              </Field>

              <Button
                type="submit"
                className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
              >
                Add Preference
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HealthProfile;
