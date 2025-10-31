import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MacronutrientBalance } from './MacronutrientBalance';
import * as useDailyNutritionModule from '@/hooks/useDailyNutrition';

// Mock the hook
vi.mock('@/hooks/useDailyNutrition', () => ({
  useDailyNutrition: vi.fn(),
  formatTodayDate: vi.fn(() => 'October 31, 2025'),
}));

describe('MacronutrientBalance', () => {
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

    render(<MacronutrientBalance />);
    // Should show skeleton loaders
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('displays macronutrient data correctly', () => {
    vi.mocked(useDailyNutritionModule.useDailyNutrition).mockReturnValue({
      data: {
        totalCalories: 1800,
        totalProtein: 90,
        totalCarbs: 200,
        totalFat: 60,
        mealCount: 3,
        meals: [],
      },
      isLoading: false,
      error: null,
    });

    render(<MacronutrientBalance />);

    expect(screen.getByText('Macronutrient Balance')).toBeInTheDocument();
    expect(screen.getByText('October 31, 2025')).toBeInTheDocument();
    expect(screen.getByText('90g')).toBeInTheDocument(); // Protein
    expect(screen.getByText('200g')).toBeInTheDocument(); // Carbs
    expect(screen.getByText('60g')).toBeInTheDocument(); // Fat
  });

  it('calculates total macros correctly', () => {
    vi.mocked(useDailyNutritionModule.useDailyNutrition).mockReturnValue({
      data: {
        totalCalories: 1500,
        totalProtein: 75,
        totalCarbs: 150,
        totalFat: 50,
        mealCount: 2,
        meals: [],
      },
      isLoading: false,
      error: null,
    });

    render(<MacronutrientBalance />);

    expect(screen.getByText('275g')).toBeInTheDocument(); // Total: 75 + 150 + 50
  });

  it('shows empty state when no data is available', () => {
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

    render(<MacronutrientBalance />);

    expect(screen.getByText('No macronutrient data yet')).toBeInTheDocument();
  });

  it('displays meal count correctly in summary', () => {
    vi.mocked(useDailyNutritionModule.useDailyNutrition).mockReturnValue({
      data: {
        totalCalories: 1200,
        totalProtein: 60,
        totalCarbs: 120,
        totalFat: 40,
        mealCount: 3,
        meals: [],
      },
      isLoading: false,
      error: null,
    });

    render(<MacronutrientBalance />);

    expect(screen.getByText(/Based on 3 meals logged today/i)).toBeInTheDocument();
  });

  it('handles singular meal count correctly', () => {
    vi.mocked(useDailyNutritionModule.useDailyNutrition).mockReturnValue({
      data: {
        totalCalories: 600,
        totalProtein: 30,
        totalCarbs: 60,
        totalFat: 20,
        mealCount: 1,
        meals: [],
      },
      isLoading: false,
      error: null,
    });

    render(<MacronutrientBalance />);

    expect(screen.getByText(/Based on 1 meal logged today/i)).toBeInTheDocument();
  });

  it('displays all three macronutrient categories', () => {
    vi.mocked(useDailyNutritionModule.useDailyNutrition).mockReturnValue({
      data: {
        totalCalories: 1500,
        totalProtein: 75,
        totalCarbs: 150,
        totalFat: 50,
        mealCount: 2,
        meals: [],
      },
      isLoading: false,
      error: null,
    });

    render(<MacronutrientBalance />);

    expect(screen.getByText('Protein')).toBeInTheDocument();
    expect(screen.getByText('Carbs')).toBeInTheDocument();
    expect(screen.getByText('Fat')).toBeInTheDocument();
  });
});
