/**
 * TanStack Query hooks for goals management
 * Provides caching, automatic refetching, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wellnessApi, type GoalCreate, type GoalResponse } from '@/lib/api';
import { toast } from 'sonner';

// Query keys for goals
export const goalsKeys = {
  all: ['goals'] as const,
  lists: () => [...goalsKeys.all, 'list'] as const,
  list: (filters?: { goal_type?: string; status?: string }) =>
    [...goalsKeys.lists(), filters] as const,
  detail: (id: string) => [...goalsKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch all goals with optional filters
 */
export function useGoals(filters?: { goal_type?: string; status?: string }) {
  return useQuery({
    queryKey: goalsKeys.list(filters),
    queryFn: () => wellnessApi.getGoals(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch active goals (in_progress status)
 */
export function useActiveGoals() {
  return useGoals({ status: 'in_progress' });
}

/**
 * Hook to create a new goal
 */
export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GoalCreate) => wellnessApi.createGoal(data),
    onSuccess: () => {
      // Invalidate all goals queries
      queryClient.invalidateQueries({ queryKey: goalsKeys.all });
      toast.success('Goal created successfully! 🎯');
    },
    onError: (error) => {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal. Please try again.');
    },
  });
}

/**
 * Hook to delete a goal
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: string) => wellnessApi.deleteGoal(goalId),
    onMutate: async (goalId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: goalsKeys.all });

      // Snapshot previous value for rollback
      const previousGoals = queryClient.getQueriesData({ queryKey: goalsKeys.all });

      // Optimistically remove the goal from all queries
      queryClient.setQueriesData<GoalResponse[]>({ queryKey: goalsKeys.lists() }, (old) =>
        old?.filter((goal) => goal.id !== goalId)
      );

      return { previousGoals };
    },
    onSuccess: () => {
      toast.success('Goal deleted successfully');
    },
    onError: (error, _goalId, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        context.previousGoals.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: goalsKeys.all });
    },
  });
}

/**
 * Calculate goal progress percentage
 */
export function calculateGoalProgress(goal: GoalResponse): number {
  if (!goal.current_value || !goal.target_value) return 0;
  const progress = (goal.current_value / goal.target_value) * 100;
  return Math.min(Math.max(progress, 0), 100);
}
