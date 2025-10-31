import { Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyNutrition, formatTodayDate } from '@/hooks/useDailyNutrition';

// Default daily calorie goal (can be made configurable from user profile in future)
const DEFAULT_CALORIE_GOAL = 2000;

export function DailyCalorieGoal() {
  const { data: dailyData, isLoading } = useDailyNutrition();

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const consumed = Math.round(dailyData.totalCalories);
  const goal = DEFAULT_CALORIE_GOAL;
  const progress = Math.min((consumed / goal) * 100, 100);
  const remaining = Math.max(goal - consumed, 0);
  const isOverGoal = consumed > goal;

  return (
    <Card className="col-span-full transition-shadow hover:shadow-lg lg:col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="size-5 text-blue-600" />
              Daily Calorie Goal
            </CardTitle>
            <CardDescription>{formatTodayDate()}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Calorie Progress Display */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{consumed}</span>
              <span className="text-lg text-gray-500">/ {goal} kcal</span>
            </div>
            {!isOverGoal && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <TrendingUp className="size-4" />
                <span>{remaining} left</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all ${
                  isOverGoal ? 'bg-red-500' : progress >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{Math.round(progress)}% of daily goal</span>
              {isOverGoal && (
                <span className="font-medium text-red-600">Over by {consumed - goal} kcal</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">Meals Logged</p>
            <p className="text-2xl font-semibold text-gray-900">{dailyData.mealCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">Avg per Meal</p>
            <p className="text-2xl font-semibold text-gray-900">
              {dailyData.mealCount > 0 ? Math.round(consumed / dailyData.mealCount) : 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
