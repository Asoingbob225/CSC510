# Wellness Components

This directory contains components for **dual-dimension health tracking** - both mental and physical wellness.

## Directory Structure

```
wellness/
├── mental/          # Mental Wellness Tracking (Issue #99, v0.3)
│   ├── MoodLogWidget.tsx       # Daily mood logging (1-10 scale)
│   ├── StressLogWidget.tsx     # Stress level tracking with triggers
│   ├── SleepLogWidget.tsx      # Sleep duration & quality logging
│   └── index.ts
│
├── physical/        # Physical Wellness Tracking (reserved for future)
│   └── (reserved for future meal/exercise logging widgets)
│
├── shared/          # Shared Wellness Components (Issue #99, v0.3)
│   ├── GoalForm.tsx            # Goal creation/edit (nutrition + wellness)
│   ├── GoalsList.tsx           # Goals display with progress tracking
│   ├── WellnessChart.tsx       # Trend visualization (planned)
│   └── index.ts
│
└── index.ts         # Main export file
```

**Design Rationale:**

- **mental/**: Mental wellness quick-log widgets (mood, stress, sleep)
- **physical/**: Reserved for future physical wellness widgets
- **shared/**: Components used by **both** mental and physical wellness
  - Goal management works for both nutrition goals (physical) and wellness goals (mental)
  - Charts visualize data from both dimensions

**Note**: Physical wellness features like meal logging (Issue #95) are full pages, not widgets.

## Design Principles

### 1. Dual-Dimension Approach

- **Mental Wellness** (UC-021 to UC-025): Mood, stress, sleep, mental health goals
- **Physical Wellness** (UC-008 to UC-020): Exercise, nutrition, vitals, physical goals
- **Integrated Dashboard**: Both dimensions displayed together for holistic health view

### 2. Component Separation Rationale

**Why separate `wellness/` from `health-profile/`?**

- `health-profile/`: **Static configuration** (allergies, dietary preferences, basic info)
- `wellness/`: **Dynamic tracking components** (mental wellness widgets for dashboard)

**Why three subdirectories: mental/, physical/, shared/?**

- `mental/`: Mental health logging widgets (mood, stress, sleep) - domain-specific
- `physical/`: Physical wellness widgets (reserved for future) - domain-specific
- `shared/`: Cross-domain components used by both mental AND physical wellness
  - **GoalForm/GoalsList**: Handles both nutrition goals (physical) and wellness goals (mental)
  - **WellnessChart**: Visualizes data from both domains

**Why is `physical/` mostly empty?**

- Physical wellness features like **meal logging** (Issue #95) are full-page experiences
- Current architecture: dedicated pages for complex features, widgets for quick logging
- The `physical/` directory is reserved for future quick-log widgets if needed

### 3. Component Architecture

Each widget follows a consistent pattern:

- **Card container** with icon header
- **Input method** (slider, number input, select)
- **Zod validation** schema
- **React Hook Form** or useState for form management
- **Toast notifications** for success/error feedback
- **Loading states** during API calls
- **Color theming** for visual distinction

### 4. API Integration

Components use centralized API client (`@/lib/api`):

- `wellnessApi.createMoodLog()`, `wellnessApi.createStressLog()`, etc.
- `goalsApi.createGoal()`, `goalsApi.getGoals()`, etc.
- JWT authentication handled automatically via Axios interceptors

## Usage

### Import Components

```tsx
// Import from main wellness directory
import { MoodLogWidget, StressLogWidget, SleepLogWidget } from '@/components/wellness';

// Or import from specific subdirectory
import { MoodLogWidget } from '@/components/wellness/mental';
```

### Example: Mental Wellness Dashboard

```tsx
import { MoodLogWidget, StressLogWidget, SleepLogWidget, GoalsList } from '@/components/wellness';

function WellnessTracking() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <MoodLogWidget />
      <StressLogWidget />
      <SleepLogWidget />

      <div className="col-span-full">
        <GoalsList />
      </div>
    </div>
  );
}
```

## Related Documentation

- **Use Cases**: `docs/1-REQUIREMENTS/use-cases.md` (UC-021 to UC-025)
- **Sprint Tasks**: `docs/AGENT-PLAN/08-SPRINT-TASKS.md` (FE-03-005)
- **API Endpoints**: `backend/README.md`
- **Component Patterns**: `docs/AGENT-PLAN/05-FRONTEND-PATTERNS.md`

## Issue #99 Scope (Current)

### Completed Components

- ✅ MoodLogWidget (mental wellness logging)
- ✅ StressLogWidget (mental wellness logging)
- ✅ SleepLogWidget (mental wellness logging)
- ✅ GoalForm (shared: nutrition + wellness goals)
- ✅ GoalsList (shared: goal display with progress)

### Remaining Components (Issue #99)

- ⏳ WellnessChart (shared: 7-day trend visualization)
- ⏳ WellnessTracking page (dashboard integrating all components)
- ⏳ Routing & Navigation

## Related Issues (Separate from #99)

- **Issue #95**: Meal Logging Interface → `pages/MealLogging.tsx` (full page)
- **Issue #104**: Mental Wellness Tracking Tests

## Future Enhancements (After v0.3)

### Potential Physical Wellness Widgets

- [ ] QuickMealWidget (simplified meal logging for dashboard) - if needed
- [ ] ExerciseLogWidget (quick workout logging) - if needed
- [ ] VitalsWidget (heart rate, blood pressure) - if needed

**Note**: Most physical wellness features will remain as dedicated pages rather than dashboard widgets due to complexity.

### Integration Features

- [ ] Dual-dimension dashboard (physical + mental in one view)
- [ ] Correlation insights (how sleep affects mood, exercise affects stress)
- [ ] AI recommendations based on wellness patterns
- [ ] Export/sharing capabilities

## Testing

Each component should have corresponding test file:

```
mental/
├── MoodLogWidget.tsx
├── MoodLogWidget.test.tsx
└── ...
```

Test coverage should include:

- Component rendering
- Form validation
- API call success/failure
- Loading states
- User interactions (slider, input, submit)

## Status

| Component Category        | Status               | Issue/Version    |
| ------------------------- | -------------------- | ---------------- |
| Mental Wellness Widgets   | ✅ Complete (3/3)    | Issue #99 (v0.3) |
| Shared Components         | 🟡 In Progress (2/3) | Issue #99 (v0.3) |
| Physical Wellness Widgets | 📝 Reserved          | Future           |

**Shared Components Status:**

- ✅ GoalForm (supports both nutrition + wellness goal types)
- ✅ GoalsList (displays all goal types)
- ⏳ WellnessChart (trend visualization - in progress)
