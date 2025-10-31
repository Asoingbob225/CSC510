import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { DashboardNavbar } from '@/components/DashboardNavbar';
import { Button } from '@/components/ui/button';
import { QuickMealLogger } from '@/components/meals/QuickMealLogger';
import { MealHistory } from '@/components/meals/MealHistory';
import { useMemo } from 'react';
import { useMeals } from '@/hooks/useMeals';

function DailyLog() {
  const navigate = useNavigate();

  const { data: mealSuggestionData } = useMeals({
    page: 1,
    page_size: 50,
  });

  const foodSuggestions = useMemo(() => {
    if (!mealSuggestionData?.meals) {
      return [];
    }
    const suggestions = new Set<string>();
    mealSuggestionData.meals.forEach((meal) => {
      meal.food_items.forEach((item) => {
        if (item.food_name) {
          suggestions.add(item.food_name);
        }
      });
    });
    return Array.from(suggestions).sort((a, b) => a.localeCompare(b));
  }, [mealSuggestionData]);

  return (
    <div className="min-h-screen bg-gray-50">
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

        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Daily Meal Log</h2>
          <p className="text-gray-600">View and manage all your meals for today</p>
        </div>

        {/* Meal Logging and History */}
        <div id="meal-logging-section" className="space-y-6">
          <MealHistory />
          <QuickMealLogger foodSuggestions={foodSuggestions} />
        </div>
      </main>
    </div>
  );
}

export default DailyLog;
