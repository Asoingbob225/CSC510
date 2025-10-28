/**
 * Tests for RecommendationCarousel component with TanStack Query
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecommendationCarousel } from './RecommendationCarousel';
import { recommendationApi } from '@/lib/api';
import type { MealRecommendationResponse } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  recommendationApi: {
    getMealRecommendations: vi.fn(),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('RecommendationCarousel', () => {
  const mockUserId = 'user-123';

  const mockRecommendations: MealRecommendationResponse = {
    user_id: mockUserId,
    recommendations: [
      {
        menu_item_id: 'item-1',
        score: 0.95,
        explanation: 'Restaurant: Healthy Bites, 450 cal',
      },
      {
        menu_item_id: 'item-2',
        score: 0.85,
        explanation: 'Restaurant: Green Garden, 380 cal',
      },
      {
        menu_item_id: 'item-3',
        score: 0.75,
        explanation: 'Restaurant: Fresh Kitchen, 520 cal',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(recommendationApi.getMealRecommendations).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithQueryClient(<RecommendationCarousel userId={mockUserId} />);

    expect(screen.getByText('Meal Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Loading personalized recommendations...')).toBeInTheDocument();
  });

  it('renders recommendations successfully', async () => {
    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(mockRecommendations);

    renderWithQueryClient(<RecommendationCarousel userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText(/Restaurant: Healthy Bites, 450 cal/)).toBeInTheDocument();
    });

    // Check score display
    expect(screen.getByText('95% Match')).toBeInTheDocument();
    expect(screen.getByText('Score: 0.95')).toBeInTheDocument();

    // Check pagination
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });

  it('handles navigation between recommendations', async () => {
    const user = userEvent.setup();
    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(mockRecommendations);

    renderWithQueryClient(<RecommendationCarousel userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText(/Restaurant: Healthy Bites/)).toBeInTheDocument();
    });

    // Click Next
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(screen.getByText(/Restaurant: Green Garden/)).toBeInTheDocument();
    expect(screen.getByText('85% Match')).toBeInTheDocument();
    expect(screen.getByText('2 of 3')).toBeInTheDocument();

    // Click Previous
    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);

    expect(screen.getByText(/Restaurant: Healthy Bites/)).toBeInTheDocument();
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });

  it('wraps around when navigating past bounds', async () => {
    const user = userEvent.setup();
    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(mockRecommendations);

    renderWithQueryClient(<RecommendationCarousel userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText(/Restaurant: Healthy Bites/)).toBeInTheDocument();
    });

    // Click Previous from first item (should go to last)
    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);

    expect(screen.getByText(/Restaurant: Fresh Kitchen/)).toBeInTheDocument();
    expect(screen.getByText('3 of 3')).toBeInTheDocument();

    // Click Next from last item (should go to first)
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(screen.getByText(/Restaurant: Healthy Bites/)).toBeInTheDocument();
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });

  it('renders empty state when no recommendations available', async () => {
    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue({
      user_id: mockUserId,
      recommendations: [],
    });

    renderWithQueryClient(<RecommendationCarousel userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText('No recommendations available yet')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Complete your health profile to get personalized meal recommendations/)
    ).toBeInTheDocument();
  });

  it('refetches data when refresh button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(mockRecommendations);

    renderWithQueryClient(<RecommendationCarousel userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText(/Restaurant: Healthy Bites/)).toBeInTheDocument();
    });

    expect(recommendationApi.getMealRecommendations).toHaveBeenCalledTimes(1);

    // Click refresh button (the ghost button in header)
    const refreshButtons = screen.getAllByRole('button');
    const refreshButton = refreshButtons.find((btn) => {
      const svg = btn.querySelector('svg');
      return svg?.classList.contains('lucide-refresh-cw');
    });

    if (refreshButton) {
      await user.click(refreshButton);
    }

    await waitFor(() => {
      expect(recommendationApi.getMealRecommendations).toHaveBeenCalledTimes(2);
    });
  });

  it('passes constraints to API when provided', async () => {
    const constraints = { max_price: 15, cuisine: 'italian' };
    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(mockRecommendations);

    renderWithQueryClient(<RecommendationCarousel userId={mockUserId} constraints={constraints} />);

    await waitFor(() => {
      expect(recommendationApi.getMealRecommendations).toHaveBeenCalledWith(
        mockUserId,
        constraints
      );
    });
  });

  it('disables navigation buttons when only one recommendation', async () => {
    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue({
      user_id: mockUserId,
      recommendations: [mockRecommendations.recommendations[0]],
    });

    renderWithQueryClient(<RecommendationCarousel userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText(/Restaurant: Healthy Bites/)).toBeInTheDocument();
    });

    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('displays menu item ID correctly', async () => {
    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue(mockRecommendations);

    renderWithQueryClient(<RecommendationCarousel userId={mockUserId} />);

    await waitFor(() => {
      // Should show truncated ID in badge
      expect(screen.getByText(/ID: item-1\.\.\./)).toBeInTheDocument();
      // Should show full ID in metadata section
      expect(screen.getByText(/Menu Item ID: item-1/)).toBeInTheDocument();
    });
  });

  it('calculates score percentage correctly', async () => {
    vi.mocked(recommendationApi.getMealRecommendations).mockResolvedValue({
      user_id: mockUserId,
      recommendations: [
        {
          menu_item_id: 'item-1',
          score: 0.876,
          explanation: 'Test item',
        },
      ],
    });

    renderWithQueryClient(<RecommendationCarousel userId={mockUserId} />);

    await waitFor(() => {
      // 0.876 * 100 = 87.6, rounded to 88
      expect(screen.getByText('88% Match')).toBeInTheDocument();
      expect(screen.getByText('Score: 0.88')).toBeInTheDocument();
    });
  });
});
