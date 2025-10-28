import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, RefreshCw, Sparkles, UtensilsCrossed } from 'lucide-react';
import { useMealRecommendations } from '@/hooks/useRecommendations';
import type { RecommendationItem } from '@/lib/api';

interface RecommendationCarouselProps {
  userId: string;
  constraints?: Record<string, unknown>;
}

export function RecommendationCarousel({ userId, constraints }: RecommendationCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use TanStack Query for data fetching
  const { data, isLoading, isError, error, refetch } = useMealRecommendations(userId, constraints);

  const recommendations = data?.recommendations || [];

  // Reset index when recommendations change
  const handleRefresh = () => {
    setCurrentIndex(0);
    refetch();
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : recommendations.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < recommendations.length - 1 ? prev + 1 : 0));
  };

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
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
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
            <UtensilsCrossed className="h-12 w-12 text-gray-300" />
            <p className="text-center text-sm text-gray-600">
              Complete your health profile to get personalized meal recommendations!
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

  const currentRecommendation: RecommendationItem = recommendations[currentIndex];
  const scorePercentage = Math.round(currentRecommendation.score * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Meal Recommendations</CardTitle>
              <CardDescription>Personalized suggestions based on your profile</CardDescription>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Recommendation Card */}
          <div className="rounded-lg border bg-linear-to-br from-muted/50 to-muted/30 p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    ID: {currentRecommendation.menu_item_id.slice(0, 8)}...
                  </Badge>
                  <Badge
                    variant={scorePercentage >= 80 ? 'default' : 'secondary'}
                    className="font-semibold"
                  >
                    {scorePercentage}% Match
                  </Badge>
                </div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  {currentRecommendation.explanation}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-300"
                      style={{ width: `${scorePercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Score: {currentRecommendation.score.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional metadata if available */}
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="rounded-md bg-background/80 px-2 py-1">
                Menu Item ID: {currentRecommendation.menu_item_id}
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              variant="outline"
              size="sm"
              disabled={recommendations.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              {currentIndex + 1} of {recommendations.length}
            </span>
            <Button
              onClick={handleNext}
              variant="outline"
              size="sm"
              disabled={recommendations.length <= 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
