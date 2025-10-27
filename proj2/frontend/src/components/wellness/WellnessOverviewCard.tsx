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
  const { data: activeGoals, isLoading: goalsLoading } = useActiveGoals();

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
            {activeGoals && activeGoals.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeGoals.length} {activeGoals.length === 1 ? 'goal' : 'goals'}
              </Badge>
            )}
          </div>

          {activeGoals && activeGoals.length > 0 ? (
            <div className="space-y-2">
              {activeGoals.slice(0, 3).map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{goal.description}</p>
                      <p className="text-xs text-gray-500">{goal.goal_type}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        goal.priority === 'high'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : goal.priority === 'medium'
                            ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                            : 'border-green-200 bg-green-50 text-green-700'
                      }
                    >
                      {goal.priority}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Progress</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="size-3" />
                        <span className="font-medium">
                          {calculateGoalProgress(goal).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <Progress value={calculateGoalProgress(goal)} className="h-1.5" />
                  </div>
                </div>
              ))}

              {activeGoals.length > 3 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => navigate('/wellness-tracking')}
                  className="w-full text-xs text-purple-600"
                >
                  View {activeGoals.length - 3} more{' '}
                  {activeGoals.length - 3 === 1 ? 'goal' : 'goals'}
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center">
              <p className="mb-2 text-sm text-gray-600">No active goals set</p>
              <Button onClick={() => navigate('/wellness-tracking')} size="sm" variant="outline">
                Set Your First Goal
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 pt-4">
          <Button
            onClick={() => navigate('/wellness-tracking')}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          >
            <Activity className="mr-2 size-4" />
            Go to Wellness Tracking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
