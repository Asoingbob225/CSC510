/**
 * Wellness Overview Card for Dashboard
 * Shows today's wellness status and quick access to tracking
 */

import { useNavigate } from 'react-router';
import { Activity, ArrowRight, Brain, Moon, Smile } from 'lucide-react';
import { useTodayWellnessLog } from '@/hooks/useWellnessData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function WellnessOverviewCard() {
  const navigate = useNavigate();
  const { data: todayLog, isLoading: logLoading } = useTodayWellnessLog();

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

  if (logLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="size-5 text-purple-600" />
              Today&apos;s Wellness
            </CardTitle>
            <CardDescription>Track your mental and physical wellness</CardDescription>
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

      <CardContent className="space-y-4">
        {todayLog && (todayLog.mood_score || todayLog.stress_level || todayLog.quality_score) ? (
          <>
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
                  <p className={`text-lg font-bold ${getSleepColor(todayLog.quality_score)}`}>
                    {todayLog.quality_score || '-'}/10
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-purple-100">
              <Activity className="size-8 text-purple-600" />
            </div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">No wellness data today</h3>
            <p className="mb-4 text-xs text-gray-600">
              Start tracking your mood, stress, and sleep to build better habits
            </p>
            <Button
              onClick={() => navigate('/wellness-tracking')}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Log Your First Entry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
