import { PieChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyNutrition, formatTodayDate } from '@/hooks/useDailyNutrition';

interface MacroData {
  name: string;
  value: number;
  color: string;
  bgColor: string;
}

export function MacronutrientBalance() {
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
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const macros: MacroData[] = [
    {
      name: 'Protein',
      value: Math.round(dailyData.totalProtein),
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
    },
    {
      name: 'Carbs',
      value: Math.round(dailyData.totalCarbs),
      color: 'text-green-600',
      bgColor: 'bg-green-500',
    },
    {
      name: 'Fat',
      value: Math.round(dailyData.totalFat),
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
    },
  ];

  const totalMacros = macros.reduce((sum, macro) => sum + macro.value, 0);
  const hasData = totalMacros > 0;

  // Calculate percentages for visual representation
  const macrosWithPercentage = macros.map((macro) => ({
    ...macro,
    percentage: hasData ? (macro.value / totalMacros) * 100 : 0,
  }));

  return (
    <Card className="col-span-full transition-shadow hover:shadow-lg lg:col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <PieChart className="size-5 text-purple-600" />
              Macronutrient Balance
            </CardTitle>
            <CardDescription>{formatTodayDate()}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!hasData ? (
          <div className="flex h-40 items-center justify-center rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">No macronutrient data yet</p>
          </div>
        ) : (
          <>
            {/* Stacked Bar Chart */}
            <div className="space-y-3">
              <div className="flex h-8 w-full overflow-hidden rounded-lg">
                {macrosWithPercentage.map((macro) => (
                  <div
                    key={macro.name}
                    className={`${macro.bgColor} transition-all`}
                    style={{ width: `${macro.percentage}%` }}
                    title={`${macro.name}: ${macro.value}g (${macro.percentage.toFixed(1)}%)`}
                  />
                ))}
              </div>
            </div>

            {/* Macro Details */}
            <div className="space-y-3">
              {macrosWithPercentage.map((macro) => (
                <div key={macro.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`size-3 rounded-full ${macro.bgColor}`} />
                    <span className="text-sm font-medium text-gray-700">{macro.name}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xl font-bold ${macro.color}`}>{macro.value}g</span>
                    <span className="text-xs text-gray-500">{macro.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Macros</span>
                <span className="text-2xl font-semibold text-gray-900">{totalMacros}g</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Based on {dailyData.mealCount} meal{dailyData.mealCount !== 1 ? 's' : ''} logged
                today
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
