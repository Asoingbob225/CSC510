import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MoodLogWidget from './MoodLogWidget';
import { wellnessApi } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  wellnessApi: {
    createMoodLog: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('MoodLogWidget', () => {
  let queryClient: QueryClient;

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
        <MoodLogWidget />
      </QueryClientProvider>
    );
  };

  it('renders mood log form with all elements', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /Mood Log/i })).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What's on your mind/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log Mood/i })).toBeInTheDocument();
  });

  it('displays mood emoji based on slider value', () => {
    renderComponent();

    // Default value should be 5
    expect(screen.getByText('😐')).toBeInTheDocument();
    expect(screen.getByText('Neutral')).toBeInTheDocument();
  });

  it('updates mood score when slider changes', () => {
    renderComponent();

    const slider = screen.getByRole('slider');

    // Use keyboard to change slider value (Arrow Right increases value)
    fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight' });
    fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight' });
    fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight' });
    fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight' });

    // After 4 arrow right presses from default 5, it should be 9
    expect(screen.getByText('🤩')).toBeInTheDocument();
    expect(screen.getByText('Very Happy')).toBeInTheDocument();
  });

  it('submits mood log with correct data', async () => {
    const mockCreate = vi.mocked(wellnessApi.createMoodLog);
    mockCreate.mockResolvedValueOnce({
      id: '1',
      user_id: 'user1',
      mood_score: 7,
      log_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      notes: 'Feeling good',
    });

    renderComponent();

    // Change mood score using keyboard
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight' });
    fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight' });

    // Add notes
    const notesInput = screen.getByPlaceholderText(/What's on your mind/i);
    fireEvent.change(notesInput, { target: { value: 'Feeling good' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Log Mood/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          mood_score: 7, // 5 (default) + 2 (arrow presses) = 7
          notes: 'Feeling good',
          log_date: expect.any(String),
        })
      );
    });
  });

  it('shows loading state when submitting', async () => {
    const mockCreate = vi.mocked(wellnessApi.createMoodLog);
    mockCreate.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                id: '1',
                user_id: 'user1',
                mood_score: 5,
                log_date: new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString(),
              }),
            100
          )
        )
    );

    renderComponent();

    const submitButton = screen.getByRole('button', { name: /Log Mood/i });
    fireEvent.click(submitButton);

    // Wait for the loading state to appear
    await waitFor(() => {
      expect(screen.getByText(/Logging.../i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit callback after successful submission', async () => {
    const mockCreate = vi.mocked(wellnessApi.createMoodLog);
    mockCreate.mockResolvedValueOnce({
      id: '1',
      user_id: 'user1',
      mood_score: 5,
      log_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    });

    const onSubmit = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <MoodLogWidget onSubmit={onSubmit} />
      </QueryClientProvider>
    );

    const submitButton = screen.getByRole('button', { name: /Log Mood/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
