import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { recommendationApi, type RecommendationItem } from '@/lib/api';
import { toast } from 'sonner';

interface RecommendationCarouselProps {
  userId: string;
}

export function RecommendationCarousel({ userId }: RecommendationCarouselProps) {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await recommendationApi.getMealRecommendations(userId);
      setRecommendations(response.recommendations);
      setCurrentIndex(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recommendations';
      setError(errorMessage);
      toast.error('Failed to load meal recommendations');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : recommendations.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < recommendations.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meal Recommendations</CardTitle>
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meal Recommendations</CardTitle>
          <CardDescription>Unable to load recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-sm text-red-600">{error}</p>
            <Button onClick={fetchRecommendations} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meal Recommendations</CardTitle>
          <CardDescription>No recommendations available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-sm text-gray-600">
              Complete your health profile to get personalized meal recommendations!
            </p>
            <Button onClick={fetchRecommendations} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentRecommendation = recommendations[currentIndex];
  const scorePercentage = Math.round(currentRecommendation.score * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Meal Recommendations</CardTitle>
            <CardDescription>
              Personalized suggestions based on your profile
            </CardDescription>
          </div>
          <Button onClick={fetchRecommendations} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Recommendation Card */}
          <div className="rounded-lg border bg-muted/50 p-6">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-gray-900">
                  {currentRecommendation.explanation}
                </h3>
              </div>
              <div className="ml-4 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                {scorePercentage}% Match
              </div>
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
