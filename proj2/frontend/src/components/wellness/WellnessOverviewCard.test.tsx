import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WellnessOverviewCard } from './WellnessOverviewCard';
import type { WellnessLogResponse, GoalResponse } from '@/lib/api';

// Mock the hooks
vi.mock('@/hooks/useWellnessData', () => ({
  useTodayWellnessLog: vi.fn(),
}));

vi.mock('@/hooks/useGoalsData', () => ({
  useActiveGoals: vi.fn(),
  calculateGoalProgress: vi.fn((goal) => goal.completion_percentage || 0),
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
import { useActiveGoals } from '@/hooks/useGoalsData';

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

  const mockActiveGoals: GoalResponse[] = [
    {
      id: '1',
      user_id: 'user1',
      goal_type: 'nutrition',
      target_type: 'calories',
      target_value: 2000,
      current_value: 1500,
      start_date: '2025-10-20',
      end_date: '2025-11-20',
      status: 'active',
      completion_percentage: 75,
      is_active: true,
      created_at: '2025-10-20T00:00:00Z',
      updated_at: '2025-10-27T00:00:00Z',
    },
    {
      id: '2',
      user_id: 'user1',
      goal_type: 'wellness',
      target_type: 'mood_score',
      target_value: 8,
      current_value: 6,
      start_date: '2025-10-15',
      end_date: '2025-11-15',
      status: 'active',
      completion_percentage: 60,
      is_active: true,
      created_at: '2025-10-15T00:00:00Z',
      updated_at: '2025-10-27T00:00:00Z',
    },
  ];

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

  it('shows loading skeleton when data is loading', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: null,
      isLoading: true,
    } as any);
    vi.mocked(useActiveGoals).mockReturnValue({
      data: [],
      isLoading: true,
    } as any);

    renderComponent();

    // Skeleton elements should be visible
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("displays today's wellness status", () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: mockTodayLog,
      isLoading: false,
    } as any);
    vi.mocked(useActiveGoals).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    renderComponent();

    expect(screen.getByText('Wellness Tracking')).toBeInTheDocument();
    expect(screen.getByText("Today's Status")).toBeInTheDocument();
    expect(screen.getByText('8/10')).toBeInTheDocument(); // Mood
    expect(screen.getByText('4/10')).toBeInTheDocument(); // Stress
    expect(screen.getByText('7/10')).toBeInTheDocument(); // Sleep quality
  });

  it('displays mood emoji correctly', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: mockTodayLog,
      isLoading: false,
    } as any);
    vi.mocked(useActiveGoals).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    renderComponent();

    // Mood score 8 should show happy emoji
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('shows empty state when no wellness data logged', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: null,
      isLoading: false,
    } as any);
    vi.mocked(useActiveGoals).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    renderComponent();

    expect(screen.getByText('No wellness data logged today')).toBeInTheDocument();
    expect(screen.getByText('Log Your First Entry')).toBeInTheDocument();
  });

  it('displays active goals in grid layout', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: mockTodayLog,
      isLoading: false,
    } as any);
    vi.mocked(useActiveGoals).mockReturnValue({
      data: mockActiveGoals,
      isLoading: false,
    } as any);

    renderComponent();

    expect(screen.getByText('Active Goals')).toBeInTheDocument();
    expect(screen.getByText('2 goals')).toBeInTheDocument();
    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByText('Mood Score')).toBeInTheDocument();
  });

  it('shows empty state when no active goals', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: mockTodayLog,
      isLoading: false,
    } as any);
    vi.mocked(useActiveGoals).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    renderComponent();

    expect(screen.getByText('No active goals set')).toBeInTheDocument();
    expect(screen.getByText('Set Your First Goal')).toBeInTheDocument();
  });

  it('displays up to 6 goals and shows "View more" button if more exist', () => {
    const manyGoals = Array.from({ length: 10 }, (_, i) => ({
      ...mockActiveGoals[0],
      id: `goal-${i}`,
      target_type: `target_${i}`,
    }));

    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: mockTodayLog,
      isLoading: false,
    } as any);
    vi.mocked(useActiveGoals).mockReturnValue({
      data: manyGoals,
      isLoading: false,
    } as any);

    renderComponent();

    // Should show "View 4 more goals" button
    expect(screen.getByText('View 4 more goals')).toBeInTheDocument();
  });

  it('navigates to wellness tracking page when clicking "View All" button', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: mockTodayLog,
      isLoading: false,
    } as any);
    vi.mocked(useActiveGoals).mockReturnValue({
      data: mockActiveGoals,
      isLoading: false,
    } as any);

    renderComponent();

    const viewAllButton = screen.getByRole('button', { name: /View All/i });
    fireEvent.click(viewAllButton);

    expect(mockNavigate).toHaveBeenCalledWith('/wellness-tracking');
  });

  it('navigates to wellness tracking page when clicking main action button', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: mockTodayLog,
      isLoading: false,
    } as any);
    vi.mocked(useActiveGoals).mockReturnValue({
      data: mockActiveGoals,
      isLoading: false,
    } as any);

    renderComponent();

    const actionButton = screen.getByRole('button', { name: /Go to Wellness Tracking/i });
    fireEvent.click(actionButton);

    expect(mockNavigate).toHaveBeenCalledWith('/wellness-tracking');
  });

  it('displays goal progress percentages', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: mockTodayLog,
      isLoading: false,
    } as any);
    vi.mocked(useActiveGoals).mockReturnValue({
      data: mockActiveGoals,
      isLoading: false,
    } as any);

    renderComponent();

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });
});
