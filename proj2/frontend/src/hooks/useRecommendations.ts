/**
 * TanStack Query hooks for meal recommendations
 * Provides caching, automatic refetching, and error handling
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  recommendationApi,
  type RecommendationFiltersPayload,
  type RecommendationQueryOptions,
} from '@/lib/api';

// Query keys for recommendations
export const recommendationKeys = {
  all: ['recommendations'] as const,
  meal: (userId: string, optionsKey: string) =>
    [...recommendationKeys.all, 'meal', userId, optionsKey] as const,
};

const stableStringify = (value: unknown): string => {
  return JSON.stringify(
    value,
    (_key, val) => {
      if (Array.isArray(val)) {
        return [...val].sort();
      }

      if (val && typeof val === 'object') {
        return Object.keys(val as Record<string, unknown>)
          .sort()
          .reduce<Record<string, unknown>>((acc, key) => {
            acc[key] = (val as Record<string, unknown>)[key];
            return acc;
          }, {});
      }

      return val;
    },
    0
  );
};

const allowedFilterKeys = new Set<keyof RecommendationFiltersPayload>([
  'diet',
  'cuisine',
  'price_range',
]);

const sanitizeFilters = (filters?: RecommendationFiltersPayload) => {
  if (!filters) {
    return undefined;
  }

  const cleanedEntries = Object.entries(filters).reduce<Record<string, unknown>>(
    (acc, [key, val]) => {
      if (!allowedFilterKeys.has(key as keyof RecommendationFiltersPayload)) {
        return acc;
      }
      if (Array.isArray(val)) {
        const filtered = val.map((item) => String(item).trim()).filter(Boolean);
        if (filtered.length > 0) {
          acc[key] = filtered;
        }
        return acc;
      }

      if (val !== undefined && val !== null && val !== '') {
        acc[key] = val;
      }
      return acc;
    },
    {}
  );

  return Object.keys(cleanedEntries).length > 0
    ? (cleanedEntries as RecommendationFiltersPayload)
    : undefined;
};

const sanitizeOptions = (options?: RecommendationQueryOptions) => {
  if (!options) {
    return undefined;
  }

  const sanitized: RecommendationQueryOptions = {};

  if (options.mode) {
    sanitized.mode = options.mode;
  }

  const filters = sanitizeFilters(options.filters);
  if (filters) {
    sanitized.filters = filters;
  }

  if (options.legacyConstraints && Object.keys(options.legacyConstraints).length > 0) {
    sanitized.legacyConstraints = options.legacyConstraints;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
};

/**
 * Hook to fetch meal recommendations for a user
 * @param userId - The user ID to fetch recommendations for
 * @param options - Optional filters and configuration for the recommendation engine
 * @param enabled - Whether the query should run automatically (default: true)
 */
export function useMealRecommendations(
  userId: string,
  options?: RecommendationQueryOptions,
  enabled: boolean = true
) {
  const sanitizedOptions = useMemo(() => sanitizeOptions(options), [options]);
  const optionsKey = sanitizedOptions ? stableStringify(sanitizedOptions) : 'default';

  return useQuery({
    queryKey: recommendationKeys.meal(userId, optionsKey),
    queryFn: async () => {
      const result = await recommendationApi.getMealRecommendations(userId, sanitizedOptions);
      return result;
    },
    enabled: enabled && !!userId, // Only fetch if enabled and userId exists
    staleTime: 1000 * 60 * 5, // 5 minutes - recommendations are relatively stable
    gcTime: 1000 * 60 * 30, // 30 minutes cache time
    retry: 2, // Retry failed requests twice
  });
}
