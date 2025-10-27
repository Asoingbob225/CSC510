import { useEffect, useState } from 'react';
import { Target, Trash2, TrendingUp } from 'lucide-react';
import { goalsApi, type GoalResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import GoalForm from './GoalForm';

function GoalsList() {
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const response = await goalsApi.getGoals({ page_size: 50 });
      setGoals(response.goals);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      await goalsApi.deleteGoal(goalId);
      toast.success('Goal deleted successfully');
      loadGoals(); // Reload goals
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const calculateProgress = (goal: GoalResponse) => {
    const progress = (goal.current_value / goal.target_value) * 100;
    return Math.min(Math.max(progress, 0), 100); // Clamp between 0-100
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'not_started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-center text-gray-600">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with New Goal Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Your Goals</h3>
        <GoalForm onSuccess={loadGoals} />
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Target className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No goals yet</h3>
          <p className="mb-4 text-gray-600">
            Set your first goal to start tracking your progress
          </p>
          <GoalForm onSuccess={loadGoals} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Goal Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className={getPriorityColor(goal.priority)}>
                      {goal.priority}
                    </Badge>
                    <Badge className={getStatusColor(goal.status)}>
                      {goal.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-gray-900">{goal.description}</h4>
                  <p className="text-sm text-gray-600">{goal.goal_type}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(goal.id)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="mb-3 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <div className="flex items-center gap-1 font-medium text-gray-900">
                    <TrendingUp className="h-3 w-3" />
                    {calculateProgress(goal).toFixed(0)}%
                  </div>
                </div>
                <Progress value={calculateProgress(goal)} className="h-2" />
              </div>

              {/* Goal Stats */}
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-600">Current: </span>
                  <span className="font-medium text-gray-900">
                    {goal.current_value} {goal.unit}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Target: </span>
                  <span className="font-medium text-gray-900">
                    {goal.target_value} {goal.unit}
                  </span>
                </div>
              </div>

              {/* Target Date */}
              <div className="mt-2 text-xs text-gray-500">
                Target: {new Date(goal.target_date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GoalsList;
