import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { MealHistory } from './MealHistory';
import type { MealListFilters, MealListResponse } from '@/lib/api';
import { useMeals } from '@/hooks/useMeals';
import type { UseQueryResult } from '@tanstack/react-query';

vi.mock('@/hooks/useMeals', () => ({
  useMeals: vi.fn(),
}));

const createQueryResult = (
  overrides?: Partial<UseQueryResult<MealListResponse, Error>>
): UseQueryResult<MealListResponse, Error> =>
  ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isPending: false,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: true,
    status: 'success',
    fetchStatus: 'idle',
    isStale: false,
    isPlaceholderData: false,
    isFetched: true,
    isFetchedAfterMount: true,
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    ...overrides,
  }) as UseQueryResult<MealListResponse, Error>;

const baseMealData: MealListResponse = {
  meals: [
    {
      id: 'meal-1',
      user_id: 'user-1',
      meal_type: 'lunch',
      meal_time: '2025-01-10T12:30:00.000Z',
      notes: 'Post workout meal',
      photo_url: 'https://example.com/meal.jpg',
      total_calories: 650,
      total_protein_g: 40,
      total_carbs_g: 45,
      total_fat_g: 20,
      food_items: [
        {
          id: 'food-1',
          food_name: 'Grilled Salmon',
          portion_size: 1,
          portion_unit: 'fillet',
          calories: 400,
          protein_g: 35,
          carbs_g: 0,
          fat_g: 15,
          created_at: '2025-01-10T12:30:00.000Z',
        },
        {
          id: 'food-2',
          food_name: 'Quinoa Salad',
          portion_size: 1.5,
          portion_unit: 'cup',
          calories: 250,
          protein_g: 5,
          carbs_g: 45,
          fat_g: 5,
          created_at: '2025-01-10T12:30:00.000Z',
        },
      ],
      created_at: '2025-01-10T12:30:00.000Z',
      updated_at: '2025-01-10T12:30:00.000Z',
    },
  ],
  total: 25,
  page: 1,
  page_size: 10,
};

describe('MealHistory', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.mocked(useMeals).mockReset();
  });

  it('shows a loading state while fetching', () => {
    vi.mocked(useMeals).mockReturnValue(
      createQueryResult({
        isLoading: true,
        isFetching: true,
      })
    );

    render(<MealHistory />);
    expect(screen.getByText(/loading meal history/i)).toBeInTheDocument();
  });

  it('renders meal entries with nutrition details', () => {
    vi.mocked(useMeals).mockReturnValue(
      createQueryResult({
        data: baseMealData,
      })
    );

    render(<MealHistory />);

    // Use getAllByText to find all "Lunch" texts (in dropdown and in meal entry)
    const lunchTexts = screen.getAllByText(/Lunch/i);
    expect(lunchTexts.length).toBeGreaterThan(0);
    expect(screen.getByText(/Grilled Salmon/i)).toBeInTheDocument();
    expect(screen.getByText(/Quinoa Salad/i)).toBeInTheDocument();
    expect(screen.getByText(/650 kcal/i)).toBeInTheDocument();
    // The protein is displayed as "Protein: 40.0 g"
    expect(screen.getByText(/40\.0 g/i)).toBeInTheDocument();
  });

  it('updates query filters when user adjusts form controls', async () => {
    const filterCalls: MealListFilters[] = [];

    vi.mocked(useMeals).mockImplementation((filtersArg) => {
      filterCalls.push(filtersArg as MealListFilters);
      return createQueryResult({
        data: baseMealData,
      });
    });

    render(<MealHistory />);
    expect(filterCalls[0].page).toBe(1);

    // Test pagination
    await user.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(filterCalls.at(-1)?.page).toBe(2);
    });

    // Test previous button (goes back to page 1)
    await user.click(screen.getByRole('button', { name: /previous/i }));
    await waitFor(() => {
      expect(filterCalls.at(-1)?.page).toBe(1);
    });

    // Test clear filters
    await user.click(screen.getByRole('button', { name: /clear/i }));
    await waitFor(() => {
      const latestCall = filterCalls.at(-1);
      expect(latestCall?.meal_type).toBeUndefined();
      expect(latestCall?.start_date).toBeUndefined();
      expect(latestCall?.end_date).toBeUndefined();
    });
  });
});
