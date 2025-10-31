import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { DashboardNavbar } from '@/components/DashboardNavbar';
import { WellnessOverviewCard } from '@/components/wellness';
import { RecommendationCarousel } from '@/components/recommendations/RecommendationCarousel';
import {
  DailyCalorieGoal,
  MacronutrientBalance,
  LogMealWidget,
  MealsLoggedWidget,
} from '@/components/dashboard';
import apiClient, { getAuthToken } from '@/lib/api';

function Dashboard() {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Verify if token is valid
  useEffect(() => {
    const verifyToken = async () => {
      const token = getAuthToken();

      // If no token, redirect to home page
      if (!token) {
        navigate('/404-not-found');
        return;
      }

      try {
        // Call user endpoint to check if token is valid
        const response = await apiClient.get('/users/me');
        setUserId(response.data.id);
        setIsVerifying(false);
      } catch {
        // Token is invalid, clear and redirect
        navigate('/404-not-found');
      }
    };

    verifyToken();
  }, [navigate]);

  // Handler for navigating to detailed daily view
  const handleViewDailyDetails = () => {
    navigate('/daily-log');
  };

  // Show loading state while verifying
  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-lg text-gray-600">Verifying...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Welcome to Your Dashboard</h2>
          <p className="text-gray-600">
            Track your health, wellness, and nutrition journey all in one place
          </p>
        </div>

        {/* Primary Widgets Grid - Daily Goals & Nutrition */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* Small Cards: Calorie Goal & Macros */}
          <DailyCalorieGoal />
          <MacronutrientBalance />

          {/* Large Card: Meals Logged */}
          <MealsLoggedWidget onViewDetails={handleViewDailyDetails} />
        </div>

        {/* Log Meal Widget */}
        <div className="mb-8">
          <LogMealWidget />
        </div>

        {/* Wellness Overview Card */}
        <div className="mb-8">
          <WellnessOverviewCard />
        </div>

        {/* Meal Recommendations */}
        {userId && (
          <div className="mb-8">
            <RecommendationCarousel userId={userId} />
          </div>
        )}

        {/* Other Dashboard Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => navigate('/health-profile')}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:border-purple-200 hover:shadow-md"
          >
            <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-purple-100">
              <svg
                className="size-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Health Profile</h3>
            <p className="text-sm text-gray-600">
              Manage your health information, allergies, and dietary preferences
            </p>
          </button>

          <div className="cursor-not-allowed rounded-lg border border-gray-200 bg-white p-6 opacity-60 shadow-sm">
            <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-green-100">
              <svg
                className="size-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">My Recipes</h3>
            <p className="text-sm text-gray-600">Your saved recipes will appear here</p>
            <p className="mt-2 text-xs text-gray-500 italic">Coming soon</p>
          </div>

          <div className="cursor-not-allowed rounded-lg border border-gray-200 bg-white p-6 opacity-60 shadow-sm">
            <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-blue-100">
              <svg
                className="size-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Meal Plans</h3>
            <p className="text-sm text-gray-600">Manage your weekly meal plans</p>
            <p className="mt-2 text-xs text-gray-500 italic">Coming soon</p>
          </div>

          <div className="cursor-not-allowed rounded-lg border border-gray-200 bg-white p-6 opacity-60 shadow-sm">
            <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-orange-100">
              <svg
                className="size-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Shopping List</h3>
            <p className="text-sm text-gray-600">Your grocery shopping list</p>
            <p className="mt-2 text-xs text-gray-500 italic">Coming soon</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
