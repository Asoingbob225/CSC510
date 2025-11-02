import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MealsLoggedWidget } from './MealsLoggedWidget';
import * as useDailyNutritionModule from '@/hooks/useDailyNutrition';
import type { MealLogResponse } from '@/lib/api';
import type { DailyNutritionData } from '@/hooks/useDailyNutrition';

vi.mock('@/hooks/useDailyNutrition', () => ({
  useDailyNutrition: vi.fn(),
  formatTodayDate: vi.fn(() => 'October 31, 2025'),
}));

describe('MealsLoggedWidget', () => {
  const mockOnViewDetails = vi.fn();

  const setHookReturn = (value: {
    data: DailyNutritionData;
    isLoading: boolean;
    error: Error | null;
  }) => {
    vi.mocked(useDailyNutritionModule.useDailyNutrition).mockReturnValue(value);
  };

  beforeEach(() => {
    mockOnViewDetails.mockClear();
  });

  it('renders loading state when data is loading', () => {
    setHookReturn({
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

    render(<MealsLoggedWidget onViewDetails={mockOnViewDetails} />);
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('shows empty state when no meals are logged', () => {
    setHookReturn({
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

    render(<MealsLoggedWidget onViewDetails={mockOnViewDetails} />);

    expect(screen.getByText('No meals logged yet')).toBeInTheDocument();
    expect(screen.getByText('Start tracking your nutrition by logging a meal')).toBeInTheDocument();
  });

  it("displays today's section and a meal item", () => {
    const mockMeals: MealLogResponse[] = [
      {
        id: '1',
        user_id: 'user1',
        meal_type: 'breakfast',
        meal_time: '2025-10-31T08:00:00Z',
        total_calories: 300,
        total_protein_g: 10,
        total_carbs_g: 50,
        total_fat_g: 5,
        food_items: [],
        created_at: '2025-10-31T08:00:00Z',
        updated_at: '2025-10-31T08:00:00Z',
      },
    ];

    setHookReturn({
      data: {
        totalCalories: 300,
        totalProtein: 10,
        totalCarbs: 50,
        totalFat: 5,
        mealCount: 1,
        meals: mockMeals,
      },
      isLoading: false,
      error: null,
    });

    render(<MealsLoggedWidget onViewDetails={mockOnViewDetails} />);

    expect(screen.getByText('Meals Logged Today')).toBeInTheDocument();
    expect(screen.getByText('October 31, 2025')).toBeInTheDocument();
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('View All')).toBeInTheDocument();
  });

  it('calls onViewDetails when button is clicked', async () => {
    const user = userEvent.setup();
    const mockMeals: MealLogResponse[] = [
      {
        id: '1',
        user_id: 'user1',
        meal_type: 'breakfast',
        meal_time: '2025-10-31T08:00:00Z',
        total_calories: 300,
        total_protein_g: 10,
        total_carbs_g: 50,
        total_fat_g: 5,
        food_items: [],
        created_at: '2025-10-31T08:00:00Z',
        updated_at: '2025-10-31T08:00:00Z',
      },
    ];

    setHookReturn({
      data: {
        totalCalories: 300,
        totalProtein: 10,
        totalCarbs: 50,
        totalFat: 5,
        mealCount: 1,
        meals: mockMeals,
      },
      isLoading: false,
      error: null,
    });

    render(<MealsLoggedWidget onViewDetails={mockOnViewDetails} />);
    await user.click(screen.getByText('View All'));
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it('displays meal breakdown by type', () => {
    const mockMeals: MealLogResponse[] = [
      {
        id: '1',
        user_id: 'user1',
        meal_type: 'breakfast',
        meal_time: '2025-10-31T08:00:00Z',
        total_calories: 300,
        total_protein_g: 10,
        total_carbs_g: 50,
        total_fat_g: 5,
        food_items: [],
        created_at: '2025-10-31T08:00:00Z',
        updated_at: '2025-10-31T08:00:00Z',
      },
      {
        id: '2',
        user_id: 'user1',
        meal_type: 'lunch',
        meal_time: '2025-10-31T12:00:00Z',
        total_calories: 500,
        total_protein_g: 30,
        total_carbs_g: 40,
        total_fat_g: 15,
        food_items: [],
        created_at: '2025-10-31T12:00:00Z',
        updated_at: '2025-10-31T12:00:00Z',
      },
      {
        id: '3',
        user_id: 'user1',
        meal_type: 'dinner',
        meal_time: '2025-10-31T18:00:00Z',
        total_calories: 600,
        total_protein_g: 40,
        total_carbs_g: 30,
        total_fat_g: 25,
        food_items: [],
        created_at: '2025-10-31T18:00:00Z',
        updated_at: '2025-10-31T18:00:00Z',
      },
    ];

    setHookReturn({
      data: {
        totalCalories: 1400,
        totalProtein: 80,
        totalCarbs: 120,
        totalFat: 45,
        mealCount: 3,
        meals: mockMeals,
      },
      isLoading: false,
      error: null,
    });

    render(<MealsLoggedWidget onViewDetails={mockOnViewDetails} />);

    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();

    // Check that calorie badges exist
    expect(
      screen.getByText((_content, element) => {
        return element?.textContent === '300 kcal' || false;
      })
    ).toBeInTheDocument();

    // Check that nutrition details are displayed
    expect(screen.getAllByText('Protein').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Carbs').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Fat').length).toBeGreaterThan(0);
  });

  it('displays summary statistics correctly', () => {
    const mockMeals: MealLogResponse[] = [
      {
        id: '1',
        user_id: 'user1',
        meal_type: 'breakfast',
        meal_time: '2025-10-31T08:00:00Z',
        total_calories: 300,
        total_protein_g: 10,
        total_carbs_g: 50,
        total_fat_g: 5,
        food_items: [],
        created_at: '2025-10-31T08:00:00Z',
        updated_at: '2025-10-31T08:00:00Z',
      },
      {
        id: '2',
        user_id: 'user1',
        meal_type: 'lunch',
        meal_time: '2025-10-31T12:00:00Z',
        total_calories: 500,
        total_protein_g: 30,
        total_carbs_g: 40,
        total_fat_g: 15,
        food_items: [],
        created_at: '2025-10-31T12:00:00Z',
        updated_at: '2025-10-31T12:00:00Z',
      },
    ];

    setHookReturn({
      data: {
        totalCalories: 800,
        totalProtein: 40,
        totalCarbs: 90,
        totalFat: 20,
        mealCount: 2,
        meals: mockMeals,
      },
      isLoading: false,
      error: null,
    });

    render(<MealsLoggedWidget onViewDetails={mockOnViewDetails} />);

    // Verify nutrition details are shown for each meal type
    const proteinLabels = screen.getAllByText('Protein');
    const carbsLabels = screen.getAllByText('Carbs');
    const fatLabels = screen.getAllByText('Fat');

    // Should have nutrition details for each meal (breakfast and lunch = 2 meals)
    expect(proteinLabels.length).toBe(2);
    expect(carbsLabels.length).toBe(2);
    expect(fatLabels.length).toBe(2);

    // Verify specific nutrition values are displayed
    expect(screen.getByText('10g')).toBeInTheDocument(); // Breakfast protein
    expect(screen.getByText('50g')).toBeInTheDocument(); // Breakfast carbs
    expect(screen.getByText('5g')).toBeInTheDocument(); // Breakfast fat
    expect(screen.getByText('30g')).toBeInTheDocument(); // Lunch protein
    expect(screen.getByText('40g')).toBeInTheDocument(); // Lunch carbs
    expect(screen.getByText('15g')).toBeInTheDocument(); // Lunch fat
  });

  it('groups meals by type correctly', () => {
    const mockMeals: MealLogResponse[] = [
      {
        id: '1',
        user_id: 'user1',
        meal_type: 'breakfast',
        meal_time: '2025-10-31T08:00:00Z',
        total_calories: 300,
        total_protein_g: 10,
        total_carbs_g: 50,
        total_fat_g: 5,
        food_items: [],
        created_at: '2025-10-31T08:00:00Z',
        updated_at: '2025-10-31T08:00:00Z',
      },
      {
        id: '2',
        user_id: 'user1',
        meal_type: 'breakfast',
        meal_time: '2025-10-31T08:30:00Z',
        total_calories: 150,
        total_protein_g: 5,
        total_carbs_g: 25,
        total_fat_g: 2,
        food_items: [],
        created_at: '2025-10-31T08:30:00Z',
        updated_at: '2025-10-31T08:30:00Z',
      },
      {
        id: '3',
        user_id: 'user1',
        meal_type: 'lunch',
        meal_time: '2025-10-31T12:00:00Z',
        total_calories: 400,
        total_protein_g: 20,
        total_carbs_g: 30,
        total_fat_g: 10,
        food_items: [],
        created_at: '2025-10-31T12:00:00Z',
        updated_at: '2025-10-31T12:00:00Z',
      },
    ];

    setHookReturn({
      data: {
        totalCalories: 850,
        totalProtein: 35,
        totalCarbs: 105,
        totalFat: 17,
        mealCount: 3,
        meals: mockMeals,
      },
      isLoading: false,
      error: null,
    });

    render(<MealsLoggedWidget onViewDetails={mockOnViewDetails} />);

    // Breakfast: 2 meals, 300 + 150 = 450 kcal
    expect(
      screen.getByText((_content, element) => {
        return element?.textContent === '2 entries' || false;
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText((_content, element) => {
        return element?.textContent === '450 kcal' || false;
      })
    ).toBeInTheDocument();

    // Lunch: 1 meal, 400 kcal
    expect(
      screen.getByText((_content, element) => {
        return element?.textContent === '1 entry' || false;
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText((_content, element) => {
        return element?.textContent === '400 kcal' || false;
      })
    ).toBeInTheDocument();
  });
});
