import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyCalorieGoal } from './DailyCalorieGoal';
import * as useDailyNutritionModule from '@/hooks/useDailyNutrition';

// Mock the hook
vi.mock('@/hooks/useDailyNutrition', () => ({
  useDailyNutrition: vi.fn(),
}));

describe('DailyCalorieGoal', () => {
  it('renders loading state when data is loading', () => {
    vi.mocked(useDailyNutritionModule.useDailyNutrition).mockReturnValue({
      data: {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        mealCount: 0,
        meals: [],
      },
      isLoading: true,
      error: null,
    });

    render(<DailyCalorieGoal />);
    // Should show skeleton loaders
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('displays daily calorie progress correctly', () => {
    vi.mocked(useDailyNutritionModule.useDailyNutrition).mockReturnValue({
      data: {
        totalCalories: 1200,
        totalProtein: 50,
        totalCarbs: 150,
        totalFat: 40,
        mealCount: 3,
        meals: [],
      },
      isLoading: false,
      error: null,
    });

    render(<DailyCalorieGoal />);

    // Check title
    expect(screen.getByText('Calories')).toBeInTheDocument();
    // Check calorie values
    expect(screen.getByText('1200')).toBeInTheDocument();
    expect(screen.getByText('/ 2000')).toBeInTheDocument();
    expect(screen.getByText('800 kcal remaining')).toBeInTheDocument();
  });

  it('shows over-goal state when calories exceed target', () => {
    vi.mocked(useDailyNutritionModule.useDailyNutrition).mockReturnValue({
      data: {
        totalCalories: 2500,
        totalProtein: 100,
        totalCarbs: 250,
        totalFat: 80,
        mealCount: 5,
        meals: [],
      },
      isLoading: false,
      error: null,
    });

    render(<DailyCalorieGoal />);

    expect(screen.getByText('2500')).toBeInTheDocument();
    expect(screen.getByText(/Over by 500 kcal/i)).toBeInTheDocument();
  });

  it('handles zero meals correctly', () => {
    vi.mocked(useDailyNutritionModule.useDailyNutrition).mockReturnValue({
      data: {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        mealCount: 0,
        meals: [],
      },
      isLoading: false,
      error: null,
    });

    render(<DailyCalorieGoal />);

    expect(screen.getByText('/ 2000')).toBeInTheDocument();
    expect(screen.getByText('2000 kcal remaining')).toBeInTheDocument();
    expect(screen.getByText('0% of daily goal')).toBeInTheDocument();
  });

  it('calculates progress percentage correctly', () => {
    vi.mocked(useDailyNutritionModule.useDailyNutrition).mockReturnValue({
      data: {
        totalCalories: 1000,
        totalProtein: 50,
        totalCarbs: 100,
        totalFat: 30,
        mealCount: 2,
        meals: [],
      },
      isLoading: false,
      error: null,
    });

    render(<DailyCalorieGoal />);

    expect(screen.getByText('50% of daily goal')).toBeInTheDocument();
  });
});
