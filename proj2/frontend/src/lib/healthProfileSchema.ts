import * as z from 'zod';

// Schema for Step 1: Basic Demographics
export const step1Schema = z.object({
  age: z.string().min(1, { message: 'Age is required' }),
  gender: z.string().min(1, { message: 'Please select your gender' }),
  heightFeet: z.string().min(1, { message: 'Height (feet) is required' }),
  heightInches: z.string().min(1, { message: 'Height (inches) is required' }),
  weight: z.string().min(1, { message: 'Weight is required' }),
  activityLevel: z.string().min(1, { message: 'Please select your activity level' }),
});

// Schema for Step 2: Dietary Preferences
export const step2Schema = z.object({
  dietaryPreferences: z.array(z.string()).optional(),
  cookingFrequency: z.string().min(1, { message: 'Please select how often you cook' }),
});

// Schema for Step 3: Allergies and Intolerances
export const step3Schema = z.object({
  allergies: z
    .array(
      z.object({
        allergen: z.string().min(1, { message: 'Allergen name is required' }),
        severity: z
          .string()
          .min(1, { message: 'Please select severity' })
          .refine(
            (val) => ['mild', 'moderate', 'severe', 'life-threatening'].includes(val),
            { message: 'Invalid severity level' }
          ),
      })
    )
    .optional(),
});

// Schema for Step 4: Health Goals
export const step4Schema = z.object({
  healthGoals: z.array(z.string()).min(1, { message: 'Please select at least one health goal' }),
  targetWeight: z.string().optional(),
  timeframe: z.string().optional(),
});

// Schema for Step 5: Medical Information
export const step5Schema = z.object({
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  supplements: z.string().optional(),
});

// Combined schema for the entire health profile
export const healthProfileSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
  ...step5Schema.shape,
});
