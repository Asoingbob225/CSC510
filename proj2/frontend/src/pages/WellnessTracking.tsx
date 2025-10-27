import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Activity, AlertCircle, RefreshCw } from 'lucide-react';
import {
  getAuthToken,
  wellnessApi,
  type WellnessLogResponse,
} from '@/lib/api';
import { DashboardNavbar } from '@/components/DashboardNavbar';
import { MoodLogWidget, StressLogWidget, SleepLogWidget } from '@/components/wellness/mental';
import { GoalForm, GoalsList, WellnessChart } from '@/components/wellness/shared';
import { Button } from '@/components/ui/button';

function WellnessTrackingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Wellness data for charts
  const [moodData, setMoodData] = useState<Array<{ date: string; value: number }>>([]);
  const [stressData, setStressData] = useState<Array<{ date: string; value: number }>>([]);
  const [sleepData, setSleepData] = useState<Array<{ date: string; value: number }>>([]);

  // Check auth and load data
  useEffect(() => {
    const loadData = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch last 30 days of wellness logs for charts
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const logsResponse = await wellnessApi.getWellnessLogs({
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        });

        // Transform data for charts
        const mood: Array<{ date: string; value: number }> = [];
        const stress: Array<{ date: string; value: number }> = [];
        const sleep: Array<{ date: string; value: number }> = [];

        // Process logs
        logsResponse.forEach((log: WellnessLogResponse) => {
          if (log.mood_score !== undefined) {
            mood.push({ date: log.log_date, value: log.mood_score });
          }
          if (log.stress_level !== undefined) {
            stress.push({ date: log.log_date, value: log.stress_level });
          }
          if (log.sleep_quality !== undefined) {
            sleep.push({ date: log.log_date, value: log.sleep_quality });
          }
        });

        setMoodData(mood);
        setStressData(stress);
        setSleepData(sleep);
      } catch (err) {
        console.error('Error loading wellness data:', err);
        setError('Failed to load wellness tracking data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate, refreshKey]);

  // Handle successful log submission - refresh data
  const handleLogSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Handle successful goal creation/update - refresh goals list
  const handleGoalSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Activity className="mx-auto mb-4 size-12 animate-pulse text-blue-500" />
          <div className="text-lg text-gray-600">Loading wellness data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <DashboardNavbar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-gray-800">
              <Activity className="size-8 text-blue-600" />
              Wellness Tracking
            </h1>
            <p className="text-gray-600">
              Monitor your mental wellness journey with daily mood, stress, and sleep tracking
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 px-6 py-4 shadow-sm">
            <AlertCircle className="size-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Quick Log Widgets */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Daily Check-in</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MoodLogWidget onSubmit={handleLogSuccess} />
            <StressLogWidget onSubmit={handleLogSuccess} />
            <SleepLogWidget onSubmit={handleLogSuccess} />
          </div>
        </section>

        {/* Trend Charts */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Your Trends (Last 7 Days)</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <WellnessChart data={moodData} metric="mood" showLegend={true} />
            <WellnessChart data={stressData} metric="stress" showLegend={true} />
            <WellnessChart data={sleepData} metric="sleep" showLegend={true} />
          </div>
        </section>

        {/* Goals Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Wellness Goals</h2>
            <GoalForm onSuccess={handleGoalSuccess} />
          </div>
          <GoalsList key={refreshKey} />
        </section>
      </main>
    </div>
  );
}

export default WellnessTrackingPage;
