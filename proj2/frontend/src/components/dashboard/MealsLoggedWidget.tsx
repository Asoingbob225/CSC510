import { Calendar, Coffee, Moon, Smile, Utensils, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyNutrition, formatTodayDate } from '@/hooks/useDailyNutrition';
import type { MealTypeOption } from '@/lib/api';

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

interface MealsLoggedWidgetProps {
  onViewDetails: () => void;
}

export function MealsLoggedWidget({ onViewDetails }: MealsLoggedWidgetProps) {
  const { data: dailyData, isLoading } = useDailyNutrition();

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
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
              <Calendar className="size-5 text-emerald-600" />
              Meals Logged Today
            </CardTitle>
            <CardDescription>{formatTodayDate()}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewDetails} className="gap-2">
            View All
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!hasMeals ? (
          <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 py-12">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <Utensils className="size-8 text-gray-400" />
            </div>
            <h4 className="mb-2 text-lg font-semibold text-gray-700">No meals logged yet</h4>
            <p className="text-sm text-gray-500">Start tracking your nutrition by logging a meal</p>
          </div>
        ) : (
          <div className="space-y-3">
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
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-emerald-300 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-50 p-2">
                          <Icon className="size-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{MEAL_TYPE_LABELS[mealType]}</p>
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

            {/* Summary Stats */}
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-emerald-50 p-4">
              <div className="text-center">
                <p className="text-xs font-medium text-emerald-700">Total Meals</p>
                <p className="text-2xl font-bold text-emerald-900">{dailyData.mealCount}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-emerald-700">Total Calories</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {Math.round(dailyData.totalCalories)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
