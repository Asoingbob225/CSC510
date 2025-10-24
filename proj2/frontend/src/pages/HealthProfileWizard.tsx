import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TriangleAlert } from 'lucide-react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Step1ProfileForm, type ProfileFormData } from '@/components/wizard-step/Step1ProfileForm';
import {
  Step2AllergiesForm,
  type AllergiesFormData,
} from '@/components/wizard-step/Step2AllergiesForm';
import {
  Step3PreferencesForm,
  type PreferencesFormData,
} from '@/components/wizard-step/Step3PreferencesForm';
import { createHealthProfile, addAllergy, addDietaryPreference } from '@/lib/api';

export default function HealthProfileWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Create Health Profile (Required)
  const handleStep1Submit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createHealthProfile({
        height_cm: data.height_cm,
        weight_kg: data.weight_kg,
        activity_level: data.activity_level,
      });

      // Profile created successfully, move to next step
      console.log('Health profile created:', response.id);

      // Move to next step
      setCurrentStep(2);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create health profile. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Add Allergies (Optional)
  const handleStep2Submit = async (data: AllergiesFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Call POST /api/health/allergies for each allergy
      for (const allergy of data.allergies) {
        await addAllergy({
          allergen_id: allergy.allergen_id,
          severity: allergy.severity,
          notes: allergy.notes,
        });
      }

      // Move to next step
      setCurrentStep(3);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save allergies. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Skip = () => {
    setCurrentStep(3);
  };

  const handleStep2Previous = () => {
    setCurrentStep(1);
  };

  // Step 3: Add Dietary Preferences (Optional)
  const handleStep3Submit = async (data: PreferencesFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Call POST /api/health/dietary-preferences for each preference
      for (const pref of data.preferences) {
        await addDietaryPreference({
          preference_type: pref.preference_type,
          preference_name: pref.preference_name,
          is_strict: pref.is_strict,
          notes: pref.notes,
        });
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to save dietary preferences. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep3Skip = () => {
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const handleStep3Previous = () => {
    setCurrentStep(2);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Health Profile Setup</h1>
          <p className="mt-2 text-gray-600">
            Complete your health profile to get personalized nutrition recommendations
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                  currentStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                1
              </div>
              <span className="mt-2 text-xs font-medium text-gray-600">Profile</span>
            </div>
            <div
              className={`mx-2 h-1 flex-1 ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-gray-200'}`}
            />
            <div className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                  currentStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                2
              </div>
              <span className="mt-2 text-xs font-medium text-gray-600">Allergies</span>
            </div>
            <div
              className={`mx-2 h-1 flex-1 ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-gray-200'}`}
            />
            <div className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                  currentStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                3
              </div>
              <span className="mt-2 text-xs font-medium text-gray-600">Preferences</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-lg bg-white p-6 shadow-lg md:p-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}

          {currentStep === 1 && (
            <Step1ProfileForm onSubmit={handleStep1Submit} isSubmitting={isSubmitting} />
          )}

          {currentStep === 2 && (
            <Step2AllergiesForm
              onSubmit={handleStep2Submit}
              onPrevious={handleStep2Previous}
              onSkip={handleStep2Skip}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 3 && (
            <Step3PreferencesForm
              onSubmit={handleStep3Submit}
              onPrevious={handleStep3Previous}
              onSkip={handleStep3Skip}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Footer Info */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Step {currentStep} of 3 • You can always update your profile later
        </p>
      </div>
    </div>
  );
}
