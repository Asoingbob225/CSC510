import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DailySummaryWidget } from './DailySummaryWidget';
import * as useDailyNutritionModule from '@/hooks/useDailyNutrition';

// Mock the hook
vi.mock('@/hooks/useDailyNutrition', () => ({
  useDailyNutrition: vi.fn(),
  formatTodayDate: vi.fn(() => 'October 31, 2025'),
}));

describe('DailySummaryWidget', () => {
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

    const mockOnViewDetails = vi.fn();
    render(<DailySummaryWidget onViewDetails={mockOnViewDetails} />);

    // Should show skeleton loaders
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('shows empty state when no meals are logged', () => {
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

    const mockOnViewDetails = vi.fn();
    render(<DailySummaryWidget onViewDetails={mockOnViewDetails} />);

    expect(screen.getByText('No meals logged yet')).toBeInTheDocument();
    expect(
      screen.getByText(/Start tracking your nutrition by logging a meal/i)
    ).toBeInTheDocument();
  });

  it('displays daily nutrition summary correctly', () => {
    vi.mocked(useDailyNutritionModule.useDailyNutrition).mockReturnValue({
      data: {
        totalCalories: 1800,
        totalProtein: 90,
        totalCarbs: 200,
        totalFat: 60,
        mealCount: 3,
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
          {
            id: '3',
            user_id: 'user1',
            meal_type: 'dinner',
            meal_time: '2025-10-31T18:00:00Z',
            total_calories: 600,
            total_protein_g: 30,
            total_carbs_g: 60,
            total_fat_g: 20,
            food_items: [],
            created_at: '2025-10-31T18:00:00Z',
            updated_at: '2025-10-31T18:00:00Z',
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    const mockOnViewDetails = vi.fn();
    render(<DailySummaryWidget onViewDetails={mockOnViewDetails} />);

    expect(screen.getByText('Daily Summary')).toBeInTheDocument();
    expect(screen.getByText('October 31, 2025')).toBeInTheDocument();
    expect(screen.getByText('1800')).toBeInTheDocument(); // Calories
    expect(screen.getByText('90')).toBeInTheDocument(); // Protein
    expect(screen.getByText('200')).toBeInTheDocument(); // Carbs
    expect(screen.getByText('60')).toBeInTheDocument(); // Fat
  });

  it('calls onViewDetails when View Details button is clicked', () => {
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

    const mockOnViewDetails = vi.fn();
    render(<DailySummaryWidget onViewDetails={mockOnViewDetails} />);

    const button = screen.getByRole('button', { name: /View Details/i });
    fireEvent.click(button);

    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it('groups meals by type correctly', () => {
    vi.mocked(useDailyNutritionModule.useDailyNutrition).mockReturnValue({
      data: {
        totalCalories: 1200,
        totalProtein: 60,
        totalCarbs: 140,
        totalFat: 40,
        mealCount: 4,
        meals: [
          {
            id: '1',
            user_id: 'user1',
            meal_type: 'breakfast',
            meal_time: '2025-10-31T08:00:00Z',
            total_calories: 400,
            total_protein_g: 15,
            total_carbs_g: 50,
            total_fat_g: 10,
            food_items: [],
            created_at: '2025-10-31T08:00:00Z',
            updated_at: '2025-10-31T08:00:00Z',
          },
          {
            id: '2',
            user_id: 'user1',
            meal_type: 'snack',
            meal_time: '2025-10-31T10:00:00Z',
            total_calories: 200,
            total_protein_g: 10,
            total_carbs_g: 30,
            total_fat_g: 5,
            food_items: [],
            created_at: '2025-10-31T10:00:00Z',
            updated_at: '2025-10-31T10:00:00Z',
          },
          {
            id: '3',
            user_id: 'user1',
            meal_type: 'snack',
            meal_time: '2025-10-31T15:00:00Z',
            total_calories: 150,
            total_protein_g: 5,
            total_carbs_g: 20,
            total_fat_g: 5,
            food_items: [],
            created_at: '2025-10-31T15:00:00Z',
            updated_at: '2025-10-31T15:00:00Z',
          },
          {
            id: '4',
            user_id: 'user1',
            meal_type: 'dinner',
            meal_time: '2025-10-31T18:00:00Z',
            total_calories: 450,
            total_protein_g: 30,
            total_carbs_g: 40,
            total_fat_g: 20,
            food_items: [],
            created_at: '2025-10-31T18:00:00Z',
            updated_at: '2025-10-31T18:00:00Z',
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    const mockOnViewDetails = vi.fn();
    render(<DailySummaryWidget onViewDetails={mockOnViewDetails} />);

    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Snack')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('2 entries')).toBeInTheDocument(); // For snacks
  });
});
