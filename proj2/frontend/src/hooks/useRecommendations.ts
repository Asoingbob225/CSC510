/**
 * TanStack Query hooks for meal recommendations
 * Provides caching, automatic refetching, and error handling
 */

import { useQuery } from '@tanstack/react-query';
import { recommendationApi } from '@/lib/api';

// Query keys for recommendations
export const recommendationKeys = {
  all: ['recommendations'] as const,
  meal: (userId: string, constraints?: Record<string, unknown>) =>
    [...recommendationKeys.all, 'meal', userId, constraints] as const,
};

/**
 * Hook to fetch meal recommendations for a user
 * @param userId - The user ID to fetch recommendations for
 * @param constraints - Optional constraints to filter recommendations
 * @param enabled - Whether the query should run automatically (default: true)
 */
export function useMealRecommendations(
  userId: string,
  constraints?: Record<string, unknown>,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: recommendationKeys.meal(userId, constraints),
    queryFn: async () => {
      const result = await recommendationApi.getMealRecommendations(userId, constraints);
      return result;
    },
    enabled: enabled && !!userId, // Only fetch if enabled and userId exists
    staleTime: 1000 * 60 * 5, // 5 minutes - recommendations are relatively stable
    gcTime: 1000 * 60 * 30, // 30 minutes cache time
    retry: 2, // Retry failed requests twice
  });
}
