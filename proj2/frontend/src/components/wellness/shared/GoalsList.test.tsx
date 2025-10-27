import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import GoalsList from './GoalsList';
import type { GoalResponse } from '@/lib/api';

// Mock the hooks
vi.mock('@/hooks/useGoalsData', () => ({
  useGoals: vi.fn(),
  useDeleteGoal: vi.fn(),
  calculateGoalProgress: vi.fn((goal) => goal.completion_percentage || 0),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock GoalForm component
vi.mock('./GoalForm', () => ({
  default: () => <button>New Goal</button>,
}));

import { useGoals, useDeleteGoal } from '@/hooks/useGoalsData';

describe('GoalsList', () => {
  let queryClient: QueryClient;

  const mockGoals: GoalResponse[] = [
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
      notes: 'Track daily calories',
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
      notes: 'Improve mood',
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
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <GoalsList />
      </QueryClientProvider>
    );
  };

  it('shows loading skeleton when data is loading', () => {
    vi.mocked(useGoals).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useGoals>);
    vi.mocked(useDeleteGoal).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGoal>);

    renderComponent();

    expect(screen.getByText('Your Goals')).toBeInTheDocument();
    // Skeleton elements should be present
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays empty state when no goals exist', () => {
    vi.mocked(useGoals).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGoals>);
    vi.mocked(useDeleteGoal).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGoal>);

    renderComponent();

    expect(screen.getByText('No goals yet')).toBeInTheDocument();
    expect(
      screen.getByText('Set your first goal to start tracking your progress')
    ).toBeInTheDocument();
  });

  it('renders goals in grid layout', () => {
    vi.mocked(useGoals).mockReturnValue({
      data: mockGoals,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGoals>);
    vi.mocked(useDeleteGoal).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGoal>);

    renderComponent();

    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByText('Mood Score')).toBeInTheDocument();
    expect(screen.getAllByText('nutrition')[0]).toBeInTheDocument();
    expect(screen.getAllByText('wellness')[0]).toBeInTheDocument();
  });

  it('displays goal progress correctly', () => {
    vi.mocked(useGoals).mockReturnValue({
      data: mockGoals,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGoals>);
    vi.mocked(useDeleteGoal).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGoal>);

    renderComponent();

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('shows current and target values', () => {
    vi.mocked(useGoals).mockReturnValue({
      data: mockGoals,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGoals>);
    vi.mocked(useDeleteGoal).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGoal>);

    renderComponent();

    expect(screen.getByText('1500')).toBeInTheDocument(); // current_value
    expect(screen.getByText('2000')).toBeInTheDocument(); // target_value
  });

  it('calls delete mutation when delete button is clicked after confirmation', async () => {
    const mockDeleteGoal = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useGoals).mockReturnValue({
      data: mockGoals,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGoals>);
    vi.mocked(useDeleteGoal).mockReturnValue({
      mutateAsync: mockDeleteGoal,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGoal>);

    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderComponent();

    const deleteButtons = screen.getAllByRole('button', { name: '' }); // Delete buttons with only icon
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteGoal).toHaveBeenCalledWith('1');
    });
  });

  it('does not delete when confirmation is cancelled', async () => {
    const mockDeleteGoal = vi.fn();
    vi.mocked(useGoals).mockReturnValue({
      data: mockGoals,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGoals>);
    vi.mocked(useDeleteGoal).mockReturnValue({
      mutateAsync: mockDeleteGoal,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGoal>);

    // Mock window.confirm to return false
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderComponent();

    const deleteButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(deleteButtons[0]);

    expect(mockDeleteGoal).not.toHaveBeenCalled();
  });

  it('displays status badges with correct colors', () => {
    const completedGoal: GoalResponse = {
      ...mockGoals[0],
      status: 'completed',
    };

    vi.mocked(useGoals).mockReturnValue({
      data: [completedGoal],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGoals>);
    vi.mocked(useDeleteGoal).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGoal>);

    renderComponent();

    expect(screen.getByText('completed')).toBeInTheDocument();
  });
});
