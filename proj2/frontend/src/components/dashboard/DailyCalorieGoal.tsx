import { Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyNutrition } from '@/hooks/useDailyNutrition';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

// Default daily calorie goal (can be made configurable from user profile in future)
const DEFAULT_CALORIE_GOAL = 2000;

export function DailyCalorieGoal() {
  const { data: dailyData, isLoading } = useDailyNutrition();

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const consumed = Math.round(dailyData.totalCalories);
  const goal = DEFAULT_CALORIE_GOAL;
  const progress = Math.min((consumed / goal) * 100, 100);
  const remaining = Math.max(goal - consumed, 0);
  const isOverGoal = consumed > goal;

  // Chart data
  const chartData = [
    {
      name: 'Calories',
      value: progress,
      fill: isOverGoal ? '#ef4444' : progress >= 80 ? '#eab308' : '#10b981',
    },
  ];

  return (
    <Card className="col-span-full transition-shadow hover:shadow-lg lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="size-5 text-orange-600" />
          Calories
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Radial Chart */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <ResponsiveContainer width={160} height={160}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={10} fill={chartData[0].fill} />
              </RadialBarChart>
            </ResponsiveContainer>
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{consumed}</span>
              <span className="text-xs text-gray-500">/ {goal}</span>
            </div>
          </div>
        </div>

        {/* Progress Info */}
        <div className="space-y-2 text-center">
          <div className="text-xs font-medium text-gray-600">
            {Math.round(progress)}% of daily goal
          </div>
          {!isOverGoal ? (
            <div className="text-sm font-semibold text-green-600">{remaining} kcal remaining</div>
          ) : (
            <div className="text-sm font-semibold text-red-600">Over by {consumed - goal} kcal</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
