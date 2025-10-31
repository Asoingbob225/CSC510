import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Activity, AlertCircle, ArrowLeft } from 'lucide-react';
import { getAuthToken } from '@/lib/api';
import { useWellnessChartData } from '@/hooks/useWellnessData';
import { DashboardNavbar } from '@/components/DashboardNavbar';
import { MoodLogWidget, StressLogWidget, SleepLogWidget } from '@/components/wellness/mental';
import { GoalForm, GoalsList, WellnessChart } from '@/components/wellness/shared';
import { Button } from '@/components/ui/button';

function WellnessTrackingPage() {
  const navigate = useNavigate();

  // Fetch chart data (last 7 days)
  const { data: chartData, isLoading, error } = useWellnessChartData(7);

  // Check auth
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Activity className="mx-auto mb-4 size-12 animate-pulse text-blue-500" />
          <div className="text-lg text-gray-600">Loading wellness data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
      <DashboardNavbar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-gray-800">
              Wellness Tracking
            </h1>
            <p className="text-gray-600">
              Monitor your mental wellness journey with daily mood, stress, and sleep tracking
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 px-6 py-4 shadow-sm">
            <AlertCircle className="size-5 text-red-600" />
            <p className="text-red-800">{error.message || 'Failed to load wellness data'}</p>
          </div>
        )}

        {/* Quick Log Widgets */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Daily Check-in</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MoodLogWidget />
            <StressLogWidget />
            <SleepLogWidget />
          </div>
        </section>

        {/* Trend Charts */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Your Trends (Last 7 Days)</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <WellnessChart data={chartData.mood} metric="mood" showLegend={true} />
            <WellnessChart data={chartData.stress} metric="stress" showLegend={true} />
            <WellnessChart data={chartData.sleep} metric="sleep" showLegend={true} />
          </div>
        </section>

        {/* Goals Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Wellness Goals</h2>
            <GoalForm />
          </div>
          <GoalsList />
        </section>
      </main>
    </div>
  );
}

export default WellnessTrackingPage;
