# Multi-Step Health Profile Wizard Implementation

## Overview

This implementation provides a comprehensive 5-step wizard for collecting user health profile information, as specified in FR-005 and UC-004 of the SRS documentation.

## Features Implemented

### 1. Multi-Step Wizard Interface
- **5 Steps Total**:
  1. Basic Demographics (Age, Gender, Height, Weight, Activity Level)
  2. Dietary Preferences (15+ options including vegetarian, vegan, keto, etc.)
  3. Allergies & Intolerances (dynamic list with severity selection)
  4. Health Goals (10+ options including weight loss, muscle gain, etc.)
  5. Medical Information (conditions, medications, supplements)

### 2. Progress Indicator
- Visual progress bar showing:
  - Current step highlighted in emerald green
  - Completed steps marked
  - Upcoming steps grayed out
  - "Step X of 5" counter

### 3. Form Validation
- Inline error messages using Zod schema validation
- Field-level validation on blur
- Step-level validation before proceeding to next step
- Required field indicators

### 4. Help Tooltips
- Contextual help tooltips on complex fields
- Hover to view helpful information
- Explains purpose and requirements of each field

### 5. Save and Continue Functionality
- "Save & Continue Later" button on all steps
- Saves form data to localStorage
- Automatically restores saved data on return
- Saves current step number

### 6. Navigation
- **Previous Button**: Navigate back (not shown on step 1)
- **Next Button**: Proceed to next step with validation
- **Complete Profile Button**: Submit on final step
- Smooth scrolling to top on step change

## Technical Implementation

### Components

#### UI Components (`proj2/frontend/src/components/ui/`)
- `progress-indicator.tsx`: Visual progress tracker
- `tooltip.tsx`: Help tooltip component
- `wizard-step.tsx`: Step wrapper with animation
- `select.tsx`: Dropdown select component

#### Step Components (`proj2/frontend/src/components/wizard-steps/`)
- `Step1BasicDemographics.tsx`: Demographics form
- `Step2DietaryPreferences.tsx`: Dietary preferences selection
- `Step3Allergies.tsx`: Dynamic allergy list management
- `Step4HealthGoals.tsx`: Health goals multi-select
- `Step5MedicalInfo.tsx`: Medical information text areas

#### Main Components
- `HealthProfileWizard.tsx`: Main wizard orchestrator
- `healthProfileSchema.ts`: Zod validation schemas

### Validation Schema

```typescript
// Step 1: Basic Demographics
- age: string (required)
- gender: string (required)
- heightFeet: string (required, 3-8)
- heightInches: string (required, 0-11)
- weight: string (required, 50-500 lbs)
- activityLevel: string (required)

// Step 2: Dietary Preferences
- dietaryPreferences: array of strings (optional)
- cookingFrequency: string (required)

// Step 3: Allergies
- allergies: array of objects (optional)
  - allergen: string (required if array not empty)
  - severity: 'mild' | 'moderate' | 'severe' | 'life-threatening'

// Step 4: Health Goals
- healthGoals: array of strings (minimum 1 required)
- targetWeight: string (optional)
- timeframe: string (optional)

// Step 5: Medical Info
- medicalConditions: string (optional)
- medications: string (optional)
- supplements: string (optional)
```

### Styling
- Uses Tailwind CSS for responsive design
- Consistent with existing component library
- Emerald green theme for primary actions
- Gray theme for inactive/secondary elements

## Testing

8 unit tests implemented covering:
- Wizard rendering
- Progress indicator display
- Navigation buttons (Next, Previous, Save)
- Form structure
- Field labels
- Step transitions

All 46 tests pass (38 existing + 8 new).

## Security

- No vulnerabilities detected by CodeQL scanner
- Input validation prevents malicious data
- localStorage usage for non-sensitive form data only
- Secure form submission placeholder (ready for API integration)

## Usage

### Access the Wizard
Navigate to `/health-profile` route to access the wizard.

### User Flow
1. User fills in demographics information
2. Clicks "Next" to proceed (validation enforced)
3. Continues through all 5 steps
4. Can click "Save & Continue Later" at any step
5. Clicks "Complete Profile" on final step to submit

### Saving Progress
- Form data persisted to localStorage as `healthProfileWizardData`
- Contains both form data and current step number
- Automatically restored on return to wizard

### API Integration (TODO)
The wizard includes a placeholder for API submission at:
```typescript
POST /api/health-profile
```

Replace the mock implementation in `onSubmit` function with actual API endpoint.

## Files Modified/Created

### New Files (12)
- 4 UI components
- 5 step components  
- 1 schema file
- 1 main wizard component
- 1 test file

### Modified Files (1)
- `App.tsx`: Added route for `/health-profile`

## Alignment with Requirements

### FR-005 Requirements ✓
- ✓ Multi-step wizard with efficient completion process
- ✓ Collect demographics, dietary preferences, allergies, goals
- ✓ Validate biometric data for realistic ranges
- ✓ Allow profile completion in multiple sessions

### UC-004 Requirements ✓
- ✓ System presents health profile wizard
- ✓ User enters basic demographics
- ✓ User selects dietary preferences
- ✓ User lists food allergies and intolerances
- ✓ User specifies health goals
- ✓ User answers lifestyle questions
- ✓ System validates all inputs
- ✓ System saves profile

### IR-006 Requirements ✓
- ✓ Multi-step wizard interface
- ✓ Progress indicator
- ✓ Save and continue functionality
- ✓ Input validation with inline errors
- ✓ Help tooltips for complex fields

## Future Enhancements

Potential improvements for future iterations:
1. Lab results file upload support (FR-005)
2. Auto-calculate nutritional recommendations
3. Wearable device integration
4. Professional nutritionist integration
5. Profile export functionality
6. Accessibility improvements (ARIA labels)
7. Multi-language support
8. Mobile-optimized touch gestures
