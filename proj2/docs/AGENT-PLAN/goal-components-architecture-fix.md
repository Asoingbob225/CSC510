# Goal Components Architecture Decision

**Date**: 2025-10-26  
**Issue**: Goal components should be in `shared/` not `mental/`  
**Reason**: Goals are cross-domain (nutrition + wellness)

---

## 🎯 Problem Identified

**User Question**: "goal应该是physical和mental都有的，是分别两个目录下建立各自的goal组件吗？"

**Original Mistake**: Goal components (GoalForm, GoalsList) were initially placed in `wellness/mental/` directory.

**Issue**: Goals are NOT mental-only. The backend API supports two goal types:
```python
class GoalType(str, Enum):
    NUTRITION = "nutrition"    # Physical health goal
    WELLNESS = "wellness"      # Mental wellness goal
```

---

## ✅ Correct Solution

### Goal Components → `shared/` Directory

**Rationale:**
1. **Cross-domain functionality**: Goals work for BOTH physical and mental wellness
2. **Single source of truth**: One GoalForm handles both nutrition and wellness goals
3. **Backend alignment**: API has unified Goal model with `goal_type` discriminator
4. **Avoid code duplication**: No need for separate MentalGoalForm and PhysicalGoalForm
5. **Future-proof**: When physical wellness features expand, same Goal components are reused

### Component Design

**GoalForm.tsx** (shared/):
- Accepts `goal_type` parameter: `"nutrition"` or `"wellness"`
- Single form component with type-specific field validation
- Used by both mental wellness dashboard and (future) nutrition dashboard

**GoalsList.tsx** (shared/):
- Displays all goals with type badges
- Optionally filters by `goal_type` if needed
- Single component for unified goal management

---

## 📂 File Structure Change

### Before (Incorrect):
```
wellness/
├── mental/
│   ├── MoodLogWidget.tsx
│   ├── StressLogWidget.tsx
│   ├── SleepLogWidget.tsx
│   ├── GoalForm.tsx          ❌ Wrong location
│   └── GoalsList.tsx         ❌ Wrong location
└── shared/
    └── (empty)
```

### After (Correct):
```
wellness/
├── mental/
│   ├── MoodLogWidget.tsx     ✅ Mental-specific
│   ├── StressLogWidget.tsx   ✅ Mental-specific
│   └── SleepLogWidget.tsx    ✅ Mental-specific
├── physical/
│   └── (reserved for future)
└── shared/
    ├── GoalForm.tsx          ✅ Cross-domain
    ├── GoalsList.tsx         ✅ Cross-domain
    └── WellnessChart.tsx     ✅ Cross-domain (planned)
```

---

## 🔧 Changes Made

### 1. Moved Files
```bash
mv mental/GoalForm.tsx shared/
mv mental/GoalsList.tsx shared/
```

### 2. Updated Export Files

**`mental/index.ts`** - Removed Goal exports:
```typescript
export { default as MoodLogWidget } from './MoodLogWidget';
export { default as StressLogWidget } from './StressLogWidget';
export { default as SleepLogWidget } from './SleepLogWidget';
// Removed: GoalForm, GoalsList
```

**`shared/index.ts`** - Added Goal exports:
```typescript
export { default as GoalForm } from './GoalForm';
export { default as GoalsList } from './GoalsList';
// export { default as WellnessChart } from './WellnessChart'; // TODO
```

**`wellness/index.ts`** - Export from shared:
```typescript
export * from './mental';
export * from './shared';  // ✅ Now includes Goals
```

### 3. Updated Documentation

- ✅ `wellness/README.md` - Clarified shared/ directory purpose
- ✅ `architecture-overview.md` - Moved Goals to shared/ in component tree
- ✅ `05-FRONTEND-PATTERNS.md` - Updated subdirectory explanation
- ✅ `component-architecture-decision.md` - Added cross-domain rationale

---

## 🎨 Design Principles

### mental/ Directory
**Purpose**: Domain-specific mental wellness logging widgets

**Characteristics**:
- Quick, single-purpose logging
- Mental health metrics only
- Simple form with immediate submission

**Examples**: MoodLogWidget, StressLogWidget, SleepLogWidget

### physical/ Directory
**Purpose**: Domain-specific physical wellness logging widgets (future)

**Characteristics**:
- Quick, single-purpose logging
- Physical health metrics only
- Simple form with immediate submission

**Examples** (potential): QuickMealWidget, ExerciseLogWidget, VitalsWidget

### shared/ Directory
**Purpose**: Cross-domain components used by BOTH mental and physical wellness

**Characteristics**:
- Work with data from both domains
- Unified data model with type discriminators
- Reusable across multiple contexts

**Examples**: 
- **GoalForm/GoalsList**: Manage nutrition + wellness goals
- **WellnessChart**: Visualize mood, stress, sleep, exercise, nutrition data
- **ProgressIndicator**: Show progress for any goal type

---

## 🔍 Backend API Alignment

### Goal API Design
```python
# Backend model
class GoalDB(Base):
    goal_type: str  # "nutrition" or "wellness"
    description: str
    target_value: float
    current_value: float
    # ... other fields

# Frontend usage
const nutritionGoal = {
  goal_type: "nutrition",
  description: "Consume 2000 calories daily",
  // ...
};

const wellnessGoal = {
  goal_type: "wellness", 
  description: "Maintain mood score above 7",
  // ...
};
```

### Single API, Multiple Types
- `POST /api/goals` - Create goal (any type)
- `GET /api/goals?goal_type=nutrition` - Filter by type
- `GET /api/goals?goal_type=wellness` - Filter by type
- `PUT /api/goals/{id}` - Update goal (any type)

---

## 📊 Import Pattern

### Before:
```typescript
// ❌ Misleading - Goals seemed mental-specific
import { GoalForm, GoalsList } from '@/components/wellness/mental';
```

### After:
```typescript
// ✅ Clear - Goals are cross-domain
import { GoalForm, GoalsList } from '@/components/wellness/shared';

// OR
import { GoalForm, GoalsList } from '@/components/wellness';
```

---

## 🚀 Future Usage

### Mental Wellness Dashboard (Issue #99)
```tsx
import { MoodLogWidget, StressLogWidget, SleepLogWidget } from '@/components/wellness/mental';
import { GoalForm, GoalsList } from '@/components/wellness/shared';

function WellnessTracking() {
  return (
    <>
      <GoalsList goalType="wellness" />  {/* Filter to wellness goals */}
      <MoodLogWidget />
      <StressLogWidget />
      <SleepLogWidget />
    </>
  );
}
```

### Nutrition Dashboard (Future)
```tsx
import { GoalForm, GoalsList } from '@/components/wellness/shared';
import { MealSummary } from '@/components/wellness/physical'; // future

function NutritionDashboard() {
  return (
    <>
      <GoalsList goalType="nutrition" />  {/* Filter to nutrition goals */}
      <MealSummary />
    </>
  );
}
```

### Unified Dashboard (Future)
```tsx
import { GoalsList } from '@/components/wellness/shared';

function UnifiedDashboard() {
  return (
    <GoalsList />  {/* Show ALL goals (nutrition + wellness) */}
  );
}
```

---

## ✅ Verification

**Final Structure:**
```
wellness/
├── mental/          (3 components) ✅
├── physical/        (0 components, reserved)
├── shared/          (2 components: GoalForm, GoalsList) ✅
└── index.ts         (exports mental + shared) ✅
```

**Import Test:**
```typescript
// ✅ This works
import { 
  MoodLogWidget,      // from mental/
  GoalForm,           // from shared/
  GoalsList           // from shared/
} from '@/components/wellness';
```

---

## 📝 Key Takeaway

**Principle**: When a component serves **multiple domains**, it belongs in **shared/**, not in a domain-specific directory.

**Decision Rule**:
- **Domain-specific widget** → `mental/` or `physical/`
- **Cross-domain component** → `shared/`
- **When in doubt**: Check if the component has a type discriminator field (like `goal_type`) - if yes, it's probably shared!
