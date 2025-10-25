import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { DashboardNavbar } from '@/components/DashboardNavbar';
import apiClient, { getAuthToken } from '@/lib/api';

function Dashboard() {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

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
        await apiClient.get('/users/me');
        setIsVerifying(false);
      } catch {
        // Token is invalid, clear and redirect
        navigate('/404-not-found');
      }
    };

    verifyToken();
  }, [navigate]);

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
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Welcome to Your Dashboard</h2>
          <p className="text-gray-600">
            This is your personal dashboard. More features coming soon!
          </p>

          {/* Placeholder Cards */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => navigate('/health-profile')}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm transition-colors hover:bg-gray-50"
            >
              <h3 className="mb-2 text-lg font-medium text-gray-900">Health Profile</h3>
              <p className="text-sm text-gray-600">
                Manage your health information, allergies, and dietary preferences
              </p>
            </button>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-medium text-gray-900">My Recipes</h3>
              <p className="text-sm text-gray-600">Your saved recipes will appear here</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-medium text-gray-900">Meal Plans</h3>
              <p className="text-sm text-gray-600">Manage your weekly meal plans</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-medium text-gray-900">Shopping List</h3>
              <p className="text-sm text-gray-600">Your grocery shopping list</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
