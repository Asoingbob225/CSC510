import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Brain, Moon } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataPoint {
  date: string;
  value: number;
}

interface WellnessChartProps {
  data: DataPoint[];
  metric: 'mood' | 'stress' | 'sleep';
  title?: string;
  showLegend?: boolean;
}

const METRIC_CONFIG = {
  mood: {
    label: 'Mood Score',
    color: '#3b82f6', // blue
    icon: Brain,
    yAxisLabel: 'Score (1-10)',
  },
  stress: {
    label: 'Stress Level',
    color: '#f97316', // orange
    icon: Activity,
    yAxisLabel: 'Level (1-10)',
  },
  sleep: {
    label: 'Sleep Quality',
    color: '#a855f7', // purple
    icon: Moon,
    yAxisLabel: 'Quality (1-10)',
  },
};

function WellnessChart({ data, metric, title, showLegend = true }: WellnessChartProps) {
  const config = METRIC_CONFIG[metric];
  const Icon = config.icon;

  // Prepare chart data (last 7 days)
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // Sort data by date
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get last 7 days
    const last7Days = sortedData.slice(-7);

    // Format data for recharts
    return last7Days.map((point) => {
      // Parse YYYY-MM-DD date string
      const [_year, month, day] = point.date.split('-').map(Number);
      return {
        date: point.date,
        displayDate: `${month}/${day}`,
        value: point.value,
      };
    });
  }, [data]);

  // Calculate average
  const average = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, point) => acc + point.value, 0);
    return (sum / chartData.length).toFixed(1);
  }, [chartData]);

  // Calculate trend (compare today's value with average)
  const trend = useMemo(() => {
    if (chartData.length === 0) return 'stable';

    const avg = typeof average === 'string' ? parseFloat(average) : average;
    const todayValue = chartData[chartData.length - 1].value;
    const diff = todayValue - avg;

    if (metric === 'stress') {
      // For stress, lower than average is good
      return diff < -0.5 ? 'improving' : diff > 0.5 ? 'worsening' : 'stable';
    } else {
      // For mood and sleep, higher than average is good
      return diff > 0.5 ? 'improving' : diff < -0.5 ? 'worsening' : 'stable';
    }
  }, [chartData, average, metric]);

  // Get trend icon based on metric and trend state
  const getTrendIcon = () => {
    if (trend === 'stable') return Minus;

    // For stress: improving = down, worsening = up
    // For mood/sleep: improving = up, worsening = down
    if (metric === 'stress') {
      return trend === 'improving' ? TrendingDown : TrendingUp;
    } else {
      return trend === 'improving' ? TrendingUp : TrendingDown;
    }
  };

  const TrendIcon = getTrendIcon();

  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-lg">
          <p className="text-xs font-medium text-muted-foreground">{payload[0].payload.date}</p>
          <p className="text-sm font-bold" style={{ color: config.color }}>
            {config.label}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="size-5" style={{ color: config.color }} />
            {title || `${config.label} Trend`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-gray-500">
            No data available. Start logging to see your trends!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="size-5" style={{ color: config.color }} />
            {title || <>{config.label} Trend</>}
          </CardTitle>
          {showLegend && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <TrendIcon
                  className={`size-4 ${
                    trend === 'improving'
                      ? 'text-green-500'
                      : trend === 'worsening'
                        ? 'text-red-500'
                        : 'text-gray-400'
                  }`}
                />
                <span
                  className={`text-xs ${
                    trend === 'improving'
                      ? 'text-green-600'
                      : trend === 'worsening'
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {trend === 'improving'
                    ? 'Improving'
                    : trend === 'worsening'
                      ? 'Needs attention'
                      : 'Stable'}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayDate"
              tick={{ fill: '#9ca3af', fontSize: 13 }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fill: '#9ca3af', fontSize: 13 }}
              tickLine={{ stroke: '#d1d5db' }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Average reference line */}
            <ReferenceLine
              y={typeof average === 'string' ? parseFloat(average) : average}
              stroke={config.color}
              strokeDasharray="5 5"
              strokeOpacity={0.4}
              strokeWidth={1.5}
              label={{
                value: `Avg: ${average}`,
                position: 'insideTopRight',
                fill: config.color,
                fontSize: 11,
                opacity: 0.7,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={config.color}
              strokeWidth={2}
              fill={`url(#gradient-${metric})`}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default WellnessChart;
