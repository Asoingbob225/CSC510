import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Eatsential Dashboard</h1>
          <Button
            onClick={handleLogout}
            className="cursor-pointer bg-gray-600 text-white shadow-md hover:bg-gray-700"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Welcome to Your Dashboard</h2>
          <p className="text-gray-600">
            This is your personal dashboard. More features coming soon!
          </p>

          {/* Placeholder Cards */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
