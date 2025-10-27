import { Trash2, TrendingUp, Target } from 'lucide-react';
import { useGoals, useDeleteGoal, calculateGoalProgress } from '@/hooks/useGoalsData';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import GoalForm from './GoalForm';

function GoalsList() {
  const { data: goals, isLoading } = useGoals();
  const deleteGoal = useDeleteGoal();

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    await deleteGoal.mutateAsync(goalId);
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Your Goals</h3>
          <GoalForm />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="mb-4 h-4 w-1/2" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with New Goal Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Your Goals</h3>
        <GoalForm />
      </div>

      {/* Goals List */}
      {!goals || goals.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Target className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No goals yet</h3>
          <p className="mb-4 text-gray-600">Set your first goal to start tracking your progress</p>
          <GoalForm />
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
                    <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
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
                    {calculateGoalProgress(goal).toFixed(0)}%
                  </div>
                </div>
                <Progress value={calculateGoalProgress(goal)} className="h-2" />
              </div>

              {/* Goal Stats */}
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-600">Current: </span>
                  <span className="font-medium text-gray-900">{goal.current_value || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Target: </span>
                  <span className="font-medium text-gray-900">{goal.target_value || 0}</span>
                </div>
              </div>

              {/* Target Date */}
              {goal.target_date && (
                <div className="mt-2 text-xs text-gray-500">
                  Target: {new Date(goal.target_date).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GoalsList;
