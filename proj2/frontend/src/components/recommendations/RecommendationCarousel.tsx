import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Progress } from '@/components/ui/progress';
import { ChefHat, RefreshCw, Sparkles, UtensilsCrossed, Eraser, Bot, Baseline } from 'lucide-react';
import { useMealRecommendations } from '@/hooks/useRecommendations';
import type {
  MealRecommendationResponse,
  RecommendationFiltersPayload,
  RecommendationMode,
} from '@/lib/api';

interface RecommendationCarouselProps {
  userId: string;
  initialFilters?: RecommendationFiltersPayload;
  initialMode?: RecommendationMode;
}

interface NormalizedRecommendation {
  id: string;
  name: string;
  score: number;
  explanation: string;
  highlights: string[];
  restaurant?: string;
  description?: string;
  price?: number;
  calories?: number;
}

const priceRanges = [
  { value: '$', label: 'Budget ($)' },
  { value: '$$', label: 'Casual ($$)' },
  { value: '$$$', label: 'Premium ($$$)' },
  { value: '$$$$', label: 'Fine Dining ($$$$)' },
] as const;

// Common dietary preferences
const COMMON_DIETS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'] as const;

// Common cuisines
const COMMON_CUISINES = [
  'italian',
  'chinese',
  'japanese',
  'mexican',
  'indian',
  'thai',
  'american',
  'mediterranean',
] as const;

const clampScore = (value: unknown): number => {
  const parsed =
    typeof value === 'number' ? value : typeof value === 'string' ? Number.parseFloat(value) : 0;
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.min(1, Math.max(0, parsed));
};

const extractRestaurant = (explanation: string, fallback?: string): string | undefined => {
  const match = explanation.match(/restaurant[:\s-]+([^;,\n]+)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return fallback;
};

const splitHighlights = (explanation: string): string[] => {
  if (!explanation) {
    return [];
  }

  const segments = explanation
    .split(/[\n;]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length > 1) {
    return segments;
  }

  return explanation
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean);
};

const normalizeRecommendationResponse = (
  data?: MealRecommendationResponse
): NormalizedRecommendation[] => {
  if (!data) {
    return [];
  }

  if ('items' in data) {
    return data.items.map((item) => {
      const record = item as Record<string, unknown>;
      const score = clampScore(item.score);
      const explanation = item.explanation?.trim() ?? '';
      const restaurantField = (() => {
        const direct = record.restaurant;
        if (typeof direct === 'string') {
          return direct;
        }
        if (direct && typeof direct === 'object' && 'name' in direct) {
          const maybeName = (direct as Record<string, unknown>).name;
          if (typeof maybeName === 'string') {
            return maybeName;
          }
        }
        const restaurantNameField = record.restaurant_name;
        if (typeof restaurantNameField === 'string') {
          return restaurantNameField;
        }
        return undefined;
      })();

      const restaurant = extractRestaurant(explanation, restaurantField);
      const highlights = splitHighlights(explanation).filter(
        (entry) => !entry.toLowerCase().startsWith('restaurant')
      );

      return {
        id: String(item.item_id),
        name: item.name?.trim() || 'Recommended item',
        score,
        explanation,
        highlights,
        restaurant,
        description: typeof record.description === 'string' ? record.description : undefined,
        price:
          typeof record.price === 'number'
            ? record.price
            : typeof record.price === 'string'
              ? Number.parseFloat(record.price)
              : undefined,
        calories:
          typeof record.calories === 'number'
            ? record.calories
            : typeof record.calories === 'string'
              ? Number.parseFloat(record.calories)
              : undefined,
      };
    });
  }

  if ('recommendations' in data) {
    return data.recommendations.map((item) => {
      const explanation = item.explanation?.trim() ?? '';
      const restaurantName = extractRestaurant(explanation, item.restaurant?.name);
      const highlights = splitHighlights(explanation).filter(
        (entry) => !entry.toLowerCase().startsWith('restaurant')
      );

      return {
        id: String(item.menu_item_id),
        name: item.menu_item?.name ?? 'Recommended item',
        score: clampScore(item.score),
        explanation,
        highlights,
        restaurant: restaurantName,
        description: item.menu_item?.description,
        price: item.menu_item?.price ?? undefined,
        calories: item.menu_item?.calories ?? undefined,
      };
    });
  }

  return [];
};

export function RecommendationCarousel({
  userId,
  initialFilters,
  initialMode = 'llm',
}: RecommendationCarouselProps) {
  const [mode, setMode] = useState<RecommendationMode>(initialMode);
  const [appliedFilters, setAppliedFilters] = useState<RecommendationFiltersPayload | undefined>(
    initialFilters
  );
  const [formState, setFormState] = useState<{
    diet: string[];
    cuisine: string[];
    priceRange: string;
  }>(() => ({
    diet: initialFilters?.diet ?? [],
    cuisine: initialFilters?.cuisine ?? [],
    priceRange: initialFilters?.price_range ?? '',
  }));

  // Track whether user has manually requested recommendations
  const [hasRequestedRecommendations, setHasRequestedRecommendations] = useState(false);

  const appliedOptions = useMemo(() => {
    const filters =
      appliedFilters && Object.keys(appliedFilters).length > 0 ? appliedFilters : undefined;
    return { mode, filters };
  }, [mode, appliedFilters]);

  const { data, isLoading, isError, error, refetch } = useMealRecommendations(
    userId,
    appliedOptions,
    hasRequestedRecommendations // Only fetch when user requests
  );

  const recommendations = useMemo(() => normalizeRecommendationResponse(data), [data]);

  const handleApplyFilters = () => {
    const filters: RecommendationFiltersPayload = {};

    if (formState.diet.length > 0) {
      filters.diet = formState.diet;
    }
    if (formState.cuisine.length > 0) {
      filters.cuisine = formState.cuisine;
    }
    if (formState.priceRange) {
      filters.price_range = formState.priceRange as RecommendationFiltersPayload['price_range'];
    }

    setAppliedFilters(Object.keys(filters).length > 0 ? filters : undefined);
  };

  const handleGetRecommendations = () => {
    handleApplyFilters();
    setHasRequestedRecommendations(true);
    if (hasRequestedRecommendations) {
      void refetch();
    }
  };

  const handleUpdateRecommendations = () => {
    handleApplyFilters();
    void refetch();
  };

  const handleRefresh = () => {
    void refetch();
  };

  const handleModeSelect = (nextMode: RecommendationMode) => {
    setMode(nextMode);
  };

  const handleClearFilters = () => {
    setFormState({
      diet: [],
      cuisine: [],
      priceRange: '',
    });
  };

  // Initial state - user hasn't requested recommendations yet
  if (!hasRequestedRecommendations) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Meal Recommendations</CardTitle>
          </div>
          <CardDescription>
            Get personalized meal suggestions based on your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Mode Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Recommendation Engine</Label>
              <div className="flex gap-2">
                {(['llm', 'baseline'] as RecommendationMode[]).map((option) => (
                  <Button
                    key={option}
                    type="button"
                    size="sm"
                    variant={mode === option ? 'default' : 'outline'}
                    onClick={() => setMode(option)}
                    className="gap-2"
                  >
                    {option === 'llm' ? (
                      <>
                        <Bot className="h-4 w-4" />
                        AI Powered
                      </>
                    ) : (
                      <>
                        <Baseline className="h-4 w-4" />
                        Basic
                      </>
                    )}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {mode === 'llm'
                  ? 'Use advanced AI to analyze your preferences and health profile'
                  : 'Quick recommendations based on basic criteria'}
              </p>
            </div>

            {/* Filters Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Dietary Restrictions</Label>
                <ToggleGroup
                  type="multiple"
                  value={formState.diet}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, diet: value }))}
                  className="flex-wrap justify-start"
                  variant="outline"
                  spacing={2}
                  size="sm"
                >
                  {COMMON_DIETS.map((diet) => (
                    <ToggleGroupItem
                      key={diet}
                      value={diet}
                      className="capitalize data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      {diet}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <Label>Preferred Cuisines</Label>
                <ToggleGroup
                  type="multiple"
                  value={formState.cuisine}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, cuisine: value }))}
                  className="flex-wrap justify-start"
                  variant="outline"
                  spacing={2}
                  size="sm"
                >
                  {COMMON_CUISINES.map((cuisine) => (
                    <ToggleGroupItem
                      key={cuisine}
                      value={cuisine}
                      className="capitalize data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      {cuisine}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <Label>Price Range</Label>
                <ToggleGroup
                  type="single"
                  value={formState.priceRange}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, priceRange: value || '' }))
                  }
                  className="flex-wrap justify-start"
                  variant="outline"
                  spacing={2}
                  size="sm"
                >
                  {priceRanges.map((range) => (
                    <ToggleGroupItem
                      key={range.value}
                      value={range.value}
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      {range.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  disabled={
                    formState.diet.length === 0 &&
                    formState.cuisine.length === 0 &&
                    !formState.priceRange
                  }
                  className="gap-2"
                >
                  <Eraser className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Get Recommendations Button */}
            <div className="border-t pt-4">
              <Button onClick={handleGetRecommendations} className="w-full" size="lg">
                <ChefHat className="mr-2 h-5 w-5" />
                Get Recommendations
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Click to get personalized meal suggestions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Meal Recommendations</CardTitle>
          </div>
          <CardDescription>Loading personalized recommendations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Meal Recommendations</CardTitle>
          </div>
          <CardDescription>Unable to load recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-sm text-red-600">
              {error instanceof Error ? error.message : 'Failed to load recommendations'}
            </p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Meal Recommendations</CardTitle>
          </div>
          <CardDescription>No recommendations available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-8">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">
              Complete your health profile or adjust the filters to see personalized meal ideas.
            </p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 text-primary" />
            <div>
              <CardTitle>Meal Recommendations</CardTitle>
              <CardDescription>
                Personalized suggestions powered by{' '}
                {mode === 'llm' ? 'LLM insights' : 'baseline heuristics'}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Engine</span>
            {(['llm', 'baseline'] as RecommendationMode[]).map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant={mode === option ? 'default' : 'outline'}
                onClick={() => handleModeSelect(option)}
                className="gap-2"
              >
                {option === 'llm' ? (
                  <>
                    <Bot className="h-4 w-4" />
                    AI
                  </>
                ) : (
                  <>
                    <Baseline className="h-4 w-4" />
                    Baseline
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className="grid gap-4 rounded-lg border bg-muted/20 p-4"
          aria-label="Recommendation filters"
        >
          <div className="space-y-2">
            <Label>Dietary Restrictions</Label>
            <ToggleGroup
              type="multiple"
              value={formState.diet}
              onValueChange={(value) => setFormState((prev) => ({ ...prev, diet: value }))}
              className="flex-wrap justify-start"
              variant="outline"
              spacing={2}
              size="sm"
            >
              {COMMON_DIETS.map((diet) => (
                <ToggleGroupItem
                  key={diet}
                  value={diet}
                  className="capitalize data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {diet}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label>Preferred Cuisines</Label>
            <ToggleGroup
              type="multiple"
              value={formState.cuisine}
              onValueChange={(value) => setFormState((prev) => ({ ...prev, cuisine: value }))}
              className="flex-wrap justify-start"
              variant="outline"
              spacing={2}
              size="sm"
            >
              {COMMON_CUISINES.map((cuisine) => (
                <ToggleGroupItem
                  key={cuisine}
                  value={cuisine}
                  className="capitalize data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {cuisine}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Price Range</Label>
              <ToggleGroup
                type="single"
                value={formState.priceRange}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, priceRange: value || '' }))
                }
                className="flex-wrap justify-start"
                variant="outline"
                spacing={2}
                size="sm"
              >
                {priceRanges.map((range) => (
                  <ToggleGroupItem
                    key={range.value}
                    value={range.value}
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    {range.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                disabled={
                  formState.diet.length === 0 &&
                  formState.cuisine.length === 0 &&
                  !formState.priceRange
                }
                className="gap-2"
                aria-label="Clear filters"
              >
                <Eraser className="h-4 w-4" />
                Clear Filters
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleUpdateRecommendations}
                className="gap-2"
                aria-label="Update recommendations"
              >
                <Sparkles className="h-4 w-4" />
                Update
              </Button>
            </div>
          </div>
        </div>

        {appliedFilters && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold uppercase">Active filters:</span>
            {appliedFilters.diet?.map((diet) => (
              <Badge key={`diet-${diet}`} variant="secondary">
                Diet: {diet}
              </Badge>
            ))}
            {appliedFilters.cuisine?.map((cuisine) => (
              <Badge key={`cuisine-${cuisine}`} variant="secondary">
                Cuisine: {cuisine}
              </Badge>
            ))}
            {appliedFilters.price_range && (
              <Badge variant="secondary">Price: {appliedFilters.price_range}</Badge>
            )}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((item) => {
            const scorePercent = Math.round(item.score * 100);
            const metaBadges = [
              item.price !== undefined ? `$${item.price.toFixed(2)}` : undefined,
              item.calories !== undefined ? `${Math.round(item.calories)} kcal` : undefined,
            ].filter(Boolean) as string[];

            return (
              <div
                key={item.id}
                className="flex h-full flex-col rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        #{item.id.slice(0, 8)}
                      </Badge>
                      <Badge
                        variant={scorePercent >= 80 ? 'default' : 'secondary'}
                        className="text-xs font-semibold"
                      >
                        {scorePercent}% match
                      </Badge>
                    </div>
                    <p className="text-base font-semibold">{item.name}</p>
                    {item.restaurant && (
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <ChefHat className="h-4 w-4" />
                        {item.restaurant}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <Progress value={scorePercent} className="h-2 bg-muted" />
                  <p className="text-xs text-muted-foreground">Score: {item.score.toFixed(2)}</p>
                </div>

                {item.description && (
                  <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}

                {metaBadges.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {metaBadges.map((label) => (
                      <Badge key={`${item.id}-${label}`} variant="secondary">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}

                {item.highlights.length > 0 && (
                  <ul className="mb-4 space-y-1 text-sm text-muted-foreground">
                    {item.highlights.map((highlight, index) => (
                      <li key={`${item.id}-highlight-${index}`}>• {highlight}</li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                  <span>Reasoned by {mode === 'llm' ? 'LLM' : 'baseline'} engine</span>
                  <span>{item.explanation ? 'Explainer available' : 'No explanation'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
