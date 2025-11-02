import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDailyNutrition, formatTodayDate } from './useDailyNutrition';
import * as useMealsModule from './useMeals';

// Mock the useMeals hook
vi.mock('./useMeals', () => ({
  useMeals: vi.fn(),
}));

describe('useDailyNutrition', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('returns empty data when no meals are available', async () => {
    vi.mocked(useMealsModule.useMeals).mockReturnValue({
      data: { meals: [], total: 0, page: 1, page_size: 100 },
      isLoading: false,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { result } = renderHook(() => useDailyNutrition(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        mealCount: 0,
        meals: [],
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('calculates daily nutrition correctly from meals', async () => {
    vi.mocked(useMealsModule.useMeals).mockReturnValue({
      data: {
        meals: [
          {
            id: '1',
            user_id: 'user1',
            meal_type: 'breakfast',
            meal_time: '2025-10-31T08:00:00Z',
            total_calories: 500,
            total_protein_g: 20,
            total_carbs_g: 60,
            total_fat_g: 15,
            food_items: [],
            created_at: '2025-10-31T08:00:00Z',
            updated_at: '2025-10-31T08:00:00Z',
          },
          {
            id: '2',
            user_id: 'user1',
            meal_type: 'lunch',
            meal_time: '2025-10-31T12:00:00Z',
            total_calories: 700,
            total_protein_g: 40,
            total_carbs_g: 80,
            total_fat_g: 25,
            food_items: [],
            created_at: '2025-10-31T12:00:00Z',
            updated_at: '2025-10-31T12:00:00Z',
          },
        ],
        total: 2,
        page: 1,
        page_size: 100,
      },
      isLoading: false,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { result } = renderHook(() => useDailyNutrition(), { wrapper });

    await waitFor(() => {
      expect(result.current.data.totalCalories).toBe(1200);
      expect(result.current.data.totalProtein).toBe(60);
      expect(result.current.data.totalCarbs).toBe(140);
      expect(result.current.data.totalFat).toBe(40);
      expect(result.current.data.mealCount).toBe(2);
      expect(result.current.data.meals).toHaveLength(2);
    });
  });

  it('handles null nutrition values correctly', async () => {
    vi.mocked(useMealsModule.useMeals).mockReturnValue({
      data: {
        meals: [
          {
            id: '1',
            user_id: 'user1',
            meal_type: 'breakfast',
            meal_time: '2025-10-31T08:00:00Z',
            total_calories: null,
            total_protein_g: null,
            total_carbs_g: null,
            total_fat_g: null,
            food_items: [],
            created_at: '2025-10-31T08:00:00Z',
            updated_at: '2025-10-31T08:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        page_size: 100,
      },
      isLoading: false,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { result } = renderHook(() => useDailyNutrition(), { wrapper });

    await waitFor(() => {
      expect(result.current.data.totalCalories).toBe(0);
      expect(result.current.data.totalProtein).toBe(0);
      expect(result.current.data.totalCarbs).toBe(0);
      expect(result.current.data.totalFat).toBe(0);
      expect(result.current.data.mealCount).toBe(1);
    });
  });

  it('respects enabled option', async () => {
    const mockUseMeals = vi.mocked(useMealsModule.useMeals);

    renderHook(() => useDailyNutrition({ enabled: false }), { wrapper });

    await waitFor(() => {
      expect(mockUseMeals).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          page_size: 100,
        }),
        { enabled: false }
      );
    });
  });
});

describe('formatTodayDate', () => {
  it('formats the current date correctly', () => {
    const formatted = formatTodayDate();
    // Should return a date string in the format "Month Day, Year"
    expect(formatted).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
  });
});
