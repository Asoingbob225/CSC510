import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LogMealWidget } from './LogMealWidget';

// Mock QuickMealDrawer since it has complex form logic
vi.mock('./QuickMealDrawer', () => ({
  QuickMealDrawer: ({ open }: { open: boolean }) => (
    <div data-testid="quick-meal-drawer">{open ? 'Drawer Open' : 'Drawer Closed'}</div>
  ),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe('LogMealWidget', () => {
  it('renders the widget correctly', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <LogMealWidget />
      </QueryClientProvider>
    );

    expect(screen.getByText('Log a Meal')).toBeInTheDocument();
    expect(
      screen.getByText(/Track your nutrition by logging what you've eaten today/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Meal/i })).toBeInTheDocument();
  });

  it('opens QuickMealDrawer when button is clicked', async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <LogMealWidget />
      </QueryClientProvider>
    );

    // Initially drawer should be closed
    expect(screen.getByTestId('quick-meal-drawer')).toHaveTextContent('Drawer Closed');

    // Click the button
    const button = screen.getByRole('button', { name: /Add Meal/i });
    await user.click(button);

    // Drawer should now be open
    expect(screen.getByTestId('quick-meal-drawer')).toHaveTextContent('Drawer Open');
  });

  it('displays helper text', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <LogMealWidget />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Takes less than a minute to log your meal/i)).toBeInTheDocument();
  });
});
