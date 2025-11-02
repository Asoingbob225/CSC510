import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import WellnessTrackingPage from './WellnessTracking';

// Mock the DashboardNavbar component
vi.mock('@/components/DashboardNavbar', () => ({
  DashboardNavbar: () => <div>Mocked DashboardNavbar</div>,
}));

// Mock the wellness hooks
vi.mock('@/hooks/useWellnessData', () => ({
  useWellnessChartData: vi.fn(),
  useTodayWellnessLog: vi.fn(),
  useCreateMoodLog: vi.fn(),
  useCreateStressLog: vi.fn(),
  useCreateSleepLog: vi.fn(),
}));

vi.mock('@/hooks/useGoalsData', () => ({
  useGoals: vi.fn(),
  useDeleteGoal: vi.fn(),
  useCreateGoal: vi.fn(),
  calculateGoalProgress: vi.fn((goal) => goal.completion_percentage || 0),
}));

// Mock child components
vi.mock('@/components/wellness/mental/MoodLogWidget', () => ({
  default: () => <div>MoodLogWidget</div>,
}));

vi.mock('@/components/wellness/mental/StressLogWidget', () => ({
  default: () => <div>StressLogWidget</div>,
}));

vi.mock('@/components/wellness/mental/SleepLogWidget', () => ({
  default: () => <div>SleepLogWidget</div>,
}));

vi.mock('@/components/wellness/shared/WellnessChart', () => ({
  default: ({ metric }: { metric: string }) => <div>WellnessChart-{metric}</div>,
}));

vi.mock('@/components/wellness/shared/GoalsList', () => ({
  default: () => <div>GoalsList</div>,
}));

import { useWellnessChartData, useTodayWellnessLog } from '@/hooks/useWellnessData';
import { useGoals, useCreateGoal } from '@/hooks/useGoalsData';

describe('WellnessTrackingPage', () => {
  let queryClient: QueryClient;

  const mockChartData = {
    mood: [{ date: '2025-10-27', value: 8 }],
    stress: [{ date: '2025-10-27', value: 4 }],
    sleep: [{ date: '2025-10-27', value: 7 }],
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock localStorage for auth token
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'eatsential_auth_token') return 'mock-token';
      return null;
    });

    // Mock hooks with default values
    vi.mocked(useWellnessChartData).mockReturnValue({
      data: mockChartData,
      isLoading: false,
      error: null,
    });

    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useGoals).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useCreateGoal).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WellnessTrackingPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders dashboard navbar and main sections', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Wellness Tracking/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Daily Check-in/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Your Trends/i })).toBeInTheDocument();
    expect(screen.getByText(/Wellness Goals/i)).toBeInTheDocument();
  });

  it('displays all three logging widgets', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('MoodLogWidget')).toBeInTheDocument();
      expect(screen.getByText('StressLogWidget')).toBeInTheDocument();
      expect(screen.getByText('SleepLogWidget')).toBeInTheDocument();
    });
  });

  it('displays all three trend charts', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('WellnessChart-mood')).toBeInTheDocument();
      expect(screen.getByText('WellnessChart-stress')).toBeInTheDocument();
      expect(screen.getByText('WellnessChart-sleep')).toBeInTheDocument();
    });
  });

  it('displays goals list section', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('GoalsList')).toBeInTheDocument();
    });
  });

  it('shows loading state when chart data is loading', () => {
    vi.mocked(useWellnessChartData).mockReturnValue({
      data: { mood: [], stress: [], sleep: [] },
      isLoading: true,
      error: null,
    });

    renderComponent();

    // Component should show loading state
    expect(screen.getByText(/Loading wellness data/i)).toBeInTheDocument();
  });

  it('handles chart data errors gracefully', () => {
    vi.mocked(useWellnessChartData).mockReturnValue({
      data: { mood: [], stress: [], sleep: [] },
      isLoading: false,
      error: new Error('Failed to load'),
    });

    renderComponent();

    // Component should still render
    expect(screen.getByText(/Wellness Tracking/i)).toBeInTheDocument();
  });
});
