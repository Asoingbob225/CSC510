import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { WizardStep } from '@/components/ui/wizard-step';
import {
  healthProfileSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
} from '@/lib/healthProfileSchema';
import { Step1BasicDemographics } from '@/components/wizard-steps/Step1BasicDemographics';
import { Step2DietaryPreferences } from '@/components/wizard-steps/Step2DietaryPreferences';
import { Step3Allergies } from '@/components/wizard-steps/Step3Allergies';
import { Step4HealthGoals } from '@/components/wizard-steps/Step4HealthGoals';
import { Step5MedicalInfo } from '@/components/wizard-steps/Step5MedicalInfo';

const STEPS = [
  { title: 'Demographics', description: 'Basic information' },
  { title: 'Diet', description: 'Preferences' },
  { title: 'Allergies', description: 'Restrictions' },
  { title: 'Goals', description: 'Health targets' },
  { title: 'Medical', description: 'Health info' },
];

const STEP_SCHEMAS = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];

const STORAGE_KEY = 'healthProfileWizardData';

type HealthProfileFormData = z.infer<typeof healthProfileSchema>;

export function HealthProfileWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const form = useForm<HealthProfileFormData>({
    resolver: zodResolver(healthProfileSchema),
    mode: 'onChange',
    defaultValues: {
      age: '',
      gender: '',
      heightFeet: '',
      heightInches: '',
      weight: '',
      activityLevel: '',
      dietaryPreferences: [],
      cookingFrequency: '',
      allergies: [],
      healthGoals: [],
      targetWeight: '',
      timeframe: '',
      medicalConditions: '',
      medications: '',
      supplements: '',
    },
  });

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        form.reset(parsed.data);
        setCurrentStep(parsed.step || 1);
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, [form]);

  // Save progress to localStorage
  const saveProgress = () => {
    setIsSaving(true);
    const data = form.getValues();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step: currentStep }));
    setTimeout(() => setIsSaving(false), 500);
  };

  // Validate current step before proceeding
  const validateCurrentStep = async () => {
    const stepIndex = currentStep - 1;
    const schema = STEP_SCHEMAS[stepIndex];
    const allValues = form.getValues();

    try {
      await schema.parseAsync(allValues);
      return true;
    } catch {
      // Trigger validation errors
      await form.trigger();
      return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
      saveProgress();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onSubmit = async (data: HealthProfileFormData) => {
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/health-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Clear saved data
        localStorage.removeItem(STORAGE_KEY);
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        console.error('Failed to save health profile');
        alert('Failed to save health profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving health profile:', error);
      alert('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Health Profile</h1>
            <p className="text-gray-600">
              Complete this wizard to get personalized nutrition recommendations
            </p>
          </div>

          <ProgressIndicator currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8" role="form">
            <WizardStep isActive={currentStep === 1}>
              <Step1BasicDemographics control={form.control as any} />
            </WizardStep>

            <WizardStep isActive={currentStep === 2}>
              <Step2DietaryPreferences control={form.control as any} />
            </WizardStep>

            <WizardStep isActive={currentStep === 3}>
              <Step3Allergies control={form.control as any} />
            </WizardStep>

            <WizardStep isActive={currentStep === 4}>
              <Step4HealthGoals control={form.control as any} />
            </WizardStep>

            <WizardStep isActive={currentStep === 5}>
              <Step5MedicalInfo control={form.control as any} />
            </WizardStep>

            <div className="mt-8 flex items-center justify-between border-t pt-6">
              <div>
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={handlePrevious}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveProgress}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saved!' : 'Save & Continue Later'}
                </Button>

                {currentStep < STEPS.length ? (
                  <Button type="button" onClick={handleNext} className="bg-emerald-500 hover:bg-emerald-600">
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    {isSubmitting ? 'Submitting...' : 'Complete Profile'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
