import { useMemo } from 'react';
import { TrendingUp, Activity, Brain, Moon } from 'lucide-react';
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

function WellnessChart({ 
  data, 
  metric, 
  title,
  showLegend = true 
}: WellnessChartProps) {
  const config = METRIC_CONFIG[metric];
  const Icon = config.icon;

  // Chart dimensions
  const width = 600;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 50, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const { points, xLabels, yTicks } = useMemo(() => {
    if (data.length === 0) {
      return { points: [], xLabels: [], yTicks: [0, 5, 10] };
    }

    // Sort data by date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get last 7 days
    const last7Days = sortedData.slice(-7);

    // Y scale: 0-10
    const yMin = 0;
    const yMax = 10;

    // Calculate points
    const calculatedPoints = last7Days.map((point, index) => {
      const x = padding.left + (index / Math.max(last7Days.length - 1, 1)) * chartWidth;
      const y = padding.top + chartHeight - ((point.value - yMin) / (yMax - yMin)) * chartHeight;
      return { x, y, value: point.value, date: point.date };
    });

    // X labels (dates)
    const calculatedXLabels = last7Days.map((point, index) => {
      const date = new Date(point.date);
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      const x = padding.left + (index / Math.max(last7Days.length - 1, 1)) * chartWidth;
      return { label, x };
    });

    // Y ticks
    const calculatedYTicks = [0, 2, 4, 6, 8, 10];

    return {
      points: calculatedPoints,
      xLabels: calculatedXLabels,
      yTicks: calculatedYTicks,
    };
  }, [data, chartWidth, chartHeight, padding]);

  // Generate path for line
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    
    return points.map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `L ${point.x} ${point.y}`;
    }).join(' ');
  }, [points]);

  // Generate path for area (gradient fill)
  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    
    const bottomY = padding.top + chartHeight;
    let path = `M ${points[0].x} ${bottomY}`;
    
    points.forEach(point => {
      path += ` L ${point.x} ${point.y}`;
    });
    
    path += ` L ${points[points.length - 1].x} ${bottomY} Z`;
    return path;
  }, [points, chartHeight, padding]);

  // Calculate average
  const average = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, point) => acc + point.value, 0);
    return (sum / data.length).toFixed(1);
  }, [data]);

  // Calculate trend
  const trend = useMemo(() => {
    if (points.length < 2) return 'stable';
    const firstValue = points[0].value;
    const lastValue = points[points.length - 1].value;
    const change = lastValue - firstValue;
    
    if (metric === 'stress') {
      // For stress, decreasing is good
      return change < -0.5 ? 'improving' : change > 0.5 ? 'worsening' : 'stable';
    } else {
      // For mood and sleep, increasing is good
      return change > 0.5 ? 'improving' : change < -0.5 ? 'worsening' : 'stable';
    }
  }, [points, metric]);

  if (data.length === 0) {
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
            {title || `${config.label} Trend (7 Days)`}
          </CardTitle>
          {showLegend && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Avg:</span>
                <span className="font-semibold" style={{ color: config.color }}>
                  {average}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp 
                  className={`size-4 ${
                    trend === 'improving' ? 'text-green-500' :
                    trend === 'worsening' ? 'text-red-500' :
                    'text-gray-400'
                  }`}
                />
                <span className={`text-xs ${
                  trend === 'improving' ? 'text-green-600' :
                  trend === 'worsening' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {trend === 'improving' ? 'Improving' :
                   trend === 'worsening' ? 'Needs attention' :
                   'Stable'}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <svg 
          width="100%" 
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          {/* Grid lines (horizontal) */}
          {yTicks.map(tick => {
            const y = padding.top + chartHeight - (tick / 10) * chartHeight;
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  className="text-xs fill-gray-500"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Area gradient fill */}
          <defs>
            <linearGradient id={`gradient-${metric}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Area path */}
          <path
            d={areaPath}
            fill={`url(#gradient-${metric})`}
          />

          {/* Line path */}
          <path
            d={linePath}
            fill="none"
            stroke={config.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="white"
                stroke={config.color}
                strokeWidth="2"
              />
              <title>{`${point.date}: ${point.value}`}</title>
            </g>
          ))}

          {/* X axis labels */}
          {xLabels.map((label, index) => (
            <text
              key={index}
              x={label.x}
              y={padding.top + chartHeight + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {label.label}
            </text>
          ))}

          {/* Y axis label */}
          <text
            x={padding.left - 35}
            y={padding.top + chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${padding.left - 35} ${padding.top + chartHeight / 2})`}
            className="text-xs fill-gray-600 font-medium"
          >
            {config.yAxisLabel}
          </text>

          {/* X axis label */}
          <text
            x={padding.left + chartWidth / 2}
            y={height - 10}
            textAnchor="middle"
            className="text-xs fill-gray-600 font-medium"
          >
            Date
          </text>
        </svg>
      </CardContent>
    </Card>
  );
}

export default WellnessChart;
