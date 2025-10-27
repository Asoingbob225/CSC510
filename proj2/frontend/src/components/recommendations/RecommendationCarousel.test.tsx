import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecommendationCarousel } from './RecommendationCarousel';
import * as api from '@/lib/api';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('RecommendationCarousel', () => {
  const mockUserId = 'test-user-123';
  const mockRecommendations = [
    {
      menu_item_id: 'item-1',
      score: 0.95,
      explanation: 'Restaurant: Healthy Eats, 450 cal, $12.50',
    },
    {
      menu_item_id: 'item-2',
      score: 0.88,
      explanation: 'Restaurant: Green Bowl, 380 cal, $10.00',
    },
    {
      menu_item_id: 'item-3',
      score: 0.82,
      explanation: 'Restaurant: Fresh Kitchen, 520 cal, $14.00',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('displays loading state initially', () => {
      vi.spyOn(api.recommendationApi, 'getMealRecommendations').mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<RecommendationCarousel userId={mockUserId} />);

      expect(screen.getByText('Meal Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Loading personalized recommendations...')).toBeInTheDocument();
    });

    it('shows loading spinner during fetch', () => {
      vi.spyOn(api.recommendationApi, 'getMealRecommendations').mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { container } = render(<RecommendationCarousel userId={mockUserId} />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('displays recommendations after successful fetch', async () => {
      vi.spyOn(api.recommendationApi, 'getMealRecommendations').mockResolvedValue({
        user_id: mockUserId,
        recommendations: mockRecommendations,
      });

      render(<RecommendationCarousel userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText(/Restaurant: Healthy Eats/)).toBeInTheDocument();
      });

      expect(screen.getByText('95% Match')).toBeInTheDocument();
      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('calls API with correct user ID', async () => {
      const getMealRecommendationsSpy = vi
        .spyOn(api.recommendationApi, 'getMealRecommendations')
        .mockResolvedValue({
          user_id: mockUserId,
          recommendations: mockRecommendations,
        });

      render(<RecommendationCarousel userId={mockUserId} />);

      await waitFor(() => {
        expect(getMealRecommendationsSpy).toHaveBeenCalledWith(mockUserId);
      });
    });
  });

  describe('Error State', () => {
    it('displays error message when fetch fails', async () => {
      vi.spyOn(api.recommendationApi, 'getMealRecommendations').mockRejectedValue(
        new Error('Network error')
      );

      render(<RecommendationCarousel userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Unable to load recommendations')).toBeInTheDocument();
      });

      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('shows generic error for non-Error objects', async () => {
      vi.spyOn(api.recommendationApi, 'getMealRecommendations').mockRejectedValue('Unknown error');

      render(<RecommendationCarousel userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load recommendations')).toBeInTheDocument();
      });
    });

    it('allows retry after error', async () => {
      const getMealRecommendationsSpy = vi
        .spyOn(api.recommendationApi, 'getMealRecommendations')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          user_id: mockUserId,
          recommendations: mockRecommendations,
        });

      const user = userEvent.setup();
      render(<RecommendationCarousel userId={mockUserId} />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByText('Try Again');
      await user.click(retryButton);

      // Should display recommendations after retry
      await waitFor(() => {
        expect(screen.getByText(/Restaurant: Healthy Eats/)).toBeInTheDocument();
      });

      expect(getMealRecommendationsSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no recommendations', async () => {
      vi.spyOn(api.recommendationApi, 'getMealRecommendations').mockResolvedValue({
        user_id: mockUserId,
        recommendations: [],
      });

      render(<RecommendationCarousel userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('No recommendations available yet')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Complete your health profile to get personalized meal recommendations/)
      ).toBeInTheDocument();
      expect(screen.getByText('Check Again')).toBeInTheDocument();
    });
  });

  describe('Carousel Navigation', () => {
    beforeEach(async () => {
      vi.spyOn(api.recommendationApi, 'getMealRecommendations').mockResolvedValue({
        user_id: mockUserId,
        recommendations: mockRecommendations,
      });
    });

    it('navigates to next recommendation', async () => {
      const user = userEvent.setup();
      render(<RecommendationCarousel userId={mockUserId} />);

      // Wait for first recommendation to load
      await waitFor(() => {
        expect(screen.getByText(/Restaurant: Healthy Eats/)).toBeInTheDocument();
      });

      // Click next button
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      // Should show second recommendation
      expect(screen.getByText(/Restaurant: Green Bowl/)).toBeInTheDocument();
      expect(screen.getByText('2 of 3')).toBeInTheDocument();
      expect(screen.getByText('88% Match')).toBeInTheDocument();
    });

    it('navigates to previous recommendation', async () => {
      const user = userEvent.setup();
      render(<RecommendationCarousel userId={mockUserId} />);

      // Wait for first recommendation to load
      await waitFor(() => {
        expect(screen.getByText(/Restaurant: Healthy Eats/)).toBeInTheDocument();
      });

      // Click next to go to second
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      // Click previous to go back
      const prevButton = screen.getByText('Previous');
      await user.click(prevButton);

      // Should show first recommendation again
      expect(screen.getByText(/Restaurant: Healthy Eats/)).toBeInTheDocument();
      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('wraps around to last when clicking previous on first', async () => {
      const user = userEvent.setup();
      render(<RecommendationCarousel userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText(/Restaurant: Healthy Eats/)).toBeInTheDocument();
      });

      // Click previous on first item
      const prevButton = screen.getByText('Previous');
      await user.click(prevButton);

      // Should show last recommendation
      expect(screen.getByText(/Restaurant: Fresh Kitchen/)).toBeInTheDocument();
      expect(screen.getByText('3 of 3')).toBeInTheDocument();
    });

    it('wraps around to first when clicking next on last', async () => {
      const user = userEvent.setup();
      render(<RecommendationCarousel userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText(/Restaurant: Healthy Eats/)).toBeInTheDocument();
      });

      // Navigate to last item
      const nextButton = screen.getByText('Next');
      await user.click(nextButton); // Item 2
      await user.click(nextButton); // Item 3
      await user.click(nextButton); // Should wrap to Item 1

      // Should show first recommendation again
      expect(screen.getByText(/Restaurant: Healthy Eats/)).toBeInTheDocument();
      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('disables navigation buttons with single recommendation', async () => {
      vi.spyOn(api.recommendationApi, 'getMealRecommendations').mockResolvedValue({
        user_id: mockUserId,
        recommendations: [mockRecommendations[0]],
      });

      render(<RecommendationCarousel userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText(/Restaurant: Healthy Eats/)).toBeInTheDocument();
      });

      const prevButton = screen.getByText('Previous');
      const nextButton = screen.getByText('Next');

      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Refresh Functionality', () => {
    it('has refresh button in header', async () => {
      vi.spyOn(api.recommendationApi, 'getMealRecommendations').mockResolvedValue({
        user_id: mockUserId,
        recommendations: mockRecommendations,
      });

      render(<RecommendationCarousel userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Personalized suggestions based on your profile')).toBeInTheDocument();
      });

      // Check for refresh button (it has an icon but no text)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('refetches recommendations when refresh is clicked', async () => {
      const getMealRecommendationsSpy = vi
        .spyOn(api.recommendationApi, 'getMealRecommendations')
        .mockResolvedValue({
          user_id: mockUserId,
          recommendations: mockRecommendations,
        });

      const user = userEvent.setup();
      render(<RecommendationCarousel userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText(/Restaurant: Healthy Eats/)).toBeInTheDocument();
      });

      // Find and click the refresh button (ghost variant with RefreshCw icon)
      const buttons = screen.getAllByRole('button');
      const refreshButton = buttons.find((btn) => {
        const element = btn as HTMLButtonElement;
        return !btn.textContent && !element.disabled;
      });
      expect(refreshButton).toBeDefined();

      await user.click(refreshButton!);

      // Should be called twice: once on mount, once on refresh
      await waitFor(() => {
        expect(getMealRecommendationsSpy).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Display Information', () => {
    it('displays score as percentage', async () => {
      vi.spyOn(api.recommendationApi, 'getMealRecommendations').mockResolvedValue({
        user_id: mockUserId,
        recommendations: mockRecommendations,
      });

      render(<RecommendationCarousel userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('95% Match')).toBeInTheDocument();
      });
    });

    it('displays menu item ID', async () => {
      vi.spyOn(api.recommendationApi, 'getMealRecommendations').mockResolvedValue({
        user_id: mockUserId,
        recommendations: mockRecommendations,
      });

      render(<RecommendationCarousel userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Menu Item ID: item-1')).toBeInTheDocument();
      });
    });

    it('displays explanation text', async () => {
      vi.spyOn(api.recommendationApi, 'getMealRecommendations').mockResolvedValue({
        user_id: mockUserId,
        recommendations: mockRecommendations,
      });

      render(<RecommendationCarousel userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Restaurant: Healthy Eats, 450 cal, $12.50')).toBeInTheDocument();
      });
    });
  });
});
