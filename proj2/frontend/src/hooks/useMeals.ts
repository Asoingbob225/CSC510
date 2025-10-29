import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  mealApi,
  type MealCreateRequest,
  type MealListFilters,
  type MealListResponse,
  type MealLogResponse,
} from '@/lib/api';

// Query keys for meal logging features
export const mealKeys = {
  all: ['meals'] as const,
  list: (filtersKey: string) => [...mealKeys.all, 'list', filtersKey] as const,
};

const sanitizeFilters = (filters?: MealListFilters) => {
  if (!filters) {
    return undefined;
  }

  const sanitized = Object.entries(filters).reduce<Record<string, string | number>>(
    (acc, [key, value]) => {
      if (value === undefined || value === null || value === '') {
        return acc;
      }
      acc[key] = value as string | number;
      return acc;
    },
    {}
  );

  return Object.keys(sanitized).length > 0 ? (sanitized as MealListFilters) : undefined;
};

/**
 * Fetch meal logs for the authenticated user with optional filters.
 * Utilises TanStack Query for caching and background refreshes.
 */
export function useMeals(filters?: MealListFilters, options?: { enabled?: boolean }) {
  const sanitized = sanitizeFilters(filters);
  const filtersKey = sanitized ? JSON.stringify(sanitized) : 'default';

  return useQuery<MealListResponse, Error>({
    queryKey: mealKeys.list(filtersKey),
    queryFn: async (): Promise<MealListResponse> => {
      const response = await mealApi.getMeals(sanitized);
      return response;
    },
    staleTime: 1000 * 30, // 30 seconds freshness
    enabled: options?.enabled ?? true,
  });
}

interface UseLogMealOptions {
  onSuccess?: (data: MealLogResponse) => void;
  onError?: (error: unknown) => void;
}

/**
 * Mutation hook for logging a new meal.
 * Automatically invalidates cached meal lists on success.
 */
export function useLogMeal(options?: UseLogMealOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MealCreateRequest) => mealApi.logMeal(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: mealKeys.all });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
