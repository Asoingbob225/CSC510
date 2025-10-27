/**
 * Wellness Overview Card for Dashboard
 * Shows today's wellness status and quick access to tracking
 */

import { useNavigate } from 'react-router';
import { Activity, TrendingUp, ArrowRight, Brain, Moon, Smile } from 'lucide-react';
import { useTodayWellnessLog } from '@/hooks/useWellnessData';
import { useActiveGoals } from '@/hooks/useGoalsData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { calculateGoalProgress } from '@/hooks/useGoalsData';

export function WellnessOverviewCard() {
  const navigate = useNavigate();
  const { data: todayLog, isLoading: logLoading } = useTodayWellnessLog();
  const { data: activeGoals = [], isLoading: goalsLoading } = useActiveGoals();

  const isLoading = logLoading || goalsLoading;

  // Get mood emoji
  const getMoodEmoji = (score?: number | null) => {
    if (!score) return '❓';
    if (score >= 9) return '🤩';
    if (score >= 7) return '😊';
    if (score >= 5) return '😐';
    if (score >= 3) return '😕';
    return '😢';
  };

  // Get stress color
  const getStressColor = (level?: number | null) => {
    if (!level) return 'text-gray-400';
    if (level >= 8) return 'text-red-600';
    if (level >= 6) return 'text-orange-600';
    if (level >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Get sleep quality color
  const getSleepColor = (quality?: number | null) => {
    if (!quality) return 'text-gray-400';
    if (quality >= 8) return 'text-green-600';
    if (quality >= 6) return 'text-blue-600';
    if (quality >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
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

  return (
    <Card className="col-span-full transition-shadow hover:shadow-lg lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="size-5 text-purple-600" />
              Wellness Tracking
            </CardTitle>
            <CardDescription>Track your mental and physical wellness journey</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/wellness-tracking')}
            className="gap-2"
          >
            View All
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Today's Status */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Today&apos;s Status</h3>

          {todayLog ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Mood */}
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                  <Smile className="size-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600">Mood</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {todayLog.mood_score || '-'}/10
                    </span>
                    <span className="text-xl">{getMoodEmoji(todayLog.mood_score)}</span>
                  </div>
                </div>
              </div>

              {/* Stress */}
              <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-orange-100">
                  <Brain className="size-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600">Stress</p>
                  <p className={`text-lg font-bold ${getStressColor(todayLog.stress_level)}`}>
                    {todayLog.stress_level || '-'}/10
                  </p>
                </div>
              </div>

              {/* Sleep */}
              <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-purple-100">
                  <Moon className="size-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600">Sleep</p>
                  <p className={`text-lg font-bold ${getSleepColor(todayLog.sleep_quality)}`}>
                    {todayLog.sleep_quality || '-'}/10
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
              <p className="mb-3 text-sm text-gray-600">No wellness data logged today</p>
              <Button
                onClick={() => navigate('/wellness-tracking')}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Log Your First Entry
              </Button>
            </div>
          )}
        </div>

        {/* Active Goals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Active Goals</h3>
            {activeGoals.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeGoals.length} {activeGoals.length === 1 ? 'goal' : 'goals'}
              </Badge>
            )}
          </div>

          {activeGoals.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {activeGoals.slice(0, 6).map((goal) => {
                const formatTargetType = (targetType: string) => {
                  return targetType
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                };

                return (
                  <div
                    key={goal.id}
                    className="rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-purple-300 hover:shadow-sm"
                  >
                    <div className="mb-1.5 flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-gray-900">
                          {formatTargetType(goal.target_type)}
                        </p>
                        <p className="text-[10px] text-gray-500 capitalize">{goal.goal_type}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`h-4 shrink-0 px-1.5 py-0 text-[10px] ${
                          goal.status === 'active'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : goal.status === 'completed'
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      >
                        {goal.status}
                      </Badge>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-gray-600">
                        <span>Progress</span>
                        <div className="flex items-center gap-0.5">
                          <TrendingUp className="size-2.5" />
                          <span className="font-medium">
                            {calculateGoalProgress(goal).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <Progress value={calculateGoalProgress(goal)} className="h-1" />
                      <div className="flex items-center justify-between text-[10px] text-gray-500">
                        <span>{goal.current_value}</span>
                        <span>/ {goal.target_value}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center">
              <p className="mb-2 text-sm text-gray-600">No active goals set</p>
              <Button onClick={() => navigate('/wellness-tracking')} size="sm" variant="outline">
                Set Your First Goal
              </Button>
            </div>
          )}

          {activeGoals.length > 6 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/wellness-tracking')}
              className="w-full text-xs text-purple-600 hover:text-purple-700"
            >
              View {activeGoals.length - 6} more {activeGoals.length - 6 === 1 ? 'goal' : 'goals'}
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 pt-4">
          <Button
            onClick={() => navigate('/wellness-tracking')}
            className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Activity className="mr-2 size-4" />
            Go to Wellness Tracking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
