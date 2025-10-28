# Recommendation Components

This directory contains components for displaying meal recommendations to users based on their health profiles and preferences.

## Components

### RecommendationCarousel

A carousel component that displays personalized meal recommendations fetched from the backend API using TanStack Query.

#### Features

- **TanStack Query Integration**: Efficient data fetching with caching, automatic refetching, and error handling
- **Carousel Navigation**: Navigate through multiple recommendations with Previous/Next buttons
- **Loading States**: Displays loading spinner while fetching data
- **Error Handling**: Shows user-friendly error messages with retry option
- **Empty State**: Guides users when no recommendations are available
- **Score Display**: Shows recommendation match percentage and detailed score
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Keyboard navigation and proper ARIA labels

#### Usage

```tsx
import { RecommendationCarousel } from '@/components/recommendations';

function Dashboard() {
  const userId = getCurrentUserId(); // Get from auth context

  return (
    <div>
      <h1>Your Personalized Recommendations</h1>
      <RecommendationCarousel userId={userId} />
    </div>
  );
}
```

#### With Constraints

You can pass optional constraints to filter recommendations:

```tsx
<RecommendationCarousel
  userId={userId}
  constraints={{
    max_price: 15,
    cuisine: 'italian',
    dietary_preference: 'vegetarian',
  }}
/>
```

#### Props

| Prop          | Type                      | Required | Description                                                     |
| ------------- | ------------------------- | -------- | --------------------------------------------------------------- |
| `userId`      | `string`                  | Yes      | The ID of the user to fetch recommendations for                 |
| `constraints` | `Record<string, unknown>` | No       | Optional filters for recommendations (e.g., max_price, cuisine) |

#### API Schema

The component works with the following API response structure:

```typescript
interface RecommendationItem {
  menu_item_id: string; // Unique identifier for the menu item
  score: number; // Match score (0.0 to 1.0)
  explanation: string; // Human-readable explanation
}

interface MealRecommendationResponse {
  user_id?: string;
  recommendations: RecommendationItem[];
}
```

#### Component States

1. **Loading**: Displays a spinner while fetching recommendations
2. **Error**: Shows error message with retry button if fetch fails
3. **Empty**: Displays a message when no recommendations are available
4. **Success**: Shows the recommendation carousel with navigation

#### Navigation

- **Next Button**: Navigate to the next recommendation (wraps to first)
- **Previous Button**: Navigate to previous recommendation (wraps to last)
- **Refresh Button**: Refetch recommendations from the API
- Navigation buttons are disabled when there's only one recommendation

#### Design

The component uses shadcn/ui components for consistent styling:

- `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`
- `Button` with various variants (outline, ghost)
- `Badge` for displaying match percentage and item ID
- Lucide React icons for visual elements

## Custom Hook

### useMealRecommendations

A TanStack Query hook for fetching meal recommendations.

#### Usage

```tsx
import { useMealRecommendations } from '@/hooks/useRecommendations';

function MyComponent() {
  const { data, isLoading, isError, error, refetch } = useMealRecommendations(
    userId,
    constraints, // optional
    true // enabled (optional, default: true)
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.recommendations.map((rec) => (
        <div key={rec.menu_item_id}>{rec.explanation}</div>
      ))}
    </div>
  );
}
```

#### Features

- Automatic caching (5 minutes stale time, 30 minutes cache time)
- Automatic retry on failure (up to 2 retries)
- Query invalidation support
- Conditional fetching (can be disabled)
- Type-safe with TypeScript

## Testing

Both the component and hook have comprehensive test coverage:

```bash
# Run all tests
bun run test

# Run specific test file
bunx vitest src/components/recommendations/__tests__/RecommendationCarousel.test.tsx
bunx vitest src/hooks/__tests__/useRecommendations.test.tsx

# Run with coverage
bun run coverage
```

### Test Coverage

- ✅ Loading state
- ✅ Success state with data
- ✅ Error handling
- ✅ Empty state
- ✅ Navigation (next/previous)
- ✅ Wrap-around navigation
- ✅ Refetch functionality
- ✅ Constraints passing
- ✅ Disabled state for single item
- ✅ Score calculation
- ✅ Conditional fetching

## Backend Integration

This component integrates with the backend recommendation API:

**Endpoint**: `POST /api/recommend/meal`

**Request Body**:

```json
{
  "user_id": "string",
  "constraints": {
    "max_price": 15,
    "cuisine": "italian"
  }
}
```

**Response**:

```json
{
  "user_id": "user-123",
  "recommendations": [
    {
      "menu_item_id": "item-1",
      "score": 0.95,
      "explanation": "Restaurant: Healthy Bites, 450 cal"
    }
  ]
}
```

## Future Enhancements

- [ ] Add animation transitions between recommendations
- [ ] Support for keyboard shortcuts (arrow keys)
- [ ] Filter UI for applying constraints
- [ ] Bookmark/save favorite recommendations
- [ ] Share recommendations
- [ ] More detailed nutritional information
- [ ] Restaurant/menu item images
- [ ] Real-time updates when new recommendations are available
- [ ] Recommendation history
- [ ] A/B testing for recommendation algorithms
