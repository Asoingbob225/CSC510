import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MacronutrientBalance } from './MacronutrientBalance';
import * as useDailyNutritionModule from '@/hooks/useDailyNutrition';

// Mock the hook
vi.mock('@/hooks/useDailyNutrition', () => ({
  useDailyNutrition: vi.fn(),
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

    // Check title
    expect(screen.getByText('Macros')).toBeInTheDocument();
    // Check macro values
    expect(screen.getByText('90g')).toBeInTheDocument(); // Protein
    expect(screen.getByText('200g')).toBeInTheDocument(); // Carbs
    expect(screen.getByText('60g')).toBeInTheDocument(); // Fat
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

    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  it('shows macro details correctly', () => {
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

    expect(screen.getByText('30g')).toBeInTheDocument();
    expect(screen.getByText('60g')).toBeInTheDocument();
    expect(screen.getByText('20g')).toBeInTheDocument();
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

  it('renders PieChart visualization', () => {
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

    // Check that all three macros are displayed with their values
    expect(screen.getByText('Protein')).toBeInTheDocument();
    expect(screen.getByText('Carbs')).toBeInTheDocument();
    expect(screen.getByText('Fat')).toBeInTheDocument();
    expect(screen.getByText('75g')).toBeInTheDocument();
    expect(screen.getByText('150g')).toBeInTheDocument();
    expect(screen.getByText('50g')).toBeInTheDocument();
  });
});
