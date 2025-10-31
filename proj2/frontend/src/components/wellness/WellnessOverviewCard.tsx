/**
 * Wellness Overview Card for Dashboard
 * Shows today's wellness status and quick access to tracking
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Activity, ArrowRight, Brain, Moon, Smile } from 'lucide-react';
import { useTodayWellnessLog, useWellnessLogs } from '@/hooks/useWellnessData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

export function WellnessOverviewCard() {
  const navigate = useNavigate();
  const { data: todayLog, isLoading: logLoading } = useTodayWellnessLog();

  // Get last 7 days of wellness data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6); // Last 7 days including today

  const { data: weekLogs, isLoading: weekLoading } = useWellnessLogs({
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
  });

  // Prepare chart data for the last 7 days
  const chartData = useMemo(() => {
    const days = [];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Find logs for this date - each type might be in a separate log entry
      const dayLogs = weekLogs?.filter((log) => log.log_date?.startsWith(dateStr)) || [];

      // Extract values from different log entries
      const moodLog = dayLogs.find((log) => log.mood_score !== undefined);
      const stressLog = dayLogs.find((log) => log.stress_level !== undefined);
      const sleepLog = dayLogs.find((log) => log.quality_score !== undefined);

      days.push({
        date: dateStr,
        isToday: dateStr === today,
        mood: moodLog?.mood_score ?? null,
        stress: stressLog?.stress_level ?? null,
        sleep: sleepLog?.quality_score ?? null,
      });
    }

    console.log('Chart data:', days); // Debug log
    console.log('Week logs:', weekLogs); // Debug log
    return days;
  }, [weekLogs]);

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

  // Custom dot component for highlighting today's value
  const CustomDot = (props: {
    cx?: number;
    cy?: number;
    payload?: { isToday?: boolean };
    dataKey?: string;
    activeColor?: string;
  }) => {
    const { cx, cy, payload, activeColor } = props;
    if (!cx || !cy || !payload) return null;

    if (payload.isToday) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill={activeColor}
          stroke="white"
          strokeWidth={2}
          className="drop-shadow-md"
        />
      );
    }
    return <circle cx={cx} cy={cy} r={2} fill="hsl(215, 20%, 65%)" fillOpacity={0.5} />;
  };

  if (logLoading || weekLoading) {
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
          <div className="space-y-3">
            {/* Mood Row */}
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <Smile className="size-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Mood</p>
                <div className="mt-1 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="hsl(221, 83%, 53%)"
                        strokeWidth={2}
                        dot={(props) => (
                          <CustomDot {...props} dataKey="mood" activeColor="hsl(221, 83%, 53%)" />
                        )}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-2xl font-bold text-foreground">
                  {todayLog.mood_score || '-'}
                </span>
                <span className="text-xs text-muted-foreground">/10</span>
              </div>
              <span className="text-2xl">{getMoodEmoji(todayLog.mood_score)}</span>
            </div>

            {/* Stress Row */}
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-50">
                <Brain className="size-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Stress</p>
                <div className="mt-1 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                      <Line
                        type="monotone"
                        dataKey="stress"
                        stroke="hsl(25, 95%, 53%)"
                        strokeWidth={2}
                        dot={(props) => (
                          <CustomDot {...props} dataKey="stress" activeColor="hsl(25, 95%, 53%)" />
                        )}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={`text-2xl font-bold ${getStressColor(todayLog.stress_level)}`}>
                  {todayLog.stress_level || '-'}
                </span>
                <span className="text-xs text-muted-foreground">/10</span>
              </div>
            </div>

            {/* Sleep Row */}
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-50">
                <Moon className="size-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Sleep</p>
                <div className="mt-1 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                      <Line
                        type="monotone"
                        dataKey="sleep"
                        stroke="hsl(271, 91%, 65%)"
                        strokeWidth={2}
                        dot={(props) => (
                          <CustomDot {...props} dataKey="sleep" activeColor="hsl(271, 91%, 65%)" />
                        )}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={`text-2xl font-bold ${getSleepColor(todayLog.quality_score)}`}>
                  {todayLog.quality_score || '-'}
                </span>
                <span className="text-xs text-muted-foreground">/10</span>
              </div>
            </div>
          </div>
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
