import { ArrowRight, Calendar, Coffee, Moon, Smile, TrendingUp, Utensils } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useDailyNutrition, formatTodayDate } from '@/hooks/useDailyNutrition';
import type { MealTypeOption } from '@/lib/api';

interface DailySummaryWidgetProps {
  onViewDetails: () => void;
}

const MEAL_TYPE_ICONS: Record<MealTypeOption, React.ComponentType<{ className?: string }>> = {
  breakfast: Coffee,
  lunch: Utensils,
  dinner: Moon,
  snack: Smile,
};

const MEAL_TYPE_LABELS: Record<MealTypeOption, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export function DailySummaryWidget({ onViewDetails }: DailySummaryWidgetProps) {
  const { data: dailyData, isLoading } = useDailyNutrition();

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group meals by type
  const mealsByType = dailyData.meals.reduce(
    (acc, meal) => {
      if (!acc[meal.meal_type]) {
        acc[meal.meal_type] = [];
      }
      acc[meal.meal_type].push(meal);
      return acc;
    },
    {} as Record<MealTypeOption, typeof dailyData.meals>
  );

  const hasMeals = dailyData.mealCount > 0;

  return (
    <Card className="col-span-full transition-shadow hover:shadow-lg lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="size-5 text-green-600" />
              Daily Summary
            </CardTitle>
            <CardDescription>{formatTodayDate()}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewDetails} className="gap-2">
            View Details
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!hasMeals ? (
          <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 py-12">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <Utensils className="size-8 text-gray-400" />
            </div>
            <h4 className="mb-2 text-lg font-semibold text-gray-700">No meals logged yet</h4>
            <p className="text-sm text-gray-500">Start tracking your nutrition by logging a meal</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
                  <TrendingUp className="size-4" />
                  Calories
                </div>
                <p className="mt-2 text-2xl font-bold text-blue-900">
                  {Math.round(dailyData.totalCalories)}
                </p>
                <p className="text-xs text-blue-600">kcal</p>
              </div>

              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-green-700">
                  <TrendingUp className="size-4" />
                  Protein
                </div>
                <p className="mt-2 text-2xl font-bold text-green-900">
                  {Math.round(dailyData.totalProtein)}
                </p>
                <p className="text-xs text-green-600">g</p>
              </div>

              <div className="rounded-lg bg-yellow-50 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-yellow-700">
                  <TrendingUp className="size-4" />
                  Carbs
                </div>
                <p className="mt-2 text-2xl font-bold text-yellow-900">
                  {Math.round(dailyData.totalCarbs)}
                </p>
                <p className="text-xs text-yellow-600">g</p>
              </div>

              <div className="rounded-lg bg-orange-50 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-orange-700">
                  <TrendingUp className="size-4" />
                  Fat
                </div>
                <p className="mt-2 text-2xl font-bold text-orange-900">
                  {Math.round(dailyData.totalFat)}
                </p>
                <p className="text-xs text-orange-600">g</p>
              </div>
            </div>

            {/* Meals by Type */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Meals Logged Today</h4>
              <div className="grid gap-3 md:grid-cols-2">
                {(Object.entries(mealsByType) as [MealTypeOption, typeof dailyData.meals][]).map(
                  ([mealType, meals]) => {
                    const Icon = MEAL_TYPE_ICONS[mealType];
                    const totalCalories = meals.reduce(
                      (sum, meal) => sum + (meal.total_calories ?? 0),
                      0
                    );

                    return (
                      <div
                        key={mealType}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-gray-100 p-2">
                            <Icon className="size-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {MEAL_TYPE_LABELS[mealType]}
                            </p>
                            <p className="text-xs text-gray-500">
                              {meals.length} entr{meals.length === 1 ? 'y' : 'ies'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-semibold">
                          {Math.round(totalCalories)} kcal
                        </Badge>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
