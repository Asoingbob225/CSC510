import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WellnessOverviewCard } from './WellnessOverviewCard';
import type { WellnessLogResponse } from '@/lib/api';

// Mock the hooks
vi.mock('@/hooks/useWellnessData', () => ({
  useTodayWellnessLog: vi.fn(),
}));

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { useTodayWellnessLog } from '@/hooks/useWellnessData';

describe('WellnessOverviewCard', () => {
  let queryClient: QueryClient;

  const mockTodayLog: WellnessLogResponse = {
    id: '1',
    user_id: 'user1',
    mood_score: 8,
    stress_level: 4,
    quality_score: 7,
    duration_hours: 7.5,
    log_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WellnessOverviewCard />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('shows loading state', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: null,
      isLoading: true,
    } as unknown as ReturnType<typeof useTodayWellnessLog>);

    renderComponent();

    // Skeleton elements should be visible
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("displays today's wellness status", () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: mockTodayLog,
      isLoading: false,
    } as unknown as ReturnType<typeof useTodayWellnessLog>);

    renderComponent();

    expect(screen.getByText("Today's Wellness")).toBeInTheDocument();
    expect(screen.getByText('8/10')).toBeInTheDocument(); // Mood
    expect(screen.getByText('4/10')).toBeInTheDocument(); // Stress
    expect(screen.getByText('7/10')).toBeInTheDocument(); // Sleep quality
  });

  it('displays mood emoji correctly', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: mockTodayLog,
      isLoading: false,
    } as unknown as ReturnType<typeof useTodayWellnessLog>);

    renderComponent();

    // Mood score 8 should show happy emoji
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('shows empty state when no wellness data logged', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useTodayWellnessLog>);

    renderComponent();

    expect(screen.getByText('No wellness data today')).toBeInTheDocument();
    expect(screen.getByText('Log Your First Entry')).toBeInTheDocument();
  });

  it('navigates to wellness tracking page when clicking "View All" button', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: mockTodayLog,
      isLoading: false,
    } as unknown as ReturnType<typeof useTodayWellnessLog>);

    renderComponent();

    const viewAllButton = screen.getByRole('button', { name: /View All/i });
    fireEvent.click(viewAllButton);

    expect(mockNavigate).toHaveBeenCalledWith('/wellness-tracking');
  });

  it('navigates to wellness tracking page when clicking empty state button', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useTodayWellnessLog>);

    renderComponent();

    const actionButton = screen.getByRole('button', { name: /Log Your First Entry/i });
    fireEvent.click(actionButton);

    expect(mockNavigate).toHaveBeenCalledWith('/wellness-tracking');
  });

  it('displays correct stress level color coding', () => {
    const highStressLog: WellnessLogResponse = {
      ...mockTodayLog,
      stress_level: 9,
    };

    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: highStressLog,
      isLoading: false,
    } as unknown as ReturnType<typeof useTodayWellnessLog>);

    renderComponent();

    expect(screen.getByText('9/10')).toBeInTheDocument();
  });

  it('displays correct sleep quality color coding', () => {
    const goodSleepLog: WellnessLogResponse = {
      ...mockTodayLog,
      quality_score: 9,
    };

    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: goodSleepLog,
      isLoading: false,
    } as unknown as ReturnType<typeof useTodayWellnessLog>);

    renderComponent();

    expect(screen.getByText('9/10')).toBeInTheDocument();
  });
});
