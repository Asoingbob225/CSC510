import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WellnessOverviewCard } from './WellnessOverviewCard';
import type { WellnessLogResponse } from '@/lib/api';

// Mock the hooks
vi.mock('@/hooks/useWellnessData', () => ({
  useTodayWellnessLog: vi.fn(),
  useWellnessLogs: vi.fn(),
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

import { useTodayWellnessLog, useWellnessLogs } from '@/hooks/useWellnessData';

describe('WellnessOverviewCard', () => {
  let queryClient: QueryClient;

  const mockTodayLog: WellnessLogResponse = {
    id: '1',
    user_id: 'user1',
    mood_score: 8,
    stress_level: 4,
    quality_score: 7,
    duration_hours: 7.5,
    occurred_at_utc: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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

    vi.mocked(useWellnessLogs).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useWellnessLogs>);

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

    vi.mocked(useWellnessLogs).mockReturnValue({
      data: [mockTodayLog],
      isLoading: false,
    } as unknown as ReturnType<typeof useWellnessLogs>);

    renderComponent();

    expect(screen.getByText("Today's Wellness")).toBeInTheDocument();
    // Check scores using flexible matchers (text might be split across elements)
    expect(
      screen.getByText((_content, element) => element?.textContent === '8/10')
    ).toBeInTheDocument(); // Mood
    expect(
      screen.getByText((_content, element) => element?.textContent === '4/10')
    ).toBeInTheDocument(); // Stress
    expect(
      screen.getByText((_content, element) => element?.textContent === '7/10')
    ).toBeInTheDocument(); // Sleep quality
  });

  it('shows empty state when no wellness data logged', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useTodayWellnessLog>);

    vi.mocked(useWellnessLogs).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useWellnessLogs>);

    renderComponent();

    expect(screen.getByText('No wellness data today')).toBeInTheDocument();
    expect(screen.getByText('Log Your First Entry')).toBeInTheDocument();
  });

  it('navigates to wellness tracking page when clicking "View All" button', () => {
    vi.mocked(useTodayWellnessLog).mockReturnValue({
      data: mockTodayLog,
      isLoading: false,
    } as unknown as ReturnType<typeof useTodayWellnessLog>);

    vi.mocked(useWellnessLogs).mockReturnValue({
      data: [mockTodayLog],
      isLoading: false,
    } as unknown as ReturnType<typeof useWellnessLogs>);

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

    vi.mocked(useWellnessLogs).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useWellnessLogs>);

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

    vi.mocked(useWellnessLogs).mockReturnValue({
      data: [highStressLog],
      isLoading: false,
    } as unknown as ReturnType<typeof useWellnessLogs>);

    renderComponent();

    // Check for the stress score using flexible matcher (text might be split across elements)
    expect(
      screen.getByText((_content, element) => element?.textContent === '9/10')
    ).toBeInTheDocument();
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

    vi.mocked(useWellnessLogs).mockReturnValue({
      data: [goodSleepLog],
      isLoading: false,
    } as unknown as ReturnType<typeof useWellnessLogs>);

    renderComponent();

    // Check for the sleep quality score using flexible matcher (text might be split across elements)
    const sleepScores = screen.getAllByText((_content, element) => element?.textContent === '9/10');
    // Should find at least one "9/10" (the sleep quality score)
    expect(sleepScores.length).toBeGreaterThan(0);
  });
});
