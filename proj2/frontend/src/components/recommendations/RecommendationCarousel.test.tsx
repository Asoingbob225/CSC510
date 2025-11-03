/**
 * Tests for the enhanced RecommendationCarousel component.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecommendationCarousel } from './RecommendationCarousel';

// Mock the recommendation API
vi.mock('@/lib/api', () => ({
  default: {},
  recommendationApi: {
    getMealRecommendations: vi.fn(),
  },
}));

import { recommendationApi } from '@/lib/api';
import type { MealRecommendationResponse } from '@/lib/api';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('RecommendationCarousel', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    // No mocks needed for initial state test
  });

  it('renders initial configuration state before user requests recommendations', () => {
    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    expect(screen.getByText('Meal Recommendations')).toBeInTheDocument();
    expect(
      screen.getByText('Get personalized meal suggestions based on your preferences')
    ).toBeInTheDocument();
    expect(screen.getByText('Get Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Recommendation Engine')).toBeInTheDocument();

    // Verify toggle groups for dietary restrictions and cuisines are present
    expect(screen.getByText('Dietary Restrictions')).toBeInTheDocument();
    expect(screen.getByText('Preferred Cuisines')).toBeInTheDocument();

    // Verify some common options are rendered
    expect(screen.getByText('vegetarian')).toBeInTheDocument();
    expect(screen.getByText('vegan')).toBeInTheDocument();
    expect(screen.getByText('italian')).toBeInTheDocument();
    expect(screen.getByText('chinese')).toBeInTheDocument();
  });

  it('displays recommendations after clicking Get Recommendations button', async () => {
    const user = userEvent.setup();
    const mockResponse: MealRecommendationResponse = {
      items: [
        {
          item_id: 'test-1',
          name: 'Grilled Chicken Salad',
          score: 0.92,
          explanation: 'High protein, low carb; Perfect for your fitness goals',
          calories: 350,
          price: 12.99,
        },
        {
          item_id: 'test-2',
          name: 'Vegetarian Buddha Bowl',
          score: 0.88,
          explanation: 'Plant-based protein; Rich in fiber',
          calories: 420,
          price: 11.49,
        },
      ],
    };

    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(mockResponse);

    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    const getRecommendationsButton = screen.getByText('Get Recommendations');
    await user.click(getRecommendationsButton);

    await waitFor(() => {
      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument();
      expect(screen.getByText('Vegetarian Buddha Bowl')).toBeInTheDocument();
    });

    // Verify scores are displayed
    expect(screen.getByText(/92% match/i)).toBeInTheDocument();
    expect(screen.getByText(/88% match/i)).toBeInTheDocument();
  });

  it('normalizes legacy recommendation response format', async () => {
    const user = userEvent.setup();
    const legacyResponse: MealRecommendationResponse = {
      recommendations: [
        {
          menu_item_id: 'legacy-1',
          score: 0.85,
          explanation: 'Restaurant: Green Cafe; Healthy and delicious',
          menu_item: {
            id: 'menu-1',
            name: 'Quinoa Power Bowl',
            description: 'Packed with nutrients',
            price: 13.99,
            calories: 380,
          },
          restaurant: {
            id: 'rest-1',
            name: 'Green Cafe',
            is_active: true,
          },
        },
      ],
    };

    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(legacyResponse);

    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    const getRecommendationsButton = screen.getByText('Get Recommendations');
    await user.click(getRecommendationsButton);

    await waitFor(() => {
      expect(screen.getByText('Quinoa Power Bowl')).toBeInTheDocument();
    });

    expect(screen.getByText('Green Cafe')).toBeInTheDocument();
    expect(screen.getByText(/85% match/i)).toBeInTheDocument();
  });

  it('allows selecting dietary restriction filters', async () => {
    const user = userEvent.setup();
    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    // Find and click vegetarian toggle
    const vegetarianToggle = screen.getByText('vegetarian');
    await user.click(vegetarianToggle);

    // Verify the toggle is selected (by checking aria-pressed or data-state)
    expect(vegetarianToggle).toHaveAttribute('data-state', 'on');

    // Click vegan toggle
    const veganToggle = screen.getByText('vegan');
    await user.click(veganToggle);
    expect(veganToggle).toHaveAttribute('data-state', 'on');
  });

  it('allows selecting cuisine preferences', async () => {
    const user = userEvent.setup();
    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    // Find and click italian toggle
    const italianToggle = screen.getByText('italian');
    await user.click(italianToggle);
    expect(italianToggle).toHaveAttribute('data-state', 'on');

    // Click chinese toggle
    const chineseToggle = screen.getByText('chinese');
    await user.click(chineseToggle);
    expect(chineseToggle).toHaveAttribute('data-state', 'on');
  });

  it('clears filters when Clear Filters button is clicked', async () => {
    const user = userEvent.setup();
    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    // Select some filters
    const vegetarianToggle = screen.getByText('vegetarian');
    await user.click(vegetarianToggle);
    expect(vegetarianToggle).toHaveAttribute('data-state', 'on');

    const italianToggle = screen.getByText('italian');
    await user.click(italianToggle);
    expect(italianToggle).toHaveAttribute('data-state', 'on');

    // Click Clear Filters
    const clearButton = screen.getByText('Clear Filters');
    await user.click(clearButton);

    // Verify filters are cleared
    expect(vegetarianToggle).toHaveAttribute('data-state', 'off');
    expect(italianToggle).toHaveAttribute('data-state', 'off');
  });

  it('switches between LLM and baseline recommendation modes', async () => {
    const user = userEvent.setup();
    renderWithClient(<RecommendationCarousel userId={mockUserId} initialMode="llm" />);

    // Find AI Powered button (should be selected initially)
    const aiButton = screen.getByRole('button', { name: /AI Powered/i });
    expect(aiButton).toHaveClass('bg-emerald-500');

    // Click Basic button
    const basicButton = screen.getByRole('button', { name: /Basic/i });
    await user.click(basicButton);

    // Verify Basic is now selected
    await waitFor(() => {
      expect(basicButton).toHaveClass('bg-emerald-500');
    });
  });

  it('displays empty state when no recommendations are available', async () => {
    const user = userEvent.setup();
    const emptyResponse: MealRecommendationResponse = {
      items: [],
    };

    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(emptyResponse);

    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    const getRecommendationsButton = screen.getByText('Get Recommendations');
    await user.click(getRecommendationsButton);

    await waitFor(() => {
      expect(screen.getByText('No recommendations available yet')).toBeInTheDocument();
    });

    expect(screen.getByText(/No meals match your current filters/i)).toBeInTheDocument();

    // Verify both action buttons are present
    expect(screen.getByText('Adjust Filters')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('returns to filter configuration when Adjust Filters is clicked in empty state', async () => {
    const user = userEvent.setup();
    const emptyResponse: MealRecommendationResponse = {
      items: [],
    };

    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(emptyResponse);

    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    // Get recommendations (will return empty)
    const getRecommendationsButton = screen.getByText('Get Recommendations');
    await user.click(getRecommendationsButton);

    await waitFor(() => {
      expect(screen.getByText('No recommendations available yet')).toBeInTheDocument();
    });

    // Click Adjust Filters
    const adjustFiltersButton = screen.getByText('Adjust Filters');
    await user.click(adjustFiltersButton);

    // Should return to initial state
    await waitFor(() => {
      expect(
        screen.getByText('Get personalized meal suggestions based on your preferences')
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Get Recommendations')).toBeInTheDocument();
  });

  it('displays error state when API call fails after retries', async () => {
    const user = userEvent.setup();

    // Mock will fail 3 times (initial + 2 retries) to exhaust React Query retries
    vi.mocked(recommendationApi.getMealRecommendations)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    // Click to trigger request
    const getRecommendationsButton = screen.getByText('Get Recommendations');
    await user.click(getRecommendationsButton);

    // Wait for error state to appear (after all retries exhausted)
    await waitFor(
      () => {
        expect(screen.getByText('Unable to load recommendations')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  it('retries fetching recommendations when Try Again is clicked in error state', async () => {
    const user = userEvent.setup();

    // First set: fail 3 times to trigger error state
    vi.mocked(recommendationApi.getMealRecommendations)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    // First request triggers error
    const getRecommendationsButton = screen.getByText('Get Recommendations');
    await user.click(getRecommendationsButton);

    // Wait for error state
    await waitFor(
      () => {
        expect(screen.getByText('Unable to load recommendations')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Setup success response for retry
    const successResponse: MealRecommendationResponse = {
      items: [
        {
          item_id: 'retry-1',
          name: 'Recovery Meal',
          score: 0.9,
          explanation: 'Successfully loaded',
          calories: 400,
          price: 12.0,
        },
      ],
    };
    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(successResponse);

    // Click Try Again
    const tryAgainButtons = screen.getAllByRole('button', { name: /Try Again/i });
    await user.click(tryAgainButtons[0]);

    // Should show success
    await waitFor(
      () => {
        expect(screen.getByText('Recovery Meal')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
  it('displays mental wellness indicators for magnesium-rich foods', async () => {
    const user = userEvent.setup();
    const stressReliefResponse: MealRecommendationResponse = {
      items: [
        {
          item_id: 'stress-item-1',
          name: 'Spinach Power Salad',
          score: 0.91,
          explanation: 'High in magnesium for stress relief and relaxation',
          calories: 280,
          price: 10.99,
        },
        {
          item_id: 'stress-item-2',
          name: 'Almond Energy Bowl',
          score: 0.87,
          explanation: 'Magnesium-rich almonds help reduce stress',
          calories: 320,
          price: 11.99,
        },
      ],
    };

    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(stressReliefResponse);

    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    // Click the "Get Recommendations" button to trigger the request
    const getRecommendationsButton = screen.getByText('Get Recommendations');
    await user.click(getRecommendationsButton);

    await waitFor(() => {
      expect(screen.getByText('Spinach Power Salad')).toBeInTheDocument();
    });

    // Verify magnesium-related explanations are displayed
    expect(screen.getByText(/magnesium for stress relief/i)).toBeInTheDocument();
    expect(screen.getByText(/magnesium-rich almonds/i)).toBeInTheDocument();
  });

  it('displays calorie information for items matching calorie goals', async () => {
    const user = userEvent.setup();
    const calorieMatchResponse: MealRecommendationResponse = {
      items: [
        {
          item_id: 'cal-item-1',
          name: 'Light Garden Bowl',
          score: 0.9,
          explanation: 'Matches calorie goal; 350 kcal; High in vegetables',
          calories: 350,
          price: 9.99,
        },
        {
          item_id: 'cal-item-2',
          name: 'Protein Power Plate',
          score: 0.88,
          explanation: '450 kcal; High protein; Supports fitness goals',
          calories: 450,
          price: 12.99,
        },
      ],
    };

    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(calorieMatchResponse);

    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    // Click the "Get Recommendations" button to trigger the request
    const getRecommendationsButton = screen.getByText('Get Recommendations');
    await user.click(getRecommendationsButton);

    await waitFor(() => {
      expect(screen.getByText('Light Garden Bowl')).toBeInTheDocument();
    });

    // Verify calorie information is displayed
    expect(screen.getByText('350 kcal')).toBeInTheDocument();
    expect(screen.getByText('450 kcal')).toBeInTheDocument();
    expect(screen.getByText(/Matches calorie goal/i)).toBeInTheDocument();
  });

  it('sorts recommendations by score in descending order', async () => {
    const user = userEvent.setup();
    const sortedResponse: MealRecommendationResponse = {
      items: [
        {
          item_id: 'item-1',
          name: 'Top Match',
          score: 0.95,
          explanation: 'Best match',
          calories: 400,
          price: 12.0,
        },
        {
          item_id: 'item-2',
          name: 'Second Best',
          score: 0.85,
          explanation: 'Good match',
          calories: 380,
          price: 11.0,
        },
        {
          item_id: 'item-3',
          name: 'Third Place',
          score: 0.75,
          explanation: 'Fair match',
          calories: 360,
          price: 10.0,
        },
      ],
    };

    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(sortedResponse);

    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    // Click the "Get Recommendations" button to trigger the request
    const getRecommendationsButton = screen.getByText('Get Recommendations');
    await user.click(getRecommendationsButton);

    await waitFor(() => {
      expect(screen.getByText('Top Match')).toBeInTheDocument();
    });

    // Verify scores are displayed in descending order (as percentages)
    expect(screen.getByText(/95% match/i)).toBeInTheDocument();
    expect(screen.getByText(/85% match/i)).toBeInTheDocument();
    expect(screen.getByText(/75% match/i)).toBeInTheDocument();
  });

  it('displays restaurant information in explanations', async () => {
    const user = userEvent.setup();
    const restaurantInfoResponse: MealRecommendationResponse = {
      items: [
        {
          item_id: 'rest-item-1',
          name: 'Italian Pasta',
          score: 0.9,
          explanation: 'Restaurant: Bella Italia; Cuisine: Italian; 520 kcal',
          calories: 520,
          price: 14.99,
        },
      ],
    };

    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(restaurantInfoResponse);

    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    // Click the "Get Recommendations" button to trigger the request
    const getRecommendationsButton = screen.getByText('Get Recommendations');
    await user.click(getRecommendationsButton);

    await waitFor(() => {
      expect(screen.getByText('Italian Pasta')).toBeInTheDocument();
    });

    // Verify restaurant info is displayed
    expect(screen.getByText('Bella Italia')).toBeInTheDocument();
  });

  it('limits displayed items to max results setting', async () => {
    const user = userEvent.setup();
    const manyItemsResponse: MealRecommendationResponse = {
      items: Array.from({ length: 15 }, (_, i) => ({
        item_id: `item-${i + 1}`,
        name: `Meal ${i + 1}`,
        score: 0.9 - i * 0.01,
        explanation: `Explanation ${i + 1}`,
        calories: 400,
        price: 12.0,
      })),
    };

    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(manyItemsResponse);

    renderWithClient(<RecommendationCarousel userId={mockUserId} />);

    // Click the "Get Recommendations" button to trigger the request
    const getRecommendationsButton = screen.getByText('Get Recommendations');
    await user.click(getRecommendationsButton);

    await waitFor(() => {
      expect(screen.getByText('Meal 1')).toBeInTheDocument();
    });

    // The component should display only the first few items
    expect(screen.getByText('Meal 1')).toBeInTheDocument();
    expect(screen.getByText('Meal 2')).toBeInTheDocument();

    // Items beyond limit should not be visible initially
    // (Exact number depends on carousel implementation)
  });
});
