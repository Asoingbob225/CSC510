# Component Architecture: Wellness Tracking

**Date**: 2025-10-26  
**Version**: v0.3  
**Related Issues**: #99 (Goal & Mood Tracking UI), #96 (Mental Wellness Tracking System)

---

## Decision: Dual-Dimension Component Organization

### Context

Eatsential implements a **dual-dimension health approach**, addressing both:
1. **Physical Health**: Nutrition, exercise, vitals, fitness goals
2. **Mental Wellness**: Mood, stress, sleep, mental health goals

We needed to decide how to organize frontend components to support this architecture while maintaining:
- Clear separation of concerns
- Intuitive developer experience
- Future extensibility
- Alignment with use case documentation (UC-001 to UC-032)

### Decision

We separated components into two top-level directories based on **data characteristics**:

#### `components/health-profile/` - Static Configuration
**Purpose**: User's baseline health information (set during onboarding, edited occasionally)

```
health-profile/
├── AllergiesCard.tsx          # Allergy management
├── BasicInfoCard.tsx          # Age, height, weight, fitness level
└── DietaryPreferencesCard.tsx # Vegan, keto, paleo, etc.
```

**Characteristics:**
- Set once during onboarding wizard
- Updated infrequently
- Configuration-style data
- No time-series tracking

#### `components/wellness/` - Dynamic Tracking
**Purpose**: Daily health metrics tracking with time-series data

```
wellness/
├── mental/             # Mental wellness tracking (Issue #99, v0.3)
│   ├── MoodLogWidget.tsx       # Daily mood (1-10 scale)
│   ├── StressLogWidget.tsx     # Stress level + triggers
│   └── SleepLogWidget.tsx      # Sleep duration + quality
│
├── physical/           # Physical wellness widgets (reserved for future)
│   └── (future quick-log widgets, if complexity allows)
│
└── shared/             # Shared components (Issue #99, v0.3)
    ├── GoalForm.tsx            # Goal management (nutrition + wellness)
    ├── GoalsList.tsx           # Goals display (all types)
    └── WellnessChart.tsx       # Trend charts (planned)
```

**Key Insight**: Goals are **cross-domain** - the backend has `goal_type` enum with values `nutrition` (physical) and `wellness` (mental). Therefore, Goal components belong in `shared/` rather than `mental/` or `physical/`.

**Note**: Physical wellness features (meal logging - Issue #95) are implemented as dedicated pages due to complexity.

**Characteristics:**
- Logged daily/multiple times per day
- Time-series data with trends
- Dashboard visualization
- Progress tracking over time

---

## Rationale

### 1. Separation by Data Lifecycle

| Aspect | health-profile/ | wellness/ |
|--------|----------------|-----------|
| **Update Frequency** | Rarely (weeks/months) | Frequently (daily) |
| **Data Type** | Configuration | Time-series logs |
| **UI Pattern** | Forms with edit mode | Quick log widgets |
| **Storage** | Single record per user | Multiple records with timestamps |
| **Visualization** | Static display | Charts, trends, progress |

### 2. Alignment with Use Cases

**Physical Health (UC-004 to UC-020):**
- UC-004 to UC-007: Health Profile Management → `health-profile/`
- UC-008 to UC-012: Meal Planning → (future meal features)

**Mental Wellness (UC-021 to UC-025):**
- UC-021: Set Mental Wellness Goals → `wellness/mental/GoalForm.tsx`
- UC-022: Log Daily Mood → `wellness/mental/MoodLogWidget.tsx`
- UC-023: Track Stress Levels → `wellness/mental/StressLogWidget.tsx`
- UC-024: Record Sleep Quality → `wellness/mental/SleepLogWidget.tsx`
- UC-025: View Mental Wellness Dashboard → (future `WellnessTracking.tsx` page)

### 3. Subdirectory Organization (`mental/`, `physical/`, `shared/`)

**Why split mental and physical wellness?**

1. **Domain Separation**: 
   - Mental wellness deals with psychological metrics (mood, stress, sleep)
   - Physical wellness deals with body metrics (meals, exercise, vitals)

2. **Implementation Difference**:
   - **Mental wellness**: Simple quick-log widgets for dashboard (Issue #99)
   - **Physical wellness**: Complex full-page features (meal logging - Issue #95 has food search, photo upload, multi-step forms)

3. **Future Flexibility**:
   - Mental wellness widgets are complete and stable
   - Physical wellness may add quick-log widgets in future if simplified versions are needed
   - Currently, physical features live in `pages/` (MealLogging, ExerciseTracking, etc.)

**Why add `shared/` subdirectory?**

- **Cross-domain components**: Goal management works for BOTH nutrition (physical) and wellness (mental) goals
- **Backend alignment**: API has `goal_type` enum with values `nutrition` and `wellness`
- **Code reuse**: Single GoalForm component handles both types via parameter
- **Consistent UI/UX**: Same visualization logic for charts across both dimensions
- **Avoid duplication**: No need for separate MentalGoalForm and PhysicalGoalForm

**Components in shared/:**
- `GoalForm`: Create/edit goals (supports both nutrition + wellness types)
- `GoalsList`: Display goals with progress tracking (filters by type if needed)
- `WellnessChart`: Visualize trends from both mental and physical data

---

## Implementation Details

### File Organization

```typescript
// Main export file: wellness/index.ts
export * from './mental';      // Mental wellness components
// export * from './physical'; // (v0.4+)
// export * from './shared';   // (v0.4+)
```

### Import Pattern

```typescript
// Recommended: Import from main wellness directory
import { MoodLogWidget, StressLogWidget } from '@/components/wellness';

// Also supported: Direct subdirectory imports
import { MoodLogWidget } from '@/components/wellness/mental';
```

### Component Naming Convention

| Category | Naming Pattern | Example |
|----------|----------------|---------|
| Mental Log Widgets | `{Metric}LogWidget` | `MoodLogWidget` |
| Physical Log Widgets | `{Metric}LogWidget` | `ExerciseLogWidget` |
| Goal Management | `Goal{Action}` | `GoalForm`, `GoalsList` |
| Charts | `{Type}Chart` | `WellnessChart` |

---

## Benefits

### For Developers

✅ **Clear Mental Model**: Static config vs dynamic tracking  
✅ **Easy Navigation**: Find components by category quickly  
✅ **Reduced Cognitive Load**: Subdirectories limit scope when working on features  
✅ **Import Clarity**: `@/components/wellness/mental/` vs `@/components/health-profile/`

### For Architecture

✅ **Scalability**: Easy to add new physical wellness components in v0.4+  
✅ **Separation of Concerns**: Mental and physical features are independent  
✅ **Testability**: Test suites can be organized by subdirectory  
✅ **Documentation**: README in each directory explains purpose

### For Users

✅ **Dual-Dimension Dashboard**: Both physical and mental wellness in one view  
✅ **Consistent UX**: Shared components ensure uniform experience  
✅ **Focused Features**: Mental wellness (v0.3) can be used independently

---

## Migration Notes

### v0.3 Changes (October 2025)

**Completed (Issue #99):**
1. ✅ Created `wellness/` directory structure
2. ✅ Added `mental/`, `physical/`, `shared/` subdirectories
3. ✅ Implemented mental wellness components in `wellness/mental/`
4. ✅ Created `index.ts` export files for clean imports
5. ✅ Updated documentation

**Mental Wellness Components (Issue #99 - Complete):**
- ✅ MoodLogWidget (mental/)
- ✅ StressLogWidget (mental/)
- ✅ SleepLogWidget (mental/)

**Shared Components (Issue #99):**
- ✅ GoalForm (shared/ - handles both nutrition + wellness goal types)
- ✅ GoalsList (shared/ - displays all goal types)
- ⏳ WellnessChart (shared/ - 7-day trend visualization)

**Physical Wellness:**
- � Directory reserved for future widgets
- ℹ️ Current physical features (meal logging) are full pages (Issue #95)

### Backward Compatibility

No breaking changes - existing components remain in original locations:
- `health-profile/` components unchanged
- New `wellness/` components are additions

---

## Future Roadmap

### v0.3 Sprint - Remaining Tasks (Issue #99)

**Shared Components (Issue #99):**
```typescript
// wellness/shared/
- WellnessChart.tsx         // 7-day trend visualization (mood/stress/sleep)
```

**Integration (Issue #99):**
- WellnessTracking.tsx main page (integrate all mental wellness components)
- Routing configuration (/wellness-tracking)
- Dashboard navigation card

### Separate Issues (Not #99)

**Issue #95 - Meal Logging Interface:**
```typescript
// pages/
- MealLogging.tsx           // Full page for meal logging (food search, photo upload)
```

### Future Enhancements (v0.4+)

**Potential Physical Wellness Widgets** (if simplified versions are needed):
```typescript
// wellness/physical/
- QuickMealWidget.tsx       // Simplified meal logging for dashboard (if needed)
- ExerciseLogWidget.tsx     // Quick workout logging (if needed)
- VitalsWidget.tsx          // Heart rate, blood pressure (if needed)
```

**Note**: Current architecture favors dedicated pages for complex features (meal logging, exercise tracking) rather than cramming functionality into dashboard widgets.

- Dual-dimension dashboard showing both mental and physical metrics
- Correlation insights (e.g., "Your mood improves on days you exercise")
- AI-powered recommendations based on wellness patterns

---

## Related Documentation

- **Architecture**: `docs/2-DESIGN/architecture-overview.md`
- **Frontend Patterns**: `docs/AGENT-PLAN/05-FRONTEND-PATTERNS.md`
- **Use Cases**: `docs/1-REQUIREMENTS/use-cases.md` (UC-021 to UC-025)
- **Sprint Tasks**: `docs/AGENT-PLAN/08-SPRINT-TASKS.md` (FE-03-005)
- **Component README**: `frontend/src/components/wellness/README.md`

---

## Decision Status

**Status**: ✅ **Implemented** (v0.3)  
**Review Date**: 2025-10-26  
**Stakeholders**: Development Team  
**Approval**: Confirmed with user on 2025-10-26
