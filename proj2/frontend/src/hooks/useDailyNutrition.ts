import { useMemo } from 'react';
import { format } from 'date-fns';
import { useMeals } from './useMeals';
import type { MealLogResponse } from '@/lib/api';

export interface DailyNutritionData {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
  meals: MealLogResponse[];
}

/**
 * Hook to fetch and calculate today's nutrition data from meals
 * Returns aggregated nutrition data for the current day
 */
export function useDailyNutrition(options?: { enabled?: boolean }) {
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }, []);

  const endOfToday = useMemo(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  }, []);

  const {
    data: mealData,
    isLoading,
    error,
  } = useMeals(
    {
      start_date: today,
      end_date: endOfToday,
      page: 1,
      page_size: 100, // Get all meals for today
    },
    { enabled: options?.enabled ?? true }
  );

  const dailyData = useMemo<DailyNutritionData>(() => {
    if (!mealData?.meals) {
      return {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        mealCount: 0,
        meals: [],
      };
    }

    const meals = mealData.meals;
    const totals = meals.reduce(
      (acc, meal) => {
        acc.totalCalories += meal.total_calories ?? 0;
        acc.totalProtein += meal.total_protein_g ?? 0;
        acc.totalCarbs += meal.total_carbs_g ?? 0;
        acc.totalFat += meal.total_fat_g ?? 0;
        return acc;
      },
      {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      }
    );

    return {
      ...totals,
      mealCount: meals.length,
      meals,
    };
  }, [mealData]);

  return {
    data: dailyData,
    isLoading,
    error,
  };
}

/**
 * Format today's date for display
 */
export function formatTodayDate(): string {
  return format(new Date(), 'MMMM d, yyyy');
}
