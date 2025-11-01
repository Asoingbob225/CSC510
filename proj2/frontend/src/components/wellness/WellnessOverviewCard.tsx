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
import { utcToLocalDate } from '@/lib/dateUtils';

export function WellnessOverviewCard() {
  const navigate = useNavigate();
  const { data: todayLog, isLoading: logLoading } = useTodayWellnessLog();

  // Get last 7 days of wellness data (in local timezone)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6); // Last 7 days including today

  // Format dates as YYYY-MM-DD in local timezone
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const { data: weekLogs, isLoading: weekLoading } = useWellnessLogs({
    start_date: formatLocalDate(startDate),
    end_date: formatLocalDate(endDate),
  });

  // Prepare chart data for the last 7 days
  const chartData = useMemo(() => {
    if (!weekLogs || weekLogs.length === 0) return [];

    // Get today's local date
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Group logs by date
    const logsByDate = new Map<
      string,
      {
        mood?: number;
        stress?: number;
        sleep?: number;
        isToday: boolean;
      }
    >();

    // Process all logs and group by date
    weekLogs.forEach((log) => {
      // Convert UTC datetime to local date
      if (!log.occurred_at_utc) return;
      const dateStr = utcToLocalDate(log.occurred_at_utc);

      if (!logsByDate.has(dateStr)) {
        logsByDate.set(dateStr, { isToday: dateStr === today });
      }

      const dayData = logsByDate.get(dateStr)!;
      if (log.mood_score !== undefined) dayData.mood = log.mood_score;
      if (log.stress_level !== undefined) dayData.stress = log.stress_level;
      if (log.quality_score !== undefined) dayData.sleep = log.quality_score;
    });

    // Convert to array and sort by date (oldest first for left-to-right display)
    const days = Array.from(logsByDate.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

  // Wellness metric row component
  const WellnessMetricRow = ({
    icon: Icon,
    iconBgColor,
    iconColor,
    label,
    dataKey,
    strokeColor,
    value,
    valueColorClass,
    emoji,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    iconBgColor: string;
    iconColor: string;
    label: string;
    dataKey: 'mood' | 'stress' | 'sleep';
    strokeColor: string;
    value?: number | null;
    valueColorClass?: string;
    emoji?: string;
  }) => (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${iconBgColor}`}
      >
        <Icon className={`size-5 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="mt-1 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={strokeColor}
                strokeWidth={2}
                dot={(props) => (
                  <CustomDot {...props} dataKey={dataKey} activeColor={strokeColor} />
                )}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={`text-2xl font-bold ${valueColorClass || 'text-foreground'}`}>
          {value || '-'}
        </span>
        <span className="text-xs text-muted-foreground">/10</span>
      </div>
      {emoji && <span className="text-2xl">{emoji}</span>}
    </div>
  );

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
              <Activity className="size-5 text-blue-600" />
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
            <WellnessMetricRow
              icon={Smile}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
              label="Mood"
              dataKey="mood"
              strokeColor="hsl(221, 83%, 53%)"
              value={todayLog.mood_score}
              emoji={getMoodEmoji(todayLog.mood_score)}
            />

            {/* Stress Row */}
            <WellnessMetricRow
              icon={Brain}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-600"
              label="Stress"
              dataKey="stress"
              strokeColor="hsl(25, 95%, 53%)"
              value={todayLog.stress_level}
              valueColorClass={getStressColor(todayLog.stress_level)}
            />

            {/* Sleep Row */}
            <WellnessMetricRow
              icon={Moon}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-600"
              label="Sleep"
              dataKey="sleep"
              strokeColor="hsl(271, 91%, 65%)"
              value={todayLog.quality_score}
              valueColorClass={getSleepColor(todayLog.quality_score)}
            />
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100">
              <Activity className="size-8 text-blue-600" />
            </div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">No wellness data today</h3>
            <p className="mb-4 text-xs text-gray-600">
              Start tracking your mood, stress, and sleep to build better habits
            </p>
            <Button
              onClick={() => navigate('/wellness-tracking')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Log Your First Entry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
