import { PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyNutrition } from '@/hooks/useDailyNutrition';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MacroData {
  name: string;
  value: number;
  color: string;
  bgColor: string;
  fill: string; // For Recharts
}

export function MacronutrientBalance() {
  const { data: dailyData, isLoading } = useDailyNutrition();

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
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
      fill: '#3b82f6',
    },
    {
      name: 'Carbs',
      value: Math.round(dailyData.totalCarbs),
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      fill: '#22c55e',
    },
    {
      name: 'Fat',
      value: Math.round(dailyData.totalFat),
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
      fill: '#f97316',
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
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChartIcon className="size-5 text-purple-600" />
          Macros
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-sm text-gray-500">No data yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pie Chart */}
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={macrosWithPercentage.filter((m) => m.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {macrosWithPercentage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}g`, name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Macro Details */}
            <div className="grid grid-cols-3 gap-2">
              {macrosWithPercentage.map((macro) => (
                <div key={macro.name} className="text-center">
                  <div className="mb-1 flex items-center justify-center gap-1">
                    <div className={`size-2 rounded-full ${macro.bgColor}`} />
                    <span className="text-xs font-medium text-gray-600">{macro.name}</span>
                  </div>
                  <p className={`text-xl font-bold ${macro.color}`}>{macro.value}g</p>
                  <p className="text-xs text-gray-500">{macro.percentage.toFixed(0)}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
